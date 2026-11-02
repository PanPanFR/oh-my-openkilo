# Upgrade Matrix

| Project shape | Starting point | Target baseline | Order |
| --- | --- | --- | --- |
| Support libraries + AGP 3.x | Kotlin 1.3, JCenter, support libs | AGP 9.1, built-in Kotlin, AndroidX, Gradle 9.3.1, SDK 36 | Gradle -> AGP -> Kotlin -> AndroidX -> SDK -> libraries |
| AGP 7.x mismatch | AGP 7.x + Kotlin 1.9+ | AGP 9.1 + built-in Kotlin | Gradle -> AGP opt-in/DSL migration -> Kotlin cleanup |
| Native packaging issues | Old NDK or prebuilt `.so` artifacts | 16 KB-compatible native packaging | Validate ZIP offsets -> ELF PT_LOAD alignment -> offending dependency replacement |
