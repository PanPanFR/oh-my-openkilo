---
name: kotlin-flow
description: Expert guidance on Kotlin Flow — cold vs hot flows, StateFlow / SharedFlow, common operators, combining, back-pressure, and testing with Turbine. Use this for any reactive data stream work.
---

# Kotlin Flow — Cold, Hot, and Everything In Between

## Instructions

### 1. Cold vs Hot

- **Cold** (`Flow<T>`): each collector restarts the upstream. Built with `flow { emit(...) }`, `flowOf`, `asFlow()`, Retrofit's `Flow<T>` responses.
- **Hot** (`StateFlow<T>`, `SharedFlow<T>`): one producer, many collectors, emissions exist independently of collection.

Rule of thumb: use **cold flows** for queries (Room, network) and **hot flows** for shared mutable state (UI state, app events).

### 2. `StateFlow` — Single-Value State

```kotlin
private val _state = MutableStateFlow(UiState.Empty)
val state: StateFlow<UiState> = _state.asStateFlow()

fun onRefresh() {
    _state.update { it.copy(isLoading = true) }
}
```

Properties:
- Conflated: only the latest value is kept.
- Always has a value (`initialValue` required).
- `.value` is safe to read synchronously.
- Equal values are not re-emitted (`equals` check).

### 3. `SharedFlow` — Multi-Value Events

```kotlin
private val _events = MutableSharedFlow<AppEvent>(
    replay = 0,
    extraBufferCapacity = 16,
    onBufferOverflow = BufferOverflow.DROP_OLDEST,
)
val events: SharedFlow<AppEvent> = _events.asSharedFlow()

fun notify(e: AppEvent) { _events.tryEmit(e) }
```

Choose `SharedFlow` for events that should be delivered to all current subscribers. Prefer `Channel` + `receiveAsFlow()` when events should be delivered **exactly once** to **exactly one** collector (the UI).

### 4. `stateIn` and `shareIn` — Promoting Cold to Hot

```kotlin
val news: StateFlow<News> = repo.observeNews()             // cold Room Flow
    .map(::toUi)
    .catch { emit(News.Error(it.message.orEmpty())) }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = News.Loading,
    )
```

`WhileSubscribed(5_000)` keeps upstream alive for 5 s after the last collector disappears — survives rotation without re-fetch.

### 5. Common Operators

```kotlin
// Transformations
flow.map { it.toUi() }
flow.filter { it.isReady }
flow.distinctUntilChanged()
flow.onEach { log(it) }
flow.onStart { emit(placeholder) }
flow.catch { emit(errorState(it)) }
flow.onCompletion { cleanup() }

// Combining
combine(userFlow, prefsFlow) { u, p -> u.copy(theme = p.theme) }
merge(flowA, flowB)
flowA.zip(flowB) { a, b -> a to b }

// Switching
queryFlow.flatMapLatest { q -> searchRepo.search(q) }     // debounce pattern below
queryFlow.debounce(300).flatMapLatest { searchRepo.search(it) }

// Back-pressure
fastFlow.buffer()
fastFlow.conflate()
fastFlow.sample(100)
```

### 6. Debounced Search Pipeline

```kotlin
val results: StateFlow<SearchUi> = query
    .debounce(300)
    .distinctUntilChanged()
    .filter { it.length >= 2 }
    .flatMapLatest { q ->
        flow {
            emit(SearchUi.Loading)
            emit(runCatching { repo.search(q) }
                .fold({ SearchUi.Loaded(it) }, { SearchUi.Error(it.message.orEmpty()) }))
        }
    }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchUi.Idle)
```

### 7. Collection Rules

- Inside coroutines: `flow.collect { }` (suspending).
- Android UI (Views): `repeatOnLifecycle(STARTED) { flow.collect { } }`.
- Compose: `val state by flow.collectAsStateWithLifecycle()` or `LaunchedEffect(Unit) { flow.collect { ... } }` for events.
- Never collect on `Dispatchers.Main` from a non-main flow; use `.flowOn(Dispatchers.IO)` upstream to move work.

```kotlin
val lines: Flow<String> = flow {
    file.bufferedReader().use { r -> r.lineSequence().forEach { emit(it) } }
}.flowOn(Dispatchers.IO)
```

`flowOn` changes the upstream context only up to the next `flowOn`; the terminal operator runs on the collector's context.

### 8. Testing with Turbine

```kotlin
@Test fun `search debounces and emits loaded`() = runTest {
    vm.results.test {
        assertEquals(SearchUi.Idle, awaitItem())
        vm.onQuery("kot")
        assertEquals(SearchUi.Loading, awaitItem())
        assertEquals(SearchUi.Loaded(listOf("Kotlin")), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}
```

Notes:
- Use `runTest` + `StandardTestDispatcher`. Advance virtual time with `advanceTimeBy(300)` to cross `debounce`.
- `.test { }` fails the test if unconsumed events remain — explicit, loud, and exactly what you want.

### 9. Gotchas

- Calling `.value` on a `StateFlow` inside a Compose body bypasses Compose snapshot observation. Use `collectAsStateWithLifecycle()`.
- `MutableStateFlow.update { }` is thread-safe; `.value = ...` is not atomic with reads.
- Never emit from multiple coroutines into the same `MutableSharedFlow` without understanding buffer policy; drops are silent.
- `Flow<Result<T>>` is an anti-pattern when you can simply emit a sealed `UiState`.

## Checklist
- [ ] UI state is a `StateFlow` built with `stateIn(WhileSubscribed(5000), initial)`.
- [ ] One-shot events use `Channel` + `receiveAsFlow()`; app-wide broadcasts use `SharedFlow`.
- [ ] Heavy upstream work is moved off main with `.flowOn(Dispatchers.IO/Default)`.
- [ ] Search-style pipelines use `debounce` + `distinctUntilChanged` + `flatMapLatest`.
- [ ] Public API exposes `Flow`/`StateFlow`/`SharedFlow`, never `Mutable*`.
- [ ] Tests use Turbine and advance virtual time for timing operators.
