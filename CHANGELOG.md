# v0.10.4 (2026-09-20)

## Changed
- **Bulk/mechanical edit rule**: `builder` (triage + new section), `planner` (delegation strategy), `rules/communication-style.md` (ponytail ladder), and pack `AGENTS.md` (workflow line) now direct repetitive multi-file work through a single shell script. One tool round-trip instead of one per file: output tokens scale with 1 result, not N.
- **OpenCode V2 config shape**: `agents/` frontmatter (all 6 files) drops the ignored V1 keys (`temperature`, `tools`, `permission`) for the V2 `permissions` allowlist (`shell` not `bash`, `subagent` not `task`, MCP rules as `<server>_*`). Agent `model:` + `variant:` lines unchanged (`opencode/muse-spark-1.3-contributor-free`, per-role reasoning map kept).
- **V2 example config**: `examples/opencode.example.json` rewritten (`permissions` array, `agents` + `disabled`, `plugins`, `providers` with `package`/`settings`, `mcp.servers` with `disabled`). The V1 `instructions` key is gone (V2 ignores it; rules auto-load from global `AGENTS.md`).
- **Tighter agent permissions**: all 6 agents now ship consistent, minimal permission blocks. Read-only roles (`reviewer`) stay read-only, `planner` keeps shell limited to graphify/git/file-remove plus reviewer-only delegation, and every agent carries an explicit reasoning level (`builder`/`planner` max, others dialed down for speed). Smaller blocks also mean roughly 100-200 fewer tokens loaded each time a subagent spawns.
- **Caveman plugin loads on v2**: the missing `plugins/caveman.ts` loader shim is included, so fresh installs pick up terse mode without extra steps.
- **Example config without ponytail**: the npm `ponytail` plugin entry is gone from `examples/opencode.example.json` (that style already lives in `rules/communication-style.md`). One less system-prompt injection, roughly 400-600 tokens saved per turn.
- **Fewer slash commands**: the four single-purpose caveman commands (`/caveman-help`, `/caveman-review`, `/caveman-stats`, `/caveman-compress`) are now subcommands of `/caveman` (`/caveman review`, `/caveman compress <file>`, `/caveman stats`, `/caveman help`). 8 commands instead of 12, smaller prompt catalog per turn (about 50 fewer prompt tokens every turn: 4 catalog entries dropped), same features. `/caveman-commit` stays separate.

## Removed
- **Private tooling fully removed**: last private-server references gone from `agents/planner.md` permissions and `docs/AGENTS.md`. No private-server references remain in the pack.

## Fixed
- **Stale docs corrected**: private-server mentions removed from the MCP docs, the nonexistent "`chrome-devtools` skill" name fixed, and the old V1 `enabled: true` wording replaced with the V2 `"disabled": true` shape.

## Docs
- **Token-saving figures**: every optimization entry now states what it saves per turn, per session, or per spawn (measured where possible, marked ~ where estimated).
- **Pack-focused wording**: internal sync notes and private tool names removed from current and history entries. The log now reads as pack changes only.
- **V1 terms replaced** (`docs/AGENTS.md`, README, `docs/CONFIGURATION.md`, `commands/configcheck.md`, `AGENTS.md`): `task` tool to `subagent`, `disable` to `disabled`, `enabled` to `disabled`, `options` to `settings`. The reasoning-effort table keeps `variant` only; `temperature` removed (V2 ignores the legacy key).
- **Docs updated to match**: `docs/COMMANDS.md` table, `docs/STRUCTURE.md` tree and counts, README command note.
- **Docs show how to turn off the browser tools**: `docs/CONFIGURATION.md` gained a short "Turn it off when you don't need it" section (`"disabled": true` on `chrome-devtools`, plus the `playwright-cli` skill for heavy automation instead). An enabled MCP parks its tool schemas in context every session (roughly 1-2k prompt tokens); turning it off when idle gives that back. `docs/INSTALL.md` links to it.

# v0.9.0 (2026-09-19)

