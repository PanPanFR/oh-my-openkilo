---
name: cloudflare
description: Unified Cloudflare platform skill - Workers, Durable Objects, Wrangler CLI, KV, D1, R2, AI, Vectorize, Queues, Workflows, Containers, Pages, security (WAF/DDoS/Turnstile), networking, IaC. Use for any Cloudflare task.
---

# Cloudflare Platform Skill (Unified)

**Retrieval-first** — fetch latest docs before citing numbers, APIs, config. When reference and docs disagree, **trust the docs**.

## Retrieval Sources

| Source | URL | Use for |
|--------|-----|---------|
| CF Docs | https://developers.cloudflare.com/ | Limits, pricing, API reference |
| Workers types | `npm pack @cloudflare/workers-types` | Type signatures, binding shapes |
| Wrangler schema | `node_modules/wrangler/config-schema.json` | Config fields, binding shapes |
| Changelog | https://developers.cloudflare.com/changelog/ | Recent changes |
| Best Practices | https://developers.cloudflare.com/workers/best-practices/workers-best-practices/ | Canonical rules, anti-patterns |
| DO API | https://developers.cloudflare.com/durable-objects/api/ | DO methods, storage, alarms |

## Reference Map - load BEFORE that task

| Task | Read FIRST |
|------|-----------|
| Any `wrangler` command, config fields, deploy/secrets/KV/R2/D1/Vectorize CLI usage | `references/wrangler-cli.md` |
| Durable Objects code patterns (class setup, stubs, SQL/KV storage, alarms), rules & anti-patterns | `references/durable-objects.md` |

## DECISION TREES

### "I need to run code"
```
├─ Serverless edge functions → Workers
├─ Full-stack with Git deploys → Pages
├─ Stateful coordination/real-time → Durable Objects
├─ Long-running multi-step → Workflows
├─ Run containers → Containers
├─ Multi-tenant (customers deploy) → Workers for Platforms
├─ Scheduled tasks (cron) → Cron Triggers
├─ Lightweight edge logic (modify HTTP) → Snippets
├─ Process execution events (logs) → Tail Workers
└─ Optimize latency to backend → Smart Placement
```

### "I need to store data"
```
├─ Key-value (config, sessions, cache) → KV
├─ Relational SQL → D1 (SQLite) or Hyperdrive (existing PG/MySQL)
├─ Object/file (S3-compatible) → R2
├─ Versioned file trees → Artifacts
├─ Message queue → Queues
├─ Vector embeddings → Vectorize
├─ Per-entity state → DO storage (SQLite)
├─ Secrets → Secrets Store
├─ Streaming ETL to R2 → Pipelines
├─ Managed Iceberg catalog → R2 Data Catalog
├─ Serverless SQL analytics → R2 SQL
└─ Persistent cache → Cache Reserve
```

### "I need AI/ML"
```
├─ Run inference (LLMs, embeddings, images) → Workers AI
├─ Vector database for RAG/search → Vectorize
├─ Build stateful AI agents → Agents SDK
├─ Gateway for any AI provider → AI Gateway
└─ AI-powered search widget → AI Search
```

### "I need security"
```
├─ WAF → WAF
├─ DDoS protection → DDoS
├─ Bot detection → Bot Management
├─ API protection → API Shield
├─ CAPTCHA alternative → Turnstile
└─ Credential leak detection → WAF (managed ruleset)
```

## WORKERS BEST PRACTICES

### Configuration
| Rule | Summary |
|------|---------|
| compatibility_date | Set to today on new; update periodically |
| nodejs_compat | Enable flag — many libs need Node.js built-ins |
| wrangler types | Run after config changes — never hand-write Env |
| Secrets | Use `wrangler secret put`, never hardcode |
| wrangler.jsonc | JSON config preferred; newer features JSON-only |

### Request & Response
| Rule | Summary |
|------|---------|
| Streaming | Stream large/unknown payloads — never `await response.text()` on unbounded |
| waitUntil | Use `ctx.waitUntil()` for post-response work; don't destructure ctx |

### Architecture
| Rule | Summary |
|------|---------|
| Bindings over REST | Use in-process bindings (KV, R2, D1, Queues) not REST API |
| Queues & Workflows | Move async work off critical path |
| Service bindings | Worker-to-Worker via service bindings, not public HTTP |
| Hyperdrive | Always for external PG/MySQL connections |

### Security
| Rule | Summary |
|------|---------|
| Web Crypto | `crypto.randomUUID()` / `crypto.getRandomValues()` — never Math.random() |
| No passThroughOnException | Explicit try/catch with structured errors |

### Anti-Patterns (NEVER)
| Anti-pattern | Why |
|-------------|-----|
| `await response.text()` unbounded | Memory exhaustion (128MB limit) |
| Hardcoded secrets | Credential leak |
| `Math.random()` for tokens | Not cryptographically secure |
| Bare `fetch()` no await/waitUntil | Floating promise |
| Module-level mutable request state | Cross-request data leaks |
| REST API from Worker | Unnecessary network hop, latency |
| `ctx.passThroughOnException()` | Hides bugs |
| Hand-written Env | Drifts from wrangler config |
| Destructuring `ctx` | Loses this binding |
| `any` on Env/params | Defeats type safety |
| `as unknown as T` double-cast | Hides type incompatibilities |
| `implements` on platform classes | Use `extends` DurableObject/WorkerEntrypoint/Workflow |
| `env.X` inside platform class | Use `this.env.X` |

## PRODUCT INDEX

- **Compute & Runtime:** Workers, Pages, Durable Objects, Workflows, Containers, Workers for Platforms, Cron Triggers, Tail Workers, Snippets, Smart Placement
- **Storage & Data:** KV, D1, R2, Artifacts, Queues, Hyperdrive, DO Storage, Secrets Store, Pipelines, R2 Data Catalog, R2 SQL
- **AI & ML:** Workers AI, Vectorize, Agents SDK, AI Gateway, AI Search
- **Networking:** Tunnel, Spectrum, TURN, Network Interconnect, Argo Smart Routing, Workers VPC
- **Security:** WAF, DDoS, Bot Management, API Shield, Turnstile
- **Media:** Images, Stream, Browser Rendering, Zaraz
- **IaC:** Pulumi, Terraform, API
- **Other:** Email Routing, Email Workers, Static Assets, Bindings, Cache Reserve, Flagship (feature flags)
