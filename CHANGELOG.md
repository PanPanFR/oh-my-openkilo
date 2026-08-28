# Changelog

All notable changes to oh-my-openkilo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **De-emphasize the `cavecrew-*` agents in user-facing docs.** The 3 `cavecrew-*` agents in `agents/` are an internal token-economy variant of the `caveman` family, not a separate feature for users to invoke. The public agent count drops from 11 to 8. `README.md` "Meet the agents" loses the 3 `cavecrew-*` rows from the table and the 3 sub-sections; the folder mention is collapsed to a single italic note pointing at the `cavecrew` skill. `docs/AGENTS.md` loses the 3 sub-sections, the dedicated `## The cavecrew-* family` block, and the related quick-reference rows. `AGENTS.md` (root) drops the "Compressed lane" row from the Kilo Code flow table. `rules/delegation.md` keeps the cavecrew rows (operational, not user-facing). Folder structure and runtime behavior are unchanged.
- **CONTRIBUTING.md** skill count fixed: 44 → 46, rules count fixed: 6 → 7.
- **Scripts moved to `scripts/`.** `install.ps1`, `install.sh`, `update.ps1`, `update.sh` now live in `scripts/`. `install.*` resolve repo root from the script's parent dir, so they must be run from `scripts/`. Raw GitHub URLs all updated to `main/scripts/...`. **Existing users with a local clone:** `git pull` will show the old root-level files as deleted and the new `scripts/` files as added; safe to commit the move. The `/update-pack` command and the mirror flow are unaffected (they sync `agents/`, `skills/`, etc., not the scripts themselves).

### Added
- **`update.ps1` and `update.sh`** in `scripts/`. Terminal-side equivalent of the in-session `/update-pack` slash command: `git pull --ff-only origin main`, then per-file sync with `added / updated (with backup) / unchanged` summary. Same backup convention (`<file>.local-<timestamp>`) as the command. Use this for CI/CD, scheduled syncs, or when you just prefer terminal-based workflows.
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
