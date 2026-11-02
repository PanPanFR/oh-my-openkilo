---
name: "android-compose"
description: "Build Android UI with Jetpack Compose: foundations, layouts, theming, images, media sharing, accessibility, performance, View-system interoperability, idiomatic composable patterns, stable recomposition behavior, and reusable Compose patterns."
metadata:
  version: "0.1.0"
  category: "ui"
  tags: ["android", "compose", "ui", "foundations", "material3", "coil", "accessibility", "performance", "interop", "xml"]
  triggers:
    include: ["jetpack compose screen", "compose layout in android", "modifier cleanup compose", "compose in fragment", "androidview in compose", "incremental compose migration", "material3 theme android", "design system tokens compose", "coil compose image loading", "asyncimage android compose", "android file sharing", "photo picker android app", "fileprovider setup android", "create screen from scratch", "redesign existing screen visually", "fix clipped cropped truncated ui", "compose accessibility review", "android semantics issue compose", "focus order in compose", "compose performance issue", "recomposition too much android", "slow lazycolumn compose", "idiomatic compose ui", "stable parameters compose", "reusable composable pattern"]
    exclude: ["room migration only", "retrofit contract only", "hilt injection only", "unit test only", "gradle plugin upgrade only", "pure retrofit issue", "play console release", "security crypto only", "fragment back stack only", "datastore migration only"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Android Compose

## When To Use
- Use this skill when the request is about: jetpack compose screen, compose layout in android, compose in fragment, material3 theme android, coil compose image loading, create screen from scratch, compose accessibility review, compose performance issue.
- Primary outcome: Build Android UI with Jetpack Compose — foundations, layouts, modifiers, theming, Material 3, images, media/file sharing, accessibility, performance, and Compose-View interoperability.
- Use this skill when the work is UI-first: layout structure, theming, image loading, file sharing, accessibility semantics, recomposition performance, or bridging Compose with the View system. Hand off pure state-holder/reducer design to `compose-state-management`, pure data-layer work to `kotlin-data-layer`, and UI test instrumentation to `android-testing`.
- Handoff skills when the scope expands:
- `compose-state-management`
- `kotlin-data-layer`
- `android-testing`
- `android-viewsystem-foundations`

## Workflow
1. Identify whether the target surface is Compose, View system, or a mixed interoperability screen.
2. Select the lowest-friction UI pattern that satisfies responsiveness, accessibility, and performance needs.
3. Build the UI around stable state, explicit side effects, and reusable design tokens.
4. For images: prefer `AsyncImage`; drop to `rememberAsyncImagePainter`/`SubcomposeAsyncImage` only when truly needed; constrain sizing, placeholders, error states, and `contentDescription`.
5. For media/sharing: prefer Photo Picker, SAF, or chooser APIs; share `content://` URIs with temporary grants, never raw `file://` paths.
6. For theming: apply Material 3 color/type/spacing tokens; keep XML and Compose surfaces visually aligned during mixed migration.
7. For interop: use `AndroidView`/`ComposeView` with an explicit ownership boundary; do not mix ownership without one.
8. Exercise edge cases: long text, font scaling, RTL, narrow devices, keyboards, system bars, cutouts, foldables.
9. Validate with unit, UI, and screenshot-friendly checks before handing off.

## Guardrails
- Optimize for stable state and predictable rendering before adding animation or abstraction.
- Respect accessibility semantics, contrast, focus order, and touch target guidance by default.
- Do not mix Compose and View system ownership without an explicit interoperability boundary.
- Prefer measured performance work over premature micro-optimizations.
- Prefer Photo Picker, SAF, and chooser APIs over broad media/storage permissions.
- Share content with `content://` URIs and temporary grants; treat recipients outside your app as untrusted.

## Anti-Patterns
- Embedding navigation or business logic directly in leaf UI components.
- Using fixed dimensions that break on localization or dynamic text.
- Ignoring semantics and announcing only visual changes.
- Porting XML patterns directly into Compose without adapting the mental model.
- Loading full-size remote assets into tiny list items.
- Sharing `file://` paths or world-readable files instead of `FileProvider` URIs.
- Using fixed-height text containers unless proven safe under long strings and font scaling.

## Remediation Examples
### Stabilize list identity
```kotlin
LazyColumn {
    items(tasks, key = { it.id }) { task ->
        TaskRow(task)
    }
}
```

### Move heavy work out of composition
```kotlin
@Composable
fun TaskBoard(tasks: List<TaskUiModel>) {
    val visibleTasks = remember(tasks) { tasks.sortedBy { it.title } }
    LazyColumn { items(visibleTasks, key = { it.title }) { TaskRow(it) } }
}
```

## Examples
### Happy path
- Scenario: Refine the Compose OrbitTasks board with stable slots, theme tokens, AsyncImage, and semantics labels.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Embed a Compose task summary inside the XML fixture; keep XML and Compose surfaces visually aligned; validate font scaling, contrast, and touch targets.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:assembleDebug`

### Failure recovery
- Scenario: Keep Compose UI requests from drifting into state/effects, data-layer, or performance-only work.
- Command: `python3 scripts/eval_triggers.py --skill android-compose`

## Done Checklist
- The target surface (Compose, View, or interop) is explicit with clear ownership boundaries.
- Layouts, theming, images, media sharing, accessibility, and performance are addressed per request.
- Sizing, placeholders, error states, and accessibility behavior are intentional.
- URI authorities, MIME types, and temporary grants are explicit for sharing.
- Relevant example commands and benchmark prompts have been exercised.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/develop/ui/compose](https://developer.android.com/develop/ui/compose)
- [https://developer.android.com/develop/ui/compose/layouts/basics](https://developer.android.com/develop/ui/compose/layouts/basics)
- [https://developer.android.com/develop/ui/compose/modifiers](https://developer.android.com/develop/ui/compose/modifiers)
- [https://developer.android.com/develop/ui/compose/designsystems/material3](https://developer.android.com/develop/ui/compose/designsystems/material3)
- [https://developer.android.com/develop/ui/compose/migrate/interoperability-apis](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis)
- [https://developer.android.com/develop/ui/compose/migrate/strategy](https://developer.android.com/develop/ui/compose/migrate/strategy)
- [https://coil-kt.github.io/coil/compose/](https://coil-kt.github.io/coil/compose/)
- [https://developer.android.com/develop/ui/compose/graphics/images/loading](https://developer.android.com/develop/ui/compose/graphics/images/loading)
- [https://developer.android.com/training/data-storage/shared/photopicker](https://developer.android.com/training/data-storage/shared/photopicker)
- [https://developer.android.com/training/secure-file-sharing/setup-sharing](https://developer.android.com/training/secure-file-sharing/setup-sharing)
- [https://developer.android.com/develop/ui/compose/accessibility](https://developer.android.com/develop/ui/compose/accessibility)
- [https://developer.android.com/develop/ui/compose/performance](https://developer.android.com/develop/ui/compose/performance)
