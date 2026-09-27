// jev-router OpenCode plugin
//
// Active routing layer: on each NEW user message, ask Jev (System One,
// decision-only model) which agent should own the task and whether a
// subagent is warranted, then inject a one-shot "JEV ROUTING" block into
// the next assembled session context. The chat LLM keeps all generation;
// Jev only classifies.
//
// Event shape: user-message content arrives via `message.part.updated`
// events; `message.updated` carries metadata (id, role). Both orderings are
// handled — parts are buffered as orphans until the metadata registers the
// message, and a quiet-period debounce decides when the message is complete.
// Builds that inline parts on `message.updated` also work.
//
// Fail-open by design (a routing hint must never brick a session):
//   - JEV_ROUTER=off            → plugin disabled entirely (kill-switch)
//   - missing endpoint/key      → script exits 2, no injection, one warn
//   - timeout (3s local timer)  → child killed, no injection
//   - any parse/spawn error     → swallowed after first warning
// The verdict is ADVISORY: needs_subagent is a hint, never a mandate
// (subagent dispatch has been flaky on some opencode builds — see memory).
//
// v2 plugin contract: default export with id + setup. Events come from
// ctx.event.subscribe() (async-iterable, verified live opencode 2.0.8);
// injection rides ctx.session.hook("context") using the same push pattern
// as agentmemory-capture.ts. Spawn is async — the event pump never blocks
// on the Jev call. The context hook awaits the in-flight classification
// for a bounded window (same pattern agentmemory uses for /session/start)
// so a fast Jev reply lands in THIS turn, not the next one.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../skills/jev-decision/scripts/jev-decide.mjs",
);
// Single authoritative timeout: the local SIGKILL timer below. No
// -TimeoutSec is passed to the wrapper — one source of truth, and killing
// the child covers hung node startup as well as slow network.
const TIMEOUT_MS = 3_000;
// Injection budget math: debounce (300ms) + node spawn (~100ms) + Jev call
// (observed 0.2-1.0s, spikes higher) must fit inside INJECT_WAIT_MS for a
// this-turn verdict; otherwise fail-open and the verdict lands next turn.
const PART_QUIET_MS = 300; // parts stream in separately; classify after quiet period
const INJECT_WAIT_MS = 2_500; // context assembly waits at most this long for the verdict
const MIN_PROMPT_LEN = 8; // skip "yes", "go on", etc.
const STATE_MAX = 600; // dense state, truncated
const ORPHAN_MAX = 2_000; // per-message text cap: STATE_MAX is 600 anyway; stops assistant-stream flooding
const MAX_TRACKED = 500; // bound every buffer

interface Entry {
  sid: string;
  msgId: string;
  text: string;
  timer: ReturnType<typeof setTimeout> | null;
  resolve: () => void;
  done: Promise<void>;
}

function inlinePartsText(info: any): string {
  const parts = Array.isArray(info?.parts) ? info.parts : [];
  return parts
    .filter((p: any) => p?.type === "text" && !p?.synthetic && !p?.ignored)
    .map((p: any) => p?.text || "")
    .join("\n")
    .trim();
}

function noul(v: number | undefined): string {
  if (v === undefined) return "uncertain";
  if (v >= 0.7) return "YES";
  if (v <= 0.3) return "NO";
  return "uncertain";
}

function interpret(answers: any): string | null {
  const agent = answers?.agent;
  const planner = answers?.needs_planner;
  const sub = answers?.needs_subagent;
  if (!agent || typeof agent.choice !== "string") return null;

  // Deterministic thresholds, mirrored from rules/jev-routing.md:
  // choice confidence < 0.4 → default builder; uncertain noul → safer branch
  // (planner YES, subagent NO = inline). Allowlist the choice — an off-spec
  // reply must never inject an arbitrary string into session context.
  const ROUTE_AGENTS = new Set(["builder", "planner", "designer", "tester", "reviewer", "documenter"]);
  const lowConf = typeof agent.confidence === "number" && agent.confidence < 0.4;
  const offSpec = !ROUTE_AGENTS.has(agent.choice);
  const owner = lowConf || offSpec ? "builder" : agent.choice;
  const note = lowConf ? " (low confidence, defaulted)" : offSpec ? " (off-spec choice, defaulted)" : "";
  const subVerdict = noul(sub?.noul);

  const lines = [
    "JEV ROUTING (advisory, decision-only model — never a hard mandate):",
    `- owner agent: ${owner}${note}`,
    `- needs plan file first: ${noul(planner?.noul)}${noul(planner?.noul) === "uncertain" ? " → treat as YES (safer)" : ""}`,
    `- spawn subagent: ${subVerdict}${subVerdict === "uncertain" ? " → default inline (safer)" : ""}`,
    "- skill loading: shortlist 5-8 candidate skills from descriptions, then run",
    "  jev-decide.mjs -Preset skill-match -CandidatesJson '<shortlist>' (LLM proposes, Jev disposes).",
    "If this block conflicts with explicit user instructions, user wins.",
  ];
  return lines.join("\n");
}

