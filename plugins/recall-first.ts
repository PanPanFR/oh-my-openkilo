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

// v2 plugin contract (opencode >= 2.0): default export with id + setup.
// The recall gate registers through ctx.tool.hook("execute.before") — the
// same before-execution position v1 used — and stays fail-open: the thrown
// REMINDER surfaces as the tool result once per session, never again.
export default {
  id: "recall-first",
  setup: async (ctx: any) => {
    const hook = ctx?.tool?.hook;
    if (typeof hook !== "function") {
      console.warn("[recall-first] ctx.tool.hook unavailable — plugin disabled");
      return;
    }
    const recalled = new Set<string>();
    const warned = new Set<string>();
    await hook("execute.before", async (payload: any) => {
      const tool = String(payload?.tool ?? "").toLowerCase();
      const session = String(payload?.sessionID ?? "");
      if (isRecallTool(tool)) {
        recalled.add(session);
        return;
      }
      if (WRITE_TOOLS.has(tool) && !recalled.has(session) && !warned.has(session)) {
        warned.add(session);
        throw new Error(REMINDER);
      }
    });
  },
};
