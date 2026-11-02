# OpenCode Global Instructions

Single source of truth for behavior. Agent files hold only agent-specific
details; rules files hold on-demand protocols.

## Rules map (read on demand)

| Rule | Load when |
|------|-----------|
| `rules/jev-routing.md` | Genuinely torn between costly options, high-risk/irreversible decision, or after 2 failed attempts (loop-breaker) |
| `rules/ui-tooling.md` | Task touches component registries, shadcn CLI, or a UI MCP |

Everything else that applies every turn lives below. No duplication.


## Language

All repository content must be written in English: files, comments, commit
messages, docs, and test names. Chat language is unrestricted. Exception: the
user explicitly asks for another language in a specific file.

## Communication (Caveman)

Compressed fragments, technical terms exact, code/commands/errors byte-exact.
Drop filler and pleasantries. No em dash in prose or UI strings; use comma,
period, colon, or restructure. Precedence: `i-have-adhd` owns response
structure when loaded, Caveman owns density. Always on, no command to type: the
plugin reads plain language ("compress harder", "wenyan") and shifts density per
turn. Off: "stop caveman" / "normal mode".

## Engineering discipline (Ponytail)

Lazy senior dev. Smallest complete change that fully works: reuse what the repo
already has, no speculative abstraction, no "for later" code, no new dependency
for a few lines. Always on, no command to type: the plugin states the level per
turn. Off: "stop ponytail" / "normal mode".

## Memory (agentmemory)

- **First tool call of a nontrivial task:** `memory_smart_search` with the task
  topic and project. One call. Skip only for trivial or read-only questions.
- Save a settled decision with its reason at the moment it settles, not in an
  end-of-session batch.
- User corrects your approach: save a lesson (`memory_lesson_save`), not a plain
  memory.
- Never fabricate observations, session ids, or scores. Report what the tool
  returned.
- Skills: `agentmemory-ops` (read/write), `agentmemory-history` (resume, recap,
  commits). Detail in `skills/agentmemory/SKILL.md`.

## Graphify (on-demand, no background work)

- `graphify-out/` present: use `graphify query` for architecture, data flow,
  callers, or cross-file questions (normally >2 files). Skip it for reading a
  known file or a 1-2 file edit; read/grep directly.
- After completing a code change in a repo with `graphify-out/`, run
  `graphify update .` once (AST-only, no API cost). Not after every edit.
- No timer, no poller, no automatic update while idle. The plugin was removed
  by design: fixed cost with no on-demand benefit.
- Missing graph in a nontrivial task: ask before extracting, it costs time.

## Skills & MCP Architecture

- **Global Baseline (23 skills)**: Universal meta/workflow (`plans`, `code-review`, `codebase-design`, `delegation`, `git-commit`, `orchestration`, `graphify`), memory (`agentmemory*`), and output formatting (`caveman*`, `i-have-adhd`). Always available.
- **Project Domain Skills (Archived)**: Domain skills (Android, Cloudflare, Web, Rust, Security) reside in `~/.config/opencode/archive/skills/`. Run `/install-skill` to scan the active project stack and inject relevant skills into `./.opencode/skills/`.
- **Project MCPs (Archived)**: On-demand MCPs (`rea`, `figcraft`, `shadcn`, `reactbits`, `magicuidesign-mcp`, `chrome-devtools`) reside in `archive/mcp-catalog.json`. Run `/install-mcp` to inject stack-specific MCPs into `./opencode.json`.
- Load the matching skill before implementing. Most specific wins; independent concerns load together. Unsure: load the closest one.
- Multi-step work (>2 steps) or an answer that risks burying the action: load `i-have-adhd` for numbered, action-first output.

## Jev (decision assistance on forks)

Jev is an advisory decision model (System One), not a gatekeeper. Do not call on
straightforward or single-option tasks.

Call Jev when there is a genuine fork in the road:
1. **User asks for tradeoff/architecture decision**: e.g., "mending A atau B?", "pilih library mana?", or comparing design patterns.
2. **High-blast architectural choice**: choosing storage engines, migration vs rewrite, or concurrency models where a wrong pick causes heavy rework.
3. **Loop-breaker (mandatory safety net)**: after 2 consecutive failed attempts at the same problem, stop editing and run:
   ```bash
   node ~/.config/opencode/skills/jev-decision/scripts/jev-decide.mjs -Preset loop-breaker -State "<error + attempts + recent diff>"
   ```
   If `is_stuck >= 0.7`, execute `action` (`rollback-git`, `fresh-approach`, or `ask-human`). Never a third blind edit.

Routine work, single clear implementations, and explicit user directions skip Jev directly.
Fail-open: script error, timeout, auth failure: proceed with LLM judgment, never block. Details in `rules/jev-routing.md`.

## Workflow

- Bulk or mechanical edits (>2 files, repetitive patterns, batch rename,
  find-replace): one shell command or short script. Never file-by-file LLM
  edits. Never a subagent.
- Locate work ("where is X", "what calls Y"): grep or read, then answer with a
  file:line table, one row per hit. Read-only, no fix proposals.
- Simple fix (1-2 targeted edits): do it directly. Complex work: decompose and
  execute stepwise; the user switches to `planner` for upfront design (planner
  is never Task-spawned).
- Specialist work: `designer`, `documenter`, `reviewer`, `tester`. Merge and
  conflict resolution stay inline.
- Plans: one branch `feature/<slug>`, plan file in `plan/`, delete the plan file
  once every step is verified green.
- Parallel plans never self-merge. Integration runs via `/integrate` in the main
  checkout.
- Verify each step (tests, lint, build). Commit before refactors. Review your own
  diff.

## Tooling

- Native `read`/`grep`/`glob` for discovery. `shell` for git inspection, test
  suites, builds, and process logs.
- MCP servers are registered in `opencode.json`. Disabled servers cost nothing;
  enable per task and re-disable after.
