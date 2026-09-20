---
name: ui-design
description: Use when designing pages or UI components, choosing colors/typography, reviewing UX/accessibility, or implementing navigation, animations, responsive behavior, dark mode - web and mobile
---

# UI Design

Comprehensive design intelligence and execution guidance for web, mobile, and desktop interfaces.

## When to Apply

### Must Use
- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)
- Improving perceived quality, clarity, or usability of interfaces

### Skip
- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface
- Infrastructure or DevOps work
- Non-visual scripts or automation tasks

**Decision criteria**: If the task will change how a feature **looks, feels, moves, or is interacted with**, this skill should be used.

**Boundary**: This skill covers build-time design decisions. For reviewing/polishing/iterating EXISTING UI (critique, audit, polish, distill, harden, animate), load `impeccable` instead. Most specific wins.

## Reference Map - load BEFORE designing that area

| Task | Read FIRST |
|------|-----------|
| Full 119 UX guidelines (priority 1-10) | `references/quick-reference.md` |
| Web interface code compliance (Vercel standard: forms, a11y, hydration, i18n) | `references/web-interface-guidelines.md` |
| Native & mobile app polish rules (iOS HIG/Material, safe area, icons) | `references/pro-rules.md` |
| Style selection, layout/responsive, typography/color, UI performance | `references/style-layout-typography.md` |
| Animation, forms & feedback, navigation patterns, charts & data | `references/interaction-patterns.md` |

The CRITICAL rules below apply to EVERY task without needing the references.

---

## Design Intelligence Engine (Local Search)

Query local database of 79 styles, 192 product palettes, 74 font pairings, 119 UX guidelines, and 22 framework stacks:

```bash
# 1. Full design system for a new page or product
python3.11 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "Project Name"

# 2. Targeted UX outcome or component concern
python3.11 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>
# Domains: ux, style, color, typography, icons, motion, chart, product

# 3. Stack-specific implementation patterns (react, nextjs, svelte, vue, html-tailwind, etc.)
python3.11 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack <stack>
```

---

## Two-Pass Design Process (Anthropic Standard)

Approach design with a distinctive, intentional point of view tailored strictly to the subject.

### Pass 1: Design Plan (Token System)
Brainstorm a compact token system before writing code:
- **Color**: 4–6 named hex values derived from subject matter (avoid default palettes).
- **Type**: 1–2 typeface families and their specific roles with clear type scale. Line lengths <80 characters.
- **Layout**: Prose layout concept and ASCII wireframe. Explicit alignment rules.
- **Principles**: What makes this specific page unique to its industry and audience.

### Pass 2: Review Against Brief (Eliminate AI Clichés)
Before coding, check if any part reads like an AI default template:
- **Cream & terracotta tell**: Avoid default warm cream background (`#F4F1EA`) + terracotta accent (`#D97757`).
- **Near-black & neon tell**: Avoid `#0B0B0B` background with single acid-green or vermilion accent.
- **Broadsheet tell**: Avoid hairline borders with zero border-radius and dense newspaper columns unless requested.
- **SaaS card kit tell**: Avoid content chopped into identical rounded cards with uniform soft grey shadows (`rgba(0,0,0,.1)`) and gradient washes.
- **Template chrome tells**: Avoid tracked-out ALL-CAPS eyebrow labels above every heading; meta joined with middle dots (`A · B · C`); labels formatted as `WORD — fragment`; default `→` appended to buttons/links.

### Pass 3: Build & Restraint
- **Spend boldness in one place**: Let one element be memorable; keep everything around it quiet and disciplined. (Chanel rule: remove one accessory before shipping).
- **CSS Specificity safety**: Avoid conflicting selectors (e.g. `.section` vs `.cta` margin/padding collisions).
- **Writing in design**: Active voice CTAs ("Save changes" produces toast "Saved changes"); plain verbs; errors explain cause + fix without apologizing; empty states invite action.

---

## CRITICAL: Accessibility (always applies)

