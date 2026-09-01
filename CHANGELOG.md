# Changelog

Notes on notable changes to oh-my-openkilo.

## [0.5.1] - 2026-09-01

### Added
- **Versioning rules in CONTRIBUTING.md.** Small changes (docs, counts, examples) bump the patch (`0.5.0` -> `0.5.1`). Big changes (drop a plugin/skill/agent, rename a command, change how a required dep is installed) bump the minor (`0.5.0` -> `0.6.0`). When unsure, bump the minor.
- **`/configcheck` now warns when agentmemory MCP runs through npx.** If `mcp.agentmemory.command` is still `["npx", "-y", "@agentmemory/mcp"]`, the report asks the user to switch to a local path so OpenCode stops re-downloading on every cold start and stops breaking when the npm registry is down.
- **Safety contract in `/update-pack`.** The top of the command now lists what it must never do: never edit `opencode.json`, never delete user files, never install npm or Python tools, never change models, providers, keys, or MCP servers, abort if `git pull` fails. A new note covers the nested-folder trap and how to recover.
- **"Install these first" block in README + install.ps1 + INSTALL.md.** Used to be a single line, now a big block at the top: `uv tool install graphifyy` (or `npm i -g graphify`) plus `npm i -g @agentmemory/server` plus `@agentmemory/mcp`, then `agentmemory serve`. New users see it before they start a session.

### Changed
- **`examples/opencode.example.json`** stays in the npx form so the first install works out of the box. The local-pin recommendation lives in the docs and is checked by `/configcheck`.
- **`docs/INSTALL.md`** "After install" section reordered: required deps first, local-pin recommendation second, MCP overview third. The "what you lose" sublist and the env-var validator note are kept.

## [0.5.0] - 2026-09-01

### Added
- **`plugins/checkpoint.ts`** is a safety net. Every `edit` or `write` is saved to a local git repo at `~/.cache/opencode/checkpoints/<hash-project>` (up to 500 commits per project). To recover: `git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>`. Never staged into the project repo, never pushed.
- **`plugins/recall-first.ts`** is a one-shot recall gate. It blocks the first edit of a session until a memory recall runs (matches `memory_smart_search` or `memory_recall` by suffix, so bare and prefixed MCP names both register). If the memory server is down, the model is told to keep going and mention it.

### Changed
- **Pack synced from the maintainer's live config** (source: `~/.config/opencode/`). All 8 agents, `commands/configcheck.md`, `rules/skill-reminder.md`, and several plugins and skills follow the live setup.
- **3 `cavecrew-*` agents removed.** Pack now ships 8 agents, matching live. Those agents were never in live.
- **`skills/cavecrew/` and `skills/stitch/` folders removed.** Pack now ships 46 skills, matching live.
- **`plugins/auto-commit.ts` removed.** Replaced by the regular `/commit` flow.
- **`plugins/graphify.js` renamed to `plugins/graphify.ts`.** Live moved to TS, pack follows.
- **Public docs updated to 8 agents / 46 skills / 3 rules / 6 plugins / 10 commands** across all the listed files.
- **`examples/opencode.example.json` updated:** `graphify.ts` path, `agentmemory` env `AGENTMEMORY_TOOLS: "core"`, `chrome-devtools` on by default, personal MCPs `perplexity` and `tinypuppet` stay out.
- **Root `AGENTS.md`:** counts updated to 8 agents and 46 skills, personal graphify path replaced with a placeholder.

## [0.4.0] - 2026-08-28

### Changed
- **Install and update scripts moved to the `scripts/` folder.** Users with an existing clone just `git pull`; the move shows up as the old files being deleted and the new ones added, which is safe to commit. Usage stays the same.
- **Root `AGENTS.md` rewritten.** The top now explains that this pack is the OpenCode adaptation of the Kilo Code flow (Code/Plan/Ask/Debug/Review), and why the pack is lighter than plugin-based ones (fewer files, no build step). Skill count and agent list corrected.
- **`cavecrew-*` agents downplayed in public docs.** Users do not need to know about them. Public agent count drops from 11 to 8. Folder and runtime behavior are unchanged.
- **README "Meet the agents" rewritten in Pantheon style.** Quick reference table plus a block per agent (role, when to invoke, default model, recommended models, model guidance, tools, dispatched by, dispatches to).
- **`docs/AGENTS.md` rewritten with per-agent detail.**
- **CONTRIBUTING.md:** skill count 44 -> 46, rules 6 -> 7, agents 11 -> 8.
- **README:** plugin count claim fixed (4 -> 2 bundled + 2 npm), skill table corrected, TL;DR box added at the top, plugin count wording clarified.

### Added
- **`update.ps1` and `update.sh`** in `scripts/`. Same as `/update-pack` but from the terminal, for CI/CD or anyone who prefers the command line.
- **Rules consolidated 7 -> 3.** Four old rules (agentmemory, graphify, delegation, workers) moved to skills that load on demand.
- **3 MCPs removed from the example and docs: `supabase-mcp-server`, `stitch`, `remotion`.** The skills stay, but without their optional MCPs the features are limited.
- **Pack counts fixed across all docs.** `docs/SKILLS.md` rebuilt so it matches the actual folder contents.
- **README "Updating the pack" rewritten** to show both ways: in-session `/update-pack`, or PowerShell / bash one-liners.

## [0.3.0] - 2026-08-28

