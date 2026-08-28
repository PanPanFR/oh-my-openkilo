# Durable Objects

## When to Use
| Need | Example |
|------|---------|
| Coordination | Chat rooms, multiplayer, collaborative docs |
| Strong consistency | Inventory, booking, turn-based games |
| Per-entity storage | Multi-tenant SaaS, per-user data |
| Persistent connections | WebSockets, real-time notifications |
| Scheduled per entity | Subscription renewals, game timeouts |

When NOT to use: stateless request handling (plain Workers), maximum global distribution, high fan-out independent requests.

## Core Pattern
```typescript
import { DurableObject } from "cloudflare:workers";

export class MyDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT NOT NULL
        )
      `);
    });
  }

  async addItem(data: string): Promise<number> {
    const result = this.ctx.storage.sql.exec<{ id: number }>(
      "INSERT INTO items (data) VALUES (?) RETURNING id", data
    );
    return result.one().id;
  }
}
```

## Critical Rules
1. **Model around coordination atoms** — one DO per entity, not global
2. **getByName() for deterministic routing** — same input = same DO
3. **SQLite storage** — configure `new_sqlite_classes` in migrations
4. **Initialize in constructor** — blockConcurrencyWhile() for schema only
5. **RPC methods** — not fetch() handler (compat date >= 2024-04-03)
6. **Persist first, cache second** — write storage before memory
7. **One alarm per DO** — setAlarm() replaces existing

## Anti-Patterns
- Single global DO (bottleneck)
- blockConcurrencyWhile() every request (kills throughput)
- Critical state only in memory (lost on eviction)
- await between related writes (breaks atomicity)
- Holding blockConcurrencyWhile across fetch/external I/O

## Stub Creation
```typescript
const stub = env.MY_DO.getByName("room-123");  // Deterministic
const id = env.MY_DO.idFromString(storedId);     // From ID string
const stub = env.MY_DO.newUniqueId();             // New unique
```

## Storage
```typescript
// SQL (synchronous, recommended)
this.ctx.storage.sql.exec("INSERT INTO t (c) VALUES (?)", value);
const rows = this.ctx.storage.sql.exec<Row>("SELECT * FROM t").toArray();

// KV (async)
await this.ctx.storage.put("key", value);
const val = await this.ctx.storage.get<Type>("key");
```

## Alarms
```typescript
await this.ctx.storage.setAlarm(Date.now() + 60_000);
async alarm() { /* process, optionally reschedule */ }
await this.ctx.storage.deleteAlarm();
```
