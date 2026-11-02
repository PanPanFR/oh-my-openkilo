# Android Security Best Practices Patterns

## Selection Notes
- Category: `quality-release`
- Best fit when the request matches the trigger language in `SKILL.md` and the implementation focus is `Apply Android app security guidance around secrets, storage, network trust, exported components, and least privilege.`
- Reach for neighboring skills only after this skill has framed the main problem.

## Attack-Surface Checklist
- Components: exported activities, services, receivers, providers, deep links, implicit intents.
- Storage: internal vs external files, database contents, backup and restore, cache leakage.
- Network: cleartext traffic, custom CAs, debug trust anchors, certificate pinning, auth token handling.
- UI bridges: WebView JavaScript interfaces, file upload/download bridges, clipboard or screenshot exposure.
- Observability: logs, analytics payloads, crash reports, and redaction of PII or secrets.

## Default Review Sequence
1. Start with externally reachable entry points and data boundaries before discussing libraries or implementation details.
2. Remove avoidable permissions, exports, and storage exposure before introducing compensating controls.
3. Apply Android-specific hardening: explicit component exposure, `FileProvider`, release-safe network config, immutable `PendingIntent`s, and backup rules.
4. Separate observed evidence from assumptions, especially for auth, certificate pinning, and client-side secret handling.
5. Leave a short residual-risk note whenever backend work or release-process changes are still required.

## Decision Matrix
- Client secret needed:
  Preferred: short-lived token from backend or signed request flow.
  Avoid: API keys or signing material embedded in APK resources, native libs, or assets.
- External file sharing needed:
  Preferred: `FileProvider` plus temporary URI grants.
  Avoid: file path exposure or broad storage permissions.
- Custom trust anchors needed:
  Preferred: `networkSecurityConfig` scoped to debug or the narrowest production host set.
  Avoid: global cleartext or all-host debug CAs.
- Abuse signal needed:
  Preferred: Play Integrity or similar signal as one layer in backend risk evaluation.
  Avoid: treating integrity verdicts as the sole authorization check.

## Handoff Shortlist
- `android-modernization-upgrade`
- `android-ci-cd-release-playstore`
