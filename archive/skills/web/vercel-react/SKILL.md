---
name: vercel-react
description: Use when writing, reviewing, or refactoring React or Next.js code - data fetching, bundle size, re-renders, server components, component API design, state management, React 19 APIs
---

# Vercel React Best Practices + Composition Patterns

Performance rules (70+) and composition architecture patterns from Vercel Engineering.

This skill uses progressive disclosure: this file has the decision map and top rules. Full rule tables and code patterns live in `references/`. **You MUST read the matching reference before applying rules in that category** - do not work from memory of this overview.

## When to Apply

- Writing new React components or Next.js pages
- Implementing data fetching (client/server)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times
- Designing component APIs (avoid boolean prop proliferation)
- Building reusable component libraries

## Reference Map - load BEFORE coding

| Task | Read FIRST |
|------|-----------|
| Waterfalls, bundle size, server perf, client fetching, re-renders, rendering, JS micro-perf | `references/performance-rules.md` |
| Component architecture, compound components, state management, implementation patterns, React 19 APIs | `references/composition-patterns.md` |

## Top 10 Impact Rules

1. **async-parallel** - Promise.all() for independent ops (2-10x)
2. **bundle-barrel-imports** - Direct imports (15-70% faster dev, 40% faster cold starts)
3. **server-parallel-fetching** - Component composition for parallel data (CRITICAL)
4. **server-parallel-nested-fetching** - Chain per-item in Promise.all (CRITICAL)
5. **rerender-no-inline-components** - Prevents remount, lost state (HIGH)
6. **rerender-derived-state-no-effect** - Derive during render, not effects (MEDIUM)
7. **architecture-avoid-boolean-props** - Composition over conditionals (HIGH)
8. **state-lift-state** - Provider enables external access (HIGH)
9. **rendering-conditional-render** - Ternary over && prevents bugs (MEDIUM)
10. **client-swr-dedup** - Automatic deduplication (MEDIUM-HIGH)

Full rule tables: see the two reference files above.
