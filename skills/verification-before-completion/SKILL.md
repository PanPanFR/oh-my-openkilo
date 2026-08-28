---
name: verification-before-completion
description: Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - run verification commands and confirm output first; evidence before assertions
---

# Verification Before Completion

**Core principle:** Evidence before claims, always.

**Violating the letter of this rule is violating the spirit of this rule.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run the verification command in this message, you cannot claim it passes.

## The Gate Function

```
BEFORE claiming any status or expressing satisfaction:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Output confirms the claim?
   - NO  -> state actual status with evidence
   - YES -> state claim WITH evidence
Skip any step = lying, not verifying
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| Tests pass | Test output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check |
| Build succeeds | Build: exit 0 | Linter passing |
| Bug fixed | Original symptom test passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Passes once |
| Agent completed | VCS diff shows changes | Agent says "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red Flags - STOP

- "should", "probably", "seems to"
- Satisfaction before verification ("Great!", "Done!")
- About to commit/push/PR without verification
- Trusting agent success reports; partial verification
- ANY wording implying success without fresh verification

| Excuse | Reality |
|--------|---------|
| "Should work now" / "I'm confident" | RUN it. Confidence ≠ evidence |
| "Just this once" / "I'm tired" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently via VCS diff |
| "Partial check is enough" | Partial proves nothing |

## Key Patterns

- **Tests:** run command, see `34/34 pass`, THEN claim. Never "should pass now"
- **Regression tests (red-green):** write → run pass → revert fix → MUST FAIL → restore → pass. Claiming without red-green = unverified
- **Build:** run, see exit 0. "Linter passed" proves nothing about compilation
- **Requirements:** re-read plan → checklist each item → report gaps or completion
- **Delegation:** agent reports success → check VCS diff → verify changes → report actual state
