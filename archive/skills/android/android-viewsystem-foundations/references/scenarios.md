# Android ViewSystem Foundations Runnable Scenarios

## Happy path
- Goal: Refine the XML OrbitTasks screen with ViewBinding and explicit fragment-safe patterns.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

## Edge case
- Goal: Handle configuration changes, view lifecycle, and long content in classic layouts.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:connectedDebugAndroidTest`

## Failure recovery
- Goal: Prevent XML or Fragment requests from being routed to Compose-first skills.
- Command: `python3 scripts/eval_triggers.py --skill android-viewsystem-foundations`
