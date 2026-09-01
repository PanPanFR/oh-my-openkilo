# v0.5.2 (2026-09-01)

## Features
- **/update-pack**: hardcode the pack URL inside the command and run `git` directly. The in-session command no longer depends on any script that lives in the pack repo, so an outdated pack cannot get an outdated update flow.

## Fixes
- **Install flow**: drop `scripts/install.ps1`, `scripts/install.sh`, `scripts/update.ps1`, and `scripts/update.sh`. The pack is now a Git repo plus slash commands. Install is a one-time `git clone` + `cp -r` (full recipe in `README.md` and `docs/INSTALL.md`); update is `/update-pack`.

# v0.5.1 (2026-09-01)

## Features
- **Versioning**: patch bump for small changes (docs, counts, examples), minor bump for big ones (drop a plugin, skill, or agent; rename a command; change how a required dep is installed). When unsure, bump the minor.
- **Configcheck**: warns when the agentmemory MCP is started through npx and points the user to a local install path so OpenCode does not re-download on every cold start.
- **Update-pack**: safety contract at the top of the command (never edit `opencode.json`, never delete user files, never install npm or Python tools, never change models, providers, keys, or MCP servers, abort on any `git pull` failure) plus a note on the nested-folder trap.
- **Install flow**: "install these first" block promoted to the top of `README.md`, `install.ps1`, and `INSTALL.md` so new users see `uv tool install graphifyy` (or `npm i -g graphify`) plus `@agentmemory/server` and `@agentmemory/mcp` before they start a session.
- **Examples**: `opencode.example.json` stays in the npx form so first install works out of the box; the local-pin recommendation lives in the docs and is checked by `/configcheck`.

## Docs
- **INSTALL.md**: "After install" section reordered so required deps come first, the local-pin recommendation second, and the MCP overview third.
- **CHANGELOG**: switched to the flat top-of-file `vX.Y.Z (date)` header with Features / Fixes / Docs / Security sections, matching the 9router style.

# v0.5.0 (2026-09-01)

## Features
- **Checkpoint**: every `edit` or `write` is saved to a local git repo at `~/.cache/opencode/checkpoints/<hash-project>` (up to 500 commits per project). Recover with `git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>`. Never staged into the project repo, never pushed.
- **Recall-first**: blocks the first edit of a session until a memory recall runs (matches `memory_smart_search` or `memory_recall` by suffix, so bare and prefixed MCP names both register). If the memory server is down, the model is told to keep going and mention it.
- **Pack sync**: synced from the maintainer's live config (`~/.config/opencode/`) — all 8 agents, `commands/configcheck.md`, `rules/skill-reminder.md`, and several plugins and skills now follow the live setup.

## Fixes
- **Agent count**: removed 3 `cavecrew-*` agents so the pack ships 8, matching live.
- **Skill count**: removed `skills/cavecrew/` and `skills/stitch/` so the pack ships 46, matching live.
- **Auto-commit plugin**: removed in favour of the regular `/commit` flow.
- **Graphify plugin**: renamed `plugins/graphify.js` to `plugins/graphify.ts` to match live.
- **Public docs**: counts and listings updated to 8 agents / 46 skills / 3 rules / 6 plugins / 10 commands across `README.md`, `docs/SKILLS.md`, `docs/STRUCTURE.md`, `docs/AGENTS.md`, `docs/INSTALL.md`, `CONTRIBUTING.md`, `examples/opencode.example.json`, and root `AGENTS.md`.
- **Example config**: `graphify.ts` path, `AGENTMEMORY_TOOLS: "core"` env, `chrome-devtools` on by default, personal MCPs `perplexity` and `tinypuppet` stay out.
- **Root AGENTS.md**: counts updated to 8 agents / 46 skills, personal graphify path replaced with a placeholder.

# v0.4.0 (2026-08-28)

## Features
- **Scripts**: install and update scripts moved into the `scripts/` folder (`install.ps1`, `install.sh`, `update.ps1`, `update.sh`). Existing clones just `git pull`; the move shows up as the old files being deleted and the new ones added, which is safe to commit.
- **Update scripts**: `update.ps1` and `update.sh` in `scripts/` mirror the in-session `/update-pack` command for terminal, CI/CD, or scripted use.
- **Rule consolidation**: 7 rules reduced to 3; `rules/agentmemory.md`, `rules/graphify.md`, `rules/delegation.md`, and `rules/workers.md` moved to on-demand skills.
- **MCP trim**: removed `supabase-mcp-server`, `stitch`, and `remotion` from the example config and docs. The skills stay, but without their optional MCPs the features are limited.
- **Per-MCP install**: each MCP in `README.md` and `docs/CONFIGURATION.md` now has a step-by-step (which `npm` package if any, which env var, one-time setup, and what breaks if you skip a step) plus a troubleshooting table.
- **Updating section**: README rewritten to show both ways — in-session `/update-pack` and PowerShell / bash one-liners.

