---
name: plans
description: Use when you have a spec or requirements for a multi-step task before touching code, or when you have a written implementation plan file to execute with review checkpoints
---

# Plans

Two modes. Pick by input, load the matching reference BEFORE proceeding:

| Input | Mode | Read FIRST |
|-------|------|-----------|
| Spec / requirements, no plan yet | **Write** | `references/write-mode.md` |
| Existing plan file to implement | **Execute** | `references/execute-mode.md` |

## Shared Rules

- DRY. YAGNI. TDD. Frequent commits.
- One branch `feature/<plan-slug>` per plan; plans live in `plan/<slug>.md` at repo root. Never mix plans.
- Parallel plans: never merge yourself. Integration runs in main via `/integrate`.
- Subagents available -> delegate independent tasks in parallel per delegation rules.
- Never start implementation on main/master without explicit user consent.

## Write Mode Summary

Full protocol in `references/write-mode.md`. Essence: assume the engineer has zero context - document everything per task (files, code, test commands). Bite-sized steps (2-5 min each), no placeholders ("TBD"/"add error handling" = plan failure), required plan header, self-review against spec before handoff.

**Save plans to:** `plan/<slug>.md` at repo root.

## Execute Mode Summary

Full process in `references/execute-mode.md`. Essence: review plan critically and raise concerns BEFORE starting, execute tasks step-by-step with verifications, stop-and-ask on blockers (never guess), full suite green before marking done.

## Handoff

Write mode ends by offering execution choice:
1. **Switch to builder agent (recommended)** - self-contained plan in `plan/<slug>.md`, checkout `feature/<slug>`
2. **Inline** - execute in this session using Execute mode
