---
description: MANDATORY skill loading before any implementation task. Never skip skill check.
alwaysApply: true
---

# Skill Check - Every Task

Before implementing: identify task type -> load matching skill via `skill` tool -> follow its instructions. Most specific skill wins; multiple independent concerns -> load all in parallel. No task too small. If unsure -> load anyway (irrelevant skill costs nothing; skipped relevant one costs quality).

| Task involves... | Load skill |
|------------------|-----------|
| Docs, README, runbook, API docs | `documentation` |
| Tests, TDD, test strategy | `test-driven-development` |
| Module design, architecture | `codebase-design` |
| UI/UX, components, accessibility | `ui-design` |
| Code review, clean code, naming | `clean-code` |
| Page speed, Core Web Vitals | `web-perf` |
| Browser automation/E2E (high-volume, token-efficient: click, login, form, snapshot, mock, video, trace, generate Playwright tests) | `playwright-cli` skill (invoke via bash tool) |
| Browser debug/inspect (console, network, perf, live state) | `chrome-devtools` MCP |
| Browser peek, context-economy (file-based screenshot/DOM) | `chrome-devtools` MCP |
| Stateful persistent browser MCP loop, self-healing tests, exploratory | `playwright` MCP (`@playwright/mcp`) |
| Git commits, conventional commits | `git-commit` |
| PWA, service workers | `pwa-development` |
| Vercel/Next.js best practices | `vercel-react` |
| Cloudflare (Workers, D1, R2, KV, AI, DO, Wrangler, One, Email, Turnstile) | `cloudflare` |
| Over-engineering review (diff) or repo audit | `ponytail-review` |
| Plan writing or plan execution | `plans` |
| Knowledge graph queries | `graphify` |
| Debugging, bug investigation | `systematic-debugging` |
| Code review (standards + spec fidelity) | `code-review` |
| Grilling/stress-testing plans/ideas | `grilling` |
| Merge/rebase conflicts | `resolving-merge-conflicts` |
| Writing/verifying skills | `writing-skills` |
| Verification before claiming complete | `verification-before-completion` |

Browser MCP/skill choice matches this style: `playwright-cli` skill (via bash) for high-volume token-efficient automation, `chrome-devtools` MCP to see/live-debug, `playwright` MCP for stateful persistent loops.

Skill loading happens BEFORE any code is written or command is run.
