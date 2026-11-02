# Test generation (plan → generate → heal)

Author and maintain Playwright tests with `playwright-cli`. Every `playwright-cli` action emits equivalent Playwright TypeScript — that generated code is the raw material for tests.

Sections:
- **0. How generation works** — the core mechanic
- **1. Plan** — explore, produce `specs/<feature>.plan.md`
- **2. Generate** — spec → test files
- **3. Heal** — diagnose failures, fix, reconcile spec

All three lean on the same mechanic: `npx playwright test --debug=cli` in the background, then `playwright-cli attach tw-XXXX`. See `playwright-tests.md` for debug/attach mechanics.

---

## 0. How generation works

Every action prints equivalent Playwright TypeScript. Copy that code into test files.

```bash
playwright-cli open https://example.com/login
playwright-cli snapshot
# Output: e1 [textbox "Email"], e2 [textbox "Password"], e3 [button "Sign In"]

playwright-cli fill e1 "user@example.com"
# Ran Playwright code:
# await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

playwright-cli fill e2 "password123"
playwright-cli click e3
```

### Building a test file

```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/.*dashboard/);
});
```

### Use semantic locators

```typescript
// GOOD - resilient
await page.getByRole('button', { name: 'Submit' }).click();

// AVOID - fragile
await page.locator('#submit-btn').click();
```

### Explore before recording

```bash
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e5
```

### Add assertions manually

Generated code has no assertions. Add expectations with:
- `toBeVisible()` — element rendered and visible
- `toHaveText(text)` — text content matches
- `toHaveValue(value)` / `toBeEmpty()` — input value
- `toBeChecked()` / `toBeUnchecked()` — checkbox state
- `toMatchAriaSnapshot(snapshot)` — page (or locator) matches partial a11y snapshot

`playwright-cli generate-locator <target>` returns the locator expression. For text-content assertions, prefer `getByTestId()` / `getByLabel()` so the locator doesn't contain its own text — then use `toBeVisible()` over `toHaveText` for text-based locators. Snapshot for `toMatchAriaSnapshot` only needs the necessary fragment; use regex for unstable values.

```bash
playwright-cli --raw generate-locator e5
# getByRole('button', { name: 'Submit' })

playwright-cli --raw eval "el => el.textContent" e5
playwright-cli --raw eval "el => el.value" e5

playwright-cli --raw snapshot
playwright-cli --raw snapshot e5
```

```typescript
// Generated
await page.getByRole('button', { name: 'Submit' }).click();

// Manual assertions
await expect(page.getByRole('alert', { name: 'Success' })).toBeVisible();
await expect(page.getByTestId('main-header')).toHaveText('Welcome, user');
await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('user@example.com');
await expect(page.getByRole('checkbox', { name: 'Enable notifications' })).toBeChecked();

await expect(page).toMatchAriaSnapshot(`
  - heading "Welcome, user"
  - link /\\d+ new messages?/
  - button "Sign out"
`);

await expect(page.getByRole('navigation')).toMatchAriaSnapshot(`
  - link "Home"
  - link /\\d+ new messages?/
  - link "Profile"
`);
```

---

## 1. Plan

Goal: produce `specs/<feature>.plan.md` enumerating scenarios. **Always** write the spec to a file.

### 1.1 Prerequisite: workspace

```bash
test -f playwright.config.ts || test -f playwright.config.js
npx --no-install playwright --version
```

If no Playwright install, bootstrap (let user pick defaults): `npm init playwright@latest`.

### 1.2 Prerequisite: seed test

**Seed test** = minimal test landing the page in state every scenario starts from (navigation, login, feature flags). Scenarios assume a fresh start *after* the seed. `--debug=cli` pauses *inside* this test.

Minimum viable seed:

```ts
// tests/seed.spec.ts
import { test } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.goto('https://example.com/');
});
```

Preferred — fixture for shared nav:

```ts
// tests/fixtures.ts
import { test as baseTest } from '@playwright/test';
export { expect } from '@playwright/test';

export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.goto('https://example.com/');
    await use(page);
  },
});
```

```ts
// tests/seed.spec.ts
import { test } from './fixtures';

test('seed', async ({ page }) => {
  // Fixture already navigates. Empty body = "start here".
});
```

If no seed exists, create one that at least navigates to the app.

### 1.3 Explore the app

Launch via seed in background and attach:

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/seed.spec.ts --debug=cli
# wait for "Debugging Instructions" and the tw-XXXX session name
playwright-cli attach tw-XXXX
playwright-cli resume
playwright-cli snapshot
playwright-cli click e5
playwright-cli eval "location.href"
playwright-cli show --annotate
```

Map:
- Interactive surfaces (forms, buttons, lists, filters, modals).
- Primary user journeys end-to-end.
- Edge cases: empty states, validation errors, long input, boundary values.
- Persistence: reload, local/session storage, URL fragments.
- Navigation: which controls change URL, back/forward behaviour.

**Important**: never just `playwright-cli open` the app URL — always go through the test to capture custom setup. **Important**: stop the background test when done exploring.

### 1.4 Write the spec file

Save under `specs/<feature>.plan.md`:

```markdown
# <Feature> Test Plan

## Application Overview

<One paragraph describing what the feature does and why it matters.>

## Test Scenarios

### 1. <Group Name>

**Seed:** `tests/seed.spec.ts`

#### 1.1. <kebab-case-scenario-name>

**File:** `tests/<group>/<kebab-case-scenario-name>.spec.ts`

