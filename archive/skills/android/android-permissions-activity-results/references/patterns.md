# Android Permissions Activity Results Patterns

## Selection Notes
- Category: `product`
- Best fit when the request matches the trigger language in `SKILL.md` and the implementation focus is `Use modern permission requests, Activity Result APIs, and capability-gated UX in Android flows.`
- Reach for neighboring skills only after this skill has framed the main problem.

## Capability Matrix
- Import user photos or videos:
  Prefer: Photo Picker (`PickVisualMedia`) before requesting media-library permissions.
- Open or create a user document:
  Prefer: SAF contracts such as `OpenDocument` or `CreateDocument`.
- Capture a photo or video to your app-owned URI:
  Prefer: `TakePicture` or `CaptureVideo` with app-owned storage.
- Post notifications:
  Prefer: contextual opt-in tied to user value, plus graceful fallback if `POST_NOTIFICATIONS` is denied.

## Default Review Sequence
1. Start from the user task and the smallest capability surface.
2. Choose the Activity Result contract or permission API that matches that task.
3. Model denial, limited access, settings recovery, and API-level differences before implementation.
4. Re-check capability after settings or picker returns.
5. Hand off media-sharing or testing depth only after the contract choice is settled.

## Android-Specific Notes
- Android 13 introduced `POST_NOTIFICATIONS`; the app must keep working if the user declines it.
- Android 14 selected-photos access can produce limited media grants, so the code must not assume full gallery access.
- Approximate, background, and one-time location flows are separate concerns even when they share a domain feature.
- Launchers should live in a stable lifecycle owner and be triggered from user intent or an explicit side effect.

## Handoff Shortlist
- `android-media-files-sharing`
- `android-testing-ui`