## Fixes
- **AGENTS.md (root)**: rewritten with the Kilo Code lineage at the top and the lighter-than-`oh-my-opencode-slim` framing; skill count and agent list corrected.
- **Cavecrew family**: downplayed in public docs so users do not need to know about them. Public agent count drops from 11 to 8. Folder and runtime behavior are unchanged.
- **Meet the agents**: README rewritten in Pantheon style with a quick reference table plus a block per agent (role, when to invoke, default model, recommended models, model guidance, tools, dispatched by, dispatches to).
- **docs/AGENTS.md**: rewritten with per-agent detail.
- **CONTRIBUTING.md**: skill count 44 -> 46, rules 6 -> 7, agents 11 -> 8.
- **README**: plugin count claim fixed (4 -> 2 bundled + 2 npm), skill table corrected, TL;DR box added at the top, plugin count wording clarified.
- **docs/SKILLS.md**: rebuilt so it matches the actual folder contents.
- **Private MCP sync**: dropped `tinypuppet` and `perplexity` from the public pack after a runtime sync re-added them as personal tools.

# v0.3.0 (2026-08-28)

## Features
- **Example config section**: new "Configuration: start from `opencode.example.json`" in README treats the example as ready-to-use, not a blank template.
- **Default free models**: every agent ships with a `*-free` OpenCode model (e.g. `opencode/nemotron-3-ultra-free`, `opencode/muse-spark-1.2-contributor-free`, `opencode/mimo-v2.5-free`, `opencode/hy3-free`) plus a per-agent model table in `docs/AGENTS.md`.
- **Example workflows**: 5 real prompts in README with "without pack" vs "with pack" comparisons; each entry names the agent, skill, rule, and result.
- **OpenChamber**: new "Want a friendlier UI? Try OpenChamber" section links the third-party visual workspace (not affiliated with this pack or the OpenCode team) across the VS Code extension, `openchamber.dev`, and source.

## Fixes
- **Em dashes**: 117 -> 4 in maintainer-written files; remaining 4 are deliberate table separators.
- **Why it's lightweight**: README now uses a numbers-based comparison (569 files / 2.6 MB vs 507 files / 58.5 MB, about 23x smaller) and an 8-row table of what "config only" means in practice.
- **Kilo Code reference**: surfaced at the top of "What is oh-my-openkilo?" so the lineage is in the first paragraph.
- **docs/CONFIGURATION.md**: intro rewritten with the same ready-to-use tone as README.

# v0.2.0 (2026-08-28)

## Features
- **examples/opencode.example.json**: portable config template with credentials masked. Includes all plugin loaders, rules, MCP entries (most `enabled: false` except `agentmemory`), one provider template, and a working `permission` block. `install.ps1` uses this file automatically when the user has no config yet.
- **Env-var validation**: `install.ps1` and `install.sh` scan `opencode.json` after install and warn if an active MCP has a missing env var (a `{env:VAR}` placeholder that cannot be resolved).

## Fixes
- **Required deps**: the "Plus" tier is now required dependencies. `graphify` and `@agentmemory/server` are no longer optional, the README section was renamed "Performance Tiers" -> "Required dependencies", and `agentmemory` MCP is flagged as required in the MCP table.
- **MCP defaults**: only `agentmemory` is on by default; the other MCPs ship with `"enabled": false`.
- **macOS / Linux disclosure**: the maintainer only develops and tests on Windows. `install.sh` is provided but **has not been tested on macOS or Linux**. README gets a "macOS / Linux support" section with disclosure, manual fallback, and an issue link. The compatibility table now lists macOS and Linux as "Untested by maintainer".

## Internal
- **Removed private MCPs**: `perplexity` and `tinypuppet` dropped from the public pack. References removed from several agents, rules, and skills. Runtime config keeps them for personal use.

# v0.1.0 (2026-08-28)

## Features
- **Scaffold**: `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **Initial mirror**: 11 agent prompts in `agents/`, 46 skills in `skills/`, 7 global rules in `rules/`, 9 slash commands in `commands/` (including `/update-pack`, `/recall`, `/remember`, plus the 6 `/caveman-*` utilities), 2 plugin sources in `plugins/` (`agentmemory-capture.ts`, `plugins/caveman/`).
- **/update-pack**: slash command for pack updates. Pulls the latest from GitHub, syncs each file with a diff and backs up local changes (`.local-<timestamp>` suffix). Fast-forward only; aborts on divergence with re-clone instructions.
- **INSTALL.md**: PowerShell one-liner (`irm ... | iex`) and Unix equivalent (`curl ... | bash`), backup on install, uninstall, and troubleshooting.
- **Reference docs**: `STRUCTURE.md`, `AGENTS.md`, `SKILLS.md`, `RULES.md`, `COMMANDS.md`, `CONFIGURATION.md` cover every folder, file, agent, skill, rule, command, and config block.
- **SECURITY.md**: zero-credential promise and what to do if a credential is committed by accident.

## Security
- **No credentials in the repo**: `opencode.json` runtime is git-ignored. `examples/opencode.example.json` uses `{env:VAR}` placeholders for every secret, so the example is safe to commit, share, and version.
