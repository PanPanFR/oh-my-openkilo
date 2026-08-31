import type { Plugin } from "@opencode-ai/plugin";
import { execFileSync } from "node:child_process";

// Auto-commit worktree changes when a primary session turn goes idle.
// Commit only, never push. Skips: non-repos, detached HEAD, in-progress
// merge/rebase, no changes, subagent turns.
// Secrets: .env*, *.pem, *.key never staged (pathspec exclude); git add
// already respects .gitignore for everything else.
// Commit subject: opencode zen free model (anonymous, no key) with
// mechanical file-list fallback. Any LLM failure falls back silently.
// Benchmarked 2026-08-30: lightning ~20-55s (works), mimo-free 429,
// muse-spark 500, nemotron-ultra >90s timeout. All async, never blocks.

const EXCLUDES = [".env", ".env.*", "*.pem", "*.key"];
const DIFF_CAP = 6000;
const LLM_TIMEOUT_MS = 45000;
const LLM_MAX_TOKENS = 2000; // lightning thinks in-band: budget must fit reasoning + subject
const ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";
const DEFAULT_ZEN_MODEL = "nemotron-3.5-lightning-free";
// Matches a conventional commit subject line anywhere in (possibly
// chain-of-thought) output. Lightning concludes its thinking with the
// subject, so the LAST match wins.
const CONVENTIONAL_RE = /^\s*(feat|fix|chore|refactor|docs|test|perf|style|build|ci|revert)(\([^)]*\))?:\s*(.+)$/i;

type Cfg = { small_model?: string };

function git(root: string, args: string[]): { ok: boolean; out: string } {
  try {
    return { ok: true, out: execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }) };
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer | string; message?: string };
    return { ok: false, out: String(err?.stdout ?? err?.message ?? "") };
  }
}

function zenModel(cfg: Cfg | null): string {
  const sm = cfg?.small_model;
  if (sm && sm.startsWith("opencode/")) return sm.slice("opencode/".length); // user-configured zen free model
  return DEFAULT_ZEN_MODEL;
}

// Some routers append "data: [DONE]" to non-stream JSON; slice to the outer braces.
function parseRouterJSON(raw: string): unknown | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function firstLine(s: string): string {
  const line = s
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  return line ? line.replace(/^["'`]+|["'`]+$/g, "").slice(0, 72).trim() : "";
}

function extractSubject(content: string): string {
  const lines = content.split("\n");
  const matches = lines
    .map((l) => l.match(CONVENTIONAL_RE))
    .filter((m): m is RegExpMatchArray => m !== null);
  if (matches.length > 0) {
    const last = matches[matches.length - 1];
    const subj = `${last[1]}${last[2] ?? ""}: ${last[3]}`.trim();
    return subj.slice(0, 72);
  }
  return firstLine(content); // last resort: first non-empty line
}

async function llmSubject(model: string, diff: string, stat: string): Promise<string> {
  const truncated = diff.length > DIFF_CAP;
  const body = {
    model,
    max_tokens: LLM_MAX_TOKENS,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You generate git commit subjects. Conventional Commits style (feat/fix/chore/refactor/docs/test/...). Output ONLY the subject line, max 72 chars, no quotes, no body, no explanations.",
      },
      {
        role: "user",
        content: `Staged change summary:\n${stat}\n\nStaged diff${truncated ? " (truncated)" : ""}:\n${diff.slice(0, DIFF_CAP)}\n\nCommit subject:`,
      },
    ],
  };
  const res = await fetch(ZEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  if (!res.ok) return "";
  const json = parseRouterJSON(await res.text()) as {
    choices?: { message?: { content?: string | null } }[];
  } | null;
  return extractSubject(json?.choices?.[0]?.message?.content ?? "");
}

export const AutoCommitPlugin: Plugin = async ({ directory, worktree }) => {
  const root = worktree || directory;
  let cfg: Cfg | null = null;

  return {
    config: (c) => {
      cfg = c as Cfg;
    },
    event: async ({ event }) => {
      if (event.type !== "session.idle") return;
      try {
        const props = (event as { properties?: { info?: { parentID?: string } } }).properties ?? {};
        if (props?.info?.parentID) return; // subagent turn, not the primary flow

        if (!git(root, ["rev-parse", "--is-inside-work-tree"]).ok) return; // not a repo
        if (!git(root, ["symbolic-ref", "-q", "HEAD"]).ok) return; // detached HEAD, don't strand commits
        if (git(root, ["rev-parse", "-q", "--verify", "MERGE_HEAD"]).ok) return; // merge in progress
        if (git(root, ["rev-parse", "-q", "--verify", "REBASE_HEAD"]).ok) return; // rebase in progress

        const st = git(root, ["status", "--porcelain"]);
        if (!st.ok) return;
        const changed = st.out
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (changed.length === 0) return;

        const add = git(root, ["add", "-A", "--", ".", ...EXCLUDES.map((e) => `:(exclude)${e}`)]);
        if (!add.ok) {
          console.error(`[auto-commit] git add failed in ${root}`);
          return;
        }

        const staged = git(root, ["diff", "--cached", "--name-only"]);
        if (!staged.ok) return;
        const files = staged.out
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (files.length === 0) return; // only excluded/ignored paths changed

        const list =
          files.slice(0, 8).join(", ") + (files.length > 8 ? ` +${files.length - 8} more` : "");
        const fallback = `chore(auto): ${files.length} file(s) - ${list}`;

        const diff = git(root, ["diff", "--cached"]);
        let subject = fallback;
        if (diff.ok) {
          const stat = git(root, ["diff", "--cached", "--stat"]);
          try {
            const s = await llmSubject(zenModel(cfg), diff.out, stat.ok ? stat.out : "");
            if (s) {
              subject = s;
              console.log(`[auto-commit] llm subject: ${s}`);
            } else {
              console.log(`[auto-commit] llm returned empty subject, using fallback`);
            }
          } catch (e) {
            console.log(`[auto-commit] llm failed, using fallback: ${(e as Error).message}`);
          }
        }

        const args = ["commit", "-m", subject];
        if (subject !== fallback) args.push("-m", `files: ${list}`);
        const c = git(root, args);
        if (!c.ok) {
          console.error(`[auto-commit] commit failed in ${root}: ${c.out.trim()}`);
          return;
        }
        console.log(`[auto-commit] ${root}: ${subject}`);
      } catch (e) {
        console.error(`[auto-commit] error:`, e);
      }
    },
  };
};
