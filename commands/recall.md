---
description: Search past session observations for relevant context via agentmemory memory_smart_search
---
Search past session observations for relevant context. Wraps the `memory_smart_search` MCP tool. Lessons may be injected as DATA at session start when available; still run recall for observations, never assume lesson coverage.

## Usage

```
/recall [query]
```

## Instructions

1. Call `memory_smart_search` with the query and `limit: 10` (hybrid BM25 + vector + graph search). Full grouping and anti-hallucination workflow lives in `skills/recall/SKILL.md`; follow it.
2. Combine results and present to the user:
   - Group by session
   - Show type, title, and narrative for each observation
   - Highlight high-importance (>= 7) observations
3. If no results, suggest 2-3 alternative search terms.
4. **Never hallucinate results.** Only present what the MCP tools actually return.
