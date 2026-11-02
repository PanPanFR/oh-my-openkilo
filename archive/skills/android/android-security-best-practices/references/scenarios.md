# Android Security Best Practices Runnable Scenarios

## Happy path
- Goal: Inspect the examples for explicit exports, sharing contracts, and permission-protected boundaries.
- Command: `rg -n "android:exported|android:permission|FileProvider|grantUriPermissions" examples`

## Edge case
- Goal: Catch release-risky manifest defaults such as cleartext traffic, backups, or missing data extraction rules.
- Command: `rg -n "networkSecurityConfig|usesCleartextTraffic|allowBackup|fullBackupContent|dataExtractionRules" examples`

## Failure recovery
- Goal: Separate app hardening work from modernization or release automation prompts.
- Command: `python3 scripts/eval_triggers.py --skill android-security-best-practices`
