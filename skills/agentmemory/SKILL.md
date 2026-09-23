---
name: agentmemory
description: Index for agentmemory work. Routes to the right reference skill so the agent loads one focused file instead of guessing among six. Use when starting any memory task, debugging missing observations, or unsure which agentmemory skill fits.
user-invocable: false
---

# agentmemory Index

Six reference skills exist; all are `user-invocable: false` docs. Power lives
in the MCP server (`opencode.json mcp.servers.agentmemory`), the REST server
(`http://127.0.0.1:3111`), and `plugins/agentmemory-capture.ts`. This index
only routes. Load the one row that fits; never load all six.

| Task | Load |
|------|------|
| Install agentmemory into a host agent, `connect` writes wrong path | `agentmemory-agents` |
| How memory is stored, iii engine, ports, viewer | `agentmemory-architecture` |
| Env vars, ports, feature flags, API keys, auth | `agentmemory-config` |
| Observations missing, tune what gets captured | `agentmemory-hooks` |
| Which MCP tool to call, exact parameters | `agentmemory-mcp-tools` |
| HTTP fallback, MCP unavailable, non-MCP host | `agentmemory-rest-api` |
| Recall past work (read side) | `recall` skill or `/recall` command |
| Save insight/decision (write side) | `remember` skill or `/remember` command |
| Correction or hard-won rule with confidence | `lesson` skill |
| Write or update an agentmemory skill file | `write-agentmemory-skill` |

## Notes

- Lessons inject as DATA at session start when available; still run
  `memory_smart_search` for observations.
- starting the REST server: `agentmemory serve` (connection refused on 3111
  means the server is down, not a tool bug).
- Prefer the global `node` install over `npx -y @agentmemory/mcp` (cold-start
  re-download breaks offline). See `commands/configcheck.md` section 3.
