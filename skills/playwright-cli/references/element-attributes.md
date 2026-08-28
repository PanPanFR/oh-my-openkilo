# Inspecting Element Attributes

When the snapshot doesn't show an element's `id`, `class`, `data-*`, or other DOM properties, use `eval`:

```bash
playwright-cli snapshot
# snapshot shows e7 as a button but no id / data attributes

playwright-cli eval "el => el.id" e7
playwright-cli eval "el => el.className" e7
playwright-cli eval "el => el.getAttribute('data-testid')" e7
playwright-cli eval "el => el.getAttribute('aria-label')" e7
playwright-cli eval "el => getComputedStyle(el).display" e7
```
