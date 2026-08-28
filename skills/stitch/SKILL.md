---
name: stitch
description: Unified Stitch design system - 16 skills for Google Stitch MCP. Use for any Stitch task: screen generation, design system management, prompt enhancement, code conversion (React/React Native/Remotion/Vite/shadcn), and multi-page iterative builds.
---

# Stitch Skill (Unified)

Google Stitch design pipeline. **Retrieval-first** — these skills orchestrate the `stitch` MCP server (see `~/.config/opencode/opencode.json`). The MCP is the source of truth; skills add validation, context, and decision logic.

## MCP requirement

All skills require the `stitch` MCP server. If unavailable, the user must configure it first (see Stitch MCP setup docs).

## Reference Map — load BEFORE that task

Each skill is a sibling folder: `<skill>/SKILL.md`. The skill body is the source of truth; this map tells you which one to open.

### Design (6)

| Task | Open |
|------|------|
| Generate new screens, edit screens, or make variants from text/image prompts | `generate-design/SKILL.md` |
| Upload frontend code (React/Vue) into a Stitch project | `code-to-design/SKILL.md` |
| Upload `DESIGN.md`, apply themes, update design tokens on existing screens | `manage-design-system/SKILL.md` |
| Extract a comprehensive `DESIGN.md` from frontend source code (React, Vue, Svelte, Angular, plain CSS) | `extract-design-md/SKILL.md` |
| Extract self-contained static HTML (CSS inlined, images inlined) from a running web app | `extract-static-html/SKILL.md` |
| Upload local assets (images, mockups, HTML files) to a Stitch project | `upload-to-stitch/SKILL.md` |

### Build / code generation (5)

| Task | Open |
|------|------|
| Convert Stitch screens to a React component system with token consistency validation | `react-components/SKILL.md` |
| Convert Stitch HTML designs to production React Native (StyleSheet, platform-specific) | `react-native/SKILL.md` |
| Build a React + Vite dashboard (TanStack Query, DESIGN.md tokens, Web3 read patterns) | `react-vite-dashboard/SKILL.md` |
| Generate walkthrough video from a Stitch project using Remotion (transitions, zooming, text overlays) | `remotion/SKILL.md` |
| Set up shadcn/ui and integrate components into a project | `shadcn-ui/SKILL.md` |

### Utilities (5)

| Task | Open |
|------|------|
| Analyze a Stitch project and synthesize a semantic `DESIGN.md` | `design-md/SKILL.md` |
| Transform a vague UI idea into a polished, Stitch-optimized prompt | `enhance-prompt/SKILL.md` |
| Generate `SITE.md` content spec for multi-page builds (used with `stitch-loop`) | `site-md/SKILL.md` |
| Iteratively build a multi-page site with baton-passing between skills | `stitch-loop/SKILL.md` |
| Generate a premium anti-generic `DESIGN.md` (strict typography, calibrated color, asymmetric layouts, micro-motion) | `taste-design/SKILL.md` |

## DECISION TREE — "What do I want to do?"

```
Generate a new screen from a prompt
  -> generate-design
  -> (if prompt is vague) enhance-prompt FIRST

Manage design system (tokens, theme, DESIGN.md)
  -> if DESIGN.md exists: manage-design-system (upload + apply)
  -> if creating from existing frontend source: extract-design-md
  -> if creating from a Stitch project: design-md
  -> if premium anti-generic: taste-design

Convert code <-> design
  -> frontend code -> Stitch project: code-to-design
  -> Stitch design -> React: react-components
  -> Stitch design -> React Native: react-native
  -> Stitch design -> Vite dashboard: react-vite-dashboard

Multi-page site build
  -> 1 prompt -> many pages: stitch-loop (uses site-md for spec)

Capture live web app
  -> extract HTML snapshot: extract-static-html
  -> upload to Stitch: upload-to-stitch

Build walkthrough video
  -> remotion (uses the `remotion` MCP if also enabled)

Set up component library
  -> shadcn-ui
```

## STITCH FLOW (4 stages, sequential unless iterating)

| Stage | When | Stitch MCP tool / skill |
|-------|------|------------------------|
| 0. Container | First time on a project | `stitch_create_project` |
| 1. Design system | Before any screen, or rebrand | `stitch_create_design_system` (tokens) OR `stitch_upload_design_md` + `stitch_create_design_system_from_design_md`. Orchestrated by `manage-design-system`. |
| 2. Screen generation | New page / variant exploration | `stitch_generate_screen_from_text` (first) -> `stitch_edit_screens` (refine) OR `stitch_generate_variants` (1-5 alternatives). Orchestrated by `generate-design`. |
| 3. Apply tokens | Tokens changed after screens exist | `stitch_apply_design_system` (or `manage-design-system` skill) |
| 4. Inspect | Read back, export, debug | `stitch_get_project` / `stitch_list_screens` / `stitch_get_screen` |
| 5. Convert to code | (optional) Stitch -> framework | See "Build" section in the Reference Map above. |

## Hard rules

- One Stitch project per app/brand. Do NOT create a new project for every screen.
- Stage 1 (design system) before stage 2 (screens). Generating screens first = rework.
- If `design/design.md` already exists (from `ui-design` skill or hand-written), use `manage-design-system` upload path to preserve the spec.
- Vague prompt -> `enhance-prompt` first, then `generate-design`.
- Multi-page site -> start with `site-md` to define the spec, then `stitch-loop` to drive.
- Skills reference MCP tools but add validation. If a skill says X but the MCP tool name differs in reality, trust the skill (it knows the latest contract).
- Stitch output = HTML mockups, not code. Framework conversion (React/Remotion/etc.) is a separate stage via the build skills.

## Notes on plugin structure (vs upstream)

The upstream `google-labs-code/stitch-skills` repo is organized as 3 plugins: `stitch-design`, `stitch-build`, `stitch-utilities`. Each has a `plugin.json` (Codex marketplace metadata) and a `skills/` subfolder. OpenCode does not use `plugin.json` — it discovers skills by scanning for `**/SKILL.md`. This unified skill flattens the 3-plugin structure into 16 sibling skill folders so the OpenCode skill loader picks them all up under one entry point (`stitch`).

If you want strict upstream parity, the alternative is 3 separate OpenCode skills: `stitch-design`, `stitch-build`, `stitch-utilities` (each with its own `SKILL.md` aggregator pointing to the child skills). The unified form here is simpler for OpenCode's flat loader.

## Cross-references

Per-skill child folders (when present in upstream):
- `scripts/` — executable validators (Node, Python, shell)
- `resources/` — knowledge files (DESIGN.md templates, schema, guides)
- `examples/` — gold-standard output examples
- `references/` — per-skill deep-dive docs (e.g. `enhance-prompt/references/KEYWORDS.md`, `extract-design-md/references/{angular,react-tailwind,etc}.md`)
