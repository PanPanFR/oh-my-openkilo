# Rules

Three global rules shape every session. Rules are **not auto-loaded from the `rules/` folder**; each one has to be registered in `opencode.json` under `instructions`. The example lists them in the order the maintainer runs them (protocol rules first):

```jsonc
{
  "instructions": [
    "rules/skill-reminder.md",
    "rules/language.md",
    "rules/communication-style.md"
  ]
}
```

Order matters: earlier entries get better model compliance, so the first-action protocols come first. Reorder to taste.

## The three rules

| Rule                  | What it does                                                                                            |
|-----------------------|---------------------------------------------------------------------------------------------------------|
| `skill-reminder`      | Before any implementation task: check for a matching skill via the `skill` tool, and recall agentmemory first. |
| `language`            | All file content in English. Chat can be any language.                                                  |
| `communication-style` | Caveman (terse) replies and Ponytail (minimal) code style in every session.                              |

Everything else (memory recall, graphify navigation, parallel delegation, Cloudflare doc-first) is handled by the matching skill, loaded on demand. See [SKILLS.md](SKILLS.md).

## How rules differ from skills

- **Skills** are loaded on demand when a task matches their description. They inject a focused playbook into the agent's context for the duration of that task.
- **Rules** are always in context. They shape every message, every turn, every tool call.

Both are plain markdown files. The difference is the `instructions` array in `opencode.json` (rules) versus the `skill` tool call (skills).

## Disabling a rule temporarily

If a particular session is fighting a rule, comment it out in `opencode.json` and restart. Don't edit the rule file itself; rules are shared across the whole pack.

## Editing a rule

Same flow as agents and skills: edit the file in the repo, commit, push, then `/update-pack` to pull the new version locally.
