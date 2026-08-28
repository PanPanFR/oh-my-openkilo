---
description: Use graphify knowledge graph for all codebase questions, architecture exploration, and file relationship queries.
alwaysApply: true
---

# Graphify

Knowledge graph at `graphify-out/`. Any task needing codebase understanding uses it automatically - no asking, no ceremony.

1. **Graph exists** (`graphify-out/graph.json`): start with `graphify query "<question>"`; `graphify path "<A>" "<B>"` for relationships; `graphify explain "<concept>"` for concepts.
2. **Graph missing**: init once with `graphify update .`, then continue.
3. **After modifying code**: run `graphify update .`.

## Rules

- `/graphify` typed by user -> use the graphify skill/instructions before anything else.
- Skip only if the task is about stale/incorrect graph output or the user opts out.
- Prefer `graphify-out/wiki/index.md` for broad navigation; read `GRAPH_REPORT.md` only when query/path/explain are insufficient.
