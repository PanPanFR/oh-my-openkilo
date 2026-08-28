---
name: playwright-cli
description: Use when automating browser interactions, E2E tests, web scraping, snapshotting, request mocking, or Playwright test generation/debug. Triggers on "open browser", "click button", "fill form", "take screenshot", "run playwright test", "playwright-cli", "@playwright/cli", or tasks needing persistent browser sessions.
---

# Browser Automation with playwright-cli

Token-efficient CLI for Playwright. Use when automation load is high (many page reads, big snapshots) and MCP tool schemas eat too much context. For small ad-hoc inspects, prefer `chrome-devtools` MCP.

**Invoke via bash tool.** Example: `playwright-cli open https://example.com`. Opencode runs these directly; the model never sees a heavy MCP tool schema for the browser.

## Quick start

```bash
playwright-cli open                                  # new browser
playwright-cli open https://example.com              # open + navigate
playwright-cli goto https://playwright.dev
playwright-cli snapshot                              # get refs (e1, e2, ...)
playwright-cli click e15
playwright-cli type "page.click"
playwright-cli press Enter
playwright-cli screenshot                            # rarely needed; snapshot > screenshot
playwright-cli close
```

## Core commands

```bash
playwright-cli open [url]              # open browser, optionally navigate
playwright-cli goto <url>              # navigate
playwright-cli snapshot                # a11y tree with element refs
playwright-cli snapshot e5             # snapshot a specific element
playwright-cli snapshot --depth=4      # limit depth
playwright-cli snapshot --boxes        # include bounding boxes
playwright-cli find "Sign in"          # search snapshot (returns matching nodes + context)
playwright-cli find --regex "Sign (in|up)"
playwright-cli find --regex "/sign (in|up)/i"    # slashes = flags
playwright-cli click <ref> [button]    # click (default left)
playwright-cli dblclick <ref> [button]
playwright-cli hover <ref>
playwright-cli type <text>             # type into focused element
playwright-cli fill <ref> <text>       # fill input
playwright-cli fill <ref> <text> --submit   # fill + press Enter
playwright-cli press <key>            # Enter, ArrowDown, a, Control+A, ...
playwright-cli keydown <key> / keyup <key>
playwright-cli select <ref> <value>    # dropdown
playwright-cli check <ref> / uncheck <ref>
playwright-cli drag <fromRef> <toRef>
playwright-cli drop <ref> --path=./file.png   # drop file from outside page
playwright-cli drop <ref> --data="text/plain=hello"
playwright-cli upload <file...>
playwright-cli eval "document.title"                 # JS on page
playwright-cli eval "el => el.textContent" e5       # JS on element
playwright-cli dialog-accept [prompt] / dialog-dismiss
playwright-cli resize <w> <h>
playwright-cli close
playwright-cli go-back / go-forward / reload
playwright-cli mousemove <x> <y>
playwright-cli mousedown [button] / mouseup [button]
playwright-cli mousewheel <dx> <dy>
playwright-cli screenshot [ref] [--filename=f.png] [--hires]
playwright-cli pdf [--filename=page.pdf]
playwright-cli tab-list / tab-new [url] / tab-close [idx] / tab-select <idx>
```

## Storage

```bash
playwright-cli state-save [file] / state-load <file>

playwright-cli cookie-list [--domain=...] [--path=...]
playwright-cli cookie-get <name>
playwright-cli cookie-set <name> <val> [--domain=...] [--httpOnly] [--secure] [--sameSite=Lax] [--expires=unix]
playwright-cli cookie-delete <name>
playwright-cli cookie-clear

playwright-cli localstorage-list / get <k> / set <k> <v> / delete <k> / clear
playwright-cli sessionstorage-list / get <k> / set <k> <v> / delete <k> / clear
```

## Network

```bash
playwright-cli route "<pattern>" [--status=N] [--body=...] [--content-type=...] [--header="K: V"] [--remove-header=h1,h2]
playwright-cli route-list
playwright-cli unroute [<pattern>]      # no arg = remove all
```

Patterns: `**/*.jpg`, `**/api/*/details`, `**/*.{png,jpg}`, `**/search?q=*`.

## DevTools

```bash
playwright-cli console [level]            # level: error|warning|info|debug
playwright-cli requests / request <idx>
playwright-cli run-code "async page => { ... }"      # arbitrary Playwright code
playwright-cli run-code --filename=./script.js
playwright-cli tracing-start / tracing-stop
playwright-cli video-start [file.webm]
playwright-cli video-chapter "<title>" [--description=...] [--duration=ms]
playwright-cli video-show-actions [--duration=ms] [--position=top-right]
playwright-cli video-hide-actions
playwright-cli video-stop
playwright-cli show [--annotate]          # open visual dashboard
playwright-cli generate-locator <ref> [--raw]
playwright-cli highlight <ref> [--style="outline: 3px dashed red"] [--hide]
```

