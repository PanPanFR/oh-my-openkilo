# Installation

## Quick start (Windows, recommended)

```powershell
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.ps1 | iex
```

This downloads `install.ps1`, runs it in-memory. It will:

1. Verify `~/.config/opencode` exists (create if missing).
2. Back up your existing config to `~/.config/opencode.backup-<timestamp>`.
3. Copy `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md` from the pack into your config.
4. If you don't have `opencode.json` yet, copy `examples/opencode.example.json` there for you to edit.
5. Print next steps.

After it finishes, edit `~/.config/opencode/opencode.json` to set your model and provider keys, then restart OpenCode or run `/reload`.

## Quick start (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.sh | bash
```

> ⚠️ **Heads up:** the maintainer develops and tests on Windows only. `install.sh` is structurally similar to `install.ps1` but has **not been tested on macOS or Linux**. If it fails, the safest fallback is **manual copy-paste** — see [macOS / Linux support](../README.md#-macos--linux-support) in the README. Please [open an issue](https://github.com/PanPanFR/oh-my-openkilo/issues) if you hit a Unix-specific bug so it can be fixed.

## Manual install (full control)

```powershell
# 1. Clone the pack to a subfolder of your config
git clone https://github.com/PanPanFR/oh-my-openkilo.git "$env:USERPROFILE\.config\opencode\oh-my-openkilo"

# 2. Preview what install would do
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\install.ps1" -WhatIf

# 3. Apply
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\install.ps1"
```

```bash
# macOS / Linux
git clone https://github.com/PanPanFR/oh-my-openkilo.git ~/.config/opencode/oh-my-openkilo
~/.config/opencode/oh-my-openkilo/install.sh --dry-run
~/.config/opencode/oh-my-openkilo/install.sh
```

## Install flags

| Flag (PowerShell)         | Flag (Bash)        | Effect |
|---------------------------|--------------------|--------|
| `-WhatIf`                 | `--dry-run`        | Print actions, change nothing |
| `-SkipBackup`             | `--no-backup`      | Skip the timestamped backup |
| `-SkipPlugins`            | `--no-plugins`     | Skip `plugins/` copy |
| `-ConfigDir <path>`       | `--config-dir=<path>` | Override target config dir |

## After install: pick your tier

oh-my-openkilo ships with two layers. **Core is always installed** by `install.ps1`. Plus is opt-in for the highest-leverage features.

### Core (always installed)

- 11 agents, 46 skills, 7 rules, 9 commands
- Plugins: `agentmemory-capture`, `caveman`, `ponytail`, `superpowers`
- `AGENTS.md` global rules
- `examples/opencode.example.json` (seeded if you had no `opencode.json`)
- All MCP entries in the example config (most `enabled: false` by default — only `agentmemory` is on, because Plus needs it)

This is the baseline. Without anything else, OpenCode already uses caveman-style terse replies, ponytail-style minimal code, and the entire skill library.

### Plus (recommended for "smart" performance)

Two external tools unlock the highest-leverage features:

```bash
# Knowledge graph -- the `graphify` rule and skill depend on this
npm i -g graphify

