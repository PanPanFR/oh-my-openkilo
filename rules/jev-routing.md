# Rule: jev-routing — Jev classifies agent, skills, subagent dispatch

Jev (System One `jev-1.13`) is a **decision-only** model. It never generates
text or code. The chat LLM proposes; Jev disposes. This rule wires three
routing classifications into every non-trivial task.

## When to call (wrapper: `node skills/jev-decision/scripts/jev-decide.mjs`)

| Decision point | Call | Answers |
|---|---|---|
| Task/session start (non-trivial work) | `-Preset route` | owner agent (6 options), `needs_planner`, `needs_subagent`, `fit` score |
| Mid-task step ownership | `-Preset delegation` | `owner`, `can_parallel`, `needs_subagent`, `context_isolation` score |
| Skill loading | `-Preset skill-match -CandidatesJson '<shortlist>'` | `skill_pick`, `load_now`, `mismatch_risk` score |

The `plugins/jev-router.ts` plugin runs `route` automatically on each new
user message and injects an advisory JEV ROUTING block into session context.
Manual calls above are for mid-task decisions and skill matching.

## Skill-match protocol (LLM proposes, Jev disposes)

1. Shortlist 5–8 candidate skills from installed skill descriptions — never
   feed all 54; Jev picks, the LLM filters.
2. One call:
   `jev-decide.mjs -Preset skill-match -CandidatesJson '{"skill-a":"evidence","skill-b":"evidence"}' -State "<goal>"`
3. `skill_pick=none` → load nothing; trust LLM judgment.
4. Candidates must be `{ name: one-line evidence }`, max 12.

## Thresholds (deterministic, no exceptions)

- `noul`: `>=0.7` YES, `<=0.3` NO, else UNCERTAIN → safer branch:
  `needs_planner`/`needs_tester`/`needs_tests` → treat as YES;
  `needs_subagent` → treat as NO (inline is the cheaper default).
- `choice`: use `.choice`; `confidence < 0.4` → default `builder` (route) or
  `builder-inline` (delegation).
- `score`: read per-dimension `probabilities` via `legend`, NEVER the
  aggregate `score`. `>=0.7` HIGH, `<=0.3` LOW. `confidence < 0.4` → risk
  dims treated HIGH.

## Hard rules

- **Fail-open**: script error, timeout, 401/403/429 → proceed with LLM
  judgment, one-line note `Jev unavailable, used LLM judgment`. Max 1 retry
  per decision point. Routing must never block or brick a session.
- **Never** set jev as `model` / `small_model` / `agents.*.model`.
- Verdicts are **advisory**; explicit user instructions always win.
- Kill-switch: `JEV_ROUTER=off` disables the plugin (manual calls unaffected).
- Endpoints/keys only via `JEV_ENDPOINT` / `JEV_API_KEY` env or
  `opencode.json` providers — never hardcoded.