## Changed
- **Works on opencode 1.x and 2.x**: all 5 plugins now load on both versions, so upgrading opencode no longer breaks the pack. Just update and keep working; nothing to change on your side.
- **Same behavior everywhere**: token-saving rewrites, the recall reminder, the knowledge-graph watcher, memory capture, and caveman mode all work as before. On v2, two small extras stay quiet (memory prompt enrichment and in-session caveman toggles) because v2 has no slot for them; everything else is unchanged.
- **Agents and commands untouched**: the same 6 agents, already compatible with both versions.

## Docs
- **docs/CONFIGURATION.md**: notes which opencode versions are supported.

# v0.8.8 (2026-09-17)

## Added
- **RTK token-saving plugin**: new `plugins/rtk.ts` rewrites bash commands to compact `rtk` equivalents automatically (fail-open without the binary in PATH). Verbose git/diff/log output is rewritten to compact form before reaching context, roughly half the raw bytes on typical commands. `examples/opencode.example.json` gains `./plugins/recall-first.ts` and `./plugins/rtk.ts` entries.
- **ADHD precedence rule**: `rules/communication-style.md` gains one line resolving ADHD vs Caveman output style (ADHD owns structure, Caveman owns density) for installs that add an optional local plugin, which stays out of the portable example (absolute local path).

## Removed
- **Dead plugins**: `plugins/checkpoint.ts` and `plugins/prompt-polish.ts` deleted (unlisted, unloaded). Docs updated to match (`docs/CONFIGURATION.md` plugin paragraph rewritten around 7 specifiers, `docs/STRUCTURE.md` tree corrected).

## Changed
- **Per-agent reasoning and temperature**: agent frontmatter now tunes speed per role. `builder` and `planner` keep `variant: xhigh` (temperature 0.3 and 0.1), while `reviewer` (`high`/0.1), `tester` (`medium`/0.2), `documenter` (`low`/0.3), and `designer` (`medium`/0.6) dial reasoning down. Reasoning tokens dominate subagent cost, so each notch down means roughly 30-70% fewer thinking tokens on that role; routine tester/documenter calls cost a fraction of a full-depth run while main build and planning quality are unchanged. All agent `model:` lines stay `opencode/muse-spark-1.3-contributor-free`.
- **Agent + plugin refresh**: `agents/` (all 6 files, frontmatter only) and `plugins/agentmemory-capture.ts` updated in one pass.
- **Leaner prefill in `agentmemory-capture`**: numeric caps only, no behavior change. Stash batch halved (20 to 10), enrich batch halved (10 to 5), prompt and tool-output slices trimmed 25% (8000 to 6000): roughly 25-50% less injected memory context per turn. Every hook, handler, and injection point is unchanged; sessions simply carry less context per turn.

## Docs
- **README, docs/AGENTS.md, docs/STRUCTURE.md**: documented the per-role reasoning effort and temperature map, plus how to tune or revert it.
- **README plugin count corrected** (6 to 7) with token-saving shell output added to the plain-meaning column.

# v0.8.5 (2026-09-13)

## Changed
- **Agents unified on `opencode/muse-spark-1.3-contributor-free`.** All six agent files now ship the same default model (plus `variant: xhigh`), ending the deliberate model-line divergence introduced in v0.8.2. Docs updated to match (docs/AGENTS.md table, README cards, docs/CONFIGURATION.md, docs/STRUCTURE.md, CONTRIBUTING.md).
- **Refresh pass**: `agents/` (all 6 bodies), `commands/recall.md`, `commands/configcheck.md`, `rules/communication-style.md`, `rules/skill-reminder.md`, `skills/memory-discipline/SKILL.md` updated in one pass. Pack-only skills and `AGENTS.md` kept as is.

## Docs
- **README rewritten for beginners.** Plain words first: 3-step start with copy-paste prompts, team intro (only 2 agents to talk to), three first tasks to try, install with nothing to edit for free models. Jargon trimmed (agent card tables, size chart, and command dump moved to docs/). All facts kept: 6 agents / 47 skills / 3 rules / 6 plugins / 12 commands, free `opencode/muse-spark-1.3-contributor-free` default, zero credentials.

# v0.8.3 (2026-09-09)

