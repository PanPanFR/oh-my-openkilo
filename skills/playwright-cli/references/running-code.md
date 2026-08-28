# Running Custom Playwright Code (`run-code`)

For advanced scenarios the CLI doesn't cover directly.

## Syntax

```bash
playwright-cli run-code "async page => {
  // Playwright code. Access page.context() for context-level ops.
}"
```

Load from file: `playwright-cli run-code --filename=./my-script.js`

Code must be a single function expression (auto-wrapped in `()`). No import/export/require.

## Geolocation

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
}"

playwright-cli run-code "async page => {
  await page.context().clearPermissions();
}"
```

## Permissions

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions([
    'geolocation', 'notifications', 'camera', 'microphone'
  ]);
}"

playwright-cli run-code "async page => {
  await page.context().grantPermissions(['clipboard-read'], {
    origin: 'https://example.com'
  });
}"
```

## Media emulation

```bash
playwright-cli run-code "async page => { await page.emulateMedia({ colorScheme: 'dark' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ colorScheme: 'light' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ reducedMotion: 'reduce' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ media: 'print' }); }"
```

## Wait strategies

```bash
playwright-cli run-code "async page => { await page.waitForLoadState('networkidle'); }"
playwright-cli run-code "async page => { await page.locator('.loading').waitFor({ state: 'hidden' }); }"
playwright-cli run-code "async page => { await page.waitForFunction(() => window.appReady === true); }"
playwright-cli run-code "async page => { await page.locator('.result').waitFor({ timeout: 10000 }); }"
```

## Frames / iframes

```bash
playwright-cli run-code "async page => {
  const frame = page.locator('iframe#my-iframe').contentFrame();
  await frame.locator('button').click();
}"

playwright-cli run-code "async page => {
  return page.frames().map(f => f.url());
}"
```

## File download

```bash
playwright-cli run-code "async page => {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download' }).click();
  const download = await downloadPromise;
  await download.saveAs('./downloaded-file.pdf');
  return download.suggestedFilename();
}"
```

## Clipboard

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['clipboard-read']);
  return await page.evaluate(() => navigator.clipboard.readText());
}"

playwright-cli run-code "async page => {
  await page.evaluate(text => navigator.clipboard.writeText(text), 'Hello clipboard!');
}"
```

## Page info / JS exec

```bash
playwright-cli run-code "async page => { return await page.title(); }"
playwright-cli run-code "async page => { return page.url(); }"
playwright-cli run-code "async page => { return await page.content(); }"
playwright-cli run-code "async page => { return page.viewportSize(); }"

playwright-cli run-code "async page => {
  return await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled
  }));
}"

playwright-cli run-code "async page => {
  const multiplier = 5;
  return await page.evaluate(m => document.querySelectorAll('li').length * m, multiplier);
}"
```

## Error handling

```bash
playwright-cli run-code "async page => {
  try {
    await page.getByRole('button', { name: 'Submit' }).click({ timeout: 1000 });
    return 'clicked';
  } catch (e) {
    return 'element not found';
  }
}"
```

## Complex workflows

```bash
# Login + save state
playwright-cli run-code "async page => {
  await page.goto('https://example.com/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'auth.json' });
  return 'Login successful';
}"

# Scrape multiple pages
playwright-cli run-code "async page => {
  const results = [];
  for (let i = 1; i <= 3; i++) {
    await page.goto(\`https://example.com/page/\${i}\`);
    const items = await page.locator('.item').allTextContents();
    results.push(...items);
  }
  return results;
}"
```
