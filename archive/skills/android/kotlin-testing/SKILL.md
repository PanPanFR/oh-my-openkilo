---
name: kotlin-testing
description: Expert guidance on Kotlin unit testing with JUnit 5, MockK, kotlinx-coroutines-test, Turbine, and fluent assertion libraries. Use this when writing or reviewing unit tests.
---

# Kotlin Unit Testing (JUnit 5 + MockK + Turbine)

## Instructions

### 1. Dependencies

```kotlin
dependencies {
    testImplementation(platform("org.junit:junit-bom:5.11.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
    testImplementation("io.mockk:mockk:1.13.13")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    testImplementation("app.cash.turbine:turbine:1.2.0")
    testImplementation("com.willowtreeapps.assertk:assertk:0.28.1")
}

tasks.withType<Test>().configureEach { useJUnitPlatform() }
```

### 2. Test Class Shape

```kotlin
class ArticlesViewModelTest {

    @JvmField @RegisterExtension val mainRule = MainDispatcherExtension()

    private val getArticles = mockk<GetArticlesUseCase>()
    private lateinit var vm: ArticlesViewModel

    @BeforeEach fun setUp() { vm = ArticlesViewModel(getArticles) }

    @AfterEach  fun tearDown() { clearAllMocks() }

    @Test fun `loads articles on init`() = runTest {
        coEvery { getArticles() } returns listOf(article("1"))
        vm.state.test {
            awaitItem()                                // Loading
            val loaded = awaitItem()                   // Loaded
            assertThat(loaded.articles).hasSize(1)
            cancelAndIgnoreRemainingEvents()
        }
        coVerify(exactly = 1) { getArticles() }
    }
}
```

### 3. Main Dispatcher Rule for JUnit 5

```kotlin
class MainDispatcherExtension(
    val dispatcher: TestDispatcher = StandardTestDispatcher(),
) : BeforeEachCallback, AfterEachCallback {
    override fun beforeEach(ctx: ExtensionContext) { Dispatchers.setMain(dispatcher) }
    override fun afterEach(ctx: ExtensionContext)  { Dispatchers.resetMain() }
}
```

Register per-test or at module level via `@ExtendWith(MainDispatcherExtension::class)`.

### 4. MockK Basics

```kotlin
// Value mocks
val repo = mockk<UserRepository>()
every   { repo.currentUserId() } returns "u1"            // sync
coEvery { repo.getUser("u1") }   returns fakeUser        // suspend

// Verify
verify(exactly = 1) { repo.currentUserId() }
coVerify            { repo.getUser(any()) }
verify { repo wasNot Called }

// Relaxed mocks (default returns for unstubbed methods)
val log = mockk<Logger>(relaxed = true)

// Spies (partial mocks of real instances)
val spySvc = spyk(RealService()); every { spySvc.cached() } returns "x"

// Slots (capture arguments)
val slot = slot<User>()
every { repo.save(capture(slot)) } just Runs
repo.save(fakeUser)
assertThat(slot.captured.id).isEqualTo("u1")
```

### 5. Coroutines Test Patterns

```kotlin
@Test fun `debounces search input`() = runTest {
    val vm = SearchViewModel(repo = FakeRepo, dispatcher = StandardTestDispatcher(testScheduler))
    vm.onQuery("k")
    advanceTimeBy(100); assertEquals(SearchUi.Idle, vm.state.value)
    advanceTimeBy(300); runCurrent()
    assertThat(vm.state.value).isInstanceOf(SearchUi.Loading::class)
}
```

- Use `runTest` — its scheduler virtualizes time.
- `advanceTimeBy` / `advanceUntilIdle` / `runCurrent` are your time controls.
- Inject dispatchers; don't reach for `Dispatchers.IO` inside production code called from a test.

### 6. Turbine for Flows

```kotlin
flow.test {
    assertEquals(first, awaitItem())
    assertEquals(second, awaitItem())
    awaitComplete()
}

stateFlow.test {
    skipItems(1)               // drop initial value
    vm.onClick()
    assertEquals(expected, awaitItem())
    cancelAndIgnoreRemainingEvents()
}
```

Prefer `.test { }` over collecting into a list — it asserts each item atomically and fails loudly on unexpected emissions.

### 7. Assertions — `assertk` (or `kotest`)

```kotlin
assertThat(user.name).isEqualTo("Ada")
assertThat(orders).hasSize(3).extracting { it.id }.containsExactly("a","b","c")
assertFailure { parser.parse("bad") }.isInstanceOf(ParseException::class)
```

Fluent matchers give better failure messages than `assertEquals`.

### 8. Parameterized Tests

```kotlin
@ParameterizedTest
@CsvSource(
    "0, Off",
    "25, Low",
    "60, Mid",
    "95, High",
)
fun `bucket by percent`(value: Int, expected: String) {
    assertThat(bucket(value)).isEqualTo(expected)
}
```

For tables with more than a couple of columns, prefer `@MethodSource`.

### 9. What to Test

- ViewModel `state` transitions per action.
- UseCase orchestration and error mapping.
- Repository wiring between DAO + API with **fakes**, not mocks (real Room in-memory DB via Robolectric or instrumented tests is even better).
- Mappers: DTO ↔ Entity ↔ Domain.

What **not** to test:
- Compose rendering internals (that's a UI test).
- Library behavior (Retrofit, kotlinx-serialization).
- Private helpers in isolation; test through public API.

### 10. Fakes vs Mocks

Prefer **fakes** (small in-memory implementations) over mocks for repositories and DAOs:

```kotlin
class FakeUserDao : UserDao {
    private val users = MutableStateFlow<List<UserEntity>>(emptyList())
    override fun observeAll(): Flow<List<UserEntity>> = users
    override suspend fun upsertAll(items: List<UserEntity>) { users.value = items }
}
```

Fakes are reusable across tests, don't break on refactors of call sites, and document expected behavior.

## Checklist
- [ ] JUnit 5 platform configured (`useJUnitPlatform()`).
- [ ] `MainDispatcherExtension` installs a `TestDispatcher` around each test.
- [ ] MockK is used for interfaces; `coEvery` / `coVerify` for suspend functions.
- [ ] Flows are asserted with Turbine `.test { }`.
- [ ] Assertions use `assertk` or `kotest-assertions-core`.
- [ ] Dispatchers are injected into classes under test.
- [ ] Repositories and DAOs have fakes, not only mocks.
- [ ] No hidden sleeps — time is advanced virtually via the scheduler.
