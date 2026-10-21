---
name: jev-decision
description: "Fast structured decisions via 9router System One (Jev jev-1.13). Use for routing, triage, delegation, review/test/UI gates. Returns typed choice/noul/score with probabilities, not text. Triggers: jev, systemone, triage, route, delegation gate, review gate, test scope."
---

# Jev Decision (System One, via 9router)

Jev is a decision-only model. It never generates text or code. It scores a `state` string against typed `questions` and returns calibrated answers in ~100-500ms. Use it at decision points; keep the chat LLM for generation.

- Endpoint: `POST <baseURL>/systemone` (configured via `providers.9router.settings.baseURL` in opencode.json, or `JEV_ENDPOINT` env var)
- Model: `openrouter/typesafe/jev-1.13` (verified live 2026-09-23, context 200k)
- Auth: `Authorization: Bearer <9router key>` (same key as `providers.9router.settings.apiKey`)
- Wrapper: `node ~/.config/opencode/skills/jev-decision/scripts/jev-decide.mjs -Preset <name> -State "<state>"` (recommended, ~50ms startup) or pwsh `node ~/.config/opencode/skills/jev-decision/scripts/jev-decide.mjs -Preset <name> -State "<state>"`
- State structure: `Goal: <request> | Files: <git status --short> | Diff: <git diff --stat> | Risks: <known risks>`. Dense, structured facts maximize confidence.
- Pure Q&A / read-only chat: skip triage gate entirely.
- State with quotes/newlines/backticks: pipe via stdin to node script, or pass `-StateFile <path>` (CLI quoting breaks otherwise)

## Question schema (verified against live endpoint)

- `choice`: `{ "type": "choice", "instructions": "...", "criteria": { "<opt>": "<what it means>" } }` -> `{ "choice": "<opt>", "probabilities": {...}, "confidence": 0..1 }`
- `noul` (yes/no): `{ "type": "noul", "instructions": "...?" }` -> `{ "noul": 0..1 }` (probability YES)
- `score`: `{ "type": "score", "instructions": "...", "criteria": ["<dim1>", "<dim2>"] }` -> `{ "score": 0..1, "legend": {...}, "confidence": 0..1 }`
- Multiple questions in one call run in parallel. Keep `state` dense: request + diff stat + risk signals, 2-6 sentences.

## Logging (eval trail)

Every call appends one JSONL line to `skills/jev-decision/logs/jev-decisions.jsonl` — the eval set for threshold tuning (review accuracy per confidence band before moving thresholds).

- Path override: `-LogFile <path>` or `JEV_LOG=<path>`. Disable: `-NoLog` or `JEV_LOG=off`.
- Fields: `ts`, `preset`, `model`, `endpoint` (host only), `latencyMs`, `status` (`ok|http-error|timeout|network-error`), full `state`, full `questions`, `answers` on success.
- API key never logged. Log write failures never block a decision (best-effort, fail-open).

## Presets (wrapper `-Preset`, fixed questions, agent only supplies `-State`)

| Preset | Questions |
|---|---|
| `triage` | `task_type` choice[simple-edit, feature, ui, refactor, bug, docs, recon], `needs_plan` noul, `risk` score[security, blast-radius] |
| `delegation` | `owner` choice[builder-inline, designer, reviewer, tester, documenter], `can_parallel` noul, `complexity` score[coordination-cost, domain-risk], `needs_subagent` noul, `context_isolation` score[coordination-cost, context-cost] |
| `route` | `agent` choice[builder, planner, designer, tester, reviewer, documenter], `needs_planner` noul, `needs_subagent` noul, `fit` score[domain-match, context-cost] |
| `skill-match` | `skill_pick` choice[runtime candidates + none], `load_now` noul, `mismatch_risk` score[context-waste, guidance-mismatch] |
| `review` | `spec_match` score[spec-coverage, scope-discipline], `security_risk` score[injection, auth, exposure], `merge_ready` noul, `needs_tester` noul |
| `test` | `needs_tests` noul, `test_scope` choice[unit, integration, e2e, all], `bug_risk` score[regression-likelihood, blast-radius] |
| `ui` | `needs_designer` noul, `ui_complexity` score[layout, interaction, visual-system], `a11y_risk` score[keyboard, contrast, focus] |
| `verify` | `spec_fit` score[requirement-coverage, constraint-fit], `decision_risk` score[failure-impact, reversibility], `proceed` noul, `needs_human` noul |
| `curate-memory` | `is_durable` noul, `action` choice[save, lesson, drop], `quality` score[specificity, future-reusability] |
| `loop-breaker` | `is_stuck` noul, `action` choice[rollback-git, fresh-approach, ask-human, continue-tweak], `root_cause` score[assumption-gap, tooling-environment] |

Custom questions: `-QuestionsJson '{...}'` (overrides preset).

