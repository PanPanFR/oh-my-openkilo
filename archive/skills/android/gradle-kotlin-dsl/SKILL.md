---
name: gradle-kotlin-dsl
description: Expert guidance on Gradle Kotlin DSL for Android — build.gradle.kts patterns, convention plugins in build-logic, version catalogs, and settings configuration. Use this when touching any build file.
---

# Gradle Kotlin DSL — Convention Plugins & Version Catalogs

## Instructions

The goal: every feature module's build file fits on one screen and references shared logic via precompiled plugins.

### 1. `settings.gradle.kts`

```kotlin
pluginManagement {
    includeBuild("build-logic")
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}

rootProject.name = "myapp"
enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")

include(":app")
include(":core:designsystem", ":core:data", ":core:network", ":core:database", ":core:domain")
include(":feature:articles:ui", ":feature:articles:data", ":feature:articles:domain")
```

`TYPESAFE_PROJECT_ACCESSORS` enables `projects.core.data` references — refactor-safe.

### 2. Version Catalog (`gradle/libs.versions.toml`)

```toml
[versions]
kotlin = "2.0.21"
agp = "8.7.2"
ksp = "2.0.21-1.0.25"
hilt = "2.52"
room = "2.6.1"
retrofit = "2.11.0"
okhttp = "4.12.0"
compose-bom = "2024.10.01"
kotlinx-serialization = "1.7.3"
kotlinx-coroutines = "1.9.0"
lifecycle = "2.8.7"

[libraries]
androidx-core-ktx = { module = "androidx.core:core-ktx", version = "1.13.1" }
androidx-lifecycle-runtime-compose = { module = "androidx.lifecycle:lifecycle-runtime-compose", version.ref = "lifecycle" }
androidx-lifecycle-viewmodel-compose = { module = "androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "lifecycle" }
androidx-compose-bom = { module = "androidx.compose:compose-bom", version.ref = "compose-bom" }
androidx-compose-ui = { module = "androidx.compose.ui:ui" }
androidx-compose-material3 = { module = "androidx.compose.material3:material3" }
androidx-compose-ui-tooling-preview = { module = "androidx.compose.ui:ui-tooling-preview" }
hilt-android = { module = "com.google.dagger:hilt-android", version.ref = "hilt" }
hilt-compiler = { module = "com.google.dagger:hilt-android-compiler", version.ref = "hilt" }
retrofit = { module = "com.squareup.retrofit2:retrofit", version.ref = "retrofit" }
retrofit-kotlinx-serialization-converter = { module = "com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter", version = "1.0.0" }
okhttp = { module = "com.squareup.okhttp3:okhttp", version.ref = "okhttp" }
okhttp-logging = { module = "com.squareup.okhttp3:logging-interceptor", version.ref = "okhttp" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }

[bundles]
compose = [ "androidx-compose-ui", "androidx-compose-material3", "androidx-compose-ui-tooling-preview" ]
network = [ "retrofit", "retrofit-kotlinx-serialization-converter", "okhttp", "okhttp-logging", "kotlinx-serialization-json" ]

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
android-library = { id = "com.android.library", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
```

### 3. Convention Plugins (`build-logic/`)

```
build-logic/
├── settings.gradle.kts
└── convention/
    ├── build.gradle.kts
    └── src/main/kotlin/
        ├── app.android.application.gradle.kts
        ├── app.android.library.gradle.kts
        ├── app.android.hilt.gradle.kts
        ├── app.android.compose.gradle.kts
        └── app.kotlin.library.gradle.kts       (pure JVM domain modules)
```

`build-logic/settings.gradle.kts`:

```kotlin
rootProject.name = "build-logic"
include(":convention")

dependencyResolutionManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
    versionCatalogs { create("libs") { from(files("../gradle/libs.versions.toml")) } }
}
```

`build-logic/convention/build.gradle.kts`:

```kotlin
plugins { `kotlin-dsl` }
kotlin { jvmToolchain(17) }

dependencies {
    implementation(libs.android.gradlePlugin)          // com.android.tools.build:gradle
    implementation(libs.kotlin.gradlePlugin)
    implementation(libs.ksp.gradlePlugin)
}
```

`app.android.library.gradle.kts`:

```kotlin
import com.android.build.gradle.LibraryExtension
import org.gradle.kotlin.dsl.configure

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

extensions.configure<LibraryExtension> {
    compileSdk = 35
    defaultConfig { minSdk = 24 }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    jvmToolchain(17)
    compilerOptions.freeCompilerArgs.addAll("-Xjvm-default=all", "-opt-in=kotlin.RequiresOptIn")
}
```

`app.android.compose.gradle.kts`:

```kotlin
import com.android.build.gradle.api.AndroidBasePlugin

plugins { id("org.jetbrains.kotlin.plugin.compose") }

pluginManager.withPlugin("com.android.base") {
    extensions.configure<com.android.build.api.dsl.CommonExtension<*, *, *, *, *, *>> {
        buildFeatures { compose = true }
    }
}

composeCompiler {
    enableStrongSkippingMode = true
}
```

### 4. Feature Module Using Conventions

`feature/articles/ui/build.gradle.kts`:

```kotlin
plugins {
    id("app.android.library")
    id("app.android.compose")
    id("app.android.hilt")
}

android { namespace = "com.example.feature.articles.ui" }

dependencies {
    implementation(projects.feature.articles.domain)
    implementation(projects.core.designsystem)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.bundles.compose)
}
```

### 5. Application Module

`app/build.gradle.kts`:

```kotlin
plugins {
    id("app.android.application")
    id("app.android.compose")
    id("app.android.hilt")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.example.app"
    defaultConfig {
        applicationId = "com.example.app"
        versionCode = 1
        versionName = "1.0.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}

dependencies {
    implementation(projects.feature.articles.ui)
    implementation(projects.core.designsystem)
    implementation(libs.androidx.core.ktx)
}
```

### 6. Version Checks

Add a task to fail the build on accidental version drift:

```kotlin
tasks.register("checkVersions") {
    doLast {
        val kotlin = libs.versions.kotlin.get()
        val ksp = libs.versions.ksp.get()
        require(ksp.startsWith(kotlin)) { "KSP $ksp must start with Kotlin $kotlin" }
    }
}
```

Run with the `com.github.ben-manes.versions` plugin in CI to report outdated libraries, but keep automated bumps behind review.

## Checklist
- [ ] No hard-coded coordinates (`"com.x:y:1.2"`) in any `build.gradle.kts`; every dependency flows through `libs.versions.toml`.
- [ ] `TYPESAFE_PROJECT_ACCESSORS` is enabled and `projects.*` references are used.
- [ ] Convention plugins live in `build-logic/` and every module consumes at least one.
- [ ] Kotlin toolchain is fixed at JVM 17.
- [ ] Compose strong skipping mode is enabled via the convention plugin.
- [ ] `repositoriesMode` is `FAIL_ON_PROJECT_REPOS`.
- [ ] `includeBuild("build-logic")` is configured in `settings.gradle.kts`.
