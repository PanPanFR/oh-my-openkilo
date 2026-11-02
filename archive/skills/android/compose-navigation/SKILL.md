---
name: compose-navigation
description: Expert guidance on Compose Navigation using typed routes with kotlinx.serialization, NavHost setup, deep links, and navigation-scoped ViewModels. Use this for any navigation task.
---

# Compose Navigation with Typed Routes

## Instructions

Use `androidx.navigation:navigation-compose:2.8+` with **type-safe routes** powered by `kotlinx.serialization`. String-based routes are legacy; do not introduce them in new code.

### 1. Define Routes as Serializable Objects

```kotlin
@Serializable data object HomeRoute
@Serializable data object SettingsRoute
@Serializable data class ArticleRoute(val id: String)
@Serializable data class SearchRoute(val query: String = "", val tag: String? = null)
```

Apply the `kotlin.plugin.serialization` Gradle plugin and depend on `org.jetbrains.kotlinx:kotlinx-serialization-json`.

### 2. NavHost

```kotlin
@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = HomeRoute) {
        composable<HomeRoute> {
            HomeRoute(
                onOpenArticle = { id -> navController.navigate(ArticleRoute(id)) },
                onOpenSettings = { navController.navigate(SettingsRoute) },
            )
        }
        composable<ArticleRoute> { backStack ->
            val args: ArticleRoute = backStack.toRoute()
            ArticleRoute(id = args.id, onBack = navController::popBackStack)
        }
        composable<SearchRoute> { backStack ->
            val args: SearchRoute = backStack.toRoute()
            SearchRoute(initialQuery = args.query, initialTag = args.tag)
        }
        composable<SettingsRoute> { SettingsRoute() }
    }
}
```

`backStack.toRoute<T>()` decodes the arguments type-safely.

### 3. Nested Graphs and Scopes

```kotlin
navigation<ProfileGraphRoute>(startDestination = ProfileOverviewRoute) {
    composable<ProfileOverviewRoute> { /* ... */ }
    composable<ProfileEditRoute> { /* ... */ }
}
```

Get a ViewModel scoped to the nested graph:

```kotlin
val parent = remember(backStack) { navController.getBackStackEntry(ProfileGraphRoute) }
val vm: ProfileGraphViewModel = hiltViewModel(parent)
```

### 4. Deep Links

```kotlin
composable<ArticleRoute>(
    deepLinks = listOf(navDeepLink<ArticleRoute>(basePath = "https://example.com/a")),
) { /* ... */ }
```

Declare matching `<intent-filter>` in `AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW"/>
    <category android:name="android.intent.category.DEFAULT"/>
    <category android:name="android.intent.category.BROWSABLE"/>
    <data android:scheme="https" android:host="example.com" android:pathPrefix="/a"/>
</intent-filter>
```

### 5. Passing Complex Arguments

Primitives and `@Serializable` classes work out of the box. For non-primitive types you don't own, provide a `NavType`:

```kotlin
val FilterNavType = object : NavType<Filter>(isNullableAllowed = false) {
    override fun put(bundle: Bundle, key: String, value: Filter) { bundle.putString(key, Json.encodeToString(value)) }
    override fun get(bundle: Bundle, key: String): Filter = Json.decodeFromString(bundle.getString(key)!!)
    override fun parseValue(value: String): Filter = Json.decodeFromString(Uri.decode(value))
    override fun serializeAsValue(value: Filter): String = Uri.encode(Json.encodeToString(value))
}

composable<SearchRoute>(typeMap = mapOf(typeOf<Filter>() to FilterNavType)) { /* ... */ }
```

### 6. Pop, Replace, Single-Top

```kotlin
navController.navigate(HomeRoute) {
    popUpTo(LoginRoute) { inclusive = true }
    launchSingleTop = true
}
```

### 7. Events from ViewModels

Do not hold a `NavController` in a ViewModel. Instead, expose events and let the composable layer navigate:

```kotlin
LaunchedEffect(Unit) {
    vm.events.collect { e ->
        when (e) {
            is LoginEvent.Success -> navController.navigate(HomeRoute) {
                popUpTo(LoginRoute) { inclusive = true }
            }
        }
    }
}
```

### 8. Back Handling

```kotlin
BackHandler(enabled = state.hasUnsaved) { showLeaveDialog = true }
```

## Checklist
- [ ] All routes are `@Serializable` objects/classes — no string route templates.
- [ ] `kotlinx-serialization` plugin applied in the module.
- [ ] `NavHost` start destination is a route instance, not a string.
- [ ] Deep-link domains are verified in `AndroidManifest.xml` with `android:autoVerify="true"`.
- [ ] ViewModels signal navigation via events; composables call `navController`.
- [ ] Nested graphs use `getBackStackEntry(GraphRoute)` for scoped `hiltViewModel`.
