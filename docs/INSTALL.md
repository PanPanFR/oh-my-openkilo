# Installation

## Quick start (Windows, recommended)

```powershell
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.ps1 | iex
```

This downloads `scripts/install.ps1`, runs it in-memory. It will:

1. Verify `~/.config/opencode` exists (create if missing).
2. Back up your existing config to `~/.config/opencode.backup-<timestamp>`.
3. Copy `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md` from the pack into your config.
4. If you don't have `opencode.json` yet, copy `examples/opencode.example.json` there for you to edit.
5. Print next steps.

After it finishes, edit `~/.config/opencode/opencode.json` to set your model and provider keys, then restart OpenCode or run `/reload`.

> Want the bleeding edge instead of `v0.4.0`? Replace the tag in the URL with `main` (always tracks the latest commit) or the [latest release](https://github.com/PanPanFR/oh-my-openkilo/releases/latest) tag.

## Quick start (macOS / Linux)

```bash
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.sh | bash
```

> ⚠️ **Heads up:** the maintainer develops and tests on Windows only. `install.sh` is structurally similar to `install.ps1` but has **not been tested on macOS or Linux**. If it fails, the safest fallback is **manual copy-paste**; see [macOS / Linux support](../README.md#-macos--linux-support) in the README. Please [open an issue](https://github.com/PanPanFR/oh-my-openkilo/issues) if you hit a Unix-specific bug so it can be fixed.

## Manual install (full control)

```powershell
# 1. Clone the pack to a subfolder of your config
git clone https://github.com/PanPanFR/oh-my-openkilo.git "$env:USERPROFILE\.config\opencode\oh-my-openkilo"

# 2. Preview what install would do
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\scripts\install.ps1" -WhatIf

# 3. Apply
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\scripts\install.ps1"
```

```bash
# macOS / Linux
git clone https://github.com/PanPanFR/oh-my-openkilo.git ~/.config/opencode/oh-my-openkilo
~/.config/opencode/oh-my-openkilo/scripts/install.sh --dry-run
~/.config/opencode/oh-my-openkilo/scripts/install.sh
```

## Install flags

| Flag (PowerShell)         | Flag (Bash)        | Effect |
|---------------------------|--------------------|--------|
| `-WhatIf`                 | `--dry-run`        | Print actions, change nothing |
| `-SkipBackup`             | `--no-backup`      | Skip the timestamped backup |
| `-SkipPlugins`            | `--no-plugins`     | Skip `plugins/` copy |
| `-ConfigDir <path>`       | `--config-dir=<path>` | Override target config dir |

## After install: required dependencies

The pack **requires** two external tools to deliver its core value. Without them, the `agentmemory` and `graphify` rules load but their tools are missing; the pack degrades to a much weaker version of itself. Install these **immediately after** the pack itself:

```bash
# Knowledge graph -- the `graphify` skill depends on this
npm i -g graphify

# Persistent cross-session memory -- the memory skills depend on this
npm i -g @agentmemory/server
```

Then start the agentmemory server (see its README) and make sure `mcp.agentmemory` is enabled in `opencode.json` (the example already has it). Start the server once with `agentmemory serve` (or whatever the package's start command is; see its README).

**What you lose without each:**

- **No `graphify`** → codebase navigation falls back to manual `grep` and `read`. Slower on large repos. The `graphify` rule and skill both rely on this binary.
- **No `agentmemory`** → no cross-session memory. Every session starts from zero. The `memory-discipline`/`recall` skills and the `recall`/`remember`/`recap` commands all depend on this.

The pack's `instructions` array registers `rules/skill-reminder.md` as always-on, so the skill-check + memory-recall protocol fires every session; it degrades to no-op if the dependencies are missing.

### MCPs (enable per-need, not auto-on)

The example config lists all MCPs that ship with this pack. **`agentmemory` is enabled by default** (required dependency). All other MCPs are `enabled: false`; turn one on when you need it.

| MCP                    | Capability                                          | Required env / key                      | Risk if disabled |
|------------------------|-----------------------------------------------------|-----------------------------------------|------------------|
| `agentmemory`          | Persistent cross-session memory (**required**)      | `AGENTMEMORY_SERVER_URL` (Plus server)  | No memory. Every session starts from zero. |
| `context7`             | Up-to-date library docs (replaces training data)    | `CONTEXT7_API_KEY` (free at context7.com) | Documentation lookup falls back to model knowledge (often outdated) |
| `chrome-devtools`      | Live browser debug (DOM, network, console, perf)    | none (uses installed Chrome)            | No live browser inspection; static fetch only |
| `playwright`           | Stateful persistent browser loop, E2E test gen      | `npx playwright install chromium` first | E2E test generation disabled; `playwright-cli` skill degrades |

To enable any of these, edit `opencode.json` to set `enabled: true` and fill in the required env vars. The `install.ps1` validator scans your config and warns if any enabled MCP has a missing env var.

## Verify the install

Start OpenCode in any directory and ask:

```
list your agents and confirm which skills are loaded
```

You should see 8 agents, 46 skills, and 3 rules. If something is missing, the most common cause is the `skills.paths` not pointing to your skills folder, but oh-my-openkilo's structure matches the default discovery path, so this should be automatic. If you have a custom `opencode.json` with non-default paths, see [CONFIGURATION.md](CONFIGURATION.md).

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
chmod +x ~/.config/opencode/oh-my-openkilo/scripts/install.sh
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

- Missing `node_modules` in `plugins/caveman/`. Run `cd ~/.config/opencode/plugins/caveman && npm install`
- Plugin path in `opencode.json` is wrong. Should be `./plugins/caveman/plugin.js` and `./plugins/agentmemory-capture.ts` (relative to the dir containing `opencode.json`)

### "credential not set" errors

You forgot to fill in `opencode.json` after install. See [CONFIGURATION.md](CONFIGURATION.md) for the env-var pattern.
