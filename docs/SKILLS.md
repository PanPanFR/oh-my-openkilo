# Skills

22 global baseline skills ship in `skills/` plus `_shared/` support notes. Skills are prompt-based playbooks loaded into an agent's context when a task matches their description. They run no process; just focused instructions.

External package skills are not counted here. The count is `ls skills/` minus `_shared/`; the filesystem is the source of truth.

Domain skills (Android, Cloudflare, Web, Rust, Security — 93 skills) plus on-demand MCPs live in the separate `archive/` vault and are injected into a project with `/install-skill` / `/install-mcp`. They are not part of the pack's always-on skill count.

## Workflow & Architecture (12)

| Skill | When it loads |
|---|---|
| `code-review` | Reviewing a branch, PR, diff, or work-in-progress against standards and spec |
| `codebase-design` | Designing a module interface, finding deepening opportunities, choosing seams |
| `delegation` | Deciding when to dispatch subagents, run parallel work, or stay inline |
| `documentation` | Writing README, CHANGELOG, runbooks, onboarding, API, or architecture docs |
| `git-commit` | User asks to commit, mentions `/commit`, or stages changes |
| `graphify` | Questions about a codebase, architecture, file relationships, or project content |
| `grilling` | Stress-testing a plan, decision, or idea |
| `i-have-adhd` | Multi-step work or any answer that risks burying the next action |
| `jev-decision` | Torn between costly options, routing, review/test/UI gates, or loop-breaker |
| `orchestration` | Coordinating threaded multi-agent work, task DAGs, or decision gates |
| `plans` | Multi-step task before touching code, or executing a written plan |
| `resolving-merge-conflicts` | Resolving an in-progress git merge or rebase conflict |

## Memory (3)

| Skill | When it loads |
|---|---|
| `agentmemory` | Installing or debugging agentmemory internals, ports, hooks, or MCP tools |
| `agentmemory-history` | Resume a session, recap recent work, trace a line, or compact for handoff |
| `agentmemory-ops` | Recall observations, save decisions, record lessons, or delete memories |

## Caveman (7)

| Skill | When it loads |
|---|---|
| `caveman` | User asks for caveman mode, less tokens, brief replies, or `/caveman` |
| `caveman-commit` | Writing a commit message in compressed intent-only form |
| `caveman-compress` | Compressing a memory file or todo list into caveman format |
| `caveman-review` | Compressed code review, one line per finding |
| `caveman-stats` | Reporting recorded token usage and mode attribution |
| `megacave` | Maximum compression with the same technical payload |
| `ultracave` | Ultra-terse caveman output |

## How skills are loaded

`AGENTS.md` requires every task to check for a matching skill before implementation. The agent sees each skill's name and description, then loads the matching `SKILL.md` into context.

Skills with `references/` use progressive disclosure: `SKILL.md` is short and decision-oriented, with deep dives loaded only when relevant.

## Editing a skill

Each skill is a folder under `skills/<skill-name>/`. The required file is `SKILL.md` (the prompt body). Optional: `README.md`, `references/`, `scripts/`, `examples/`, `assets/`.

After editing, copy to `~/.config/opencode/skills/` and restart OpenCode.