## Routing layer (agent / skill / subagent classification)

Three decision points, wired via `rules/jev-routing.md` (manual, complex-only — no auto-router plugin by design):

1. **Agent routing** (`-Preset route`, manual — once at task start for non-trivial work): who owns the task — builder, planner, designer, tester, reviewer, documenter. `needs_subagent` uncertain → default inline (cheaper); `needs_planner` uncertain → treat as YES (safer).
2. **Skill routing** (`-Preset skill-match -CandidatesJson '<shortlist>'`): LLM shortlists 2-8 candidate skills from descriptions (obvious/none → load/skip directly, no call), Jev picks (or `none`). Candidates = `{ "skill-name": "one-line evidence" }`, max 12, non-empty names, merged into the `skill_pick` choice criteria. LLM proposes, Jev disposes — same anti-hallucination rule as the Verify pattern. Apply the answers together: `load_now` `>=0.7` → load immediately; `<=0.3` or UNCERTAIN → defer until the matching work starts (never spend context on a maybe). `mismatch_risk` dimension `>=0.7` → re-check the shortlist before loading.
3. **Subagent dispatch** (`-Preset delegation`, extended): `needs_subagent` noul + `context_isolation` score[coordination-cost, context-cost] alongside the existing owner/parallel questions. Spawn only on YES (>=0.7); uncertain → inline.

No auto-router plugin (deleted by design — manual complex-only calls); verdicts are advisory — explicit user instructions always win.

## Verify pattern (anti-hallucination)

LLM proposes, Jev disposes. Research first (webfetch docs, check code/patterns), then verify — never ask Jev to choose from an empty head.

State must contain: (1) proposal, (2) alternatives with one-line rejection reason each, (3) evidence (doc URLs, file:line refs, constraints). No alternatives/evidence -> do more research first, do not call.

Picking among candidates (custom choice, options filled by the agent from its own research): pass -QuestionsJson with a pick choice whose criteria maps each candidate to its evidence summary, plus spec_fit score and needs_human noul. Risk-tiered bar (strict only where it hurts); all score tiers below read max `probabilities` dimension, never aggregate `score`. LOW risk (`decision_risk` all dims <=0.3, reversible, small blast radius): `proceed>=0.6` + `needs_human<=0.4` -> implement, log numbers in one line; below -> treat as MID. MID: `proceed>=0.7` + `needs_human<=0.3` -> implement with the risk noted in output; `needs_human>=0.7` or `proceed<=0.3` -> ask; middle -> research once, re-verify, then implement-with-note unless `needs_human>=0.7`. HIGH risk (`decision_risk` any dim >=0.7, or auth/payment/migration/irreversible whatever the score): `proceed>=0.8` + `needs_human<=0.2` + `confidence>=0.5` -> implement, else ask with numbers; never guess through a low score here. Same tiers for `pick` (use its `confidence`). Batch: collect every verify-ask in a phase and ask once, not once per decision. Max 2 verify calls per decision.

## Thresholds (apply everywhere, deterministic)

- noul: `>=0.7` = YES, `<=0.3` = NO, else UNCERTAIN -> take the safer branch (needs_plan=true, needs_tester=true, needs_tests=true). (verify preset uses its own strict bar, see Verify pattern).
- choice: use `.choice`; if `.confidence < 0.4` -> UNCERTAIN -> default `builder-inline` (triage/delegation), `builder` (route), or `all` (test_scope).
- score: read `probabilities` (index -> dimension via `legend`), NEVER the aggregate `score` — aggregate tracks only the LAST dimension (verified live 2026-09-23: risk security=0.46/blast=0.54 -> score 0.54). Per-dimension: prob `>=0.7` = HIGH, `<=0.3` = LOW. Any `risk/security_risk/bug_risk` dimension `>=0.7` always adds `reviewer` (plus `tester` on auth/migration/payment); gate the security dimension directly, never via aggregate.
- score confidence: `score.confidence < 0.4` -> UNCERTAIN -> safer branch: risk dims (`risk/security_risk/bug_risk/decision_risk`) treated HIGH, all other dims treated as the conservative default (needs_plan/needs_tester/needs_tests = true).
- curate-memory: `is_durable <= 0.3` or `action == "drop"` -> abort save, echo reason; `action == "lesson"` -> route to `memory_lesson_save`.
- loop-breaker: `is_stuck >= 0.7` -> hard stop on further code edits; strictly execute chosen `action` (rollback, fresh approach, or ask human).

## Fallback (hard rule)

Script failure (network, 401/403/429, 400, timeout) -> proceed with LLM judgment, never block, note `Jev unavailable, used LLM judgment` in one line. Never retry more than once per decision point. Never use Jev as `model`/`small_model`/`agents.*.model` (it cannot generate text or call tools).
