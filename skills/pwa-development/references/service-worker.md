# Service Worker Patterns

## Basic Service Worker

```javascript
// sw.js
const CACHE_NAME = 'app-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/offline.html'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});
```

## Registration

```javascript
// main.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('SW registered:', registration.scope);
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  });
}
```

## Lifecycle

```
1. Register -> 2. Install -> 3. Activate -> 4. Fetch
     ↓             ↓             ↓             ↓
  Load app    Cache assets   Clean old    Serve requests
                             caches       from cache/network
```

## Testing Service Worker Updates

```javascript
// Force update check
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update();
  });
}

// Listen for updates
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // New service worker activated
  window.location.reload();
});
```
