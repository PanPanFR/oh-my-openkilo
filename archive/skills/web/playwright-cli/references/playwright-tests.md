# Running Playwright Tests

Run with `npx playwright test` (or a package manager script). To avoid the interactive html report opening, set `PLAYWRIGHT_HTML_OPEN=never`.

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test
PLAYWRIGHT_HTML_OPEN=never npm run special-test-command
```

## Debugging Playwright tests

Run with `--debug=cli` to pause at the start and print a session name. **Run the command in the background** and poll output until "Debugging Instructions" appears. Stop the background process when finished.

Once you have a `tw-XXXX` session name, attach with `playwright-cli` and explore the paused page:

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test --debug=cli
# ...wait for "Debugging Instructions"...
# attach to the test
playwright-cli attach tw-abcdef
```

The test is paused at the start; step over or pause at a particular location to inspect state. Every `playwright-cli` action prints equivalent Playwright TypeScript — paste that into the test. Most fixes are locator/expectation updates; sometimes it's an app bug. Use judgement.

After fixing, stop the background run, rerun the test to confirm green.
