# Changelog

All notable changes to oh-my-openkilo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **CONTRIBUTING.md: versioning policy.** Patch bump (`0.5.0` → `0.5.1`) for doc fixes, wording, counts, optional examples. Minor bump (`0.5.0` → `0.6.0`) for dropping a plugin/skill/agent, renaming a command, or changing the install path of a required dep. When in doubt, minor.
- **`/configcheck` warns on npx-launched agentmemory MCP.** If `mcp.agentmemory.command` is `["npx", "-y", "@agentmemory/mcp"]`, the report flags it and tells the user to pin a local install path. Avoids silent breakage on cold starts and during npm-registry outages.
- **`/update-pack` safety contract.** The slash command now opens with an explicit MUST-NOT list: never touch `opencode.json`, never delete user files, never install npm/Python tools, never change model/provider/keys/MCP servers, abort on any `git pull` failure. Plus a Step-3 note on the nested-folder trap and how to fix it.
- **README + install.ps1 + INSTALL.md: hard "install these first" callout.** Prominent block on `uv tool install graphifyy` (or `npm i -g graphify`) and `npm i -g @agentmemory/server` + `@agentmemory/mcp`, with `agentmemory serve` to start the REST server. Previously these were a single line; the new wording is meant to be the first thing a new user sees.

### Changed
- **`examples/opencode.example.json`** restored to the working `npx` form for the agentmemory MCP, so first-time installs run out of the box. The local-pin recommendation lives in the docs and is enforced by `/configcheck`.
- **docs/INSTALL.md** restructured the "After install" section: required-deps first, local-pin recommendation second, MCP overview third. The "what you lose" sublist and the env-var validator note are kept.

## [0.5.0] - 2026-09-01

### Added
- **`plugins/checkpoint.ts`** — shadow-checkpoint safety net. Snapshots every `edit`/`write` to a local git repo under `~/.cache/opencode/checkpoints/<sha1(project)>` (capped at 500 commits per project). Recovery: `git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>`. Local-only, never staged into the project repo, never pushed.
- **`plugins/recall-first.ts`** — one-shot recall gate. Blocks the first `edit`/`write/patch/apply_patch/multiedit` of a session until a memory recall ran (matches `memory_smart_search` or `memory_recall` by suffix, so both bare and `<server>_-prefixed` MCP names register). Fail-open: if the memory server is down the model is told to proceed and mention it.

### Changed
- **Pack synced from the maintainer's live config** (source of truth: `~/.config/opencode/`). All 8 agents (`builder`, `planner`, `designer`, `explorer`, `researcher`, `tester`, `reviewer`, `documenter`), `commands/configcheck.md`, `rules/skill-reminder.md`, `plugins/agentmemory-capture.ts`, `plugins/graphify.ts` (renamed from `.js`), `plugins/caveman/*`, `skills/delegation`, `skills/playwright-cli` mirror the live setup.
- **Dropped `agents/cavecrew-{builder,investigator,reviewer}.md`** — pack now ships 8 agents, matching live. These were internal token-economy siblings already absent from live config.
- **Dropped `skills/cavecrew/` and `skills/stitch/`** — pack now ships 46 skills, matching live. `stitch` MCP and skill were both removed in the 2026-08-31 sync.
- **Dropped `plugins/auto-commit.ts`** — replaced by the standard `/commit` workflow.
- **`plugins/graphify.js` → `plugins/graphify.ts`** — live switched to TS, pack follows.
- **All user-facing docs updated to 8 agents / 46 skills / 3 rules / 6 plugins / 10 commands** (`README.md`, `docs/SKILLS.md`, `docs/STRUCTURE.md`, `docs/AGENTS.md`, `docs/INSTALL.md`, `CONTRIBUTING.md`, `examples/opencode.example.json`, root `AGENTS.md`).
- **`examples/opencode.example.json` updated** — `graphify.ts` path, `agentmemory.environment.AGENTMEMORY_TOOLS: "core"`, `chrome-devtools` enabled by default, `perplexity`/`tinypuppet` kept out (personal MCPs, not public). The personal `9router` baseURL/API key placeholder is unchanged.
- **Root `AGENTS.md`** — counts 8 agents / 46 skills, personal global-graph path scrubbed to placeholder (`<global-graph-path>`).
- **`README.md` skills table** — `caveman + cavecrew | 7` → `caveman | 6`; `browser & stitch | 3` → `browser | 2`; `stitch` row removed. Plugin table: `auto-commit` replaced by `checkpoint` + `recall-first`. Designer agent section: removed the "Stitch-integrated" + `stitch` MCP requirement, replaced with multimodal-model recommendation.

