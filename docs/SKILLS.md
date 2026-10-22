# Skills

48 skills ship in oh-my-openkilo. Skills are prompt-based playbooks loaded into an agent's context when a task matches their description. They run no process; just focused instructions.

External package skills are not counted here. The count is `ls skills/` minus `_shared/` (shared support notes, no `SKILL.md`); the filesystem is the source of truth.

## Core workflow (14)

| Skill | When it loads |
|-------|---------------|
| `code-review` | Reviewing a branch, PR, diff, or work-in-progress against standards and spec |
| `codebase-design` | Designing a module interface, finding deepening opportunities, choosing seams |
| `delegation` | Deciding when to dispatch subagents, run parallel work, or stay inline |
| `documentation` | Writing README, CHANGELOG, runbooks, onboarding, API, or architecture docs |
| `git-commit` | User asks to commit, mentions `/commit`, or stages changes |
| `graphify` | Questions about a codebase, architecture, file relationships, or project content |
| `grilling` | Stress-testing a plan, decision, or idea |
| `i-have-adhd` | Multi-step work or any answer that risks burying the next action |
| `jev-decision` | Torn between costly options, routing, review/test/UI gates, or loop-breaker |
| `plans` | Multi-step task before touching code, or executing a written plan |
| `playwright-cli` | Browser automation, E2E tests, scraping, snapshots, request mocking |
| `resolving-merge-conflicts` | Resolving an in-progress git merge or rebase conflict |
| `vite` | Vite config, plugins, SSR, or Vite 8 Rolldown migration |
| `vitest` | Writing tests, mocking, coverage, fixtures, or test filtering |

## Agentmemory (3)

| Skill | When it loads |
|-------|---------------|
| `agentmemory` | Installing or debugging agentmemory internals, ports, hooks, or MCP tools |
| `agentmemory-history` | Resume a session, recap recent work, trace a line, or compact for handoff |
| `agentmemory-ops` | Recall observations, save decisions, record lessons, or delete memories |

## Caveman (7)

| Skill | When it loads |
|-------|---------------|
| `caveman` | User asks for caveman mode, less tokens, brief replies, or `/caveman` |
| `caveman-commit` | Writing a commit message in compressed intent-only form |
| `caveman-compress` | Compressing a memory file or todo list into caveman format |
| `caveman-review` | Compressed code review, one line per finding |
| `caveman-stats` | Reporting recorded token usage and mode attribution |
| `megacave` | Maximum compression with the same technical payload |
| `ultracave` | Ultra-terse caveman output |

## Cloudflare (9)

| Skill | When it loads |
|-------|---------------|
| `agents-sdk` | Building, debugging, or reviewing Cloudflare Agents SDK apps |
| `cloudflare` | Choosing Cloudflare products, including K2, Basin, Email, and Next.js on Workers |
| `cloudflare-cli` | Running `cf` or Wrangler, signing in, deploying, or migrating between them |
| `cloudflare-one` | Zero Trust, SASE, Gateway, Access, WARP, or migration planning |
| `cloudflare-sandbox` | Building or migrating apps with `@cloudflare/sandbox` |
| `durable-objects` | Durable Objects state, coordination, alarms, or storage |
| `gateway-workers` | Workers invoked by Gateway HTTP policy Forward actions |
| `turnstile-spin` | Setting up, repairing, or migrating Turnstile verification |
| `workers-best-practices` | Writing, reviewing, configuring, or profiling Workers and Durable Objects |

## Frontend and UI (10)

| Skill | When it loads |
|-------|---------------|
| `awwwards` | Building an award-caliber site from a one-line brief |
| `jury` | Scoring or reviewing a live site from browser evidence |
| `impeccable` | Designing, redesigning, critiquing, auditing, or polishing a frontend interface |
| `pwa-development` | Service workers, caching strategies, offline behavior, or Workbox |
| `shadcn` | Adding, searching, fixing, or composing shadcn/ui components |
| `ui-design` | Designing pages or components, choosing type and color, reviewing UX/a11y |
| `ui-ux-pro-max` | Searching local design intelligence: styles, palettes, fonts, UX rules, stacks |
| `vercel-react` | Writing, reviewing, or refactoring React or Next.js code |
| `vite-react-best-practices` | Building, reviewing, or refactoring React SPAs on Vite |
| `web-perf` | Auditing loading and interaction performance, Core Web Vitals, Lighthouse |

## Next.js (4)

| Skill | When it loads |
|-------|---------------|
| `next-browser-initial-load-optimizer` | Slow route startup, oversized client bundles, or duplicate browser dependencies |
| `next-cache-components` | Enabling Cache Components or PPR, clearing blocking-prerender errors |
| `next-dev-loop` | Verifying Next.js runtime behavior after editing app code |
| `next-partial-prefetching` | Enabling or tuning Partial Prefetching and instant navigation |

## Multi-agent (1)

| Skill | When it loads |
|-------|---------------|
| `orchestration` | Coordinating threaded multi-agent work, task DAGs, or decision gates |

## How skills are loaded

`AGENTS.md` requires every task to check for a matching skill before implementation. The agent sees each skill's name and description, then loads the matching `SKILL.md` into context.

Skills with `references/` use progressive disclosure: `SKILL.md` is short and decision-oriented, with deep dives loaded only when relevant.

## Editing a skill

Each skill is a folder under `skills/<skill-name>/`. The required file is `SKILL.md` (the prompt body). Optional:

- `README.md`: user-facing description
- `references/`: progressive-disclosure deep dives
- `scripts/`, `examples/`, `assets/`: skill-specific resources

After editing, copy to `~/.config/opencode/skills/` and restart OpenCode.
