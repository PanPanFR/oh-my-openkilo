---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue: test failures, production bugs, unexpected behavior, performance problems, build failures, integration issues.

Use ESPECIALLY when: under time pressure, "just one quick fix" seems obvious, you've tried multiple fixes, previous fix didn't work, or you don't fully understand the issue. Simple-looking bugs have root causes too. Rushing guarantees rework.

## Reference Map - load when you hit these situations

| Situation | Read FIRST |
|-----------|-----------|
| Always - full phase-by-phase instructions | `references/phase-details.md` |
| System has multiple components (CI → build → signing, API → service → DB) | `references/phase-details.md` § "Multi-Component Evidence" |
| Error is deep in a call stack | `root-cause-tracing.md` (this directory) |
| Tempted to skip steps / rationalizing | `references/rationalizations.md` |
| Root cause found, adding layered protection | `defense-in-depth.md` (this directory) |
| Test fails only intermittently / timing-dependent | `condition-based-waiting.md` (this directory) |

## The Four Phases (summary)

You MUST complete each phase before proceeding to the next. Full instructions in `references/phase-details.md`.

1. **Root Cause Investigation** - Read errors completely, reproduce consistently, check recent changes (git diff), gather evidence at component boundaries, trace data flow to origin.
2. **Pattern Analysis** - Find working examples in same codebase, compare against reference implementations COMPLETELY, list every difference, understand dependencies.
3. **Hypothesis and Testing** - Form ONE specific hypothesis ("X is the root cause because Y"), make smallest possible change to test it, one variable at a time. Didn't work? NEW hypothesis, never stack fixes.
4. **Implementation** - Create failing test case first, implement single fix for root cause, verify no other tests broke. 3+ failed fixes = STOP and question architecture with your human partner.

## Red Flags - STOP and Return to Phase 1

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- Adding multiple changes before testing
- Skipping the test, manual verification instead
- Proposing solutions before tracing data flow
- "One more fix attempt" after 2+ failures
- Each fix reveals a new problem in a different place

If 3+ fixes failed: this is NOT a failed hypothesis - it is a wrong architecture. STOP, question fundamentals, discuss with your human partner.

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If investigation reveals the issue is truly environmental, timing-dependent, or external:
1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

But: 95% of "no root cause" cases are incomplete investigation.
