// caveman — opencode plugin
//
// Provides dynamic caveman mode tracking for opencode:
// - Writes the mode flag on each session start (via the `event` dispatcher)
// - Parses user messages for /caveman commands and natural-language toggles
// - Injects per-turn reinforcement into the system prompt
//
// Bun ESM module; loads the existing security-hardened helpers from
// caveman-config.js via createRequire so the symlink-safe flag-write code
// lives in one place. Same trick loads caveman-parse.js (#602) so the mode-
// change parsing is a single shared source with caveman-mode-tracker.js.
//
// Layout once installed:
//   ~/.config/opencode/plugins/caveman/
//   ├── package.json
//   ├── plugin.js              ← this file
//   ├── caveman-config.cjs     ← copied sibling of src/hooks/caveman-config.js
//   └── caveman-parse.cjs      ← copied sibling of src/hooks/caveman-parse.js
//
// The always-on caveman ruleset is provided separately via
// ~/.config/opencode/AGENTS.md (Tier-3 base). This plugin handles dynamic
// state only: flag writes, slash-command parsing, natural-language
// activation, and per-turn reinforcement.
//
// Hook mapping:
//   v1 (opencode >= 1.15.x, via server()):
//   - event (event.type === 'session.created'): session-init flag write,
//     re-fires per session rather than once per plugin-process load
//   - chat.message: intercept user prompts for mode changes
//   - experimental.chat.system.transform: inject reinforcement per-turn
//   v2 (opencode >= 2.0, via setup()): event pump over the async iterable
//   from ctx.event.subscribe, best-effort reinforcement through
//   ctx.session.hook("context"). In-session /caveman toggles (chat.message)
//   have no v2 equivalent and stay v1-only.
//
// Note: opencode does NOT support 'session.created' or 'tui.prompt.append'
// as named plugin-hook keys. 'session.created' is an event *type* dispatched
// through the single `event` handler; the old direct-key handlers were
// silently ignored. See:
// https://github.com/JuliusBrussee/caveman/issues/418
// https://github.com/JuliusBrussee/caveman/issues/421

import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, unlinkSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// When installed: caveman-config.cjs sits next to plugin.js (copied by
// bin/install.js, renamed to .cjs because this directory's package.json
// declares "type": "module" — bare .js would be loaded as ESM). When loaded
// from the source tree (tests, dev): fall back to the canonical
// src/hooks/caveman-config.js, which lives in a directory whose own
// package.json pins "type": "commonjs". One source of truth either way.
//
// Loaded by evaluating the file as CommonJS by hand, NOT via the module
// loader: opencode runs plugins inside a compiled Bun binary where
// require() of on-disk files is rejected ("require() async module is
// unsupported") and await import() of a CJS file yields an empty namespace —
// both silently break the plugin (#418 follow-up). createRequire() still
// resolves node BUILT-INS fine in the compiled binary, which is all
// caveman-config needs (fs/path/os).
function loadConfig() {
  const installed = join(here, 'caveman-config.cjs');
  const dev = join(here, '..', '..', 'hooks', 'caveman-config.js');
  const target = existsSync(installed) ? installed : dev;
  const code = readFileSync(target, 'utf8').replace(/^#![^\n]*\n/, '');
  const mod = { exports: {} };
  // Base require on the loaded file, not plugin.js — caveman-parse.js does a
  // relative require('./caveman-config') that must resolve against src/hooks/
  // in the dev layout and against pluginDir when installed.
  new Function('module', 'exports', 'require', '__dirname', '__filename', code)(
    mod, mod.exports, createRequire(pathToFileURL(target).href), dirname(target), target
  );
  return mod.exports;
}
const config = loadConfig();

const { getDefaultMode, safeWriteFlag, readFlag } = config;

// Load the shared mode-change parser (#602) the same way loadConfig() loads
// caveman-config.js — see the doc comment above loadConfig() for why this
// can't go through require()/import() in a compiled Bun binary.
function loadParse() {
  const installed = join(here, 'caveman-parse.cjs');
  const dev = join(here, '..', '..', 'hooks', 'caveman-parse.js');
  const target = existsSync(installed) ? installed : dev;
  const code = readFileSync(target, 'utf8').replace(/^#![^\n]*\n/, '');
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', '__dirname', '__filename', code)(
    mod, mod.exports, createRequire(pathToFileURL(target).href), dirname(target), target
  );
  return mod.exports;
}
const { parseModeChange, INDEPENDENT_MODES } = loadParse();

// opencode resolves its config dir from $XDG_CONFIG_HOME, else ~/.config/opencode
// on every platform — including Windows, where it uses %USERPROFILE%\.config\opencode
// (NOT %APPDATA%). os.homedir() is %USERPROFILE% on win32, so the default branch
// is already correct cross-platform.
function opencodeConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'opencode');
  }
  return path.join(os.homedir(), '.config', 'opencode');
}

