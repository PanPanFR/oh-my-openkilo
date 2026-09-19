// RTK OpenCode plugin — rewrites commands to use rtk for token savings.
// Requires: rtk >= 0.23.0 in PATH.
//
// Thin delegating plugin: all rewrite logic lives in `rtk rewrite`,
// which is the single source of truth (src/discover/registry.rs).
// To add or change rewrite rules, edit the Rust registry — not this file.
//
// v2 plugin contract (opencode >= 2.0): default export with id + setup.
// Registers via ctx.tool.hook; mutates payload input in place.

export default {
  id: "rtk",
  setup: async (ctx: any) => {
    const sh: any = ctx?.$ ?? (globalThis as any).Bun?.$ ?? null
    if (!sh) {
      console.warn("[rtk] shell API unavailable — plugin disabled")
      return
    }
    try {
      await sh`which rtk`.quiet()
    } catch {
      console.warn("[rtk] rtk binary not found in PATH — plugin disabled")
      return
    }
    const hook = ctx?.tool?.hook
    if (typeof hook !== "function") {
      console.warn("[rtk] ctx.tool.hook unavailable — plugin disabled")
      return
    }
    await hook("execute.before", async (payload: any) => {
      const tool = String(payload?.tool ?? "").toLowerCase()
      if (tool !== "bash" && tool !== "shell") return
      const input = payload?.input ?? payload?.args
      if (!input || typeof input !== "object") return
      const command = (input as Record<string, unknown>).command
      if (typeof command !== "string" || !command) return
      try {
        const result = await sh`rtk rewrite ${command}`.quiet().nothrow()
        const rewritten = String((result as any)?.stdout ?? result).trim()
        if (rewritten && rewritten !== command) {
          ;(input as Record<string, unknown>).command = rewritten
        }
      } catch {
        // rtk rewrite failed — pass through unchanged
      }
    })
  },
}
