---
name: "android-navigation-deeplinks"
description: "Handle navigation graphs, back stack behavior, app links, intents, and destination ownership for Android apps."
metadata:
  version: "0.1.0"
  category: "product"
  tags: ["android", "navigation", "deeplinks", "back-stack"]
  triggers:
    include: ["android navigation graph", "deep link into android app", "back stack issue in compose nav", "intent route android screen", "app links setup android"]
    exclude: ["compose recomposition only", "room schema only", "gradle version bump only"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---
# Android Navigation Deep Links

## When To Use
- Use this skill when the request is about: android navigation graph, deep link into android app, back stack issue in compose nav.
- Primary outcome: Handle navigation graphs, back stack behavior, app links, intents, and destination ownership for Android apps.
- Handoff skills when the scope expands:
- `android-permissions-activity-results`
- `android-testing-ui`

## Workflow
1. Confirm the user-visible journey, target device behavior, and failure states that matter.
2. Identify the owning screens, activities, destinations, and state holders for the flow.
3. Implement the flow with explicit loading, success, empty, and error handling.
4. Validate accessibility, configuration changes, and back-stack behavior in the showcase apps.
5. Escalate data, architecture, or release concerns to the specialized skills called out in the handoff notes.

## Guardrails
- Treat loading, empty, error, offline, and permission-denied states as first-class UI states.
- Do not hide navigation or permission side effects inside reusable UI components.
- Prefer lifecycle-aware APIs over manual callback chains.
- Keep deep links, intents, and permission prompts testable and observable.

## Anti-Patterns
- Assuming the happy path is enough for product flows.
- Hard-coding request codes or route strings in multiple places.
- Triggering navigation directly from repositories or network layers.
- Shipping flows without recovery UI for denied permissions or broken state.

## Remediation Examples
### Centralize route ownership
```kotlin
sealed interface OrbitRoute {
    data object Board : OrbitRoute
    data class Task(val taskId: String) : OrbitRoute
}
```

### Preserve expected back-stack behavior
```kotlin
navController.navigate(OrbitRoute.Task(taskId)) {
    launchSingleTop = true
    restoreState = true
}
```

### Parse deep-link arguments in one place
```kotlin
val taskId = intent?.data?.getQueryParameter("taskId")
require(!taskId.isNullOrBlank()) { "Missing taskId deep-link argument" }
```

## Examples
### Happy path
- Scenario: Route the Compose showcase into a task details destination from a deep link.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Preserve expected Up and Back behavior when the XML activity is cold-started from a link.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

### Failure recovery
- Scenario: Prevent confusion with permission, state, and release prompts.
- Command: `python3 scripts/eval_triggers.py --skill android-navigation-deeplinks`

## Done Checklist
- The implementation path is explicit, minimal, and tied to the right Android surface.
- Relevant example commands and benchmark prompts have been exercised or updated.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and the main migration or troubleshooting path.

## Official References
- [https://developer.android.com/guide/navigation](https://developer.android.com/guide/navigation)
- [https://developer.android.com/guide/navigation/design](https://developer.android.com/guide/navigation/design)
- [https://developer.android.com/training/app-links](https://developer.android.com/training/app-links)
- [https://developer.android.com/guide/components/intents-filters](https://developer.android.com/guide/components/intents-filters)
