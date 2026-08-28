# Root-Cause Trees, Benchmarks & Codebase Analysis

## LCP Root-Cause Tree

**TTFB slow (>800ms)?** → Server: hosting, CDN, DB queries, SSR time → Fix: upgrade hosting, CDN, optimize server, enable caching

**LCP element is image?** → Image: format (WebP/AVIF), size (responsive), lazy loading (NO on LCP) → Fix: modern formats, width/height, fetchpriority="high", preload

**LCP element is text?** → Font: custom fonts blocking, file size, font-display → Fix: font-display: swap/optional, preload critical, subset

**Render-blocking CSS/JS?** → Large CSS in `<head>`, sync JS before content → Fix: inline critical CSS, defer non-critical, async/defer JS

## CLS Root-Cause Tree

**Images/videos lack dimensions?** → Fix: width/height attributes, CSS aspect-ratio

**Ads/embeds inject content?** → Fix: reserve space with min-height, contain-intrinsic-size

**Fonts cause reflow?** → Fix: font-display: optional, or match fallback metrics

**Dynamic content inserts above fold?** → Fix: use overlays, reserve space with fixed-height containers

## INP Root-Cause Tree

**Main thread blocked by long tasks?** → JS execution, third-party, large DOM → Fix: break tasks with requestIdleCallback/setTimeout, code-split

**Event handlers do heavy sync work?** → Click handlers with large DOM updates, validation on keystroke → Fix: debounce, requestAnimationFrame, web workers

**Third-party scripts competing?** → Analytics, chat, A/B testing, social embeds → Fix: defer until after interaction, loading="lazy", remove low-value

## Resource Analysis Table

| Resource Type | Size | Assessment | Action |
|---|---|---|---|
| HTML | [x] KB | [ok/large] | Compress, reduce inline |
| CSS | [x] KB | [ok/large] | Remove unused, minify, critical CSS |
| JavaScript | [x] KB | [ok/large] | Code-split, tree-shake, defer |
| Images | [x] KB | [ok/large] | Modern formats, responsive, lazy load |
| Fonts | [x] KB | [ok/large] | Subset, limit families/weights, preload |
| Third-party | [x] KB | [ok/large] | Audit necessity, defer, self-host |

Benchmarks: Total < 1.5MB, JS < 300KB (gz), CSS < 100KB (gz), Fonts < 100KB

## Codebase Analysis (Phase 5)

Detect framework/bundler:

| Tool | Config Files |
|------|--------------|
| Webpack | webpack.config.js, webpack.*.js |
| Vite | vite.config.js, vite.config.ts |
| Next.js | next.config.js, next.config.mjs |
| Nuxt | nuxt.config.js, nuxt.config.ts |
| Astro | astro.config.mjs |

Check for:
- Tree-shaking config (Webpack: sideEffects, usedExports; Vite/Rollup: default on)
- Unused CSS/JS (Tailwind content config, PurgeCSS, dynamic imports)
- Polyfills (@babel/preset-env targets, core-js size)
- Compression (terser/esbuild/swc, gzip/brotli, source maps in prod)

## Pro Tips

- CWV Impact Calculator: https://seojuice.com/tools/cwv-impact/
- Critical CSS Generator: https://seojuice.com/tools/critical-css-generator/
