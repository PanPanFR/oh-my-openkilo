# Commands

Slash commands. Type the name (with leading `/`) at the start of an OpenCode prompt to invoke.

| Command              | Description                                                                          |
|----------------------|--------------------------------------------------------------------------------------|
| `/update-pack`       | Pull the latest pack from GitHub and sync into your config (per-file diff + backup)  |
| `/update-pack --check`  | Only check whether upstream has new commits, do not sync                          |
| `/update-pack --diff`   | Show what would change, do not sync                                             |
| `/recall <query>`    | Search agentmemory for past session observations matching the query                  |
| `/remember <note>`   | Save a decision, insight, or pattern to agentmemory's long-term storage              |
| `/caveman`           | Toggle terse caveman-mode replies                                                   |
| `/caveman-help`      | Quick-reference card for all caveman modes, skills, and commands                     |
| `/caveman-commit`    | Generate a compressed commit message (subject ≤ 50 chars, body only if needed)       |
| `/caveman-compress <file>` | Compress a natural-language memory file (CLAUDE.md, todos, prefs) into caveman format |
| `/caveman-review`    | Compressed code review comments — one line per finding                              |
| `/caveman-stats`     | Show real token usage and estimated savings for the current session                  |

## `/update-pack` in detail

This is the only command that touches your filesystem outside the OpenCode session.

**Flow:**

1. Locate the pack repo at `~/.config/opencode/oh-my-openkilo/`.
2. `git fetch origin` to see if upstream has new commits.
3. `git pull --ff-only origin main`. If fast-forward fails, abort (you've diverged — see [TROUBLESHOOTING](#troubleshooting)).
4. For each file under `agents/`, `skills/`, `rules/`, `commands/`, `plugins/`, and `AGENTS.md`:
   - Not in target → copy. Count as `added`.
   - Identical to target → skip. Count as `unchanged`.
   - Differs → back up to `<target>/<file>.local-<timestamp>`, then overwrite. Count as `updated (backup)`.
5. Print a summary: `added / updated (with backup list) / unchanged`.
6. Remind you to `/reload` to pick up the new files.

**Never touched by `/update-pack`:**

- `~/.config/opencode/opencode.json` — your config, your responsibility
- `~/.config/opencode/.opencode/`, `node_modules/`, lock files — runtime state
- Files in the target that don't exist in the repo (your local additions)

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