const flagPath = path.join(opencodeConfigDir(), '.caveman-active');

function removeFlag() {
  try {
    unlinkSync(flagPath);
  } catch (error) {
    if (process.env.CAVEMAN_DEBUG === '1' && error.code !== 'ENOENT') {
      console.error(`caveman: failed to remove flag ${flagPath}: ${error.message}`);
    }
  }
}

function reinforcementLine(mode) {
  return 'CAVEMAN MODE ACTIVE (' + mode + ') — session ruleset applies.';
}

function applyModeChange(change) {
  if (!change) return;
  if (change.action === 'clear') {
    removeFlag();
    return;
  }
  if (change.action === 'set' && change.mode) {
    safeWriteFlag(flagPath, change.mode);
  }
}

// Session-start logic — extracted so the `event` dispatcher (opencode >= 1.15)
// drives one shared implementation. Re-fires on every `session.created` event,
// so a new session in a long-lived plugin process re-asserts the flag.
function handleSessionCreated() {
  const mode = getDefaultMode();
  if (mode === 'off') {
    removeFlag();
    return;
  }
  safeWriteFlag(flagPath, mode);
}

// v1 hook factory, also reused by the v2 setup below. Internal only: the
// dual contract exposes it as server() on the default export, so no named
// plugin export is needed (v1 object entrypoints need opencode >= 1.18.29).
const cavemanServer = async (_ctx) => {
  // Assert the flag at plugin load as well: in one-shot `opencode run` the
  // first session.created publishes before plugin event dispatch is wired,
  // so the event handler alone misses it. The factory-time write covers that
  // race; the event handler re-asserts on every later session in long-lived
  // TUI processes.
  handleSessionCreated();

  return {
  // opencode dispatches session/lifecycle events through a single `event`
  // handler keyed on event.type; the older direct top-level
  // 'session.created' key is silently ignored. Routing session-init through
  // here means the flag is rewritten on every new session, not just once when
  // the plugin module loads. See https://opencode.ai/docs/plugins#events.
  event: async ({ event } = {}) => {
    if (event && event.type === 'session.created') handleSessionCreated();
  },

  // Intercept user messages to detect /caveman commands and natural-language
  // mode toggles. opencode fires chat.message with (input, output) where
  // output.parts is the array of message parts; text parts carry .text.
  // Return value is ignored — state changes happen via the flag file.
  // expandedTpl: opencode replaces a typed slash command with its command
  // file's prose before this hook sees it. unwrapQuotes: the non-interactive
  // `run` path delivers the message wrapped in literal quote characters.
  'chat.message': async (_input, output) => {
    if (!output || !output.parts) return;
    for (const part of output.parts) {
      if (part && part.type === 'text' && part.text) {
        const change = parseModeChange(part.text, { getDefaultMode, expandedTpl: true, unwrapQuotes: true });
        if (change) applyModeChange(change);
      }
    }
  },

  // Inject the reinforcement line into the system prompt when caveman is
  // active. opencode calls this before every LLM request and expects the hook
  // to mutate output.system (a string[]); the return value is discarded.
  'experimental.chat.system.transform': async (_input, output) => {
    if (!output || !Array.isArray(output.system)) return;
    const active = readFlag(flagPath);
    if (active && !INDEPENDENT_MODES.has(active)) {
      const line = reinforcementLine(active);
      // Idempotent: opencode is expected to rebuild `output.system` per
      // request, but if it ever reuses the array across turns an unguarded
      // append grows the system prompt without bound — silently eating the
      // context window. Rewrite any line we already left instead of stacking
      // another, so a mode switch updates in place rather than accumulating.
      const stale = /CAVEMAN MODE ACTIVE \([a-z-]+\) — session ruleset applies\./g;
      let found = false;
      for (let i = 0; i < output.system.length; i++) {
        if (typeof output.system[i] === 'string' && stale.test(output.system[i])) {
          stale.lastIndex = 0;
          output.system[i] = output.system[i].replace(stale, line);
          found = true;
        }
        stale.lastIndex = 0;
      }
      if (found) return;
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += '\n\n' + line;
      } else {
        output.system.push(line);
      }
    }
  },
  };
};

