---
name: git-commit
description: Use when user asks to commit changes or mentions "/commit" - conventional commit message generation from diff, type/scope auto-detection, intelligent staging
license: MIT
allowed-tools: Bash
---

# Git Commit with Conventional Commits

Create standardized semantic commits. Analyze the actual diff to determine type, scope, and message.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type | Purpose | Type | Purpose |
|------|---------|------|---------|
| `feat` | New feature | `test` | Add/update tests |
| `fix` | Bug fix | `build` | Build system/deps |
| `docs` | Documentation only | `ci` | CI/config changes |
| `style` | Formatting (no logic) | `chore` | Maintenance/misc |
| `refactor` | No feature/fix | `revert` | Revert commit |
| `perf` | Performance | | |

Breaking changes: `feat!: remove deprecated endpoint`, or footer `BREAKING CHANGE: <explanation>`.

## Workflow

1. **Analyze diff:** `git diff --staged` (staged) or `git diff`; check `git status --porcelain`
2. **Stage if needed:** `git add path/to/file`, patterns (`git add *.test.*`), or `git add -p` for interactive grouping. **Never commit secrets** (.env, credentials.json, private keys)
3. **Generate message:** type + scope from diff; description = present tense, imperative mood, <72 chars
4. **Commit:**
```bash
# Single line
git commit -m "<type>[scope]: <description>"

# Multi-line with body/footer
git commit -m "$(cat <<'EOF'
<type>[scope]: <description>

<optional body>

<optional footer>
EOF
)"
```

## Best Practices

- One logical change per commit
- Present tense ("add"), imperative mood ("fix bug")
- Reference issues: `Closes #123`, `Refs #456`
- Description under 72 characters

## Git Safety Protocol

- NEVER update git config
- NEVER destructive commands (--force, hard reset) without explicit request
- NEVER skip hooks (--no-verify) unless asked
- NEVER force push to main/master
- Hook failure -> fix issue, create NEW commit (don't amend)
