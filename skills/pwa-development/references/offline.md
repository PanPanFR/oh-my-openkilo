# Offline Experience

## Offline Page

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - App Name</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .offline-content {
      text-align: center;
      padding: 2rem;
    }
    .offline-icon { font-size: 4rem; }
    h1 { color: #333; }
    p { color: #666; }
    button {
      background: #3367D6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <div class="offline-content">
    <div class="offline-icon">📡</div>
    <h1>You're offline</h1>
    <p>Check your connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>
```

## Offline Detection

```javascript
// Online/offline status handling
function updateOnlineStatus() {
  const status = navigator.onLine ? 'online' : 'offline';
  document.body.dataset.connectionStatus = status;

  if (!navigator.onLine) {
    showNotification('You are offline. Some features may be unavailable.');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();
```

## Background Sync (Queue Offline Actions)

```javascript
// sw.js with Workbox
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

const bgSyncPlugin = new BackgroundSyncPlugin('formQueue', {
  maxRetentionTime: 24 * 60 // Retry for 24 hours
});

registerRoute(
  ({ url }) => url.pathname === '/api/submit',
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);
```

```javascript
// main.js - Queue form submission
async function submitForm(data) {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    // Will be retried by background sync when online
    showNotification('Saved offline. Will sync when connected.');
  }
}
```
