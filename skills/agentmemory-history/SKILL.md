---
name: agentmemory-history
description: >
  Read past work: resume the last session, recap recent sessions, list
  agent-linked commits, trace a line back to the session that wrote it, or
  compact the current conversation for handoff. Use when the user says
  "where were we", "resume", "recap", "session history", "what did we do",
  "why is this code here", "who wrote this", or "handoff".
argument-hint: "[last N | today | this week | file:line | branch=...]"
---

# agentmemory history

Session archaeology over agentmemory. Every workflow reads `memory_sessions`,
`memory_recall`, or `memory_commits`; pick the row that matches the question.

In `AGENTMEMORY_TOOLS=core` mode, `memory_commits` and `memory_commit_lookup`
are hidden. Use the REST fallback in `../_shared/TROUBLESHOOTING.md`.

## Route

| Question | Workflow |
|----------|----------|
| "where were we" / resume / handoff | `references/handoff.md` |
| "what have we been doing" / recap window | `references/recap.md` |
| "past sessions" / timeline overview | `references/session-history.md` |
| "why is this code here" / blame to session | `references/commit-context.md` |
| "what has the agent shipped" / linked commits | `references/commit-history.md` |
| compact this conversation for another agent | `references/handoff-compact.md` |

## Core rules

- Match sessions to the project by **directory boundary**, not raw string
  prefix. A sibling repo is never "this project".
- A `commit: null` lookup means the commit predates session linking. Say so; do
  not invent intent from the diff.
- Empty results are a real answer. Never narrate activity the tools did not
  return.
- Surface an unanswered user question first when resuming.
- Handoff documents go to the OS temp directory, never the workspace, and
  redact secrets.
- Cite short session ids (first 8 chars) and observation counts so the user can
  verify.
