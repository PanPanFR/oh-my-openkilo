---
name: next-cache-components
description: >
  Adopt and optimize Next.js Cache Components / PPR. Use when enabling
  `cacheComponents`, clearing blocking-prerender or instant validation errors,
  running the `cache-components-instant-false` codemod, deciding whether to opt
  a route out with `export const instant = false`, or driving a route to instant
  navigation with an `instant()` e2e guard. Requires Next.js 16.3+ and the App
  Router.
---

# Next.js Cache Components

Two phases, one flow. Do not optimize before adoption passes a build.

## Route

| Situation | Load |
|-----------|------|
| Flag off, migration errors, codemod, per-route opt-out decisions | `references/adoption.md` |
| Adoption dev-overlay validation details | `references/adoption-dev-only-validations.md` |
| Per-page opt-out vs fix-in-place matrix | `references/adoption-per-page-decisions.md` |
| Adopted and build passes; route still not instant | `references/optimizer.md` |
| Optimizer before/after recipes per blocker type | `references/optimizer-patterns.md` |
| Parallel routes, auth gates, empty shell, responsive skeleton | `references/optimizer-real-app-patterns.md` |
| Test harness and fixture templates | `references/optimizer-rig-template.md`, `references/optimizer-test-template.md` |
| Red test is flaky or not failing for the right reason | `references/optimizer-red-test.md` |

## Gates

1. **App Router only.** `pages/`-only project: stop, that migration is its own
   project. Hybrid is fine; the flag affects `app/` routes.
2. **Next.js 16.3+.** Below that, upgrade first.
3. **No incompatible config keys.** Remove `experimental.dynamicIO` (fatal),
   `dynamic`, `revalidate`, and `fetchCache` exports before enabling.
4. **Runnable app.** Adoption is verified against `next dev` plus a browser. If
   the app cannot boot, fix that first.
5. **Adoption gate:** a passing `next build` with `cacheComponents: true` before
   any optimizer work.

## Invariants

- One route at a time for optimizer work; each ends in a passing `instant()`
  test that ships as the regression guard.
- Verify with the real app, not by reading config.
- Framework docs win over memory. Prefer the bundled guide under
  `node_modules/next/dist/docs/` when present.
