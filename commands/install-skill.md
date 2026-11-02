---
description: Scan project stack and automatically inject all relevant skills from archive into .opencode/skills/
---

Scan the active project stack and automatically inject all relevant domain skills from `~/.config/opencode/archive/skills/` into the current project's `.opencode/skills/`.

## Usage
- `/install-skill` (auto-detect stack and immediately inject all relevant skills)
- `/install-skill <category or keyword>` (e.g. `rust`, `native`, `android`, `cloudflare`, `web`, `ui`)
- `/install-skill --dry-run` (preview skills without copying)

## Workflow

1. **Auto-Inject All Relevant Skills**:
   Run the injection script directly with `--apply`:
   ```bash
   node ~/.config/opencode/archive/scripts/inject.mjs skills --apply --jev --query "$ARGUMENTS"
   ```
   (If `$ARGUMENTS` contains `--dry-run`, omit `--apply`).
   (If `$ARGUMENTS` is empty, omit `--query`).

   This detects the project stack, ranks with Jev, and injects all matching domain skills into `./.opencode/skills/` directly. No manual selection prompt needed: all relevant skills for the stack are installed together.

2. **Report Injected Skills**:
   Display a clean, concise summary to the user:
   - Detected project categories and details (e.g. Rust / Native Systems, Next.js, Android).
   - List of all injected skills with their category and one-line purpose.
   - Confirmation that all skills are active in `./.opencode/skills/` and ready for use.