function callJev(state: string): Promise<string | null> {
  return new Promise((resolve) => {
    let child: any;
    try {
      child = spawn("node", [SCRIPT, "-Preset", "route", "-State", state], {
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env,
      });
    } catch {
      resolve(null); // spawn itself threw — fail-open, no unhandled rejection
      return;
    }
    let out = "";
    let settled = false;
    const done = (v: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(v);
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      done(null);
    }, TIMEOUT_MS);
    child.stdout.on("data", (d: any) => (out += d));
    child.on("error", () => done(null));
    child.on("close", (code: number) => {
      if (code !== 0) return done(null);
      try {
        const parsed = JSON.parse(out);
        done(interpret(parsed));
      } catch {
        done(null);
      }
    });
  });
}

export default {
  id: "jev-router",
  setup: async (ctx: any) => {
    if (process.env.JEV_ROUTER === "off") {
      console.warn("[jev-router] JEV_ROUTER=off — routing plugin disabled");
      return;
    }
    const subscribe = ctx?.event?.subscribe;
    if (typeof subscribe !== "function") {
      console.warn("[jev-router] ctx.event.subscribe unavailable — plugin disabled");
      return;
    }

    const pending = new Map<string, Entry>(); // messageID → collecting entry
    const orphanParts = new Map<string, string>(); // parts that arrived before metadata
    const latest = new Map<string, string>(); // sessionID → newest classified messageID
    const verdicts = new Map<string, string>(); // sessionID → routing block (one-shot)
    const inflight = new Map<string, Promise<void>>(); // sessionID → newest classification
    const classified = new Set<string>(); // messageIDs already dispatched
    let warnedOnce = false;
    const warn = (msg: string) => {
      if (!warnedOnce) {
        warnedOnce = true;
        console.warn(`[jev-router] ${msg} — falling back to LLM judgment (silent from now on)`);
      }
    };
    const bound = <K, V>(m: Map<K, V>, max: number) => {
      while (m.size > max) m.delete(m.keys().next().value as K);
    };

    const classify = (entry: Entry) => {
      const { sid, msgId, text } = entry;
      classified.add(msgId);
      if (classified.size > MAX_TRACKED) classified.clear(); // bound memory
      // Skip commands, tiny acks, and tool-result-ish chatter.
      if (!text || text.length < MIN_PROMPT_LEN || text.startsWith("/")) {
        entry.resolve();
        return;
      }
      latest.set(sid, msgId);
      bound(latest, MAX_TRACKED);
      const state = `Goal: ${text.slice(0, STATE_MAX)} | Context: coding harness session, route classification for agent ownership and subagent dispatch | Note: verdict advisory, fail-open.`;
      // Async — never blocks the pump. Only the newest message's verdict may
      // land; stale completions (out-of-order races) are dropped. The entry
      // settles only after the call does, so a context hook awaiting
      // entry.done sees the verdict, not just the dispatch.
      callJev(state)
        .then(
          (block) => {
            if (block && latest.get(sid) === msgId) {
              verdicts.set(sid, block);
              bound(verdicts, 100);
            } else if (!block) warn("no routing verdict (timeout/endpoint/parse)");
          },
          () => warn("routing call rejected (spawn failure)"),
        )
        .finally(() => entry.resolve());
    };

    const schedule = (entry: Entry) => {
      if (entry.timer) clearTimeout(entry.timer);
      entry.timer = setTimeout(() => {
        pending.delete(entry.msgId);
        classify(entry);
      }, PART_QUIET_MS);
    };

    // The awaited pipeline starts at REGISTRATION, not at classification:
    // the context hook may fire during the debounce window, so the per-entry
    // settled-promise must cover debounce + call from the moment we know
    // this is a routable user message.
    const makeEntry = (sid: string, msgId: string, text = ""): Entry => {
      let res: () => void = () => {};
      const done = new Promise<void>((r) => (res = r));
      const entry: Entry = { sid, msgId, text, timer: null, resolve: res, done };
      done.then(() => {
        if (inflight.get(sid) === done) inflight.delete(sid);
      });
      return entry;
    };

    // ── event pump ──
    let stream: any = null;
    try {
      stream = subscribe();
    } catch (e: any) {
      warn(`event subscribe failed: ${e?.message}`);
      return;
    }
    if (!stream || typeof stream[Symbol.asyncIterator] !== "function") {
      warn("event stream is not async-iterable");
      return;
    }
    (async () => {
      try {
        for await (const event of stream) {
          try {
            const props = event?.properties ?? event;
            const type = event?.type;

            if (type === "message.updated") {
              const info = props.info;
              if (!info || info.role !== "user") continue;
              const mid = String(info.id ?? "");
              if (!mid || classified.has(mid)) continue;
              const sid = String(props.sessionID ?? info.sessionID ?? "");
              if (!sid) continue;
              // message.updated can repeat for the same message (metadata
              // refresh). Its parts — when present at all — are a FULL
              // SNAPSHOT: replace, never append, or the text doubles on
              // every repeat (part.updated deltas already accumulated).
              const existing = pending.get(mid);
              if (existing) {
                const inline = inlinePartsText(info);
                if (inline) existing.text = inline.slice(0, ORPHAN_MAX);
                schedule(existing);
                continue;
              }
              const entry = makeEntry(sid, mid);
              // Prefer the snapshot over buffered orphan deltas (assumes a
              // snapshot is complete — the observed v2 shape sends no parts
              // here at all); fall back to orphans when parts are absent.
              const inline = inlinePartsText(info);
              const orphan = orphanParts.get(mid);
              if (orphan) orphanParts.delete(mid);
              entry.text = (inline || orphan || "").slice(0, ORPHAN_MAX);
              pending.set(mid, entry);
              bound(pending, MAX_TRACKED);
              inflight.set(sid, entry.done); // hook can now await debounce+call
              schedule(entry);
            } else if (type === "message.part.updated") {
              const part = props.part;
              if (!part || part.type !== "text" || part.synthetic || part.ignored) continue;
              const mid = String(props.messageID ?? props.info?.id ?? "");
              if (!mid || !part.text) continue;
              const entry = pending.get(mid);
              if (entry) {
                // Delta append (part events carry one chunk each), capped:
                // STATE_MAX is 600, anything past ORPHAN_MAX is noise. Slice
                // the COMBINED text — a single part larger than the
                // remaining allowance must not push past the cap.
                if (entry.text.length < ORPHAN_MAX) {
                  entry.text = (entry.text ? `${entry.text}\n${part.text}` : String(part.text)).slice(0, ORPHAN_MAX);
                }
                schedule(entry); // more parts may follow — restart quiet period
              } else {
                // Metadata not seen yet (or an assistant message we can't
                // distinguish without role info on part events). Same cap
                // kills the assistant-stream case: growth stops at
                // ORPHAN_MAX instead of reallocating per chunk, and the
                // 100-message FIFO can no longer be flooded into evicting
                // genuine user orphans early.
                const prev = orphanParts.get(mid);
                if (prev === undefined) {
                  orphanParts.set(mid, String(part.text).slice(0, ORPHAN_MAX));
                } else if (prev.length < ORPHAN_MAX) {
                  orphanParts.set(mid, `${prev}\n${part.text}`.slice(0, ORPHAN_MAX));
                }
                bound(orphanParts, 100);
              }
            } else if (type === "session.idle") {
              // Hygiene: any still-pending user entry for this session gets
              // one final chance to classify now that input is done.
              const sid = String(props.sessionID ?? props.info?.sessionID ?? "");
              if (sid) {
                for (const entry of [...pending.values()]) {
                  if (entry.sid === sid) {
                    pending.delete(entry.msgId);
                    if (entry.timer) clearTimeout(entry.timer);
                    classify(entry);
                  }
                }
              }
            }
          } catch {
            // single-event failure must not kill the pump
          }
        }
      } catch {
        // stream ended — nothing to do
      }
    })();

    // ── context injection: one-shot push on next context assembly ──
    if (typeof ctx?.session?.hook === "function") {
      try {
        await ctx.session.hook("context", async (input: any) => {
          try {
            const sid = String(input?.sessionID ?? input?.session?.id ?? "");
            if (!sid) return;
            // The verdict may still be in flight (Jev answers in ~100-500ms;
            // context assembly can start sooner). Bounded wait, mirroring
            // agentmemory's /session/start race guard — prompt assembly is
            // delayed by at most INJECT_WAIT_MS.
            const p = inflight.get(sid);
            if (p) {
              await Promise.race([p.catch(() => {}), new Promise((r) => setTimeout(r, INJECT_WAIT_MS))]);
            }
            const block = verdicts.get(sid);
            if (!block) return;
            const arr = Array.isArray(input?.context)
              ? input.context
              : Array.isArray(input?.system)
                ? input.system
                : null;
            let pushed = false;
            if (arr) {
              if (arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null) {
                arr.push({ type: "text", text: block });
              } else {
                arr.push(block);
              }
              pushed = true;
            }
            // One-shot, but only consume after a successful push — otherwise
            // retry on the next context assembly. Identity check: a newer
            // message may have registered its own awaitable while this hook
            // was waiting; don't delete that one.
            if (pushed) {
              verdicts.delete(sid);
              if (inflight.get(sid) === p) inflight.delete(sid);
            }
          } catch (e: any) {
            warn(`context hook failed: ${e?.message}`);
          }
        });
      } catch (e: any) {
        warn(`session.hook("context") registration failed: ${e?.message}`);
      }
    } else {
      warn("ctx.session.hook unavailable — verdicts logged but not injected");
    }
  },
};