## Changed
- **Agents default to free OpenCode models.** All six agent files now ship `opencode/*-free` defaults (builder/reviewer: `opencode/nemotron-3-ultra-free`; planner/designer/documenter: `opencode/muse-spark-1.2-contributor-free`; tester: `opencode/mimo-v2.5-free`) instead of private router endpoints, restoring the "free by default, zero credentials" promise. Personal installs keep their own router models; the agent `model:` line is now the one deliberate divergence between the repo and any personal install (documented in docs/STRUCTURE.md and CONTRIBUTING.md).
- **Parallel plan workflow**: dropped worktree-per-session execution (introduced in v0.8.0) after testing judged it overengineering. `planner` and `builder` no longer prescribe per-session worktrees; 1 plan = 1 branch stays, parallel branches never self-merge, integration happens via `/integrate` in the main checkout with plan-file cleanup only. Plan files still committed to `main` before execution.
- **Planner**: bash permission now allows `graphify` commands for codebase recon during analysis.

## Fixes
- **Planner can use browser and MCP servers**: `agents/planner.md` gained a `permission.mcp` allowlist for `chrome-devtools`, `agentmemory`, and `perplexity` with a `"*": deny` catch-all. Planner sessions previously exposed no MCP tools, which made the agent feel read-only (no browser/MCP execution); now browser, memory, and research servers are available during analysis while unlisted servers stay hidden.
- **Docs synced to the current pack**: README.md, docs/STRUCTURE.md, CONTRIBUTING.md, root AGENTS.md. Counts corrected to 6 agents / 47 skills / 3 rules / 6 plugins / 12 commands (added `/impeccable`, `/integrate`; `/configcheck` now listed), 2 primary + 4 subagents (not 5), skill categories corrected to 5 with core 19 (README previously claimed 46 skills / 9 categories), size claims corrected from "3.3 MB / 509 files" to "19 MB / 558 files" (vendored `impeccable` Windows binary dominates), plugin wording corrected (6 modules, `caveman` ships JS not TS, no shell scripts). docs/SKILLS.md was already accurate and is unchanged.
- **CHANGELOG**: restored the missing `# v0.7.0 (2026-09-05)` header that the v0.8.0 edit clobbered, which left v0.7.0 content orphaned under v0.8.0.

# v0.8.0 (2026-09-08)

## Features
- **Impeccable skill**: added `skills/impeccable/` (review/polish/audit/iterate existing UI, mechanical anti-pattern checks via `npx impeccable detect`). Build-time design stays with `ui-design`; routing in `rules/skill-reminder.md`, boundary note in `skills/ui-design/SKILL.md`.
- **Commands**: added `/impeccable` (routes to the impeccable skill) and `/integrate` (integration session for parallel plan branches: sequential merge, conflicts, full suite, worktree and plan cleanup).
- **Parallel plan workflow**: `builder` and `planner` updated for worktree-per-session execution. 1 plan = 1 branch = 1 worktree; parallel branches never self-merge, integration happens via `/integrate` in the main checkout. Single sequential plans merge inline as before.
- **Models**: `reviewer` and `tester` switched from `9router/gmicloud/MiniMaxAI/MiniMax-M3` to `9router/b.ai/qwen3.8-flash`.
- **Docs**: SKILLS/COMMANDS/STRUCTURE tables updated (47 skills, 12 commands).

# v0.7.0 (2026-09-05)

## Features
- **Agents**: roster consolidated 7 → 6. Dropped `integrator` (Git/CI integration); `builder` now lands branches itself. One fewer agent prompt (roughly 1k tokens) that can load per session, plus no more wasted round-trips to the wrong specialist. Team is back to 2 primary (builder, planner) + 4 subagents (designer, tester, reviewer, documenter).
- **Planner**: workflow simplified. Dropped the mandatory PRE-PLAN step; planner writes one self-contained plan per workstream directly to `plan/`. Planner is never Task-spawned: the user switches to the `planner` agent directly for upfront design, then hands the plan to `builder`.

## Docs
- **README, docs/AGENTS.md, docs/STRUCTURE.md, CONTRIBUTING.md, skills/delegation/SKILL.md**: counts updated to 6 agents, `integrator` table row / mermaid node / example text removed, planner description rewritten for the simplified workflow, builder card now states it lands branches itself.

# v0.6.0 (2026-09-04)

