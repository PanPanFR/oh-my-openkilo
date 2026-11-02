# Storage State

Cookies, localStorage, sessionStorage, IndexedDB, full state snapshots.

## State save / load

```bash
playwright-cli state-save                          # storage-state-{timestamp}.json
playwright-cli state-save my-auth-state.json
playwright-cli state-load my-auth-state.json
playwright-cli open https://example.com            # reload to apply cookies
```

Format:

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123",
      "domain": "example.com",
      "path": "/",
      "expires": 1893456000,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://example.com",
      "localStorage": [
        { "name": "theme", "value": "dark" },
        { "name": "user_id", "value": "12345" }
      ]
    }
  ]
}
```

## Cookies

```bash
playwright-cli cookie-list [--domain=...] [--path=...]
playwright-cli cookie-get session_id
playwright-cli cookie-set session abc123
playwright-cli cookie-set session abc123 --domain=example.com --path=/ --httpOnly --secure --sameSite=Lax
playwright-cli cookie-set remember_me token123 --expires=1893456000
playwright-cli cookie-delete session_id
playwright-cli cookie-clear
```

**Multiple cookies / complex options** → use `run-code`:

```bash
playwright-cli run-code "async page => {
  await page.context().addCookies([
    { name: 'session_id', value: 'sess_abc123', domain: 'example.com', path: '/', httpOnly: true },
    { name: 'preferences', value: JSON.stringify({ theme: 'dark' }), domain: 'example.com', path: '/' }
  ]);
}"
```

## localStorage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get token
playwright-cli localstorage-set theme dark
playwright-cli localstorage-set user_settings '{"theme":"dark","language":"en"}'
playwright-cli localstorage-delete token
playwright-cli localstorage-clear
```

**Multiple ops** → `run-code`:

```bash
playwright-cli run-code "async page => {
  await page.evaluate(() => {
    localStorage.setItem('token', 'jwt_abc123');
    localStorage.setItem('user_id', '12345');
    localStorage.setItem('expires_at', Date.now() + 3600000);
  });
}"
```

## sessionStorage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get form_data
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

## IndexedDB

No direct CLI; use `run-code`:

```bash
playwright-cli run-code "async page => {
  return await page.evaluate(async () => {
    const databases = await indexedDB.databases();
    return databases;
  });
}"

playwright-cli run-code "async page => {
  await page.evaluate(() => {
    indexedDB.deleteDatabase('myDatabase');
  });
}"
```

## Auth state reuse

```bash
# Login once, save
playwright-cli open https://app.example.com/login
playwright-cli snapshot
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli state-save auth.json

# Later, restore, skip login
playwright-cli state-load auth.json
playwright-cli open https://app.example.com/dashboard
```

## Security

- Never commit auth state files.
- Add `*.auth-state.json` to `.gitignore`.
- Delete state files after automation.
- Use env vars for secrets.
- Default in-memory mode is safer for sensitive ops.