// v2 entrypoint (opencode >= 2.0). Instantiates the v1 factory above and
// drives its hooks from v2 registrations. Mapping:
//   event                              -> for-await pump over the async
//                                        iterable from ctx.event.subscribe
//   experimental.chat.system.transform -> ctx.session.hook("context"),
//                                        best-effort (payload shape is
//                                        undocumented; no array means no-op)
//   chat.message (/caveman toggles)    -> no v2 equivalent; name reported
//                                        in the single skipped warning
// The mode flag file is still asserted on every session.created event via the
// pump; per-turn reinforcement rides the context session hook.
const cavemanSetup = async (ctx) => {
    const hooks = (await cavemanServer({})) || {};

    const skipped = [];
    if (hooks["chat.message"]) skipped.push("chat.message");
    if (skipped.length > 0) {
      console.error(
        "[caveman] v2 runtime: hook(s) with no v2 equivalent: " + skipped.join(", ") +
          ", in-session /caveman toggles are degraded. Session-start flag " +
          "assertion and best-effort reinforcement (context session hook) remain active.",
      );
    }

    // Event pump: ctx.event.subscribe() returns an async-iterable stream
    // (each yielded item is a decoded event), not a callback API. Callback
    // passing is kept only as a fallback for older runtime shapes.
    let cleanup = null;
    if (typeof ctx?.event?.subscribe === "function") {
      let stream = null;
      try {
        stream = ctx.event.subscribe();
      } catch (e) {
        console.error(`caveman: event subscribe failed: ${e.message}`);
      }
      if (stream && typeof stream[Symbol.asyncIterator] === "function") {
        const pump = (async () => {
          try {
            for await (const event of stream) {
              try {
                await hooks.event?.({ event });
              } catch (e) {
                if (process.env.CAVEMAN_DEBUG === "1") {
                  console.error(`caveman: event handler failed: ${e.message}`);
                }
              }
            }
          } catch (e) {
            if (process.env.CAVEMAN_DEBUG === "1") {
              console.error(`caveman: event stream ended: ${e.message}`);
            }
          }
        })();
        cleanup = async () => {
          try { await stream.return?.(); } catch { /* already closed */ }
          try { await pump; } catch { /* settled above */ }
        };
      } else if (typeof stream === "function") {
        // Fallback: subscribe(handler), handler receives the event directly.
        const sub = stream((event) => {
          void Promise.resolve()
            .then(() => hooks.event?.({ event }))
            .catch((e) => {
              if (process.env.CAVEMAN_DEBUG === "1") {
                console.error(`caveman: event handler failed: ${e.message}`);
              }
            });
        });
        cleanup = async () => {
          try { await sub?.return?.(); } catch { /* noop */ }
        };
      } else {
        console.error("caveman: ctx.event.subscribe returned no async iterable, plugin disabled");
      }
    } else {
      console.error("caveman: ctx.event.subscribe unavailable, plugin disabled");
    }

    // Best-effort reinforcement via the context session hook.
    // The v2 payload shape is undocumented: if it exposes a `system` or
    // `context` string array we apply the same idempotent line injection as
    // the v1 system.transform; otherwise this silently no-ops.
    if (typeof ctx?.session?.hook === "function") {
      try {
        await ctx.session.hook("context", async (input) => {
          try {
            const active = readFlag(flagPath);
            if (!active || INDEPENDENT_MODES.has(active)) return;
            const arr = Array.isArray(input?.system) ? input.system : Array.isArray(input?.context) ? input.context : null;
            if (!arr) return;
            const line = reinforcementLine(active);
            const stale = /CAVEMAN MODE ACTIVE \([a-z-]+\) — session ruleset applies\./g;
            let found = false;
            for (let i = 0; i < arr.length; i++) {
              if (typeof arr[i] === "string" && stale.test(arr[i])) {
                stale.lastIndex = 0;
                arr[i] = arr[i].replace(stale, line);
                found = true;
              }
              stale.lastIndex = 0;
            }
            if (found) return;
            if (arr.length > 0) {
              arr[arr.length - 1] += "\n\n" + line;
            } else {
              arr.push(line);
            }
          } catch (e) {
            if (process.env.CAVEMAN_DEBUG === "1") {
              console.error(`caveman: context hook failed: ${e.message}`);
            }
          }
        });
      } catch (e) {
        console.error(`caveman: session.hook("context") failed: ${e.message}`);
      }
    }

    return cleanup;
};

// Dual contract: v1 (>= 1.18.29) calls server(), v2 calls setup().
export default {
  id: "caveman",
  server: cavemanServer,
  setup: cavemanSetup,
};