## Features
- **Prompt polish**: on success and failure the plugin now shows a TUI toast ("prompt has been enhanced", or a warning with the error on fail-open), so you can tell the hook actually ran.
- **Agents**: agent roster consolidated 8 → 7: dropped `explorer` and `researcher` (codebase recon now happens inline via `graphify query`/`graphify path`, external research via native `webfetch`/`websearch` with decomposed sub-questions), added `integrator` (Git/CI integration: branch sync, conflict detection, merge readiness, cleanup). Two fewer agent prompts (roughly 2k tokens), and recon now rides a scoped graph subgraph instead of full read/grep sessions.
- **Planner**: new OpenKilo workflow. Plans are written to `plan/` in the project root with a mandatory PRE-PLAN per objective, workstream analysis (one plan = one independently executable workstream), and modular self-contained plans. Dispatches to `designer`/`tester`/`reviewer`/`documenter`/`integrator`.
- **Plugin**: added `plugins/prompt-polish.ts`. Opt-in prompt rewrite (prefix a prompt with `pp ` to get it rewritten shorter, clearer, and in English). Configured via `POLISH_BASE_URL`/`POLISH_API_KEY`/`POLISH_MODEL` env vars; fail-open, prompt passes through untouched on any error. Not in the example config (off by default).
- **Designer/tester scoping**: both agents now decline trivial work (small CSS/text edits, trivial checks) and report back so the parent handles it directly.
- **Delegation skill**: roster table and dispatch rules updated for the 7-agent team; recon routed to graphify, research routed to native fetch.
- **Integrator model**: default model switched to the new OpenCode built-in free model `opencode/muse-spark-1.3-contributor-free` instead of the maintainer's router endpoint.

## Docs
- **README, docs/AGENTS.md, docs/STRUCTURE.md, docs/WORKFLOWS.md, docs/CONFIGURATION.md, CONTRIBUTING.md**: counts updated to 7 agents, `researcher`/`explorer` sections and mermaid nodes replaced with `integrator`, planner description rewritten for the PRE-PLAN workflow, `prompt-polish.ts` added to the structure and plugin listing.
- **README**: states plainly that every plugin is optional and `prompt-polish` is fully passive unless you opt in with a `pp ` prefix and set the `POLISH_*` env vars. Not using it costs nothing.
- **CONTRIBUTING.md**: versioning policy rewritten as standard semantic versioning (major / minor / patch), with clear examples for each bump level and what counts as a breaking change.
- **README**: install and update flows now lead with "let the agent do it" prompts (clone, copy, install dependencies, verify) so beginners never need terminal knowledge; the terminal commands moved into collapsible details blocks as the manual alternative. Commands section is prose instead of a table (slash commands are optional helpers, mostly provided by bundled tools/plugins). New planner example workflow ("Plan before building"). MCP table trimmed to `agentmemory` + `chrome-devtools`: browser automation runs through the bundled `playwright-cli` skill, so no Playwright MCP is listed; other MCPs (Playwright, context7, your own) are described as opt-in.

# v0.5.2 (2026-09-01)

## Features
- **/update-pack**: hardcode the pack URL inside the command and run `git` directly. The in-session command no longer depends on any script that lives in the pack repo, so an outdated pack cannot get an outdated update flow.
- **Versioning**: patch bump for small changes (docs, counts, examples), minor bump for big ones (drop a plugin, skill, or agent; rename a command; change how a required dep is installed). When unsure, bump the minor.
- **Configcheck**: warns when the agentmemory MCP is started through npx and points the user to a local install path so OpenCode does not re-download on every cold start.
- **Update-pack**: safety contract at the top of the command (never edit `opencode.json`, never delete user files, never install npm or Python tools, never change models, providers, keys, or MCP servers, abort on any `git pull` failure) plus a note on the nested-folder trap.
- **Install flow**: "install these first" block promoted to the top of `README.md`, `install.ps1`, and `INSTALL.md` so new users see `uv tool install graphifyy` (or `npm i -g graphify`) plus `@agentmemory/server` and `@agentmemory/mcp` before they start a session.
- **Examples**: `opencode.example.json` stays in the npx form so first install works out of the box; the local-pin recommendation lives in the docs and is checked by `/configcheck`.
- **Checkpoint**: every `edit` or `write` is saved to a local git repo at `~/.cache/opencode/checkpoints/<hash-project>` (up to 500 commits per project). Recover with `git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>`. Never staged into the project repo, never pushed.
- **Recall-first**: blocks the first edit of a session until a memory recall runs (matches `memory_smart_search` or `memory_recall` by suffix, so bare and prefixed MCP names both register). If the memory server is down, the model is told to keep going and mention it.
- **Pack sync**: all 8 agents, `commands/configcheck.md`, `rules/skill-reminder.md`, and several plugins and skills refreshed across the pack.

