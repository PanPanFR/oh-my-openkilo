---
name: kotlin-coroutines
description: Expert guidance on writing correct Kotlin coroutines — structured concurrency, scopes, dispatchers, cancellation, supervisorScope, and exception handling. Use this whenever you add suspending code.
---

# Kotlin Coroutines — Structured Concurrency

## Instructions

Every coroutine must have a parent scope. That scope defines cancellation and error propagation. Never launch into `GlobalScope`.

### 1. Scopes You Actually Use

| Scope | When |
|---|---|
| `viewModelScope` | Work owned by a ViewModel. Cancels on `onCleared()`. |
| `lifecycleScope` | Activity/Fragment lifecycle-bound work. Prefer `repeatOnLifecycle(STARTED) { }` around it. |
| Injected `@ApplicationScope CoroutineScope` | App-wide work (sync, WorkManager helpers). Built on `SupervisorJob() + Dispatchers.Default`. |
| `coroutineScope { }` | Create a temporary scope inside a suspend function. Failure of any child cancels siblings. |
| `supervisorScope { }` | Same, but a child failure doesn't cancel siblings. Use for independent parallel fan-out. |

```kotlin
@Module @InstallIn(SingletonComponent::class)
object CoroutineModule {
    @Provides @Singleton @ApplicationScope
    fun provideAppScope(): CoroutineScope =
        CoroutineScope(SupervisorJob() + Dispatchers.Default + CoroutineName("appScope"))
}
```

### 2. Dispatchers

| Dispatcher | Use for |
|---|---|
| `Dispatchers.Main.immediate` | Touching UI, Compose state, `LiveData`. |
| `Dispatchers.Default` | CPU-bound work (parsing, transforms, sorting). |
| `Dispatchers.IO` | Disk, network, blocking JDBC calls. |
| `Dispatchers.Unconfined` | Only in tests and specific rare stream bridges. |

Inject dispatchers so tests can swap them:

```kotlin
class Parser @Inject constructor(@DefaultDispatcher private val cpu: CoroutineDispatcher) {
    suspend fun parse(raw: String): Parsed = withContext(cpu) { /* ... */ }
}
```

### 3. Structured Concurrency Patterns

```kotlin
suspend fun loadDashboard(): Dashboard = coroutineScope {
    val user   = async { api.getUser() }
    val orders = async { api.getOrders() }
    val promos = async { api.getPromos() }
    Dashboard(user.await(), orders.await(), promos.await())
}
```

If any of the three fails, the others are cancelled and the exception propagates to the caller. That's correct behavior for a single logical operation.

If you want "fetch all, accept partial failure":

```kotlin
suspend fun fanOut(): List<Result<Feed>> = supervisorScope {
    sourceIds.map { id ->
        async { runCatching { fetchFeed(id) } }
    }.awaitAll()
}
```

### 4. Cancellation

Coroutines cancel cooperatively. Suspending functions from `kotlinx-coroutines` are cancellation-aware; tight loops are not. Use `ensureActive()` or `yield()`:

```kotlin
suspend fun hashAll(files: List<File>): List<String> = withContext(Dispatchers.Default) {
    files.map { f ->
        ensureActive()
        sha256(f)
    }
}
```

Cleanup on cancel with `try { } finally { }`. `finally` runs even on cancellation. For truly non-cancellable cleanup: `withContext(NonCancellable) { closeStream() }`.

### 5. Exceptions

Rules:
- `launch` propagates exceptions to the scope. Install a `CoroutineExceptionHandler` on the scope for app-wide logging.
- `async` stores the exception and rethrows from `await()`. Not awaiting eats the exception.
- Inside `coroutineScope { }`, a child failure cancels siblings then rethrows to the caller.
- Inside `supervisorScope { }`, a child failure stays with that child.

```kotlin
val handler = CoroutineExceptionHandler { _, t -> Log.e("app", "unhandled", t); crashlytics.record(t) }
val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default + handler)
```

### 6. Switching Threads

```kotlin
suspend fun save(bmp: Bitmap, file: File) = withContext(Dispatchers.IO) {
    file.outputStream().use { bmp.compress(JPEG, 90, it) }
}
```

Always wrap blocking JVM APIs with `withContext(Dispatchers.IO)`. Room and Retrofit already do this internally; you do not need to wrap `suspend fun getUser()` on a Room DAO.

### 7. Timeouts and Retries

```kotlin
val user = withTimeoutOrNull(5.seconds) { api.getUser() }
    ?: return Result.failure(TimeoutError)

suspend fun <T> retrying(times: Int = 3, delay: Long = 200, block: suspend () -> T): T {
    repeat(times - 1) {
        runCatching { return block() }
            .onFailure { if (it is CancellationException) throw it }
        kotlinx.coroutines.delay(delay * (1L shl it))
    }
    return block()
}
```

Always re-throw `CancellationException`. Catching it breaks structured concurrency.

### 8. Testing

```kotlin
@OptIn(ExperimentalCoroutinesApi::class)
class DashboardTest {
    private val dispatcher = StandardTestDispatcher()

    @BeforeEach fun setup() = Dispatchers.setMain(dispatcher)
    @AfterEach  fun tearDown() = Dispatchers.resetMain()

    @Test fun `loads in parallel`() = runTest(dispatcher) {
        val vm = DashboardViewModel(FakeApi())
        vm.load()
        advanceUntilIdle()
        assertThat(vm.state.value).isInstanceOf(DashboardUiState.Loaded::class)
    }
}
```

`advanceUntilIdle()` runs all pending coroutines; `runCurrent()` runs only what's ready now. Use `StandardTestDispatcher` over `UnconfinedTestDispatcher` unless you specifically need eager execution.

## Checklist
- [ ] No `GlobalScope` anywhere in production code.
- [ ] `viewModelScope` / `lifecycleScope` / injected `@ApplicationScope` cover every launch site.
- [ ] Dispatchers are injected, not referenced via `Dispatchers.X` in business code.
- [ ] `async { }` results are always `await`ed; `launch { }` covers errors with a handler or `runCatching`.
- [ ] Long loops call `ensureActive()` for cooperative cancellation.
- [ ] Timeouts use `withTimeoutOrNull` and never swallow `CancellationException`.
- [ ] Tests run on `runTest` with a `TestDispatcher` installed via `Dispatchers.setMain`.
