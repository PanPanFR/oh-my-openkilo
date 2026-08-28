# Video Recording

WebM (VP8/VP9) capture of browser sessions for debugging, docs, or verification.

## Basic recording

```bash
playwright-cli open
playwright-cli video-start demo.webm
playwright-cli video-chapter "Getting Started" --description="Opening the homepage" --duration=2000
playwright-cli goto https://example.com
playwright-cli snapshot
playwright-cli click e1
playwright-cli video-chapter "Filling Form" --description="Entering test data" --duration=2000
playwright-cli fill e2 "test input"
playwright-cli video-stop
```

## Best practices

1. **Descriptive filenames**: `recordings/login-flow-2024-01-15.webm`
2. **Use `run-code` for hero scripts** — needed for overlays, chapter cards, custom pacing. CLI recording is for raw runs.

## Hero script via `run-code`

When you want overlays, chapter cards, or annotated actions, record via `page.screencast` API in a `run-code` script. Overlays are `pointer-events: none` so they don't block clicks.

```js
async page => {
  await page.screencast.start({ path: 'video.webm', size: { width: 1280, height: 800 } });
  await page.goto('https://demo.playwright.dev/todomvc');

  // Chapter card with blurred backdrop
  await page.screencast.showChapter('Adding Todo Items', {
    description: 'We will add several items to the todo list.',
    duration: 2000,
  });

  await page.getByRole('textbox', { name: 'What needs to be done?' }).pressSequentially('Walk the dog', { delay: 60 });
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.waitForTimeout(1000);

  await page.screencast.showChapter('Verifying Results', {
    description: 'Checking the item appeared in the list.',
    duration: 2000,
  });

  // Sticky annotation (must dispose when done)
  const annotation = await page.screencast.showOverlay(`
    <div style="position: absolute; top: 8px; right: 8px;
      padding: 6px 12px; background: rgba(0,0,0,0.7);
      border-radius: 8px; font-size: 13px; color: white;">
      ✓ Item added successfully
    </div>
  `);

  await page.getByRole('textbox', { name: 'What needs to be done?' }).pressSequentially('Buy groceries', { delay: 60 });
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.waitForTimeout(1500);

  await annotation.dispose();

  // Highlight specific locator with callout
  const bounds = await page.getByText('Walk the dog').boundingBox();
  await page.screencast.showOverlay(`
    <div style="position: absolute;
      top: ${bounds.y}px; left: ${bounds.x}px;
      width: ${bounds.width}px; height: ${bounds.height}px;
      border: 1px solid red;">
    </div>
    <div style="position: absolute;
      top: ${bounds.y + bounds.height + 5}px;
      left: ${bounds.x + bounds.width / 2}px;
      transform: translateX(-50%);
      padding: 6px; background: #808080;
      border-radius: 10px; font-size: 14px; color: white;">
      Check it out, it is right above this text
    </div>
  `, { duration: 2000 });

  await page.screencast.stop();
}
```

## Overlay API

| Method | Use |
|--------|-----|
| `page.screencast.showChapter(title, opts)` | Full-screen chapter card with blur (blocks until `duration` expires) |
| `page.screencast.showOverlay(html, opts)` | Custom HTML overlay (callouts, labels, highlights) |
| `disposable.dispose()` | Remove sticky overlay added without `duration` |
| `page.screencast.hideOverlays() / showOverlays()` | Toggle all overlays |

## Tracing vs video

| | Video | Tracing |
|---|---|---|
| Output | .webm | .trace |
| Shows | Visual recording | DOM snapshots, network, console, actions |
| Best for | Demos, docs | Debugging, analysis |

## Limitations

- Recording adds slight overhead.
- Large recordings consume disk.
