---
name: "android-security-best-practices"
description: "Apply Android app security guidance around secrets, storage, network trust, exported components, and least privilege."
metadata:
  version: "0.1.0"
  category: "quality-release"
  tags: ["android", "security", "privacy", "hardening"]
  triggers:
    include: ["android security review", "secret handling android app", "exported component security android", "network security config android", "hardening android project"]
    exclude: ["compose animation only", "room index tuning", "play listing copy"]
  owners: ["@android-agent-skills/maintainers"]
  test_targets: ["examples/orbittasks-compose", "examples/orbittasks-xml", "benchmarks/triggers.jsonl"]
---
# Android Security Best Practices

## When To Use
- Use this skill when the request is about: android security review, secret handling android app, exported component security android.
- Primary outcome: Apply Android app security guidance around secrets, storage, network trust, exported components, and least privilege.
- Read `references/patterns.md` when you need the attack-surface checklist or the storage/network/component decision matrix.
- Read `references/scenarios.md` for manifest, backup, WebView, and release-hardening review paths.
- Handoff skills when the scope expands:
- `android-modernization-upgrade`
- `android-ci-cd-release-playstore`

## Workflow
1. Inventory the attack surface first: exported components, intent/deep link entry points, file sharing, WebView usage, local storage, logs, backups, and network trust config.
2. Remove avoidable risk before hardening details: prefer platform pickers and choosers, internal storage, server-issued short-lived tokens, and least-privilege permissions instead of shipping broad access or long-lived secrets.
3. Lock the remaining boundaries explicitly with `android:exported`, component permissions, `FileProvider`, `networkSecurityConfig`, debug-only trust anchors, and immutable `PendingIntent`s.
4. Review sensitive surfaces that often regress in Android apps: WebView JavaScript bridges, backup/data extraction rules, cleartext exceptions, log redaction, and same-developer IPC assumptions.
5. Validate the release posture with reproducible checks, then document residual risks and whether backend enforcement or Play Integrity is advisory or blocking.

## Guardrails
- Treat client-side secrets as recoverable by attackers; move trust decisions and privileged API access server-side whenever possible.
- Export components only when there is a real external caller, and permission-protect or signature-protect them when the contract is private.
- Use network security config to scope debug trust anchors or cleartext exceptions instead of broad manifest toggles.
- Redact logs, review backups, and keep sensitive data out of shared external storage by default.

## Anti-Patterns
- Hiding API keys in resources, the NDK, or obfuscation and calling that secure.
- Leaving `android:exported` or intent filters ambiguous on launchable or IPC components.
- Sharing files through raw file paths or overly broad storage permissions instead of `FileProvider` and system surfaces.
- Pinning certificates without an operational rotation story or fallback plan.

## Review Focus
- Exported activities, services, receivers, and providers with clear ownership and caller expectations.
- Secrets, tokens, and backend trust assumptions.
- Network trust, debug overrides, cleartext usage, and certificate handling.
- File sharing, backups, logs, and user-data leakage paths.
- Abuse signals such as Play Integrity only as layered defense, never as the sole authorization model.

## Examples
### Happy path
- Scenario: Audit manifests and sharing surfaces for explicit exports, permissions, and `FileProvider` usage.
- Command: `rg -n "android:exported|android:permission|FileProvider|grantUriPermissions" examples`

### Edge case
- Scenario: Catch insecure backup or network defaults before a release candidate goes out.
- Command: `rg -n "networkSecurityConfig|usesCleartextTraffic|allowBackup|fullBackupContent|dataExtractionRules" examples`

### Failure recovery
- Scenario: Separate app hardening from modernization or release-pipeline requests.
- Command: `python3 scripts/eval_triggers.py --skill android-security-best-practices`

## Done Checklist
- Every externally reachable component has explicit exposure and caller constraints.
- Secrets, tokens, and trust decisions are not relying on obscurity in the client app.
- Network, backup, logging, and sharing behavior have explicit release-safe defaults.
- Residual risks and any backend dependencies are documented with clear follow-up work.

## Official References
- [https://developer.android.com/privacy-and-security/security-best-practices](https://developer.android.com/privacy-and-security/security-best-practices)
- [https://developer.android.com/privacy-and-security/security-tips](https://developer.android.com/privacy-and-security/security-tips)
- [https://developer.android.com/privacy-and-security/risks/unsafe-exported-components](https://developer.android.com/privacy-and-security/risks/unsafe-exported-components)
- [https://developer.android.com/privacy-and-security/risks/access-control-to-exported-components](https://developer.android.com/privacy-and-security/risks/access-control-to-exported-components)
- [https://developer.android.com/privacy-and-security/security-config](https://developer.android.com/privacy-and-security/security-config)
- [https://developer.android.com/privacy-and-security/minimize-permission-requests](https://developer.android.com/privacy-and-security/minimize-permission-requests)
- [https://developer.android.com/google/play/integrity/overview](https://developer.android.com/google/play/integrity/overview)
