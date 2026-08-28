# Style, Layout, Typography & UI Performance

## Style Selection (HIGH)

- Match style to product type
- Use same style across all pages
- Use SVG icons, not emojis
- Choose palette from product/industry
- Align shadows, blur, radius with chosen style
- Respect platform idioms (iOS HIG vs Material Design)

## Performance (HIGH)

- **Image optimization**: WebP/AVIF, responsive images, lazy load non-critical assets
- **Image dimensions**: Declare width/height or aspect-ratio to prevent layout shift
- **Font loading**: font-display: swap; avoid FOIT
- **Critical CSS**: Prioritize above-the-fold CSS
- **Lazy loading**: Lazy load non-hero components
- **Bundle splitting**: Split code by route/feature
- **Reduce reflows**: Avoid frequent layout reads/writes; batch DOM operations

## Layout & Responsive (HIGH)

- **Viewport meta**: width=device-width initial-scale=1 (never disable zoom)
- **Mobile-first**: Design mobile-first, then scale up
- **Breakpoint consistency**: Systematic breakpoints (e.g. 375 / 768 / 1024 / 1440)
- **Readable font size**: Minimum 16px body text on mobile
- **Line length**: Mobile 35-60 chars per line; desktop 60-75 chars
- **No horizontal scroll**: Content fits viewport width
- **Spacing scale**: 4pt/8dp incremental spacing system
- **Container width**: Consistent max-width on desktop

## Typography & Color (MEDIUM)

- **Line height**: 1.5-1.75 for body text
- **Line length**: Limit to 65-75 characters per line
- **Font pairing**: Match heading/body font personalities
- **Font scale**: Consistent type scale (e.g. 12 14 16 18 24 32)
- **Semantic color tokens**: primary, secondary, error, surface, on-surface
- **Dark mode**: Desaturated / lighter tonal variants, not inverted colors

## Writing in Design

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use.

- Write from the end user's side of the screen
- Use active voice as default
- Treat failure and emptiness as moments for direction, not mood
- Keep the register conversational and tuned to the brand and audience
