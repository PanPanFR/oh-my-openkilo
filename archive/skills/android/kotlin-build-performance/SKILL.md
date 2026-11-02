---
name: kotlin-build-performance
description: Expert guidance on making Kotlin Android builds fast — configuration cache, build cache, KSP vs KAPT, module graph, Gradle daemon tuning. Use this when builds are slow or CI times blow up.
---

# Kotlin Android Build Performance

## Instructions

A slow build starves the feedback loop. Target: clean build under 60 s on dev laptops, incremental builds under 5 s.

### 1. Enable Gradle Caches (`gradle.properties`)

```properties
org.gradle.jvmargs=-Xmx4g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
org.gradle.configuration-cache.parallel=true
org.gradle.configureondemand=true

# Kotlin
kotlin.incremental=true
kotlin.code.style=official

# AGP
android.useAndroidX=true
android.nonTransitiveRClass=true
android.nonFinalResIds=true
android.defaults.buildfeatures.buildconfig=false
android.defaults.buildfeatures.resvalues=false
android.defaults.buildfeatures.shaders=false
```

Verify with:

```
./gradlew :app:assembleDebug --configuration-cache --build-cache
```

The second run should log "Reusing configuration cache" and most tasks FROM-CACHE.

### 2. KSP Instead of KAPT

KAPT stubs Java to run annotation processors — it's the single biggest Kotlin-build tax. KSP understands Kotlin directly and is 2–4× faster.

```kotlin
plugins { alias(libs.plugins.ksp) }

dependencies {
    implementation(libs.hilt.android);  ksp(libs.hilt.compiler)      // Hilt 2.48+
    implementation(libs.room.runtime);  ksp(libs.room.compiler)
    implementation(libs.moshi);         ksp(libs.moshi.codegen)      // if on Moshi
}
```

Remove `kotlin("kapt")` and `kapt(...)` dependencies. If a processor has no KSP support, isolate it in its own small module so KAPT doesn't drag down the whole graph.

### 3. Module Graph Hygiene

A bad module graph (one fat `:app` depending on everything) defeats caching. Aim for a **diamond-free DAG**:

```
:app
 ├─ :feature:articles
 ├─ :feature:profile
 └─ :feature:settings
:feature:* → :core:designsystem, :core:ui, :core:data
:core:data → :core:network, :core:database, :core:domain
:core:*    → :core:common
```

Rules:
- A feature depends on `:core:*`, never on another feature.
- Gradle builds sibling leaves in parallel; flat is fast.
- Run `./gradlew projectReport` and `./gradlew projects` to inspect. Use the `com.dropbox.focus` or `project-report` plugin to visualize.

### 4. Convention Plugins

Put shared Android config in `build-logic/` as precompiled script plugins:

```kotlin
// build-logic/convention/src/main/kotlin/app.android.library.gradle.kts
plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    compileSdk = 35
    defaultConfig { minSdk = 24 }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    jvmToolchain(17)
    compilerOptions.freeCompilerArgs.add("-Xjvm-default=all")
}
```

Feature modules shrink to:

```kotlin
plugins { id("app.android.library"); id("app.android.hilt") }
```

This keeps configuration fast because Gradle loads one compiled plugin, not dozens of duplicated blocks.

### 5. Dependency Hygiene

- Always use `implementation`; reach for `api` only for types exposed in another module's public API.
- `nonTransitiveRClass=true` — each module gets only its own R class. Faster incremental compile, smaller generated code.
- Avoid snapshot/plus versions (`1.2.+`); they defeat the cache.
- Lock dependency versions via the version catalog. Keep catalog churn low.

### 6. Compose Compiler Tuning

```kotlin
composeCompiler {
    // enable strong skipping (Kotlin 2.0 + Compose compiler 1.5.14+)
    enableStrongSkippingMode = true
    // Add reports & metrics only on demand to avoid IO cost in CI
    reportsDestination = layout.buildDirectory.dir("compose-reports")
}
```

### 7. Remote Build Cache

```kotlin
// settings.gradle.kts
buildCache {
    local { isEnabled = true; directory = File(rootDir, ".gradle/build-cache") }
    remote<HttpBuildCache> {
        url = uri("https://your-cache.example.com/cache/")
        isPush = System.getenv("CI") == "true"
        credentials {
            username = System.getenv("GRADLE_CACHE_USER")
            password = System.getenv("GRADLE_CACHE_PASS")
        }
    }
}
```

Use a self-hosted Gradle Enterprise cache or `develocity` — the ROI is significant for teams > 3 developers.

### 8. Measuring

```
./gradlew :app:assembleDebug --scan
```

Publish a build scan and look at:
- **Task breakdown** — longest tasks.
- **Avoided tasks** — should be high on incremental.
- **Configuration time** — should be well under 1 s with config cache.

Use `./gradlew --profile` for local HTML reports when a scan isn't wanted.

### 9. CI Specifics

- Use the official `actions/setup-java` with Temurin 17 + `gradle/actions/setup-gradle@v4`.
- Enable dependency cache + configuration cache artifacts.
- Split CI into parallel jobs: `assemble`, `test`, `lint`, `detekt`, `ksp tasks`.
- Warm the remote cache nightly on `main` to reduce PR build times.

## Checklist
- [ ] `configuration-cache` and `build-cache` are on; second run reuses both.
- [ ] No `kapt` plugins remain (except where KSP isn't supported, isolated to one module).
- [ ] Feature modules consume precompiled convention plugins, not duplicated `android { }` blocks.
- [ ] `nonTransitiveRClass = true` enabled.
- [ ] No `+`-style dependency versions; all versions live in `libs.versions.toml`.
- [ ] Compose strong skipping mode is enabled.
- [ ] A remote build cache is configured for CI.
- [ ] Regular `--scan` reviews inform further optimization.
