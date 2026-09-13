Search past session observations for relevant context. Wraps the `memory_smart_search` MCP tool. Lessons surface separately: they are injected at session start, no extra call needed.

## Usage

```
/recall [query]
```

## Instructions

1. Call `memory_smart_search` with the query and `limit: 10` (hybrid BM25 + vector + graph search).
2. Combine results and present to the user:
   - Group by session
   - Show type, title, and narrative for each observation
   - Highlight high-importance (>= 7) observations
3. If no results, suggest 2-3 alternative search terms.
4. **Never hallucinate results.** Only present what the MCP tools actually return.
