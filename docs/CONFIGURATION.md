# Configuration

`opencode.json` is the brain of your OpenCode install. It lives at `~/.config/opencode/opencode.json` and is **never committed** to this repo (it contains your secrets, not ours).

[`examples/opencode.example.json`](../examples/opencode.example.json) is the brain we ship, and it ships **ready to use**: plugin loaders wired, rules registered, MCP servers declared, provider template in place, sensible permission defaults. You don't need to write `opencode.json` from scratch. Copy the example, swap the `{env:VAR}` placeholders for your real env vars, and save it as `~/.config/opencode/opencode.json`. Done.

Below is a tour of every block in that example so you know what you're editing. For the full OpenCode schema reference, see [opencode.ai/docs/config/](https://opencode.ai/docs/config/).

## Top-level fields

| Field               | Type     | Purpose                                                                                |
|---------------------|----------|----------------------------------------------------------------------------------------|
| `$schema`           | string   | JSON schema URL. Don't change unless OpenCode changes the schema location.             |
| `model`             | string   | Default model for primary agents. Use the format `<provider>/<model>` (e.g. `9router/Kimi-K2.6`). |
| `small_model`       | string   | Model for short tasks (commit messages, file summaries). Cheaper and faster.            |
| `permission`        | object   | Per-tool allow/deny list. See below.                                                    |
| `disabled_providers`| string[] | Providers to exclude from auto-discovery.                                               |
| `agent`             | object   | Built-in agent overrides. Use `disable: true` to hide an agent.                         |
| `plugin`            | string[] | Plugin loaders. See below.                                                              |
| `provider`          | object   | External LLM provider configs.                                                          |
| `mcp`               | object   | MCP server configs.                                                                     |
| `instructions`      | string[] | Paths to always-on rule files, relative to the config dir.                             |
| `lsp`               | boolean  | Enable Language Server Protocol. Recommended `true`.                                    |

## Per-agent model selection

The `model` and `small_model` fields above are **fallback defaults** for OpenCode's built-in agents. The agents in this pack (`builder`, `planner`, `designer`, etc.) have their own `model:` field in their frontmatter, which **overrides** the top-level default for that agent.

The pack ships with all 8 named agents set to a **free model** from OpenCode (e.g. `opencode/nemotron-3-ultra-free`). You can use the pack with no provider configuration, but you can also override per agent by editing the frontmatter in `agents/<name>.md`.

