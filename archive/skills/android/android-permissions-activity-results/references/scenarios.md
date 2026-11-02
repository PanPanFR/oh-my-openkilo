# Android Permissions Activity Results Runnable Scenarios

## Happy path
- Goal: Inspect the repo for Activity Result contracts and permission launch points before changing a flow.
- Command: `rg -n "rememberLauncherForActivityResult|RequestPermission|RequestMultiplePermissions|PickVisualMedia|OpenDocument|TakePicture" examples`

## Edge case
- Goal: Review API-level-sensitive media and notification permission code paths.
- Command: `rg -n "POST_NOTIFICATIONS|READ_MEDIA_|READ_EXTERNAL_STORAGE|PickVisualMedia" examples`

## Failure recovery
- Goal: Differentiate permission prompts from media-sharing and testing requests.
- Command: `python3 scripts/eval_triggers.py --skill android-permissions-activity-results`
