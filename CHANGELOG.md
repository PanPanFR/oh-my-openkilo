# v0.12.0 (2026-09-23)

## Added
- **Jev decision framework** (`skills/jev-decision/`): fast calibrated decision gates via bring-your-own System One endpoint (default model `openrouter/typesafe/jev-1.13`, endpoint + key user-supplied - see `skills/jev-decision/SKILL.md` Setup). Integrated across agents:
  - `builder`: triage auto-route (`-Preset triage`) + verify gate (`-Preset verify`).
  - `planner`: delegation check (`-Preset delegation`) + verify gate before finalizing plans.
  - `reviewer`: review gate (`-Preset review`: spec match, security risk, merge ready).
  - `tester`: test-scope gate (`-Preset test`: unit, integration, e2e, all).
  - `designer`: UI gate (`-Preset ui`: complexity and designer requirement).
- **ADHD output structure** (`skills/i-have-adhd/`, `/i-have-adhd` command): action-first numbered steps, turn-by-turn state restatement, tangent suppression, visible progress. Complementary to Caveman: ADHD owns structure, Caveman owns density.
- **Context7 live docs routing**: official library documentation and version-grounded API resolution via Context7 MCP (`tools["context7"]`). Permissions allowed in `builder`, `planner`, `documenter`, and `reviewer`.
- **Agentmemory index router** (`skills/agentmemory/`): entry point routing between the 6 agentmemory reference skills.

## Changed
- **Jev runtime modernized**: replaced PowerShell script with native Node.js ESM wrapper (`jev-decide.mjs`, ~3.5x faster startup, zero shell escaping issues, stdin piping support, generic provider resolution). Added `recon` category to triage preset for non-code inspection/Q&A, bypass triage on pure read-only chat, and calibrated gate thresholds to per-dimension probabilities.
- **Redundancy elimination & skill consolidation** (54 → 53 skills):
  - `workers` eliminated → fully covered by unified `cloudflare` platform skill.
  - `frontend-design` eliminated → absorbed into `ui-design` (carries full 2-pass Anthropic taste and delivery gate).
  - `caveman-commit` eliminated → absorbed into `git-commit` (terse Conventional Commits format, ≤50 char subject).
  - `caveman-review` eliminated → absorbed into `code-review` (concise `<file>:<line>: <severity> <problem>. <fix>.` findings).
- **Tool balance & RTK guidelines**: `AGENTS.md` establishes fast native tools (`read`, `grep`, `glob`) for file inspection, reserving `shell` for Git and test/build runs compressed by RTK.
- **`skills/plans` synchronized**: plan paths updated to root `plan/<slug>.md`, branch convention aligned to `feature/<slug>`, execution aligned with `/integrate` session, mode announcement noise removed.
- **`skills/web-design-guidelines`**: prioritized local offline Vercel guidelines reference (`skills/ui-design/references/web-interface-guidelines.md`) with webfetch fallback.

## Fixed
- **Graphify plugin shell support** (`plugins/graphify.ts`): hook checks for `shell` tool alongside `bash` so reminder hooks fire on Windows.
- **Designer MCP permissions** (`agents/designer.md`): added `magicuidesign-mcp_*` matching server ID, added `antislop` to skill list.
- **Agent skill linkages**: `reviewer` linked to `code-review`, `documenter` linked to `documentation`.
- **Command frontmatters**: added standard `description` headers to `recall.md`, `remember.md`, `update-pack.md`.

# v0.11.5 (2026-09-22)

## Added
- **ReactBits MCP (opt-in, off by default)**: `reactbits` entry (`npx -y reactbits-dev-mcp-server`, community server for 135+ animated components) in `examples/opencode.example.json`, plus a `docs/CONFIGURATION.md` subsection. Enable by removing `"disabled": true`; optional `GITHUB_TOKEN` raises GitHub API rate limits.
- **UI component tooling router**: new `rules/ui-tooling.md` (shadcn CLI vs MCP decision map, cost principle, designer workflow, MCP enable protocol), wired into `agents/designer.md` (shadcn skill + `shadcn_*`/`reactbits_*`/`magicuidesign*` tool allows) and `rules/skill-reminder.md` routing.
- **shadcn skill (global)**: official `shadcn-ui/ui` skill mirrored to `skills/` (54 total, 26 core). Designer loads it for component rules and CLI workflow.

