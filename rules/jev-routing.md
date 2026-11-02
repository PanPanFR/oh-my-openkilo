# Rule: jev-routing - decision assistance on forks

Jev (System One `jev-1.13`) is an advisory decision model. It never generates
text or code. The chat LLM or user proposes options; Jev disposes with typed
probabilities.

## When to call (Natural Triggers)

Call Jev when there is a concrete fork in the road:

1. **User asks for comparison / tradeoff**: e.g., user asks "A vs B?", "library mana yang cocok?", or asks to choose between architectural patterns (`-Preset route` or `-Preset skill-match`).
2. **Structural / Architectural fork**:
   - Choosing core database, state management, or runtime framework.
   - High-impact or irreversible approach: migrations, auth protocols, public API surface (`-Preset verify`).
3. **Loop-breaker (Mandatory Safety Net)**:
   - After 2 consecutive failed attempts at the same problem (same failing test, same build error, repeated syntax loop), stop editing and call loop-breaker.

## When to skip

- Routine implementation, bugfixes with clear causes, direct instructions from user, single-option refactors.
- No ceremony, no note, and no mention when skipping.

## Loop-breaker execution

```bash
node ~/.config/opencode/skills/jev-decision/scripts/jev-decide.mjs \
  -Preset loop-breaker -State "<error + attempts + recent diff>"
```

If `is_stuck >= 0.7`, execute `action`: `rollback-git`, `fresh-approach`, or
`ask-human`. Never a third blind edit.

## Hard rules

- Fail-open: error, timeout, 401, 403, 429: proceed with LLM judgment, one-line note, max one retry. A routing call never blocks a session.
- Advisory only: Jev's output is an advisory decision score; user direction always overrides Jev.
- Full protocol and thresholds: `skills/jev-decision/SKILL.md`.
