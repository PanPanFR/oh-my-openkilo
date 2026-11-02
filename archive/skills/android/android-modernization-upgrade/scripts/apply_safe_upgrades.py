#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

REPLACEMENTS = {
    'jcenter()': 'mavenCentral()',
    'android.support.v7.app.AppCompatActivity': 'androidx.appcompat.app.AppCompatActivity',
    'android.support.v4.app.Fragment': 'androidx.fragment.app.Fragment',
    'android.support.v4.app.FragmentActivity': 'androidx.fragment.app.FragmentActivity',
    'android.support.v4.content.FileProvider': 'androidx.core.content.FileProvider',
    'android.arch.lifecycle.ViewModel': 'androidx.lifecycle.ViewModel',
    'android.arch.lifecycle.LiveData': 'androidx.lifecycle.LiveData',
    'android.arch.lifecycle.MutableLiveData': 'androidx.lifecycle.MutableLiveData',
    'android.arch.persistence.room': 'androidx.room',
    'kotlinx.android.synthetic': '// TODO(android-modernization-upgrade): replace synthetic imports with ViewBinding',
}
KOTLIN_PLUGIN_LINES = [
    re.compile(r'^\s*id\s*\(\s*"org\.jetbrains\.kotlin\.android"\s*\)\s+version\s+"[^"]+"\s+apply\s+false\s*$', re.MULTILINE),
    re.compile(r"^\s*id\s+'org\.jetbrains\.kotlin\.android'\s+version\s+'[^']+'\s+apply\s+false\s*$", re.MULTILINE),
    re.compile(r'^\s*id\s*\(\s*"org\.jetbrains\.kotlin\.android"\s*\)\s*$', re.MULTILINE),
    re.compile(r"^\s*id\s+'org\.jetbrains\.kotlin\.android'\s*$", re.MULTILINE),
    re.compile(r'^\s*apply\s+plugin:\s*["\']org\.jetbrains\.kotlin\.android["\']\s*$', re.MULTILINE),
    re.compile(r'^\s*apply\s+plugin:\s*["\']kotlin-android["\']\s*$', re.MULTILINE),
]
AGP_9_SIGNAL = re.compile(
    r'com\.android\.tools\.build:gradle:9\.[0-9.]+'
    r'|id\s+[\'"]com\.android\.[^\'"]+[\'"]\s+version\s+[\'"]9\.[0-9.]+[\'"]'
    r'|id\(\s*[\'"]com\.android\.[^\'"]+[\'"]\s*\)\s+version\s+[\'"]9\.[0-9.]+[\'"]'
)
KOTLIN_OPTIONS_BLOCK = re.compile(r'\n\s*kotlinOptions\s*\{\n(?:.*\n)*?\s*\}', re.MULTILINE)


def normalize_sdk_levels(text: str) -> str:
    text = re.sub(r'compileSdkVersion\s+([0-9]+)', 'compileSdkVersion 36', text)
    text = re.sub(r'compileSdk\s*=\s*([0-9]+)', 'compileSdk = 36', text)
    text = re.sub(r'targetSdkVersion\s+([0-9]+)', 'targetSdkVersion 36', text)
    text = re.sub(r'targetSdk\s*=\s*([0-9]+)', 'targetSdk = 36', text)
    return text


def remove_obsolete_kotlin_plugin(text: str, built_in_kotlin: bool) -> str:
    if not built_in_kotlin:
        return text
    for pattern in KOTLIN_PLUGIN_LINES:
        text = pattern.sub(
            '// android-modernization-upgrade: remove org.jetbrains.kotlin.android after confirming built-in Kotlin migration',
            text,
        )
    return text


def remove_obsolete_kotlin_options(text: str, built_in_kotlin: bool) -> str:
    if not built_in_kotlin:
        return text
    return KOTLIN_OPTIONS_BLOCK.sub(
        '\n  // android-modernization-upgrade: migrate kotlinOptions to the AGP 9 built-in Kotlin DSL if custom compiler flags are still required',
        text,
    )


def normalize_namespace(path: Path, text: str) -> str:
    if path.suffix not in {'.gradle', '.kts'} or 'namespace' in text:
        return text
    manifest = path.parent / 'src' / 'main' / 'AndroidManifest.xml'
    if not manifest.exists():
        return text
    manifest_text = manifest.read_text(encoding='utf-8')
    match = re.search(r'package="([^"]+)"', manifest_text)
    if not match or 'android {' not in text:
        return text
    namespace_line = f'    namespace = "{match.group(1)}"\n'
    return text.replace('android {\n', 'android {\n' + namespace_line, 1)


def project_uses_built_in_kotlin(project: Path) -> bool:
    for path in project.rglob('*'):
        if path.suffix not in {'.gradle', '.kts'}:
            continue
        try:
            if AGP_9_SIGNAL.search(path.read_text(encoding='utf-8')):
                return True
        except Exception:
            continue
    return False


def apply_text_replacements(path: Path, built_in_kotlin: bool) -> bool:
    text = path.read_text(encoding='utf-8')
    original = text
    for before, after in REPLACEMENTS.items():
        text = text.replace(before, after)
    text = normalize_sdk_levels(text)
    text = remove_obsolete_kotlin_plugin(text, built_in_kotlin)
    text = remove_obsolete_kotlin_options(text, built_in_kotlin)
    text = normalize_namespace(path, text)
    if text != original:
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description='Apply deterministic safe upgrades to an Android project.')
    parser.add_argument('project', type=Path)
    args = parser.parse_args()

    built_in_kotlin = project_uses_built_in_kotlin(args.project)
    changed: list[str] = []
    for path in args.project.rglob('*'):
        if path.suffix in {'.gradle', '.kts', '.kt', '.java', '.xml', '.properties'}:
            try:
                if apply_text_replacements(path, built_in_kotlin):
                    changed.append(str(path))
            except Exception:
                continue
    print(json.dumps({'built_in_kotlin': built_in_kotlin, 'changed_files': changed}, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
