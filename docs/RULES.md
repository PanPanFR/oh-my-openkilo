# Rules

Three global rules. Rules are **not auto-loaded from the `rules/` folder**; each must be registered in `opencode.json` under `instructions`. The example file lists them in this order (protocol rule first, as configured in the maintainer's setup):

```jsonc
{
  "instructions": [
    "rules/skill-reminder.md",
    "rules/language.md",
    "rules/communication-style.md"
  ]
}
```

Order matters: earlier entries get better model compliance, so the first-action protocols come first.

## The three rules

| Rule                  | Applies        | Mandate                                                                                                |
|-----------------------|----------------|--------------------------------------------------------------------------------------------------------|
| `skill-reminder`      | always         | Load matching skill via the `skill` tool before any implementation task; recall agentmemory first        |
| `language`            | always         | All file content in English; chat can be any language                                                  |
| `communication-style` | always         | Caveman (terse) replies and Ponytail (minimal) code style in every session                             |

Other behaviors (memory recall, graphify navigation, parallel delegation, Cloudflare doc-first) are handled by the matching skills, loaded on demand. See [SKILLS.md](SKILLS.md).

## How rules differ from skills

- **Skills** are loaded on demand when a task matches. They run a process.
- **Rules** are always in context. They enforce a behavior at all times.

Both are just markdown files. The difference is the `instructions` array in `opencode.json` (rules) vs the `skill` tool call (skills).

## Disabling a rule temporarily

If a particular session is fighting a rule, comment it out in `opencode.json` and restart. Do not edit the rule file itself; rules are shared across the whole pack.

## Editing a rule

Same as agents/skills: edit the file in the repo, commit, push, run `/update-pack`.
