# App-Like Features

## Install Prompt

```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

async function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install`);
  deferredPrompt = null;
  hideInstallButton();
}

window.addEventListener('appinstalled', () => {
  console.log('App installed');
  deferredPrompt = null;
});
```

## Detecting Standalone Mode

```javascript
// Check if running as installed PWA
function isInstalledPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true; // iOS
}

// Listen for display mode changes
window.matchMedia('(display-mode: standalone)')
  .addEventListener('change', (e) => {
    console.log('Display mode:', e.matches ? 'standalone' : 'browser');
  });
```

## Push Notifications

```javascript
// Request permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await subscribeToPush();
  }
  return permission;
}

// Subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // Send subscription to server
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}

// sw.js - Handle push events
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url }
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

## Share Target

```javascript
// sw.js - Handle share target
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share') &&
      event.request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const title = formData.get('title');
      const text = formData.get('text');
      const url = formData.get('url');

      // Store or process shared content
      // Redirect to app with shared data
      return Response.redirect(`/?shared=true&title=${encodeURIComponent(title)}`);
    })());
  }
});
```
