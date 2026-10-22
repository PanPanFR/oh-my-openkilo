# Commands

Slash commands. Type the name (with leading `/`) at the start of an OpenCode prompt to invoke.

| Command      | Description |
|--------------|-------------|
| `/integrate` | Integrate verified parallel plan branches into main (merge, conflicts, cleanup) |

> v0.18.0 keeps the minimal live set: one command. Memory recall and save are plain sentences handled by the `agentmemory-ops` skill. Caveman behavior (`/caveman`, compressed review, commit, stats, compress) comes from the `caveman*` skills and the caveman plugin, not from command files. Other former commands (`/configcheck`, `/i-have-adhd`, `/impeccable`, `/update-pack`, `/recall`, `/remember`) are gone; their skills remain and load from descriptions.

## Updating the pack (manual, replaces `/update-pack`)

Since v0.16.0 the pack has no `/update-pack` command. Update with git directly:

```powershell
git -C "$env:USERPROFILE\.config\opencode\oh-my-openkilo" pull --ff-only origin main
```

Then mirror the pack into the live config (per-file, with backup):

```powershell
$live = "$env:USERPROFILE\.config\opencode"
$pack = "$live\oh-my-openkilo"
foreach ($d in @("agents", "skills", "rules", "commands", "plugins")) {
  Remove-Item -Recurse -Force (Join-Path $live "$d.bak") -ErrorAction SilentlyContinue
}
```

Or ask the agent: "Pull the latest oh-my-openkilo from GitHub and sync it into my config, backing up any file you overwrite."

**Never touched by a sync:**

- `~/.config/opencode/opencode.json`: your config, your responsibility
- `~/.config/opencode/.opencode/`, `node_modules/`, lock files: runtime state
- Files in the target that don't exist in the repo (your local additions)

## Troubleshooting a sync

### "Repository not found"

The pack repo is not at the expected path. Re-clone manually:

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

If that doesn't work, delete the folder and re-clone. Any local edits should already be in your live config (which the clone leaves alone).

### "Permission denied" on macOS/Linux

The repo folder may have wrong ownership or permissions:

```bash
sudo chown -R "$USER" ~/.config/opencode/oh-my-openkilo
chmod -R u+rwX ~/.config/opencode/oh-my-openkilo
```
