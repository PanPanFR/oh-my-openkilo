# Browser Session Management

Run multiple isolated browser sessions concurrently with state persistence.

## Named sessions

`-s` flag isolates browser context:

```bash
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=public open https://example.com
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
```

Each session is independent: cookies, localStorage/sessionStorage, IndexedDB, cache, history, tabs.

## Session commands

```bash
playwright-cli list
playwright-cli close
playwright-cli -s=mysession close
playwright-cli close-all
playwright-cli kill-all                                  # force-kill zombies
playwright-cli delete-data
playwright-cli -s=mysession delete-data
```

## Env var

```bash
export PLAYWRIGHT_CLI_SESSION=mysession
playwright-cli open example.com
```

## Common patterns

**Concurrent scrape:**

```bash
playwright-cli -s=site1 open https://site1.com &
playwright-cli -s=site2 open https://site2.com &
playwright-cli -s=site3 open https://site3.com &
wait

playwright-cli -s=site1 snapshot
playwright-cli -s=site2 snapshot
playwright-cli -s=site3 snapshot

playwright-cli close-all
```

**A/B test:**

```bash
playwright-cli -s=variant-a open "https://app.com?variant=a"
playwright-cli -s=variant-b open "https://app.com?variant=b"
playwright-cli -s=variant-a screenshot
playwright-cli -s=variant-b screenshot
```

**Persistent profile:**

By default profile is in-memory. Use `--persistent` to persist:

```bash
playwright-cli open https://example.com --persistent
playwright-cli open https://example.com --profile=/path/to/profile
```

## Attaching to a running browser

`attach` connects to an existing browser instead of launching one.

**By channel:**

```bash
playwright-cli attach --cdp=chrome
playwright-cli attach --cdp=msedge
```

Channels: `chrome`, `chrome-beta`, `chrome-dev`, `chrome-canary`, `msedge`, `msedge-beta`, `msedge-dev`, `msedge-canary`.

Target browser must have remote debugging enabled (`chrome://inspect/#remote-debugging` → enable).

**By CDP endpoint:**

```bash
playwright-cli attach --cdp=http://localhost:9222
```

**By extension:**

```bash
playwright-cli attach --extension
```

**Detach (attached sessions only):**

```bash
playwright-cli detach
playwright-cli -s=msedge detach
```

For `open` sessions, use `close` instead.

## Best practices

1. **Semantic session names**: `-s=github-auth`, `-s=docs-scrape` > `-s=s1`.
2. **Always clean up**: `playwright-cli -s=auth close` or `playwright-cli close-all`. Use `kill-all` for zombies.
3. **Delete stale data**: `playwright-cli -s=oldsession delete-data` to free disk.
