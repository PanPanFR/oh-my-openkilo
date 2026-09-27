// jev-router OpenCode plugin
//
// Active routing layer: on each NEW user message, ask Jev (System One,
// decision-only model) which agent should own the task and whether a
// subagent is warranted, then inject a one-shot "JEV ROUTING" block into
// the next assembled session context. The chat LLM keeps all generation;
// Jev only classifies.
//
// Fail-open by design (a routing hint must never brick a session):
//   - JEV_ROUTER=off            → plugin disabled entirely (kill-switch)
//   - missing endpoint/key      → script exits 2, no injection, one warn
//   - timeout (default 3s)      → spawn killed, no injection
//   - any parse/spawn error     → swallowed after first warning
// The verdict is ADVISORY: needs_subagent is a hint, never a mandate
// (subagent dispatch has been flaky on some opencode builds — see memory).
//
// v2 plugin contract: default export with id + setup. Events come from
// ctx.event.subscribe() (async-iterable, verified live opencode 2.0.8);
// injection rides ctx.session.hook("context") using the same push pattern
// as agentmemory-capture.ts. Spawn is async — the event pump never blocks
// on the Jev call.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../skills/jev-decision/scripts/jev-decide.mjs",
);
const TIMEOUT_MS = 3_000;
const MIN_PROMPT_LEN = 8; // skip "yes", "go on", etc.
const STATE_MAX = 600; // dense state, truncated

function userTextFromInfo(info: any): string {
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
      child = spawn("node", [SCRIPT, "-Preset", "route", "-TimeoutSec", "3", "-State", state], {
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
    child.stdout.on("data", (d) => (out += d));
    child.on("error", () => done(null));
    child.on("close", (code) => {
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

    const verdicts = new Map<string, string>(); // sessionID → routing block (one-shot)
    const routed = new Set<string>(); // messageIDs already classified
    let warnedOnce = false;
    const warn = (msg: string) => {
      if (!warnedOnce) {
        warnedOnce = true;
        console.warn(`[jev-router] ${msg} — falling back to LLM judgment (silent from now on)`);
      }
    };

    // ── event pump: watch for new user messages ──
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
            if (event?.type !== "message.updated") continue;
            const info = event?.properties?.info ?? event?.info;
            if (!info || info.role !== "user") continue;
            const mid = String(info.id ?? "");
            if (!mid || routed.has(mid)) continue;
            const text = userTextFromInfo(info);
            // Skip commands, tiny acks, and tool-result-ish chatter.
            if (!text || text.length < MIN_PROMPT_LEN || text.startsWith("/")) continue;
            routed.add(mid);
            if (routed.size > 500) routed.clear(); // bound memory

            const sid = String(event?.properties?.sessionID ?? event?.sessionID ?? info.sessionID ?? "");
            if (!sid) continue;

            const state = `Goal: ${text.slice(0, STATE_MAX)} | Context: coding harness session, route classification for agent ownership and subagent dispatch | Note: verdict advisory, fail-open.`;
            // Async — never block the pump. Latest verdict wins per session.
            callJev(state).then(
              (block) => {
                if (block) {
                  verdicts.set(sid, block);
                  // FIFO bound: evict oldest beyond 100 sessions.
                  if (verdicts.size > 100) verdicts.delete(verdicts.keys().next().value as string);
                } else warn("no routing verdict (timeout/endpoint/parse)");
              },
              () => warn("routing call rejected (spawn failure)"),
            );
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
            // retry on the next context assembly.
            if (pushed) verdicts.delete(sid);
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
