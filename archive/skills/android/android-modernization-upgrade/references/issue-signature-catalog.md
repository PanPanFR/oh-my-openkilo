# Issue Signature Catalog

- `Cannot add extension with name 'kotlin'`: remove `org.jetbrains.kotlin.android` after moving to built-in Kotlin.
- `AndroidX dependencies present but support library imports remain`: run support-to-AndroidX replacement and manifest cleanup.
- `Namespace not specified`: derive namespace from manifest package or module package and write it to the Android DSL.
- `jcenter() repository not found`: replace with `mavenCentral()` and verify artifact availability.
- `p_align values ... need >= 0x4000`: replace or rebuild the offending native library for 16 KB alignment compatibility.
