---
name: compose-accessibility
description: Expert guidance on building accessible Compose UIs with semantics modifiers, TalkBack support, correct touch target sizing, contrast, and large-text scaling. Use this when authoring or reviewing any user-facing composable.
---

# Accessibility in Jetpack Compose

## Instructions

Accessibility is not optional. Compose exposes a tree of **semantics nodes** to TalkBack and automated testing. Correct semantics unlock both.

### 1. Semantics Modifier Basics

```kotlin
IconButton(
    onClick = onDelete,
    modifier = Modifier.semantics { contentDescription = stringResource(R.string.delete_item) },
) {
    Icon(Icons.Default.Delete, contentDescription = null)
}
```

Rules:
- Use the **built-in** `contentDescription` parameter on `Icon`, `Image`, and `AsyncImage` — it already writes the semantic property correctly.
- Set `contentDescription = null` for *purely decorative* imagery.
- Never embed a period in short labels; TalkBack handles pauses automatically.

### 2. Merging vs Clearing

```kotlin
Row(Modifier
    .clickable(onClick = onOpen)
    .semantics(mergeDescendants = true) {
        contentDescription = "Unread message from ${msg.sender}: ${msg.preview}"
    }
) {
    Avatar(msg.sender)
    Column { Text(msg.sender); Text(msg.preview) }
}
```

`mergeDescendants = true` collapses children into a single focus item, which is exactly what TalkBack users expect for a list row.

### 3. Roles and State

```kotlin
var checked by remember { mutableStateOf(false) }
Box(
    Modifier
        .toggleable(
            value = checked,
            role = Role.Checkbox,
            onValueChange = { checked = it },
        )
        .size(48.dp),
) { /* custom visual */ }
```

Prefer `toggleable`, `selectable`, `clickable(role = Role.Button)`, `progressSemantics()` over ad-hoc `semantics { }` blocks.

### 4. Headings and Live Regions

```kotlin
Text("Today", modifier = Modifier.semantics { heading() }, style = MaterialTheme.typography.titleLarge)

Text(
    text = status,
    modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
)
```

### 5. Touch Targets

Material 3 already ships 48 dp defaults for `Button`, `IconButton`, `Checkbox`. For custom widgets, enforce it:

```kotlin
Box(Modifier.minimumInteractiveComponentSize().clickable(onClick = onTap)) { /* ... */ }
```

`minimumInteractiveComponentSize()` expands the touch target to at least 48 dp without changing the visual size.

### 6. Large Text and Dynamic Scaling

Never hard-code `sp`→`dp`. Let text scale. Test your screens at `1.3×` and `2.0×` font scale:

```
adb shell settings put system font_scale 2.0
```

Use `TextUnit` math: `MaterialTheme.typography.bodyMedium.fontSize * 1.2`. Prefer `lineHeight = with(LocalDensity.current) { ... }` relative to font size.

### 7. Color Contrast

- Body text vs background: **4.5 : 1** minimum.
- Large text (≥ 18 sp regular or ≥ 14 sp bold): **3 : 1**.
- Never encode meaning in color alone — pair with an icon or label.

Use Material 3 `colorScheme.onSurface` / `colorScheme.onPrimary` pairs; they are guaranteed to meet contrast against their parent color roles.

### 8. Custom Actions for Lists

```kotlin
Row(Modifier.semantics {
    customActions = listOf(
        CustomAccessibilityAction(label = "Archive") { onArchive(msg); true },
        CustomAccessibilityAction(label = "Delete")  { onDelete(msg); true },
    )
}) { /* visual swipe actions */ }
```

This exposes swipe-hidden actions to TalkBack users.

### 9. Testing Semantics

```kotlin
composeRule.onNodeWithContentDescription("Delete item").performClick()
composeRule.onNode(hasText("Today") and hasAnyAncestor(isHeading())).assertIsDisplayed()
```

Run the **Accessibility Scanner** app on CI-produced screenshots and fix every "Missing label" / "Low contrast" finding.

## Checklist
- [ ] Every interactive element has a label (either `contentDescription` or visible `Text`).
- [ ] Purely decorative icons/images pass `contentDescription = null`.
- [ ] Custom tap targets use `minimumInteractiveComponentSize()` or are at least 48 dp.
- [ ] Headings use `Modifier.semantics { heading() }`.
- [ ] Screens render correctly at `font_scale = 2.0` with no truncation.
- [ ] Color pairs meet WCAG AA contrast; meaning is never carried by color alone.
- [ ] Compose UI tests use semantics matchers rather than tag-only lookups.
