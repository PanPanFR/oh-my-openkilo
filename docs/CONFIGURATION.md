# Configuration

`opencode.json` is the **runtime configuration file** for OpenCode. It lives at `~/.config/opencode/opencode.json` and is **never committed** to this repo (it contains credentials).

This document describes each block of [`examples/opencode.example.json`](../examples/opencode.example.json) so you can fill it in correctly.

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

The pack ships with all 8 named agents set to a **free model** from OpenCode (e.g. `opencode/nemotron-3-ultra-free`). You can use the pack with no provider configuration — but you can also override per agent by editing the frontmatter in `agents/<name>.md`.

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

The example lists the four plugins oh-my-openkilo needs. Remove any you don't want to use.

## Provider

External LLM providers. Each provider has:

- `npm` — the npm package to use as the SDK adapter
- `options` — provider-specific config (API key, base URL, headers)
- `models` — model definitions (context length, output length, modalities)

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

- `"type": "local"` — runs a command on your machine via `npx` or `python`
- `"type": "remote"` — connects to a remote URL

The example lists nine MCPs covering knowledge graph, browser automation, design, video, and external research. Each is `enabled: false` by default except the always-on ones (`agentmemory`, `chrome-devtools`, `playwright`, `stitch`, `context7`).

To enable:

1. Set `"enabled": true` for the MCP.
2. Provide any required env var via `{env:VAR}` in the config, or set the env var in your shell.
3. For `local` MCPs that reference installed CLIs (e.g. `playwright` needs `npx playwright install chromium` first run), follow the package's own setup.
4. Restart OpenCode or run `/reload`.

### Per-MCP credential table

| MCP                    | Required env / file                                | Free? | Used by                                |
|------------------------|----------------------------------------------------|-------|----------------------------------------|
| `agentmemory`          | `AGENTMEMORY_SERVER_URL` (Plus server)             | yes (npm global) | `agentmemory` rule, `recall`/`remember` |
| `chrome-devtools`      | none (uses installed Chrome)                       | yes   | `chrome-devtools` skill                |
| `playwright`           | `npx playwright install chromium` (first run)      | yes   | `playwright-cli` skill                 |
| `stitch`               | `GOOGLE_API_KEY`                                   | tier-based | `designer` agent, `stitch` skill    |
| `context7`             | `CONTEXT7_API_KEY` (free at context7.com)          | yes   | `researcher`, doc lookup               |
| `remotion`             | none (uses local node)                             | yes   | `remotion` skill                       |
| `supabase-mcp-server`  | `SUPABASE_ACCESS_TOKEN`                            | tier-based | Supabase ops                       |

The `install.ps1` validator scans your config after install and warns if any enabled MCP has a missing env var. Re-run it after changing `opencode.json` to re-validate.

## Instructions

Paths to always-on rule files, relative to the directory containing `opencode.json`. The maintainer's order (protocol rules first) is what the example uses. Reorder to taste, but put first-action protocols early — earlier entries get better model compliance.

## LSP

`"lsp": true` enables the Language Server Protocol integration. Recommended on. If you turn it off, agents lose type-aware code navigation and refactor.

## Verifying your config

Start OpenCode and ask:

```
show me your current model, list enabled MCPs, and confirm which rules are loaded
```

If anything is missing, check the spelling of the relevant key in `opencode.json` and that any required env vars are set in your shell.
