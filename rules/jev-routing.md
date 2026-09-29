# Rule: jev-routing — call Jev only for complex decisions

Jev (System One `jev-1.13`) is a **decision-only** model. It never generates
text or code. The chat LLM proposes; Jev disposes.

## Principle

Call Jev only when torn between 2+ plausible options AND a wrong pick is
costly (rework, session direction, large token spend). Obvious / trivial /
explicit-instruction → skip Jev entirely: no call, no note. Pre-check
(free): "am I torn?" Not torn → don't call.

## When to call (`node skills/jev-decision/scripts/jev-decide.mjs`)

- `-Preset route` — plan-first vs code-now, or task owner unclear
  (non-trivial tasks only, once at task start).
- `-Preset skill-match -CandidatesJson '<shortlist>'` — 2+ plausible
  skills (obvious/none → load/skip directly, no call; UNCERTAIN
  `load_now` → defer until that work starts).
- `-Preset delegation` — inline vs subagent unclear (spawn only on
  `needs_subagent` YES `>=0.7`; uncertain → inline).

Full protocol + thresholds → `skills/jev-decision/SKILL.md`
(Routing layer section). No auto-router plugin, by design.

## Hard rules

- **Fail-open**: error/timeout/401/403/429 → LLM judgment + one-line
  note, max 1 retry. A routing call never blocks a session.
- **Never** Jev as `model`; verdicts advisory, user wins; keys/endpoints
  via env or `opencode.json` only.
