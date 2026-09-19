// recall-first OpenCode plugin
// Soft gate: blocks the first Edit/Write of a session until a memory recall
// ran (memory_smart_search or memory_recall). Rationale: prose rules in
// AGENTS.md say "recall first" but nothing enforced it, and in practice the
// first tool call of a session was often an edit. The thrown error surfaces
// to the model as the tool result, the model calls memory_smart_search, then
// retries the edit.
//
// Fail-open by design: fires once per session, never again. If the memory
// server is unavailable the model is told to proceed and mention it, so a
// down server can never brick the session. Mirrors the .env-protection
// throw pattern from https://opencode.ai/docs/plugins.
// opencode prefixes MCP tool names with the server name, e.g.
// "agentmemory_memory_smart_search". Match on suffix so both bare and
// prefixed names register a recall.
//
// Dual contract: default export carries both runtimes.
// v1 (>= 1.18.29) calls server(), v2 calls setup().
const RECALL_SUFFIXES = ["memory_smart_search", "memory_recall"];
const WRITE_TOOLS = new Set(["edit", "write", "patch", "apply_patch", "multiedit"]);

function isRecallTool(tool: string): boolean {
  return RECALL_SUFFIXES.some((s) => tool === s || tool.endsWith("_" + s));
}
const REMINDER =
  "RECALL-FIRST GATE: no memory recall has run in this session yet. " +
  "Before editing files, call memory_smart_search with the task topic (one call). " +
  "If the memory server is unavailable or the task is trivial, proceed without recall " +
  "and mention that in one line.";

// Shared gate core: one instance per runtime entrypoint call.
function createGate() {
  // Sets keyed by sessionID; empty string bucket when the hook input
  // carries no sessionID (degrades to one warning per process, still fine).
  const recalled = new Set<string>();
  const warned = new Set<string>();
  return async (rawTool: unknown, rawSession: unknown) => {
    const tool = String(rawTool ?? "");
    const session = String(rawSession ?? "");
    if (isRecallTool(tool)) {
      recalled.add(session);
      return;
    }
    if (WRITE_TOOLS.has(tool as string) && !recalled.has(session) && !warned.has(session)) {
      warned.add(session);
      throw new Error(REMINDER);
    }
  };
}

async function recallServer(_input: any) {
  const check = createGate();
  return {
    "tool.execute.before": async (input: { tool?: string; sessionID?: string }) => {
      await check(input?.tool, input?.sessionID);
    },
  };
}

async function recallSetup(ctx: any) {
  const hook = ctx?.tool?.hook;
  if (typeof hook !== "function") {
    console.warn("[recall-first] ctx.tool.hook unavailable, plugin disabled");
    return;
  }
  const check = createGate();
  await hook("execute.before", async (payload: any) => {
    await check(String(payload?.tool ?? "").toLowerCase(), payload?.sessionID);
  });
}

export default {
  id: "recall-first",
  server: recallServer,
  setup: recallSetup,
};
