---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

**REQUIRED BACKGROUND:** You MUST understand `test-driven-development` before using this skill. It defines the fundamental RED-GREEN-REFACTOR cycle; this skill adapts it to documentation.

## TDD Mapping

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Watch it fail** | Document exact rationalizations agent uses |
| **Minimal code** | Write skill addressing those specific violations |

## When to Create a Skill

**Create when:** technique wasn't intuitively obvious, you'd reference it again across projects, pattern applies broadly, others would benefit.

**Don't create for:** one-off solutions, standard practices well-documented elsewhere, project-specific conventions (put in instructions file), mechanical constraints (enforceable with regex/validation -> automate instead).

## The Iron Law (Same as TDD)

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

Applies to NEW skills AND EDITS to existing skills. Write/edit without testing? Delete it. Start over. No exceptions - not for "simple additions", "just a section", or "documentation updates".

## Reference Map - load BEFORE that activity

| Activity | Read FIRST |
|----------|-----------|
| Structuring/formatting the skill, writing description, SDO discovery optimization, flowcharts, examples | `references/skill-format.md` |
| Testing methodology, pressure scenarios, rationalization tables, choosing guidance form, bulletproofing | `references/testing-bulletproofing.md` |
| Final pre-deployment review, creation checklist, anti-patterns | `references/checklists.md` |

Existing supporting files: `anthropic-best-practices.md`, `testing-skills-with-subagents.md` (complete testing methodology), `persuasion-principles.md` (research foundation), `graphviz-conventions.dot`, `render-graphs.js`.

## Process Loop (RED-GREEN-REFACTOR)

1. **RED - Baseline:** run pressure scenarios with subagent WITHOUT the skill. Document exact behavior, verbatim rationalizations, which pressures triggered violations.
2. **GREEN - Minimal skill:** write the skill addressing ONLY those specific rationalizations. Re-run scenarios WITH skill - agent should comply.
3. **REFACTOR - Close loopholes:** agent found new rationalization? Add explicit counter. Re-test until bulletproof.
4. Wording iteration is expensive on full scenarios - use micro-tests first (see `references/testing-bulletproofing.md` § "Micro-Testing").

## STOP: Before Moving to Next Skill

After writing ANY skill, you MUST stop and complete the deployment checklist (`references/checklists.md`) for THAT skill.

Do NOT:
- Create multiple skills in batch without testing each
- Move to next skill before current one is verified
- Skip testing because "batching is more efficient"

Deploying untested skills = deploying untested code.
