# OpenCode Global Instructions

## Always-loaded (global AGENTS.md, auto-loaded by OpenCode V2)

- Language: file contents English, Indonesian chat-only -> `rules/language.md`
- Comms/code style: Caveman + Ponytail -> `rules/communication-style.md`
- Skill check: load matching skill before implementing -> `rules/skill-reminder.md`
- Jev routing: agent/skill/subagent classification for complex decisions only -> `rules/jev-routing.md` (manual calls, no auto-plugin; obvious decisions skip Jev)

## On-demand (skills, `skill` tool when task matches)

- Memory: recall before work, save after outcomes -> `memory-discipline` (+ `recall`, `remember`, `lesson`)
- Graphify: knowledge graph before manual code browsing -> `graphify`
- Delegation: parallel subagents for independent subtasks -> `delegation`
- Workers/Cloudflare: doc-first via Context7 or `cloudflare` skill
- Structure: action-first numbered output -> `i-have-adhd` skill, auto-loaded from triage/delegation signals on multi-step work (no keyword needed, complements Caveman density)
- Decisions: structured routing via `jev-decision` (triage/verify/review/test/ui gates, no slash, fail-open)
- Routing: `-Preset route` (agent owner + needs_planner + needs_subagent), `-Preset skill-match -CandidatesJson` (LLM shortlists 2-8 skills, Jev picks), `delegation` extended with needs_subagent + context_isolation. Complex-only: obvious decisions skip Jev. Uncertain needs_subagent -> inline; uncertain needs_planner -> plan first. See `rules/jev-routing.md`.

## Jev gates (mandatory, no slash)

- Builder triage + verify (skip triage on pure read-only Q&A) + loop-breaker on repeated failure, planner delegation + verify, reviewer review gate, tester test-scope gate, designer ui gate, remember curation gate. See each agent file and skill for the exact `jev-decide.mjs -Preset` call. Script failure -> proceed with LLM judgment, never block.

## Agent workflow

- builder executes directly (simple + complex). User switches to `planner` for upfront design; planner is never Task-spawned.
- Bulk / mechanical edits: patterned or multi-file changes (>2 files, e.g. updating model across configs, batch string replacement) -> execute via single shell command / script (PowerShell, Node.js) in one step. NEVER edit file-by-file with LLM edit tool, NEVER spawn subagents for mechanical changes.
- Tool balance & RTK: use native tools (`read`, `grep`, `glob`) for fast in-process file reading and discovery. Use `shell` for Git inspection (`git log`, `git diff`, `git status`), test suites (`vitest`, `npm test`), build/compiler runs, and process logs — the global RTK plugin automatically intercepts and compresses them to save tokens.
- Parallel plans: 1 plan = 1 builder session. Branches never self-merge; integration runs via `/integrate` in the main checkout.
- Plan completion: whenever finishing a plan or implementation plan (sequential single plan or via `/integrate`), always delete the plan file (`plan/<slug>.md` or root plan file) once all steps and verifications are verified green. Never leave completed plan files in the repository.

## graphify

Knowledge graph at `graphify-out/`. For codebase questions, run `graphify query "<question>"` first (or `graphify path`/`graphify explain`) before grep/read. Only skip when the task is about stale/incorrect graph output or the user opts out. After modifying code, `graphify update .` (AST-only, no API cost).

- Wiki: if `graphify-out/wiki/index.md` exists, use it for broad navigation.
- Cross-project: `graphify query "..." --graph <global-graph-path>`. Refresh: `graphify global add <project>\graphify-out\graph.json --as <tag>`.
