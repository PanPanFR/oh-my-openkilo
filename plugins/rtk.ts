// RTK OpenCode plugin, rewrites commands to use rtk for token savings.
// Requires: rtk >= 0.23.0 in PATH.
// Windows: also add Git usr/bin (C:\Program Files\Git\usr\bin) to PATH,
// else `rtk ls` fails with `Failed to resolve 'ls' via PATH`
// (PowerShell `ls` is an alias, not a binary).
//
// Thin delegating plugin: all rewrite logic lives in `rtk rewrite`,
// which is the single source of truth (src/discover/registry.rs).
// To add or change rewrite rules, edit the Rust registry, not this file.
//
// Dual contract: default export carries both runtimes.
// v1 (>= 1.18.29) calls server(), v2 calls setup().

async function rtkServer(input: any) {
  const sh: any = (input as any)?.$ ?? (globalThis as any).Bun?.$ ?? null;
  if (!sh) {
    console.warn("[rtk] shell API unavailable, plugin disabled");
    return {};
  }
  try {
    await sh`which rtk`.quiet();
  } catch {
    console.warn("[rtk] rtk binary not found in PATH, plugin disabled");
    return {};
  }

  return {
    "tool.execute.before": async (input: any, output: any) => {
      const tool = String(input?.tool ?? "").toLowerCase();
      if (tool !== "bash" && tool !== "shell") return;
      const args = output?.args;
      if (!args || typeof args !== "object") return;

      const command = (args as Record<string, unknown>).command;
      if (typeof command !== "string" || !command) return;

      try {
        const result = await sh`rtk rewrite ${command}`.quiet().nothrow();
        const rewritten = String((result as any)?.stdout ?? "").trim();
        if (rewritten && rewritten !== command) {
          (args as Record<string, unknown>).command = rewritten;
        }
      } catch {
        // rtk rewrite failed, pass through unchanged
      }
    },
  };
}

async function rtkSetup(ctx: any) {
  const sh: any = ctx?.$ ?? (globalThis as any).Bun?.$ ?? null;
  if (!sh) {
    console.warn("[rtk] shell API unavailable, plugin disabled");
    return;
  }
  try {
    await sh`which rtk`.quiet();
  } catch {
    console.warn("[rtk] rtk binary not found in PATH, plugin disabled");
    return;
  }
  const hook = ctx?.tool?.hook;
  if (typeof hook !== "function") {
    console.warn("[rtk] ctx.tool.hook unavailable, plugin disabled");
    return;
  }
  await hook("execute.before", async (payload: any) => {
    const tool = String(payload?.tool ?? "").toLowerCase();
    if (tool !== "bash" && tool !== "shell") return;
    const target = payload?.input ?? payload?.args;
    if (!target || typeof target !== "object") return;
    const command = (target as Record<string, unknown>).command;
    if (typeof command !== "string" || !command) return;
    try {
      const result = await sh`rtk rewrite ${command}`.quiet().nothrow();
      const rewritten = String((result as any)?.stdout ?? "").trim();
      if (rewritten && rewritten !== command) {
        (target as Record<string, unknown>).command = rewritten;
      }
    } catch {
      // rtk rewrite failed, pass through unchanged
    }
  });
}

export default {
  id: "rtk",
  server: rtkServer,
  setup: rtkSetup,
};
