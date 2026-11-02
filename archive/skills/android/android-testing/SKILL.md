---
name: "android-testing"
description: "Write and run Android unit and UI tests: reducers, use cases, repositories, Compose UI tests with createAndroidComposeRule and semantics matchers, Espresso checks, screenshot assertions with Paparazzi or Roborazzi, accessibility verification, and ADB/UIAutomator automation."
metadata:
  version: "0.1.0"
  category: "quality-release"
  tags: ["android", "testing", "unit-tests", "ui-tests", "instrumentation", "screenshot", "adb", "uiautomator", "validation"]
  triggers:
    include: ["android unit test strategy", "test viewmodel reducer android", "repository unit tests android", "mock coroutine dependency android", "android ui test", "compose ui test screen", "espresso validation android", "instrumentation test android flow", "accessibility assertions android ui", "roborazzi screenshot test android", "paparazzi screenshot test android", "createandroidcomposerule", "semantics matcher compose", "compose test synchronization", "android emulator automation", "adb semantic ui automation", "uiautomator dump and tap", "validate android ui states", "check loading empty error flow android", "edge cases in android screen", "state matrix before release"]
    exclude: ["ui screenshot only", "play store listing", "apk alignment", "gradle version conflict", "room dao only", "macrobenchmark only", "dependency alignment only", "hilt graph only", "roborazzi screenshot test android", "compose ui test screen", "espresso validation android"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Android Testing

## When To Use
- Use this skill when the request is about: android unit test strategy, android ui test, compose ui test screen, android emulator automation, validate android ui states.
- Primary outcome: Write fast focused unit tests for reducers, use cases, repositories, and state holders; validate UI behavior with Compose UI tests, Espresso checks, screenshot assertions, and accessibility verification; inspect and interact with apps via ADB/UIAutomator.
- Reach for this skill when the missing work is assertions, instrumentation, screenshot capture, accessibility verification, state-matrix coverage, or agent-driven UI automation. Hand off pure data-layer, architecture, or release work to `kotlin-data-layer`, `kotlin-android-architecture`, or `android-build-release`.
- Handoff skills when the scope expands:
- `android-compose-accessibility` (merged into android-compose)
- `compose-state-management`
- `kotlin-data-layer`

## Workflow
1. Scope the risk surface: correctness, visual regressions, accessibility semantics, state-matrix coverage, or cross-device interaction.
2. Decide unit vs UI vs automation: unit tests for reducers/use cases/repositories; Compose UI tests/Espresso for behavior; Roborazzi for visuals; ADB/UIAutomator for agent-driven inspection without Espresso.
3. Pick the narrowest verification strategy that still catches likely regressions.
4. Instrument workflows so failures are actionable rather than just red.
5. Build a state matrix covering loading, content, empty, error, offline, stale-data, denied-permission, and post-action confirmation states.
6. Run the relevant checks on the showcase apps and packaging outputs; record/refresh screenshot baselines only when a stable surface changes intentionally.
7. Hand off to testing only when the missing work is about assertions or automation rather than state design.

## Guardrails
- Prefer reproducible checks in CI over one-off local heroics.
- Keep screenshot tests stable with deterministic content, fixed themes, and minimal time-based UI churn.
- Fail with a precise remediation path instead of a vague quality gate.
- Keep secrets, signing material, and production credentials out of examples and fixtures.
- Prefer semantic selectors (text, content description, resource ID) over raw coordinates in UIAutomator.
- Treat automation as an inspection/smoke tool, not a replacement for deterministic UI tests.

## Anti-Patterns
- Adding more tests without increasing signal.
- Turning screenshot tests into pixel-noise snapshots of unstable surfaces.
- Hard-coding coordinates when text or resource IDs are available.
- Running emulator commands before the device is boot-complete.
- Using tests as a substitute for deciding what the product should show in each failure mode.
- Assuming the happy path is enough for product flows.

## Remediation Examples
### Compose UI assertion with accessibility check
```kotlin
composeTestRule.onNodeWithText("Review blocked state").performClick()
composeTestRule.onNodeWithText("Reminder readiness").assertIsDisplayed()

composeTestRule
    .onNodeWithContentDescription("Team avatar for release readiness")
    .assertIsDisplayed()
```

### Roborazzi golden snapshot
```kotlin
@Test
fun orbitTasksBoard_matchesGolden() {
    composeTestRule.setContent { OrbitTasksApp() }
    composeTestRule.onRoot().captureRoboImage()
}
```

## Examples
### Happy path
- Scenario: Cover reducer and formatter logic with local unit tests; run Compose UI assertions and verify the stable surface with Roborazzi.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest connectedDebugAndroidTest verifyRoborazziDebug`

### Edge case
- Scenario: Mock sync failures and permission-denied branches without instrumentation; exercise long content, empty lists, and sync failures in the XML fixture.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Failure recovery
- Scenario: Confirm the device is discoverable and UIAutomator can dump the hierarchy before chasing a selector bug.
- Command: `python3 skills/android-emulator-automation/scripts/device_health.py --json`

## Done Checklist
- Unit tests cover reducers, use cases, repositories, and lifecycle-safe state holders.
- UI tests cover behavior, visual regressions, accessibility semantics, and state-matrix branches.
- Automation uses semantic selectors and is reproducible in local dev and CI.
- State design is separated from assertion/automation work.
- Relevant example commands and benchmark prompts have been exercised.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/training/testing/local-tests](https://developer.android.com/training/testing/local-tests)
- [https://developer.android.com/training/testing/fundamentals](https://developer.android.com/training/testing/fundamentals)
- [https://developer.android.com/develop/ui/compose/testing](https://developer.android.com/develop/ui/compose/testing)
- [https://developer.android.com/training/testing/espresso](https://developer.android.com/training/testing/espresso)
- [https://developer.android.com/guide/topics/ui/accessibility/testing](https://developer.android.com/guide/topics/ui/accessibility/testing)
- [https://developer.android.com/training/testing/instrumented-tests](https://developer.android.com/training/testing/instrumented-tests)
- [https://developer.android.com/tools/adb](https://developer.android.com/tools/adb)
- [https://developer.android.com/training/testing/other-components/ui-automator](https://developer.android.com/training/testing/other-components/ui-automator)
- [https://github.com/takahirom/roborazzi](https://github.com/takahirom/roborazzi)
