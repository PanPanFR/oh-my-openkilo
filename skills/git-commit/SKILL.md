---
name: git-commit
description: Use when user asks to commit changes, mentions "/commit", "commit message", or stages changes - conventional commit message generation from diff, type/scope auto-detection, intelligent staging, git safety
license: MIT
allowed-tools: Bash
---

# Git Commit with Conventional Commits

Create standardized semantic commits. Analyze the actual diff to determine type, scope, and message. Terse, exact, no fluff.

## Format

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

## Rules

**Subject line:**
- `<type>(<scope>): <imperative summary>` (scope optional)
- Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Imperative mood: "add", "fix", "remove" (not "added", "adds", "adding")
- <=50 chars preferred, hard cap 72
- No trailing period
- Lowercase after colon unless project convention requires otherwise

**Body (only if needed):**
- Skip entirely when subject is self-explanatory
- Include body only for: non-obvious *why*, breaking changes (`feat!: ...` or `BREAKING CHANGE:`), migration notes, linked issues
- Bullets `-` not `*`
- Reference issues at end: `Closes #123`, `Refs #456`

**What NEVER goes in:**
- Conversational filler ("This commit does X", "I", "we", "now")
- AI attribution or generated markers
- Restating file names when scope already says it

## Workflow

1. **Analyze diff:** `git diff --staged` (staged) or `git diff`; check `git status --short`
2. **Stage if needed:** `git add path/to/file`, patterns (`git add *.test.*`), or `git add -p`. **Never commit secrets** (.env, credentials.json, private keys)
3. **Generate message:** type + scope from diff; description = imperative, <=50 chars
4. **Commit:**
```bash
# Single line
git commit -m "<type>(<scope>): <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

<optional body>

<optional footer>
EOF
)"
```

## Git Safety Protocol

- NEVER update git config
- NEVER run destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless asked
- NEVER force push to main/master
- Hook failure -> fix issue, create NEW commit (don't amend)
