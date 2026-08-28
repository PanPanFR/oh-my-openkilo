# OpenCode Global Instructions

> **Lineage.** This pack is the **OpenCode adaptation of [Kilo Code](https://github.com/Kilo-Org/kilocode)'s agentic workflow**. Same primary-agent triage, same subagent delegation, same skills-as-protocols discipline, same graphify-first codebase navigation. The Kilo Code flow that runs in VS Code/JetBrains/CLI here runs against the OpenCode runtime, no plugin runtime needed.
>
> **Lighter than [oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim).** That pack is 507 files / 58.5 MB because it bundles a TypeScript build pipeline, a compiled `dist/`, and a `node_modules` tree. This pack is **configuration only**: 569 files / 2.6 MB, no build step, no npm runtime, no `dist/`. ~23× smaller. If you don't need background orchestration, AST-aware tools, or live model presets, you don't need omoslim's runtime; you need this pack's prompts.

## The Kilo Code flow

| Stage | This pack | What it does |
|-------|-----------|--------------|
| **Triage** | `builder` (Kilo's `Code` mode) | Default entry. Simple fix → do directly. Complex work → route to next stage. |
| **Design** | `planner` (Kilo's `Plan` mode) | Pre-impl architecture, writes plan files you confirm before any code is touched. |
| **Specialists** | `designer`, `tester`, `reviewer`, `documenter`, `researcher`, `explorer` | Fans out in parallel from `builder` / `planner` for focused work. |
| **Review** | `reviewer` (Kilo's `Review` mode) | Diff + security gate before merge. Read-only. |

`builder` is the default. It decides whether to do the work itself, delegate to `planner` for design, or fan out to specialists. You do not call subagents by hand unless you want to.

8 agents total: 2 primary (`builder`, `planner`) + 6 subagents. Files in `agents/*.md`. (The `cavecrew-*` agents are an internal token-economy variant of the caveman family; see the [`cavecrew` skill](skills/cavecrew/SKILL.md) if you ever hit context pressure.)

## Rules (loaded via `opencode.json: instructions`)

Global rules live in `rules/*.md` — single source of truth. This file only indexes them; do not duplicate their content here. Order matters; protocol rules first.

| Concern | Rule |
|---------|------|
| Memory | `rules/agentmemory.md` — recall before work, save after outcomes |
| Codebase nav | `rules/graphify.md` — knowledge graph before manual `grep`/`read` |
| Skill check | `rules/skill-reminder.md` — load matching skill before any implementation task |
| Delegation | `rules/delegation.md` — parallel subagents for independent subtasks |
| Language | `rules/language.md` — English-only files, chat can be any language |
| Style | `rules/communication-style.md` — Caveman (terse) replies, Ponytail (minimal) code |
| Platform | `rules/workers.md` — Cloudflare Workers doc-first (conditional, globs-based) |

Active modes: Caveman (~65% fewer output tokens), Ponytail (~54% less code bloat), AgentMemory (persistent cross-session memory), Graphify (codebase knowledge graph).

## Skills (46 total, loaded on demand)

Grouped by purpose, all files in `skills/*/SKILL.md`:

- **Core (18):** `clean-code`, `cloudflare`, `code-review`, `codebase-design`, `documentation`, `git-commit`, `grilling`, `plans`, `ponytail-review`, `pwa-development`, `resolving-merge-conflicts`, `systematic-debugging`, `test-driven-development`, `ui-design`, `vercel-react`, `verification-before-completion`, `web-perf`, `writing-skills`
- **Agentmemory (6):** `agentmemory-agents`, `agentmemory-architecture`, `agentmemory-config`, `agentmemory-hooks`, `agentmemory-mcp-tools`, `agentmemory-rest-api`
- **Caveman family (7):** `caveman`, `caveman-help`, `caveman-commit`, `caveman-compress`, `caveman-review`, `caveman-stats`, `cavecrew` (cavecrew skill = token-economy decision guide for the internal `cavecrew-*` agents)
- **Workflow & memory (12):** `commit-context`, `commit-history`, `forget`, `handoff`, `handoff-compact`, `lesson`, `memory-discipline`, `recall`, `recap`, `remember`, `session-history`, `write-agentmemory-skill`
- **Browser & stitch (3):** `playwright-cli`, `graphify`, `stitch`

Progressive disclosure: skills with `references/` only load the body unless a task needs detail. 8 skills are graphify-style (decision map + hard gates); others inline.

## Commands (9 slash)

`/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities. Files in `commands/*.md`.

## Boundaries

This file ships in the pack. It runs in every session. Treat it as the user's house rules: English-only files, mandatory memory + skill check, knowledge graph first, parallel delegation, terse + minimal style.

<!-- caveman-begin -->
Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging
- Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
- Pattern: [thing] [action] [reason]. [next step].
- Not: "Sure! I'd be happy to help you with that."
- Yes: "Bug in auth middleware. Fix:"

Switch level: /caveman lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra
Stop: "stop caveman" or "normal mode"

Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.

Boundaries: code/commits/PRs written normal.
<!-- caveman-end -->
