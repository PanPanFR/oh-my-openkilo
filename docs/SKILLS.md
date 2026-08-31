# Skills

48 skills ship in oh-my-openkilo. Skills are prompt-based playbooks loaded into an agent's context when a task matches their description. They run no process; just focused instructions.

The npm-hosted skills (`ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help`) and the superpowers plugin skills (`brainstorming`, `using-superpowers`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `subagent-driven-development`, `receiving-code-review`, `requesting-code-review`, `finishing-a-development-branch`, `using-git-worktrees`, `orchestration`) install via the plugin system. They are not counted below; the count is `ls skills/`, the filesystem is the source of truth.

## Core (18)

| Skill                              | When it loads                                                              |
|------------------------------------|----------------------------------------------------------------------------|
| `clean-code`                       | Writing new code, reviewing PRs, refactoring legacy code                   |
| `cloudflare`                       | Any Cloudflare task: Workers, DO, Wrangler, KV, D1, R2, AI, Turnstile      |
| `code-review`                      | Reviewing a branch, PR, or work-in-progress since a fixed point            |
| `codebase-design`                  | Designing or improving a module's interface, seam placement, testability   |
| `documentation`                    | Writing README, CHANGELOG, runbooks, API docs                              |
| `git-commit`                       | User says commit, /commit, generate commit                                 |
| `grilling`                         | Stress-test a plan, decision, or idea                                      |
| `plans`                            | Multi-step task before touching code, or executing a written plan          |
| `ponytail-review`                  | Review a diff or repo for over-engineering                                 |
| `pwa-development`                  | PWA, service workers, caching strategies, offline                          |
| `resolving-merge-conflicts`        | In-progress git merge/rebase conflict                                      |
| `systematic-debugging`             | Any bug, test failure, or unexpected behavior before proposing a fix       |
| `test-driven-development`          | Any feature or bugfix, before writing implementation code                  |
| `ui-design`                        | Designing pages or UI components, colors/typography, a11y                  |
| `vercel-react`                     | Writing, reviewing, or refactoring React or Next.js code                   |
| `verification-before-completion`   | Before claiming work is complete, fixed, or passing                        |
| `web-perf`                         | Performance audits, Core Web Vitals, page speed                            |
| `writing-skills`                   | Creating new skills, editing existing skills, or verifying skills          |

## Agentmemory suite (6)

| Skill                       | When it loads                                                        |
|-----------------------------|----------------------------------------------------------------------|
| `agentmemory-agents`        | Installing agentmemory into a host agent, connect adapter issues     |
| `agentmemory-architecture`  | How memory is stored/retrieved end to end, extending the system      |
| `agentmemory-config`        | Ports, env vars, feature flags, auth                                 |
| `agentmemory-hooks`         | How observations get captured automatically, missing observations    |
| `agentmemory-mcp-tools`     | Choosing a memory MCP tool, argument details                         |
| `agentmemory-rest-api`      | Talking to the memory server over HTTP, MCP fallback                 |

## Caveman family (7)

| Skill               | When it loads                                                       |
|---------------------|---------------------------------------------------------------------|
| `caveman`           | Toggle terse mode in chat                                            |
| `caveman-commit`    | Generate commit messages in compressed conventional format           |
| `caveman-compress`  | Compress natural-language memory files (CLAUDE.md, todos, prefs)     |
| `caveman-help`      | Quick-reference card for caveman modes and commands                  |
| `caveman-review`    | Compressed PR review comments                                        |
| `caveman-stats`     | Real token usage and savings from the session log                    |
| `cavecrew`          | Delegate to cavecrew subagents to save main context                  |

## Workflow & memory (14)

| Skill                     | When it loads                                                              |
|---------------------------|----------------------------------------------------------------------------|
| `commit-context`          | "Why is this code here", history of a specific location                     |
| `commit-history`          | List agent commits with session context                                    |
| `delegation`              | Task dispatch, parallel subagents, inline-vs-delegate decisions            |
| `forget`                  | Delete specific memory observations after confirmation                     |
| `handoff`                 | "Where were we", resume the most recent session                            |
| `handoff-compact`         | Compact the current conversation into a handoff document                   |
| `lesson`                  | Save a correction as a confidence-weighted rule                            |
| `memory-discipline`       | Session loop: recall before work, save at decision points                  |
| `recall`                  | Search past observations, sessions, and learnings                          |
| `recap`                   | Summarize the last N sessions for the project                              |
| `remember`                | Save an insight or decision to long-term memory                            |
| `session-history`         | Timeline of what happened in past sessions                                 |
| `workers`                 | Cloudflare Workers code: wrangler config, bindings, limits, error 1102     |
| `write-agentmemory-skill` | House format for writing or updating agentmemory skills                    |

## Browser & stitch (3)

| Skill             | When it loads                                                                |
|-------------------|------------------------------------------------------------------------------|
| `playwright-cli`  | High-volume browser automation, E2E tests, snapshots, request mocking        |
| `graphify`        | Codebase questions, architecture exploration, file relationship queries      |
| `stitch`          | Stitch design system tasks: generation, edit, conversion, iteration loop (requires the optional stitch MCP; without it, `designer` falls back to text-only) |

## How skills are loaded

The `skill-reminder` rule (in `rules/`) makes every task check for a matching skill before starting. The agent sees the description of each available skill and loads the matching one's `SKILL.md` into context.

Skills with `references/` use progressive disclosure: `SKILL.md` is short and decision-oriented, with deep dives loaded only when relevant.

## Total count

The numbers above add to **48** skills. If the count in the repo differs, run `ls skills/` to verify; the source of truth is the filesystem, not this document.

## Editing a skill

Each skill is a folder under `skills/<skill-name>/`. The required file is `SKILL.md` (the prompt body). Optional:

- `README.md`: user-facing description
- `references/`: progressive-disclosure deep dives
- `scripts/`, `examples/`, `assets/`: skill-specific resources

After editing, copy to `~/.config/opencode/skills/` and restart OpenCode.
