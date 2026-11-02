---
name: compose-animations
description: Expert guidance on Compose animation APIs including animate*AsState, AnimatedVisibility, updateTransition, AnimatedContent, and shared element transitions introduced in Compose 1.7+. Use this for motion design tasks.
---

# Jetpack Compose Animations

## Instructions

Compose ships a layered animation toolkit. Pick the lowest-friction API that fits the motion.

### 1. Value Animations — `animate*AsState`

```kotlin
val elevation by animateDpAsState(
    targetValue = if (pressed) 1.dp else 6.dp,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
    label = "cardElevation",
)

val tint by animateColorAsState(
    targetValue = if (isFav) Color.Red else MaterialTheme.colorScheme.outline,
    label = "favTint",
)
```

Use `animate*AsState` when a **single property** changes between two targets. Always pass `label` — it shows up in the Animation Preview in Android Studio.

### 2. Enter / Exit — `AnimatedVisibility`

```kotlin
AnimatedVisibility(
    visible = state.showBanner,
    enter = fadeIn() + expandVertically(),
    exit = fadeOut() + shrinkVertically(),
) {
    Banner(state.bannerText)
}
```

Combine specs with `+`. Prefer semantic specs (`fadeIn`, `slideInVertically`) over hand-crafted tweens.

### 3. Between-Content — `AnimatedContent`

```kotlin
AnimatedContent(
    targetState = state,
    label = "screen",
    transitionSpec = {
        (slideInHorizontally { it } + fadeIn()) togetherWith
        (slideOutHorizontally { -it } + fadeOut())
    },
) { s ->
    when (s) {
        is ArticlesUiState.Loading -> LoadingIndicator()
        is ArticlesUiState.Error   -> ErrorView(s.message)
        is ArticlesUiState.Loaded  -> ArticleList(s.articles)
    }
}
```

Always use `SizeTransform` (set via `sizeTransform = SizeTransform(clip = false)`) if the target content has a different size.

### 4. Coordinated — `updateTransition`

For multiple properties that should animate from the same state change:

```kotlin
val transition = updateTransition(targetState = expanded, label = "card")
val radius by transition.animateDp(label = "r") { if (it) 24.dp else 8.dp }
val alpha  by transition.animateFloat(label = "a") { if (it) 1f else 0.6f }
val height by transition.animateDp(label = "h") { if (it) 240.dp else 80.dp }
```

### 5. Infinite Animations

```kotlin
val infinite = rememberInfiniteTransition(label = "pulse")
val scale by infinite.animateFloat(
    initialValue = 1f, targetValue = 1.2f,
    animationSpec = infiniteRepeatable(
        animation = tween(600, easing = FastOutSlowInEasing),
        repeatMode = RepeatMode.Reverse,
    ),
    label = "scale",
)
Box(Modifier.scale(scale).size(24.dp).background(Color.Red, CircleShape))
```

### 6. Shared Element Transitions (Compose 1.7+)

```kotlin
SharedTransitionLayout {
    NavHost(navController, startDestination = ListRoute) {
        composable<ListRoute> { ArticleList(onOpen = { id -> navController.navigate(DetailRoute(id)) }, sharedScope = this@SharedTransitionLayout, animatedScope = this) }
        composable<DetailRoute> { args -> ArticleDetail(id = args.toRoute<DetailRoute>().id, sharedScope = this@SharedTransitionLayout, animatedScope = this) }
    }
}

@Composable
fun ArticleThumb(id: String, scope: SharedTransitionScope, animatedScope: AnimatedVisibilityScope) = with(scope) {
    AsyncImage(
        model = coverUrl,
        contentDescription = null,
        modifier = Modifier.sharedElement(
            state = rememberSharedContentState(key = "cover-$id"),
            animatedVisibilityScope = animatedScope,
        ).size(96.dp).clip(MaterialTheme.shapes.small),
    )
}
```

Use matching `key`s on both source and destination. Keep payloads identical (same aspect ratio, same clip).

### 7. Gestures + Physics

```kotlin
val offsetX = remember { Animatable(0f) }
val scope = rememberCoroutineScope()
Modifier.pointerInput(Unit) {
    detectHorizontalDragGestures(
        onHorizontalDrag = { _, dx -> scope.launch { offsetX.snapTo(offsetX.value + dx) } },
        onDragEnd        = { scope.launch { offsetX.animateTo(0f, spring(stiffness = Spring.StiffnessMedium)) } },
    )
}
```

`Animatable` is the right tool when gestures and animation share state.

### 8. Performance Notes

- Prefer `graphicsLayer { alpha = a; scaleX = s }` over `Modifier.alpha(a).scale(s)` when animating — single layer, no recomposition.
- Animate on `Int`/`Dp`/`Float`, not `Modifier` swaps.
- Respect **reduced motion**: read `AccessibilityManager.isReducedMotionEnabled` (via `LocalAccessibilityManager`) and fall back to instant `snap`.

## Checklist
- [ ] Every animation has a descriptive `label` for the Animation Preview.
- [ ] `AnimatedVisibility` is used for show/hide, `AnimatedContent` for content swaps.
- [ ] Multi-property animations use a single `updateTransition`.
- [ ] Shared element transitions key source and destination with the same string.
- [ ] `graphicsLayer` is preferred over stacking visual modifiers for animated values.
- [ ] Reduced-motion setting is respected for non-essential motion.