## Fixed
- **Planner shell permissions**: allow all shell commands (`resource: "*"`, `effect: allow`). Prevents `Permission denied: shell` errors when planner runs git commands or codebase recon beyond the previously narrow whitelist.
- **RTK on Windows**: documented that `rtk ls`/`tree`/`find` need Git's `usr\bin` on the user PATH (`docs/CONFIGURATION.md`, `plugins/rtk.ts` header). PowerShell's `ls` is an alias invisible to rtk's native resolver; without it every rewritten `ls` fails with `Failed to resolve 'ls' via PATH`.
- **Stale skill counts in README**: three leftover "47" references (intro, features, overview table) corrected to 54. Missed by the v0.11.0 resync.

# v0.11.0 (2026-09-20)

## Added
- **6 engineering & design skills**: `antislop`, `frontend-design`, `ui-ux-pro-max`, `vite`, `vitest`, `web-design-guidelines` (pack skills 47 → 53; core 19 → 25).
- **Design intelligence engine** (`skills/ui-ux-pro-max/`): searchable local catalog with 79 styles, 192 product palettes, 119 UX guidelines, and 22 framework stacks via `python3.11 skills/ui-ux-pro-max/scripts/search.py`.
- **Two-pass design workflow** (`skills/frontend-design/`): intentional aesthetic point-of-view, token system planning, and explicit AI cliché elimination checklist.
- **Negative design filter** (`skills/antislop/`): 3 dials (Energy, Rhythm, Motion) and anti-slop Delivery Gate before shipping UI.
- **Web interface standards** (`skills/web-design-guidelines/`): code-level Vercel standard compliance for forms, a11y, hydration, and animations.
- **Vite & Vitest playbooks** (`skills/vite/`, `skills/vitest/`): Vite 8 Rolldown migration, SSR, and deterministic Vitest unit/integration testing patterns.
- **Anti-slop copywriting rules**: `rules/communication-style.md` bans AI buzzwords (*unlock, elevate, tapestry*), significance inflation, unsourced metrics, and conversational filler.

## Changed
- **`ui-design` deepened**: integrated with `ui-ux-pro-max` search engine, 2-pass design discipline, and progressive-disclosure references (`references/pro-rules.md`, `references/quick-reference.md`, `references/web-interface-guidelines.md`).
- **`clean-code` updated**: added AI comment slop elimination rules (no decorative borders, workflow narration, signature echoing, or empty labels).
- **Subagent skill loadouts**:
  - `designer`: gains `ui-ux-pro-max`, `frontend-design`, `web-design-guidelines`, `vite`, and 2-pass workflow.
  - `reviewer`: gains `web-design-guidelines` for UI code reviews.
  - `tester`: gains `vitest` for Vite-native test suites and vi mocking.
- **`rules/skill-reminder.md`**: updated UI routing to pair `ui-design` with `antislop` filter and Delivery Gate verification.

## Docs
- **All documentation resynced**: `README.md`, `AGENTS.md`, `docs/SKILLS.md`, `docs/STRUCTURE.md`, `CONTRIBUTING.md` updated to 53 skills.

# v0.10.4 (2026-09-20)

## Changed
- **Bulk edits in one shot**: builder, planner, ponytail rule, and AGENTS.md route multi-file mechanical work through a single shell script. 1 tool round-trip instead of 1 per file.
- **V2 config shape**: agent frontmatter drops ignored V1 keys for the V2 `permissions` allowlist; example config rewritten around it. V1 `instructions` key gone.
- **Tighter agent permissions**: consistent minimal blocks plus an explicit reasoning level per role (`builder`/`planner` max). ~100-200 fewer tokens per subagent spawn.
- **Caveman loads on v2**: missing `plugins/caveman.ts` loader shim included.
- **Example without ponytail**: npm entry removed (style lives in the rules file). ~400-600 tokens saved per turn.
- **8 commands, was 12**: `/caveman-help/review/stats/compress` folded into `/caveman` subcommands. ~50 fewer prompt tokens per turn. `/caveman-commit` stays.

## Removed
- **Private servers**: last private-server references gone from planner permissions and docs.

## Fixed
- **Stale MCP docs**: wrong skill name fixed, V1 wording replaced with the V2 `disabled` shape.

## Docs
- **Token figures**: every optimization entry now states its saving (measured, or ~ estimated).
- **Browser off-switch**: CONFIGURATION.md shows how to disable `chrome-devtools` (~1-2k tokens back per session) and use `playwright-cli` for heavy automation instead.

