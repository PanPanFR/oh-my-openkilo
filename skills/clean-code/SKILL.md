---
name: clean-code
description: Use when writing new code, reviewing PRs, refactoring legacy code, or reviewing code quality, readability, naming conventions, function size
risk: safe
source: "ClawForge (https://github.com/jackjin1997/ClawForge)"
date_added: "2026-02-27"
---

# Clean Code

Principles from Robert C. Martin's "Clean Code". Transform "code that works" into "code that is clean": readable and enhanceable by a developer other than its original author.

## 1. Meaningful Names
- Intention-revealing: `elapsedTimeInDays` not `d`; pronounceable/searchable, no `genymdhms`
- No disinformation: don't call it `accountList` if it's a Map
- Meaningful distinctions: avoid `ProductData` vs `ProductInfo`
- Classes = nouns (`Customer`), avoid `Manager`/`Data`; methods = verbs (`postPayment`)

## 2. Functions
- Small. Do ONE thing. One level of abstraction per function (don't mix business logic with regex details)
- Arguments: 0 ideal, 1-2 fine, 3+ needs strong justification
- No side effects - no secretly changing global state

## 3. Comments
- Don't comment bad code - rewrite it:
  ```python
  # bad: comment explains what code should say
  if employee.flags & HOURLY and employee.age > 65:
  # good: code explains itself
  if employee.isEligibleForFullBenefits():
  ```
- Good comments: legal, informative (regex intent), clarification of external libs, TODOs
- Bad: mumbling, redundant, misleading, mandated, noise, position markers

## 4. Formatting
- Newspaper metaphor: high-level concepts top, details bottom
- Related lines close together; variables declared near usage

## 5. Objects & Data Structures
- Hide implementation behind interfaces
- Law of Demeter: avoid `a.getB().getC().doSomething()`
- DTOs: public variables, no functions

## 6. Error Handling
- Exceptions over return codes; write try-catch-finally first (defines scope)
- Don't return null; don't pass null

## 7. Unit Tests
- Three laws of TDD: no production code without failing test; no more test than sufficient to fail; no more production code than sufficient to pass
- F.I.R.S.T.: Fast, Independent, Repeatable, Self-Validating, Timely

## 8. Classes
- Small, single responsibility (SRP); stepdown rule - reads top-down

## 9. Smells
Rigidity (hard to change), fragility (breaks in many places), immobility (hard to reuse), viscosity (hard to do the right thing), needless complexity/repetition.

## Checklist
- [ ] Function < 20 lines? Does exactly one thing?
- [ ] Names searchable and intention-revealing?
- [ ] Comments avoided by making code clearer?
- [ ] Too many arguments?
- [ ] Failing test exists for this change?
