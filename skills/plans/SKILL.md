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

**Announce at start:** "Using the plans skill (write mode)" or "(execute mode)".

## Shared Rules

- DRY. YAGNI. TDD. Frequent commits.
- Subagents available -> delegate independent tasks in parallel per delegation rules.
- Never start implementation on main/master without explicit user consent.

## Write Mode Summary

Full protocol in `references/write-mode.md`. Essence: assume the engineer has zero context - document everything per task (files, code, test commands). Bite-sized steps (2-5 min each), no placeholders ("TBD"/"add error handling" = plan failure), required plan header, self-review against spec before handoff.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md` (user preference overrides).

## Execute Mode Summary

Full process in `references/execute-mode.md`. Essence: review plan critically and raise concerns BEFORE starting, execute tasks step-by-step with verifications, stop-and-ask on blockers (never guess), full suite green before integration options.

## Handoff

Write mode ends by offering execution choice:
1. **Subagent-driven (recommended)** - fresh subagent per task, review between tasks
2. **Inline** - execute in this session using Execute mode