### Added
- **"Configuration: start from `opencode.example.json`"** in README. The example is presented as ready-to-use, not a blank template; lists what is already configured and how to swap placeholders for real env vars. `docs/CONFIGURATION.md` intro rewritten with the same tone.
- **Per-MCP install instructions** in README and `docs/CONFIGURATION.md`. Each MCP gets a step-by-step: which `npm` package if any, which env var to set, one-time setup (for example `npx playwright install chromium`), and what breaks if you skip a step. A troubleshooting table was added.

### Changed
- **Em dashes reduced in maintainer-written files** (117 -> 4). The rest are deliberate table separators. Comma, period, colon, parentheses, or sentence restructure per the `rules/communication-style.md` policy.
- **README "Why it's lightweight"** now uses numbers to compare with plugin-based packs (oh-my-openkilo 569 files / 2.6 MB vs oh-my-opencode-slim 507 files / 58.5 MB, about 23x smaller) and an 8-row table showing what "config only" means in practice (no build, no runtime inside the pack, no installs beyond the curated tools). Honest about the trade-offs.
- **Kilo Code origin surfaced at the top** of "What is oh-my-openkilo?" so readers see the lineage in the first paragraph.
- **OpenChamber recommendation added.** New "Want a friendlier UI? Try OpenChamber" section explains that OpenChamber is a visual workspace on top of the OpenCode SDK (not part of this pack or the OpenCode team). Links to the VS Code extension, site, and source.
- **"Default models are free"** in README plus a per-agent model table in `docs/AGENTS.md`. Each agent ships with a free OpenCode model; the table shows how to override via the agent frontmatter.
- **"Example workflows"** in README. 5 real prompts with "without pack" vs "with pack" comparisons. Each entry names the agent, skill, rule, and result.

### Fixed
- **Sync from runtime config: drop private MCPs from the pack, add em dash rule.** Runtime added back the `tinypuppet` and `perplexity` MCPs (personal tools) and a "Punctuation: drop em dash" section in `rules/communication-style.md`. Pack synced, but the two private MCPs were removed from the public pack.

## [0.2.0] - 2026-08-28

### Added
- **`examples/opencode.example.json`** is a portable config template with credentials masked. Includes all plugin loaders, rules, MCP entries (most `enabled: false` except `agentmemory`), one provider template, and a working `permission` block. `install.ps1` uses this file automatically when the user has no config yet.
- **Env-var validation in `install.ps1` and `install.sh`.** After install, the script scans `opencode.json` and warns if an active MCP has a missing env var (a `{env:VAR}` placeholder that cannot be resolved in the current shell). Re-run after editing `opencode.json` to re-validate.

### Changed
- **The "Plus" tier is now required dependencies.** `graphify` and `@agentmemory/server` are no longer optional. The pack does not work properly without them. The README section was renamed from "Performance Tiers" to "Required dependencies" and the wording was tightened. `agentmemory` MCP is flagged as required in the MCP table.
- **MCP defaults: only `agentmemory` is on by default.** The other MCPs (`chrome-devtools`, `context7`, `playwright`, `remotion`, `stitch`, `supabase-mcp-server`) ship with `"enabled": false`. Users turn them on per need by flipping the flag. The example no longer references `perplexity` or `tinypuppet` (personal MCPs, not part of the public pack).
- **"Default models are free"** (moved to 0.3.0 changelog; logic added in 0.2.0). All 8 main agents are set to a `*-free` model from OpenCode.
- **Honest macOS / Linux disclosure.** The maintainer only develops and tests on Windows. `install.sh` is provided but **has not been tested on macOS or Linux**. README gets a "macOS / Linux support" section: (1) the untested disclosure, (2) a manual copy-paste recipe as the safest fallback, (3) a link to open an issue if a Unix-specific bug appears. The compatibility table now lists macOS and Linux as "Untested by maintainer".

### Removed
- **`perplexity` and `tinypuppet` from the public pack.** Both are the maintainer's personal MCPs, not part of the public config. References removed from several agents, rules, and skills. Runtime config keeps them for personal use; the pack does not.

## [0.1.0] - 2026-08-28

### Added
- **Initial scaffold:** `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **Mirror of the maintainer's pack** (source: `~/.config/opencode/`):
  - 11 agent prompts in `agents/`
  - 46 skills in `skills/`
  - 7 global rules in `rules/`
  - 9 slash commands in `commands/` (including `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities)
  - 2 plugin sources in `plugins/` (`agentmemory-capture.ts`, `plugins/caveman/`)
- **`commands/update-pack.md`** is a slash command for pack updates. Pulls the latest from GitHub, syncs each file with a diff and backs up local changes (`.local-<timestamp>` suffix). Fast-forward only; aborts on divergence with re-clone instructions.
- **`docs/INSTALL.md`** with PowerShell one-liner (`irm ... | iex`) and Unix equivalent (`curl ... | bash`), backup on install, uninstall, and troubleshooting.
- **`docs/STRUCTURE.md`**, **`docs/AGENTS.md`**, **`docs/SKILLS.md`**, **`docs/RULES.md`**, **`docs/COMMANDS.md`**, **`docs/CONFIGURATION.md`** are full references for every folder, file, agent, skill, rule, command, and config block.
- **`SECURITY.md`** with a zero-credential promise and what to do if a credential is committed by accident.

### Security
- **No credentials in the repo.** `opencode.json` runtime is git-ignored. `examples/opencode.example.json` uses `{env:VAR}` placeholders for every secret, so the example is safe to commit, share, and version.
