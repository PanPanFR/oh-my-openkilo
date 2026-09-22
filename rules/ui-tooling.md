---
description: UI component tooling router - shadcn CLI vs MCP servers vs skills. Load for any task touching component libraries.
---

# UI Tooling - CLI vs MCP Decision Map

Cost principle: every **enabled** MCP adds its tools to every session, which eats context whether you use it or not. The CLI and skills cost nothing when idle. Default stack is **skills + CLI**; enable an MCP per-task, disable it after.

## Pick the tool

| Need | Use | Why |
|------|-----|-----|
| Install a known component (`button`, `dialog`) | shadcn CLI `add` | Writes files to disk; zero component source through context |
| Browse / compare registries, natural-language install ("hero from @tailark") | `shadcn` MCP (enable per-task) | AI searches and installs itself across all registries in `components.json` |
| ReactBits animated components specifically | `reactbits` MCP (enable per-task) | Dedicated browser for 135+ items; skip if `@react-bits` already in `components.json` (shadcn MCP covers it) |
| Magic UI effects (shimmer, marquee, particles) | `magicuidesign-mcp` (enable per-task) | Official Magic UI server |
| Project context, composition rules, correct APIs | `shadcn` skill (global) | Reads `components.json` via `info --json`; pattern enforcement |
| Design decisions, aesthetics, palettes, anti-slop | `ui-design` + `frontend-design` + `ui-ux-pro-max`, gate with `antislop` | Existing UI routing in `skill-reminder.md` |
| Visual verify in browser | `playwright-cli` (many reads) / `chrome-devtools` MCP (single debug) | Existing designer browser rule |

Never enable `shadcn` MCP and `reactbits` MCP at the same time for the same job: if `@react-bits` is a configured registry, the shadcn MCP already reaches it. Redundant servers are pure context cost.

## Designer workflow (component tasks)

1. **Context first**: run `shadcn info --json` in the project dir (must contain `components.json`). Respect its `aliases`, `base` (radix vs base), `iconLibrary`, `tailwindVersion`, `resolvedPaths`.
2. **Check installed before add**: never re-add, never import what isn't installed.
3. **Known item -> CLI** (`add`, `--dry-run`/`--diff` for updates, never `--overwrite` without approval). **Unknown item -> search/view/docs first**, enable the matching MCP only if discovery needs it.
4. **Fix third-party imports**: community registry items often hardcode `@/components/ui/...`; rewrite to the project's real alias. Swap icon imports to the project's `iconLibrary`.
5. **Registry must be explicit**: user names no registry -> ask. Never default.
6. Follow the full workflow in `skills/shadcn/SKILL.md`; this file only routes, it does not duplicate.

## MCP enable protocol

The parent (builder/user) owns `opencode.json`: remove `"disabled": true` from the needed server, `/reload`, dispatch designer, re-add `"disabled": true` when done. Designer never leaves an MCP enabled past its task.
