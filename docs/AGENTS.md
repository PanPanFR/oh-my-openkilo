# Agents

oh-my-openkilo ships **7 agents** in `agents/`. Each is a single markdown file: YAML frontmatter at the top (name, mode, model, tools) and a prompt body. Edit the file to change behavior, edit the `model:` line to swap models, edit `tools:` to change permissions. No build step.

The pack divides the team into **2 primary agents** (you talk to them directly) and **5 subagents** (primaries fan out work to them in parallel). Two of OpenCode's built-in agents are disabled to avoid duplication: `build` (replaced by `builder`) and `plan` (replaced by `planner`).

## Quick reference

| # | Agent | Mode | Default model | When to use |
|---|-------|------|---------------|-------------|
| 01 | `builder` | primary | `opencode/nemotron-3-ultra-free` | Default implementation. Triage, fan-out. |
| 02 | `planner` | primary | `opencode/muse-spark-1.2-contributor-free` | Pre-impl design, architecture, plan files. |
| 03 | `designer` | subagent | `opencode/muse-spark-1.2-contributor-free` | UI/UX, design system, a11y. Multimodal preferred for visual work. |
| 04 | `tester` | subagent | `opencode/mimo-v2.5-free` | Test suites: write, run, isolate failures. |
| 05 | `reviewer` | subagent | `opencode/nemotron-3-ultra-free` | Diff + security review. Read-only. |
| 06 | `documenter` | subagent | `opencode/muse-spark-1.2-contributor-free` | README, runbook, API docs in `docs/`. |
| 07 | `integrator` | subagent | `opencode/muse-spark-1.3-contributor-free` | Git/CI integration: branch sync, conflicts, merge readiness. |

---

## Primary agents

### 01. `builder` — The Architect

**Role:** Default implementation agent. Triage incoming work: trivial fixes get done directly, anything that needs design gets routed to `planner`, anything that needs specialized hands gets fanned out to subagents.

**When to invoke:** any coding task, especially anything that touches more than one file or has multiple valid approaches.

**Prompt:** [`agents/builder.md`](../agents/builder.md)

**Default model:** `opencode/nemotron-3-ultra-free`

**Recommended models:** any strong instruction-following coding model. Swap to `anthropic/claude-sonnet-4-5`, `openai/gpt-5`, or `9router/Kimi-K2.6` if you have provider credentials and want higher quality on complex tasks.

**Model guidance:** `builder` is a generalist that delegates. It does not need your strongest reasoning model; it needs a model that's good at following delegation rules and not jumping to code before the design is settled. Free models are fine for everyday work.

**Tools:** `read`, `write`, `edit`, `bash`, `glob`, `grep`, `todowrite`, `task`, `mcp`, `webfetch`, `websearch`

**Dispatched by:** you, directly. `builder` is the default agent when you start a session.

**Dispatches to:** `planner` (complex design), `designer` (UI), `tester` (tests), `reviewer` (security/quality), `documenter` (docs), `integrator` (git/CI integration).

---

### 02. `planner` — The Oracle

**Role:** Pre-implementation design partner. Reads the brief, gathers codebase evidence via `graphify query`/`graphify path` and native `webfetch`/`websearch`, then writes a plan you confirm before any code is touched. The "think before you ship" agent.

**When to invoke:** new feature, big refactor, architecture decision, anything where you'd otherwise waste an hour coding the wrong thing.

**Prompt:** [`agents/planner.md`](../agents/planner.md)

**Default model:** `opencode/muse-spark-1.2-contributor-free`

**Recommended models:** strong reasoning and planning models. Worth paying for: `anthropic/claude-sonnet-4-5`, `openai/gpt-5`, `9router/Minimax-M3` (1M context, good for big repos).

**Model guidance:** `planner` does the high-leverage work — it decides what to build and how. A weak model here means a weak plan, which means wasted implementation time downstream. If you mix free + paid, this is the agent to upgrade first.

**Tools:** `read`, `write`, `edit`, `glob`, `grep`, `todowrite`, `task`, `mcp`, `webfetch`, `websearch` (no direct `bash`; planning happens in markdown files)

**Dispatched by:** you, directly, or by `builder` when it judges a task is too complex to implement without design.

**Dispatches to:** `reviewer` (during analysis), with `designer`, `tester`, `documenter`, `integrator` recommended in the plan for the parent to run.

---

## Subagents

### 03. `designer` — The Frontend Specialist

**Role:** UI/UX, React/Next.js, design systems, accessibility, frontend performance. Visual reviews and frontend polish via screenshots when available; falls back to text-only feedback otherwise.

**When to invoke:** new screen, design exploration, brand consistency check, frontend perf audit, accessibility review.

**Prompt:** [`agents/designer.md`](../agents/designer.md)

**Default model:** `opencode/muse-spark-1.2-contributor-free`

**Recommended models:** strong UI/UX judgment + frontend implementation. Good fits: `anthropic/claude-sonnet-4-5`, `google/gemini-2.5-pro`, `9router/Gemini-3.6-Flash`.

**Model guidance:** Choose a model that is strong at UI/UX judgment, frontend implementation, and visual polish. Multimodal is a plus because the agent reviews screenshots and mockups.

**Tools:** `read`, `write`, `edit`, `bash`, `glob`, `grep`, `todowrite`, `mcp`, `webfetch`, `websearch`

**Required MCP:** none. Multimodal model recommended for visual work; text-only is fine for design review and a11y.

**Dispatched by:** `builder` or `planner` when the task involves UI/UX work.

---

### 04. `tester` — The Quality Gate

**Role:** Writes test suites, runs them, iterates failures in isolation. Reports compact results: which tests pass, which fail, which are flaky, what's the next action. Never mixes "write the feature" with "test the feature".

