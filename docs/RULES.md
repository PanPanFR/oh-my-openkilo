# Rules

Seven global rules. Rules are **not auto-loaded from the `rules/` folder** — each must be registered in `opencode.json` under `instructions`. The example file lists them in this order (protocol rules first, as configured in the maintainer's setup):

```jsonc
{
  "instructions": [
    "rules/agentmemory.md",
    "rules/graphify.md",
    "rules/skill-reminder.md",
    "rules/delegation.md",
    "rules/language.md",
    "rules/communication-style.md",
    "rules/workers.md"
  ]
}
```

Order matters: earlier entries get better model compliance, so the first-action protocols come first.

## The seven rules

| Rule                  | Applies        | Mandate                                                                                                |
|-----------------------|----------------|--------------------------------------------------------------------------------------------------------|
| `agentmemory`         | always         | Recall before work (run `memory_smart_search`); save at decision points and after outcomes             |
| `graphify`            | always         | Use the knowledge graph for codebase questions; init with `graphify update .` if missing                |
| `skill-reminder`      | always         | Load matching skill via the `skill` tool before any implementation task                                 |
| `delegation`          | always         | Delegate specialized work to subagents; run independent subtasks in parallel                           |
| `language`            | always         | All file content in English; chat can be any language                                                  |
| `communication-style` | always         | Caveman (terse) replies and Ponytail (minimal) code style in every session                             |
| `workers`             | Cloudflare files | Prefer current Cloudflare docs over training data (conditional load — globs-based)                  |

## How rules differ from skills

- **Skills** are loaded on demand when a task matches. They run a process.
- **Rules** are always in context. They enforce a behavior at all times.

Both are just markdown files. The difference is the `instructions` array in `opencode.json` (rules) vs the `skill` tool call (skills).

## Disabling a rule temporarily

If a particular session is fighting a rule, comment it out in `opencode.json` and restart. Do not edit the rule file itself — rules are shared across the whole pack.

## Editing a rule

Same as agents/skills: edit the file in the repo, commit, push, run `/update-pack`.
