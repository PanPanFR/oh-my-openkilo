---
name: "android-modernization-upgrade"
description: "Bring very old Android projects to a current supported baseline with staged upgrades, deprecated API replacement, 16 KB alignment checks, and explicit handoff to specialized skills."
metadata:
  version: "0.1.0"
  category: "legacy-rescue"
  tags: ["android", "modernization", "upgrade", "legacy"]
  triggers:
    include: ["upgrade old android project", "fix android build after agp or kotlin bump", "replace deprecated android classes", "androidx migration and modernization", "16 kb alignment android app", "modernize legacy android architecture", "android-modernization-upgrade skill", "agp or kotlin bump legacy android", "support library to androidx migration android"]
    exclude: ["brand new compose screen", "single room dao query", "one release note summary", "kotlin cleanup in android app", "sealed classes for ui state"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---
# Android Modernization Upgrade

## When To Use
- Use this skill when the request is about: upgrade old android project, fix android build after agp or kotlin bump, replace deprecated android classes.
- Primary outcome: Bring very old Android projects to a current supported baseline with staged upgrades, deprecated API replacement, 16 KB alignment checks, and explicit handoff to specialized skills.
- Purpose: end-to-end guidance for bringing very old Android projects to a current supported baseline.
- Reach for this skill when the request is repo-wide compatibility and staged upgrade sequencing, not isolated Kotlin cleanup or one-library refactoring.
- Trigger language: requests about upgrading old Android codebases, fixing breakage after version bumps, migrating deprecated Android patterns, replacing deprecated classes, resolving old Gradle/AGP/Kotlin issues, handling 16 KB alignment, or modernizing architecture/setup.
- Handoff skills when the scope expands:
- `android-gradle-build-logic`
- `android-viewsystem-foundations`
- `android-compose-xml-interoperability`
- `android-security-best-practices`
- `android-performance-observability`
- `android-rxjava-to-coroutines-migration`

## Responsibilities
- Diagnose the repository shape: AGP, Gradle, Kotlin, AndroidX/support libraries, SDK levels, native artifacts, and deprecated APIs/classes.
- Generate a safe upgrade sequence instead of bumping everything at once.
- Branch the migration path for Compose-heavy, View-system, and mixed interoperability projects.
- Replace deprecated imports and classes when the fix is deterministic; otherwise emit an explicit remediation item.
- Verify native packaging and 16 KB alignment readiness before release.
- Hand off focused follow-up work to the right specialized Android skills once the main upgrade blockers are isolated.

## Workflow
1. Scan the project to understand toolchain age, AndroidX status, native packaging, and deprecated APIs.
2. Generate an ordered modernization plan that isolates mechanical fixes from risky semantic changes.
3. Apply deterministic upgrades in small stages and rerun build, test, and lint after each stage.
4. Route remaining failures to the owning specialized skills with exact issue signatures and file paths, including RxJava chains that should move to the dedicated migration skill.
5. Produce a final remediation report that leaves no hidden migration debt.

## Automation Modes
- `audit`: inspect the repo and emit a structured diagnosis report without editing files.
- `safe-apply`: perform deterministic edits such as repository cleanup, version bumps, obvious support-library replacements, manifest normalization, and straightforward deprecated API replacements.
- `report`: summarize unresolved blockers, file paths, issue signatures, and the next specialized skill to use.

## Guardrails
- Only auto-apply changes that are deterministic and reviewable.
- Preserve working behavior whenever a migration can be staged instead of rewritten.
- Treat AGP, Gradle, Kotlin, SDK, AndroidX, and native packaging as one compatibility graph.
- Never silently drop deprecated behavior without documenting the replacement and verification path.

## Anti-Patterns
- Bumping every version at once with no staged validation.
- Applying Compose migration advice to a legacy View-only app by default.
- Ignoring native libraries, ABI packaging, or page-size alignment in old apps.
- Calling a project modernized while deprecated classes and support libraries still ship.

## Required Tooling
- `scripts/scan_project.py`
- `scripts/build_compat_matrix.py`
- `scripts/generate_remediation_checklist.py`
- `scripts/apply_safe_upgrades.py`
- `scripts/check_16kb_alignment.py`

## Required References
- `references/agp-upgrade-notes.md`
- `references/kotlin-compatibility.md`
- `references/androidx-migration.md`
- `references/gradle-compatibility.md`
- `references/sdk-behavior-changes.md`
- `references/jetpack-release-notes.md`
- `references/deprecated-replacements.md`
- `references/upgrade-matrix.md`
- `references/issue-signature-catalog.md`

## Examples
### Happy path
- Scenario: Scan a support-library era project and generate an ordered upgrade checklist.
- Command: `python3 skills/android-modernization-upgrade/scripts/scan_project.py examples/fixtures/legacy-support-app`

### Edge case
- Scenario: Recover a project stuck between old AGP and Kotlin versions and verify staged fixes.
- Command: `python3 skills/android-modernization-upgrade/scripts/generate_remediation_checklist.py examples/fixtures/legacy-mismatch-app`

### Failure recovery
- Scenario: Auto-detect native packaging and 16 KB alignment issues before release.
- Command: `python3 skills/android-modernization-upgrade/scripts/check_16kb_alignment.py examples/fixtures/native-misaligned-app/app-release.apk`

## Done Checklist
- The implementation path is explicit, minimal, and tied to the right Android surface.
- Relevant example commands and benchmark prompts have been exercised or updated.
- Handoffs to adjacent skills are documented when the request crosses boundaries.
- Official references cover the chosen pattern and the main migration or troubleshooting path.
- Known safe fixes are applied automatically; ambiguous migrations are reported instead of silently changed.
- Deprecated classes are replaced or listed with exact file paths and replacement guidance.
- 16 KB alignment is verified, or the exact third-party/native blocker is called out.

## Official References
- [https://developer.android.com/build/releases/gradle-plugin](https://developer.android.com/build/releases/gradle-plugin)
- [https://developer.android.com/build/kotlin-support](https://developer.android.com/build/kotlin-support)
- [https://developer.android.com/jetpack/androidx/migrate](https://developer.android.com/jetpack/androidx/migrate)
- [https://developer.android.com/build/migrate-to-built-in-kotlin](https://developer.android.com/build/migrate-to-built-in-kotlin)
