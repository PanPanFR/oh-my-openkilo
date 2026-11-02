# Android WorkManager Notifications Patterns

## Selection Notes
- Category: `data-platform`
- Best fit when the request matches the trigger language in `SKILL.md` and the implementation focus is `Schedule reliable background work, reminders, and notification delivery with WorkManager and Android execution limits.`
- Reach for neighboring skills only after this skill has framed the main problem.

## API Choice Matrix
- Deferrable, guaranteed work:
  Prefer: WorkManager.
- User-visible ongoing task that must keep running immediately:
  Prefer: foreground service with the correct service type.
- Exact wall-clock alarm:
  Prefer: alarm APIs only when the timing really must be exact and platform policy allows it.
- User-initiated transfer or upload:
  Check whether a user-initiated data transfer or foreground flow is a better fit than generic background work.

## Default Review Sequence
1. Choose the execution API before writing worker code.
2. Model unique names, input contracts, constraints, retry, and cancellation explicitly.
3. Make the worker idempotent and safe to rerun.
4. Treat notifications and permission decline as part of the feature flow.
5. Validate process death, reboot, and duplicate scheduling.

## Best-Practice Notes
- Periodic work is not an exact-timing API.
- Expedited work is best reserved for urgent, user-value work and still needs graceful fallback.
- Network constraints should be paired with the permissions those constraints require on current Android versions.
- Reminder features often need both background-work correctness and product-level notification recovery UX.

## Handoff Shortlist
- `android-permissions-activity-results`
- `android-performance-observability`
