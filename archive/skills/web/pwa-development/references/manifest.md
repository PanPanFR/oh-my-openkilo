# Web App Manifest

## Required Fields

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "A description of what the app does",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Enhanced Manifest (Full Features)

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "description": "A full-featured PWA",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#ffffff",
  "theme_color": "#3367D6",
  "dir": "ltr",
  "lang": "en",
  "categories": ["productivity", "utilities"],

  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],

  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],

  "shortcuts": [
    {
      "name": "New Item",
      "short_name": "New",
      "description": "Create a new item",
      "url": "/new?source=shortcut",
      "icons": [{ "src": "/icons/shortcut-new.png", "sizes": "192x192" }]
    }
  ],

  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "files", "accept": ["image/*"] }]
    }
  },

  "protocol_handlers": [
    {
      "protocol": "web+myapp",
      "url": "/handle?url=%s"
    }
  ],

  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "text/plain": [".txt"]
      }
    }
  ]
}
```

## Manifest Checklist

- [ ] `name` and `short_name` defined
- [ ] `start_url` set (use query param for analytics)
- [ ] `display` set to `standalone` or `fullscreen`
- [ ] Icons: 192x192 and 512x512 minimum
- [ ] Maskable icon included for Android adaptive icons
- [ ] `theme_color` matches app design
- [ ] `background_color` for splash screen
- [ ] Screenshots for richer install UI (optional)
- [ ] Shortcuts for quick actions (optional)

## Minimum Installable Manifest

```json
{
  "name": "App Name",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
