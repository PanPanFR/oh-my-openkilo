#!/usr/bin/env python3
"""Check Android APK/AAB native library 16 KB page-size compatibility.

Checks implemented:
1) APK ZIP checks: native .so entries must be uncompressed and 16 KB data-offset aligned.
2) APK/AAB ELF checks: 64-bit native libs (arm64-v8a, x86_64) must have PT_LOAD p_align >= 0x4000.
"""

from __future__ import annotations

import argparse
import struct
import sys
import zipfile
from pathlib import Path

PT_LOAD = 1
PAGE_SIZE_16K = 16384
MIN_ELF_ALIGN_64 = 0x4000
TARGET_64_ABIS = {'arm64-v8a', 'x86_64'}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Validate Android APK/AAB native library 16 KB compatibility.'
    )
    parser.add_argument('artifact', type=Path, help='Path to .apk or .aab file')
    return parser.parse_args()


def zip_entry_data_offset(artifact_path: Path, info: zipfile.ZipInfo) -> int:
    with artifact_path.open('rb') as handle:
        handle.seek(info.header_offset)
        header = handle.read(30)
        if len(header) != 30 or header[:4] != b'PK\x03\x04':
            raise ValueError(f'Invalid local ZIP header for {info.filename}')
        fields = struct.unpack('<4s5H3I2H', header)
        name_len = fields[-2]
        extra_len = fields[-1]
        return info.header_offset + 30 + name_len + extra_len


def parse_elf_load_alignments(blob: bytes) -> tuple[int | None, list[int]]:
    if blob[:4] != b'\x7fELF':
        return None, []
    ei_class = blob[4]
    ei_data = blob[5]
    if ei_data != 1:
        raise ValueError('Only little-endian ELF is supported')

    aligns: list[int] = []
    if ei_class == 1:
        e_phoff = struct.unpack_from('<I', blob, 28)[0]
        e_phentsize = struct.unpack_from('<H', blob, 42)[0]
        e_phnum = struct.unpack_from('<H', blob, 44)[0]
        for index in range(e_phnum):
            offset = e_phoff + index * e_phentsize
            p_type = struct.unpack_from('<I', blob, offset)[0]
            if p_type != PT_LOAD:
                continue
            aligns.append(struct.unpack_from('<I', blob, offset + 28)[0])
        return 32, aligns

    if ei_class == 2:
        e_phoff = struct.unpack_from('<Q', blob, 32)[0]
        e_phentsize = struct.unpack_from('<H', blob, 54)[0]
        e_phnum = struct.unpack_from('<H', blob, 56)[0]
        for index in range(e_phnum):
            offset = e_phoff + index * e_phentsize
            p_type = struct.unpack_from('<I', blob, offset)[0]
            if p_type != PT_LOAD:
                continue
            aligns.append(struct.unpack_from('<Q', blob, offset + 48)[0])
        return 64, aligns

    return None, []


def native_abi_from_zip_path(path: str) -> str | None:
    parts = path.split('/')
    if len(parts) >= 3 and parts[0] == 'lib':
        return parts[1]
    if len(parts) >= 4 and parts[0] == 'base' and parts[1] == 'lib':
        return parts[2]
    return None


def main() -> int:
    args = parse_args()
    artifact = args.artifact

    if not artifact.exists():
        print(f'FAIL: artifact not found: {artifact}')
        return 2
    if artifact.suffix not in {'.apk', '.aab'}:
        print(f'FAIL: unsupported artifact type: {artifact.suffix} (expected .apk or .aab)')
        return 2

    zip_failures: list[str] = []
    elf_failures: list[str] = []

    with zipfile.ZipFile(artifact) as archive:
        for info in archive.infolist():
            if not info.filename.endswith('.so'):
                continue
            abi = native_abi_from_zip_path(info.filename)
            if abi is None:
                continue

            if artifact.suffix == '.apk':
                if info.compress_type != zipfile.ZIP_STORED:
                    zip_failures.append(f'{info.filename}: compressed (type={info.compress_type}), expected STORED')
                data_offset = zip_entry_data_offset(artifact, info)
                if data_offset % PAGE_SIZE_16K != 0:
                    zip_failures.append(f'{info.filename}: ZIP data offset {data_offset} not 16 KB aligned')

            bits, aligns = parse_elf_load_alignments(archive.read(info))
            uniq_aligns = sorted(set(aligns))
            if abi in TARGET_64_ABIS and bits == 64:
                if any(value and value < MIN_ELF_ALIGN_64 for value in uniq_aligns):
                    joined = ', '.join(hex(value) for value in uniq_aligns)
                    elf_failures.append(f'{info.filename}: PT_LOAD p_align values {joined} need >= 0x4000')

    if zip_failures:
        print('\n'.join(zip_failures))
    if elf_failures:
        print('\n'.join(elf_failures))
    if zip_failures or elf_failures:
        print('RESULT: FAIL')
        return 1
    print('RESULT: PASS')
    return 0


if __name__ == '__main__':
    sys.exit(main())
