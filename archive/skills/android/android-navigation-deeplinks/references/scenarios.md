# Android Navigation Deep Links Runnable Scenarios

## Happy path
- Goal: Route the Compose showcase into a task details destination from a deep link.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

## Edge case
- Goal: Preserve expected Up and Back behavior when the XML activity is cold-started from a link.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

## Failure recovery
- Goal: Prevent confusion with permission, state, and release prompts.
- Command: `python3 scripts/eval_triggers.py --skill android-navigation-deeplinks`
