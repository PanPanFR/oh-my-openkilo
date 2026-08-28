# Skills

46 skills ship in oh-my-openkilo. Skills are prompt-based playbooks loaded into an agent's context when a task matches their description. They run no process — just focused instructions.

## Categories

### Core development (8)

| Skill                              | When it loads                                                              |
|------------------------------------|----------------------------------------------------------------------------|
| `clean-code`                       | Writing new code, reviewing PRs, refactoring legacy code                   |
| `code-review`                      | Reviewing a branch, PR, or work-in-progress since a fixed point            |
| `documentation`                    | Writing README, CHANGELOG, runbooks, API docs                              |
| `git-commit`                       | User says commit, /commit, generate commit                                 |
| `systematic-debugging`             | Any bug, test failure, or unexpected behavior before proposing a fix       |
| `test-driven-development`          | Any feature or bugfix, before writing implementation code                  |
| `verification-before-completion`   | Before claiming work is complete, fixed, or passing                        |
| `writing-skills`                   | Creating new skills, editing existing skills, or verifying skills          |

### Planning & design (5)

| Skill              | When it loads                                                                  |
|--------------------|--------------------------------------------------------------------------------|
| `codebase-design`  | Designing or improving a module's interface, finding deepening opportunities   |
| `plans`            | Multi-step task before touching code, or executing a written plan              |
| `grilling`         | Stress-test a plan, decision, or idea                                          |
| `handoff`          | Resume the most recent agent session for the current working directory         |
| `resolving-merge-conflicts` | In-progress git merge/rebase conflict                                  |

### Over-engineering audits (3)

| Skill                | When it loads                                                        |
|----------------------|----------------------------------------------------------------------|
| `ponytail`           | Any coding task — write, add, refactor, fix, review, design, choose deps |
| `ponytail-review`    | Review for over-engineering on a diff                                 |
| `ponytail-audit`     | Whole-repo audit for over-engineering                                 |

### Communication & config (4)

| Skill          | When it loads                                                                                  |
|----------------|------------------------------------------------------------------------------------------------|
| `caveman`      | User says "caveman mode" or asks for terse output                                               |
| `graphify`     | Codebase questions, architecture exploration, file relationship queries                        |
| `ponytail`     | (also a communication philosophy — see above)                                                   |
| `ponytail-debt`| User asks about ponytail deferrals or "what did we mark to do later"                            |

### Workflow & git (4)

| Skill                              | When it loads                                                              |
|------------------------------------|----------------------------------------------------------------------------|
| `commit-context`                   | User asks "why is this code here" or wants history of a specific location  |
| `commit-history`                   | User asks "show agent commits" or "what has the agent shipped"             |
| `recall`                           | User says "recall", "what did we do about", "did we ever", "have we seen"  |
| `remember`                         | User says "remember this", "save this", "note that", "don't forget"        |
| `recap`                            | User asks "recap", "what have we been doing", "today", "this week"         |
| `lesson`                           | User corrects approach, says "learn this", "always" or "never do X"        |
| `session-history`                  | User asks "what did we do last time", "session history", "past sessions"  |
| `forget`                           | User says "forget this", "delete memory", "remove that note"              |

### UI & performance (4)

| Skill                | When it loads                                                              |
|----------------------|----------------------------------------------------------------------------|
| `ui-design`          | Designing pages or UI components, choosing colors/typography               |
| `vercel-react`       | Writing, reviewing, or refactoring React or Next.js code                   |
| `web-perf`           | Performance audits, Core Web Vitals, page speed optimization              |
| `pwa-development`    | PWA, service workers, caching strategies, offline                          |

### Platform (1)

| Skill        | When it loads                                                |
|--------------|--------------------------------------------------------------|
| `cloudflare` | Any Cloudflare task — Workers, DO, Wrangler, KV, D1, R2, AI  |

### Browser & testing (2)

| Skill             | When it loads                                                                |
|-------------------|------------------------------------------------------------------------------|
| `playwright-cli`  | High-volume browser automation, E2E tests, snapshots, request mocking        |
| `chrome-devtools` | Live browser debug/inspect (console, network, perf, live state)              |

### Stitch / design tooling (1)

| Skill     | When it loads                                                                |
|-----------|------------------------------------------------------------------------------|
| `stitch`  | Any Stitch design system task — generation, edit, conversion, iteration loop |

### Caveman family (6)

The caveman/ponytail communication philosophy is implemented as a family of skills for various surfaces:

| Skill               | When it loads                                                       |
|---------------------|---------------------------------------------------------------------|
| `caveman`           | Toggle terse mode in chat                                            |
| `caveman-help`      | User says /caveman-help                                              |
| `caveman-commit`    | User says commit, /commit, generate commit                           |
| `caveman-compress`  | Compress natural-language memory files (CLAUDE.md, todos, prefs)     |
| `caveman-review`    | Review a PR, /review, "review the diff"                              |
| `caveman-stats`     | Show real token usage and estimated savings                          |

### Cavecrew (1)

| Skill      | When it loads                                                                          |
|------------|----------------------------------------------------------------------------------------|
| `cavecrew` | Delegate to cavecrew subagents to save main context (60% fewer tokens in tool result)  |

### Meta (3)

| Skill                    | When it loads                                              |
|--------------------------|------------------------------------------------------------|
| `using-superpowers`      | Starting any conversation                                  |
| `subagent-driven-development` | Executing implementation plans with independent tasks  |
| `dispatching-parallel-agents` | Facing 2+ independent tasks without shared state      |

## How skills are loaded

The `skill-reminder` rule (in `rules/`) makes every task check for a matching skill before starting. The agent sees the description of each available skill and loads the matching one's `SKILL.md` into context.

Skills with `references/` use progressive disclosure: `SKILL.md` is short and decision-oriented, with deep dives loaded only when relevant.

## Total count

The numbers above add to **46** skills. If the count in the repo differs, run `ls skills/` to verify — the source of truth is the filesystem, not this document.

## Editing a skill

Each skill is a folder under `skills/<skill-name>/`. The required file is `SKILL.md` (the prompt body). Optional:

- `README.md` — user-facing description
- `references/` — progressive-disclosure deep dives
- `scripts/`, `examples/`, `assets/` — skill-specific resources

After editing, copy to `~/.config/opencode/skills/` and restart OpenCode.
