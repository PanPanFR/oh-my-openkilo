# oh-my-openkilo

A curated **OpenCode** configuration pack: specialized agents, skills, rules, and plugins that make OpenCode smarter and more autonomous out of the box.

**OpenCode Agent Suite** · 8 agents · 46 skills · 7 rules · 9 commands

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Agents](https://img.shields.io/badge/agents-8-orange)](#-meet-the-agents)
[![Skills](https://img.shields.io/badge/skills-46-green)](#-skills)
[![Zero credentials](https://img.shields.io/badge/credentials-zero-brightgreen)](SECURITY.md)

---

## TL;DR

```powershell
# Windows: one-liner install (pinned to v0.4.0)
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.ps1 | iex
```

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.sh | bash
```

> Want the bleeding edge instead of `v0.4.0`? Replace the tag in the URL with `main` (always tracks the latest commit) or the [latest release](https://github.com/PanPanFR/oh-my-openkilo/releases/latest) tag.

Then install the two required tools and restart OpenCode:

```bash
npm i -g graphify @agentmemory/server
agentmemory serve
```

OpenCode now has 8 specialized agents, 46 curated skills, 7 always-on rules, and `/update-pack` to keep everything fresh. Zero credentials needed to start; the pack ships with free OpenCode models.

---

## What is oh-my-openkilo?

A **configuration pack** for [OpenCode](https://opencode.ai): plain files plus an installer that copies them into `~/.config/opencode`. No plugin runtime, no build step. Designed for Windows; macOS and Linux are supported via the Unix installer but **have not been tested by the maintainer**. See [macOS / Linux support](#-macos--linux-support) below.

The agentic workflow patterns in this pack (primary-agent triage, subagent delegation, skills as protocols, graphify-first navigation, and the caveman/ponytail communication style) are inherited from [Kilo Code](https://github.com/Kilo-Org/kilocode), the same maintainer's multi-agent extension for VS Code. This pack is the OpenCode adaptation of that workflow: same mental model, different runtime.

Instead of building your AI coding workflow from scratch, you get a curated, opinionated setup that works immediately:

- **8 specialized agents**: 2 primary (`builder`, `planner`) + 6 subagents (`designer`, `tester`, `reviewer`, `documenter`, `researcher`, `explorer`) with a delegation hierarchy already designed
- **46 skills**: battle-tested playbooks (TDD, systematic debugging, code review, writing-plans, web-perf) curated from popular community packs
- **7 global rules**: always-on guardrails: English-only files, mandatory memory search, mandatory skill check, knowledge-graph-first navigation, parallel delegation, caveman/ponytail style, Cloudflare Workers doc-first
- **2 bundled plugins + 2 npm plugins**: bundled = `agentmemory-capture` (auto-save observations to memory) and `caveman` (terse-mode tracker); npm = `@dietrichgebert/ponytail` (minimal code style) and `superpowers` (skill loader)
- **1 update command**: `/update-pack` to pull latest and sync with per-file backup

The idea is simple: **prompts in files, models in config, behavior in rules.** Edit an agent by editing its file; switch models via `opencode.json`; add your own agents, skills, or rules without touching anything else.

## Why it's lightweight

oh-my-openkilo is **markedly lighter** than other multi-agent OpenCode packs (e.g. [oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)) because it ships **only configuration**, not a runtime. The repo is 569 files / 2.6 MB; a comparable plugin-based pack is 507 files / 58.5 MB, roughly **23× larger** because the other approach bundles a TypeScript build pipeline, a compiled `dist/`, and a `node_modules` tree.

What "configuration only" means in practice:

| Aspect                | oh-my-openkilo (config pack)                          | Typical plugin pack                              |
|-----------------------|--------------------------------------------------------|---------------------------------------------------|
| **What you install**  | Markdown files, shell scripts                         | TypeScript source, build output, npm deps        |
| **Build step**        | None. Files are the artifact.                        | `bun install && bun run build`                    |
| **Install time**      | Seconds (file copy + optional `npm i -g`)             | Minutes (download deps, compile TS)               |
| **Update mechanism**  | `git pull` + per-file copy + backup                   | `git pull` + `bun install` + `bun run build`      |
| **Runtime overhead**  | Zero. OpenCode reads the markdown directly.          | Plugin loader runs on every OpenCode startup      |
| **Failure surface**   | File copy, PowerShell/bash                            | Bun, npm, TypeScript compiler, build cache        |
| **What can break**    | A misformed frontmatter, a typo in a path             | A version mismatch, a build error, a missing dep  |
| **Uninstall**         | Delete the copied folders                            | Disable the plugin, remove the npm package, hope  |

The pack **curates** a small set of well-known tools (`graphify`, `agentmemory`, `caveman`, `ponytail`, `superpowers`) rather than building a new runtime. If you already have those tools, oh-my-openkilo adds nothing to your machine; it just points OpenCode at better prompts.

The downside: oh-my-openkilo can't add features that need runtime support (background orchestration, AST-aware tools, live model presets). For those, a plugin pack is the right tool. For "smarter prompts out of the box", config is enough.

## Want a friendlier UI? Try OpenChamber

oh-my-openkilo is a **terminal-first** pack, with agents living in your shell and you steering via plain text. If you'd rather watch the agent work in a visual workspace (file tree, diff viewer, parallel session manager, mobile/PWA access), pair this pack with **OpenChamber**, an open-source GUI that runs on top of the OpenCode SDK.

**Note:** OpenChamber is a **third-party project**, not affiliated with this pack or with the OpenCode team. It speaks the same OpenCode config files that oh-my-openkilo populates, so the two compose naturally: install oh-my-openkilo for the agents/skills/rules, then point OpenChamber at the same `~/.config/opencode` directory and you get a visual control room on top of it.

**OpenChamber is available in three places, all maintained by the same third-party team:**

- **VS Code extension:** install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=FedaykinDev.openchamber) (publisher: `FedaykinDev`). This is the easiest path if you already live in VS Code.
- **Desktop app, browser, and mobile:** [openchamber.dev](https://openchamber.dev/). Cross-platform UI with extra features.
- **Source code:** [github.com/openchamber/openchamber](https://github.com/openchamber/openchamber). MIT licensed, build it yourself if you want.

If you only want the lightest "VSCode experience", the official [OpenCode extension for VS Code](https://opencode.ai/docs/ide/) (terminal split, keybinds, file reference shortcuts) is enough; that's maintained by the OpenCode team itself. OpenChamber is the third-party option that gives you the full visual control room.

## Who is it for?

- **OpenCode users** who want a ready-to-use setup: install and start, no prompt engineering required
- **Power users** who want structured delegation, consistent session behavior, and a knowledge graph for large codebases
- **Tinkerers** who want a solid baseline to fork and customize

## What do you get?

| Component | Count | What it does |
|-----------|-------|--------------|
| Agents    | 8     | 2 primary + 6 subagents with delegation hierarchy. `builder` delegates UI to `designer`, tests to `tester`, review to `reviewer`, etc. |
| Skills    | 46    | Curated playbooks across 10 categories: core, planning, audits, communication, workflow/git, UI/perf, platform, browser, stitch, caveman, meta |
| Rules     | 7     | Always-on session guardrails, loaded via the `instructions` config (protocol rules first) |
| Plugins   | 4     | `agentmemory-capture` (auto-save observations), `caveman` (terse mode tracker), `ponytail` (minimal code style), `superpowers` (skill loader) |
| Commands  | 9     | `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities |

---

## Quick Start

### Windows (recommended)

```powershell
# One-liner (pinned to v0.4.0)
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.ps1 | iex

# Or preview first (after `git clone`)
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.ps1 -OutFile scripts/install.ps1
.\scripts\install.ps1 -WhatIf
.\scripts\install.ps1
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.sh | bash

# Or preview first (after `git clone`)
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/install.sh -o scripts/install.sh
chmod +x scripts/install.sh
./scripts/install.sh --dry-run
./scripts/install.sh
```

The installer:

1. Verifies `~/.config/opencode` exists (creates if missing).
2. **Backs up your existing config** to `~/.config/opencode.backup-<timestamp>`.
3. Copies `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md` from the pack.
4. If you don't have `opencode.json` yet, seeds it from `examples/opencode.example.json`.
5. Prints next steps.

> ⚠️ **Before you install:** the installer overwrites any existing `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, and `AGENTS.md` under your config dir. The backup step protects you, but read [docs/INSTALL.md](docs/INSTALL.md) first if you have customizations you want to keep.

### After install

1. **Edit `~/.config/opencode/opencode.json`** to set your model and provider keys. The example has `{env:VAR}` placeholders; set the env vars in your shell, or in a `.env` file (gitignored).
2. **Install required dependencies** (`graphify`, `agentmemory`). See [Required dependencies](#-required-dependencies) below. Without these the pack degrades severely.
3. **Restart OpenCode** or run `/reload`.
4. **Verify:** in a session, ask `list your agents and confirm which skills are loaded`. You should see all 8 agents, 46 skills, and 7 rules.

---

## Default models are free

Every agent and subagent in this pack defaults to a **free model provided by OpenCode** (e.g. `opencode/nemotron-3-ultra-free`, `opencode/muse-spark-1.2-contributor-free`, `opencode/mimo-v2.5-free`, `opencode/hy3-free`). You can use the pack **without configuring any provider API key**; just install and start.

Want a different model? Edit the agent's `model:` line in its markdown file:

```bash
# example: switch reviewer from free to your preferred model
notepad $env:USERPROFILE\.config\opencode\agents\reviewer.md
# change: model: opencode/nemotron-3-ultra-free
# to:     model: anthropic/claude-sonnet-4-5  (or any other model from your provider list)
```

The `model` field sits in the YAML frontmatter at the top of each `agents/*.md` file. Restart OpenCode (or run `/reload`) after changing it. See [docs/AGENTS.md](docs/AGENTS.md#changing-the-model) for the full per-agent model table and recommendations.

## Configuration: start from `opencode.example.json`

[`examples/opencode.example.json`](examples/opencode.example.json) is a **ready-to-use** configuration file, not a skeleton. It already includes:

- All 4 plugin loaders (`agentmemory-capture`, `caveman`, `ponytail`, `superpowers`).
- All 7 always-on rules wired into `instructions` (agentmemory, graphify, skill-reminder, delegation, language, communication-style, workers).
- All MCP server entries (7 of them, with `enabled: false` for everything except `agentmemory`).
- One provider template (`9router`, with `{env:NINE_ROUTER_API_KEY}` placeholder).
- A working `permission` block.

**To use it:** open the file, replace `<YOUR_*>` placeholders and `{env:VAR}` references with your real values, then save as `~/.config/opencode/opencode.json`. The `install.ps1` script does this for you automatically if you don't have a config yet.

**For credentials specifically:** the example uses `{env:VAR}` placeholders for every secret. Set the env var in your shell or `.env` file rather than pasting the literal key into the JSON; OpenCode resolves `{env:VAR}` at startup. This keeps the file safe to commit, share, and version.

If you'd rather start blank, just edit `opencode.json` directly. If you want the full breakdown of every block, see [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## Required dependencies

The pack **requires** two external tools to deliver its core value. Without them, several rules and skills will load but their tools will be missing; the pack degrades to a much weaker version of itself. Install these immediately after the pack itself:

```bash
npm i -g graphify              # knowledge graph (the `graphify` rule + skill depend on this)
npm i -g @agentmemory/server   # persistent cross-session memory (the `agentmemory` rule depends on this)
```

Then start the agentmemory server (see its README) and make sure `mcp.agentmemory` is enabled in `opencode.json` (the example already has it).

**What you lose without each:**

- **No `graphify`** → codebase navigation falls back to manual `grep` and `read`. Slower on large repos. The `graphify` rule and skill both rely on this binary.
- **No `agentmemory`** → no cross-session memory. Every session starts from zero. The `agentmemory` rule and the `recall`/`remember`/`recap` commands all depend on this.

The pack's `instructions` array registers `rules/agentmemory.md` and `rules/graphify.md` as always-on, so the rules fire every session; but they degrade to no-ops if the dependencies are missing. Install them.

## MCPs (enabled per-need, not auto-on)

The example config includes all MCPs that ship with this pack. **`agentmemory` is enabled by default** (because of the required-dependency rule above). All other MCPs are `enabled: false`; turn one on when you actually need its capability.

| MCP                    | What it unlocks                                        | Required             | Risk if disabled |
|------------------------|--------------------------------------------------------|----------------------|------------------|
| `agentmemory`          | Persistent cross-session memory (**required dependency**) | `AGENTMEMORY_SERVER_URL` (Plus server) | No memory. Every session starts from zero. |
| `context7`             | Up-to-date library docs (replaces stale training data) | `CONTEXT7_API_KEY` (free) | Docs lookup falls back to model knowledge (often outdated) |
| `stitch`               | AI-generated UI mockups, used by `designer` agent      | `GOOGLE_API_KEY`     | **`designer` becomes inert**: `builder` and `planner` delegate UI work to `designer`, so all UI tasks degrade |
| `chrome-devtools`      | Live browser debug (DOM, network, console, perf)       | none                 | No live browser inspection |
| `playwright`           | Stateful persistent browser loop, E2E test gen         | `npx playwright install chromium` (first run) | E2E generation disabled |
| `remotion`             | Walkthrough video generation                           | none                 | No video capability |
| `supabase-mcp-server`  | Supabase project ops                                   | `SUPABASE_ACCESS_TOKEN` | No Supabase integration |

Enable by setting `"enabled": true` in `opencode.json` and filling in any required env var. See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for details. The `install.ps1` validator will warn you if you enable an MCP without setting its env var.

### 📦 Installing MCP servers

The MCPs in the table above fall into two categories: **npm-based** (most of them, where `npx` downloads them on first use) and **remote** (just need a URL + API key). None of them require a separate install step before enabling in `opencode.json`; but several need a one-time setup after the first run.

#### `agentmemory` (required, already enabled)

Two parts: a global CLI and a local server.

```bash
npm i -g @agentmemory/server          # CLI
agentmemory serve                     # start the local server (default: http://localhost:3111)
```

The MCP in `opencode.json` points to `http://localhost:3111` by default. If you change the port, update `mcp.agentmemory.env.AGENTMEMORY_SERVER_URL` to match.

#### `context7` (remote, no install)

Just set `enabled: true` and provide `CONTEXT7_API_KEY` (free at [context7.com](https://context7.com)). The MCP fetches docs from `https://mcp.context7.com/mcp` directly. No local install.

#### `stitch` (remote, no install)

Set `enabled: true` and provide `GOOGLE_API_KEY` (Google Cloud API key with Stitch access). The MCP connects to `https://stitch.googleapis.com/mcp`. **Without this, the `designer` agent becomes inert**; see the row above.

#### `chrome-devtools` (npm, no setup)

```jsonc
"chrome-devtools": {
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
  "enabled": true
}
```

`npx` downloads it on first invocation. Requires an installed Chrome/Chromium browser.

#### `playwright` (npm + one-time browser install)

```jsonc
"playwright": {
  "type": "local",
  "command": ["npx", "@playwright/mcp@latest"],
  "enabled": true
}
```

After enabling, run once in a shell:

```bash
npx playwright install chromium       # downloads ~150MB browser binary
```

This is a one-time setup per machine. Subsequent runs reuse the cached binary.

#### `remotion` (npm, no setup)

```jsonc
"remotion": {
  "type": "local",
  "command": ["npx", "-y", "remotion-mcp"],
  "enabled": true
}
```

Downloads on first run. Requires Node.js and (for video rendering) FFmpeg on `PATH`.

#### `supabase-mcp-server` (npm, needs access token)

```bash
# 1. Get a personal access token at https://supabase.com/dashboard/account/tokens
# 2. Set the env var (PowerShell example)
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."

# 3. Enable in opencode.json
```

The token grants the MCP read/write access to your Supabase projects. Treat it like any other secret.

---

**TL;DR for most users:** you only need to install the two required dependencies (`graphify`, `@agentmemory/server`) and the agentmemory server. Everything else is one-line config flips. Start OpenCode, enable MCPs as you need them.

---

## 🎯 Example workflows

What does this pack actually *do*? Here are five real prompts, and what happens **without** oh-my-openkilo versus **with** it, so the difference is concrete.

### 1. Repository audit

> "Audit this repository's architecture and identify the biggest problems."

**Without oh-my-openkilo:** One agent reads files manually, greps around, and gives a surface-level opinion: architecture, performance, and code quality all mushed into one pass with no structure or evidence per claim.

**With oh-my-openkilo:**
- **Agent:** `builder` → delegates `explorer` (recon) + `reviewer` (quality/security) in parallel
- **Skills:** `clean-code`, `code-review`, `ponytail-review`
- **Rules:** graphify-first navigation (queries the knowledge graph before grep), parallel delegation
- **Result:** structured report (architecture + code quality + over-engineering flags), backed by subagent findings, not one agent's opinion.

### 2. Debugging a flaky test

> "This test passes locally but fails in CI. Find the root cause and fix it."

**Without oh-my-openkilo:** The agent guesses, pokes at the test, runs it a few times, and ships a "fix" that papers over the symptom. No memory of similar past bugs. Same bug recurs in two weeks.

**With oh-my-openkilo:**
- **Agent:** `builder`
- **Skills:** `systematic-debugging` (reproduce → isolate → bisect; no guessing)
- **Rules:** agentmemory recall first (`has this bug been seen before?`), skill check before implementing, verification-before-completion
- **Result:** root-cause analysis with evidence (which commit/line/env variable flipped behavior), fix only after diagnosis, regression test added, save to agentmemory so the next session finds it.

### 3. New feature implementation

> "Add a new feature: [description]."

**Without oh-my-openkilo:** The agent starts coding immediately. No plan, no tests, no review. The feature works (maybe), but the architecture drifts, nothing is verified, and a security issue slips through because no one looked.

**With oh-my-openkilo:**
- **Agent:** `builder` → spawns `planner` for design, `tester` for tests, `reviewer` for security analysis when auth/data is involved
- **Skills:** `plans` (write structured plan first), `test-driven-development` (tests before implementation), `verification-before-completion` (evidence before "done")
- **Rules:** plan-file protocol for complex tasks, TDD before implementation, verify before claiming done
- **Result:** structured plan you confirm first, tests written first, evidence-backed completion, security review on the auth path.

### 4. Architecture review

> "Review this application's architecture and suggest improvements."

**Without oh-my-openkilo:** A loose opinion piece ("maybe extract this, perhaps that service is too big") with no verification against the actual code, no trade-offs discussed, and a refactor suggestion that breaks three other things.

**With oh-my-openkilo:**
- **Agent:** `planner` → delegates `explorer` (recon) + `researcher` (best practices for the stack) in parallel
- **Skills:** `codebase-design` (deep-module vocabulary, finding deepening opportunities), `plans` (write up findings)
- **Rules:** graphify-first (query the graph for actual coupling, not vibes), plan-file protocol, user confirmation loop before any implementation
- **Result:** structured review with evidence from the codebase (specific files, specific call sites), explicit trade-offs, a plan you confirm before anything is refactored.

### 5. Knowledge graph exploration

> "Explore this codebase and map the relationships between the major components."

**Without oh-my-openkilo:** Manual `grep` + reading file after file. Slow, you miss the cross-file structure, and you give up on large repos.

**With oh-my-openkilo:**
- **Agent:** `builder` (or any agent)
- **Skills:** `graphify` (knowledge graph for the codebase)
- **Rules:** graphify-first navigation (init graph with `graphify update .` if missing)
- **Result:** structural map of the codebase (`graphify query`, `graphify path`, `graphify explain`) before touching any code. Even a million-line repo is navigable.

---

## Meet the agents

8 curated agents. **Each one is a markdown file in `agents/`** that enriches a native agent with specialist protocols. Edit the prompt by editing the file. Model, variant, and permissions are configured via `opencode.json`.

The pack divides the team into **2 primary agents** (you talk to them directly) and **6 subagents** (the primaries fan out work to them in parallel). Two of OpenCode's built-in agents (`build` and `plan`) are disabled to avoid duplication; this pack's `builder` and `planner` replace them.

### At a glance

| # | Agent | Mode | Role | Tools |
|---|-------|------|------|-------|
| 01 | **`builder`** | primary | Default implementation agent. Triage → simple (do directly) or complex (delegate to `planner`). Fans out to specialists. | full |
| 02 | **`planner`** | primary | Pre-implementation design, architecture planning, writes plans. Delegates recon + research in parallel. | full |
| 03 | `designer` | subagent | UI/UX, React/Next.js, design system, accessibility. Stitch-integrated for AI mockups. | full + stitch |
| 04 | `tester` | subagent | Test suites: write, run, iterate failures in isolation, report compact results. | read, write, bash |
| 05 | `reviewer` | subagent | Code + security review of diffs vs repo standards and spec. Read-only. | read-only |
| 06 | `documenter` | subagent | Creates and improves documentation in `docs/`, verified against code. | read, write |
| 07 | `researcher` | subagent | External research with cited findings. Uses `context7` for libraries; web via `webfetch`/`websearch`. | read, web |
| 08 | `explorer` | subagent | Fast codebase scouting: mapping, pattern finding, file location. | read-only |

### Primary agents in detail

#### 01. `builder` — The Architect

The default implementation agent. You talk to this one for ordinary coding tasks. Triages the request: if it's a 1-line bug fix, do it directly; if it's a feature with architecture implications, hand the design phase to `planner` and supervise execution. Once a plan exists, `builder` fans out to specialists: `designer` for UI, `tester` for tests, `reviewer` for security, `documenter` for docs.

- **Default model:** `opencode/nemotron-3-ultra-free`
- **Use when:** any coding task, especially anything that touches more than one file
- **When to delegate instead:** pure architecture questions (use `planner`), pure research (use `researcher`), pure code reading (use `explorer`)

#### 02. `planner` — The Oracle

The pre-implementation design partner. You talk to this one before non-trivial work. Spawns `explorer`, `researcher`, `reviewer`, and `designer` in parallel to gather context, then writes a plan you confirm before any code is touched. The "think before you ship" agent.

- **Default model:** `opencode/muse-spark-1.2-contributor-free`
- **Use when:** new feature, big refactor, architecture decision, or anything where you'd otherwise waste an hour coding the wrong thing
- **When to delegate instead:** trivial fixes (use `builder`)

### Subagents in detail

#### 03. `designer` — The Frontend Specialist

UI/UX, React/Next.js, design systems, accessibility, performance. Stitch-integrated for AI-generated UI mockups before code. Falls back to text-only design feedback if the `stitch` MCP is disabled.

- **Default model:** `opencode/muse-spark-1.2-contributor-free`
- **Use when:** new screen, design exploration, brand consistency check, frontend perf audit
- **Requires:** `stitch` MCP enabled in `opencode.json` for mockup generation

#### 04. `tester` — The Quality Gate

Writes test suites, runs them, iterates failures in isolation. Reports compact results: which tests pass, which fail, which are flaky, what's the next action. Never mixes "write the feature" with "test the feature".

- **Default model:** `opencode/mimo-v2.5-free`
- **Use when:** you just wrote code that needs coverage, or a CI test is failing locally

#### 05. `reviewer` — The Diff Detective

Read-only code + security review. Compares a diff against the repo's standards and the originating spec. Catches things you missed: race conditions, missing error handling, security smells, off-by-one. Never edits.

- **Default model:** `opencode/nemotron-3-ultra-free`
- **Use when:** you finished a chunk of work and want a sanity check before merging, or you're about to touch auth/data and want a second pair of eyes

#### 06. `documenter` — The Technical Writer

Creates and improves documentation in `docs/`, verified against the actual code (not vibes). Useful for READMEs, runbooks, onboarding guides, API docs. Will not write docs that lie about what the code does.

- **Default model:** `opencode/muse-spark-1.2-contributor-free`
- **Use when:** you shipped a new module and the README is lying, or you need a how-to for a tricky setup

#### 07. `researcher` — The Investigator

External research with cited findings. Uses `context7` for fresh library docs (avoids stale training data), and `webfetch`/`websearch` for everything else. Returns links and quotes, not opinions.

- **Default model:** `opencode/hy3-free`
- **Use when:** "what's the current way to do X in framework Y", "is this library still maintained", "what does the new API look like"

#### 08. `explorer` — The Scout

Fast, broad, shallow codebase reconnaissance. Where is X defined, what calls Y, map this directory. Use this when you need orientation, not depth.

- **Default model:** `opencode/mimo-v2.5-free`
- **Use when:** first time in a repo, you need to find something fast, you want a lay of the land

> **Token-economy variant:** the `agents/` folder also contains `cavecrew-investigator`, `cavecrew-builder`, `cavecrew-reviewer` — internal caveman-compressed siblings of `explorer`/`builder`/`reviewer` that return ~60% fewer tokens. You don't call them directly; they're an optimization the runtime pulls in when context is tight. The decision guide lives in the [`cavecrew` skill](skills/cavecrew/SKILL.md) if you want to read about it.

### How to invoke

In a normal OpenCode session:

- **Let `builder` pick** the right subagent automatically (most common). Just describe the task.
- **Or be explicit:** "Ask `tester` to write tests for the auth module" / "Have `designer` generate a mockup for the dashboard" / "Use `explorer` to map this directory".

Subagents are also dispatched by `builder` and `planner` via the `task` tool, in parallel when the subtasks are independent.

### How to override the model

Every agent's `.md` file has a `model:` line in its YAML frontmatter. To switch a single agent to a paid model:

```powershell
# example: switch reviewer from free to Claude Sonnet
notepad $env:USERPROFILE\.config\opencode\agents\reviewer.md
# change: model: opencode/nemotron-3-ultra-free
# to:     model: anthropic/claude-sonnet-4-5
```

Save, then run `/reload` (or restart OpenCode). Mix-and-match: keep cheap models for commit messages and summaries, pay for high-stakes agents (architecture review, complex debugging).

> 📖 Full agent guide with all frontmatter fields, permission maps, and edit workflows: [docs/AGENTS.md](docs/AGENTS.md)

## Skills

46 skills grouped into 10 categories. Skills are prompt-based playbooks injected into an agent's context when a task matches. They run no process; just focused instructions.

| Category | Count | Examples |
|----------|-------|----------|
| core | 18 | `clean-code`, `cloudflare`, `code-review`, `codebase-design`, `documentation`, `git-commit`, `grilling`, `plans`, `ponytail-review`, `pwa-development`, `resolving-merge-conflicts`, `systematic-debugging`, `test-driven-development`, `ui-design`, `vercel-react`, `verification-before-completion`, `web-perf`, `writing-skills` |
| agentmemory | 6 | `agentmemory-agents`, `agentmemory-architecture`, `agentmemory-config`, `agentmemory-hooks`, `agentmemory-mcp-tools`, `agentmemory-rest-api` |
| caveman + cavecrew | 7 | `caveman`, `caveman-help`, `caveman-commit`, `caveman-compress`, `caveman-review`, `caveman-stats`, `cavecrew` |
| workflow & memory | 12 | `commit-context`, `commit-history`, `forget`, `handoff`, `handoff-compact`, `lesson`, `memory-discipline`, `recall`, `recap`, `remember`, `session-history`, `write-agentmemory-skill` |
| browser & stitch | 3 | `playwright-cli`, `graphify`, `stitch` |

> 📖 Full skill table: [docs/SKILLS.md](docs/SKILLS.md)

## Rules

Seven global rules loaded via `opencode.json` `instructions`. Order matters; protocol rules first.

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

Two ways, same end result. Pick whichever fits the moment.

### Option 1: from inside an OpenCode session

In any OpenCode session, type:

```
/update-pack
```

This pulls the latest commit from GitHub, then syncs each file with per-file diff and backup of any local changes you made. Files you customized get backed up as `<file>.local-<timestamp>` before being overwritten; your changes are never silently lost.

### Option 2: from the terminal (no OpenCode session required)

Same logic, but driven by a script you can run from PowerShell or bash. Useful for CI/CD, scheduled syncs, or when you just prefer terminal-based workflows.

**Windows (PowerShell):**

```powershell
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/update.ps1 | iex
```

**macOS / Linux (bash):**

```bash
curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/v0.4.0/scripts/update.sh | bash
```

Both scripts:

1. Run `git pull --ff-only origin main` in `~/.config/opencode/oh-my-openkilo/` (aborts if your local repo has diverged, with instructions to recover).
2. For each pack folder (`agents/`, `skills/`, `rules/`, `commands/`, `plugins/`) and `AGENTS.md`:
   - **Not in target** → copy it. Counted as `added`.
   - **Identical to target** → skip. Counted as `unchanged`.
   - **Differs** → back up to `<file>.local-<timestamp>`, then overwrite. Counted as `updated`.
3. Print a summary (`added / updated (with backup list) / unchanged`).
4. Remind you to restart OpenCode or run `/reload` to pick up the changes.

Flags:

| PowerShell          | Bash              | Effect                                  |
|---------------------|-------------------|-----------------------------------------|
| `-WhatIf`           | `--dry-run`       | Print actions, change nothing           |
| `-SkipGitPull`      | `--no-git-pull`   | Skip the `git pull` step                |
| `-ConfigDir <path>` | `--config-dir=…`  | Override target config dir              |
| `-RepoDir <path>`   | `--repo-dir=…`    | Override pack repo dir                  |

See [docs/COMMANDS.md](docs/COMMANDS.md#-update-pack) for the full `/update-pack` mechanics and recovery steps if `git pull` fails.

---

## Documentation

| Doc | What it covers |
|-----|----------------|
| [docs/INSTALL.md](docs/INSTALL.md) | Step-by-step install, uninstall, troubleshooting |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | What's in the repo (every folder and file explained) |
| [docs/AGENTS.md](docs/AGENTS.md) | The 8 agents (when to use each, how to edit) |
| [docs/SKILLS.md](docs/SKILLS.md) | All 46 skills grouped by category |
| [docs/RULES.md](docs/RULES.md) | The 7 global rules in detail |
| [docs/COMMANDS.md](docs/COMMANDS.md) | Command reference, `/update-pack` mechanics |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | `opencode.json` block-by-block, credential handling |

## 🖥 Compatibility

| Platform / Tool | Status |
|-----------------|--------|
| OpenCode (CLI) | ✅ Tested |
| Windows | ✅ Tested |
| macOS | ⚠️ Untested by maintainer. See below. |
| Linux | ⚠️ Untested by maintainer. See below. |
| `graphify` | Optional (degrades to plain search if missing) |
| `agentmemory` | Optional (falls back to in-session memory only if missing) |
| MCP servers | Optional. See [Required dependencies](#-required-dependencies) and [MCPs](#-mcps-enabled-per-need-not-auto-on). |

### 🍎 macOS / Linux support

**Honest disclosure:** the maintainer develops and tests this pack on Windows only. `install.sh` is provided in the repo and is structurally similar to `install.ps1`, but it has **not been exercised on a real macOS or Linux machine** by the maintainer. There may be path quoting bugs, `bash` version assumptions, or `jq`/`python` availability issues that surface only on Unix.

**If you're on macOS or Linux, the safest path is manual copy-paste.** It is guaranteed to work because there is no installer logic to fail, just file copies. From a shell:

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

oh-my-openkilo is the OpenCode adaptation of **[oh-my-kilo](https://github.com/PanPanFR/oh-my-kilo)**, a lean, curated multi-agent configuration pack for Kilo Code by the same maintainer. The "prompts in files, models in config, behavior in rules" philosophy and the agent/skill/rule layering come from that project.

The pack structure and the "config-only" sharing approach are inspired by **[oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim)** by [alvinunreal](https://github.com/alvinunreal), a lean, curated multi-agent suite for OpenCode. oh-my-openkilo adapts the philosophy (specialized agents + delegation hierarchy + skills + rules + installer) into a pure config pack, no runtime, no build step.

The **agentic workflow patterns** (primary agent triage, subagent delegation, skill-based protocol enforcement, graphify-first codebase navigation, and caveman/ponytail communication style) were developed in **[Kilo Code](https://github.com/Kilo-Org/kilocode)** (also by this maintainer, see `oh-my-kilo`). OpenCode inherits these patterns naturally, and the agents in this pack are the same mental model applied to a different runtime.

For users who want a visual control room on top of the OpenCode runtime (desktop app, browser, mobile, VS Code extension, or all four), **[OpenChamber](https://openchamber.dev/)** ([VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=FedaykinDev.openchamber), [github.com/openchamber/openchamber](https://github.com/openchamber/openchamber)) is an excellent companion. OpenChamber is an independent third-party project (publisher: `FedaykinDev` on the VS Code Marketplace), not affiliated with this pack or the OpenCode team, and it reads the same `~/.config/opencode` directory that oh-my-openkilo populates. See the "Want a friendlier UI?" section above for how the two compose.

## 🔒 Security

The pack ships **zero credentials**, only `{env:VAR}` placeholders and an opinionated permission default that you should review. See [SECURITY.md](SECURITY.md).

## Contributing

Found a bug, an install issue, or have an agent/skill suggestion? Open an issue or PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
