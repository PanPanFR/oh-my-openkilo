# Tracing

Capture detailed execution traces for debugging: DOM snapshots, screenshots, network, console.

## Basic usage

```bash
playwright-cli tracing-start
playwright-cli open https://app.example.com
playwright-cli click e1
playwright-cli fill e2 "test"
playwright-cli tracing-stop
```

## Output files (`traces/`)

| File | Contents |
|------|----------|
| `trace-{ts}.trace` | Action log: actions, DOM before/after, screenshots, timing, console, source locs |
| `trace-{ts}.network` | All requests/responses: headers, bodies, timing, sizes, errors |
| `resources/` | Cached resources: images, fonts, scripts, response bodies for replay |

## Use cases

**Debug failed action:**

```bash
playwright-cli tracing-start
playwright-cli open https://app.example.com
playwright-cli click e5    # this fails
playwright-cli tracing-stop
# Open trace to see DOM state when click was attempted
```

**Perf analysis:**

```bash
playwright-cli tracing-start
playwright-cli open https://slow-site.com
playwright-cli tracing-stop
# View network waterfall
```

**Capture evidence:**

```bash
playwright-cli tracing-start
playwright-cli open https://app.example.com/checkout
playwright-cli fill e1 "4111111111111111"
playwright-cli fill e2 "12/25"
playwright-cli fill e3 "123"
playwright-cli click e4
playwright-cli tracing-stop
```

## Trace vs video vs screenshot

| | Trace | Video | Screenshot |
|---|---|---|---|
| Format | .trace | .webm | .png |
| DOM inspect | yes | no | no |
| Network | yes | no | no |
| Replay | step-by-step | continuous | single frame |
| Best for | debugging | demos | quick capture |

## Best practices

1. **Start before the problem** — trace the full flow leading to the issue.
2. **Clean up**: `find .playwright-cli/traces -mtime +7 -delete`.

## Limitations

- Tracing adds overhead.
- Large traces consume disk.
- Some dynamic content may not replay perfectly.
