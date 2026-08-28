---
name: ui-design
description: Use when designing pages or UI components, choosing colors/typography, reviewing UX/accessibility, or implementing navigation, animations, responsive behavior, dark mode - web and mobile
---

# UI Design

Comprehensive design guidance for web and mobile applications.

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

## Reference Map - load BEFORE designing that area

| Task | Read FIRST |
|------|-----------|
| Style selection, layout/responsive, typography/color, UI performance | `references/style-layout-typography.md` |
| Animation, forms & feedback, navigation patterns, charts & data | `references/interaction-patterns.md` |

The CRITICAL rules below apply to EVERY task without needing the references.

## Design Principles

1. **Ground it in the subject** - Pin down one concrete subject, its audience, and the page's single job. The subject's own world is where distinctive choices come from.
2. **Typography carries personality** - Pair display/body faces deliberately; set a clear type scale. Make type treatment memorable.
3. **Structure is information** - Numbering, eyebrows, dividers, labels encode something true about content, not decoration.
4. **Leverage motion deliberately** - An orchestrated moment lands harder than scattered effects.
5. **Restraint** - Spend boldness in one place. One signature element; everything around it quiet.

## CRITICAL: Accessibility (always applies)

- **Color contrast**: min 4.5:1 normal text (3:1 large text)
- **Focus states**: visible focus rings on interactive elements (2-4px)
- **Alt text** for meaningful images; aria-label on icon-only buttons
- **Keyboard nav**: tab order matches visual order
- **Form labels**: label with for attribute
- **Heading hierarchy**: sequential h1-h6, no skips
- **Color-not-only**: never convey info by color alone
- **Reduced motion**: respect prefers-reduced-motion

## CRITICAL: Touch & Interaction (always applies)

- **Touch targets**: min 44x44pt (iOS) / 48x48dp (Android); 8px gap minimum
- Click/tap for primary interactions; never hover-only
- Disable button during async ops + show spinner
- Error messages near the problem
- No horizontal swipe on main content

## Pre-Delivery Checklist

### Visual Quality
- [ ] No emojis as icons (SVG instead); consistent icon family
- [ ] Pressed states don't shift layout bounds
- [ ] Semantic theme tokens used consistently

### Interaction
- [ ] All tappable elements give pressed feedback
- [ ] Touch targets meet minimums
- [ ] Micro-interactions in 150-300ms range
- [ ] Disabled states visually clear
- [ ] Screen reader focus order matches visual order

### Light/Dark Mode
- [ ] Primary text contrast >=4.5:1 both modes; secondary >=3:1
- [ ] Dividers/states distinguishable in both modes
- [ ] Both themes tested before delivery

### Layout
- [ ] Safe areas respected; scroll not hidden behind sticky bars
- [ ] Verified small phone, large phone, tablet (portrait + landscape)
- [ ] 4/8dp spacing rhythm maintained

### Accessibility
- [ ] Meaningful images/icons labeled
- [ ] Form fields have labels, hints, clear errors
- [ ] Color not the only indicator
- [ ] Reduced motion and dynamic text size supported without breakage