## [0.4.0] - 2026-08-28

### Changed
- **Scripts moved to `scripts/`.** `install.ps1`, `install.sh`, `update.ps1`, `update.sh` now live in `scripts/`. `install.*` resolve repo root from the script's parent dir, so they must be run from `scripts/`. Raw GitHub URLs all updated to `main/scripts/...`. **Existing users with a local clone:** `git pull` will show the old root-level files as deleted and the new `scripts/` files as added; safe to commit the move. The `/update-pack` command and the mirror flow are unaffected.
- **`AGENTS.md` (root) rewritten.** Top of file now opens with: (1) the Kilo Code lineage (this pack is the OpenCode adaptation of Kilo Code's Code/Plan/Ask/Debug/Review flow, with `builder`/`planner`/`reviewer` mapping to Code/Plan/Review), and (2) the "lighter than oh-my-opencode-slim" framing (569 files / 2.6 MB vs 507 files / 58.5 MB, ~23× smaller, configuration-only — no `dist/`, no `node_modules`, no build step). A new "The Kilo Code flow" table maps each Kilo Code stage to this pack's agents. Skill count fixed (44 → 46) and agent list corrected.
- **De-emphasize the `cavecrew-*` agents in user-facing docs.** The 3 `cavecrew-*` agents in `agents/` are an internal token-economy variant of the `caveman` family, not a separate feature for users to invoke. The public agent count drops from 11 to 8. `README.md` "Meet the agents" loses the 3 `cavecrew-*` rows from the table and the 3 sub-sections; the folder mention is collapsed to a single italic note pointing at the `cavecrew` skill. `docs/AGENTS.md` loses the 3 sub-sections, the dedicated `## The cavecrew-* family` block, and the related quick-reference rows. `AGENTS.md` (root) drops the "Compressed lane" row from the Kilo Code flow table. `rules/delegation.md` keeps the cavecrew rows (operational, not user-facing). Folder structure and runtime behavior are unchanged.
- **README "Meet the agents" rewritten Pantheon-style.** Quick reference table + per-agent block (role, when to invoke, default model, recommended models, model guidance, tools, dispatched by, dispatches to) for all 8 agents. Format inspired by `oh-my-opencode-slim`'s "Meet the Pantheon".
- **`docs/AGENTS.md` rewritten with per-agent detail** (8 agents × role/prompt path/default model/recommended/model guidance/tools/required MCP/dispatched by/dispatches to). Cavecrew family demoted to one short note.
- **CONTRIBUTING.md** skill count fixed: 44 → 46, rules count fixed: 6 → 7. Agent count fixed: 11 → 8.
- **README fixes:** "4 plugins" → "2 bundled + 2 npm plugins"; Skills table re-categorized to match actual 46 skills (core 18, agentmemory 6, caveman family 7, workflow & memory 12, browser & stitch 3); TL;DR box added at top; plugin count claim clarified.

### Added
- **`update.ps1` and `update.sh`** in `scripts/`. Terminal-side equivalent of the in-session `/update-pack` slash command: `git pull --ff-only origin main`, then per-file sync with `added / updated (with backup) / unchanged` summary. Same backup convention (`<file>.local-<timestamp>`) as the command. Use this for CI/CD, scheduled syncs, or when you just prefer terminal-based workflows.
- **Rules consolidated 7 → 3.** `rules/agentmemory.md`, `rules/graphify.md`, `rules/delegation.md`, `rules/workers.md` are superseded by on-demand skills: delegation + workers became skills, agentmemory + graphify are covered by the `skill-reminder` rule and existing skills. `docs/RULES.md` rewritten for the 3-rule setup.
- **MCP list trimmed: removed `supabase-mcp-server`, `stitch`, `remotion`** from the example config and all docs (README, CONFIGURATION, INSTALL). The `stitch`/`remotion` skills remain in the pack; without the optional `stitch` MCP the `designer` agent falls back to text-only feedback.
- **Docs recount and cleanup.** Pack counts updated everywhere: 48 skills, 3 rules, 6 plugins (4 bundled + 2 npm), 10 commands. `docs/SKILLS.md` rebuilt to match the actual filesystem (old version listed npm-only skills and missed 12 pack skills). Stale references fixed ("the agentmemory rule", "existing 11 agents", personal global-graph path in `AGENTS.md`, old `/configcheck` count).
- **README "Updating the pack" section rewritten** to show both options side by side: in-session `/update-pack` and one-liner PowerShell (`irm ... | iex`) + bash (`curl ... | bash`) scripts.

## [0.3.0] - 2026-08-28

### Added
- **"Configuration: start from `opencode.example.json`"** section in README. The example file is presented as ready-to-use, not a blank template; lists what is pre-configured (plugins, rules wiring, MCP entries, provider template, permissions) and how to swap placeholders for real env vars. `docs/CONFIGURATION.md` lead-in also rewritten to make the same point.
- **Per-MCP install instructions** in README + `docs/CONFIGURATION.md`. Each MCP now has a step-by-step: which `npm` package (if any), which env var to set, one-time setup (e.g. `npx playwright install chromium`), and what breaks if you skip a step. Adds a troubleshooting table for common MCP install issues (env not visible to OpenCode, browser not downloaded, server not running).

### Changed
- **Em dash reduction in author-written files** (117 → 4 across `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/*.md`). The remaining 4 are intentional table separators (`agent name — role` in the agents table). Replaced em dash with comma, period, colon, parentheses, or sentence restructure per the runtime `rules/communication-style.md` policy.
- **`Why it's lightweight` section** in README now has a fact-based comparison with plugin-based packs (oh-my-openkilo: 569 files / 2.6 MB vs oh-my-opencode-slim: 507 files / 58.5 MB, roughly 23× smaller) and an 8-row table showing what "config only" means in practice (no build step, no runtime overhead, no install dependencies beyond the curated tools). Honest about the trade-off: cannot add features that need runtime support (background orchestration, AST-aware tools, live model presets).
- **Kilo Code reference surfaced at top of `What is oh-my-openkilo?`** — readers now see the lineage on the first paragraph instead of having to scroll to Credits.
- **OpenChamber recommendation** added. New section "Want a friendlier UI? Try OpenChamber" explains that OpenChamber is a third-party visual workspace on top of the OpenCode SDK (NOT affiliated with this pack or the OpenCode team). Credits section also links to the project.
- **OpenChamber VS Code extension link** added (`marketplace.visualstudio.com/items?itemName=FedaykinDev.openchamber`). The publisher is third-party `FedaykinDev`, distinct from the official OpenCode extension for VS Code. Three surfaces now listed: VS Code marketplace, `openchamber.dev` (desktop/browser/mobile), and `github.com/openchamber/openchamber` (source).
- **"Default models are free"** section in README + per-agent model table in `docs/AGENTS.md`. Every agent ships with a `model:` field set to a free OpenCode model (e.g. `opencode/nemotron-3-ultra-free`, `opencode/muse-spark-1.2-contributor-free`, `opencode/mimo-v2.5-free`, `opencode/hy3-free`). Table shows default per agent and tells users how to override via the agent's `model:` frontmatter.
- **"Example workflows" section** in README. 5 real prompts with concrete "without" vs "with" comparisons (Repository audit, Debugging a flaky test, New feature implementation, Architecture review, Knowledge graph exploration). Each entry names the agent(s), skill(s), rule(s), and result so users can see exactly which parts of the pack fire for which task.

### Fixed
- **Sync from runtime config: drop private MCPs from pack, add em dash rule.** Runtime config added back the `tinypuppet` and `perplexity` MCPs (personal tools) and added a "Punctuation: drop em dash" section to `rules/communication-style.md`. Synced the runtime changes to the pack, but stripped the two private MCP references (they are personal tools, not part of the public pack). Files touched: `rules/communication-style.md`, `rules/skill-reminder.md`, `agents/builder.md`, `agents/planner.md`, `agents/researcher.md`.

## [0.2.0] - 2026-08-28

### Added
- **`examples/opencode.example.json`** — portable config template with credentials redacted. Includes all 4 plugin loaders, all 7 always-on rules wired into `instructions`, all 7 MCP server entries (most `enabled: false` by default except `agentmemory`), one provider template (`9router` with `{env:NINE_ROUTER_API_KEY}` placeholder), and a working `permission` block. The `install.ps1` script auto-seeds `opencode.json` from this file when the user has no config yet.
- **Env var validation in `install.ps1` / `install.sh`**. Scans `opencode.json` after install and warns if any enabled MCP has a missing env var (`{env:VAR}` placeholder not resolvable in the current shell). Re-run after editing `opencode.json` to re-validate.

### Changed
- **Tier model collapsed: "Plus" is now required dependencies.** `graphify` and `@agentmemory/server` are no longer optional. The pack degrades severely without them. The README section was renamed from "Performance Tiers" to "Required dependencies" and the language tightened ("skipped by default" → "must install immediately after the pack itself"). `agentmemory` MCP marked as the required dependency in the MCP table.
- **MCP defaults: only `agentmemory` enabled by default.** All other MCPs (`chrome-devtools`, `context7`, `playwright`, `remotion`, `stitch`, `supabase-mcp-server`) ship with `"enabled": false`. Users enable per-need by flipping the flag. The example config no longer references `perplexity` or `tinypuppet` (those are personal MCPs not part of the public pack).
- **"Default models are free"** (moved into 0.3.0 changelog; logic added in 0.2.0). All 8 named agents set to a `*-free` model from OpenCode by default.
- **macOS / Linux honest disclosure.** The maintainer develops and tests on Windows only. `install.sh` is provided but **has not been tested on macOS or Linux**. Added a "macOS / Linux support" section to the README with: (1) disclosure that `install.sh` is untested, (2) manual copy-paste recipe as the safest fallback, (3) link to open an issue if a Unix-specific bug surfaces. The compatibility table now shows macOS and Linux as "Untested by maintainer" instead of "Untested (should work)".

### Removed
- **`perplexity` and `tinypuppet` from the public pack.** Both are personal MCPs of the maintainer, not part of the public configuration. References removed from `agents/builder.md`, `agents/planner.md`, `agents/researcher.md`, `rules/communication-style.md`, `rules/skill-reminder.md`, and `skills/playwright-cli/SKILL.md`. Runtime config retains them for personal use; the pack does not.

## [0.1.0] - 2026-08-28

### Added
- **Initial scaffold**: `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **Mirror of the maintainer's pack** (sourced from `~/.config/opencode/`):
  - 11 agent prompts in `agents/`
  - 46 skills in `skills/`
  - 7 global rules in `rules/`
  - 9 slash commands in `commands/` (including `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities)
  - 2 plugin sources in `plugins/` (`agentmemory-capture.ts`, `plugins/caveman/`)
- **`commands/update-pack.md`** — slash command for pack updates. Pulls latest from GitHub, syncs each file with per-file diff and backup of any local changes (`.local-<timestamp>` suffix). Fast-forward only; aborts on divergence with instructions to re-clone.
- **`docs/INSTALL.md`** with one-liner PowerShell install (`irm ... | iex`) and Unix equivalent (`curl ... | bash`), backup-on-install, uninstall, troubleshooting.
- **`docs/STRUCTURE.md`**, **`docs/AGENTS.md`**, **`docs/SKILLS.md`**, **`docs/RULES.md`**, **`docs/COMMANDS.md`**, **`docs/CONFIGURATION.md`** — full reference for every folder, file, agent, skill, rule, command, and config block.
- **`SECURITY.md`** with zero-credential guarantee and what to do if a credential is accidentally committed.

### Security
- **Zero credentials committed.** `opencode.json` runtime config is git-ignored. The `examples/opencode.example.json` shipped in the repo uses `{env:VAR}` placeholders for every secret, so the example file is safe to commit, share, and version.
