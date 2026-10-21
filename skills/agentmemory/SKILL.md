---
name: agentmemory
description: >
  Index for agentmemory internals: how it is wired into a host agent, its
  architecture and ports, configuration flags, capture hooks, MCP tool surface,
  and REST fallback. Use when installing or debugging agentmemory itself, when a
  memory tool name or parameter is unclear, or when capture is not recording.
  For normal recall and save work, use agentmemory-ops instead.
user-invocable: false
---

# agentmemory internals

The power lives in the MCP server (`opencode.json mcp.servers.agentmemory`), the
REST server (`http://127.0.0.1:3111`), and `plugins/agentmemory-capture.ts`.
This skill is the index for understanding and fixing them.

| Question | Load |
|----------|------|
| Install into a host agent, `connect` writes the wrong path | `references/agents.md` |
| How memory is stored, iii engine, ports, viewer | `references/architecture.md` |
| Env vars, ports, feature flags, API keys, auth | `references/config.md` |
| Observations missing, tune what gets captured | `references/hooks.md` |
| Which MCP tool to call, exact parameters | `references/mcp-tools.md` |
| HTTP fallback, MCP unavailable, non-MCP host | `references/rest-api.md` |
| House format for writing an agentmemory skill | `references/skill-format.md` |

Generated data tables live next to each doc as `<name>-reference.md`.

## Daily use

Recall, save, lesson, forget, and the read-write loop belong to
`agentmemory-ops`. Session history, recap, handoff, and commit tracing belong to
`agentmemory-history`.

## Notes

- Starting the REST server: `agentmemory serve`. Connection refused on 3111
  means the server is down, not a tool bug.
- Prefer the global `node` install over `npx -y @agentmemory/mcp`; cold-start
  re-download breaks offline.
- Capture is zero-LLM. `AGENTMEMORY_AUTO_COMPRESS` and
  `AGENTMEMORY_INJECT_CONTEXT` are the only token-spending opt-ins, and both
  ship off.