**When to invoke:** you just wrote code that needs coverage, or a CI test is failing locally and you want a systematic isolation loop instead of guessing.

**Prompt:** [`agents/tester.md`](../agents/tester.md)

**Default model:** `opencode/mimo-v2.5-free`

**Recommended models:** reliable test-running model. Good fits: any `9router/*` or `opencode/*` model with solid bash execution. No need for a frontier model.

**Model guidance:** `tester` runs shell commands a lot (test runners, fixtures, isolation). Pick a model that handles `bash` reliably and is comfortable reading test output, not one that's good at "creative" reasoning.

**Tools:** `read`, `write`, `bash`, `glob`, `grep`, `todowrite`, `mcp`

**Dispatched by:** `builder` after implementation, or by you when a test fails.

---

### 05. `reviewer` — The Diff Detective

**Role:** Read-only code + security review. Compares a diff against the repo's standards and the originating spec. Catches things you missed: race conditions, missing error handling, security smells, off-by-one, wrong abstractions. Never edits.

**When to invoke:** you finished a chunk of work and want a sanity check before merging, or you're about to touch auth/data and want a second pair of eyes.

**Prompt:** [`agents/reviewer.md`](../agents/reviewer.md)

**Default model:** `opencode/nemotron-3-ultra-free`

**Recommended models:** strong reasoning + security awareness. Worth paying for on auth/data paths: `anthropic/claude-sonnet-4-5`, `openai/gpt-5`, `9router/GLM-5.1`.

**Model guidance:** `reviewer` reads code and produces a verdict, not a fix. It benefits from a model that's good at finding edge cases and security smells, not from raw code generation speed. For security-sensitive work (auth, crypto, payments), upgrade to your strongest model.

**Tools:** `read`, `glob`, `grep`, `bash`, `mcp` (read-only by design; no `write`/`edit`)

**Dispatched by:** `builder` and `planner` for sanity checks, or by you via "Ask `reviewer` to look at this diff".

---

### 06. `documenter` — The Technical Writer

**Role:** Creates and improves documentation in `docs/`, verified against the actual code (not vibes). Useful for READMEs, runbooks, onboarding guides, API docs. Will not write docs that lie about what the code does.

**When to invoke:** you shipped a new module and the README is lying, you need a how-to for a tricky setup, or you want API docs that match the current behavior.

**Prompt:** [`agents/documenter.md`](../agents/documenter.md)

**Default model:** `opencode/muse-spark-1.2-contributor-free`

**Recommended models:** long-context writing model. Good fits: `9router/Minimax-M3` (1M context for big codebases), `anthropic/claude-sonnet-4-5`.

**Model guidance:** Documentation work rewards context. The agent reads code, summarizes it, and produces prose. A 1M-context model means it can hold a whole repo in mind while writing; a small-context model means it makes things up.

**Tools:** `read`, `write`, `edit`, `glob`, `grep`, `mcp` (no `bash`)

**Dispatched by:** `builder` when implementation touches user-facing surfaces, or by you directly.

---

### 07. `integrator` — The Boundary Keeper

**Role:** Owns the boundary between completed implementation branches and main. Branch inspection, synchronization, conflict detection and assistance, CI/test status, merge readiness, integration order, branch/worktree cleanup.

**When to invoke:** a feature branch is done and needs to land, you suspect merge conflicts, CI is red before a merge, or you want an integration order for a multi-branch plan.

**Prompt:** [`agents/integrator.md`](../agents/integrator.md)

**Default model:** `opencode/muse-spark-1.3-contributor-free`

**Recommended models:** strong git reasoning + careful shell use. Good fits: `anthropic/claude-sonnet-4-5`, `9router/Kimi-K2.6`. Accuracy matters more than speed: a wrong merge verdict is expensive.

**Model guidance:** `integrator` runs git commands and cites their output for every claim. Pick a model that follows strict reporting formats and never improvises destructive git actions.

**Tools:** `read`, `edit`, `bash`, `glob`, `grep`, `mcp`, `webfetch`, `websearch`, `lsp`, `skill` (no `write`, no `task`; edits limited to conflict assistance)

**Dispatched by:** `builder` after implementation is verified, or per the plan's integration order.

---

## Built-in OpenCode agents (disabled)

The pack disables two of OpenCode's built-in agents to avoid duplication:

- `build` is replaced by `builder`
- `plan` is replaced by `planner`

To re-enable them, edit your `opencode.json` and remove the corresponding `disable: true` entries under `agent.`.

## How to invoke

In a normal OpenCode session, you can either:

- Let `builder` pick the right subagent automatically (most common).
- Be explicit: "Ask `tester` to write tests for the auth module", "Have `reviewer` sanity-check this diff", "Have `designer` review the UI for a11y".

Subagents are also dispatched by `builder` and `planner` via the `task` tool, in parallel when the subtasks are independent.

## How to change a model

1. Open the agent's `.md` file under `~/.config/opencode/agents/` (the file the installer copied; same as the source in `agents/`).
2. Edit the `model:` line. Use the format `<provider>/<model>` (e.g. `anthropic/claude-sonnet-4-5`, `openai/gpt-5`, `9router/Kimi-K2.6`).
3. Save and run `/reload` (or restart OpenCode).

Free models are good for everyday work but slower and less capable than paid ones. If you have provider credentials configured in `opencode.json`, a useful split is:

- **Cheap/free for:** `tester`, `documenter`
- **Pay for:** `builder`, `planner`, `designer`, `reviewer` (especially on auth/data paths)
- **Accuracy over speed:** `integrator` (git verdicts must be cited and correct)

## Adding a new agent

See [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-new-agent--skill--rule). New agents are typically subagents specialized for one job that the existing 7 don't cover well.
