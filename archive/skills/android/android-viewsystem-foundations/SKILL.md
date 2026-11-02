---
name: "android-viewsystem-foundations"
description: "Handle XML layouts, ConstraintLayout, Fragments, ViewBinding, DataBinding, and classic Android UI lifecycle patterns."
metadata:
  version: "0.1.0"
  category: "ui"
  tags: ["android", "xml", "views", "fragments"]
  triggers:
    include: ["xml layout android issue", "fragment lifecycle android", "constraintlayout cleanup", "viewbinding databinding android", "legacy view system screen", "recyclerview adapter android", "fragment transaction issue android"]
    exclude: ["compose-only side effects", "retrofit serialization only", "gradle wrapper bump", "pure compose layout", "configuration cache problem"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---
# Android ViewSystem Foundations

## When To Use
- Use this skill when the request is about: xml layout android issue, fragment lifecycle android, constraintlayout cleanup.
- Primary outcome: Handle XML layouts, ConstraintLayout, Fragments, ViewBinding, DataBinding, and classic Android UI lifecycle patterns.
- Reach for this skill when the main surface is XML, Fragment, RecyclerView, or binding lifecycle work rather than Compose-first UI.
- Handoff skills when the scope expands:
- `android-compose-xml-interoperability`
- `android-testing-ui`

## Workflow
1. Identify whether the target surface is Fragment, Activity, custom view, RecyclerView, or a mixed Compose/View interoperability screen.
2. Anchor ownership correctly: view bindings to the view lifecycle, adapters to explicit item models, and navigation/transactions outside leaf views.
3. Fix layout and rendering issues with classic View tools first: ConstraintLayout, RecyclerView diffing, window insets, and binding-safe updates.
4. Exercise Fragment recreation, long text, font scaling, RTL, and process-lifecycle edges before considering the change complete.
5. Hand off Compose interoperability or UI test depth only after the View-system ownership model is stable.

## Guardrails
- Optimize for stable state and predictable rendering before adding animation or abstraction.
- Respect accessibility semantics, contrast, focus order, and touch target guidance by default.
- Do not mix Compose and View system ownership without an explicit interoperability boundary.
- Prefer measured performance work over premature micro-optimizations.
- Clear ViewBinding references when the Fragment view is destroyed; do not keep view references alive past the view lifecycle.

## Anti-Patterns
- Embedding navigation or business logic directly in leaf UI components.
- Using fixed dimensions that break on localization or dynamic text.
- Ignoring semantics and announcing only visual changes.
- Porting XML patterns directly into Compose without adapting the mental model.
- Holding Fragment view state in stale bindings, view references, or adapters across view recreation.

## Examples
### Happy path
- Scenario: Refine the XML OrbitTasks screen with ViewBinding and explicit fragment-safe patterns.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Handle configuration changes, view lifecycle, and long content in classic layouts.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:connectedDebugAndroidTest`

### Failure recovery
- Scenario: Prevent XML or Fragment requests from being routed to Compose-first skills.
- Command: `python3 scripts/eval_triggers.py --skill android-viewsystem-foundations`

## Done Checklist
- The implementation path is explicit, minimal, and tied to the right Android surface.
- Relevant example commands and benchmark prompts have been exercised or updated.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and the main migration or troubleshooting path.

## Official References
- [https://developer.android.com/guide/fragments](https://developer.android.com/guide/fragments)
- [https://developer.android.com/topic/libraries/view-binding](https://developer.android.com/topic/libraries/view-binding)
- [https://developer.android.com/training/constraint-layout](https://developer.android.com/training/constraint-layout)
- [https://developer.android.com/topic/libraries/data-binding](https://developer.android.com/topic/libraries/data-binding)
