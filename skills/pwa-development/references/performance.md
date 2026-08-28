# Performance Optimization

## Critical Rendering Path

```html
<!-- Inline critical CSS -->
<style>
  /* Critical above-the-fold styles */
</style>

<!-- Preload important resources -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/scripts/app.js" as="script">

<!-- Defer non-critical CSS -->
<link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
```

## Image Optimization

```html
<!-- Responsive images -->
<img
  src="/images/hero-800.webp"
  srcset="
    /images/hero-400.webp 400w,
    /images/hero-800.webp 800w,
    /images/hero-1200.webp 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
  loading="lazy"
  decoding="async"
>

<!-- Modern formats with fallback -->
<picture>
  <source srcset="/images/hero.avif" type="image/avif">
  <source srcset="/images/hero.webp" type="image/webp">
  <img src="/images/hero.jpg" alt="Hero image" loading="lazy">
</picture>
```

## Code Splitting

```javascript
// Dynamic imports for route-based splitting
const routes = {
  '/': () => import('./pages/Home.js'),
  '/about': () => import('./pages/About.js'),
  '/settings': () => import('./pages/Settings.js')
};

async function loadPage(path) {
  const loader = routes[path];
  if (loader) {
    const module = await loader();
    return module.default;
  }
}
```
