# Android WorkManager Notifications Runnable Scenarios

## Happy path
- Goal: Inspect the current background-work and notification surfaces before changing a scheduling flow.
- Command: `rg -n "WorkManager|Worker|enqueueUnique|PeriodicWorkRequest|NotificationChannel|POST_NOTIFICATIONS" examples`

## Edge case
- Goal: Review platform-sensitive scheduling paths such as expedited, exact-alarm, or network-constrained work.
- Command: `rg -n "setExpedited|setRequiredNetworkType|AlarmManager|ForegroundInfo" examples`

## Failure recovery
- Goal: Disambiguate WorkManager requests from permission prompts and performance work.
- Command: `python3 scripts/eval_triggers.py --skill android-workmanager-notifications`
