---
name: "android-build-release"
description: "Shape Android Gradle build logic, diagnose build performance, and automate CI, versioning, signing, release channels, and Play-ready delivery."
metadata:
  version: "0.1.0"
  category: "quality-release"
  tags: ["android", "gradle", "build", "ci", "cd", "release", "play-store", "signing", "performance", "observability"]
  triggers:
    include: ["android ci cd pipeline", "play store release automation", "android signing and release", "canary stable release android", "github actions android build", "android gradle plugin setup", "fix build logic for android modules", "version catalog for android repo", "gradle convention cleanup for android", "android gradle build performance", "configuration cache android build", "ksp vs kapt android", "slow gradle build in android", "ci build cache diagnosis android", "android performance profiling", "baseline profile or macrobenchmark", "app startup issue android", "trace jank crash android"]
    exclude: ["compose semantics only", "fragment back stack only", "datastore migration only", "room schema migration only", "compose layout only", "notification permission flow", "deep link only", "compose semantics only", "room dao only", "permission request only", "retrofit dto change only", "fragment transaction only"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---

# Android Build & Release

## When To Use
- Use this skill when the request is about: android ci cd pipeline, android gradle plugin setup, android gradle build performance, android performance profiling, baseline profile or macrobenchmark.
- Primary outcome: Shape Android Gradle build logic with version catalogs, plugins, conventions, and toolchain compatibility; diagnose build performance with scans, cache checks, and bottleneck audits; automate CI, versioning, signing boundaries, release channels, and Play-ready delivery; measure startup, rendering, memory, jank, vitals, logs, and crash signals.
- Reach for this skill when the problem is build structure, build speed/CI time, release automation, or performance measurement. Hand off pure UI, data-layer, or state work to `android-compose`, `kotlin-data-layer`, or `compose-state-management`.
- Handoff skills when the scope expands:
- `kotlin-android-architecture`
- `android-compose`
- `compose-state-management`
- `android-security-best-practices`

## Workflow
1. Scope the risk surface: correctness, security, performance, test depth, or release automation.
2. For build logic: map the module graph; inspect `gradle.properties`, plugin wiring, dependency declarations, task registration, and module conventions; keep `api` vs `implementation` and public surface explicit.
3. For build performance: identify local feedback time vs CI duration; measure one path at a time with `--profile`, `--scan`, configuration-cache diagnostics; check KSP vs kapt, lazy task configuration, dynamic versions; apply one high-confidence optimization at a time and compare before/after.
4. For CI/release: validate CI workflows, version metadata, signing boundaries, release channels; keep secrets and signing material out of examples and fixtures; run canary/stable dry-runs before tagging.
5. For observability: classify the symptom (cold/warm start, jank, scroll, memory, ANR, crash, battery, vitals); measure on release-like builds and physical devices; pick the smallest tool (Macrobenchmark, Baseline Profiles, Perfetto, JankStats/FrameMetrics, Play Vitals).
6. Change one thing at a time; compare before/after traces or benchmark outputs. Hand off structural Gradle refactors or release-pipeline changes once the bottleneck is isolated.

## Guardrails
- Prefer reproducible checks in CI over one-off local heroics.
- Fail with a precise remediation path instead of a vague quality gate.
- Keep secrets, signing material, and production credentials out of examples and fixtures.
- Do not recommend broad rewrites when a single cache, plugin, or dependency pattern is the real bottleneck.
- Separate measurement from speculation; call out observed vs inferred.
- Prefer KSP, configuration cache, and lazy task configuration when the toolchain supports them.
- Treat benchmarks, traces, and vitals as different evidence sources; do not mix them casually; tie optimizations to user-facing metrics.

## Anti-Patterns
- Turning on every Gradle flag without checking compatibility or failures.
- Blaming AGP upgrades for slow builds without measuring task hot spots.
- Mixing build-logic architecture advice with build-time diagnosis in one pass.
- Using dynamic dependency versions that force repeated resolution work.
- Hard-coding release credentials into build logic.
- Chasing micro-optimizations before identifying whether the problem is startup, rendering, I/O, or field reliability.
- Measuring debug builds and assuming the same behavior in production.

## Examples
### Happy path
- Scenario: Run the Compose showcase build from a clean checkout with version catalogs; audit for build cache, configuration cache, KSP, and eager task creation smells.
- Command: `cd examples/orbittasks-compose && ./gradlew :app:assembleDebug`

### Edge case
- Scenario: Check canary and stable release script behavior before tagging; validate shared repositories and plugin management in the XML fixture.
- Command: `python3 scripts/release.py --channel canary --dry-run`

### Failure recovery
- Scenario: Avoid routing pure build-logic or security work into release automation; keep observability requests distinct from Compose-only tuning or release automation.
- Command: `python3 scripts/eval_triggers.py --skill android-build-release`

## Done Checklist
- Build logic, performance bottleneck, release pipeline, or measurement surface is classified and tied to an evidence source.
- Proposed optimizations are measurable and reversible; before/after comparisons are explicit.
- Secrets and signing material are excluded from examples and fixtures.
- Structural Gradle work is separated from performance tuning and release rollout.
- Relevant example commands and benchmark prompts have been exercised.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and migration path.

## Official References
- [https://developer.android.com/build](https://developer.android.com/build)
- [https://developer.android.com/build/releases/gradle-plugin](https://developer.android.com/build/releases/gradle-plugin)
- [https://developer.android.com/build/migrate-to-built-in-kotlin](https://developer.android.com/build/migrate-to-built-in-kotlin)
- [https://docs.gradle.org/current/userguide/userguide.html](https://docs.gradle.org/current/userguide/userguide.html)
- [https://docs.gradle.org/current/userguide/performance.html](https://docs.gradle.org/current/userguide/performance.html)
- [https://docs.gradle.org/current/userguide/configuration_cache.html](https://docs.gradle.org/current/userguide/configuration_cache.html)
- [https://developer.android.com/build/optimize-your-build](https://developer.android.com/build/optimize-your-build)
- [https://developer.android.com/build/ksp](https://developer.android.com/build/ksp)
- [https://developer.android.com/build/build-for-release](https://developer.android.com/build/build-for-release)
- [https://developer.android.com/studio/publish](https://developer.android.com/studio/publish)
- [https://developer.android.com/studio/publish/app-signing](https://developer.android.com/studio/publish/app-signing)
- [https://developer.android.com/studio/profile/overview](https://developer.android.com/studio/profile/overview)
- [https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview)
- [https://developer.android.com/topic/performance/baselineprofiles/overview](https://developer.android.com/topic/performance/baselineprofiles/overview)
