# Wrangler CLI Reference

## Quick Reference
| Task | Command |
|------|---------|
| Local dev | `wrangler dev` |
| Deploy | `wrangler deploy` |
| Deploy dry run | `wrangler deploy --dry-run` |
| Generate types | `wrangler types` |
| Profile startup | `wrangler check startup` |
| Live logs | `wrangler tail` |
| Delete | `wrangler delete` |
| Auth status | `wrangler whoami` |

## Config (wrangler.jsonc)
```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "vars": { "ENVIRONMENT": "production" },
  "kv_namespaces": [{ "binding": "KV", "id": "<ID>" }],
  "r2_buckets": [{ "binding": "BUCKET", "bucket_name": "my-bucket" }],
  "d1_databases": [{ "binding": "DB", "database_name": "my-db", "database_id": "<ID>" }],
  "ai": { "binding": "AI" },
  "vectorize": [{ "binding": "INDEX", "index_name": "my-index" }],
  "hyperdrive": [{ "binding": "HD", "id": "<ID>" }],
  "durable_objects": { "bindings": [{ "name": "COUNTER", "class_name": "Counter" }] },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["Counter"] }],
  "workflows": [{ "binding": "WF", "name": "my-workflow", "class_name": "MyWorkflow" }],
  "queues": {
    "producers": [{ "binding": "Q", "queue": "my-queue" }],
    "consumers": [{ "queue": "my-queue", "max_batch_size": 10 }]
  },
  "triggers": { "crons": ["0 * * * *"] },
  "observability": { "enabled": true, "head_sampling_rate": 1 },
  "env": {
    "staging": { "name": "my-worker-staging", "vars": { "ENVIRONMENT": "staging" } }
  }
}
```

## Local Dev
```bash
wrangler dev                          # Local mode (default)
wrangler dev --env staging            # Specific environment
wrangler dev --port 8787              # Custom port
wrangler dev --live-reload            # HTML live reload
wrangler dev --test-scheduled         # Test cron handlers (visit /__scheduled)
```

Remote bindings for local dev:
```jsonc
{ "r2_buckets": [{ "binding": "BUCKET", "bucket_name": "my-bucket", "remote": true }] }
```

## Deployment
```bash
wrangler deploy                       # Production
wrangler deploy --env staging         # Staging
wrangler deploy --dry-run             # Validate without deploy
wrangler deploy --keep-vars           # Keep dashboard variables
wrangler deploy --minify              # Minify code
```

## Secrets
```bash
wrangler secret put API_KEY           # Interactive (preferred)
wrangler secret put KEY < key.pem     # From file
wrangler secret list                  # List
wrangler secret delete API_KEY        # Delete
wrangler secret bulk secrets.json     # Bulk from JSON
```

## KV
```bash
wrangler kv namespace create MY_KV
wrangler kv key put --namespace-id <ID> "key" "value"
wrangler kv key get --namespace-id <ID> "key"
wrangler kv bulk put --namespace-id <ID> data.json
```

## R2
```bash
wrangler r2 bucket create my-bucket
wrangler r2 object put my-bucket/path --file ./local-file.txt
wrangler r2 object get my-bucket/path
```

## D1
```bash
wrangler d1 create my-database
wrangler d1 execute my-database --remote --command "SELECT * FROM users"
wrangler d1 execute my-database --remote --file ./schema.sql
wrangler d1 migrations create my-database create_users_table
wrangler d1 migrations apply my-database --remote
wrangler d1 export my-database --remote --output backup.sql
```

## Vectorize
```bash
wrangler vectorize create my-index --dimensions 768 --metric cosine
wrangler vectorize create my-index --preset @cf/baai/bge-base-en-v1.5
wrangler vectorize query my-index --vector "[0.1, ...]" --top-k 10
```

## Hyperdrive
```bash
wrangler hyperdrive create my-hd --origin-host db.example.com --origin-port 5432 --database mydb --origin-user user --origin-password "$PASS"
```

## Workers AI
```bash
wrangler ai models
```
Config: `{ "ai": { "binding": "AI" } }` (always remote, charges apply)

## Queues
```bash
wrangler queues create my-queue
wrangler queues consumer add my-queue my-worker
```

## Workflows
```bash
wrangler workflows list
wrangler workflows trigger my-workflow --params '{"key":"value"}'
wrangler workflows instances list my-workflow
```

## Containers
```bash
wrangler containers build -t my-app:latest . --push
wrangler containers list
wrangler containers registries list
```

## Pipelines
```bash
wrangler pipelines create my-pipeline --r2 my-bucket
wrangler pipelines show my-pipeline
```

## Secrets Store
```bash
wrangler secrets-store store create my-store
wrangler secrets-store secret put <STORE_ID> my-secret
wrangler secrets-store secret get <STORE_ID> my-secret
```

## Pages
```bash
wrangler pages project create my-site
wrangler pages deploy ./dist --branch main
```

## Observability
```bash
wrangler tail                          # Stream logs
wrangler tail --status error           # Filter by status
wrangler tail --search "error"         # Filter by term
```

## Testing (Vitest)
```bash
npm install -D @cloudflare/vitest-pool-workers vitest
```
```typescript
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
export default defineWorkersConfig({
  test: { poolOptions: { workers: { wrangler: { configPath: "./wrangler.jsonc" } } } }
});
```

## Troubleshooting
| Issue | Solution |
|-------|----------|
| `command not found: wrangler` | `npm install -D wrangler` |
| Auth errors | `wrangler login` |
| Startup time exceeded | `wrangler check startup` |
| Type errors after config | `wrangler types` |
| Binding undefined | Check name matches config exactly |