See [docs/AGENTS.md](AGENTS.md#changing-the-model) for the default model table and how to switch.

## Permissions

The example ships with all permissions set to `allow`. This is the maintainer's preference (max automation). For a stricter setup, change to `deny` and explicitly allow only what you want:

```jsonc
"permission": {
  "read": "allow",
  "write": "deny",
  "edit": "deny",
  "bash": "deny",
  "glob": "allow",
  "grep": "allow",
  // ...
}
```

A more balanced setup for security-sensitive work:

```jsonc
"permission": {
  "read": "allow",
  "write": "ask",
  "edit": "ask",
  "bash": "ask",
  "glob": "allow",
  "grep": "allow",
  "webfetch": "deny",   // no outbound web
  "websearch": "deny",
  "task": "allow",      // subagent dispatch is fine
  "mcp": "ask",         // ask before each MCP tool call
  "lsp": "allow",
  "skill": "allow",
  "todowrite": "allow"
}
```

## Plugins

`plugin` is an array of plugin specifiers. Each can be:

- A relative path to a `.ts` or `.js` file: `./plugins/agentmemory-capture.ts`
- A relative path to a directory: `./plugins/caveman/plugin.js`
- An npm package name: `@dietrichgebert/ponytail`
- A git URL: `superpowers@git+https://github.com/obra/superpowers.git`

The example lists the 6 plugins the pack ships: 5 small TypeScript files we own (`agentmemory-capture`, `graphify`, `caveman`, `checkpoint`, `recall-first`) plus 2 npm packages (`ponytail`, `superpowers`). Drop any you don't want to load — the pack degrades gracefully without them, the only required one being `agentmemory-capture` if you use the memory skills.

## Provider

External LLM providers. Each provider has:

- `npm`: the npm package to use as the SDK adapter
- `options`: provider-specific config (API key, base URL, headers)
- `models`: model definitions (context length, output length, modalities)

The example has one provider placeholder (`9router`). Add your own providers here, e.g. `opencode`, `anthropic`, `openai`, `google`, or any OpenAI-compatible endpoint.

**Credentials:** use the `{env:VAR}` placeholder pattern. Set the env var in your shell, or in a `.env` file (which is gitignored):

```jsonc
"options": {
  "baseURL": "https://your-provider.example.com/v1",
  "apiKey": "{env:YOUR_PROVIDER_API_KEY}"
}
```

The `{env:VAR}` placeholder is resolved by OpenCode from the shell environment. **Never** put a literal API key in `opencode.json` if you plan to commit it.

## MCP servers

Each MCP server is one of two types:

- `"type": "local"`: runs a command on your machine via `npx` or `python`
- `"type": "remote"`: connects to a remote URL

The example ships a small starter set: `agentmemory` (always on, you need it for the memory skills) and `chrome-devtools` (always on, for the `chrome-devtools` skill). Other MCPs you might want (perplexity search, tinypuppet, custom ones) you add yourself by following the same shape.

To enable:

1. Set `"enabled": true` for the MCP.
2. Provide any required env var via `{env:VAR}` in the config, or set the env var in your shell.
3. For `local` MCPs that reference installed CLIs (e.g. `playwright` needs `npx playwright install chromium` first run), follow the package's own setup.
4. Restart OpenCode or run `/reload`.

### Per-MCP credential table

| MCP                    | Required env / file                                | Free? | Used by                                |
|------------------------|----------------------------------------------------|-------|----------------------------------------|
| `agentmemory`          | `AGENTMEMORY_SERVER_URL` (default: local server)    | yes (npm global) | memory skills, `recall`/`remember` |
| `chrome-devtools`      | none (uses installed Chrome)                       | yes   | `chrome-devtools` skill                |

Anything beyond the two above (playwright, context7, perplexity, tinypuppet, your own) is something you wire up yourself; the example just shows you the shape.

`/configcheck` validates your config (parses the JSON, lists enabled MCPs, checks each MCP can launch, and warns if any enabled MCP has a missing env var). Run it after changing `opencode.json` to re-validate.

## Installing MCP servers

Two MCPs ship enabled in the example: `agentmemory` (memory skills) and `chrome-devtools` (browser automation). Both are listed below. Everything else (`playwright`, `context7`, perplexity, tinypuppet, your own) is opt-in — copy the shape, set the env var, flip `enabled: true`.

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

### `context7` (opt-in, remote, no install)

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
      "enabled": true
    }
  }
}
```

Get a free API key at [context7.com](https://context7.com), set `CONTEXT7_API_KEY` in your shell or `.env`, then enable. No local install.

### `chrome-devtools` (already enabled, npm, no setup)

```jsonc
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
      "enabled": true
    }
  }
}
```

`npx` downloads it on first invocation. Requires Chrome/Chromium installed on the system.

### `playwright` (opt-in, npm + one-time browser download)

```jsonc
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

After enabling, download the Chromium browser once:

```bash
npx playwright install chromium       # ~150 MB
```

Caches per machine; subsequent runs reuse the binary.

### Troubleshooting MCP installs

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `command not found: npx` | Node.js not installed | Install Node.js 18+ from [nodejs.org](https://nodejs.org) |
| `EACCES` when running `npx` | Permission issue on global npm dir | `npm config set prefix ~/.npm-global` and add to PATH, or use a Node version manager (nvm, fnm) |
| MCP enabled but tools missing in OpenCode | OpenCode cached the disabled state | Restart OpenCode or run `/reload` after enabling |
| `context7` returns auth errors | Missing or wrong `CONTEXT7_API_KEY` | Verify the env var is set in the **same shell** that started OpenCode |
| `playwright` times out | Browser binary not downloaded | Run `npx playwright install chromium` once |
| `agentmemory` MCP fails to connect | Server not running | Start with `agentmemory serve` in another terminal, or set up as a system service |

Most MCP issues come from the env var not being visible to OpenCode's process. Set env vars in your shell profile (`.bashrc`, `.zshrc`, PowerShell `$PROFILE`) or use a `.env` file in the directory where you start OpenCode.

## Instructions

Paths to always-on rule files, relative to the directory containing `opencode.json`. The maintainer's order (protocol rules first) is what the example uses. Reorder to taste, but put first-action protocols early; earlier entries get better model compliance.

## LSP

`"lsp": true` flips on the Language Server Protocol integration. Recommended on. If you turn it off, agents lose type-aware code navigation and refactor.

## Verifying your config

Start OpenCode and ask:

```
show me your current model, list enabled MCPs, and confirm which rules are loaded
```

If anything is missing, check the spelling of the relevant key in `opencode.json` and that any required env vars are set in your shell.
