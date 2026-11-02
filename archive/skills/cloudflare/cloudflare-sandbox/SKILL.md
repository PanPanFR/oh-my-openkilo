---
name: cloudflare-sandbox
description: >
  Build, maintain, or migrate Cloudflare Sandbox apps. Use when working with
  @cloudflare/sandbox, @cloudflare/sandbox@next (SDK 1.0 preview), sandbox
  container images, or porting a stable app to the preview line.
---

# Cloudflare Sandbox

One SDK, three tracks. Identify the package line before writing any code; the
APIs are not interchangeable.

## Gate

| Repo state | Track |
|------------|-------|
| `@cloudflare/sandbox` (default) + matching stable image | `references/stable.md` |
| `@cloudflare/sandbox@next` or preview image tag | `references/next.md` |
| Stable app the user wants ported to `@next` | `references/migrate.md` |
| Deprecated stable APIs, no version move | Stay on stable, use the 2026 deprecation guide |

Hard rules:

- Worker package and container image must be on the **same** line. Never mix
  `@next` code with a stable image, or the reverse.
- Do not force a production cutover to 1.0 without explicit user agreement.
- New projects default to `@next` unless the user asks otherwise.

## References

| Need | Load |
|------|------|
| Stable package: commands, files, streaming, mounts | `references/stable.md` |
| Preview package: 1.0 API surface | `references/next.md` |
| Preview API quick reference | `references/next-api-quick-ref.md` |
| Preview examples | `references/next-examples.md` |
| Step-by-step port, replacement map, validation | `references/migrate.md` |

Prefer installed types and current Cloudflare docs over memory. These skills
are gates and retrieval maps, not full manuals.
