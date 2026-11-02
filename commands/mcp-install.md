---
description: Scan project stack and inject relevant MCP servers from archive catalog into ./opencode.json (alias of /install-mcp)
---

Scan the active project stack and inject relevant MCP server configurations from `~/.config/opencode/archive/mcp-catalog.json` into `./opencode.json`.

## Usage
- `/mcp-install` (auto-detect active project stack)
- `/mcp-install <category or mcp name>` (e.g. `rea`, `shadcn`, `web`, `security`)

## Workflow

1. **Scan Stack**: Run the detection engine:
   ```bash
   node ~/.config/opencode/archive/scripts/inject.mjs --detect --query "$ARGUMENTS"
   ```
   (If `$ARGUMENTS` is empty or not provided, omit `--query`).

2. **Present Candidates**: Display a clear summary:
   - Candidate MCP servers from the catalog that match the project stack (e.g. `rea` for reverse engineering/native binaries; `shadcn`, `reactbits`, `chrome-devtools` for web; `figcraft` for design).
   - Brief description, server type, and any prerequisites (e.g. local binaries or Node.js packages).
   - Any currently installed MCP servers in `./opencode.json`.

3. **Confirm with User**: Use the `question` tool to ask the user which MCP servers to add to `./opencode.json`:
   - Present the candidates as selectable options.
   - Wait for explicit user confirmation before modifying `./opencode.json`.

4. **Inject**: Once confirmed, run the injection script with the approved MCP servers:
   ```bash
   node ~/.config/opencode/archive/scripts/inject.mjs mcp --apply --mcps "<mcp1,mcp2,...>"
   ```

5. **Verify**: Check that `./opencode.json` contains the requested `mcp.servers` entries and inform the user.
