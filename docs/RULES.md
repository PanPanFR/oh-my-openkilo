# Rules

Two on-demand rule files ship in `rules/`. They are not always loaded. `AGENTS.md` carries the always-on policy and points to each rule only when the task needs it.

| Rule | Load when |
|------|-----------|
| `jev-routing.md` | Genuinely torn between costly options, a high-risk or irreversible decision, or after two failed attempts (loop-breaker) |
| `ui-tooling.md` | Task touches component registries, the shadcn CLI, or a UI MCP |

## How rules differ from skills

- **Rules** are short protocols referenced from `AGENTS.md` when a decision is genuinely uncertain.
- **Skills** are playbooks loaded when a task matches their description.

Both are plain markdown files. OpenCode V2 does not load an `instructions` array, so the pack does not use one.

## Always-on policy lives in AGENTS.md

Language, communication density, memory discipline, graphify usage, skill selection, Jev policy, workflow, and tooling rules live directly in `AGENTS.md`. Keeping them there avoids a second always-on layer and keeps the per-turn context small.

## Disabling a rule

Remove or rename the file, then remove its row from the Rules map in `AGENTS.md`. Restart OpenCode.

## Editing a rule

Edit the live file first, verify it in a real session, then mirror it into `rules/` and release.
