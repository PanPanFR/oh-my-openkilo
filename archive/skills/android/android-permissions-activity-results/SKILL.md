---
name: "android-permissions-activity-results"
description: "Use modern permission requests, Activity Result APIs, and capability-gated UX in Android flows."
metadata:
  version: "0.1.0"
  category: "product"
  tags: ["android", "permissions", "activity-result", "capabilities"]
  triggers:
    include: ["android permission request flow", "activity result api android", "camera permission in android app", "photo picker or permission android", "permission denied recovery"]
    exclude: ["deeplink back stack only", "release signing only", "room transaction only"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---
# Android Permissions Activity Results

## When To Use
- Use this skill when the request is about: android permission request flow, activity result api android, camera permission in android app.
- Primary outcome: Use modern permission requests, Activity Result APIs, and capability-gated UX in Android flows.
- Read `references/patterns.md` when you need the picker-vs-permission matrix or API-level behavior checklist.
- Read `references/scenarios.md` for photo picker, notification permission, and limited media access examples.
- Handoff skills when the scope expands:
- `android-media-files-sharing`
- `android-testing-ui`

## Workflow
1. Start with the capability the user needs, not the permission name: photo picker, document picker, camera capture, or notification opt-in often avoids broader runtime permissions.
2. Choose the right Activity Result contract and keep the launcher in a stable lifecycle owner such as an activity, fragment, or remembered Compose launcher.
3. Model the full permission state space explicitly: granted, denied, permanently denied, limited/selected access, one-time access, and settings-based recovery.
4. Account for API-level differences such as `POST_NOTIFICATIONS` on Android 13+, approximate vs precise location, background location as a separate flow, and Android 14 selected-photos access.
5. Re-check capability on return from settings or picker flows, then validate rotation, process death, and denial recovery instead of assuming the happy path.

## Guardrails
- Treat loading, empty, error, offline, and permission-denied states as first-class UI states.
- Do not launch permission or picker contracts directly from composition without a user action or explicit side effect.
- Prefer the narrowest capability surface available, such as Photo Picker or SAF, over broad storage permissions.
- Keep permission recovery testable: rationale, settings redirect, denied state, and post-return revalidation.

## Anti-Patterns
- Assuming the happy path is enough for product flows.
- Repeatedly re-prompting after denial instead of offering a clear settings or alternate-path recovery.
- Requesting media or storage access when the Photo Picker or document contracts are enough.
- Treating Android 14 selected-photos access as full media-library access.

## Review Focus
- Can the feature use a picker or contract instead of a runtime permission?
- Does the flow handle denial, limited access, and return-from-settings correctly?
- Are permission launches owned by the right lifecycle scope and initiated at the right time?
- Are platform-specific behaviors called out for Android 13+ and Android 14+ where relevant?

## Examples
### Happy path
- Scenario: Find the repo's Activity Result and permission surfaces before proposing a flow change.
- Command: `rg -n "rememberLauncherForActivityResult|RequestPermission|RequestMultiplePermissions|PickVisualMedia|OpenDocument|TakePicture" examples`

### Edge case
- Scenario: Review notification and media access paths for API-level-specific behavior.
- Command: `rg -n "POST_NOTIFICATIONS|READ_MEDIA_|READ_EXTERNAL_STORAGE|PickVisualMedia" examples`

### Failure recovery
- Scenario: Differentiate permission prompts from media-sharing and testing requests.
- Command: `python3 scripts/eval_triggers.py --skill android-permissions-activity-results`

## Done Checklist
- The chosen contract or picker is narrower than a broad permission where possible.
- Denied, permanently denied, limited, and settings-return states are all modeled.
- API-level differences are called out for the affected Android versions.
- Recovery UI and observability are explicit instead of implied.

## Official References
- [https://developer.android.com/training/permissions/requesting](https://developer.android.com/training/permissions/requesting)
- [https://developer.android.com/training/basics/intents/result](https://developer.android.com/training/basics/intents/result)
- [https://developer.android.com/training/data-storage/shared/photopicker](https://developer.android.com/training/data-storage/shared/photopicker)
- [https://developer.android.com/about/versions/14/changes/partial-photo-video-access](https://developer.android.com/about/versions/14/changes/partial-photo-video-access)
- [https://developer.android.com/develop/ui/views/notifications/notification-permission](https://developer.android.com/develop/ui/views/notifications/notification-permission)
- [https://developer.android.com/privacy-and-security/minimize-permission-requests](https://developer.android.com/privacy-and-security/minimize-permission-requests)
