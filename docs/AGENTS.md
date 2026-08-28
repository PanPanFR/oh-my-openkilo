# Agents

oh-my-openkilo ships 11 agents. Two are primary (default delegation targets), nine are subagents specialized for one job.

## Primary agents

| Agent        | Role                                                                                  |
|--------------|---------------------------------------------------------------------------------------|
| `builder`    | Default implementation agent. Triage → simple (do directly) or complex (delegate to `planner`). Subagent fan-out: `designer` (UI), `tester` (tests), `reviewer` (security/quality), `documenter` (docs), `researcher` (research), `explorer` (recon). |
| `planner`    | Pre-implementation design, brainstorming, architecture planning, writes plans. Delegates in parallel: `explorer`, `researcher`, `reviewer`, `designer`. |

## Subagents

| Agent                    | When to use                                                                                  | Permission scope     |
|--------------------------|----------------------------------------------------------------------------------------------|----------------------|
| `designer`               | UI/UX, React/Next.js, design system, accessibility. **Requires `stitch` MCP** — without it, falls back to text-only design feedback. | read + design tokens |
| `tester`                 | Write and run test suites. Iterate failures in isolation. Reports compact results.            | read + bash          |
| `reviewer`               | Code + security review. Read-only diff review vs repo standards and spec.                    | read only            |
| `documenter`             | Create and improve documentation in `docs/`. Verified against code.                         | read + write         |
| `researcher`             | External research with cited findings. Uses `context7` for libraries, `perplexity` for web.  | read + webfetch      |
| `explorer`               | Codebase recon — file location, pattern finding, structure mapping. Fast, broad, shallow.    | read only            |
| `cavecrew-investigator`  | Compressed code locator. Where is X defined? Output as `file:line` table, ~60% fewer tokens. | read only            |
| `cavecrew-builder`       | 1-2 file surgical edit. Returns caveman-style receipt. Refuses if scope > 2 files.            | read + edit          |
| `cavecrew-reviewer`      | Diff review, one line per finding, severity-tagged.                                          | read only            |

## Built-in OpenCode agents (disabled)

The pack disables two of OpenCode's built-in agents to avoid duplication:

- `build` — replaced by `builder`
- `plan` — replaced by `planner`

If you want to re-enable them, edit your `opencode.json` and remove the corresponding `disable: true` entries.

## How to invoke

In a normal OpenCode session, you can either:

- Let `builder` pick the right subagent automatically (most common).
- Or explicitly ask: "Ask `tester` to write tests for the auth module", "Have `designer` generate a mockup for the dashboard".

Subagents are also dispatched by `builder` and `planner` via the `task` tool, in parallel when independent.

## Editing an agent

Each agent is a single markdown file in `agents/`. The first line is a YAML front-matter describing the agent; the rest is the prompt body.

Example (`agents/tester.md`):

```markdown
---
description: Test suites - write, run, iterate failures in isolation, report compact results.
mode: subagent
tools:
  bash: allow
  read: allow
  write: allow
  edit: allow
---

You are a test-focused subagent. ...
```

To change behavior, edit the prompt body, not the front-matter (unless you're changing the tool permission set). After editing:

1. Copy the file into `~/.config/opencode/agents/` (or run `/update-pack` if you pushed it to the repo).
2. Restart OpenCode or run `/reload`.

## Adding a new agent

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-new-agent--skill--rule). New agents are typically subagents specialized for one job that the existing 11 don't cover well.
