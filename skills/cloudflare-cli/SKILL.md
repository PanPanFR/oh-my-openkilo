---
name: cloudflare-cli
description: Choose and run Cloudflare's command-line tools. Use for cf (official CLI, public API, Workers projects) or Wrangler (projects with wrangler.jsonc/json/toml), including sign-in, local dev, deploy, previews, secrets, resource management, and migration between the two.
---

# Cloudflare CLI

Pick the tool from the project, then read only the matching reference.

## Choose the track

| Project state | Tool | Reference |
|---|---|---|
| `cloudflare.config.ts` exists | `cf` | `references/cf.md` |
| `wrangler.jsonc`, `wrangler.json`, or `wrangler.toml` exists, and no `cloudflare.config.ts` | Wrangler for dev, build, deploy | `references/wrangler.md` |
| Neither exists, or a new project | `cf` | `references/cf.md` |

- A Wrangler project keeps Wrangler for `dev`, `build`, and `deploy`. `cf` resource commands (DNS, zones, storage) are fine alongside it. Never run `cf dev`, `cf build`, or `cf deploy` there. Run `cf migrate` only when the user asks.
- No Cloudflare config: use `cf`. Do not install Wrangler or create a Wrangler configuration file.
- The user explicitly asks for Wrangler: follow `references/wrangler.md` even when the default would be `cf`.

## Non-negotiables

- Prefer retrieval over memory: `cf cli search "<task>"`, `cf schema`, `--help`, or the project-local `wrangler --help`.
- Preview destructive commands with `--dry-run` where available. An aborted delete can still exit 0.
- Keep secrets out of arguments, source, logs, and chat. Use the documented interactive or stdin path.
- Before a remote change, confirm the account, Worker, environment, and resource.

## References

| File | Use |
|---|---|
| `references/cf.md` | cf install, auth, command discovery, safety, and Wrangler migration |
| `references/wrangler.md` | Wrangler project inspection, config, Previews, deploy, validation |