**Steps:**
  1. <Concrete user step>
    - expect: <observable outcome>
    - expect: <another observable outcome>
  2. <Next step>
    - expect: <outcome>

#### 1.2. <next-scenario>
...

### 2. <Next Group>

**Seed:** `tests/seed.spec.ts`
...
```

Guidelines:
- Each scenario independent, starts from seed's fresh state — never chain.
- Scenario names are kebab-case and match the test file name (`should-add-single-todo` → `should-add-single-todo.spec.ts`).
- Cover happy path, edge cases, validation, negative flows, persistence.
- Steps at user level ("Type 'Buy milk' into the input"), not API level.
- Observable outcomes in `- expect:` bullets; each becomes an assertion during generation.

---

## 2. Generate

Take a spec file → produce Playwright test files. Optionally update the spec if it has drifted.

### 2.1 Inputs

- **Spec file**, e.g. `specs/basic-operations.plan.md`.
- **Target**: single scenario (e.g. `1.2`), whole group (`1`), or all.
- **Seed file**, read from the `**Seed:**` line of the scenario's group.

### 2.2 Generate one scenario

For each target scenario, in sequence (never parallel — scenarios share the seed session):

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test <seed-file> --debug=cli   # background
playwright-cli attach tw-XXXX
playwright-cli resume
```

**Do not** just `playwright-cli open` the app URL — always go through the test to capture custom setup.

Walk the scenario's `Steps:` one by one with `playwright-cli`, treating the spec as plan and live app as source of truth. If a step is vague or contradicts the app, use judgement: update the spec to match what the app really does, then keep going. Editing the spec mid-generation is expected.

Every action prints the equivalent Playwright TypeScript:

```bash
playwright-cli snapshot
playwright-cli fill e3 "John Doe"
playwright-cli press Enter
playwright-cli click e7
```

For each `- expect:` bullet, add an explicit assertion.

Collect the generated code, write the test file at the path from the spec:

```ts
// spec: specs/basic-operations.plan.md
// seed: tests/seed.spec.ts
import { test, expect } from './fixtures';   // or '@playwright/test'

test.describe('Signing in and out', () => {
  test('should sign in', async ({ page }) => {
    // 1. Navigate to the application (handled by the seed fixture)

    // 2. Type 'John Doe' into the username field
    await page.getByRole('textbox', { name: 'username' }).fill('John Doe');

    // 3. Type password
    await page.getByRole('textbox', { name: 'password' }).fill('TestPassword');

    // 4. Press Enter to submit
    await page.getByRole('textbox', { name: 'password' }).press('Enter');

    await expect(page.getByRole('heading')).toContainText('Welcome, John Doe!');
  });
});
```

Rules:
- **One test per file.** File path, describe name, test name from spec verbatim (minus ordinal).
- Prefix each numbered step with `// N. <step text>` comment before its actions.
- Use describe group name verbatim from spec (no `1.` ordinal).
- Import from `./fixtures` if the project has one; otherwise `@playwright/test`.
- **Close the CLI session and stop the background test before moving to next scenario.**

### 2.3 Generate multiple scenarios

Loop 2.2 over targeted scenarios one at a time, restarting seed between each. Safe to parallelise across machines (unique session names) — just stop each test run before next.

### 2.4 Run generated tests

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/<group>/<scenario>.spec.ts
```

Any failure → Section 3.

---

## 3. Heal

Fix failing tests, update the spec if app behaviour changed.

### 3.1 Find failing tests

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test
```

Record `<file>:<line>` failures and process one at a time. Don't parallelise fixes — shared state and single CLI session make that fragile.

### 3.2 Debug one failure

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/<group>/<scenario>.spec.ts:<line> --debug=cli
# wait for "Debugging Instructions" and the tw-XXXX session name
playwright-cli attach tw-XXXX
```

The test is paused at the start. Step forward or run to just before the failing action, then diagnose:

```bash
playwright-cli snapshot                # did the element change / move / rename?
playwright-cli console                 # app-side errors?
playwright-cli requests                # failed request? wrong payload?
playwright-cli show --annotate         # ask the user to point somewhere
```

Common causes: selector drift, new wrapper element, label/ARIA rename, timing (transition, async load), assertion text updated, test data leaking.

Rehearse the corrected interaction with `playwright-cli` — paste the generated code back into the test.

### 3.3 Apply the fix

Edit the test file: update locator, assertion, step order, or inputs. Stop the background debug run. Rerun the single test to confirm green.

Never skip hooks or add sleeps as a fix. Never use `networkidle`.

### 3.4 Reconcile with the spec

Open the spec referenced by the `// spec:` header in the test file, locate the scenario.

- **Fix was purely technical** (locator drift, better assertion shape) and the spec's user-level behaviour still matches → leave the spec alone.
- **Fix changed user-visible steps, inputs, order, or expected outcomes** that the spec describes → update the spec to match reality. Keep scenario id and file path stable; only step / expect lines change.
- **Unclear whether app change is intentional** (spec is stale) **or a regression** (test was right, app is wrong) → **stop and ask the user**. Provide:
  - the scenario id (e.g. `2.3`),
  - the spec lines that no longer match,
  - the observed app behaviour (quote snapshot excerpt or concrete outcome).

After user answers, either update spec (intentional) or file/flag test as covering a bug (regression).

### 3.5 Iteration and giving up

- Fix one failure at a time, rerun after each.
- If test is correct but app is wrong AND user confirmed it's a bug: mark `test.fixme(...)` with comment pointing at user's decision or issue link. Never silently skip.
