// subagent-guard OpenCode plugin
// Circuit breaker for subagent failures: notifies the parent agent with an
// actionable message and blocks blind retries of the same failing subagent.
//
// How it works:
// - execute.after watches subagent/task tool results. On failure it counts
//   per (session, agent) and rewrites the error text so the parent model sees
//   WHAT failed, HOW MANY times, and WHAT to do instead (work inline, use a
//   different subagent, or ask the user).
// - execute.before blocks further identical retries once the threshold is
//   reached, by throwing an instructive error (surfaced as the tool result).
//   After a few blocks the breaker half-opens to allow one probe, so a fixed
//   root cause unblocks itself. Any success resets the counters.
// - session retry hook vetoes further provider retries past the threshold
//   when the runtime supports it (best effort, fail-open).
//
// Fail-open by design: every handler is wrapped in try/catch so the plugin
// can never brick a session. Counters live in memory with bounded size.
//
// v2 plugin contract (opencode >= 2.0): default export with id + setup.
// Same ctx.tool.hook shape as the local recall-first/rtk/graphify plugins.

// Tool names that spawn a subagent. "subagent" matches the permission action
// in opencode.json; "task" covers the Task-style tool some agents mention.
const SUBAGENT_TOOLS = new Set(["subagent", "task"]);

function isSubagentTool(tool: string): boolean {
  const t = String(tool ?? "").toLowerCase();
  return (
    SUBAGENT_TOOLS.has(t) ||
    t.endsWith("_subagent") ||
    t.endsWith(":subagent") ||
    t.startsWith("task")
  );
}

// Pull the subagent name out of the tool input. Checked keys cover the
// common shapes ({agent}, {subagent}, {name}); description is a fallback.
function agentNameFromInput(input: unknown): string {
  if (input && typeof input === "object") {
    const args = input as Record<string, unknown>;
    for (const k of ["agent", "subagent", "name", "agent_id", "agentId"]) {
      const v = args[k];
      if (typeof v === "string" && v.trim()) return v.trim().toLowerCase();
    }
    const d = args["description"];
    if (typeof d === "string" && d.trim()) return d.trim().slice(0, 60).toLowerCase();
  }
  return "unknown";
}

// Return the failure message when the payload signals failure, else null.
// Covers both the documented v2 shape ({status, error.message}) and the
// local payload shape ({input/args, error}).
function failureMessage(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (payload.status === "error") {
    const m = payload?.error?.message;
    return typeof m === "string" && m ? m : "subagent tool reported status=error";
  }
  const e = payload.error;
  if (typeof e === "string" && e) return e;
  if (e && typeof e.message === "string" && e.message) return e.message;
  const out = payload.output;
  if (typeof out === "string" && /fail|error|exception/i.test(out)) return out;
  if (out && typeof out.error === "string" && out.error) return out.error;
  return null;
}

function buildFailureNotice(agent: string, count: number, max: number): string {
  const last = count >= max ? " Do NOT call the same subagent again with the same prompt." : "";
  return (
    `[SUBAGENT-GUARD] subagent "${agent}" failed ${count}x in this session.` +
    last +
    ` Pick one: (1) do the work inline in this session, (2) call a different subagent,` +
    ` (3) ask the user. Identical retries past ${max}x are blocked.`
  );
}

function buildBlockNotice(agent: string, count: number): string {
  return (
    `[SUBAGENT-GUARD] BLOCKED: subagent "${agent}" already failed ${count}x this session.` +
    ` Work inline, use a different subagent, or ask the user. Identical retries stay blocked.`
  );
}

export default {
  id: "subagent-guard",
  setup: async (ctx: any) => {
    const rawMax = Number(ctx?.options?.maxFailures ?? 2);
    const MAX_FAILURES = Number.isFinite(rawMax) ? Math.min(5, Math.max(1, Math.floor(rawMax))) : 2;
    const MAX_BLOCKS_BEFORE_PROBE = 3;
    const MAX_KEYS = 200;

    // key: "<sessionID>::<agent>" -> consecutive failure count
    const failures = new Map<string, number>();
    // key -> consecutive blocked attempts (half-open probe after threshold)
    const blocks = new Map<string, number>();

    function track(map: Map<string, number>, key: string, value: number): void {
      if (!map.has(key) && map.size >= MAX_KEYS) {
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
      }
      map.set(key, value);
    }

    function sessionOf(payload: any): string {
      const s = payload?.sessionID ?? payload?.session?.id;
      return typeof s === "string" && s ? s : "global";
    }

    function keyOf(payload: any): { key: string; agent: string } {
      const agent = agentNameFromInput(payload?.input ?? payload?.args);
      return { key: `${sessionOf(payload)}::${agent}`, agent };
    }

    const toolHook = ctx?.tool?.hook;
    if (typeof toolHook !== "function") {
      console.warn("[subagent-guard] ctx.tool.hook unavailable - plugin disabled");
      return;
    }

    // After: observe results, count failures, enrich the error text so the
    // parent agent learns what failed and what to do instead.
    await toolHook("execute.after", async (payload: any) => {
      try {
        const t = String(payload?.tool ?? "");
        if (!isSubagentTool(t)) return;
        const { key, agent } = keyOf(payload);
        const failed = failureMessage(payload);
        if (failed === null) {
          failures.delete(key);
          blocks.delete(key);
          return;
        }
        const count = (failures.get(key) ?? 0) + 1;
        track(failures, key, count);
        const notice = buildFailureNotice(agent, count, MAX_FAILURES);
        const full = `${failed}\n\n${notice}`;
        try {
          if (payload.error && typeof payload.error === "object" && "message" in payload.error) {
            payload.error.message = full;
          } else {
            payload.error = { message: full };
          }
        } catch {
          // Runtime owns the payload shape; counting + before-hook still hold.
        }
      } catch {
        // Fail-open: never break tool execution.
      }
    });

    // Before: block identical retries past the threshold. The thrown error
    // surfaces to the model as the tool result (same pattern as recall-first).
    await toolHook("execute.before", async (payload: any) => {
      try {
        const t = String(payload?.tool ?? "");
        if (!isSubagentTool(t)) return;
        const { key, agent } = keyOf(payload);
        const count = failures.get(key) ?? 0;
        if (count < MAX_FAILURES) return;
        const seen = (blocks.get(key) ?? 0) + 1;
        if (seen > MAX_BLOCKS_BEFORE_PROBE) {
          // Half-open: allow one probe through; a fresh failure re-arms.
          failures.delete(key);
          blocks.delete(key);
          return;
        }
        track(blocks, key, seen);
        throw new Error(buildBlockNotice(agent, count));
      } catch (e) {
        // Re-throw only our own block notice; swallow anything else.
        if (e instanceof Error && e.message.startsWith("[SUBAGENT-GUARD] BLOCKED")) throw e;
      }
    });

    // Retry veto for provider-level loops (model errors inside any session).
    // Best effort: runtimes without this hook name throw at registration.
    try {
      const sessionHook = ctx?.session?.hook;
      if (typeof sessionHook === "function") {
        await sessionHook("retry", async (event: any) => {
          try {
            const attempt = Number(event?.attempt ?? 0);
            if (Number.isFinite(attempt) && attempt > MAX_FAILURES) {
              event.decision = { retry: false };
            }
          } catch {
            // Fail-open.
          }
        });
      }
    } catch {
      console.warn('[subagent-guard] session retry hook unavailable - provider-level veto skipped');
    }
  },
};