# Persistent cross-session memory -- the `agentmemory` rule depends on this
npm i -g @agentmemory/server
```

Then make sure your `opencode.json` has the `agentmemory` MCP block (the example already has it). Start the agentmemory server once with `agentmemory serve` (or whatever the package's start command is — see its README).

**Risk if you skip Plus:**

- **No `graphify`** → codebase navigation falls back to manual `grep` and `read`. Slower on large repos. The `graphify` rule will load but its tools will be missing.
- **No `agentmemory`** → no cross-session memory. Every session starts from zero. The `agentmemory` rule will degrade to nothing useful.

### MCPs (enable per-need, not auto-on)

The example config lists all MCPs that ship with this pack, **disabled by default except `agentmemory`**. Enable one when you need it.

| MCP                    | Capability                                          | Required env / key                      | Risk if disabled |
|------------------------|-----------------------------------------------------|-----------------------------------------|------------------|
| `agentmemory`          | Persistent cross-session memory (Plus dependency)   | Plus server + `AGENTMEMORY_SERVER_URL`  | No memory — every session starts from zero |
| `context7`             | Up-to-date library docs (replaces training data)    | `CONTEXT7_API_KEY` (free at context7.com) | Documentation lookup falls back to model knowledge (often outdated) |
| `stitch`               | AI-generated UI mockups, used by `designer` agent   | `GOOGLE_API_KEY`                        | **`designer` agent becomes inert** — `builder` and `planner` delegate UI work to `designer` |
| `chrome-devtools`      | Live browser debug (DOM, network, console, perf)    | none (uses installed Chrome)            | No live browser inspection; static fetch only |
| `playwright`           | Stateful persistent browser loop, E2E test gen      | `npx playwright install chromium` first | E2E test generation disabled; `playwright-cli` skill degrades |
| `remotion`             | Walkthrough video generation                        | none                                    | No video walkthrough capability |
| `supabase-mcp-server`  | Supabase project ops (read schema, run migrations)  | `SUPABASE_ACCESS_TOKEN`                 | No Supabase integration; manual dashboard work |

To enable any of these, edit `opencode.json` to set `enabled: true` and fill in the required env vars. The `install.ps1` validator scans your config and warns if any enabled MCP has a missing env var.

## Verify the install

Start OpenCode in any directory and ask:

```
list your agents and confirm which skills are loaded
```

You should see 11 agents, 46 skills, and 7 rules. If something is missing, the most common cause is the `skills.paths` not pointing to your skills folder — but oh-my-openkilo's structure matches the default discovery path, so this should be automatic. If you have a custom `opencode.json` with non-default paths, see [CONFIGURATION.md](CONFIGURATION.md).

## Uninstall

Restore the backup folder created at install time:

```powershell
# Find your backup
Get-ChildItem "$env:USERPROFILE\.config\opencode.backup-*"

# Restore
Remove-Item "$env:USERPROFILE\.config\opencode" -Recurse -Force
Move-Item "$env:USERPROFILE\.config\opencode.backup-<timestamp>" "$env:USERPROFILE\.config\opencode"
```

Or, surgical removal (deletes only pack files, leaves your custom `opencode.json` and any other files alone):

```powershell
Remove-Item "$env:USERPROFILE\.config\opencode\agents"     -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\skills"     -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\rules"      -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\commands"   -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\plugins"    -Recurse -Force
Remove-Item "$env:USERPROFILE\.config\opencode\AGENTS.md"  -Force
```

## Update the pack

In an OpenCode session, type:

```
/update-pack
```

This pulls the latest commit from GitHub, then syncs each file with per-file diff and backup of any local changes you made. See [COMMANDS.md](COMMANDS.md) for the full mechanics.

## Troubleshooting

### "Permission denied" during install on macOS/Linux

```bash
chmod +x ~/.config/opencode/oh-my-openkilo/install.sh
```

### Skills not loading

Make sure the skills folder is at the path OpenCode scans. Default is the same dir as `opencode.json` (i.e. `~/.config/opencode/skills/`). If you've moved it, register it in `opencode.json`:

```jsonc
{
  "skills": {
    "paths": ["C:\\Users\\<You>\\.config\\opencode\\skills"]
  }
}
```

Restart OpenCode after changing this.

### Plugins not loading

Plugin errors usually show in OpenCode startup logs. Common causes:

- Missing `node_modules` in `plugins/caveman/` — run `cd ~/.config/opencode/plugins/caveman && npm install`
- Plugin path in `opencode.json` is wrong — should be `./plugins/caveman/plugin.js` and `./plugins/agentmemory-capture.ts` (relative to the dir containing `opencode.json`)

### "credential not set" errors

You forgot to fill in `opencode.json` after install. See [CONFIGURATION.md](CONFIGURATION.md) for the env-var pattern.
