---
name: pwa-development
description: Progressive Web Apps - service workers, caching strategies, offline, Workbox
when-to-use: When building PWA features - service workers, caching, offline support
user-invocable: false
paths: ["**/sw.*", "**/service-worker.*", "**/workbox-config.*", "**/manifest.json"]
effort: medium
---

# PWA Development Skill

Build Progressive Web Apps that work offline, install like native apps, and deliver fast, reliable experiences across devices.

This skill uses progressive disclosure: this file has the decision maps and quick references. Detailed patterns live in `references/`. **You MUST read the matching reference file before writing that category of code** - do not work from memory of this overview.

## The Three Pillars

```
1. HTTPS            Required for service workers (localhost OK for dev)
2. SERVICE WORKER   Background JS enabling offline, caching, push
3. MANIFEST         JSON metadata enabling installation
```

Installability (Chrome): HTTPS + service worker with fetch handler + manifest with name, icons 192px+512px, start_url, display standalone/fullscreen/minimal-ui.

## Reference Map - load BEFORE coding

| Task | Read FIRST |
|------|-----------|
| Create/edit `manifest.json`, icons, shortcuts, share_target | `references/manifest.md` |
| Write/register a service worker, SW lifecycle, SW updates | `references/service-worker.md` |
| Choose or implement a caching strategy | cheat sheet below; details in `references/caching-strategies.md` |
| Use Workbox (precaching, runtimeCaching, plugins) | `references/workbox.md` |
| Offline fallback page, online/offline detection, background sync | `references/offline.md` |
| Install prompt, standalone detection, push notifications, share target handler | `references/app-capabilities.md` |
| Critical CSS, preload, responsive images, code splitting | `references/performance.md` |
| Next.js / CRA / Vite integration | `references/frameworks.md` |
| Lighthouse audit, manual QA, pre/post-launch checklists, project layout | `references/testing-launch.md` |

## Caching Strategy Cheat Sheet

```
Static assets (CSS, JS, images)  -> Cache First
API responses                    -> Network First
User-generated content           -> Stale While Revalidate
Analytics, non-cacheable         -> Network Only
Offline-only assets              -> Cache Only
```

Implementations of each: `references/caching-strategies.md`.

## Service Worker Lifecycle

```
1. Register -> 2. Install -> 3. Activate -> 4. Fetch
     ↓             ↓             ↓             ↓
  Load app    Cache assets   Clean old    Serve requests
                             caches       from cache/network
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing maskable icon | Add icon with `"purpose": "maskable"` |
| No offline fallback | Create `offline.html` and cache it |
| Cache never expires | Use `ExpirationPlugin` with Workbox |
| SW caches too aggressively | Appropriate strategy per resource type |
| No update mechanism | `skipWaiting()` + reload prompt |
| Broken install prompt | Ensure manifest meets all criteria |
| No HTTPS in production | Configure SSL certificate |
| Large cache size | Set `maxEntries` and `maxAgeSeconds` |
| Stale API responses | `NetworkFirst` for dynamic data |
| Missing start_url tracking | Add query param: `/?source=pwa` |
