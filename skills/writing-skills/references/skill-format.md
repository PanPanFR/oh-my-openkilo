# Skill Format & Discovery (SDO)

## Skill Types

- **Technique:** concrete method with steps (condition-based-waiting, root-cause-tracing)
- **Pattern:** way of thinking about problems (flatten-with-flags, test-invariants)
- **Reference:** API docs, syntax guides, tool documentation

## Directory Structure

```
skills/
  skill-name/
    SKILL.md              # Main reference (required)
    references/           # Heavy reference, loaded on demand
    supporting-file.*     # Only if needed
```

**Separate files for:**
1. Heavy reference (100+ lines) - API docs, comprehensive syntax
2. Reusable tools - scripts, utilities, templates

**Keep inline in SKILL.md:** principles and concepts, code patterns (<50 lines), everything the agent needs on every invocation.

## SKILL.md Structure

```markdown
---
name: Skill-Name-With-Hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Name

## Overview
What is this? Core principle in 1-2 sentences.

## When to Use
Bullet list with SYMPTOMS and use cases; When NOT to use

## Core Pattern (for techniques/patterns)
Before/after code comparison

## Quick Reference
Table or bullets for scanning common operations

## Implementation
Inline code for simple patterns; link to file for heavy reference

## Common Mistakes
What goes wrong + fixes

## Real-World Impact (optional)
Concrete results
```

Frontmatter: required `name` + `description`, max 1024 chars total, name = letters/numbers/hyphens only. Description: third person, ONLY when-to-use, never workflow summary, <500 chars ideally. Spec: https://agentskills.io/specification

## Skill Discovery Optimization (SDO)

Future agents read the description to decide whether to load the skill. Make it answer: "Should I read this skill right now?"

### CRITICAL: Description = When to Use, NOT What the Skill Does

Testing revealed: a description summarizing workflow ("code review between tasks") caused an agent to do ONE review even though the skill's flowchart showed TWO reviews. The agent followed the description instead of reading the skill body.

The trap: workflow-summarizing descriptions create a shortcut agents will take; the skill body becomes documentation agents skip.

```yaml
# ❌ BAD: Summarizes workflow
description: Use when executing plans - dispatches subagent per task with code review between tasks

# ❌ BAD: Too much process detail
description: Use for TDD - write test first, watch it fail, write minimal code, refactor

# ✅ GOOD: Triggering conditions only
description: Use when implementing any feature or bugfix, before writing implementation code
```

Content rules:
- Concrete triggers, symptoms, situations
- Describe the *problem* (race conditions) not language-specific symptoms (setTimeout)
- Technology-agnostic unless skill is technology-specific; then explicit in trigger
- Third person

```yaml
# ❌ BAD: Too abstract / first person / wrong tech signal
description: For async testing
description: I can help you with async tests when they're flaky
description: Use when tests use setTimeout/sleep and are flaky

# ✅ GOOD
description: Use when tests have race conditions, timing dependencies, or pass/fail inconsistently
description: Use when using React Router and handling authentication redirects
```

### Keyword Coverage

Use words an agent would search for: error messages ("Hook timed out", "ENOTEMPTY"), symptoms ("flaky", "hanging", "zombie"), synonyms ("timeout/hang/freeze"), tools (actual commands, library names).

### Descriptive Naming

Active voice, verb-first or core-insight:
- `condition-based-waiting` > `async-test-helpers`
- `root-cause-tracing` > `debugging-techniques`
- Gerunds work well for processes: `creating-skills`, `testing-skills`

### Token Efficiency

Frequently-loaded skills load into EVERY conversation:
- getting-started workflows: <150 words each
- frequently-loaded skills: <200 words total
- other skills: <500 words

Techniques: move details to tool help (`run --help` instead of listing flags); cross-reference skills instead of repeating workflows; one excellent example beats many mediocre ones (complete, runnable, commented WHY, real scenario); eliminate redundancy. Verify with `wc -w`.

### Cross-Referencing Other Skills

- Good: `**REQUIRED SUB-SKILL:** Use test-driven-development`
- Bad: vague paths (`See skills/testing/...`) or `@` links (force-load files immediately, burns context)

## Flowchart Usage

Flowcharts ONLY for non-obvious decision points, process loops where you might stop too early, "A vs B" decisions. Never for reference material (tables), code examples (markdown blocks), linear instructions (numbered lists), labels without semantic meaning (step1, helper2).

See `graphviz-conventions.dot` in this directory for graphviz style rules. Render flowcharts with:
```bash
./render-graphs.js ../some-skill           # Each diagram separately
./render-graphs.js ../some-skill --combine # All diagrams in one SVG
```

## File Organization Patterns

| Shape | When |
|-------|------|
| Self-contained (SKILL.md only) | All content fits, no heavy reference |
| With reusable tool (+ example.ts) | Tool is reusable code, not narrative |
| With heavy reference (references/*.md) | Reference material too large for inline |

## Discovery Workflow

How future agents find your skill: encounters problem -> searches descriptions -> finds match -> scans overview -> reads quick reference -> loads example only when implementing.

Optimize for this flow: searchable terms early and often.
