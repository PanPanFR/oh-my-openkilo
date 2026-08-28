#!/usr/bin/env bash
# install.sh -- oh-my-openkilo Unix installer
# Usage:
#   ./install.sh           # standard install with backup
#   ./install.sh --dry-run # preview
#   ./install.sh --no-backup --no-plugins

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
DRY_RUN=0
SKIP_BACKUP=0
SKIP_PLUGINS=0

for arg in "$@"; do
    case "$arg" in
        --dry-run)        DRY_RUN=1 ;;
        --no-backup)      SKIP_BACKUP=1 ;;
        --no-plugins)     SKIP_PLUGINS=1 ;;
        --config-dir=*)   CONFIG_DIR="${arg#*=}" ;;
        -h|--help)
            sed -n '2,12p' "$0"
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

if [ ! -d "$REPO_ROOT/agents" ]; then
    echo "ERROR: agents/ not found in $REPO_ROOT. Run from the repo root." >&2
    exit 1
fi

echo "Target config dir: $CONFIG_DIR"
run mkdir -p "$CONFIG_DIR"

if [ "$SKIP_BACKUP" -eq 0 ]; then
    if [ -n "$(ls -A "$CONFIG_DIR" 2>/dev/null)" ]; then
        stamp="$(date +%Y%m%d-%H%M%S)"
        backup="$CONFIG_DIR.backup-$stamp"
        run cp -r "$CONFIG_DIR" "$backup"
        echo "[+] Backup: $backup"
    fi
fi

copy_item() {
    local src="$1" dst="$2" label="$3"
    if [ ! -e "$src" ]; then
        echo "[!] Skip $label (not found)"
        return
    fi
    run cp -r "$src" "$dst"
    echo "[+] Copied $label"
}

echo ""
echo "Installing oh-my-openkilo pack..."
echo ""

copy_item "$REPO_ROOT/agents"   "$CONFIG_DIR" "agents/"
copy_item "$REPO_ROOT/skills"   "$CONFIG_DIR" "skills/"
copy_item "$REPO_ROOT/rules"    "$CONFIG_DIR" "rules/"
copy_item "$REPO_ROOT/commands" "$CONFIG_DIR" "commands/"
copy_item "$REPO_ROOT/AGENTS.md" "$CONFIG_DIR" "AGENTS.md"

if [ "$SKIP_PLUGINS" -eq 0 ]; then
    copy_item "$REPO_ROOT/plugins" "$CONFIG_DIR" "plugins/"
fi

# Seed opencode.json if missing
if [ ! -f "$CONFIG_DIR/opencode.json" ] && [ -f "$REPO_ROOT/examples/opencode.example.json" ]; then
    run cp "$REPO_ROOT/examples/opencode.example.json" "$CONFIG_DIR/opencode.json"
    echo "[+] Seeded opencode.json from examples/opencode.example.json"
    echo "    IMPORTANT: fill in your API keys and model choices."
else
    echo "[=] opencode.json exists or no example -- left untouched"
fi

echo ""
echo "Done."
echo ""
echo "Next steps:"
echo "  1. Edit $CONFIG_DIR/opencode.json (model, provider keys, MCP credentials)."
echo "  2. (Optional) npm i -g graphify && npm i -g @agentmemory/server"
echo "  3. Restart OpenCode or run /reload."
