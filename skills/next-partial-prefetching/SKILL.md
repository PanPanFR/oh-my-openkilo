---
name: next-partial-prefetching
description: >
  Adopt and tune Next.js Partial Prefetching. Use when enabling
  `partialPrefetching`, opting routes in with `export const prefetch =
  'partial'`, auditing `Link prefetch={true}`, preserving existing prefetched UI
  with `instant()` tests, resolving instant-link-prefetch-partial and
  instant-shell-url-data insights, or choosing default / viewport / intent
  prefetching per link. Requires Cache Components adopted and Next.js 16.3+.
---

# Next.js Partial Prefetching

Requires `cacheComponents: true` with a passing build. If Cache Components is
off, load `next-cache-components` first.

## Route

| Situation | Load |
|-----------|------|
| Flag off, enabling, insight sweep, route opt-in | `references/adoption.md` |
| Production test rig for the preservation baseline | `references/adoption-rig-template.md` |
| Adopted; tuning what a specific link prefetches | `references/optimizer.md` |
| Optimizer rig template | `references/optimizer-rig-template.md` |
| Red test flaky or passing for the wrong reason | `references/optimizer-red-test.md` |

## Gates

1. **Preservation baseline first.** With `partialPrefetching` disabled, the
   selected `instant()` suite must pass. Record command and exit status. Do not
   enable the flag, edit destination cache boundaries, or touch Link props
   before that baseline is green.
2. **16.3+.** `partialPrefetching`, the route `prefetch` export, and the
   insights all land there.
3. **One link contract at a time** during optimization. Record behavior, make
   the smallest change, verify the differential, keep the passing test.
4. **Framework docs win.** Read the bundled guide under
   `node_modules/next/dist/docs/` when present.

## Talking to the user

Describe behavior in terms of what users see (PRs, features, navigation
results), never insight slugs or step labels. State plainly that links now
prefetch one shared App Shell and that `prefetch={true}` can also resolve cached
URL-specific content.
