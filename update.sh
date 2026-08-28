#!/usr/bin/env bash
# update.sh -- oh-my-openkilo Unix updater
# Same logic as the in-session /update-pack slash command, runnable from
# the shell without an OpenCode session.
#
# Usage:
#   ./update.sh                  # git pull + per-file sync with backup
#   ./update.sh --dry-run        # preview
#   ./update.sh --no-git-pull    # skip git pull, only re-sync files
#   ./update.sh --config-dir=... # override target config dir
#   ./update.sh --repo-dir=...   # override pack repo dir
#
# One-liner (macOS/Linux):
#   curl -fsSL https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/update.sh | bash

set -euo pipefail

REPO_DIR="${OPENCODE_REPO_DIR:-$HOME/.config/opencode/oh-my-openkilo}"
CONFIG_DIR="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
DRY_RUN=0
SKIP_GIT=0

for arg in "$@"; do
    case "$arg" in
        --dry-run)        DRY_RUN=1 ;;
        --no-git-pull)    SKIP_GIT=1 ;;
        --config-dir=*)   CONFIG_DIR="${arg#*=}" ;;
        --repo-dir=*)     REPO_DIR="${arg#*=}" ;;
        -h|--help)
            sed -n '2,16p' "$0"
            exit 0
            ;;
        *) echo "Unknown flag: $arg"; exit 1 ;;
    esac
done

run() {
    if [ "$DRY_RUN" -eq 1 ]; then
        echo "[dry-run] $*"
    else
        "$@"
    fi
}

if [ ! -d "$REPO_DIR/agents" ]; then
    echo "ERROR: pack repo not found at $REPO_DIR. Run install.sh first or pass --repo-dir." >&2
    exit 1
fi
if [ ! -d "$CONFIG_DIR" ]; then
    echo "ERROR: target config dir not found at $CONFIG_DIR. Run install.sh first or pass --config-dir." >&2
    exit 1
fi

# git pull
if [ "$SKIP_GIT" -eq 0 ]; then
    echo "Pulling latest from origin/main..."
    if [ "$DRY_RUN" -eq 1 ]; then
        echo "[dry-run] git -C $REPO_DIR pull --ff-only origin main"
    else
        if ! git -C "$REPO_DIR" pull --ff-only origin main; then
            echo "ERROR: git pull failed. Your local repo has diverged from upstream." >&2
            echo "  Recover: git -C $REPO_DIR stash && git -C $REPO_DIR pull --ff-only && git -C $REPO_DIR stash pop" >&2
            echo "  Or: rm -rf $REPO_DIR && re-run install.sh" >&2
            exit 1
        fi
    fi
fi

# Per-file sync
STAMP="$(date +%Y%m%d-%H%M%S)"
added=0
updated=0
unchanged=0
backups=()

copy_item() {
    local src="$1" dst="$2" label="$3"
    [ ! -e "$src" ] && return
    if [ ! -e "$dst" ]; then
        run cp -r "$src" "$dst"
        echo "[+] added $label"
        added=$((added+1))
        return
    fi
    # Compare: if both are files, byte-equal check; if directories, hash every
    # file under each with relative paths. Absolute paths would make the hash
    # location-dependent, so we strip the source base.
    if [ -f "$src" ] && [ -f "$dst" ]; then
        if cmp -s "$src" "$dst"; then
            unchanged=$((unchanged+1))
            return
        fi
    elif [ -d "$src" ] && [ -d "$dst" ]; then
        local src_hash dst_hash
        src_hash=$(cd "$src" && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)
        dst_hash=$(cd "$dst" && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)
        if [ "$src_hash" = "$dst_hash" ]; then
            unchanged=$((unchanged+1))
            return
        fi
    else
        # One is a file, the other a dir; they differ
        :
    fi
    # Backup then overwrite. Remove dst first so `cp -r src dst` does not
    # create a nested src-named subfolder inside dst.
    local backup="$dst.local-$STAMP"
    local i=0
    while [ -e "$backup" ]; do
        i=$((i+1))
        backup="$dst.local-$STAMP-$i"
    done
    if [ "$DRY_RUN" -eq 1 ]; then
        echo "[dry-run] backup $dst -> $backup; cp -r $src $dst"
    else
        mv "$dst" "$backup"
        cp -r "$src" "$dst"
        backups+=("$backup")
    fi
    echo "[*] updated $label (backup: $backup)"
    updated=$((updated+1))
}

echo ""
echo "Syncing pack files..."
echo ""

copy_item "$REPO_DIR/agents"   "$CONFIG_DIR" "agents/"
copy_item "$REPO_DIR/skills"   "$CONFIG_DIR" "skills/"
copy_item "$REPO_DIR/rules"    "$CONFIG_DIR" "rules/"
copy_item "$REPO_DIR/commands" "$CONFIG_DIR" "commands/"
copy_item "$REPO_DIR/plugins"  "$CONFIG_DIR" "plugins/"
copy_item "$REPO_DIR/AGENTS.md" "$CONFIG_DIR" "AGENTS.md"

echo ""
echo "Sync complete."
echo "  added:     $added"
echo "  updated:   $updated"
if [ ${#backups[@]} -gt 0 ]; then
    echo "  backups:"
    for b in "${backups[@]}"; do
        echo "    - $b"
    done
fi
echo "  unchanged: $unchanged"
echo ""
echo "Restart OpenCode or run /reload to pick up the changes."
