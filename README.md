# oh-my-openkilo

A curated **OpenCode** configuration pack — specialized agents, skills, rules, and plugins that make OpenCode smarter and more autonomous out of the box.

**OpenCode Agent Suite** · 11 agents · 46 skills · 7 rules · 9 commands

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Agents](https://img.shields.io/badge/agents-11-orange)](#-meet-the-agents)
[![Skills](https://img.shields.io/badge/skills-46-green)](#-skills)
[![Zero credentials](https://img.shields.io/badge/credentials-zero-brightgreen)](SECURITY.md)

---

## What is oh-my-openkilo?

A **configuration pack** for [OpenCode](https://opencode.ai) — plain files plus an installer that copies them into `~/.config/opencode`. No plugin runtime, no build step. Designed for Windows; macOS and Linux are supported via the Unix installer but **have not been tested by the maintainer** — see [macOS / Linux support](#-macos--linux-support) below.

Instead of building your AI coding workflow from scratch, you get a curated, opinionated setup that works immediately:

- **11 specialized agents** — 2 primary (`builder`, `planner`) + 9 subagents (`designer`, `tester`, `reviewer`, `documenter`, `researcher`, `explorer`, `cavecrew-*`) with a delegation hierarchy already designed
- **46 skills** — battle-tested playbooks (TDD, systematic debugging, code review, writing-plans, web-perf) curated from popular community packs
- **7 global rules** — always-on guardrails: English-only files, mandatory memory search, mandatory skill check, knowledge-graph-first navigation, parallel delegation, caveman/ponytail style, Cloudflare Workers doc-first
- **4 plugins** — `agentmemory-capture`, `caveman`, `ponytail`, `superpowers`
- **1 update command** — `/update-pack` to pull latest and sync with per-file backup

The idea is simple: **prompts in files, models in config, behavior in rules.** Edit an agent by editing its file; switch models via `opencode.json`; add your own agents, skills, or rules without touching anything else.

## Who is it for?

- **OpenCode users** who want a ready-to-use setup — install and start, no prompt engineering required
- **Power users** who want structured delegation, consistent session behavior, and a knowledge graph for large codebases
- **Tinkerers** who want a solid baseline to fork and customize

## What do you get?

| Component | Count | What it does |
|-----------|-------|--------------|
| Agents    | 11    | 2 primary + 9 subagents with delegation hierarchy — `builder` delegates UI to `designer`, tests to `tester`, review to `reviewer`, etc. |
| Skills    | 46    | Curated playbooks across 10 categories: core, planning, audits, communication, workflow/git, UI/perf, platform, browser, stitch, caveman, meta |
| Rules     | 7     | Always-on session guardrails, loaded via the `instructions` config (protocol rules first) |
| Plugins   | 4     | `agentmemory-capture` (auto-save observations), `caveman` (terse mode tracker), `ponytail` (minimal code style), `superpowers` (skill loader) |
| Commands  | 9     | `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities |

---

## Quick Start

### Windows (recommended)

```powershell
# One-liner
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.ps1 | iex

# Or preview first
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.ps1 -OutFile install.ps1
.\install.ps1 -WhatIf
.\install.ps1
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.sh | bash

# Or preview first
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.sh -o install.sh
chmod +x install.sh
./install.sh --dry-run
./install.sh
```

The installer:

1. Verifies `~/.config/opencode` exists (creates if missing).
2. **Backs up your existing config** to `~/.config/opencode.backup-<timestamp>`.
3. Copies `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md` from the pack.
4. If you don't have `opencode.json` yet, seeds it from `examples/opencode.example.json`.
5. Prints next steps.

> ⚠️ **Before you install:** the installer overwrites any existing `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, and `AGENTS.md` under your config dir. The backup step protects you, but read [docs/INSTALL.md](docs/INSTALL.md) first if you have customizations you want to keep.

### After install

1. **Edit `~/.config/opencode/opencode.json`** to set your model and provider keys. The example has `{env:VAR}` placeholders — set the env vars in your shell, or in a `.env` file (gitignored).
2. **(Optional) install Plus-tier tools** for full performance — see [Performance Tiers](#-performance-tiers) below.
3. **Restart OpenCode** or run `/reload`.
4. **Verify:** in a session, ask `list your agents and confirm which skills are loaded`. You should see all 11 agents, 46 skills, and 7 rules.

---

## Default models are free

Every agent and subagent in this pack defaults to a **free model provided by OpenCode** (e.g. `opencode/nemotron-3-ultra-free`, `opencode/muse-spark-1.2-contributor-free`, `opencode/mimo-v2.5-free`, `opencode/hy3-free`). You can use the pack **without configuring any provider API key** — just install and start.

Want a different model? Edit the agent's `model:` line in its markdown file:

```bash
# example: switch reviewer from free to your preferred model
notepad $env:USERPROFILE\.config\opencode\agents\reviewer.md
# change: model: opencode/nemotron-3-ultra-free
# to:     model: anthropic/claude-sonnet-4-5  (or any other model from your provider list)
```

The `model` field sits in the YAML frontmatter at the top of each `agents/*.md` file. Restart OpenCode (or run `/reload`) after changing it. See [docs/AGENTS.md](docs/AGENTS.md#changing-the-model) for the full per-agent model table and recommendations.

## Performance Tiers

The pack ships in two linear layers. **Core is always installed** and works out of the box. **Plus** adds the two external tools that make the pack truly "smart". **MCPs are listed in the example config** but disabled by default (except `agentmemory` which Plus needs); enable them one at a time as you need the capability.

### Core (always installed)

The pack itself — agents, skills, rules, commands, plugins, `AGENTS.md`, plus the `mcp` entries in `examples/opencode.example.json` (most disabled by default). Without anything else, OpenCode already uses caveman-style terse replies, ponytail-style minimal code, and the full skill library.

### Plus — recommended for "smart" performance

Two external tools unlock the highest-leverage features:

```bash
npm i -g graphify              # knowledge graph (the `graphify` rule + skill depend on this)
npm i -g @agentmemory/server   # persistent cross-session memory (the `agentmemory` rule depends on this)
```

Then start the agentmemory server (see its README) and make sure `mcp.agentmemory` is enabled in `opencode.json` (the example already has it).

**Risk if you skip Plus:**

- **No `graphify`** → codebase navigation falls back to manual `grep` and `read`. Slower on large repos. The rule loads but its tools are missing.
- **No `agentmemory`** → no cross-session memory. Every session starts from zero. The rule degrades to nothing useful.

### MCPs (enabled per-need, not auto-on)

The example config includes all MCPs that ship with this pack, **disabled by default except `agentmemory`** (which Plus needs). Enable one when you actually need its capability.

| MCP                    | What it unlocks                                        | Required             | Risk if disabled |
|------------------------|--------------------------------------------------------|----------------------|------------------|
| `agentmemory`          | Persistent cross-session memory (Plus dependency)      | Plus server + `AGENTMEMORY_SERVER_URL` | No memory — every session starts from zero |
| `context7`             | Up-to-date library docs (replaces stale training data) | `CONTEXT7_API_KEY` (free) | Docs lookup falls back to model knowledge (often outdated) |
| `stitch`               | AI-generated UI mockups, used by `designer` agent      | `GOOGLE_API_KEY`     | **`designer` becomes inert** — `builder` and `planner` delegate UI work to `designer`, so all UI tasks degrade |
| `chrome-devtools`      | Live browser debug (DOM, network, console, perf)       | none                 | No live browser inspection |
| `playwright`           | Stateful persistent browser loop, E2E test gen         | `npx playwright install chromium` (first run) | E2E generation disabled |
| `remotion`             | Walkthrough video generation                           | none                 | No video capability |
| `supabase-mcp-server`  | Supabase project ops                                   | `SUPABASE_ACCESS_TOKEN` | No Supabase integration |

Enable by setting `"enabled": true` in `opencode.json` and filling in any required env var. See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for details. The `install.ps1` validator will warn you if you enable an MCP without setting its env var.

---

## Meet the agents

11 curated agents. **Each one is a markdown file in `agents/`** that enriches a native agent with specialist protocols. Edit the prompt by editing the file. Model, variant, and permissions are configured via `opencode.json`.

### Primary agents

| # | Agent | Role |
|---|-------|------|
| 01 | **`builder`** — The Architect | Default implementation agent. Triage → simple (do directly) or complex (delegate to `planner`). Subagent fan-out for specialized work. |
| 02 | **`planner`** — The Oracle | Pre-implementation design, brainstorming, architecture planning, writes plans. |

### Subagents

| # | Agent | Role | Notes |
|---|-------|------|-------|
| 03 | `designer` | UI/UX, React/Next.js, design system, accessibility. Stitch-integrated for AI mockups. | **Requires `stitch` MCP** |
| 04 | `tester` | Test suites — write, run, iterate failures in isolation, report compact results. | |
| 05 | `reviewer` | Code + security review of diffs vs repo standards and spec. Read-only. | |
| 06 | `documenter` | Creates and improves documentation in `docs/`, verified against code. | |
| 07 | `researcher` | External research with cited findings. Uses `context7` for libraries; web research via `webfetch`/`websearch`. | |
| 08 | `explorer` | Fast codebase scouting — broad, shallow, quick. | |
| 09 | `cavecrew-investigator` | Compressed code locator. `file:line` table output, 60% fewer tokens. | |
| 10 | `cavecrew-builder` | 1-2 file surgical edit. Refuses if scope > 2 files. | |
| 11 | `cavecrew-reviewer` | Diff review, one line per finding, severity-tagged. | |

> 📖 Full agent guide: [docs/AGENTS.md](docs/AGENTS.md)

## Skills

46 skills grouped into 10 categories. Skills are prompt-based playbooks injected into an agent's context when a task matches. They run no process — just focused instructions.

| Category | Count | Examples |
|----------|-------|----------|
| core | 8 | `clean-code`, `systematic-debugging`, `test-driven-development`, `verification-before-completion` |
| planning | 5 | `codebase-design`, `plans`, `grilling`, `handoff`, `resolving-merge-conflicts` |
| audits | 3 | `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt` |
| communication | 4 | `caveman`, `graphify`, `ponytail` |
| workflow & git | 8 | `recall`, `remember`, `recap`, `lesson`, `forget`, `commit-context`, `commit-history`, `session-history` |
| UI & perf | 4 | `ui-design`, `vercel-react`, `web-perf`, `pwa-development` |
| platform | 1 | `cloudflare` |
| browser & testing | 2 | `playwright-cli`, `chrome-devtools` |
| stitch / design | 1 | `stitch` (unified, 16 sub-skills) |
| caveman family | 6 | `caveman`, `caveman-help`, `caveman-commit`, `caveman-compress`, `caveman-review`, `caveman-stats` |
| meta | 3 | `using-superpowers`, `subagent-driven-development`, `dispatching-parallel-agents` |
| cavecrew | 1 | `cavecrew` (decision guide for the 3 cavecrew subagents) |

> 📖 Full skill table: [docs/SKILLS.md](docs/SKILLS.md)

## Rules

Seven global rules loaded via `opencode.json` `instructions`. Order matters — protocol rules first.

| Rule | Mandate |
|------|---------|
| `agentmemory` | Recall before work; save at decision points and after outcomes |
| `graphify` | Knowledge-graph-first navigation; init with `graphify update .` if missing |
| `skill-reminder` | Load matching skill before any implementation task |
| `delegation` | Delegate specialized work; run independent subtasks in parallel |
| `language` | All file content in English; chat can be any language |
| `communication-style` | Caveman (terse) replies and Ponytail (minimal) code style |
| `workers` | Cloudflare Workers doc-first (conditional, globs-based) |

> 📖 Full rule guide: [docs/RULES.md](docs/RULES.md)

## Commands

| Command | Description |
|---------|-------------|
| `/update-pack` | Pull latest from GitHub and sync into your config with per-file backup |
| `/update-pack --check` | Check whether upstream has new commits, do not sync |
| `/update-pack --diff` | Show what would change, do not sync |
| `/recall <query>` | Search agentmemory for past observations |
| `/remember <note>` | Save a decision or insight to agentmemory |
| `/caveman`, `/caveman-help`, `/caveman-commit`, `/caveman-compress`, `/caveman-review`, `/caveman-stats` | Terse-mode and PR utilities |

> 📖 Full command reference: [docs/COMMANDS.md](docs/COMMANDS.md)

---

## Updating the pack

In an OpenCode session, type:

```
/update-pack
```

This pulls the latest commit from GitHub, then syncs each file with per-file diff and backup of any local changes you made. Files you customized get backed up as `<file>.local-<timestamp>` before being overwritten — your changes are never silently lost.

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full mechanics.

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/INSTALL.md](docs/INSTALL.md) | Step-by-step install, uninstall, troubleshooting |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | What's in the repo — every folder and file explained |
| [docs/AGENTS.md](docs/AGENTS.md) | The 11 agents — when to use each, how to edit |
| [docs/SKILLS.md](docs/SKILLS.md) | All 46 skills grouped by category |
| [docs/RULES.md](docs/RULES.md) | The 7 global rules in detail |
| [docs/COMMANDS.md](docs/COMMANDS.md) | Command reference, `/update-pack` mechanics |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | `opencode.json` block-by-block, credential handling |

## 🖥 Compatibility

| Platform / Tool | Status |
|-----------------|--------|
| OpenCode (CLI) | ✅ Tested |
| Windows | ✅ Tested |
| macOS | ⚠️ Untested by maintainer — see below |
| Linux | ⚠️ Untested by maintainer — see below |
| `graphify` | Optional — degrades to plain search if missing |
| `agentmemory` | Optional — falls back to in-session memory only if missing |
| MCP servers | Optional — see Performance Tiers |

### 🍎 macOS / Linux support

**Honest disclosure:** the maintainer develops and tests this pack on Windows only. `install.sh` is provided in the repo and is structurally similar to `install.ps1`, but it has **not been exercised on a real macOS or Linux machine** by the maintainer. There may be path quoting bugs, `bash` version assumptions, or `jq`/`python` availability issues that surface only on Unix.

**If you're on macOS or Linux, the safest path is manual copy-paste.** It is guaranteed to work because there is no installer logic to fail — just file copies. From a shell:

```bash
# 1. Clone the repo anywhere
git clone https://github.com/PanPanFR/oh-my-openkilo.git ~/oh-my-openkilo

# 2. Copy each folder into ~/.config/opencode
mkdir -p ~/.config/opencode
cp -r ~/oh-my-openkilo/agents    ~/.config/opencode/
cp -r ~/oh-my-openkilo/skills    ~/.config/opencode/
cp -r ~/oh-my-openkilo/rules     ~/.config/opencode/
cp -r ~/oh-my-openkilo/commands  ~/.config/opencode/
cp -r ~/oh-my-openkilo/plugins   ~/.config/opencode/
cp    ~/oh-my-openkilo/AGENTS.md ~/.config/opencode/

# 3. (Optional) seed opencode.json if you don't have one yet
cp ~/oh-my-openkilo/examples/opencode.example.json ~/.config/opencode/opencode.json
# then edit it to fill in your model and provider keys

# 4. Restart OpenCode
```

If you try `install.sh` and hit an issue, please [open an issue](https://github.com/PanPanFR/oh-my-openkilo/issues) with the exact error and your `bash --version` / `uname -a`. PRs that fix Unix-specific bugs are welcome.

## 🙏 Credits

oh-my-openkilo is the OpenCode adaptation of **[oh-my-kilo](https://github.com/PanPanFR/oh-my-kilo)** — a lean, curated multi-agent configuration pack for Kilo Code by the same maintainer. The "prompts in files, models in config, behavior in rules" philosophy and the agent/skill/rule layering come from that project.

The pack structure and the "config-only" sharing approach are inspired by **[oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)** by [alvinunreal](https://github.com/alvinunreal) — a lean, curated multi-agent suite for OpenCode. oh-my-openkilo adapts the philosophy (specialized agents + delegation hierarchy + skills + rules + installer) into a pure config pack, no runtime, no build step.

The **agentic workflow patterns** — primary agent triage, subagent delegation, skill-based protocol enforcement, graphify-first codebase navigation, and caveman/ponytail communication style — were developed in **[Kilo Code](https://github.com/Kilo-Org/kilocode)** (also by this maintainer, see `oh-my-kilo`). OpenCode inherits these patterns naturally, and the agents in this pack are the same mental model applied to a different runtime.

## 🔒 Security

The pack ships **zero credentials** — only `{env:VAR}` placeholders and an opinionated permission default that you should review. See [SECURITY.md](SECURITY.md).

## Contributing

Found a bug, an install issue, or have an agent/skill suggestion? Open an issue or PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
