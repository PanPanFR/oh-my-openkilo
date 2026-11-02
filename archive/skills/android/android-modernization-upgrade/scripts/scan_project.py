#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

SUPPORT_IMPORTS = ['android.support', 'android.arch']
DEPRECATED_SIGNATURES = {
    'FragmentPagerAdapter': 'Use ViewPager2 + FragmentStateAdapter.',
    'startActivityForResult(': 'Use the Activity Result API.',
    'onActivityResult(': 'Use ActivityResultContracts and registerForActivityResult.',
    'kotlinx.android.synthetic': 'Replace with ViewBinding or Compose state.',
}
AGP_PATTERN = re.compile(
    r'com\.android\.tools\.build:gradle:([0-9.]+)'
    r'|id\s+[\'"]com\.android\.application[\'"]\s+version\s+[\'"]([0-9.]+)[\'"]'
    r'|id\(\s*[\'"]com\.android\.application[\'"]\s*\)\s+version\s+[\'"]([0-9.]+)[\'"]'
)
KOTLIN_PATTERN = re.compile(
    r'kotlin-gradle-plugin:([0-9.]+)'
    r'|id\s+[\'"]org\.jetbrains\.kotlin\.android[\'"]\s+version\s+[\'"]([0-9.]+)[\'"]'
    r'|id\(\s*[\'"]org\.jetbrains\.kotlin\.android[\'"]\s*\)\s+version\s+[\'"]([0-9.]+)[\'"]'
)
SDK_PATTERN = re.compile(r'compileSdk(?:Version)?\s*[= ]\s*"?([0-9.]+)"?|targetSdk(?:Version)?\s*[= ]\s*"?([0-9.]+)"?')


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8')
    except Exception:
        return ''


def main() -> int:
    parser = argparse.ArgumentParser(description='Scan an Android project for legacy upgrade signals.')
    parser.add_argument('project', type=Path)
    args = parser.parse_args()

    project = args.project.resolve()
    files = list(project.rglob('*'))
    gradle_files = [path for path in files if path.name.endswith(('.gradle', '.gradle.kts', 'gradle.properties'))]
    code_files = [path for path in files if path.suffix in {'.kt', '.java', '.xml'}]

    report = {
        'project': str(project),
        'agp_versions': [],
        'kotlin_versions': [],
        'repositories': [],
        'compile_sdk': [],
        'target_sdk': [],
        'uses_androidx': False,
        'support_library_files': [],
        'deprecated_usages': [],
        'native_artifacts': [],
        'compose_detected': False,
        'view_system_detected': False,
    }

    for path in gradle_files:
        text = read_text(path)
        report['compose_detected'] = report['compose_detected'] or 'compose = true' in text or 'activity-compose' in text
        report['view_system_detected'] = report['view_system_detected'] or 'viewBinding' in text or 'dataBinding' in text
        report['uses_androidx'] = report['uses_androidx'] or 'android.useAndroidX=true' in text or 'androidx.' in text
        if 'jcenter()' in text:
            report['repositories'].append({'file': str(path), 'repo': 'jcenter()'})
        for match in AGP_PATTERN.findall(text):
            for group in match:
                if group:
                    report['agp_versions'].append({'file': str(path), 'version': group})
        for match in KOTLIN_PATTERN.findall(text):
            for group in match:
                if group:
                    report['kotlin_versions'].append({'file': str(path), 'version': group})
        for compile_sdk, target_sdk in SDK_PATTERN.findall(text):
            if compile_sdk:
                report['compile_sdk'].append({'file': str(path), 'value': compile_sdk})
            if target_sdk:
                report['target_sdk'].append({'file': str(path), 'value': target_sdk})

    for path in code_files:
        text = read_text(path)
        if any(token in text for token in SUPPORT_IMPORTS):
            report['support_library_files'].append(str(path))
        for signature, replacement in DEPRECATED_SIGNATURES.items():
            if signature in text:
                report['deprecated_usages'].append({'file': str(path), 'signature': signature, 'replacement': replacement})

    for path in files:
        if path.suffix in {'.so', '.apk', '.aab'}:
            report['native_artifacts'].append(str(path))

    print(json.dumps(report, indent=2, sort_keys=True))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
