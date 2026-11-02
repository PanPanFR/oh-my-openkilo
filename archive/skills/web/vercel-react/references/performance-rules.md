# Performance Rules (Priority Order)

## 1. Eliminating Waterfalls (CRITICAL)

| Rule | Description |
|------|-------------|
| `async-cheap-condition-before-await` | Check cheap sync conditions before awaiting flags |
| `async-defer-await` | Move await into branches where actually used |
| `async-parallel` | Use Promise.all() for independent operations |
| `async-dependencies` | Use better-all for partial dependencies |
| `async-api-routes` | Start promises early, await late in API routes |
| `async-suspense-boundaries` | Use Suspense to stream content |

**Key pattern:** Start promises before awaiting, use `Promise.all()` or `better-all` for parallelism.

## 2. Bundle Size Optimization (CRITICAL)

| Rule | Description |
|------|-------------|
| `bundle-barrel-imports` | Import directly, avoid barrel files (lucide-react, MUI, etc.) |
| `bundle-analyzable-paths` | Prefer statically analyzable import paths |
| `bundle-dynamic-imports` | Use next/dynamic for heavy components |
| `bundle-defer-third-party` | Load analytics/logging after hydration |
| `bundle-conditional` | Load modules only when feature activated |
| `bundle-preload` | Preload on hover/focus for perceived speed |

**Quick wins:**
```tsx
// ❌ Barrel import - loads 1500+ modules
import { Check, X } from 'lucide-react'

// ✅ Direct import (Next.js 13.5+ transforms automatically)
// ✅ Non-Next.js: import Check from 'lucide-react/dist/esm/icons/check'
```

## 3. Server-Side Performance (HIGH)

| Rule | Description |
|------|-------------|
| `server-auth-actions` | Authenticate inside Server Actions (not just middleware) |
| `server-cache-react` | Use React.cache() for per-request deduplication |
| `server-cache-lru` | Use LRU cache for cross-request caching |
| `server-dedup-props` | Avoid duplicate serialization in RSC props |
| `server-hoist-static-io` | Hoist static I/O (fonts, logos) to module level |
| `server-no-shared-module-state` | No mutable module-level request state |
| `server-serialization` | Minimize data passed to client components |
| `server-parallel-fetching` | Restructure components to parallelize fetches |
| `server-parallel-nested-fetching` | Chain nested fetches per item in Promise.all |
| `server-after-nonblocking` | Use after() for non-blocking operations |

## 4. Client-Side Data Fetching (MEDIUM-HIGH)

| Rule | Description |
|------|-------------|
| `client-swr-dedup` | Use SWR for automatic request deduplication |
| `client-event-listeners` | Deduplicate global event listeners |
| `client-passive-event-listeners` | Use passive: true for scroll/touch |
| `client-localstorage-schema` | Version and minimize localStorage data |

## 5. Re-render Optimization (MEDIUM)

| Rule | Description |
|------|-------------|
| `rerender-defer-reads` | Don't subscribe to state only used in callbacks |
| `rerender-memo` | Extract expensive work into memoized components |
| `rerender-memo-with-default-value` | Hoist default non-primitive props to constants |
| `rerender-dependencies` | Use primitive dependencies in effects |
| `rerender-derived-state` | Subscribe to derived booleans, not raw values |
| `rerender-derived-state-no-effect` | Derive state during render, not effects |
| `rerender-functional-setstate` | Use functional setState for stable callbacks |
| `rerender-lazy-state-init` | Pass function to useState for expensive values |
| `rerender-simple-expression-in-memo` | Avoid memo for simple primitives |
| `rerender-split-combined-hooks` | Split hooks with independent dependencies |
| `rerender-move-effect-to-event` | Put interaction logic in event handlers |
| `rerender-transitions` | Use startTransition for non-urgent updates |
| `rerender-use-deferred-value` | Defer expensive renders to keep input responsive |
| `rerender-use-ref-transient-values` | Use refs for transient frequent values |
| `rerender-no-inline-components` | Don't define components inside components |

## 6. Rendering Performance (MEDIUM)

| Rule | Description |
|------|-------------|
| `rendering-animate-svg-wrapper` | Animate div wrapper, not SVG element |
| `rendering-content-visibility` | Use content-visibility for long lists |
| `rendering-hoist-jsx` | Extract static JSX outside components |
| `rendering-svg-precision` | Reduce SVG coordinate precision |
| `rendering-hydration-no-flicker` | Use inline script for client-only data |
| `rendering-hydration-suppress-warning` | Suppress expected mismatches |
| `rendering-activity` | Use Activity component for show/hide |
| `rendering-conditional-render` | Use ternary, not && for conditionals |
| `rendering-usetransition-loading` | Prefer useTransition for loading state |
| `rendering-resource-hints` | Use React DOM resource hints for preloading |
| `rendering-script-defer-async` | Use defer/async on script tags |

## 7. JavaScript Performance (LOW-MEDIUM)

| Rule | Description |
|------|-------------|
| `js-batch-dom-css` | Group CSS changes via classes or cssText |
| `js-index-maps` | Build Map for repeated lookups |
| `js-cache-property-access` | Cache object properties in loops |
| `js-cache-function-results` | Cache function results in module-level Map |
| `js-cache-storage` | Cache localStorage/sessionStorage reads |
| `js-combine-iterations` | Combine multiple filter/map into one loop |
| `js-length-check-first` | Check array length before expensive comparison |
| `js-early-exit` | Return early from functions |
| `js-hoist-regexp` | Hoist RegExp creation outside loops |
| `js-min-max-loop` | Use loop for min/max instead of sort |
| `js-set-map-lookups` | Use Set/Map for O(1) lookups |
| `js-tosorted-immutable` | Use toSorted() for immutability |
| `js-flatmap-filter` | Use flatMap to map and filter in one pass |
| `js-request-idle-callback` | Defer non-critical work to browser idle time |

## 8. Advanced Patterns (LOW)

| Rule | Description |
|------|-------------|
| `advanced-effect-event-deps` | Don't put useEffectEvent results in effect deps |
| `advanced-event-handler-refs` | Store event handlers in refs |
| `advanced-init-once` | Initialize app once per app load |
| `advanced-use-latest` | useLatest for stable callback refs |
