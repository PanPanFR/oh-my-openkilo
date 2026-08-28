Pull the latest oh-my-openkilo pack from GitHub and sync it into the user's OpenCode config directory, with per-file diff and backup of any local changes.

## Usage

```
/update-pack            # pull + sync
/update-pack --check    # only check whether upstream has new commits, do not sync
/update-pack --diff     # show what would change, do not sync
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

- If fast-forward fails (diverged history): stop. Tell the user their local repo has diverged (probably they edited files directly in the repo folder, which is not the supported workflow — edits go in `~/.config/opencode/` and get mirrored back). Suggest `git stash && git pull --ff-only && git stash pop` or re-clone.

### Step 3: Sync pack files with per-file diff and backup

For each of these source paths in the repo: `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, `AGENTS.md`.

For each file in the source (recursive):

- If the same relative path does NOT exist in the target config dir: copy it. Count as **added**.
- If the file exists and is byte-identical: skip. Count as **unchanged**.
- If the file exists but differs:
  1. Back it up: copy target to `<target>/<file>.local-<timestamp>` (e.g. `agents/builder.md.local-20260828-153012`).
  2. Overwrite with the new version from the repo.
  3. Count as **updated (backup created)**.

Print a summary at the end:

```
Sync complete.
  added:     0
  updated:   2   (backups: agents/builder.md.local-..., skills/test-driven-development/SKILL.md.local-...)
  unchanged: 47
```

Never delete files. If the upstream removed a file, warn the user but do not delete the local copy.

### Step 4: Reminder

After sync, remind the user:

- "Restart OpenCode or run /reload to pick up changes."
- "If a file you customized was overwritten, find it at `<path>.local-<timestamp>`."
- "To uninstall a specific change, restore the `.local-<ts>` file over the current one."

## Safety rules

- Never touch `opencode.json` in the target config dir. Pack updates do not include `opencode.json`.
- Never delete files in the target config dir.
- If `git pull` fails for any reason, abort the entire sync. Do not partially apply.
