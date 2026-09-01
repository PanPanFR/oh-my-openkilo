# Installation

There is no installer. The pack is a Git repo and the in-session `/update-pack` command is self-contained (it hardcodes the canonical URL, runs `git` directly, and syncs the files itself). One source of truth, no scripts that can go stale.

## Quick start (Windows, PowerShell)

```powershell
git clone https://github.com/PanPanFR/oh-my-openkilo.git "$env:USERPROFILE\.config\opencode\oh-my-openkilo"
Copy-Item -Recurse -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\agents"   "$env:USERPROFILE\.config\opencode\agents"
Copy-Item -Recurse -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\skills"   "$env:USERPROFILE\.config\opencode\skills"
Copy-Item -Recurse -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\rules"    "$env:USERPROFILE\.config\opencode\rules"
Copy-Item -Recurse -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\commands" "$env:USERPROFILE\.config\opencode\commands"
Copy-Item -Recurse -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\plugins"  "$env:USERPROFILE\.config\opencode\plugins"
Copy-Item -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\AGENTS.md"        "$env:USERPROFILE\.config\opencode\AGENTS.md"
if (-not (Test-Path "$env:USERPROFILE\.config\opencode\opencode.json")) {
    Copy-Item -Force "$env:USERPROFILE\.config\opencode\oh-my-openkilo\examples\opencode.example.json" "$env:USERPROFILE\.config\opencode\opencode.json"
}
```

## Quick start (macOS / Linux)

```bash
git clone https://github.com/PanPanFR/oh-my-openkilo.git ~/.config/opencode/oh-my-openkilo
for d in agents skills rules commands plugins; do
    cp -r ~/.config/opencode/oh-my-openkilo/$d ~/.config/opencode/$d
done
cp ~/.config/opencode/oh-my-openkilo/AGENTS.md ~/.config/opencode/AGENTS.md
[ -f ~/.config/opencode/opencode.json ] || cp ~/.config/opencode/oh-my-openkilo/examples/opencode.example.json ~/.config/opencode/opencode.json
```

> [!IMPORTANT]
> The commands above overwrite any existing `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, and `AGENTS.md` under your config dir. Your `opencode.json`, model, provider, API keys, and MCP server entries are NOT touched. If you have local edits you want to keep, back them up first.

> Want the bleeding edge instead of `main`? Replace `main` in the URL with a tag (e.g. `v0.5.2`) or pick the [latest release](https://github.com/PanPanFR/oh-my-openkilo/releases/latest).

## After install: required dependencies

> [!IMPORTANT]
> **Install these BEFORE the first session.** Without them the pack loads fine but the `/graphify` workflow and every memory skill (`recall`, `remember`, `recap`, `memory-discipline`) are unavailable. The pack degrades to a much weaker version of itself.

The pack needs two external tools. Install in this order:

```bash
# 1. Knowledge graph (Python — `graphifyy` is the PyPI package, double y)
uv tool install graphifyy
#   or: pipx install graphifyy
#   or: pip install graphifyy
#   or, if you already use the Node CLI from Kilo Code: npm i -g graphify

# 2. Persistent cross-session memory
npm i -g @agentmemory/server          # the REST server (separate process)
npm i -g @agentmemory/mcp             # the MCP server OpenCode launches

# 3. Start the memory REST server (one-time per session, or set up as a service)
agentmemory serve
```

### Pin the agentmemory MCP locally (strongly recommended)

The example `opencode.json` ships with the agentmemory MCP launched via `npx -y @agentmemory/mcp`. That works on first run, but **pin it to a local install** so OpenCode does not redownload it on every cold start and does not silently break when npm is unreachable.

After `npm i -g @agentmemory/mcp`, replace the `mcp.agentmemory.command` in your `opencode.json` with:

- **Windows**: `["node", "C:\\Users\\<You>\\AppData\\Roaming\\npm\\node_modules\\@agentmemory\\mcp\\bin.mjs"]`
- **macOS**: `["node", "/usr/local/lib/node_modules/@agentmemory/mcp/bin.mjs"]`
- **Linux**: `["node", "/usr/lib/node_modules/@agentmemory/mcp/bin.mjs"]`

`/configcheck` flags the `npx` form automatically and tells you to switch.

**What you lose without each:**

- **No `graphify`** → codebase navigation falls back to manual `grep` and `read`. Slower on large repos, but the rest of the pack still works.
- **No `agentmemory`** → no cross-session memory. Every session starts from zero. The `memory-discipline`/`recall` skills and the `recall`/`remember`/`recap` commands all depend on it.

### MCPs (enable per-need, not all auto-on)

The example config ships two MCPs enabled: `agentmemory` (required for the memory skills) and `chrome-devtools` (for the `chrome-devtools` skill). Anything else you want — `playwright` for the `playwright-cli` skill, `context7` for live library docs, your own — you add yourself by following the same shape: drop the entry into `mcp` in `opencode.json`, set `enabled: true`, and provide any env vars the server needs.

| MCP                    | Capability                                          | Required env / key                      | Risk if disabled |
|------------------------|-----------------------------------------------------|-----------------------------------------|------------------|
| `agentmemory`          | Persistent cross-session memory (**required**)      | `AGENTMEMORY_SERVER_URL` (default `http://127.0.0.1:3111`) | No memory. Every session starts from zero. |
| `chrome-devtools`      | Live browser debug (DOM, network, console, perf)    | none (uses installed Chrome)            | No live browser inspection; static fetch only |

To enable any others, edit `opencode.json` to set `enabled: true` and fill in the required env vars. `/configcheck` validates your config and warns if any enabled MCP has a missing env var.

## Verify the install

Start OpenCode in any directory. Type `/configcheck`. It will tell you what is wired up and what is missing.

## Uninstall

Surgical removal (deletes only pack files, leaves your custom `opencode.json` and any other files alone):

```powershell
Remove-Item "$env:USERPROFILE\.config\opencode\agents"     -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\skills"     -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\rules"      -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\commands"   -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\plugins"    -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\AGENTS.md"  -Force
```

```bash
# macOS / Linux
rm -rf ~/.config/opencode/{agents,skills,rules,commands,plugins}
rm -f ~/.config/opencode/AGENTS.md
```

The pack repo clone at `~/.config/opencode/oh-my-openkilo/` is also safe to delete; it is the source `/update-pack` pulls from, but `/update-pack` re-clones if the folder is missing.

## Update the pack

In an OpenCode session, type:

```
/update-pack
```

The command is self-contained. It clones or pulls from the canonical URL on its own, then syncs each file with per-file diff and backup of any local changes you made. Nothing on your disk can go stale. See [COMMANDS.md](COMMANDS.md) for the full mechanics.

## Troubleshooting

### Skills not loading

Make sure the skills folder is at the path OpenCode scans. Default is the same dir as `opencode.json` (i.e. `~/.config/opencode/skills/`). If you've moved it, register it in `opencode.json`:

```json
{
  "skills": {
    "paths": ["~/.config/opencode/skills"]
  }
}
```

Restart OpenCode after changing this.

### Plugins not loading

Plugin errors usually show in OpenCode startup logs. Common causes:

- Missing `node_modules` in `plugins/caveman/`. Run `cd ~/.config/opencode/plugins/caveman && npm install`
- Plugin path in `opencode.json` is wrong. Should be `./plugins/caveman/plugin.js` and `./plugins/agentmemory-capture.ts` (relative to the dir containing `opencode.json`)

### "credential not set" errors

You forgot to fill in `opencode.json` after install. See [CONFIGURATION.md](CONFIGURATION.md) for the env-var pattern.