- **Color contrast**: min 4.5:1 normal text, 3:1 large text (18px+). Never assume grey-on-grey passes (#555 on black is 2.8:1 FAIL).
- **Non-text contrast**: interactive boundaries, status dots, chart segments >= 3:1 against adjacent background.
- **Over photo/gradient**: scrim/solid backing required; verify at worst spot across entire text area.
- **Focus states**: visible `:focus-visible` rings (2-4px, >=3:1 contrast); never `outline: none` without replacement. Sticky UI/headers must never cover focused controls.
- **Keyboard nav**: tab order matches visual order; dialogs/modals closable via Escape; activate via Enter/Space.
- **Semantic HTML**: `<button>` for actions, `<a>`/`<Link>` for navigation (never `<div onClick>`); semantic tags before ARIA.
- **Alt text & aria**: descriptive `alt` for images (`alt=""` if decorative); `aria-hidden="true"` on decorative icons; `aria-label` on icon-only buttons.
- **Form labels**: clickable label via `htmlFor` or wrapping control; mobile keyboard must not cover active input.
- **Heading hierarchy**: sequential h1-h6, no skips. Anchor headings include `scroll-margin-top`.
- **Color-not-only**: never convey info by color alone (pair status with text/icon).
- **UI States**: data views must have perceivable Empty, Loading, and Error states with cause + next action (no bare "No data").
- **Zoom & reflow**: text resizable to 200% without horizontal scroll or clipping containers (`user-scalable=no` forbidden).
- **Reduced motion**: respect `prefers-reduced-motion`; avoid perpetual bouncing/pulsing loops; autoplaying motion >5s needs pause controls.

---

## CRITICAL: Touch & Responsive Reflow (always applies)

- **Mobile is a distinct reflow**: re-stack columns, rescale typography, never just squeeze desktop.
- **Continuous widths**: handle phone, tablet (600-1024px), and desktop gracefully; avoid abrupt 2-state snaps.
- **Fluid sizing**: fluid type scale (`clamp()`), dynamic viewport `dvh` over `100vh`, reduced padding on mobile.
- **No horizontal overflow**: contain wide tables, wrap code blocks, enforce `max-width: 100%` on images/media, `overflow-x-hidden` on container.
- **Touch targets**: min 44x44pt (iOS) / 48x48dp (Android); 8px gap minimum between adjacent controls.
- **Touch behavior**: `touch-action: manipulation` (prevent 300ms double-tap delay); `overscroll-behavior: contain` on modals/sheets.
- **No hover-only interactions**: hover-reveals and tooltips must have tap/click equivalents.
- **Mobile navigation**: collapse topbar links into bottom nav or labeled menu; fixed nav must respect `env(safe-area-inset-*)`.
- **Button states**: disable button during async ops + show spinner; interactive states increase contrast on hover/focus/press.
- **Flex child text truncation**: flex children need `min-w-0` to allow `truncate`/`line-clamp`.

---

## Pre-Delivery Checklist (Consolidated Gate)

### Anti-Slop & Visual Quality
- [ ] No generic AI glyphs (sparkle, star, magic wand, lightning, robot) without genuine content relevance
- [ ] No decorative emoji in headings, bullets, badges, or buttons
- [ ] Dose caps honored: glassmorphism max 1-2 elements; glow on max 1-2 elements; shadows as purposeful elevation
- [ ] Free of AI templates: no unprompted bento grid, fake terminal window, uniform 3-card layout, or eyebrow pill duplicating H1
- [ ] Palette capped at 2-3 core colors + 1 deliberate accent; consistent radius scale (not all pill shapes)
- [ ] No dead controls: every button, link, and modal has functional destination or visible "Coming soon"
- [ ] Real content only: no fabricated metrics, unverified trust claims, or fake testimonials
- [ ] Pressed states don't shift layout bounds; semantic theme tokens used consistently

### Web Interface & Code Hygiene (Vercel Standard)
- [ ] Icon-only buttons have `aria-label`; decorative icons have `aria-hidden="true"`
- [ ] Form controls have accessible labels; inputs have `autocomplete` and appropriate `type`/`inputmode`
- [ ] Spellcheck disabled on codes/emails/usernames (`spellCheck={false}`)
- [ ] Headings have `text-wrap: balance` or `text-pretty` to prevent widows
- [ ] Typographic quotes (`“` `”`) and ellipses (`…`); non-breaking spaces on counts/shortcuts (`10&nbsp;MB`, `⌘&nbsp;K`)
- [ ] Tabular numbers used for data columns/timers (`font-variant-numeric: tabular-nums`)
- [ ] Flex children have `min-w-0` for truncation; text containers handle overflow gracefully
- [ ] Images have explicit `width`/`height` (prevent CLS); below-fold `loading="lazy"`
- [ ] Lists >50 items virtualized; zero layout reads during render
- [ ] Dark mode sets `color-scheme: dark` on `<html>` and matches `<meta name="theme-color">`
- [ ] Dates and numbers use `Intl.DateTimeFormat` / `Intl.NumberFormat`; brand tokens use `translate="no"`
- [ ] Controlled inputs have `onChange`; date/times guarded against SSR hydration mismatch

### Interaction & Responsive
- [ ] All tappable elements give pressed feedback
- [ ] Touch targets meet minimums (44x44px) with >=8px spacing
- [ ] No horizontal overflow or clipped text at narrow widths
- [ ] Micro-interactions in 150-300ms range; animations interruptible; respect `prefers-reduced-motion`
- [ ] Disabled states visually clear
- [ ] Screen reader focus order matches visual order

### Light/Dark Mode
- [ ] Primary text contrast >=4.5:1 both modes; secondary >=3:1
- [ ] Dividers/states distinguishable in both modes
- [ ] Both themes tested before delivery; neither mode breaks layout or readability

### Layout & States
- [ ] Safe areas respected (`env(safe-area-inset-*)`); scroll not hidden behind sticky/bottom bars
- [ ] Verified across small phone, tablet (600-1024px), and desktop
- [ ] 4/8dp spacing rhythm maintained
- [ ] Empty, loading, and error states provide clear cause and next action
