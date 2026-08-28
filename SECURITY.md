# Security

## Zero-credential guarantee

This repository ships **zero credentials, API keys, tokens, or machine-specific paths**. Every secret referenced in `examples/opencode.example.json` is a placeholder (`<YOUR_*>` or `{env:VAR}`) and must be supplied by the installing user.

## What you should never commit

If you fork or contribute, the following must stay out of the repo:

- Your real `~/.config/opencode/opencode.json` (likely contains API keys)
- `.env` files with secrets
- Browser session tokens, OAuth refresh tokens
- Paths under `C:\Users\<YourName>\` that reveal username

The repo's `.gitignore` already excludes `opencode.json`, `.env`, and state files. Do not weaken it.

## If you accidentally committed a secret

1. **Revoke the credential immediately** at the provider (don't wait — git history is forever on public forks).
2. Remove the file from history: `git filter-repo --path <file> --invert-paths` (or BFG Repo-Cleaner).
3. Force-push the rewritten history.
4. Open an issue describing the leak in general terms so the maintainer can audit.

## Reporting a vulnerability

Open a GitHub issue with the label `security` and minimal reproduction. Do not paste the leaked secret in the issue body — reference it generically ("API key for service X was found in commit Y") and revoke first.
