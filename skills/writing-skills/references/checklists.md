# Creation Checklist & Anti-Patterns

## Skill Creation Checklist (TDD Adapted)

Create a todo for EACH item.

**RED Phase - Write Failing Test:**
- [ ] Create pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Run scenarios WITHOUT skill - document baseline behavior verbatim
- [ ] Identify patterns in rationalizations/failures

**GREEN Phase - Write Minimal Skill:**
- [ ] Name uses only letters, numbers, hyphens (no parentheses/special chars)
- [ ] YAML frontmatter with required `name` and `description` fields (max 1024 chars; see https://agentskills.io/specification)
- [ ] Description starts with "Use when..." with specific triggers/symptoms
- [ ] Description written in third person, no workflow summary
- [ ] Keywords throughout for search (errors, symptoms, tools)
- [ ] Clear overview with core principle
- [ ] Addresses specific baseline failures identified in RED
- [ ] Guidance form matches the failure type (see testing-bulletproofing.md)
- [ ] Behavior-shaping guidance micro-tested against no-guidance control (5+ reps, every flagged match read manually) - N/A for pure reference skills
- [ ] Code inline OR link to separate file
- [ ] One excellent example (not multi-language)
- [ ] Run scenarios WITH skill - verify agents now comply

**REFACTOR Phase - Close Loopholes:**
- [ ] Identify NEW rationalizations from testing
- [ ] Add explicit counters (if discipline skill)
- [ ] Build rationalization table from all test iterations
- [ ] Create red flags list
- [ ] Re-test until bulletproof

**Quality Checks:**
- [ ] Small flowchart only if decision non-obvious
- [ ] Quick reference table
- [ ] Common mistakes section
- [ ] No narrative storytelling
- [ ] Supporting files only for tools or heavy reference

**Deployment:**
- [ ] Commit skill to git and push to your fork (if configured)
- [ ] Consider contributing back via PR (if broadly useful)

## Anti-Patterns

### ❌ Narrative Example
"In session 2025-10-03, we found empty projectDir caused..."
Too specific, not reusable.

### ❌ Multi-Language Dilution
example-js.js, example-py.py, example-go.go
Mediocre quality, maintenance burden. One great example is enough.

### ❌ Code in Flowcharts
```dot
step1 [label="import fs"];
```
Can't copy-paste, hard to read.

### ❌ Generic Labels
helper1, helper2, step3, pattern4
Labels must have semantic meaning.
