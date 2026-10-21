#!/usr/bin/env python3
"""WCAG 2.x contrast checker for antislop.

Usage:
    python contrast-check.py "#FFFFFF" "#777777"
    python contrast-check.py FFFFFF 777777
    python contrast-check.py --selftest
"""

import os
import re
import sys

NAMED_COLORS = {"black": (0, 0, 0), "white": (255, 255, 255)}


def parse_hex(value):
    value = value.strip().lstrip("#")
    if len(value) == 3:
        value = "".join(ch * 2 for ch in value)
    if not re.fullmatch(r"[0-9A-Fa-f]{6}", value):
        raise ValueError(f"expected a hex color like #FFFFFF, got {value!r}")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def parse_pairing(pairing):
    colors = []
    for token in re.split(r"\s+on\s+", pairing):
        token = token.strip()
        match = re.search(r"#[0-9A-Fa-f]{3,6}", token)
        if match:
            colors.append(parse_hex(match.group(0)))
        elif token.lower() in NAMED_COLORS:
            colors.append(NAMED_COLORS[token.lower()])
        else:
            raise ValueError(f"cannot parse {token!r} from pairing {pairing!r}")
    if len(colors) != 2:
        raise ValueError(f"expected two colors in pairing {pairing!r}")
    return tuple(colors)


def linearize(channel):
    c = channel / 255.0
    if c <= 0.03928:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (linearize(ch) for ch in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(color_a, color_b):
    lum_a, lum_b = luminance(color_a), luminance(color_b)
    lighter, darker = sorted((lum_a, lum_b), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def selftest():
    test_cases = [
        ("black", "white", 21.0, True, True),
        ("white", "#333333", 12.63, True, True),
        ("white", "#666666", 5.74, True, True),
        ("#777777", "white", 4.48, False, True),
        ("white", "#888888", 3.54, False, True),
        ("white", "#999999", 2.85, False, False),
        ("#555555", "black", 2.82, False, False),
    ]
    for c1, c2, exp_ratio, exp_norm, exp_lg in test_cases:
        ratio = round(contrast_ratio(parse_pairing(f"{c1} on {c2}")[0], parse_pairing(f"{c1} on {c2}")[1]), 2)
        norm = ratio >= 4.5
        lg = ratio >= 3.0
        if abs(ratio - exp_ratio) > 0.05 or norm != exp_norm or lg != exp_lg:
            print(f"selftest failed on {c1} on {c2}: got {ratio} (norm:{norm}, lg:{lg})")
            return 1
    print("selftest: all reference pairs OK")
    return 0


def main(argv):
    if len(argv) == 1 and argv[0] == "--selftest":
        return selftest()
    if len(argv) != 2:
        print("usage: python contrast-check.py <hex1> <hex2> | --selftest")
        return 2
    try:
        ratio = contrast_ratio(parse_hex(argv[0]), parse_hex(argv[1]))
    except ValueError as exc:
        print(f"error: {exc}")
        return 2

    normal = ratio >= 4.5
    large = ratio >= 3.0
    print(f"ratio: {ratio:.2f}:1")
    print(f"normal text (4.5:1): {'PASS' if normal else 'FAIL'}")
    print(f"large text  (3.0:1): {'PASS' if large else 'FAIL'}")
    return 0 if normal and large else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
