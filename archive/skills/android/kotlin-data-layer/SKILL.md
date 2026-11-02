---
name: "kotlin-data-layer"
description: "Build the Android data layer with Room, DataStore, Retrofit/OkHttp, serialization, offline-first sync, and coroutines/Flow."
metadata:
  version: "0.1.0"
  category: "data-platform"
  tags: ["android", "room", "datastore", "retrofit", "okhttp", "flow", "coroutines", "offline-first", "serialization"]
  triggers:
    include: ["room database android", "dao query migration android", "room schema export", "transaction issue room", "android datastore setup", "replace sharedpreferences android", "typed local preferences android", "retrofit android setup", "okhttp interceptor android", "api error mapping android", "network client cleanup android", "offline sync android", "serialization model mapping android", "conflict resolution android cache", "sync queue android app", "android flow collection", "fix coroutine scope in android", "structured concurrency in viewmodel", "flow retry caching android", "dispatcher cleanup in android"]
    exclude: ["deeplink back stack", "compose semantics", "play rollout", "permission prompt only", "viewbinding only", "release tagging only", "rxjava migration", "coroutines migration android"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Kotlin Data Layer

## When To Use
- Use this skill when the request is about: room database android, android datastore setup, retrofit android setup, offline sync android, android flow collection.
- Primary outcome: Build the Android data layer with Room entities/DAOs/migrations, DataStore preferences, Retrofit/OkHttp networking stacks, serialization and offline-first sync, and coroutines/Flow async pipelines.
- Reach for this skill when the hard part is schema design, DAO queries, typed persistence, API contracts, interceptors, cache/conflict handling, or structured concurrency. Hand off pure UI or build work to `android-compose` or `android-build-release`.
- Handoff skills when the scope expands:
- `kotlin-android-architecture`
- `compose-state-management`

## Workflow
1. Confirm the data source, persistence boundary, sync model, and device capability involved.
2. Model contracts explicitly before wiring network, storage, media, or background APIs.
3. For Room: start with entities, keys, indexes, relations; model DAO access patterns and transaction boundaries; plan schema evolution with exported schemas and migrations.
4. For DataStore: use typed models and explicit serializers; plan migration-aware defaults.
5. For Retrofit/OkHttp: define API contracts, add interceptors for auth/retries, map errors, keep clients idempotent and cancellation-aware.
6. For serialization/sync: map cache and wire models through a mapping layer; handle conflict resolution and offline-first flows.
7. For coroutines/Flow: inject dispatchers, use structured concurrency, collect flows lifecycle-aware, preserve cancellation.
8. Validate offline, retry, and process-death behavior; test migrations against real old schemas.
9. Hand off security, performance, or release risk to the linked supporting skills when needed.

## Guardrails
- Prefer typed models and explicit serializers over ad-hoc maps or bundles.
- Keep entities persistence-focused; map to domain/UI models instead of leaking table shape upward.
- Export Room schemas and treat them as part of the contract.
- Use explicit transactions for multi-step writes that must remain consistent.
- Do not leak storage, media, or networking details into presentation code.
- Keep background work idempotent and cancellation-aware; never block the main thread with disk or network calls.
- Treat retryable sync failures as non-terminal; treat user data durability, privacy, and migration paths as part of the implementation.

## Anti-Patterns
- Treating Room entities as the app's domain model everywhere.
- Editing schemas without exporting or validating migration paths.
- Writing broad `SELECT *` queries when the screen only needs a narrow projection.
- Blocking the main thread with disk or network calls.
- Mixing cache models and wire models without a mapping layer.
- Treating retryable sync failures as terminal user-facing errors.
- Hard-coding dispatchers instead of injecting them.
- Collecting flows in multiple places and wondering why events duplicate.

## Remediation Examples
### Inject dispatchers instead of hard-coding them
```kotlin
class TaskRepository(
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
) {
    suspend fun refresh(): List<TaskUiModel> = withContext(ioDispatcher) { loadTasks() }
}
```

### Keep one immutable UI state surface fed by the data layer
```kotlin
data class TaskBoardState(
    val tasks: List<TaskUiModel> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
)
```

## Examples
### Happy path
- Scenario: Persist task items and reminder flags with schema-aware entities; sync local edits to a remote model with explicit mapping.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Recover from a failed schema change with an explicit migration path; handle stale cache and retry behavior in the XML fixture.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

### Failure recovery
- Scenario: Keep data-layer requests separate from pure UI, networking-only, or Room-only prompts.
- Command: `python3 scripts/eval_triggers.py --skill kotlin-data-layer`

## Done Checklist
- Entities, DAOs, transactions, DataStore models, Retrofit contracts, and Flow pipelines match the real persistence/sync contract.
- Schema export and migration strategy are explicit.
- Query, migration, retry, and conflict-handling tests cover the risky paths.
- Non-data-layer concerns are handed off instead of mixed into the data-layer task.
- Relevant example commands and benchmark prompts have been exercised.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/training/data-storage/room](https://developer.android.com/training/data-storage/room)
- [https://developer.android.com/training/data-storage/room/migrating-db-versions](https://developer.android.com/training/data-storage/room/migrating-db-versions)
- [https://developer.android.com/training/data-storage/room/accessing-data](https://developer.android.com/training/data-storage/room/accessing-data)
- [https://developer.android.com/topic/libraries/architecture/datastore](https://developer.android.com/topic/libraries/architecture/datastore)
- [https://developer.android.com/develop/connectivity/network-ops/connecting](https://developer.android.com/develop/connectivity/network-ops/connecting)
- [https://developer.android.com/topic/architecture/data-layer/offline-first](https://developer.android.com/topic/architecture/data-layer/offline-first)
- [https://developer.android.com/topic/architecture/data-layer](https://developer.android.com/topic/architecture/data-layer)
- [https://developer.android.com/kotlin/coroutines](https://developer.android.com/kotlin/coroutines)
- [https://developer.android.com/kotlin/flow](https://developer.android.com/kotlin/flow)
