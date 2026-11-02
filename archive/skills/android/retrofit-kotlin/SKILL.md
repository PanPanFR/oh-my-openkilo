---
name: retrofit-kotlin
description: Expert guidance on configuring Retrofit + OkHttp + kotlinx.serialization for Kotlin Android — interceptors, auth refresh, retries, error mapping, and test doubles. Use this for any networking setup.
---

# Retrofit + OkHttp + kotlinx.serialization

## Instructions

### 1. Dependencies

```kotlin
dependencies {
    implementation(libs.retrofit)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.serialization.json)
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")
}
plugins { alias(libs.plugins.kotlin.serialization) }
```

### 2. JSON Configuration

```kotlin
val json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
    encodeDefaults = true
    isLenient = false
    coerceInputValues = true  // map mismatched primitives to default values
}
```

`ignoreUnknownKeys = true` is essential — backends add fields without notice. `explicitNulls = false` keeps request payloads clean.

### 3. OkHttp Client with Interceptors

```kotlin
fun buildOkHttp(auth: AuthInterceptor, logging: HttpLoggingInterceptor): OkHttpClient =
    OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .addInterceptor(HeaderInterceptor(appVersion))
        .addInterceptor(auth)
        .addInterceptor(logging.apply { level = if (BuildConfig.DEBUG) BODY else NONE })
        .build()

class HeaderInterceptor(private val appVersion: String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response =
        chain.proceed(
            chain.request().newBuilder()
                .header("Accept", "application/json")
                .header("User-Agent", "MyApp/$appVersion (${Build.MODEL}; Android ${Build.VERSION.RELEASE})")
                .build()
        )
}
```

### 4. Retrofit Setup

```kotlin
fun buildRetrofit(client: OkHttpClient, json: Json): Retrofit =
    Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

interface ArticleApi {
    @GET("v1/articles")
    suspend fun getArticles(@Query("page") page: Int = 1): List<ArticleDto>

    @GET("v1/articles/{id}")
    suspend fun getArticle(@Path("id") id: String): ArticleDto

    @POST("v1/articles/{id}/bookmarks")
    suspend fun bookmark(@Path("id") id: String): Response<Unit>
}
```

Use `suspend fun` directly; Retrofit unwraps to the response type or throws `HttpException` / `IOException`. Only wrap in `Response<T>` when you need headers or status codes.

### 5. Auth with Token Refresh — `Authenticator`

```kotlin
class TokenAuthenticator(
    private val tokenStore: TokenStore,
    private val refresh: RefreshTokenUseCase,
) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        if (responseCount(response) >= 2) return null          // stop retry loops
        val newToken = runBlocking { refresh() } ?: return null
        tokenStore.save(newToken)
        return response.request.newBuilder()
            .header("Authorization", "Bearer ${newToken.access}")
            .build()
    }
    private fun responseCount(r: Response): Int {
        var result = 1; var cur = r.priorResponse
        while (cur != null) { result++; cur = cur.priorResponse }
        return result
    }
}
```

Register on the `OkHttpClient.Builder()` with `.authenticator(TokenAuthenticator(...))`. OkHttp calls it only on **401**, and only on the original failing request.

The `AuthInterceptor` itself stays simple:

```kotlin
class AuthInterceptor(private val store: TokenStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val req = chain.request()
        val token = store.current ?: return chain.proceed(req)
        return chain.proceed(req.newBuilder().header("Authorization", "Bearer ${token.access}").build())
    }
}
```

### 6. Retry with Exponential Backoff

```kotlin
class RetryInterceptor(private val max: Int = 3) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var attempt = 0
        while (true) {
            val response = try { chain.proceed(chain.request()) } catch (e: IOException) {
                if (++attempt >= max) throw e
                Thread.sleep(backoffMs(attempt)); continue
            }
            if (response.code !in 500..599 || ++attempt >= max) return response
            response.close()
            Thread.sleep(backoffMs(attempt))
        }
    }
    private fun backoffMs(attempt: Int) = (200L * (1L shl (attempt - 1))).coerceAtMost(3_000L)
}
```

Apply only to idempotent requests (`GET`/`PUT`/`DELETE`). For `POST`, prefer repository-level retry with an idempotency key.

### 7. Error Mapping at the Repository Boundary

```kotlin
sealed interface ApiError {
    data object Network : ApiError
    data class Http(val code: Int, val body: String?) : ApiError
    data class Unknown(val cause: Throwable) : ApiError
}

suspend fun <T> apiCall(block: suspend () -> T): Result<T> = runCatching { block() }
    .recoverCatching { e ->
        throw when (e) {
            is IOException     -> ApiException(ApiError.Network)
            is HttpException   -> ApiException(ApiError.Http(e.code(), e.response()?.errorBody()?.string()))
            else               -> ApiException(ApiError.Unknown(e))
        }
    }
```

### 8. Hilt Wiring

```kotlin
@Module @InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton fun provideJson(): Json = Json { ignoreUnknownKeys = true; explicitNulls = false }

    @Provides @Singleton
    fun provideClient(auth: AuthInterceptor, authn: TokenAuthenticator): OkHttpClient =
        buildOkHttp(auth, HttpLoggingInterceptor()).newBuilder().authenticator(authn).build()

    @Provides @Singleton
    fun provideRetrofit(client: OkHttpClient, json: Json): Retrofit = buildRetrofit(client, json)

    @Provides @Singleton
    fun provideArticleApi(r: Retrofit): ArticleApi = r.create()
}
```

### 9. Testing with MockWebServer

```kotlin
class ArticleApiTest {
    private val server = MockWebServer()

    @BeforeEach fun up()   { server.start() }
    @AfterEach  fun down() { server.shutdown() }

    @Test fun `maps paginated response`() = runTest {
        server.enqueue(MockResponse().setBody("""[{"id":"1","title":"T","body":"B","published_at":"2026-01-01T00:00:00Z"}]"""))
        val api = buildRetrofit(OkHttpClient(), Json { ignoreUnknownKeys = true }).create(ArticleApi::class.java)
        val list = api.getArticles()
        assertEquals("1", list.first().id)
    }
}
```

## Checklist
- [ ] `kotlinx-serialization-converter` is used; no Gson/Moshi on new services.
- [ ] `Json { ignoreUnknownKeys = true; explicitNulls = false }` is the shared config.
- [ ] `AuthInterceptor` attaches bearer tokens; `Authenticator` handles 401 refresh with loop guard.
- [ ] Retries are limited and scoped to idempotent methods / 5xx responses.
- [ ] Repository maps `IOException`/`HttpException` into a sealed `ApiError` — domain never sees Retrofit types.
- [ ] HTTP logging body level is gated on `BuildConfig.DEBUG`.
- [ ] Tests use `MockWebServer`, not real endpoints.
