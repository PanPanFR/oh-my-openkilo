# Write Mode

Write comprehensive implementation plans assuming the engineer has zero context for the codebase and questionable taste. Document everything they need: which files to touch per task, code, testing, docs to check. Give the whole plan as bite-sized tasks.

## Scope Check

Spec covers multiple independent subsystems -> suggest separate plans, one per subsystem. Each plan must produce working, testable software on its own.

## File Structure

Before tasks, map files created/modified and each one's responsibility:

- Clear boundaries, one responsibility per file.
- Prefer smaller focused files; edits are more reliable on files you can hold in context.
- Files that change together live together; split by responsibility, not technical layer.
- Existing codebase -> follow established patterns; propose splits only for unwieldy files you must touch.

This structure informs task decomposition. Each task produces self-contained changes that make sense independently.

## Task Right-Sizing

A task is the smallest unit carrying its own test cycle, worth a fresh reviewer's gate. Fold setup/config/scaffolding/docs into the task whose deliverable needs them. Split only where a reviewer could reject one task while approving its neighbor. Each task ends with an independently testable deliverable.

## Bite-Sized Steps

Each step = one action (2-5 min): write failing test -> run it fails -> minimal implementation -> run it passes -> commit.

## Plan Header (required)

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED: Use subagent-per-task execution (see delegation rules, recommended) or the plans skill execute mode, task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** [One sentence]

**Architecture:** [2-3 sentences]

**Tech Stack:** [Key technologies]

## Global Constraints

[Project-wide requirements from the spec - version floors, dependency limits, naming/copy rules, platform needs - verbatim, one line each.]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this uses from earlier tasks - exact signatures]
- Produces: [what later tasks rely on - exact names, param/return types]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Plan failures - never write:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "handle edge cases"
- "Write tests for the above" without actual test code
- "Similar to Task N" - repeat the code
- Describing what without showing how
- References to types/functions not defined in any task

## Self-Review

After writing, check against spec with fresh eyes:
1. **Coverage:** every spec requirement has a task?
2. **Placeholders:** scan for the failure patterns above.
3. **Type consistency:** signatures match across tasks?

Fix inline, no re-review needed.

Then offer execution choice (see SKILL.md Handoff).
