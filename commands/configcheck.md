---
description: Diagnose opencode config: validate opencode.json, test every MCP server actually runs, fix broken parts, ask user for missing credentials (API keys, tokens).
---

Run a full config health check and act as the user's config assistant. Optional scope argument (e.g. `mcp`, `agentmemory`, `plugins`): $ARGUMENTS

## 1. Config file validation

- Locate configs: global `~/.config/opencode/opencode.json` (or `.jsonc`), plus project-level `./opencode.json` / `.opencode/opencode.json` if present.
- Parse each file. If JSON is invalid, report the exact error with line number, then fix it.
- Verify every referenced path exists and is loadable: `instructions` files, local `plugin` paths, `skills.paths`. For npm/git plugin specs, just report them (installed at startup).
- Verify `model` and `small_model` reference a defined provider, and each model id exists in that provider's `models` map.
- Validate `mcp` entries: `type` present ("local" or "remote"), `command` is an array of strings (never a single string), remote entries have `url`.
- Validate `permission` values are valid actions ("allow", "ask", "deny").
- Flag unknown top-level keys (opencode rejects them with ConfigInvalidError and refuses to start).

## 2. MCP server checks

Skip `enabled: false` servers (list them as intentionally disabled). For each enabled server:

- **local**: verify the runtime is available (`node --version` for npx commands, `python --version` for python commands) and any referenced script path exists. Then spawn it and send an MCP `initialize` JSON-RPC request; confirm a valid response. Report failures with stderr.
- **remote**: send an HTTP JSON-RPC `initialize` request to the URL; confirm a valid response. Distinguish: 401/403 (auth problem), timeout (server down or blocked), connection refused, DNS failure.
- **credentials**: if a server needs a key/token and it is missing, empty, a `{env:VAR}` placeholder with the var unset, or rejected with 401/403: STOP and ask the user to paste the credential. Insert it (prefer `{env:VAR}` interpolation only if the user sets the var themselves; otherwise inline it), then re-test until OK.
- Servers with placeholder-looking values (e.g. `your-key-here`) count as missing credentials.

## 3. Known-tricky components (deeper checks)

These have multi-part installs. Check every part, not just the MCP entry.

- **agentmemory** (3 parts):
  1. MCP server `agentmemory` connects to a separate REST server at `AGENTMEMORY_SERVER_URL` (default `http://127.0.0.1:3111`). Test that REST server first with `Invoke-WebRequest` / `curl`: a 2xx response means the server is up. A 404 on `/health` is a soft-fail (the server may use a different health path) but the server IS listening, so report it as reachable. A connection refused / timeout means the server is down, every MCP tool will fail, and the user should start it with `agentmemory serve`.
  2. **Check the MCP launch command.** If `mcp.agentmemory.command` is `["npx", "-y", "@agentmemory/mcp"]` (or any other npx form), WARN the user: npx re-downloads on every cold start, masks the version, and breaks silently when npm registry is unreachable. RECOMMEND: `npm i -g @agentmemory/mcp`, then point `command` at the local entry point.
     - Windows: `["node", "C:\\Users\\<You>\\AppData\\Roaming\\npm\\node_modules\\@agentmemory\\mcp\\bin.mjs"]`
     - macOS: `["node", "/usr/local/lib/node_modules/@agentmemory/mcp/bin.mjs"]`
     - Linux: `["node", "/usr/lib/node_modules/@agentmemory/mcp/bin.mjs"]`
  3. Plugin `./plugins/agentmemory-capture.ts` (from `plugin` array): file must exist relative to the config dir.
  4. Live check: call MCP tool `agentmemory_memory_diagnose` if available; report any subsystem errors it finds and offer to run `agentmemory_memory_heal`.
  - Reference: local skills `agentmemory-config` (ports: REST 3111, streams 3112, viewer 3113, engine 49134) and `agentmemory-architecture`. Package: https://www.npmjs.com/package/@agentmemory/mcp

- **graphify** (not an MCP here, a Python CLI):
  1. Check `graphify --version` runs. If missing, detect how to install: try `uv tool` first (package name is `graphifyy`, note the double y), then pipx, then pip. Install detection logic is documented in `skills/graphify/SKILL.md` Step 1.
  2. Verify `graphify-out/graph.json` is valid JSON where the skill is used (project-dependent, report only).
  - Reference: https://pypi.org/project/graphifyy/ (package name is `graphifyy`, double y)

- **Docs rule (applies to every component)**: before stating how something installs or why it fails, consult the official source: the npm/PyPI page for the package, the vendor docs (webfetch), or the local skill files in `~/.config/opencode/skills/`. Never guess install steps or error meanings. If a doc URL 404s or docs conflict, say so in the report instead of picking one silently.

## 4. Fix what is broken

Fix within the existing config only:
- malformed JSON, wrong field types, unknown top-level keys
- missing `type`, `command` as string instead of array
- missing/invalid credentials: prompt the user, insert, re-test
- stale `{env:VAR}` references: ask user for value, offer inline literal

Do NOT invent new MCP servers. Do NOT flip `enabled` unless the user asks. Do NOT touch unrelated fields.

## 5. Official docs per MCP server

Consult before diagnosing. All links verified live 2026-08-30; if one 404s, say so in the report.

| Component | Docs | Repo |
|---|---|---|
| MCP `agentmemory` | https://www.npmjs.com/package/@agentmemory/mcp | https://github.com/rohitg00/agentmemory |
| MCP `chrome-devtools` | https://www.npmjs.com/package/chrome-devtools-mcp | https://github.com/ChromeDevTools/chrome-devtools-mcp |
| graphify (Python CLI, not MCP) | https://pypi.org/project/graphifyy/ | https://github.com/Graphify-Labs/graphify |
| opencode config schema | https://opencode.ai/config.json | https://github.com/sst/opencode |

When installing or fixing, fetch the doc page fresh (webfetch) instead of trusting memory: package versions and flags change.

## 6. Report

Print a table:

| Component | Status | Detail |

Status values: `OK`, `FIXED`, `NEEDS INPUT`, `BROKEN`, `SKIPPED (disabled)`.

If anything was FIXED or NEEDS INPUT was resolved by editing config, end with: quit and restart opencode for changes to take effect (config is loaded once at startup).

Scope argument: if a scope was passed, only run the matching section but still print the full status table.
