---
description: MANDATORY skill loading before any implementation task. Never skip skill check.
alwaysApply: true
---

# Skill Check - Every Task

FIRST ACTION before ANY task: recall via agentmemory (`memory_smart_search`, task keywords).

Before implementing: scan skill list, load matching skill via `skill` tool -> follow it. Most specific wins; independent concerns -> load all parallel. Unsure -> load anyway (skipped relevant skill costs quality). Load BEFORE any code written or command run.

## Graphify Hard Gate

Codebase-relation question (data flow, callers, where defined, architecture, >2 files) -> `graphify query` FIRST, before grep/read. No exceptions. graphify-out/ missing in nontrivial task -> `graphify .` once, then use it. New code missing from graph -> `graphify --update` (incremental), then query. Reject skip excuses ("project is small", "grep is quicker").
