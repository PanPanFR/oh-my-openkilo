# Testing & Bulletproofing Skills

## Testing All Skill Types

Different skill types need different test approaches:

### Discipline-Enforcing Skills (rules/requirements)
Examples: TDD, verification-before-completion.
Test with: academic questions (do they understand rules?), pressure scenarios (comply under stress?), combined pressures (time + sunk cost + exhaustion). Identify rationalizations and add explicit counters.
Success: agent follows rule under maximum pressure.

### Technique Skills (how-to guides)
Examples: condition-based-waiting, root-cause-tracing.
Test with: application scenarios, variation scenarios, missing-information tests (gaps?).
Success: agent applies technique correctly to new scenario.

### Pattern Skills (mental models)
Test with: recognition scenarios, application scenarios, counter-examples (when NOT to apply).
Success: agent identifies when/how pattern applies.

### Reference Skills (documentation/APIs)
Test with: retrieval scenarios, application of found info, gap testing on common use cases.
Success: agent finds and correctly applies reference information.

## Common Rationalizations for Skipping Testing

| Excuse | Reality |
|--------|---------|
| "Skill is obviously clear" | Clear to you ≠ clear to other agents. Test it. |
| "It's just a reference" | References can have gaps, unclear sections. Test retrieval. |
| "Testing is overkill" | Untested skills have issues. Always. 15 min testing saves hours. |
| "I'll test if problems emerge" | Problems = agents can't use skill. Test BEFORE deploying. |
| "Too tedious to test" | Testing is less tedious than debugging bad skill in production. |
| "I'm confident it's good" | Overconfidence guarantees issues. Test anyway. |
| "Academic review is enough" | Reading ≠ using. Test application scenarios. |
| "No time to test" | Deploying untested skill wastes more time fixing it later. |

All of these mean: test before deploying. No exceptions.

## Match the Form to the Failure

Before writing guidance, classify the baseline failure. The form that bulletproofs one failure type measurably backfires on another.

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Skips/violates rule under pressure | Prohibition + rationalization table + red flags | Soft guidance ("prefer...", "consider...") |
| Complies but output has wrong shape (bloated, buried verdict) | Positive recipe or contract: state what the output IS - parts in order | Prohibition list ("don't restate") |
| Omits required element from existing output | Structural: REQUIRED field/slot in the template | Prose reminders near template |
| Behavior should depend on a condition | Conditional keyed to observable predicate | Unconditional rule + exemption clauses |

**Why prohibitions backfire on shaping problems:** under competing incentives, agents negotiate with "don't X". In wording tests, the prohibition arm produced MORE unwanted content than even no-guidance control. A recipe leaves nothing to negotiate: output matches stated shape or it doesn't.

Rules for either form:
- **No nuance clauses.** "Don't X unless it matters" reopens negotiation. Express real exceptions as their own conditional on an observable predicate.
- **Exemption clauses don't scope.** "This limit doesn't apply to code blocks" still suppresses code blocks. Restructure so the rule can't reach it.

## Bulletproofing Against Rationalization

For discipline skills only (agent knows the rule, skips under pressure). For wrong-shaped output use the forms above.

Psychology foundation: `persuasion-principles.md` (Cialdini 2021; Meincke et al. 2025).

### Close Every Loophole Explicitly

```markdown
Write code before test? Delete it. Start over.

**No exceptions:**
- Don't keep it as "reference"
- Don't "adapt" it while writing tests
- Don't look at it
- Delete means delete
```

### Address "Spirit vs Letter" Arguments Early

```markdown
**Violating the letter of the rules is violating the spirit of the rules.**
```

Cuts off the entire class of "I'm following the spirit" rationalizations.

### Build Rationalization Table

Capture rationalizations from baseline testing. Every excuse goes in the table with its reality counter.

### Create Red Flags List

Make self-check easy when rationalizing:

```markdown
## Red Flags - STOP and Start Over
- Code before test
- "I already manually tested it"
- "This is different because..."

**All of these mean: Delete code. Start over with TDD.**
```

### Update SDO for Violation Symptoms

Add violation symptoms to description triggers: `use when implementing any feature or bugfix, before writing implementation code`.

## Micro-Testing Wording Before Full Scenarios

Full pressure-scenario runs are slow per iteration. Verify wording first:

1. **One fresh-context sample per call** - raw API call or single-shot subagent. System prompt = realistic context; user message = task tempting the failure.
2. **Always include a no-guidance control.** Control doesn't fail? Nothing to fix - stop, don't author guidance.
3. **5+ reps per variant.** Single samples lie.
4. **Manually read every flagged match.** Template echoes masquerade as hits; automated counts overstate both directions.
5. **Variance is a metric.** Guidance landing = reps converge on same shape. Five interpretations across five reps = wording not binding; tighten form before adding words.

Micro-tests verify wording; they do NOT replace pressure scenarios for discipline skills.

Complete methodology: `testing-skills-with-subagents.md` (pressure scenario writing, pressure types, plugging holes, meta-testing).
