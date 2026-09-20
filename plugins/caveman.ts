// Caveman loader shim (opencode v2).
// v2 auto-loads only top-level files in plugins/ plus npm packages from
// config — it never descends into plugins/caveman/. Re-export keeps the
// real plugin (and its ./caveman/*.cjs helpers, resolved via import.meta.url)
// in one place instead of duplicating it here.
export { default } from "./caveman/plugin.js";