# v0.9.0 (2026-09-19)

## Changed
- **Runs on opencode 1.x and 2.x**: all 5 plugins load on both; same behavior (2 tiny v2 extras stay quiet). Agents and commands untouched.

## Docs
- **CONFIGURATION.md**: notes supported versions.

# v0.8.8 (2026-09-17)

## Added
- **RTK plugin** (`plugins/rtk.ts`): rewrites bash commands to compact form automatically, fail-open. Roughly half the raw bytes on typical git/diff/log output.
- **ADHD precedence rule**: one line in `communication-style.md` (structure wins, density stays).

## Removed
- **Dead plugins**: `checkpoint.ts`, `prompt-polish.ts` (unlisted, unloaded).

## Changed
- **Per-role reasoning**: `builder`/`planner` stay max, rest dialed down. ~30-70% fewer thinking tokens on routine subagent calls.
- **Leaner memory prefill**: stash 20 to 10, enrich 10 to 5, slices 8000 to 6000. ~25-50% less injected context per turn. No behavior change.

## Docs
- Reasoning map documented (README, AGENTS.md, STRUCTURE.md) with tune/revert notes.

# v0.8.5 (2026-09-13)

## Changed
- **One free default model** (`opencode/muse-spark-1.3-contributor-free`) across all 6 agents, plus a refresh pass over agents, two commands, two rules, and one skill.

## Docs
- **README rewritten for beginners**: copy-paste start, 2-agent intro, first tasks. Jargon moved to docs/.

# v0.8.3 (2026-09-09)

## Changed
- **Free models by default** (`opencode/*-free`), zero credentials needed. Model line is the one deliberate divergence for personal installs.
- **No more worktrees-per-session**: 1 plan = 1 branch, integration via `/integrate`. Planner gains `graphify` shell scope.

## Fixes
- **Planner gets MCP tools** (`chrome-devtools`, `agentmemory`, `perplexity`, deny-all rest).
- **Docs resynced**: counts corrected everywhere (6 agents / 47 skills / 3 rules / 6 plugins / 12 commands).

# v0.8.0 (2026-09-08)

## Features
- **Impeccable skill** (UI review/polish) + `/impeccable` and `/integrate` commands.
- **Parallel plans**: 1 plan = 1 branch = 1 worktree, never self-merge.

# v0.7.0 (2026-09-05)

## Features
- **Roster 7 → 6**: dropped `integrator`, builder lands branches (~1k tokens lighter per session).
- **Simpler planner**: one self-contained plan per workstream, never Task-spawned.

# v0.6.0 (2026-09-04)

## Features
- **Roster 8 → 7**: dropped `explorer`/`researcher` for inline `graphify query` recon (~2k tokens lighter). Added `integrator`.
- **Planner workflow**: self-contained `plan/` files with delegation strategy.
- **Prompt plugins**: `prompt-polish` toast + opt-in `pp` rewrite (off by default).
- **Scoping**: designer/tester decline trivial work; delegation skill updated.

## Docs
- Counts to 7 agents everywhere; semantic versioning policy in CONTRIBUTING.md.

# v0.5.2 (2026-09-01)

## Features
- **Self-contained `/update-pack`**: hardcoded URL, direct git, per-file backup. Safety contract included.
- **Checkpoint + recall-first**: auto-save edits locally; first edit per session needs a memory recall (fail-open).
- **Configcheck warns on npx MCPs** (re-download trap); install flow leads with required deps.

## Fixes
- **Repo + commands only**: install/update shell scripts dropped. Roster trimmed to 8 agents / 46 skills; graphify renamed `.js` to `.ts`.

## Docs
- Flat `vX.Y.Z (date)` headers; INSTALL "after install" reordered.

# v0.4.0 (2026-08-28)

## Features
- **Scaffold**: MIT license, README, INSTALL, reference docs per folder, zero-credential SECURITY promise.
- **7 rules → 3**: rest moved to on-demand skills. 4 fewer always-loaded files every turn.
- **Portable example config**: masked credentials, env-var validation, per-MCP install steps.
- **Free models + workflows**: `*-free` agent defaults, 5 "without vs with pack" README examples.

## Fixes
- Counts corrected everywhere; private servers and dead plugins removed; macOS/Linux marked untested.

