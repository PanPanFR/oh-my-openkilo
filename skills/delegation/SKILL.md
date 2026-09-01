---
name: delegation
description: Decide when and how to delegate work to subagents (planner, builder, designer, documenter, tester, reviewer, explorer, researcher). Use when dispatching subagents, running parallel tasks, choosing a subagent for a job, or deciding inline-vs-delegate. Front-load triggers: delegate, subagent, parallel, task dispatch, spawn agent, launch agents.
---

# Delegation Policy

You have specialized subagents. Delegate when it improves quality or speed.

## Available Subagents

| Subagent | Use for |
|----------|---------|
| `planner` | Pre-implementation design, brainstorming, architecture planning, implementation plans. Primary mode, can also be delegated to by other primary agents (builder) for complex multi-step work |
| `builder` | Primary agent. Implementation, refactors, multi-step execution of well-defined tasks |
| `designer` | UI/frontend builds - components, design system, accessibility |
| `documenter` | Technical writing - create and improve documentation in `docs/` |
| `tester` | Test suites - write, run, iterate failures in isolation, report compact results |
| `reviewer` | Code + security review of diffs vs repo standards and spec (read-only) |
| `explorer` | Codebase reconnaissance: file location, pattern finding, structure mapping |
| `researcher` | External research - library/framework/API docs with cited findings |

## When to Delegate (DO)

- Task matches a subagent's specialization AND benefits from isolated context
- Independent subtasks exist -> launch them ALL in parallel in a SINGLE message (multiple Task calls)
- Task is large-scale search/audit/research that would bloat your context
- Research-heavy work -> `researcher` (keeps your context lean, cited findings)
- Quick web grab (1-2 URLs, no synthesis needed) -> use native `webfetch`/`websearch` directly, don't delegate
- Security-sensitive review -> `reviewer` (specialized checklist, verified findings)
- Writing tests alongside implementation -> `tester` (parallel: you implement, it tests)
- Writing docs alongside implementation -> `documenter` (parallel: you implement, it documents)
- Unknown codebase territory -> `explorer` first, then act

## When NOT to Delegate (DON'T)

- Trivial: 1-2 tool calls can finish it (delegation overhead > work)
- Task requires your current context/state that can't be summarized
- User explicitly asked you to do it directly
- The task is a quick fix with a known cause

## Rules

1. Prefer delegation when in doubt for specialized work - it produces better results
2. Never run independent subtasks sequentially - always parallel
3. Provide each subagent a precise, self-contained task prompt: goal, files to focus on, output format
4. Synthesize subagent results yourself before presenting to the user
5. Do not delegate to subagents that cannot help (wrong specialization)