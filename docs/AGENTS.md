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
| `researcher`             | External research with cited findings. Uses `context7` for libraries; web research falls back to `webfetch`. | read + webfetch      |
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
model: opencode/mimo-v2.5-free
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

## Changing the model

Every agent ships with a `model:` field in its frontmatter. The pack defaults to **free models provided by OpenCode** (suffix `-free`), so you can use the pack out of the box without configuring any provider API key. The current defaults:

| Agent             | Default model                                |
|-------------------|----------------------------------------------|
| `builder`         | `opencode/nemotron-3-ultra-free`             |
| `planner`         | `opencode/muse-spark-1.2-contributor-free`   |
| `designer`        | `opencode/muse-spark-1.2-contributor-free`   |
| `tester`          | `opencode/mimo-v2.5-free`                    |
| `reviewer`        | `opencode/nemotron-3-ultra-free`             |
| `documenter`      | `opencode/muse-spark-1.2-contributor-free`   |
| `researcher`      | `opencode/hy3-free`                          |
| `explorer`        | `opencode/mimo-v2.5-free`                    |
| `cavecrew-*`      | (inherits default — no explicit `model:`)    |

To use a different model:

1. Open the agent's `.md` file in `~/.config/opencode/agents/`.
2. Edit the `model:` line. Use the format `<provider>/<model>` — e.g. `anthropic/claude-sonnet-4-5`, `openai/gpt-5`, or any other model available in your OpenCode provider list.
3. Save the file and run `/reload` (or restart OpenCode).

Free models are good for everyday work but slower and less capable than paid ones. If you have provider credentials configured in `opencode.json`, you can mix free for cheap tasks (commit messages, file summaries) with paid for high-stakes ones (architecture review, complex debugging).

## Adding a new agent

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-new-agent--skill--rule). New agents are typically subagents specialized for one job that the existing 11 don't cover well.
