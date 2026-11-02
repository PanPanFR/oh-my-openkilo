# Testing, Project Structure & Launch Checklists

## Lighthouse Audit

```bash
# Run Lighthouse from CLI
npx lighthouse https://your-app.com --view

# Key metrics to check:
# - PWA badge (installable, offline-ready)
# - Performance score
# - Best practices
# - Accessibility
```

## Manual Testing Checklist

- [ ] **Installability**
  - [ ] Install prompt appears on desktop Chrome
  - [ ] Can be added to home screen on mobile
  - [ ] App opens in standalone mode after install

- [ ] **Offline Support**
  - [ ] App loads when offline (airplane mode)
  - [ ] Cached pages display correctly
  - [ ] Offline fallback page shows for uncached routes
  - [ ] Background sync works when coming back online

- [ ] **Performance**
  - [ ] First Contentful Paint < 1.8s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Time to Interactive < 3.8s
  - [ ] Cumulative Layout Shift < 0.1

- [ ] **Service Worker**
  - [ ] SW registers successfully
  - [ ] Static assets cached on install
  - [ ] SW updates correctly (new version)
  - [ ] No stale cache issues

- [ ] **Manifest**
  - [ ] All required fields present
  - [ ] Icons display correctly
  - [ ] Theme color applied
  - [ ] Splash screen shows on launch

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

## Project Structure

```
project/
├── public/
│   ├── manifest.json           # Web app manifest
│   ├── sw.js                   # Service worker (if not bundled)
│   ├── offline.html            # Offline fallback page
│   ├── robots.txt
│   └── icons/
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       ├── icon-512.png
│       ├── icon-maskable.png   # For adaptive icons
│       ├── apple-touch-icon.png
│       └── favicon.ico
├── src/
│   ├── sw.js                   # Service worker source (if bundled)
│   ├── pwa/
│   │   ├── install.js          # Install prompt handling
│   │   ├── offline.js          # Offline detection
│   │   └── push.js             # Push notification handling
│   └── ...
└── tests/
    └── pwa/
        ├── manifest.test.js
        ├── sw.test.js
        └── offline.test.js
```

## PWA Development Checklist

### Before Launch

- [ ] HTTPS configured (production)
- [ ] Manifest complete with all required fields
- [ ] Icons in all required sizes (192, 512, maskable)
- [ ] Service worker registered and working
- [ ] Offline page created and cached
- [ ] Cache strategies defined for all resource types
- [ ] Install prompt handling implemented
- [ ] Lighthouse PWA audit passes

### After Launch

- [ ] Monitor cache sizes
- [ ] Test SW updates don't break app
- [ ] Track PWA installs via analytics
- [ ] Test on multiple devices/browsers
- [ ] Monitor Core Web Vitals
- [ ] Set up push notification flow (if needed)
