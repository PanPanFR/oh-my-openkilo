# OpenCode Global Instructions

Global rules live in `rules/*.md` (loaded via `instructions` in opencode.json) - single source of truth. This file only indexes them; do not duplicate their content here.

- Language: ALL file contents English; Indonesian chat-only -> `rules/language.md`
- Comms/code style: Caveman + Ponytail -> `rules/communication-style.md`
- Memory: agentmemory recall before work, save after outcomes -> `rules/agentmemory.md`
- Skills: load matching skill before implementing -> `rules/skill-reminder.md`
- Graphify: knowledge graph before manual code browsing -> `rules/graphify.md`
- Delegation: parallel subagents for independent subtasks -> `rules/delegation.md`
- Workers: Cloudflare Workers doc-first (conditional, globs-based) -> `rules/workers.md`

Active modes: Caveman (~65% fewer output tokens), Ponytail (~54% less code bloat), AgentMemory (persistent cross-session memory), Graphify (codebase knowledge graph).

Agents: 11 (builder, planner = primary; general, explore, scout, tester, reviewer, docs = subagents; cavecrew-investigator, cavecrew-builder, cavecrew-reviewer = compressed cavecrew subagents). Ported from oh-my-kilo minus debug/ask (covered by systematic-debugging skill + normal chat). See `agents/*.md`. Workflow: builder delegates complex multi-step work to planner (Task call) → planner returns plan → builder executes.

Skills: 44 total = 18 core (clean-code, cloudflare, code-review, codebase-design, documentation, git-commit, grilling, plans, ponytail-review, pwa-development, resolving-merge-conflicts, systematic-debugging, test-driven-development, ui-design, vercel-react, verification-before-completion, web-perf, writing-skills) + 6 agentmemory suite (agentmemory-agents, agentmemory-architecture, agentmemory-config, agentmemory-hooks, agentmemory-mcp-tools, agentmemory-rest-api) + 6 caveman/cavecrew (caveman, caveman-commit, caveman-compress, caveman-help, caveman-review, caveman-stats, cavecrew) + 14 workflow (brainstorming, commit-context, commit-history, forget, handoff, handoff-compact, lesson, memory-discipline, recall, recap, remember, session-history, subagent-driven-development, using-git-worktrees, using-superpowers, write-agentmemory-skill, writing-plans) + graphify/handoff. Consolidated 2026-08-26: writing-plans+executing-plans -> `plans`, ponytail-audit merged into `ponytail-review`, deleted caveman/ponytail/graphify-kilo (redundant with rules/communication-style.md and graphify).

Instructions order matters: agentmemory + graphify first (protocol rules) as configured in `opencode.json: instructions`.

Progressive disclosure: 8 skills use graphify-style SKILL.md + references/ structure (pwa-development, vercel-react, systematic-debugging, test-driven-development, ui-design, web-perf, plans, writing-skills). Core = decision map with hard gates ("MUST read reference before coding that category"); details load on demand.

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
