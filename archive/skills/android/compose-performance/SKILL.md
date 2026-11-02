---
name: compose-performance
description: Expert guidance on diagnosing and fixing Jetpack Compose performance problems using recomposition tracing, stability/immutability annotations, and Compose compiler metrics. Use this for jank, slow lists, or recomposition complaints.
---

# Compose Performance — Stability, Recomposition, Metrics

## Reference map

Deep dives live in `references/`: `state-and-stability.md`, `layouts.md`, `lazy-layouts.md`, `animation.md`, `effects-and-threading.md`, `graphics-performance.md`, plus `references/android/` framework docs. Load the file matching the reported symptom.

## Instructions

Compose is fast **when it can skip**. Most performance complaints are stability problems in disguise. Measure first; fix the root cause.

### 1. Generate Compose Compiler Reports

Add to each Compose module's `build.gradle.kts`:

```kotlin
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions.freeCompilerArgs.addAll(
        "-P", "plugin:androidx.compose.compiler.plugins.kotlin:reportsDestination=${layout.buildDirectory.get()}/compose-reports",
        "-P", "plugin:androidx.compose.compiler.plugins.kotlin:metricsDestination=${layout.buildDirectory.get()}/compose-metrics",
    )
}
```

Build and inspect `build/compose-reports/*-classes.txt`. You want:
- Every data class used as Compose state: `stable`.
- Every screen composable: `skippable` and `restartable`.
- Zero `unstable parameter:` lines in hot paths.

### 2. Common Instability Causes and Fixes

| Cause | Fix |
|---|---|
| `List<T>` parameter | Use `ImmutableList<T>` from `kotlinx.collections.immutable`. |
| `LocalDateTime`, `LocalDate` | Annotate a wrapper `@Immutable data class` or map to `Long`. |
| Types from third-party libs | Wrap in your own `@Immutable` class. |
| `var` field in a `data class` used as state | Change to `val`; create a new instance to update. |
| Function-type parameter (lambda) capturing unstable value | Hoist lambda into `remember(key) { { ... } }` or accept a stable action/state. |

### 3. Recomposition Counts in Layout Inspector

Android Studio → **Layout Inspector** → enable "Show recomposition counts" on a running app. Scroll your screen; any composable with growing counts during a static state is re-running too often. Pair with compiler reports to pinpoint the unstable parameter.

### 4. Common Fixes Cookbook

**a) Stable lambda**

```kotlin
// BAD — new lambda identity on every recomposition, may defeat skipping downstream
ArticleList(items, onClick = { id -> vm.onAction(Open(id)) })

// GOOD — stable reference
val onClick: (String) -> Unit = remember(vm) { { id -> vm.onAction(Open(id)) } }
ArticleList(items, onClick = onClick)
```

Do this only where the report shows `restartable skippable skipped: NO`. Premature lambda hoisting bloats code for no gain.

**b) Immutable lists**

```kotlin
data class ArticlesUiState(val items: ImmutableList<Article> = persistentListOf())
```

**c) `derivedStateOf` to avoid reading too much state**

```kotlin
val canSubmit by remember { derivedStateOf { form.name.isNotBlank() && form.agree } }
```

Without `derivedStateOf`, every `form` change recomposes the submit button; with it, only when the boolean actually changes.

**d) Keyed `LazyColumn` items**

```kotlin
items(items = list, key = { it.id }, contentType = { "article" }) { Article(it) }
```

Missing `key` causes "reset" recomposition on list changes — every visible item rebuilds.

**e) Defer reads with lambdas**

```kotlin
// BAD — text recomposes whole parent
Text("Count: ${state.count}")

// GOOD — only Text recomposes
Text(text = { "Count: ${state.count}" }.toString()) // when accepting the value
// Or, for graphicsLayer, pass a lambda that reads state inside the block:
Modifier.graphicsLayer { alpha = state.alpha }
```

Prefer `Modifier.graphicsLayer { ... }` (block form) over `Modifier.alpha(state.alpha)` for animated values — the state read moves to draw phase, skipping composition and layout.

### 5. Baseline Profiles

Generate a Baseline Profile to speed up critical-path composables AOT:

```kotlin
// baseline-profile module
@OptIn(ExperimentalBaselineProfilesApi::class)
class BaselineProfileGenerator {
    @get:Rule val rule = BaselineProfileRule()

    @Test
    fun startup() = rule.collect(packageName = "com.example.app") {
        pressHome(); startActivityAndWait()
        device.findObject(By.res("feed_list")).fling(Direction.DOWN)
    }
}
```

Run with the Baseline Profile Gradle Plugin. Ship the generated `baseline-prof.txt` with the app.

### 6. Rules of Thumb

- 60/120 Hz budget: each frame = 16 ms / 8 ms. Keep composition + layout + draw under that for visible screens.
- Prefer `@Composable` extraction **only** when it creates a stable boundary. Tiny helpers that take unstable inputs aren't helping.
- Do not call `remember { expensive() }` without a key — if inputs change the value is wrong. Use `remember(inputs) { }`.
- `SnapshotStateList` (from `mutableStateListOf`) is great for local UI state but is **unstable as a function parameter** unless declared explicitly; prefer `ImmutableList` for cross-boundary.

### 7. Macrobenchmark

```kotlin
@get:Rule val benchmarkRule = MacrobenchmarkRule()

@Test
fun scrollFeed() = benchmarkRule.measureRepeated(
    packageName = "com.example.app",
    metrics = listOf(FrameTimingMetric()),
    iterations = 10,
    startupMode = StartupMode.WARM,
    compilationMode = CompilationMode.Partial(BaselineProfileMode.Require),
) {
    startActivityAndWait()
    device.findObject(By.res("feed_list")).fling(Direction.DOWN)
}
```

Run in CI for every release and treat `frameDurationCpuMs` P95 > 16 ms as a regression.

## Checklist
- [ ] Compose compiler reports generated for every Compose module.
- [ ] No screen-level composable has `restartable skippable skipped: NO` in the report.
- [ ] Lists use `ImmutableList` / `persistentListOf()`.
- [ ] `LazyColumn`/`LazyRow` items all pass `key`.
- [ ] Animated values use `Modifier.graphicsLayer { }` block form.
- [ ] A Baseline Profile is generated and bundled with the release build.
- [ ] Macrobenchmark frame-timing tests run in CI.
