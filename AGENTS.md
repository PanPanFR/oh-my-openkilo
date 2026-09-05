# OpenCode Global Instructions

## Always-loaded (via `instructions` in opencode.json)

Single source of truth. This file only indexes them; do not duplicate content here.

- Language: ALL file contents English; Indonesian chat-only -> `rules/language.md`
- Comms/code style: Caveman + Ponytail -> `rules/communication-style.md`
- Skill check: load matching skill before implementing -> `rules/skill-reminder.md` (also routes agentmemory recall + graphify + delegation to on-demand skills)

## On-demand (skills, loaded via `skill` tool when task matches)

- Memory: recall before work, save after outcomes -> `memory-discipline` (+ `recall`, `remember`, `lesson`)
- Graphify: knowledge graph before manual code browsing -> `graphify`
- Delegation: parallel subagents for independent subtasks -> `delegation` (skills/delegation/)
- Workers: Cloudflare Workers doc-first -> `workers` (skills/workers/)

## Superseded by skills (deleted 2026-08-30)

`rules/agentmemory.md`, `rules/graphify.md`, `rules/delegation.md`, `rules/workers.md`

Active modes: Caveman (~65% fewer output tokens), Ponytail (~54% less code bloat), AgentMemory (persistent cross-session memory), Graphify (codebase knowledge graph).

Agents: 6 (builder, planner = primary; designer, tester, reviewer, documenter = subagents). See `agents/*.md`. Workflow: builder executes directly (simple + complex); user switches to `planner` agent directly for upfront design. Planner is never Task-spawned.

Skills: 46 total = 18 core (clean-code, cloudflare, code-review, codebase-design, documentation, git-commit, grilling, plans, ponytail-review, pwa-development, resolving-merge-conflicts, systematic-debugging, test-driven-development, ui-design, vercel-react, verification-before-completion, web-perf, writing-skills) + 6 agentmemory suite (agentmemory-agents, agentmemory-architecture, agentmemory-config, agentmemory-hooks, agentmemory-mcp-tools, agentmemory-rest-api) + 6 caveman (caveman, caveman-commit, caveman-compress, caveman-help, caveman-review, caveman-stats) + 15 workflow (brainstorming, commit-context, commit-history, delegation, forget, handoff, handoff-compact, lesson, memory-discipline, recall, recap, remember, session-history, subagent-driven-development, using-git-worktrees, using-superpowers, write-agentmemory-skill, writing-plans) + 2 infrastructure (graphify, workers). Consolidated 2026-08-30: rules/agentmemory.md, rules/graphify.md, rules/delegation.md, rules/workers.md moved on-demand (agentmemory+graphify covered by existing skills, delegation+workers became skills). Earlier: writing-plans+executing-plans -> `plans`, ponytail-audit merged into `ponytail-review`.

Instructions order: skill-reminder first (routes all on-demand loading) as configured in `opencode.json: instructions`.

Progressive disclosure: 8 skills use graphify-style SKILL.md + references/ structure (pwa-development, vercel-react, systematic-debugging, test-driven-development, ui-design, web-perf, plans, writing-skills). Core = decision map with hard gates ("MUST read reference before coding that category"); details load on demand.

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
