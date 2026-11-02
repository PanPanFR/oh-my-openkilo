#!/usr/bin/env python3
from __future__ import annotations

import json

MATRIX = {
    'stable_baseline': {
        'agp': '9.1.0',
        'gradle': '9.3.1',
        'jdk': '17',
        'compileSdk': '36',
        'targetSdk': '36',
        'kotlin': 'built-in Kotlin (AGP 9.x) / KGP 2.2.10+',
    },
    'notes': [
        'Upgrade Gradle before AGP when crossing major plugin boundaries.',
        'Remove org.jetbrains.kotlin.android after migrating to built-in Kotlin on AGP 9.x.',
        'Move off support libraries before attempting broad Jetpack modernization.',
    ],
}

if __name__ == '__main__':
    print(json.dumps(MATRIX, indent=2, sort_keys=True))
