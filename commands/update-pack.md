Pull the latest oh-my-openkilo pack from GitHub and sync it into the user's live config dir. Self-contained: the URL is hardcoded in this command, you (the model) run `git` directly with inline shell commands, and nothing on the user's disk can go stale.

## Source of truth

The pack lives at exactly this URL. Do not guess, do not pull from a fork, do not look anywhere else:

```
https://github.com/PanPanFR/oh-my-openkilo
```

Default branch: `main`. This command always pulls the latest `main` so the user gets the newest fixes on top of the release they came from.

## Safety contract (non-negotiable)

You (the model) MUST NOT do any of the following under any circumstance:

- Touch `~/.config/opencode/opencode.json` or `opencode.jsonc`. That is the user's config. The pack repo never ships a copy, and the sync loop never copies one.
- Delete any file in the target config dir. If the upstream removed a file, leave the local copy in place and tell the user.
- Install, upgrade, or modify npm / Python / uv tools. Out of scope.
- Change the user's model, provider, API keys, MCP servers, or conversation history. All of those live in `opencode.json` or in `.opencode/` state and are not touched.
- Abort the entire sync (not partial) if `git pull` fails for any reason. Half-synced configs are worse than no sync.
- Skip the backup. Any local file you would overwrite MUST be renamed to `<file>.local-<timestamp>` BEFORE the new version is written.

If you are unsure whether an action falls under one of the rules above, STOP and ask the user. Do not improvise.

## Usage

```
/update-pack                  # clone or pull, then sync
/update-pack --check          # only check whether upstream has new commits, do not sync
/update-pack --diff           # show what would change, do not sync
/update-pack --dry-run        # preview every step, do not run any side-effecting command
```

## Instructions

### Step 0: locate paths

- Pack repo dir: `$env:USERPROFILE\.config\opencode\oh-my-openkilo` on Windows, `~/.config/opencode/oh-my-openkilo` on Unix.
- Target config dir: the same parent, without the `oh-my-openkilo` suffix.

### Step 1: make sure the pack repo is on disk

Run `git -C <repo> rev-parse --git-dir` to test whether the repo is already cloned.

- Folder does not exist: run `git clone https://github.com/PanPanFR/oh-my-openkilo.git <repo>`. If `--check` or `--diff` was passed, stop after the clone (there is no previous version to compare against). Otherwise continue to Step 3.
- Folder exists but is not a git repo: this is a pre-v0.4.0 install or a hand-made folder. Back it up to `<repo>.bak-<timestamp>` and `git clone` fresh into `<repo>`.
- Folder is a git repo: continue to Step 2.

### Step 2: pull (or skip if `--check` / `--diff`)

- `--check`: `git -C <repo> fetch origin`, then `git rev-list --left-right --count main..origin/main`. Report `up to date` if `0 0`, otherwise `N new commits available` and stop.
- `--diff`: `git -C <repo> fetch origin`, then `git -C <repo> diff --stat main..origin/main`. Stop.
- Default: `git -C <repo> pull --ff-only origin main`. Abort on failure per the safety contract.

If fast-forward fails (diverged history): stop. Tell the user their local repo has diverged (most often because they edited files directly in the repo folder, which is not the supported workflow, edits go in `~/.config/opencode/` and get mirrored back). Suggest `git -C <repo> stash && git -C <repo> pull --ff-only origin main && git -C <repo> stash pop`. If that does not work, `rm -rf <repo>` and re-run `/update-pack`, which will clone fresh. Never force-push or reset.

### Step 3: sync pack files into the target config dir

Source paths to mirror (and only these): `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md`.

For each source path, walk every file under it. For each file:

- If the same relative path does NOT exist in the target config dir: copy it. Count as **added**.
- If the file exists and is byte-identical: skip. Count as **unchanged**. For directories, compare a content-hash that uses paths RELATIVE to the directory root; never absolute paths.
- If the file exists but differs:
  1. Back it up by renaming the target to `<target>/<file>.local-<timestamp>`. This MUST happen BEFORE the new version is written.
  2. Copy the new version from the repo into the target location.
  3. Count as **updated (backup created)**.

**Avoid the nested-folder trap.** When both source `<repo>/skills/<name>` and target `<config>/skills/<name>` are directories, do NOT run `cp -r` or `Copy-Item -Recurse -Force` against the target while it still exists. That nests the source inside a same-named subfolder. The rename-then-copy pattern (backup the target first, then copy) prevents it.

You can use any tool to do the per-file copy. Emit one shell script per platform (PowerShell on Windows, bash on Unix), run it, and parse the output. Inline shell from the model is fine; there is no separate reference script.

If the upstream removed a file, warn the user and leave the local copy in place. Never delete.

### Step 4: print summary

```
Sync complete.
  added:     0
  updated:   2   (backups: agents/builder.md.local-20260901-120000, ...)
  unchanged: 4
```

### Step 5: tell the user

After sync:

- "Restart OpenCode or run /reload to pick up the changes."
- "If a file you customized was overwritten, find it at `<path>.local-<timestamp>`."
- "To revert a specific change, restore the `.local-<ts>` file over the current one."
- "Your `opencode.json` and any MCP server config were not touched."

## What `/update-pack` does NOT touch (be explicit)

- `~/.config/opencode/opencode.json` and `opencode.jsonc`
- `~/.config/opencode/.opencode/` (runtime state, session history)
- `node_modules/`, lock files
- Files in the target config dir that don't exist in the repo (user's local additions)
- npm / Python / uv tools
- The user's model, provider, API keys, MCP servers, or conversation history

## Troubleshooting

### `git` says "not a git repository" or "repository not found"

The pack folder exists but is not a git repo, or it points at a URL that no longer exists. Back up the folder, clone fresh, then re-sync.

### `git pull` says "diverged" or "non-fast-forward"

You (or a previous model) edited files inside the pack folder directly. The supported workflow is to edit `~/.config/opencode/` (the target dir) and let the next `/update-pack` copy changes back. Recover by stashing your local edits, pulling, and unstashing:

```powershell
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" stash
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" pull --ff-only origin main
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" stash pop
```

If that errors too, `rm -rf` the pack folder and re-run `/update-pack`. Your `opencode.json`, model, provider, and keys in `~/.config/opencode/` (the parent dir) are not touched.

### macOS / Linux "Permission denied"

```bash
sudo chown -R "$USER" ~/.config/opencode/oh-my-openkilo
chmod -R u+rwX ~/.config/opencode/oh-my-openkilo
```

### Nested folder appears (`skills/<name>/<name>/`)

The nested-folder trap. The previous sync ran `cp -r` against an existing target. Fix: delete the nested inner copy, restore from the `.local-<ts>` backup if one was created, then re-run `/update-pack`. The rename-then-copy pattern prevents it.

## Why this is the right shape

The URL is hardcoded in this command. Even if any earlier pack version on the user's disk is old, `/update-pack` always reaches the latest source of truth because the command itself is short enough to read in one go, the URL is literal, and the AI executes `git` and `cp` directly. There is no separate update script to go stale.
