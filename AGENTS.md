# OpenCode Global Instructions

## Always-loaded (global AGENTS.md, auto-loaded by OpenCode)

Single source of truth. This file only indexes them; do not duplicate content here.

- Language: ALL file contents English; Indonesian chat-only -> `rules/language.md`
- Comms/code style: Caveman + Ponytail -> `rules/communication-style.md`
- Skill check: load matching skill before implementing -> `rules/skill-reminder.md` (also routes agentmemory recall + graphify + delegation to on-demand skills)

## On-demand (skills, loaded via `skill` tool when task matches)

- Memory: recall before work, save after outcomes -> `memory-discipline` (+ `recall`, `remember`, `lesson`)
- Graphify: knowledge graph before manual code browsing -> `graphify`
- Delegation: parallel subagents for independent subtasks -> `delegation` (skills/delegation/)
- Cloudflare/Workers: doc-first via Context7 or `cloudflare` skill (skills/cloudflare/)
- Structure: action-first numbered output -> `i-have-adhd` skill, auto-loaded from triage/delegation signals on multi-step work
- Decisions: structured routing via `jev-decision` (triage/verify/review/test/ui gates, no slash, fail-open)

## Jev gates (mandatory, no slash)

- Builder triage + verify, planner delegation + verify, reviewer review gate, tester test-scope gate, designer ui gate. See each agent file for the exact `jev-decide.ps1 -Preset` call. Script failure -> proceed with LLM judgment, never block.

## Superseded by skills (deleted 2026-08-30)

`rules/agentmemory.md`, `rules/graphify.md`, `rules/delegation.md`, `rules/workers.md`

Active modes: Caveman (~65% fewer output tokens), Ponytail (~54% less code bloat), AgentMemory (persistent cross-session memory), Graphify (codebase knowledge graph).

Agents: 6 (builder, planner = primary; designer, tester, reviewer, documenter = subagents). Architecture: OPENKILO_ARCHITECTURE.md. Workflow: builder executes directly (simple + complex); user switches to `planner` agent directly for upfront design. Planner is never Task-spawned. Bulk/mechanical edits go via single shell script, never file-by-file or via subagents. Tool balance & RTK: native tools (`read`, `grep`, `glob`) for fast in-process reading, `shell` for Git inspection and test/build runs (compressed by RTK plugin). Parallel plans: 1 plan = 1 builder session; branches never merge themselves; integration runs via `/integrate` command in the main checkout.

Skills: 53 total = 25 core (antislop, clean-code, cloudflare, code-review, codebase-design, documentation, git-commit, grilling, impeccable, plans, ponytail-review, pwa-development, resolving-merge-conflicts, shadcn, systematic-debugging, test-driven-development, ui-design, ui-ux-pro-max, vercel-react, verification-before-completion, vite, vitest, web-design-guidelines, web-perf, writing-skills) + 7 agentmemory suite (agentmemory, agentmemory-agents, agentmemory-architecture, agentmemory-config, agentmemory-hooks, agentmemory-mcp-tools, agentmemory-rest-api) + 4 caveman (caveman, caveman-compress, caveman-help, caveman-stats) + 15 workflow & memory (commit-context, commit-history, delegation, forget, handoff, handoff-compact, i-have-adhd, jev-decision, lesson, memory-discipline, recall, recap, remember, session-history, write-agentmemory-skill) + 2 browser (playwright-cli, graphify). Skills provided by npm or the superpowers plugin load at runtime but are not counted; the count is `ls skills/`. Consolidated 2026-09-23: eliminated redundant skills (workers -> cloudflare, frontend-design -> ui-design, caveman-commit -> git-commit, caveman-review -> code-review). Added jev-decision, i-have-adhd, agentmemory index. Earlier: writing-plans+executing-plans -> `plans`, ponytail-audit merged into `ponytail-review`. Impeccable added 2026-09-08; 6 engineering & design skills added 2026-09-20; shadcn skill added 2026-09-22.

Instructions order: skill-reminder first (routes all on-demand loading) as listed in this AGENTS.md. (OpenCode V2 ignores the `instructions` config key; the global AGENTS.md auto-loads.)

Progressive disclosure: 11 skills use graphify-style SKILL.md + references/ structure (pwa-development, vercel-react, systematic-debugging, test-driven-development, ui-design, ui-ux-pro-max, vite, vitest, web-perf, plans, writing-skills). Core = decision map with hard gates ("MUST read reference before coding that category"); details load on demand.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Cross-project questions: `graphify query "..." --graph <global-graph-path>` (optional; register other graphs with `graphify global add <project>\graphify-out\graph.json --as <tag>`).
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
