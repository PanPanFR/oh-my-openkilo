---
name: livedata-to-flow
description: Expert guidance on migrating LiveData to StateFlow / SharedFlow, including lifecycle-aware collection, Transformations replacements, and Java interop. Use this when modernizing a ViewModel or removing the lifecycle-livedata dependency.
---

# Migrating LiveData to Kotlin Flow

## Instructions

Kotlin `Flow` / `StateFlow` / `SharedFlow` is the modern replacement for `LiveData`. It is multiplatform-friendly, composable, and the default for Jetpack Compose. Migrate module-by-module.

### 1. Mapping Table

| LiveData | Flow equivalent |
|---|---|
| `val x = MutableLiveData<T>()` | `private val _x = MutableStateFlow<T>(initial); val x = _x.asStateFlow()` |
| `SingleLiveEvent<T>` / `Event<T>` | `private val _events = Channel<T>(BUFFERED); val events = _events.receiveAsFlow()` |
| `Transformations.map` | `.map { ... }` |
| `Transformations.switchMap` | `.flatMapLatest { ... }` |
| `MediatorLiveData` | `combine(flowA, flowB) { a, b -> ... }` |
| `liveData { emit(...) }` | `flow { emit(...) }` or the `stateIn` pattern below |
| `observe(owner) { }` | `lifecycleScope.launch { repeatOnLifecycle(STARTED) { flow.collect { } } }` or `collectAsStateWithLifecycle()` |

### 2. ViewModel: Before and After

**Before**

```kotlin
class ProfileViewModel(private val repo: UserRepository) : ViewModel() {
    private val _state = MutableLiveData<ProfileUiState>(ProfileUiState.Loading)
    val state: LiveData<ProfileUiState> = _state

    fun load(id: String) {
        viewModelScope.launch {
            _state.value = ProfileUiState.Loading
            _state.value = ProfileUiState.Loaded(repo.get(id))
        }
    }
}
```

**After**

```kotlin
class ProfileViewModel(private val repo: UserRepository) : ViewModel() {
    private val userId = MutableStateFlow<String?>(null)

    val state: StateFlow<ProfileUiState> = userId
        .filterNotNull()
        .flatMapLatest { id -> repo.observeUser(id) }
        .map { user -> ProfileUiState.Loaded(user) as ProfileUiState }
        .catch { emit(ProfileUiState.Error(it.message ?: "Unknown")) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = ProfileUiState.Loading,
        )

    fun load(id: String) { userId.value = id }
}
```

Why `WhileSubscribed(5_000)`? It keeps the upstream active while the UI is on screen and for 5 s after a config change so the ViewModel doesn't re-fetch on a rotation.

### 3. One-Shot Events

LiveData's `SingleLiveEvent`/`Event` pattern exists because `LiveData` replays the last value. Flows solve this with a `Channel`:

```kotlin
private val _nav = Channel<NavEvent>(Channel.BUFFERED)
val nav: Flow<NavEvent> = _nav.receiveAsFlow()

fun openDetails(id: String) = viewModelScope.launch { _nav.send(NavEvent.Details(id)) }
```

The UI collects with `LaunchedEffect(Unit) { vm.nav.collect { ... } }`. Each event is delivered exactly once.

### 4. Collecting in Views / Fragments

```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        launch { vm.state.collect { render(it) } }
        launch { vm.nav.collect { navigate(it) } }
    }
}
```

Never call `flow.collect { }` without `repeatOnLifecycle` from a Fragment — it will keep running while the view is destroyed and crash on UI updates.

### 5. Collecting in Compose

```kotlin
val state by vm.state.collectAsStateWithLifecycle()
LaunchedEffect(Unit) { vm.nav.collect(::navigate) }
```

`collectAsStateWithLifecycle()` lives in `androidx.lifecycle:lifecycle-runtime-compose`. It stops collecting while the Compose tree is not at least STARTED.

### 6. Interop When You Cannot Migrate Everything At Once

- `flow.asLiveData(viewModelScope.coroutineContext)` — exposes a Flow to legacy DataBinding / Java callers.
- `liveData.asFlow()` — temporary read of a LiveData from coroutine code.

Treat these as **bridges with a TODO**. Every bridge should have a migration ticket.

### 7. Testing

```kotlin
@Test
fun `emits Loading then Loaded`() = runTest {
    val vm = ProfileViewModel(fakeRepo)
    vm.state.test {
        assertEquals(ProfileUiState.Loading, awaitItem())
        vm.load("u1")
        assertEquals(ProfileUiState.Loaded(fakeUser), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}
```

Use Turbine's `.test { }` on `StateFlow`s. Replace `InstantTaskExecutorRule` with `MainDispatcherRule` that installs a `TestDispatcher`.

### 8. Migration Order

1. Pick one ViewModel.
2. Replace `_state: MutableLiveData<T>` with `MutableStateFlow<T>`.
3. Update collectors (Fragment, Activity, Compose).
4. Replace `Transformations.*` and `MediatorLiveData` with Flow operators.
5. Delete `lifecycle-livedata-ktx` from the module when no `LiveData` remains.

## Checklist
- [ ] `MutableLiveData` is replaced by `MutableStateFlow`; public API is `StateFlow`.
- [ ] One-shot events use `Channel` + `receiveAsFlow()`, not a `StateFlow`.
- [ ] Fragment collection wraps in `repeatOnLifecycle(STARTED)`.
- [ ] Compose collection uses `collectAsStateWithLifecycle()`.
- [ ] `Transformations.switchMap` is replaced by `flatMapLatest`.
- [ ] `stateIn(scope, WhileSubscribed(5000), initial)` is used for hot state flows.
- [ ] Tests run on `runTest` with a `TestDispatcher`, not `InstantTaskExecutorRule`.
