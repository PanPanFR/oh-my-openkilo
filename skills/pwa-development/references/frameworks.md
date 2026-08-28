# Framework-Specific Guides

## Next.js

```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Your Next.js config
});
```

## Create React App

```bash
# CRA 4+ has PWA support built-in
npx create-react-app my-pwa --template cra-template-pwa
```

## Vite (Any Framework)

```bash
npm install vite-plugin-pwa -D
```

See `workbox.md` -> "Workbox with Vite" for configuration.
