---
name: jev-decision
description: "Fast structured decisions via System One decision endpoint (Jev jev-1.13). Use for routing, triage, delegation, review/test/UI gates. Returns typed choice/noul/score with probabilities, not text. Triggers: jev, systemone, triage, route, delegation gate, review gate, test scope."
---

# Jev Decision (System One, bring-your-own endpoint)

Jev is a decision-only model. It never generates text or code. It scores a `state` string against typed `questions` and returns calibrated answers in ~100-500ms. Use it at decision points; keep the chat LLM for generation.

- Endpoint: `POST <JEV_ENDPOINT>` (full decision URL, e.g. `https://<YOUR_PROVIDER_BASE_URL>/systemone`). Supply via `-Endpoint` param, `JEV_ENDPOINT` env var, or `providers.<your-provider>.settings.baseURL` in opencode.json (script appends `/systemone`).
- Model: `openrouter/typesafe/jev-1.13` default (verified live 2026-09-23, context 200k). Override via `-Model` param or `JEV_MODEL` env var.
- Auth: `Authorization: Bearer <your key>` - supply via `-ApiKey` param, `JEV_API_KEY` env var, or `providers.<your-provider>.settings.apiKey` in opencode.json.
- Wrapper: `powershell -NoProfile -File ~/.config/opencode/skills/jev-decision/scripts/jev-decide.ps1 -Preset <name> -State "<state>"`

## Setup (fill in your own endpoint + key)

This repo ships **no endpoint and no key**. Fill in your own before calling:

1. Pick a System One-compatible decision provider and create a key.
2. Set env vars in your shell profile (or pass `-Endpoint` / `-ApiKey` per call):
   - `JEV_ENDPOINT` = full decision URL (e.g. `https://<YOUR_PROVIDER_BASE_URL>/systemone`)
   - `JEV_API_KEY` = your key (optional `JEV_MODEL` overrides the default model)
3. Or configure `providers.<your-provider>.settings.baseURL` + `settings.apiKey` in `opencode.json` (the script reads the first provider with both set; `{env:VAR}` placeholders are resolved).
4. Test: `powershell -NoProfile -File ~/.config/opencode/skills/jev-decision/scripts/jev-decide.ps1 -Preset triage -State "hello"`. Missing values fail fast with a Setup pointer, never with a credential.
## Question schema (verified against live endpoint)

- `choice`: `{ "type": "choice", "instructions": "...", "criteria": { "<opt>": "<what it means>" } }` -> `{ "choice": "<opt>", "probabilities": {...}, "confidence": 0..1 }`
- `noul` (yes/no): `{ "type": "noul", "instructions": "...?" }` -> `{ "noul": 0..1 }` (probability YES)
- `score`: `{ "type": "score", "instructions": "...", "criteria": ["<dim1>", "<dim2>"] }` -> `{ "score": 0..1, "legend": {...}, "confidence": 0..1 }`
- Multiple questions in one call run in parallel. Keep `state` dense: request + diff stat + risk signals, 2-6 sentences.

## Presets (wrapper `-Preset`, fixed questions, agent only supplies `-State`)

| Preset | Questions |
|---|---|
| `triage` | `task_type` choice[simple-edit, feature, ui, refactor, bug, docs], `needs_plan` noul, `risk` score[security, blast-radius] |
| `delegation` | `owner` choice[builder-inline, designer, reviewer, tester, documenter], `can_parallel` noul, `complexity` score[coordination-cost, domain-risk] |
| `review` | `spec_match` score[spec-coverage, scope-discipline], `security_risk` score[injection, auth, exposure], `merge_ready` noul, `needs_tester` noul |
| `test` | `needs_tests` noul, `test_scope` choice[unit, integration, e2e, all], `bug_risk` score[regression-likelihood, blast-radius] |
| `ui` | `needs_designer` noul, `ui_complexity` score[layout, interaction, visual-system], `a11y_risk` score[keyboard, contrast, focus] |
| `verify` | `spec_fit` score[requirement-coverage, constraint-fit], `decision_risk` score[failure-impact, reversibility], `proceed` noul, `needs_human` noul |

Custom questions: `-QuestionsJson '{...}'` (overrides preset).

## Verify pattern (anti-hallucination)

LLM proposes, Jev disposes. Research first (webfetch docs, check code/patterns), then verify — never ask Jev to choose from an empty head.

State must contain: (1) proposal, (2) alternatives with one-line rejection reason each, (3) evidence (doc URLs, file:line refs, constraints). No alternatives/evidence -> do more research first, do not call.

Picking among candidates (custom choice, options filled by the agent from its own research): pass -QuestionsJson with a pick choice whose criteria maps each candidate to its evidence summary, plus spec_fit score and needs_human noul. Risk-tiered bar (strict only where it hurts). LOW risk (`decision_risk<=0.3`, reversible, small blast radius): `proceed>=0.6` + `needs_human<=0.4` -> implement, log numbers in one line; below -> treat as MID. MID: `proceed>=0.7` + `needs_human<=0.3` -> implement with the risk noted in output; `needs_human>=0.7` or `proceed<=0.3` -> ask; middle -> research once, re-verify, then implement-with-note unless `needs_human>=0.7`. HIGH risk (`decision_risk>=0.7`, or auth/payment/migration/irreversible whatever the score): `proceed>=0.8` + `needs_human<=0.2` + `confidence>=0.5` -> implement, else ask with numbers; never guess through a low score here. Same tiers for `pick` (use its `confidence`). Batch: collect every verify-ask in a phase and ask once, not once per decision. Max 2 verify calls per decision.

## Thresholds (apply everywhere, deterministic)

- noul: `>=0.7` = YES, `<=0.3` = NO, else UNCERTAIN -> take the safer branch (needs_plan=true, needs_tester=true, needs_tests=true). (verify preset uses its own strict bar, see Verify pattern).
- choice: use `.choice`; if `.confidence < 0.4` -> UNCERTAIN -> default `builder-inline` (triage/delegation) or `all` (test_scope).
- score: `>=0.7` HIGH, `<=0.3` LOW. `risk/security_risk/bug_risk >= 0.7` always adds `reviewer` (plus `tester` on auth/migration/payment).

## Fallback (hard rule)

Script failure (network, 401/403/429, 400, timeout) -> proceed with LLM judgment, never block, note `Jev unavailable, used LLM judgment` in one line. Never retry more than once per decision point. Never use Jev as `model`/`small_model`/`agents.*.model` (it cannot generate text or call tools).

