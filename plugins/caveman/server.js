// caveman — opencode 2.x entry point.
//
// opencode 2 dropped the 1.x plugin API: it loads this directory's
// `server.js` and wants a default export `{ id, setup(ctx) }`. opencode 1.x
// never loads this file: the opencode.json entry names this directory, which
// 1.x imports through package.json `main` (plugin.js).
//
// No second implementation: this adapts plugin.js's 1.x hooks to the 2.x API
// (https://opencode.ai/v2/docs/build/plugins/migrate-v1):
//   event                               → ctx.event.subscribe()
//   chat.message                        → ctx.session.hook('prompt')
//   experimental.chat.system.transform  → ctx.session.hook('context')

import { CavemanPlugin } from './plugin.js';

// One active setup per location. opencode 2 can find this directory twice:
// the `plugin` entry in opencode.json (1.x needs it) and the auto-discovery of
// plugins/. opencode 2.0.29 activates one copy (it drops a duplicate plugin
// id), but nothing here relied on that. A second active setup would register
// a second event subscriber, prompt hook and context hook: two banners per
// request, and every /caveman applied twice. The registry is process-wide
// (globalThis + Symbol.for) because a second copy can be a second module
// instance. The key is the location, because one opencode 2 service can run
// this plugin for several projects at once.
//
// A later setup for the same location is a no-op until the first one is
// disposed. opencode 2.0.29 closes the old plugin scope before it loads the
// new one on a reload, so a reload still activates the new copy.
const ACTIVE = Symbol.for('caveman.opencode.setup');
const active = globalThis[ACTIVE] instanceof Set ? globalThis[ACTIVE] : (globalThis[ACTIVE] = new Set());

function locationKey(ctx) {
  const location = ctx && ctx.location;
  if (!location || typeof location.directory !== 'string') return '';
  return location.directory + '\0' + (location.workspaceID || '');
}

export default {
  id: 'caveman',
  async setup(ctx) {
    const key = locationKey(ctx);
    if (active.has(key)) return () => {};
    active.add(key);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      active.delete(key);
    };

    let hooks;
    try {
      hooks = await CavemanPlugin(ctx);
    } catch (error) {
      release();
      throw error;
    }

    // Subagent sessions: their prompts are written by the model, so they must
    // not switch the user's mode.
    const children = new Set();
    const controller = new AbortController();
    (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (event?.type === 'session.created' && event.data?.parentID) children.add(event.data.sessionID);
        await hooks.event({ event });
      }
    })().catch(() => {});

    // The prompt text is mutable; plugin.js rewrites it for /caveman status.
    try {
      await ctx.session.hook('prompt', async (event) => {
        if (!event.prompt || typeof event.prompt.text !== 'string') return;
        if (children.has(event.sessionID)) return;
        const part = { type: 'text', text: event.prompt.text };
        await hooks['chat.message']({}, { parts: [part] });
        event.prompt.text = part.text;
      });

      await ctx.session.hook('context', async (event) => {
        const system = [];
        await hooks['experimental.chat.system.transform']({}, { system });
        for (const text of system) event.system.push({ type: 'text', text });
      });
    } catch (error) {
      // A failed setup must not leave the location marked as active.
      controller.abort();
      release();
      throw error;
    }

    return () => {
      controller.abort();
      release();
    };
  },
};
