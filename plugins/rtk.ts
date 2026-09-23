// RTK OpenCode plugin — rewrites shell commands to use rtk for token savings.
// Requires: rtk in PATH (or RTK_BIN env override).
//
// Thin delegating plugin: all rewrite logic lives in `rtk rewrite`,
// which is the single source of truth. To add or change rewrite rules,
// edit the rtk registry — not this file.
//
// v2 plugin contract (opencode >= 2.0): default export with id + setup.
// Registers via ctx.tool.hook; mutates payload input in place. Fail-open:
// any failure passes the command through unchanged.

import { execFileSync, spawnSync } from "child_process";
import { existsSync } from "fs";

function resolveRtkBin(): string | null {
  const override = process.env.RTK_BIN?.trim();
  if (override && existsSync(override)) return override;
  // Direct PATH probe first — no `which`/`where` dependency, works on
  // Windows even when Git usr/bin is missing from the service env.
  try {
    execFileSync("rtk", ["--version"], { stdio: "ignore", timeout: 8000 });
    return "rtk";
  } catch {
    // fall through to platform locators
  }
  const locator =
    process.platform === "win32"
      ? { cmd: "where.exe", args: ["rtk"] }
      : { cmd: "which", args: ["rtk"] };
  try {
    const out = execFileSync(locator.cmd, locator.args, {
      encoding: "utf8",
      timeout: 8000,
    })
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (out.length > 0) return out[0];
  } catch {
    // locator failed — no binary
  }
  return null;
}

export default {
  id: "rtk",
  setup: async (ctx: any) => {
    const bin = resolveRtkBin();
    if (!bin) {
      console.warn(
        "[rtk] rtk binary not found in PATH (set RTK_BIN to override) — plugin disabled"
      );
      return;
    }
    const hook = ctx?.tool?.hook;
    if (typeof hook !== "function") {
      console.warn("[rtk] ctx.tool.hook unavailable — plugin disabled");
      return;
    }
    await hook("execute.before", async (payload: any) => {
      const tool = String(payload?.tool ?? "").toLowerCase();
      if (tool !== "bash" && tool !== "shell") return;
      const input = payload?.input ?? payload?.args;
      if (!input || typeof input !== "object") return;
      const command = (input as Record<string, unknown>).command;
      if (typeof command !== "string" || !command) return;
      // Already an rtk invocation — nothing to rewrite.
      if (/^\s*rtk(\.exe)?\b/.test(command)) return;
      try {
        // `rtk rewrite` exits nonzero when there is no equivalent;
        // stdout empty there too. Non-empty stdout that differs = rewrite.
        const result = spawnSync(bin, ["rewrite", command], {
          encoding: "utf8",
          timeout: 8000,
        });
        const rewritten = String((result as any)?.stdout ?? "").trim();
        if (rewritten && rewritten !== command) {
          (input as Record<string, unknown>).command = rewritten;
        }
      } catch {
        // rtk rewrite failed — pass through unchanged
      }
    });
  },
};
