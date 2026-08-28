---
name: web-perf
description: Use for performance audits, Core Web Vitals (LCP/INP/CLS), Lighthouse scores, page speed optimization via Chrome DevTools MCP
---

# Web Performance Audit

Chrome DevTools MCP-driven audit workflow with CWV thresholds and root-cause trees.

## Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| INP | < 200ms | 200ms - 500ms | > 500ms |
| FCP | < 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | < 800ms | 800ms - 1800ms | > 1800ms |
| TBT | < 200ms | 200ms - 600ms | > 600ms |
| Speed Index | < 3.4s | 3.4s - 5.8s | > 5.8s |

## Retrieval Sources

| Source | URL | Use for |
|--------|-----|---------|
| web.dev | https://web.dev/articles/vitals | CWV thresholds, definitions |
| Chrome DevTools | https://developer.chrome.com/docs/devtools/performance | Tooling APIs, trace analysis |
| Lighthouse | https://developer.chrome.com/docs/lighthouse/performance/performance-scoring | Score weights, metric thresholds |

## MCP Setup Required

```json
"chrome-devtools": {
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
}
```

## Workflow

### Phase 1: Performance Trace
```
navigate_page(url: "<target-url>")
performance_start_trace(autoStop: true, reload: true)
```

### Phase 2: Core Web Vitals Analysis
Use `performance_analyze_insight`:

| Metric | Insight Name | What to Look For |
|--------|--------------|------------------|
| LCP | LCPBreakdown | TTFB, resource load, render delay breakdown |
| CLS | CLSCulprits | Elements causing shifts (no dims, font swap, injected) |
| INP | INPBreakdown | Main thread blocking, long tasks, event handlers |
| Render Blocking | RenderBlocking | CSS/JS blocking first paint |
| Network Dependencies | NetworkRequestsDepGraph | Request chains delaying critical resources |

### Phase 3: Network Analysis
```
list_network_requests(resourceTypes: ["Script", "Stylesheet", "Document", "Font", "Image"])
```
Look for:
1. Render-blocking resources in `<head>` without async/defer
2. Network chains (late-discovered resources)
3. Missing preloads (critical fonts, hero images, key scripts)
4. Caching issues (missing/weak Cache-Control, ETag)
5. Large payloads (uncompressed/oversized bundles)
6. Unused preconnects (zero requests to that origin)

### Phase 4: Accessibility Snapshot
```
take_snapshot(verbose: true)
```
Flag: missing/duplicate ARIA IDs, poor contrast (WCAG AA: 4.5:1), focus traps, missing accessible names.

### Phase 5: Codebase Analysis (if repo access)

Read `references/root-cause-trees.md` § "Codebase Analysis" for the bundler/framework detection table and checks.

## Root-Cause Diagnosis

After metrics collected, map each poor metric to its cause using the root-cause trees in `references/root-cause-trees.md`. **You MUST read that reference before proposing fixes** - it contains the LCP/CLS/INP decision trees, resource size benchmarks, and priority-fix format.

## Output Format

### Speed Audit: [URL/domain]

**Core Web Vitals**

| Metric | Value | Rating | Root Cause |
|--------|-------|--------|------------|
| LCP | [value] | Good/Needs/Poor | [cause] |
| CLS | [value] | ... | ... |
| INP | [value] | ... | ... |
| FCP | [value] | ... | ... |
| TTFB | [value] | ... | ... |

**Resource Breakdown**: use the resource table in `references/root-cause-trees.md`.

**Priority Fixes** (ordered by impact)
1. **[Metric]: [Root cause]**
   - Current: [value]
   - Target: [threshold]
   - Fix: [specific action]
   - Estimated impact: [high/medium/low]

**Quick Wins**
- [ ] Add width/height to images
- [ ] Set fetchpriority="high" on LCP image
- [ ] Defer non-critical JavaScript
- [ ] ...
