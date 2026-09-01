import type { Plugin } from "@opencode-ai/plugin";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

// Shadow checkpoint before every edit/write, Kilo/Cline style.
// Mirrors the target file into a local git repo under
// ~/.cache/opencode/checkpoints/<sha1(project path)> preserving relative
// path. Never touches the project repo or its history. Secrets included:
// this repo is local-only, never pushed, never staged into the project.
//
// Restore a file at any point:
//   git -C ~/.cache/opencode/checkpoints/<hash> log --oneline
//   git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>
//   then copy the file from the shadow worktree back into the project.
//
// prune: history capped at 500 commits per project; past that the shadow
// repo resets on the next edit. Older restore points are lost by design:
// this is a safety net, not an archive.
// ponytail: full-tree snapshot per file means restoring a deleted sibling
// requires it to have been edited once; fine for AI-edit safety nets.

const LIMIT = 500;

function git(dir: string, args: string[]): { ok: boolean; out: string } {
  try {
    return { ok: true, out: execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" }) };
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer | string; message?: string };
    return { ok: false, out: String(err?.stdout ?? err?.message ?? "") };
  }
}

export const CheckpointPlugin: Plugin = async ({ directory, worktree }) => {
  const root = worktree || directory;
  const shadowRoot = path.join(homedir(), ".cache", "opencode", "checkpoints");
  const shadow = path.join(
    shadowRoot,
    createHash("sha1").update(root.toLowerCase()).digest("hex"),
  );

  function ensureRepo(): boolean {
    if (existsSync(path.join(shadow, ".git"))) return true;
    mkdirSync(shadow, { recursive: true });
    return git(shadow, ["init"]).ok;
  }

  return {
    "tool.execute.before": async (input, output) => {
      try {
        const tool = String((input as { tool?: string }).tool ?? "");
        if (!/^(edit|write)$/.test(tool)) return;
        const file = String((output.args as { filePath?: string }).filePath ?? "");
        if (!file || !existsSync(file)) return; // new file: nothing pre-write to protect

        const rel = path.relative(root, file);
        if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return; // outside project

        if (!ensureRepo()) return;
        const dest = path.join(shadow, rel);
        mkdirSync(path.dirname(dest), { recursive: true });
        copyFileSync(file, dest);

        git(shadow, ["add", "--", rel]);
        const commit = git(shadow, [
          "-c",
          "user.name=checkpoint",
          "-c",
          "user.email=checkpoint@local",
          "commit",
          "-m",
          `${tool}: ${rel}`,
        ]);
        if (!commit.ok) {
          console.error(`[checkpoint] commit failed for ${rel}: ${commit.out.trim()}`);
          return;
        }

        const count = parseInt(git(shadow, ["rev-list", "--count", "HEAD"]).out.trim(), 10);
        if (count > LIMIT) rmSync(shadow, { recursive: true, force: true }); // next edit re-inits
      } catch (e) {
        console.error(`[checkpoint] error:`, e);
      }
    },
  };
};