## Open parameters

```bash
playwright-cli open --browser=chrome|firefox|webkit|msedge
playwright-cli open --mobile                              # generic mobile (lighter snapshots)
playwright-cli open --device="iPhone 15"
playwright-cli open --persistent                          # profile persisted to disk
playwright-cli open --profile=/path/to/profile
playwright-cli open --headed
playwright-cli open --config=./.playwright/cli.config.json
playwright-cli attach --extension=chrome                  # Playwright extension
playwright-cli attach --cdp=chrome|msedge                 # running browser by channel
playwright-cli attach --cdp=http://localhost:9222         # CDP endpoint
playwright-cli detach                                    # leave external browser running
playwright-cli delete-data                               # wipe default session data
```

## Snapshots and refs

After each command, playwright-cli prints a snapshot of current state:

```bash
> playwright-cli goto https://example.com
### Page
- Page URL: https://example.com/
- Page Title: Example Domain
### Snapshot
[Snapshot](.playwright-cli/page-2026-02-14T19-22-42-679Z.yml)
```

Use refs from `snapshot` (`e1`, `e2`, ...) to target elements. CSS selectors and Playwright locators also work:

```bash
playwright-cli click "#main > button.submit"
playwright-cli click "getByRole('button', { name: 'Submit' })"
playwright-cli click "getByTestId('submit-button')"
```

## Sessions (concurrent, isolated)

```bash
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=public open https://example.com
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
playwright-cli list                    # list all sessions
playwright-cli close                   # stop default
playwright-cli -s=auth close           # stop named
playwright-cli close-all
playwright-cli kill-all                # force-kill zombies
playwright-cli -s=auth delete-data     # wipe session profile
export PLAYWRIGHT_CLI_SESSION=mysession    # default session via env
```

## Raw output

`--raw` strips page status / generated code / snapshot sections; returns just the result. Use to pipe into other tools.

```bash
playwright-cli --raw eval "JSON.stringify(performance.timing)" | jq '.loadEventEnd - .navigationStart'
playwright-cli --raw snapshot > before.yml
playwright-cli click e5
playwright-cli --raw snapshot > after.yml
diff before.yml after.yml
TOKEN=$(playwright-cli --raw cookie-get session_id)
```

`--json` wraps every reply as JSON: `playwright-cli list --json`.

## Windows `&` gotcha

`cmd.exe` and PowerShell treat `&` as command separator → URL with multiple query params gets truncated.

```batch
playwright-cli goto "https://example.com/?a=1^&b=2"
```

```powershell
playwright-cli --% goto "https://example.com/?a=1&b=2"
```

## MCP choice (opencode)

| Need | Use |
|------|-----|
| Many page reads, big snapshots, low context budget | `playwright-cli` via bash (this skill) |
| Quick live inspect / debug / Lighthouse / perf trace | `chrome-devtools` MCP |
| Cheap file-based screenshot/DOM peek | `chrome-devtools` MCP |
| Stateful persistent MCP loop, self-healing tests | `playwright` MCP (`@playwright/mcp`) |

## Reference docs (load on demand)

| Topic | File |
|-------|------|
| Run/debug Playwright tests | `references/playwright-tests.md` |
| Request mocking (route, run-code patterns) | `references/request-mocking.md` |
| Arbitrary Playwright code via `run-code` | `references/running-code.md` |
| Concurrent browser sessions, attach, persistent | `references/session-management.md` |
| Cookies, localStorage, sessionStorage, storage state | `references/storage-state.md` |
| Test generation (plan / generate / heal) | `references/test-generation.md` |
| Tracing (`.trace` files, DOM snapshots) | `references/tracing.md` |
| Video recording + overlay/chapter API | `references/video-recording.md` |
| Inspect hidden element attributes (id, class, data-*) | `references/element-attributes.md` |

## Examples

**Form submit:**

```bash
playwright-cli open https://example.com/form
playwright-cli snapshot
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli snapshot
playwright-cli close
```

**Multi-tab:**

```bash
playwright-cli open https://example.com
playwright-cli tab-new https://example.com/other
playwright-cli tab-list
playwright-cli tab-select 0
playwright-cli close
```

**DevTools debug:**

```bash
playwright-cli open https://example.com
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli console
playwright-cli requests
playwright-cli close
```

**Interactive UI review (user annotates page):**

```bash
playwright-cli open https://example.com
playwright-cli show --annotate
```

## Install (already done globally; kept for reference)

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

If global is not in PATH, use local: `npx --no-install playwright --version`. Otherwise the global install above is required.