## Fixes
- **Install flow**: drop `scripts/install.ps1`, `scripts/install.sh`, `scripts/update.ps1`, and `scripts/update.sh`. The pack is now a Git repo plus slash commands. Install is a one-time `git clone` + `cp -r` (full recipe in `README.md` and `docs/INSTALL.md`); update is `/update-pack`.
- **Agent count**: removed 3 `cavecrew-*` agents so the pack ships 8.
- **Skill count**: removed `skills/cavecrew/` and `skills/stitch/` so the pack ships 46.
- **Auto-commit plugin**: removed in favour of the regular `/commit` flow.
- **Graphify plugin**: renamed `plugins/graphify.js` to `plugins/graphify.ts` for consistency.
- **Public docs**: counts and listings updated to 8 agents / 46 skills / 3 rules / 6 plugins / 10 commands across `README.md`, `docs/SKILLS.md`, `docs/STRUCTURE.md`, `docs/AGENTS.md`, `docs/INSTALL.md`, `CONTRIBUTING.md`, `examples/opencode.example.json`, and root `AGENTS.md`.
- **Example config**: `graphify.ts` path, `AGENTMEMORY_TOOLS: "core"` env, `chrome-devtools` on by default, personal MCPs stay out.
- **Root AGENTS.md**: counts updated to 8 agents / 46 skills, personal graphify path replaced with a placeholder.

## Docs
- **INSTALL.md**: "After install" section reordered so required deps come first, the local-pin recommendation second, and the MCP overview third.
- **CHANGELOG**: switched to the flat top-of-file `vX.Y.Z (date)` header with Features / Fixes / Docs / Security sections, matching the 9router style.

# v0.4.0 (2026-08-28)

## Features
- **Scaffold**: `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **Initial mirror**: 11 agent prompts in `agents/`, 46 skills in `skills/`, 7 global rules in `rules/`, 9 slash commands in `commands/` (including `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities), 2 plugin sources in `plugins/` (`agentmemory-capture.ts`, `plugins/caveman/`).
- **/update-pack**: slash command for pack updates. Pulls the latest from GitHub, syncs each file with a diff and backs up local changes (`.local-<timestamp>` suffix). Fast-forward only; aborts on divergence with re-clone instructions.
- **INSTALL.md**: PowerShell one-liner (`irm ... | iex`) and Unix equivalent (`curl ... | bash`), backup on install, uninstall, and troubleshooting.
- **Reference docs**: `STRUCTURE.md`, `AGENTS.md`, `SKILLS.md`, `RULES.md`, `COMMANDS.md`, `CONFIGURATION.md` cover every folder, file, agent, skill, rule, command, and config block.
- **SECURITY.md**: zero-credential promise and what to do if a credential is committed by accident.
- **Scripts**: install and update scripts moved into the `scripts/` folder (`install.ps1`, `install.sh`, `update.ps1`, `update.sh`). Existing clones just `git pull`; the move shows up as the old files being deleted and the new ones added, which is safe to commit.
- **Update scripts**: `update.ps1` and `update.sh` in `scripts/` mirror the in-session `/update-pack` command for terminal, CI/CD, or scripted use.
- **Rule consolidation**: 7 rules reduced to 3; `rules/agentmemory.md`, `rules/graphify.md`, `rules/delegation.md`, and `rules/workers.md` moved to on-demand skills. Four fewer always-loaded rule files injected into every single turn.
- **MCP trim**: removed `supabase-mcp-server`, `stitch`, and `remotion` from the example config and docs. The skills stay, but without their optional MCPs the features are limited.
- **Per-MCP install**: each MCP in `README.md` and `docs/CONFIGURATION.md` now has a step-by-step (which `npm` package if any, which env var, one-time setup, and what breaks if you skip a step) plus a troubleshooting table.
- **Updating section**: README rewritten to show both ways — in-session `/update-pack` and PowerShell / bash one-liners.
- **Example config section**: new "Configuration: start from `opencode.example.json`" in README treats the example as ready-to-use, not a blank template.
- **Default free models**: every agent ships with a `*-free` OpenCode model (e.g. `opencode/nemotron-3-ultra-free`, `opencode/muse-spark-1.2-contributor-free`, `opencode/mimo-v2.5-free`, `opencode/hy3-free`) plus a per-agent model table in `docs/AGENTS.md`.
- **Example workflows**: 5 real prompts in README with "without pack" vs "with pack" comparisons; each entry names the agent, skill, rule, and result.
- **OpenChamber**: new "Want a friendlier UI? Try OpenChamber" section links the third-party visual workspace (not affiliated with this pack or the OpenCode team) across the VS Code extension, `openchamber.dev`, and source.
- **examples/opencode.example.json**: portable config template with credentials masked. Includes all plugin loaders, rules, MCP entries (most `enabled: false` except `agentmemory`), one provider template, and a working `permission` block. `install.ps1` uses this file automatically when the user has no config yet.
- **Env-var validation**: `install.ps1` and `install.sh` scan `opencode.json` after install and warn if an active MCP has a missing env var (a `{env:VAR}` placeholder that cannot be resolved).

