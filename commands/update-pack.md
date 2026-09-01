Pull the latest oh-my-openkilo pack from GitHub and sync it into the user's OpenCode config directory, with per-file diff and backup of any local changes.

## Safety contract (read first — non-negotiable)

This command MUST NOT do any of the following under any circumstance:

- It MUST NOT touch `~/.config/opencode/opencode.json` or `opencode.jsonc` in the target dir. That is the user's config. The pack repo never ships a copy, and the sync loop never copies one.
- It MUST NOT delete any file in the target config dir. If the upstream removed a file, the local copy is left in place and the user is told.
- It MUST NOT install, upgrade, or modify npm/Python/uv tools. Out of scope.
- It MUST NOT change the user's model, provider, API keys, MCP servers, or conversation history. All of those live in `opencode.json` or in `.opencode/` state and are not touched.
- It MUST abort the entire sync (not partial) if `git pull` fails for any reason. Half-synced configs are worse than no sync.
- It MUST back up any local file it would overwrite, with timestamped suffix, before replacing it.

If you (the model) are unsure whether an action falls under one of the "MUST NOT" rules above, STOP and ask the user. Do not improvise.

## Usage

```
/update-pack                       # pull + sync
/update-pack --check               # only check whether upstream has new commits, do not sync
/update-pack --diff                # show what would change, do not sync
/update-pack --dry-run             # preview every step, do not write any file or run any side-effecting command
/update-pack --no-git-pull         # skip the git pull step (you already pulled manually, just re-sync files)
```

## Instructions

The pack is cloned to `$env:USERPROFILE\.config\opencode\oh-my-openkilo` (or `~/.config/opencode/oh-my-openkilo` on Unix). All paths below are relative to that location.

### Step 0: Detect platform and locate repo

- Windows: `$env:USERPROFILE\.config\opencode\oh-my-openkilo`
- Unix: `~/.config/opencode/oh-my-openkilo`
- Target config dir: same parent, without `/oh-my-openkilo` suffix
- If the repo folder does not exist, instruct the user to run the install script first: `irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/scripts/install.ps1 | iex` (Windows) or `curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/scripts/install.sh | bash` (Unix).

### Step 1: Check upstream (always)

Run `git -C <repo> fetch origin` to see if `origin/main` is ahead of local `main`.

- If `--check` mode: report `up to date` or `N new commits available` and stop.
- If `--diff` mode: run `git diff --stat main..origin/main` and stop.

### Step 2: Pull

Run `git -C <repo> pull --ff-only origin main`.

- If fast-forward fails (diverged history): stop immediately. Do not proceed to Step 3. Tell the user their local repo has diverged (most often because they edited files directly in the repo folder, which is not the supported workflow — edits go in `~/.config/opencode/` and get mirrored back). Suggest `git stash && git pull --ff-only && git stash pop` or re-clone. Never force-push or reset.

### Step 3: Sync pack files with per-file diff and backup

Source paths to mirror (and only these): `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md`.

For each file in the source (recursive), per source-relative path:

- If the same relative path does NOT exist in the target config dir: copy it. Count as **added**.
- If the file exists and is byte-identical (compare a content-hash for files, or a hash of every relative path inside for directories): skip. Count as **unchanged**. The hash MUST use relative paths inside the directory, not absolute paths; absolute paths would make the hash depend on the location and break the source-vs-target comparison.
- If the file exists but differs:
  1. Back it up: rename target to `<target>/<file>.local-<timestamp>` (e.g. `agents/builder.md.local-20260828-153012`). This MUST happen BEFORE the new version is written.
  2. Copy the new version from the repo into the target location.
  3. Count as **updated (backup created)**.

**Avoid the nested-folder trap.** When both source `<repo>/skills/delegation` and target `<config>/skills/delegation` are directories, do NOT run `Copy-Item -Recurse -Force` against the target while it still exists — that nests the source inside a same-named subfolder. Either back up the target first (rename) and then copy, or copy contents tree-by-tree. The rename-then-copy pattern is what `scripts/update.ps1` uses; do the same.

Print a summary at the end:

```
Sync complete.
  added:     0
  updated:   2   (backups: agents/builder.md.local-..., skills/test-driven-development/SKILL.md.local-...)
  unchanged: 47
```

If the upstream removed a file, warn the user and leave the local copy in place. Never delete.

### Step 4: Reminder

After sync, remind the user:

- "Restart OpenCode or run /reload to pick up the changes."
- "If a file you customized was overwritten, find it at `<path>.local-<timestamp>`."
- "To revert a specific change, restore the `.local-<ts>` file over the current one."
- "Your `opencode.json` and any MCP server config were not touched."

## What `/update-pack` does NOT touch (be explicit)

- `~/.config/opencode/opencode.json` and `opencode.jsonc`
- `~/.config/opencode/.opencode/` (runtime state, session history)
- `node_modules/`, lock files
- Files in the target config dir that don't exist in the repo (user's local additions)
- npm/Python/uv tools
- The user's model, provider, API keys, MCP servers, or conversation history

## Troubleshooting `/update-pack`

### "Repository not found"

The pack repo is not at the expected path. Either run the install script first, or re-clone manually:

```powershell
git clone https://github.com/PanPanFR/oh-my-openkilo.git "$env:USERPROFILE\.config\opencode\oh-my-openkilo"
```

### "Fast-forward merge failed"

Your local copy of the repo has diverged from upstream. This usually means you edited files in the repo folder directly. The supported workflow is:

- Edit files in `~/.config/opencode/`
- Test in a session
- Copy back to the repo and commit

To recover:

```powershell
# Save your local edits
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" stash

# Pull upstream
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" pull --ff-only origin main

# Re-apply your edits (resolve any conflicts manually)
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" stash pop
```

If that doesn't work, delete the folder and re-run the install script. Any local edits should already be in your live config (which the install script leaves alone).

### "Permission denied" on macOS/Linux

The repo folder may have wrong ownership or permissions:

```bash
sudo chown -R "$USER" ~/.config/opencode/oh-my-openkilo
chmod -R u+rwX ~/.config/opencode/oh-my-openkilo
```

### "I see a `skills/<name>/<name>/` nested folder after the sync"

That's the nested-folder trap. The target dir was overwritten in place. Fix: delete the nested inner copy (e.g. `skills/delegation/delegation/`), restore from the `.local-<ts>` backup if one was created, or re-run the sync. Report the issue.
