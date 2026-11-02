#!/usr/bin/env bash
    set -euo pipefail

    cat <<'EOF'
    Skill: Android ViewSystem Foundations
    Canonical path: skills/android-viewsystem-foundations
    Example commands:
    Happy path: cd examples/orbittasks-xml && ./gradlew :app:testDebugUnitTest
Edge case: cd examples/orbittasks-xml && ./gradlew :app:connectedDebugAndroidTest
Failure recovery: python3 scripts/eval_triggers.py --skill android-viewsystem-foundations
    EOF
