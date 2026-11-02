---
name: "kotlin-android-architecture"
description: "Apply clean architecture, Hilt dependency injection, Kotlin idioms, and modular module design in Android projects."
metadata:
  version: "0.1.0"
  category: "foundations"
  tags: ["android", "architecture", "kotlin", "dependency-injection", "modules", "hilt"]
  triggers:
    include: ["clean architecture in android", "split use cases and repositories", "untangle presentation and data layer", "android hilt setup", "inject viewmodel repository hilt", "scope dependency in android", "hilt testing override", "kotlin cleanup in android app", "sealed classes for ui state", "extension functions for android feature", "android module split", "feature modularization in android", "break cyclic module dependency", "api vs implementation dependency android"]
    exclude: ["retrofit config only", "compose animation tweak", "play store release only", "full gradle upgrade", "release play console setup", "room schema migration only"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Kotlin Android Architecture

## When To Use
- Use this skill when the request is about: clean architecture in android, split use cases and repositories, android hilt setup, kotlin cleanup in android app, android module split.
- Primary outcome: Apply clean architecture boundaries, use cases, repositories, Hilt dependency injection, Kotlin idioms, and feature/core module design in Android projects.
- Reach for this skill when the problem is layer boundaries, component ownership, binding scopes, or dependency direction. Hand off pure data-layer contract work to `kotlin-data-layer`.
- Handoff skills when the scope expands:
- `kotlin-data-layer`
- `compose-state-management`

## Workflow
1. Map the request to the current Android stack, module boundaries, and minimum supported API level.
2. Inspect the existing implementation for implicit assumptions, duplicate helpers, and outdated patterns.
3. Decide the boundary: presentation, use case, repository, or DI component; match lifetime to scope explicitly.
4. Decide what to bind: constructor injection, `@Binds`, `@Provides`, qualifiers, multibindings, or assisted injection.
5. Apply the smallest change that improves correctness, readability, and long-term maintainability; keep `api` vs `implementation` and public surface explicit.
6. Validate the result against the relevant showcase app path and repo benchmarks.
7. Hand off adjacent work only after the core foundation is stable.

## Guardrails
- Prefer official Android and Kotlin guidance over custom local conventions when they conflict.
- Keep public APIs boring and explicit; avoid clever abstractions that hide Android lifecycle costs.
- Prefer constructor injection for app code you own; use qualifiers and scope annotations deliberately.
- Keep Hilt modules close to the ownership boundary they configure; treat test replacement as part of the design.
- Do not mix architectural cleanup with product behavior changes unless the request explicitly needs both.
- Document compatibility constraints that affect old modules or generated code.
- Avoid over-modularizing a small codebase when the real need is a single clearer ownership boundary.

## Anti-Patterns
- Sprinkling helpers across modules without a clear ownership boundary.
- Introducing framework-specific code into pure domain or data layers.
- Making everything `@Singleton` to silence scope questions.
- Hiding business construction logic inside giant `@Provides` methods when constructor injection would suffice.
- Using Hilt modules as a dumping ground for unrelated bindings across modules.
- Confusing DI graph ownership with app architecture ownership.
- Refactoring every adjacent file when only one contract needed to change.
- Treating module count as the goal instead of build isolation and dependency clarity.

## Examples
### Happy path
- Scenario: Separate OrbitTasks feature state, use case, and repository contracts with Hilt scopes.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:testDebugUnitTest`

### Edge case
- Scenario: Keep XML activity actions thin while preserving saved-state behavior; swap fake dependencies in the XML fixture.
- Command: `cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest`

### Failure recovery
- Scenario: Catch trigger confusion against data-layer, compose-state, or build-logic requests.
- Command: `python3 scripts/eval_triggers.py --skill kotlin-android-architecture`

## Done Checklist
- Layer boundaries and DI component ownership are explicit.
- Binding style, scopes, and qualifiers are explicit and testable.
- Test overrides or fakes are planned at the right graph boundary.
- Module graph is acyclic with clear feature/core boundaries.
- Relevant example commands and benchmark prompts have been exercised.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/topic/architecture](https://developer.android.com/topic/architecture)
- [https://developer.android.com/jetpack/guide](https://developer.android.com/jetpack/guide)
- [https://developer.android.com/training/dependency-injection/hilt-android](https://developer.android.com/training/dependency-injection/hilt-android)
- [https://developer.android.com/training/dependency-injection/hilt-testing](https://developer.android.com/training/dependency-injection/hilt-testing)
- [https://developer.android.com/training/dependency-injection/hilt-multi-module](https://developer.android.com/training/dependency-injection/hilt-multi-module)
- [https://developer.android.com/kotlin](https://developer.android.com/kotlin)
- [https://developer.android.com/build/kotlin-support](https://developer.android.com/build/kotlin-support)
- [https://kotlinlang.org/docs/coding-conventions.html](https://kotlinlang.org/docs/coding-conventions.html)
- [https://kotlinlang.org/docs/null-safety.html](https://kotlinlang.org/docs/null-safety.html)
- [https://developer.android.com/topic/modularization](https://developer.android.com/topic/modularization)
- [https://docs.gradle.org/current/userguide/multi_project_builds.html](https://docs.gradle.org/current/userguide/multi_project_builds.html)
