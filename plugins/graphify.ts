// graphify OpenCode plugin
// 1. Injects a knowledge graph reminder before bash tool calls when the graph exists.
// 2. Polls code file mtimes and auto-runs `graphify update` when something changed
//    (incremental, AST-only, no LLM, no API key). Alive while opencode runs.
//    Polling instead of fs.watch: Bun's fs.watch recursive silently no-ops on
//    Windows, and polling is runtime-independent and boring on purpose.
//
// IMPORTANT: keep the reminder string free of backticks and $(...) constructs.
// The hook prepends `echo "<reminder>" && <cmd>` to the user's bash command;
// backticks inside the double-quoted echo trigger bash command substitution,
// which both corrupts tool output and silently executes the very graphify
// command we are only suggesting. Plain words render fine in opencode's TUI.
import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readdirSync, statSync, type Dirent } from "fs";
import { join } from "path";
import { spawn } from "child_process";

// Code extensions only: `graphify update` re-extracts code (AST, free). Doc /
// paper / image changes need semantic extraction (LLM), which this plugin
// deliberately does not trigger.
const CODE_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|rs|java|rb|php|sh|bash|ps1|psm1)$/i;
const SKIP_DIRS = new Set(["graphify-out", "node_modules", ".git"]);
const POLL_MS = 10000;

export const GraphifyPlugin: Plugin = async ({ directory }) => {
  let reminded = false;

  // ── Auto-update poller ──
  // Only active where a graph already exists (same gate as the reminder), so
  // sessions in other projects without graphify-out/ stay untouched.
  let running = false;
  let rerun = false;
  let lastSnapshot: Map<string, number> | null = null;

  function runUpdate(): void {
    if (running) {
      rerun = true; // one queued re-run after the in-flight update finishes
      return;
    }
    running = true;
    console.error(`[graphify] auto-update triggered (${directory})`);
    // stdio 'ignore' is load-bearing: graphify spawns Python AST workers that
    // inherit the pipes, so with piped stdio the 'close' event never fires on
    // Windows. 'exit' + 'ignore' avoids the hang entirely.
    const child = spawn("graphify", ["update", directory], {
      stdio: "ignore",
      shell: true, // PATH lookup for graphify.exe / graphify.cmd on Windows
    });
    child.on("exit", (code) => {
      running = false;
      if (code !== 0) console.error(`[graphify] auto-update exit ${code}`);
      if (rerun) {
        rerun = false;
        runUpdate();
      }
    });
    child.on("error", (e) => {
      running = false;
      console.error(`[graphify] auto-update failed: ${e.message}`);
    });
  }

  // Snapshot path->mtimeMs for every code file under the project. First call
  // just records baseline; later calls compare and report changed file count.
  function scanSnapshot(): Map<string, number> {
    const snap = new Map<string, number>();
    const walk = (dir: string): void => {
      let entries: Dirent[];
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return; // unreadable dir, skip
      }
      for (const e of entries) {
        if (e.isDirectory()) {
          if (SKIP_DIRS.has(e.name)) continue;
          walk(join(dir, e.name));
        } else if (e.isFile() && CODE_EXT.test(e.name)) {
          try {
            snap.set(join(dir, e.name), statSync(join(dir, e.name)).mtimeMs);
          } catch {
            // file vanished mid-scan, next poll catches it
          }
        }
      }
    };
    walk(directory);
    return snap;
  }

  // Compare current snapshot against the last one; trigger update on change.
  // First call records baseline only (no trigger on startup).
  function checkForChanges(): void {
    const snap = scanSnapshot();
    if (lastSnapshot === null) {
      lastSnapshot = snap; // baseline
      return;
    }
    let changed = 0;
    for (const [p, m] of snap) if (lastSnapshot.get(p) !== m) changed++;
    for (const p of lastSnapshot.keys()) if (!snap.has(p)) changed++;
    lastSnapshot = snap;
    if (changed > 0) {
      console.error(`[graphify] ${changed} code file(s) changed, running update`);
      runUpdate();
    }
  }

  function safeCheck(source: string): void {
    try {
      checkForChanges();
    } catch (e) {
      console.error(`[graphify] ${source} check error: ${(e as Error).message}`);
    }
  }

  if (existsSync(join(directory, "graphify-out", "graph.json"))) {
    // Baseline immediately at init so the very first edit already compares.
    try {
      lastSnapshot = scanSnapshot();
    } catch (e) {
      console.error(`[graphify] baseline scan error: ${(e as Error).message}`);
    }
    // Safety net: catches manual editor changes, bash-generated files, etc.
    setInterval(() => safeCheck("poll"), POLL_MS);
  }

  return {
    // Instant path: after every edit/write tool call, check immediately so
    // agent-driven changes update the graph without waiting for the poll.
    "tool.execute.after": async (input) => {
      if (lastSnapshot === null) return; // baseline not taken yet
      const t = String(input.tool ?? "").toLowerCase();
      if (t !== "edit" && t !== "write") return;
      safeCheck("tool");
    },
    "tool.execute.before": async (input, output) => {
      if (reminded) return;
      if (!existsSync(join(directory, "graphify-out", "graph.json"))) return;

      if (input.tool === "bash") {
        // ';' not '&&' — Windows PowerShell 5.1 rejects '&&' as a statement
        // separator, breaking the first bash command of the session (#1646).
        output.args.command =
          'echo "[graphify] knowledge graph at graphify-out/. For focused questions, run graphify query with your question (scoped subgraph, usually much smaller than GRAPH_REPORT.md) instead of grepping raw files. Read GRAPH_REPORT.md only for broad architecture context." ; ' +
          output.args.command;
        reminded = true;
      }
    },
  };
};
