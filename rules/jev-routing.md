# Rule: jev-routing - optional decision check

Jev (System One `jev-1.13`) is a decision-only model. It never generates text or
code. The chat LLM proposes; Jev disposes. Default is **do not call**.

## Principle

Call Jev only when both are true:

1. You are torn between 2+ plausible options.
2. A wrong pick is costly (rework, session direction, large token spend,
   irreversible change).

Free pre-check: "am I actually torn?" Not torn: do not call. Obvious,
single-option, explicit-instruction, or trivial tasks: skip with no note and no
mention.

## When a call earns its cost

- `-Preset route`: plan-first vs code-now, or owner unclear, on a non-trivial
  task. Once at task start.
- `-Preset skill-match -CandidatesJson '<shortlist>'`: 2+ genuinely plausible
  skills. No candidates or one obvious winner: load or skip directly.
- `-Preset delegation`: inline vs subagent genuinely unclear. Spawn only on
  `needs_subagent >= 0.7`; uncertain means inline.
- `-Preset verify`: irreversible or high-impact approach (auth, payments,
  migrations, data model, public API).
- `-Preset review`, `test`, `ui`: only when scope is genuinely unclear.

Measured cost on this machine: roughly 1.5-2 seconds plus tokens per call. That
is the whole reason this stays optional.

## Loop-breaker (the one mandatory call)

After 2 consecutive failed attempts at the same problem (same failing test,
same build error, repeated syntax loop), stop editing and run:

```bash
node ~/.config/opencode/skills/jev-decision/scripts/jev-decide.mjs \
  -Preset loop-breaker -State "<error + attempts + recent diff>"
```

If `is_stuck >= 0.7`, execute `action`: `rollback-git`, `fresh-approach`, or
`ask-human`. Never a third blind edit.

## Hard rules

- Fail-open: error, timeout, 401, 403, 429: use LLM judgment, one-line note, max
  one retry. A routing call never blocks a session.
- Never use Jev as the session `model`. Verdicts are advisory; the user wins.
- Keys and endpoints come from env or `opencode.json` only.
- Full protocol and thresholds: `skills/jev-decision/SKILL.md`.