## Fixes
- **AGENTS.md (root)**: rewritten with the Kilo Code lineage at the top and the lighter-than-`oh-my-opencode-slim` framing; skill count and agent list corrected.
- **Cavecrew family**: downplayed in public docs so users do not need to know about them. Public agent count drops from 11 to 8. Folder and runtime behavior are unchanged.
- **Meet the agents**: README rewritten in Pantheon style with a quick reference table plus a block per agent (role, when to invoke, default model, recommended models, model guidance, tools, dispatched by, dispatches to).
- **docs/AGENTS.md**: rewritten with per-agent detail.
- **CONTRIBUTING.md**: skill count 44 -> 46, rules 6 -> 7, agents 11 -> 8.
- **README**: plugin count claim fixed (4 -> 2 bundled + 2 npm), skill table corrected, TL;DR box added at the top, plugin count wording clarified.
- **docs/SKILLS.md**: rebuilt so it matches the actual folder contents.
- **Private MCP sync**: dropped private-only servers from the public pack after a runtime sync re-added them as personal tools.
- **Em dashes**: 117 -> 4 in maintainer-written files; remaining 4 are deliberate table separators.
- **Why it's lightweight**: README now uses a numbers-based comparison (569 files / 2.6 MB vs 507 files / 58.5 MB, about 23x smaller) and an 8-row table of what "config only" means in practice.
- **Kilo Code reference**: surfaced at the top of "What is oh-my-openkilo?" so the lineage is in the first paragraph.
- **docs/CONFIGURATION.md**: intro rewritten with the same ready-to-use tone as README.
- **Required deps**: the "Plus" tier is now required dependencies. `graphify` and `@agentmemory/server` are no longer optional, the README section was renamed "Performance Tiers" -> "Required dependencies", and `agentmemory` MCP is flagged as required in the MCP table.
- **MCP defaults**: only `agentmemory` is on by default; the other MCPs ship with `"enabled": false`.
- **macOS / Linux disclosure**: the maintainer only develops and tests on Windows. `install.sh` is provided but **has not been tested on macOS or Linux**. README gets a "macOS / Linux support" section with disclosure, manual fallback, and an issue link. The compatibility table now lists macOS and Linux as "Untested by maintainer".

## Internal
- **Removed private MCPs**: personal-only servers dropped from the public pack. References removed from several agents, rules, and skills.

## Security
- **No credentials in the repo**: `opencode.json` runtime is git-ignored. `examples/opencode.example.json` uses `{env:VAR}` placeholders for every secret, so the example is safe to commit, share, and version.
