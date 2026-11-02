#!/usr/bin/env bash
    set -euo pipefail

    cat <<'EOF'
    Skill: Android Security Best Practices
    Canonical path: skills/android-security-best-practices
    Example commands:
    Happy path: python3 scripts/eval_triggers.py --skill android-security-best-practices
Edge case: cd examples/orbittasks-compose && ./gradlew :app:assembleDebug
Failure recovery: cd examples/orbittasks-xml && ./gradlew :app:assembleDebug
    EOF
