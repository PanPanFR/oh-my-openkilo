---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Read local guidelines reference (fast, offline):
```
~/.config/opencode/skills/ui-design/references/web-interface-guidelines.md
```

Online fallback:
```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

## Usage

When a user provides a file or pattern argument:
1. Read guidelines from local reference (fallback to URL if missing)
2. Read the specified files
3. Apply all rules from the guidelines
4. Output findings using the format `file:line: [rule] description`

If no files specified, ask the user which files to review.
