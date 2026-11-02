---
name: android-localization
description: Expert guidance on Android localization, res/values-*, string plurals, ICU MessageFormat, RTL layouts, and per-app locale (AppCompat 1.7 / Android 13+). Use this for any i18n / l10n task.
---

# Android Localization & Internationalization

## Instructions

### 1. Resource Directory Strategy

```
app/src/main/res/
├── values/            strings.xml (default, English)
├── values-es/         Spanish
├── values-pt-rBR/     Brazilian Portuguese (region-qualified)
├── values-ar/         Arabic (auto-RTL)
├── values-night/      dark theme overrides
└── values-w600dp/     tablet overrides
```

Rules:
- Default `values/strings.xml` is English. Never leave English strings in region-specific folders.
- Region qualifier format is `-rXX` (BCP-47 lowercase-then-r-then-uppercase region).
- Never concatenate strings in code. Use placeholders and ICU.

### 2. Plurals with ICU MessageFormat

```xml
<!-- res/values/strings.xml -->
<string name="unread_count">{count, plural,
    =0 {No unread messages}
    one {# unread message}
    other {# unread messages}
}</string>
```

Load with `getQuantityString` replacement:

```kotlin
val formatted = MessageFormat.format(
    getString(R.string.unread_count),
    mapOf("count" to count),
)
```

Use `android.icu.text.MessageFormat` (API 24+, matches our `minSdk = 24`). It handles plural, select, and gender correctly in every locale. Do **not** use the legacy `<plurals>` XML tag for new strings — ICU is more flexible.

### 3. Interpolation in Compose

```xml
<string name="greeting">Hello, %1$s!</string>
```

```kotlin
Text(stringResource(R.string.greeting, user.name))
```

For ICU patterns pass through `MessageFormat.format` and wrap in a helper:

```kotlin
@Composable
fun icuStringResource(@StringRes id: Int, vararg args: Pair<String, Any>): String {
    val template = stringResource(id)
    return remember(id, args) { MessageFormat.format(template, args.toMap()) }
}
```

### 4. Right-to-Left (RTL) Support

In `AndroidManifest.xml`:

```xml
<application android:supportsRtl="true" ... >
```

In Compose:
- Use `start`/`end` alignment (already default in Compose; `Arrangement.Start` flips automatically).
- Mirror directional icons: `Icon(Icons.AutoMirrored.Filled.ArrowBack, null)` — note the `AutoMirrored` package.
- Test with Developer Options → **Force RTL layout direction** and with Arabic (`values-ar`) locale.

### 5. Per-App Locale (Android 13+, AppCompat 1.7+)

```kotlin
// Set from Settings screen
AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags("pt-BR"))

// Read
val current = AppCompatDelegate.getApplicationLocales()[0]
```

Declare the supported set so the system can expose a per-app language picker:

```xml
<!-- res/xml/locales_config.xml -->
<locale-config xmlns:android="http://schemas.android.com/apk/res/android">
    <locale android:name="en"/>
    <locale android:name="es"/>
    <locale android:name="pt-BR"/>
    <locale android:name="ar"/>
</locale-config>
```

```xml
<application android:localeConfig="@xml/locales_config" ... >
```

For Android 12 and below, AppCompat stores the choice in a backing store and re-applies it at each Activity create.

### 6. Dates, Numbers, Currency

Never format these manually. Use `java.text.NumberFormat`, `java.text.DateFormat`, or `kotlinx.datetime` combined with the user's locale:

```kotlin
val money = NumberFormat.getCurrencyInstance(Locale.getDefault()).format(19.99)
val day   = DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.getDefault()).format(LocalDate.now())
```

### 7. Pseudolocales for Testing

Enable Developer Options → "Force pseudolocale", pick `en-XA` (accented) or `ar-XB` (RTL-bidi). This catches:
- Hard-coded English.
- Strings that overflow at +40% length.
- Layouts that don't flip for RTL.

Also add to your debug build:

```kotlin
android.defaultConfig { /* ... */ }
android.buildTypes.debug { pseudoLocalesEnabled = true }
```

### 8. Translation Workflow

- Keep `strings.xml` sorted alphabetically by key; use `translatable="false"` for non-translatable identifiers.
- Use `tools:ignore="MissingTranslation"` only for intentionally untranslated keys (e.g., brand names).
- Integrate with a TMS (Crowdin, Lokalise, Phrase) via their Gradle plugin so translators pull and push directly.

## Checklist
- [ ] `supportsRtl="true"` and a `locales_config` are declared in the manifest.
- [ ] All strings come from resources; no hard-coded English in Kotlin or XML.
- [ ] Plurals and selects use ICU `MessageFormat`.
- [ ] Directional icons use `Icons.AutoMirrored.*`.
- [ ] Dates/numbers/currency format with the current `Locale`.
- [ ] `pseudoLocalesEnabled = true` in debug builds; screens tested at `en-XA` and `ar-XB`.
- [ ] Per-app locale API is wired for Android 13+.
