#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description='Generate an ordered remediation checklist for a legacy Android project.')
    parser.add_argument('project', type=Path)
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    scan = subprocess.run(
        ['python3', str(root / 'scan_project.py'), str(args.project)],
        capture_output=True,
        text=True,
        check=True,
    )
    report = json.loads(scan.stdout)

    steps: list[str] = []
    if report['repositories']:
        steps.append('Replace `jcenter()` with `mavenCentral()` and verify all artifacts resolve.')
    if report['agp_versions']:
        steps.append('Upgrade Gradle first, then move AGP in stages until reaching 9.1.0.')
    if report['kotlin_versions']:
        steps.append('Remove or migrate `org.jetbrains.kotlin.android` when adopting built-in Kotlin on AGP 9.x.')
    if report['support_library_files']:
        steps.append('Run support-to-AndroidX replacements and verify manifests, imports, and dependencies.')
    if report['deprecated_usages']:
        steps.append('Replace deprecated APIs and classes with the recommended modern alternatives.')
    if report['native_artifacts']:
        steps.append('Run 16 KB alignment checks for packaged native libraries before release.')
    steps.append('Rerun build, unit tests, lint, and instrumentation after each stage.')

    lines = ['# Ordered Remediation Checklist', '']
    for index, step in enumerate(steps, start=1):
        lines.append(f'{index}. {step}')
    print('\n'.join(lines))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
