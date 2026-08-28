---
name: ponytail-review
description: >
  Review diffs or whole repos exclusively for over-engineering - what to
  delete, simplify, or replace with stdlib/native. Use when user says
  "review for over-engineering", "what can we delete", "simplify review",
  "/ponytail-review", "audit this codebase", "find bloat", or
  "/ponytail-audit". One-shot report, does not apply fixes.
---

Hunt unnecessary complexity. Diff scope by default; user says audit/bloat/whole repo -> scan entire tree instead, rank findings biggest cut first.

## Format

`L<line>: <tag> <what>. <replacement>.`, `<file>:L<line>: ...` for multi-file diffs, `[path]` suffix for repo-wide audits.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
factories with one product, wrappers that only delegate, files exporting one
thing, dead flags and config, hand-rolled stdlib.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Scoring

End with the only metric that matters: `net: -<N> lines, -<M> deps possible.`

If there is nothing to cut, say `Lean already. Ship.` and stop.

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope. Route them to a normal review
pass, not this one. A single smoke test or `assert`-based
self-check is the ponytail minimum, not bloat, never flag it for deletion.
Does not apply the fixes, only lists them. One-shot.
"stop ponytail-review" or "normal mode": revert to verbose review style.
