---
name: compose-images
description: Expert guidance on loading and displaying images in Compose using Coil 3, including placeholders, error fallbacks, caching, and memory tuning. Use this for any image-loading task.
---

# Images in Compose with Coil 3

## Instructions

Use **Coil 3** (`io.coil-kt.coil3:coil-compose`). It is Kotlin-first, coroutine-native, supports multiplatform, and targets `AsyncImagePainter` directly.

### 1. Gradle Setup

```kotlin
dependencies {
    implementation("io.coil-kt.coil3:coil-compose:3.0.4")
    implementation("io.coil-kt.coil3:coil-network-okhttp:3.0.4")
    implementation("io.coil-kt.coil3:coil-gif:3.0.4")       // animated GIFs
    implementation("io.coil-kt.coil3:coil-svg:3.0.4")       // SVG decoder
}
```

### 2. App-Wide ImageLoader

Configure a single `ImageLoader` in your `Application` and expose it to Coil:

```kotlin
class MyApp : Application(), SingletonImageLoader.Factory {
    override fun newImageLoader(context: PlatformContext): ImageLoader =
        ImageLoader.Builder(context)
            .crossfade(true)
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, percent = 0.20) // 20% of available memory
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(context.cacheDir.resolve("image_cache").toOkioPath())
                    .maxSizeBytes(50L * 1024 * 1024) // 50 MB
                    .build()
            }
            .components {
                add(OkHttpNetworkFetcherFactory(callFactory = { buildOkHttpClient() }))
            }
            .build()
}
```

### 3. `AsyncImage` Basics

```kotlin
AsyncImage(
    model = article.coverUrl,
    contentDescription = article.title,
    modifier = Modifier
        .fillMaxWidth()
        .aspectRatio(16f / 9f)
        .clip(MaterialTheme.shapes.medium),
    contentScale = ContentScale.Crop,
    placeholder = painterResource(R.drawable.img_placeholder),
    error = painterResource(R.drawable.img_error),
)
```

Always set `contentDescription` (null only for purely decorative images). Always specify a fixed size or aspect ratio so Coil can downsample — this is the single biggest memory win.

### 4. Request with Full Builder

```kotlin
val request = remember(article.coverUrl) {
    ImageRequest.Builder(ctx)
        .data(article.coverUrl)
        .crossfade(200)
        .memoryCacheKey(article.coverUrl)
        .diskCacheKey(article.coverUrl)
        .size(Size.ORIGINAL) // or Size(width, height) for explicit resize
        .build()
}

AsyncImage(model = request, contentDescription = article.title, modifier = Modifier.fillMaxWidth())
```

### 5. State-Aware UI with `rememberAsyncImagePainter`

```kotlin
val painter = rememberAsyncImagePainter(article.coverUrl)
val state = painter.state.collectAsState().value

Box(Modifier.aspectRatio(1f)) {
    Image(painter = painter, contentDescription = null, modifier = Modifier.matchParentSize())
    if (state is AsyncImagePainter.State.Loading) {
        CircularProgressIndicator(Modifier.align(Alignment.Center))
    }
}
```

### 6. Precaching

```kotlin
suspend fun precache(urls: List<String>, loader: ImageLoader, ctx: Context) {
    urls.forEach { url ->
        loader.execute(ImageRequest.Builder(ctx).data(url).build())
    }
}
```

Call from a `ViewModel` during idle time or a `WorkManager` job for images you'll need next.

### 7. Memory Tuning & Anti-Patterns

- **Do** size-down to the actual display size. Downloading a 4000×3000 JPEG to a 96 dp avatar is the #1 OOM source.
- **Do** use `contentScale = ContentScale.Crop` + `.clip(CircleShape)` for avatars.
- **Don't** decode large images on the main dispatcher; Coil already handles this but avoid `BitmapFactory.decodeFile` manually.
- **Don't** stuff images into `@Immutable` state holders; pass URLs (Strings) and let Coil manage bitmap lifecycle.

### 8. Animated Content

Enable the `coil-gif` component and use the standard `AsyncImage` — it plays automatically. For very large sprites or LOTTIE-style animation, prefer `androidx.compose.animation.graphics` or the Lottie Compose library.

## Checklist
- [ ] Exactly one `ImageLoader` is configured application-wide.
- [ ] Every `AsyncImage` has a bounded size or aspect ratio.
- [ ] `contentDescription` is meaningful, or explicitly `null` for decorative images.
- [ ] `placeholder` and `error` are provided for user-facing images.
- [ ] Disk cache size is capped (typical 50 MB).
- [ ] No custom `BitmapFactory` decoding on the main thread.
