# Caching Strategies

## Strategy Selection Guide

| Strategy | Use Case | Description |
|----------|----------|-------------|
| **Cache First** | Static assets (CSS, JS, images) | Check cache, fall back to network |
| **Network First** | API responses, dynamic content | Try network, fall back to cache |
| **Stale While Revalidate** | Semi-static content (avatars, articles) | Serve cache immediately, update in background |
| **Network Only** | Non-cacheable requests (analytics) | Always use network |
| **Cache Only** | Offline-only assets | Only serve from cache |

Quick pick:

```
Static assets (CSS, JS, images)  -> Cache First
API responses                    -> Network First
User-generated content           -> Stale While Revalidate
Analytics, non-cacheable         -> Network Only
Offline-only assets              -> Cache Only
```

## Cache First (Offline First)

```javascript
// Best for: Static assets that rarely change
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
            return response;
          });
        })
    );
  }
});
```

## Network First (Fresh First)

```javascript
// Best for: API data, frequently updated content
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

## Stale While Revalidate

```javascript
// Best for: Content that's okay to be slightly outdated
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/articles/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
          return cached || fetchPromise;
        });
      })
    );
  }
});
```
