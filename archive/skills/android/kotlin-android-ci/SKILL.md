---
name: kotlin-android-ci
description: Expert guidance on CI/CD for Kotlin Android projects — GitHub Actions, Gradle remote cache, signing, Play Publisher, and Firebase App Distribution. Use this when setting up or debugging CI pipelines.
---

# Kotlin Android CI/CD with GitHub Actions

## Instructions

### 1. Baseline Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI
on:
  push:    { branches: [ main ] }
  pull_request: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }

      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }

      - uses: gradle/actions/setup-gradle@v4
        with:
          cache-read-only: ${{ github.ref != 'refs/heads/main' }}

      - name: Assemble, lint, detekt, unit tests
        run: ./gradlew assembleDebug lint detekt test --configuration-cache --scan

      - name: Compose screenshot verification
        run: ./gradlew verifyPaparazziDebug

      - name: Upload failure artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: reports
          path: |
            **/build/reports/**
            **/build/outputs/**/logs/**
            **/build/paparazzi/failures/**
```

Notes:
- `concurrency` cancels stale runs on the same PR.
- `cache-read-only` on PRs prevents a flaky PR from poisoning the cache; `main` writes.
- Always upload reports on failure — they make red CI actionable.

### 2. Parallel Jobs with Matrix

```yaml
  test:
    strategy:
      fail-fast: false
      matrix:
        task: [ ':core:data:test', ':feature:articles:ui:test', ':app:testDebugUnitTest' ]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }
      - uses: gradle/actions/setup-gradle@v4
      - run: ./gradlew ${{ matrix.task }}
```

Split big test tasks across jobs to stay under 10 min wall-clock. The remote cache makes this cheap because the compilation cost is paid once.

### 3. Remote Build Cache

In `settings.gradle.kts`:

```kotlin
buildCache {
    local { isEnabled = true }
    remote<HttpBuildCache> {
        url = uri(providers.gradleProperty("gradleCacheUrl").orElse("https://cache.example.com/cache/"))
        isPush = (System.getenv("CI") == "true")
        credentials {
            username = System.getenv("GRADLE_CACHE_USER")
            password = System.getenv("GRADLE_CACHE_PASS")
        }
    }
}
```

Store credentials as repository secrets. On forked-PR builds, provide a read-only token or disable `isPush`.

### 4. Signing in CI

Keep the upload keystore out of the repo. Commit a base64 export as a GitHub secret:

```yaml
- name: Decode keystore
  env:
    KEYSTORE_BASE64: ${{ secrets.UPLOAD_KEYSTORE_BASE64 }}
  run: |
    echo "$KEYSTORE_BASE64" | base64 -d > $RUNNER_TEMP/upload.jks
    echo "KEYSTORE_FILE=$RUNNER_TEMP/upload.jks" >> $GITHUB_ENV

- name: Build release bundle
  env:
    KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
    KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
    KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
  run: ./gradlew :app:bundleRelease
```

Wire the env vars in `app/build.gradle.kts`:

```kotlin
android.signingConfigs {
    register("release") {
        storeFile = System.getenv("KEYSTORE_FILE")?.let(::file)
        storePassword = System.getenv("KEYSTORE_PASSWORD")
        keyAlias = System.getenv("KEY_ALIAS")
        keyPassword = System.getenv("KEY_PASSWORD")
    }
}
android.buildTypes.release.signingConfig = android.signingConfigs.getByName("release")
```

### 5. Play Store Publishing — Gradle Play Publisher

```kotlin
plugins { id("com.github.triplet.play") version "3.11.0" }

play {
    serviceAccountCredentials.set(file(System.getenv("PLAY_SERVICE_ACCOUNT_JSON") ?: "/dev/null"))
    defaultToAppBundles.set(true)
    track.set("internal")        // internal → alpha → beta → production
    releaseStatus.set(ReleaseStatus.DRAFT)
}
```

Release workflow (triggered by tag):

```yaml
on:
  push:
    tags: [ 'v*' ]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }
      - uses: gradle/actions/setup-gradle@v4
      - name: Write service account JSON
        run: echo '${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}' > $RUNNER_TEMP/play.json
      - name: Publish internal track
        env:
          PLAY_SERVICE_ACCOUNT_JSON: ${{ runner.temp }}/play.json
          # keystore secrets as in step 4
        run: ./gradlew publishReleaseBundle --track=internal
```

### 6. Firebase App Distribution (Internal Builds)

```kotlin
plugins { id("com.google.firebase.appdistribution") version "5.0.0" }

firebaseAppDistribution {
    artifactType = "APK"
    groups = "qa,stakeholders"
    releaseNotesFile = "release-notes.txt"
    serviceCredentialsFile = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON") ?: ""
}
```

```yaml
- run: ./gradlew :app:appDistributionUploadRelease
  env:
    FIREBASE_SERVICE_ACCOUNT_JSON: ${{ runner.temp }}/firebase.json
```

### 7. Quality Gates

| Gate | Command | Fail criterion |
|---|---|---|
| Compile | `./gradlew assembleDebug` | any error |
| Lint | `./gradlew lintDebug` | warnings with `-Dlint.abortOnError=true` for new issues |
| detekt | `./gradlew detekt` | any rule violation |
| Unit tests | `./gradlew test` | any failure |
| Screenshots | `./gradlew verifyPaparazziDebug` | any diff beyond threshold |
| Baseline profile | `./gradlew :app:generateBaselineProfile` | drift in baseline-prof.txt outside release branches |

### 8. Instrumented Tests on Emulator

```yaml
  instrumented:
    runs-on: macos-13   # KVM + HAXM
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '17' }
      - uses: gradle/actions/setup-gradle@v4
      - uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          arch: x86_64
          profile: pixel_6
          script: ./gradlew connectedDebugAndroidTest --no-parallel
```

Alternatively, run with **Gradle Managed Devices** (`./gradlew pixel6api34DebugAndroidTest`) — no external action required, AGP starts the emulator.

### 9. Secrets Hygiene

- Never log secrets. `echo "::add-mask::$VALUE"` if you must interact with one.
- Rotate Play and Firebase service accounts annually.
- Pin all GitHub Actions to a commit SHA, not a mutable tag, for supply-chain safety.

## Checklist
- [ ] Workflow uses `actions/setup-java` (Temurin 17) + `gradle/actions/setup-gradle`.
- [ ] `concurrency.cancel-in-progress: true` is set.
- [ ] Remote build cache is configured with `isPush` gated on `CI` env.
- [ ] Keystore is supplied via a base64 secret, never committed.
- [ ] Play Publisher uploads to `internal` track by default; promotions happen manually.
- [ ] Reports upload as artifacts on failure.
- [ ] Instrumented tests run on a matrix (API 28 + 34) weekly or on release branches.
- [ ] All third-party actions are pinned to SHAs.
