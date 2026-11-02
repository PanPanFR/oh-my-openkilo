---
name: "compose-state-management"
description: "Manage Compose state, remember APIs, side effects, snapshots, and screen-level state, events, reducers, and ViewModel holders without leaks or loops."
metadata:
  version: "0.1.0"
  category: "product"
  tags: ["android", "compose", "state", "side-effects", "viewmodel", "ui-state", "reducers"]
  triggers:
    include: ["compose side effect problem", "remember vs derivedstateof", "collect flow in compose screen", "launchedeffect issue android", "compose state hoisting", "rememberupdatedstate compose", "snapshotflow compose issue", "android ui state reducer", "state management in compose or xml android", "one-off events in android screen", "loading empty error state android", "viewmodel state container"]
    exclude: ["retrofit serialization", "play store release", "binary alignment", "xml recycler issue", "apk alignment", "release automation"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Compose State Management

## When To Use
- Use this skill when the request is about: compose side effect problem, remember vs derivedstateof, android ui state reducer, state management in compose or xml android.
- Primary outcome: Manage Compose state, remember APIs, side effects, snapshots, lifecycle-aware collection, and screen-level state, events, reducers, and ViewModel holders without leaks or loops.
- Reach for this skill when the problem lives inside a composable or Compose runtime primitive, or when designing screen state holders and event channels. Hand off pure data-layer or build work to `kotlin-data-layer` or `android-build-release`.
- Handoff skills when the scope expands:
- `kotlin-data-layer`
- `android-compose`

## Workflow
1. Classify the issue: local remembered state, saved state, derived state, lifecycle-aware collection, one-off side effects, or screen-level state/event design.
2. Pick the narrowest Compose primitive: `remember`, `rememberSaveable`, `derivedStateOf`, `produceState`, `collectAsStateWithLifecycle`, `LaunchedEffect`, `DisposableEffect`, `SideEffect`, or `snapshotFlow`.
3. Keep durable UI state separate from transient events such as snackbars, navigation, and analytics.
4. Implement screen state with explicit loading, success, empty, and error handling; separate persistent state from one-off events using StateFlow and SharedFlow.
5. Stabilize effect keys and callback references so recomposition does not relaunch work or capture stale lambdas.
6. Validate accessibility, configuration changes, and back-stack behavior in the showcase apps.
7. Hand off broader data or release concerns only after the state surface is stable.

## Guardrails
- Prefer lifecycle-aware collection such as `collectAsStateWithLifecycle` for UI-facing flows.
- Use `rememberUpdatedState` when an effect should see the latest lambda or value without restarting.
- Keep one-shot effects out of immutable screen state when they are really events.
- Do not launch coroutines or trigger navigation directly from the composable body outside the appropriate effect APIs.
- Treat loading, empty, error, offline, and permission-denied states as first-class UI states.
- Do not hide navigation or permission side effects inside reusable UI components.
- Prefer lifecycle-aware APIs over manual callback chains.

## Anti-Patterns
- Using `LaunchedEffect(Unit)` or unstable keys when the effect should restart on real dependency changes.
- Collecting flows in multiple places and wondering why events duplicate.
- Storing transient events as persistent booleans in screen state and then manually resetting them.
- Using `derivedStateOf` or `snapshotFlow` when plain state reads would be simpler and cheaper.
- Assuming the happy path is enough for product flows.
- Triggering navigation directly from repositories or network layers.
- Shipping flows without recovery UI for denied permissions or broken state.

## Remediation Examples
### Collect flows lifecycle-aware in Compose
```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { render(it) }
    }
}
```

### Separate persistent state from one-off events
```kotlin
private val _uiState = MutableStateFlow(TaskBoardState())
val uiState: StateFlow<TaskBoardState> = _uiState.asStateFlow()

private val _events = MutableSharedFlow<TaskBoardEvent>(replay = 0)
val events: SharedFlow<TaskBoardEvent> = _events
```

## Examples
### Happy path
- Scenario: Collect task state and snackbar events in Compose without duplicate launches; drive the task board from a single immutable screen state.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Handle recomposition when permission state and sync state change together; represent permission denied and sync failed states explicitly in the XML fixture.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:assembleDebug`

### Failure recovery
- Scenario: Disambiguate state/effects work from generic Compose layout, data-layer, or navigation prompts.
- Command: `python3 scripts/eval_triggers.py --skill compose-state-management`

## Done Checklist
- The chosen Compose primitive matches the actual runtime problem.
- Effects have stable keys and do not duplicate on recomposition.
- State and events are separated clearly; screen state covers loading, empty, error, offline.
- Collection is lifecycle-aware and cancellation-safe.
- Broader app-state architecture work is handed off instead of mixed into the composable fix.
- Relevant example commands and benchmark prompts have been exercised.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/develop/ui/compose/state](https://developer.android.com/develop/ui/compose/state)
- [https://developer.android.com/develop/ui/compose/side-effects](https://developer.android.com/develop/ui/compose/side-effects)
- [https://developer.android.com/reference/kotlin/androidx/lifecycle/compose/package-summary](https://developer.android.com/reference/kotlin/androidx/lifecycle/compose/package-summary)
- [https://developer.android.com/topic/architecture/ui-layer/state-production](https://developer.android.com/topic/architecture/ui-layer/state-production)
- [https://developer.android.com/topic/architecture/ui-layer/events](https://developer.android.com/topic/architecture/ui-layer/events)
- [https://developer.android.com/topic/libraries/architecture/viewmodel](https://developer.android.com/topic/libraries/architecture/viewmodel)
