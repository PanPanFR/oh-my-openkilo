# Configuration

`opencode.json` is the brain of your OpenCode install. It lives at `~/.config/opencode/opencode.json` and is **never committed** to this repo (it contains your secrets, not ours).

[`examples/opencode.example.json`](../examples/opencode.example.json) is the brain we ship, and it ships **ready to use**: plugin directory present, AGENTS.md policy, MCP servers declared, provider template in place, sensible permission defaults. You don't need to write `opencode.json` from scratch. Copy the example, swap the `{env:VAR}` placeholders for your real env vars, and save it as `~/.config/opencode/opencode.json`. Done.

Below is a tour of every block in that example so you know what you're editing. For the full OpenCode schema reference, see [opencode.ai/v2/docs/config/](https://opencode.ai/v2/docs/config/).

## Top-level fields

| Field               | Type     | Purpose                                                                                |
|---------------------|----------|----------------------------------------------------------------------------------------|
| `$schema`           | string   | JSON schema URL. Don't change unless OpenCode changes the schema location.             |
| `model`             | string   | Default model for primary agents. Use the format `<provider>/<model>` (e.g. `anthropic/claude-sonnet-4-5`). |
| `small_model`       | string   | Model for short tasks (commit messages, file summaries). Cheaper and faster.            |
| `permissions`       | array    | Ordered `{action, resource, effect}` rules. See below.                                                    |
| `disabled_providers`| string[] | Providers to exclude from auto-discovery.                                               |
| `agents`            | object   | Built-in agent overrides. Use `disabled: true` to hide an agent.                         |
| `plugins/`          | folder   | Plugin files are discovered from this directory. See below.                              |
| `provider`          | object   | External LLM provider configs (`npm` + `options` + `models`).                                                            |
| `mcp`               | object   | MCP servers under `mcp.servers`; `disabled: true` keeps one off.                                                                     |
| `instructions`      | string[] | Accepted but ignored by OpenCode V2; use the global `AGENTS.md` instead.                             |
| `lsp`               | boolean  | Enable Language Server Protocol. Recommended `true`.                                    |

## Per-agent model selection

The top-level `model` and `small_model` are fallback defaults for OpenCode's built-in agents. The pack's agents carry their own `model:` frontmatter, which overrides the top-level default.

| Agent | Default model |
|-------|---------------|
| `builder` | `opencode/deepseek-v4.1-flash-free#max` |
| `planner` | `9router/ag/claude-opus-4-6-thinking` |
| `designer` | `9router/ag/gemini-3.8-flash-high` |
| `tester` | `opencode/mimo-v2.6-flash-free` |
| `reviewer` | `opencode/glm-5.3-flash-free#max` |
| `documenter` | `9router/ag/gemini-3.8-flash-high` |

Builder, reviewer, and tester use free OpenCode models. Planner, designer, and documenter need the `9router` provider, or a per-agent `model:` override. See [docs/AGENTS.md](AGENTS.md#changing-the-model).
## Permissions

The example ships with an allow-all `permissions` list. This is the maintainer's preference (max automation). For a stricter setup, change to `deny` and explicitly allow only what you want:

```jsonc
"permissions": [
  { "action": "read", "resource": "*", "effect": "allow" },
  { "action": "edit", "resource": "*", "effect": "deny" },
  { "action": "shell", "resource": "*", "effect": "deny" },
  { "action": "glob", "resource": "*", "effect": "allow" },
  { "action": "grep", "resource": "*", "effect": "allow" }
  // ...
]
```

A more balanced setup for security-sensitive work:

```jsonc
"permissions": [
  { "action": "read", "resource": "*", "effect": "allow" },
  { "action": "edit", "resource": "*", "effect": "ask" },
  { "action": "shell", "resource": "*", "effect": "ask" },
  { "action": "glob", "resource": "*", "effect": "allow" },
  { "action": "grep", "resource": "*", "effect": "allow" },
  { "action": "webfetch", "resource": "*", "effect": "deny" },
  { "action": "websearch", "resource": "*", "effect": "deny" },
  { "action": "subagent", "resource": "*", "effect": "allow" },
  { "action": "skill", "resource": "*", "effect": "allow" }
]
```

## Plugins

The example does not declare a `plugins` array. OpenCode discovers files under `plugins/`. The pack ships three loaders plus the caveman package:

- `agentmemory-capture.ts`: captures session observations.
- `plugins/caveman/`: terse-mode state and style. OpenCode v2 loads `server.js`; v1 loads `plugin.js` through `package.json`.
- `rtk.ts`: rewrites git output (`git log`, `diff`, `show`, `blame`, `branch`) to compact form. Needs `rtk` in PATH; disables itself otherwise.
- `subagent-guard.ts`: circuit breaker for failing subagent retries.

Drop a file to disable that plugin. The pack degrades gracefully; `agentmemory-capture` is the only one the memory skills depend on. `rtk` on Windows also needs Git's `usr\bin` on PATH (`C:\Program Files\Git\usr\bin`) for `ls`/`tree`/`find`; PowerShell aliases cannot be resolved by rtk.

### Optional npm plugin: Ponytail

`AGENTS.md` carries the always-on engineering-discipline policy, and the optional `@dietrichgebert/ponytail` plugin states the active level per turn. It is not shipped in the pack because the pack has no root `package.json`. Install it in your config dir and declare it:

```jsonc
"plugins": ["@dietrichgebert/ponytail"]
```

Without it, the policy still applies; you just lose the per-turn level banner.

The shipped plugins target the **v2 plugin contract**: a `default` export of `{ id, setup }`, with hooks registered through `ctx.tool.hook`, `ctx.event.subscribe`, and `ctx.session.hook`. On v1 none of the plugin extras load; the text policy and skills still work. Hooks with no v2 equivalent degrade with a single console warning. Caveman state and agentmemory capture use the v2 session hooks.
## Provider

External LLM providers live under `provider` (singular). Each provider has:

- `npm`: the runtime provider package (for example `@ai-sdk/openai-compatible`)
- `options`: provider-specific config (base URL, API key, headers)
- `models`: model definitions (`modelID`, display name, `limit`, `capabilities`)

The example defines `9router` with `{env:NINE_ROUTER_BASE_URL}` and `{env:NINE_ROUTER_API_KEY}`. Three agents default to models on that endpoint; builder, reviewer, and tester use free `opencode/*` models and need no provider block. Remove or replace the provider if you override every agent.

**Credentials:** use the `{env:VAR}` placeholder pattern. Set the env var in your shell, or in a `.env` file (which is gitignored):

```jsonc
"options": {
  "baseURL": "https://your-provider.example.com/v1",
  "apiKey": "{env:YOUR_PROVIDER_API_KEY}"
}
```

The `{env:VAR}` placeholder is resolved from the environment. **Never** put a literal API key in `opencode.json` if you plan to commit it.
## MCP servers

Each MCP server is one of two types:

- `"type": "local"`: runs a command on your machine via `npx` or `python`
- `"type": "remote"`: connects to a remote URL

The example ships a small starter set: `agentmemory` (always on, needed by the memory skills) and `context7` (remote docs, enabled). `chrome-devtools`, `shadcn`, `magicuidesign-mcp`, and `reactbits` ship with `"disabled": true`; enable the ones you need.

To enable:

1. Remove `"disabled": true` from the MCP entry (absent means enabled).
2. Provide any required env var via `{env:VAR}` in the config, or set the env var in your shell.
3. For `local` MCPs that reference installed CLIs (e.g. `playwright` needs `npx playwright install chromium` first run), follow the package's own setup.
4. Restart OpenCode or run `/reload`.

### Per-MCP credential table

| MCP                    | Required env / file                                | Free? | Used by                                |
|------------------------|----------------------------------------------------|-------|----------------------------------------|
| `agentmemory`          | `AGENTMEMORY_SERVER_URL` (default: local server)    | yes (npm global) | memory skills |
| `chrome-devtools`      | none (uses installed Chrome)                       | yes   | quick screenshots, page inspection     |
| `reactbits`            | none (optional `GITHUB_TOKEN` for rate limits)     | yes   | ReactBits animated components          |

`context7` ships enabled in the example (remote, no key by default). Anything beyond the rows above (`playwright`, your own) is something you wire up yourself; the example just shows you the shape.

Agent validation validates your config (parses the JSON, lists connected MCPs, checks each MCP can launch, and warns if any connected MCP has a missing env var). Run it after changing `opencode.json` to re-validate.

## Installing MCP servers

Two MCPs ship enabled in the example: `agentmemory` (memory skills) and `context7` (remote docs). Everything else (`chrome-devtools`, `shadcn`, `magicuidesign-mcp`, `reactbits`, your own) ships with `"disabled": true`; enable the ones you need.

Most MCPs in this pack are `npx`-based; OpenCode downloads the package on first use. None of them require a separate install step before enabling in `opencode.json`, but several need a one-time setup after the first run.

### `agentmemory` (required, already enabled)

Two pieces: a global CLI/server, and an MCP entry that points to the local server.

```bash
# 1. Install the server CLI globally
npm i -g @agentmemory/server

# 2. Start the local server (default: http://localhost:3111)
agentmemory serve
```

The `mcp.agentmemory` entry in `opencode.json` already points to `http://localhost:3111` via the `AGENTMEMORY_SERVER_URL` env var. If you change the port, update that env var to match.

### `context7` (enabled, remote, no install)

```jsonc
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" }
      }
    }
  }
}
```

Get a free API key at [context7.com](https://context7.com), set `CONTEXT7_API_KEY` in your shell or `.env`, then enable. No local install.

### `chrome-devtools` (disabled by default, npm, no setup)

```jsonc
{
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      }
    }
  }
}
```

`npx` downloads it on first invocation. Requires Chrome/Chromium installed on the system.

#### Turn it off when you don't need it

Every enabled MCP adds its tools to every session, which eats context even on days you never touch a browser. If you rarely inspect web pages, turn it off:

```jsonc
{
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
        "disabled": true
      }
    }
  }
}
```

Add `"disabled": true`, then restart OpenCode or run `/reload`. For heavy browser automation (many pages, form filling, scraping), use the `playwright-cli` skill instead: it runs through the shell only when you ask, so it costs nothing when idle. Re-enable by removing the `"disabled": true` line.

### `playwright` (opt-in, npm + one-time browser download)

```jsonc
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp@latest"]
      }
    }
  }
}
```

After enabling, download the Chromium browser once:

```bash
npx playwright install chromium       # ~150 MB
```

Caches per machine; subsequent runs reuse the binary.

### `reactbits` (opt-in, npm, no setup)

```jsonc
{
  "mcp": {
    "servers": {
      "reactbits": {
        "type": "local",
        "command": ["npx", "-y", "reactbits-dev-mcp-server"],
        "disabled": true
      }
    }
  }
}
```

Community server exposing 135+ animated ReactBits components. `npx` downloads it on first invocation; no token needed. Set `GITHUB_TOKEN` in your shell for higher GitHub API rate limits (60 to 5,000 req/hr), then remove `"disabled": true` and restart. (ReactBits' own docs recommend the `shadcn` MCP with the `@react-bits` registry instead; this standalone entry is the community alternative.)

### Troubleshooting MCP installs

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `command not found: npx` | Node.js not installed | Install Node.js 18+ from [nodejs.org](https://nodejs.org) |
| `EACCES` when running `npx` | Permission issue on global npm dir | `npm config set prefix ~/.npm-global` and add to PATH, or use a Node version manager (nvm, fnm) |
| MCP connected but tools missing in OpenCode | OpenCode cached the old server list | Restart OpenCode or run `/reload` after editing |
| `context7` returns auth errors | Missing or wrong `CONTEXT7_API_KEY` | Verify the env var is set in the **same shell** that started OpenCode |
| `playwright` times out | Browser binary not downloaded | Run `npx playwright install chromium` once |
| `agentmemory` MCP fails to connect | Server not running | Start with `agentmemory serve` in another terminal, or set up as a system service |

Most MCP issues come from the env var not being visible to OpenCode's process. Set env vars in your shell profile (`.bashrc`, `.zshrc`, PowerShell `$PROFILE`) or use a `.env` file in the directory where you start OpenCode.

## Instructions (V2 ignores this key)

OpenCode V2 accepts but never loads the `instructions` array, so the pack does not use it. Always-on policy lives in `AGENTS.md`, with two on-demand rule files referenced from its Rules map. Keep it that way: a second always-on layer duplicates context every turn.
## LSP

`"lsp": true` flips on the Language Server Protocol integration. Recommended on. If you turn it off, agents lose type-aware code navigation and refactor.

## Verifying your config

Start OpenCode and ask:

```
show me your current model, list connected MCPs, and confirm which rules are loaded
```

If anything is missing, check the spelling of the relevant key in `opencode.json` and that any required env vars are set in your shell.

