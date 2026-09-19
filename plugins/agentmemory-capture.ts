import { execFileSync } from "node:child_process";
import { basename } from "node:path";

const API = process.env.AGENTMEMORY_URL || "http://localhost:3111";
// OpenCode reports tool names in lowercase ("read", "edit", ...); matching is
// case-insensitive at the call site so a future casing change cannot silently
// kill file enrichment again.
const FILE_TOOLS = new Set(["read", "write", "edit", "glob", "grep"]);
const FILE_KEYS = ["filePath", "file_path", "path", "file", "pattern"];
const MAX_STASHED_FILES = 10;

const DEBUG = process.env.OPENCODE_AGENTMEMORY_DEBUG === "1";
const SECRET = process.env.AGENTMEMORY_SECRET || "";

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (SECRET) headers["Authorization"] = `Bearer ${SECRET}`;
  return headers;
}

async function post(path: string, body: Record<string, unknown>, timeoutMs = 5000): Promise<void> {
  try {
    await fetch(`${API}/agentmemory${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    if (DEBUG) console.error(`[agentmemory] POST ${path} failed:`, (e as Error).message);
  }
}

async function postJson(path: string, body: Record<string, unknown>): Promise<unknown | null> {
  try {
    const res = await fetch(`${API}/agentmemory${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? await res.json() : null;
  } catch (e) {
    if (DEBUG) console.error(`[agentmemory] POST ${path} failed:`, (e as Error).message);
    return null;
  }
}

async function observe(
  sessionId: string,
  hookType: string,
  data: Record<string, unknown>,
): Promise<void> {
  const proj = projectFor(sessionId);
  // Lazy backfill: if session.created was missed (e.g. emitted before the
  // v2 event pump was wired), the first observation initializes the session.
  // Fire-and-forget: a slow or failed start must never block capture.
  if (!startedSessions.has(sessionId)) {
    void ensureSessionStart(sessionId, null, { name: proj.name, cwd: proj.cwd }).catch(() => {});
  }
  await post("/observe", {
    hookType,
    sessionId,
    project: proj.name,
    cwd: proj.cwd,
    timestamp: new Date().toISOString(),
    data,
  });
}

let activeSessionId: string | null = null;
let pendingConfig: Record<string, unknown> | null = null;
// Default scope resolved at plugin init (same resolution order as the hooks'
// resolveProject: env override, git toplevel basename, cwd basename). In a
// long-lived OpenCode process serving multiple directories these defaults are
// only a fallback — attribution is per-session via sessionProjects, resolved
// from each session's own directory at session.created. Module-level-only
// state recorded home-directory sessions under whatever repo loaded first.
let defaultProjectName: string | null = null;
let defaultProjectCwd: string | null = null;
const sessionProjects = new Map<string, { name: string; cwd: string }>();

function projectFor(sessionId: string): { name: string | null; cwd: string | null } {
  const p = sessionProjects.get(sessionId);
  return p ?? { name: defaultProjectName, cwd: defaultProjectCwd };
}

const projectNameCache = new Map<string, string>();

function resolveProjectName(dir: string): string {
  const explicit = process.env.AGENTMEMORY_PROJECT_NAME?.trim();
  if (explicit) return explicit;
  const cached = projectNameCache.get(dir);
  if (cached !== undefined) return cached;
  try {
    const top = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: dir,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();
    if (top) {
      const name = basename(top);
      projectNameCache.set(dir, name);
      return name;
    }
  } catch {
    // not a git repo, fall through
  }
  const fallback = basename(dir) || dir;
  projectNameCache.set(dir, fallback);
  return fallback;
}
const stashedFiles = new Map<string, Set<string>>();
const seenSubtaskIds = new Map<string, Set<string>>();
const seenToolCallIds = new Map<string, Set<string>>();
const contextInjectedSessions = new Set<string>();
// cache the context returned by POST /session/start so the chat
// system-transform hook can inject it without a second /context fetch.
// Auto-injection now happens at session.created (immediately) AND at
// the first prompt_submit (fallback for older OpenCode builds that
// don't implement experimental.chat.system.transform).
const startContextCache = new Map<string, string>();
// Sessions for which /session/start has been sent. Guards the lazy-start
// backfill: if session.created fired before the v2 event pump was wired,
// the first session-bearing event still initializes the session.
const startedSessions = new Set<string>();

async function ensureSessionStart(
  sessionId: string,
  info: Record<string, unknown> | null,
  proj: { name: string | null; cwd: string | null },
): Promise<void> {
  if (startedSessions.has(sessionId)) return;
  // Mark before the first await so concurrent callers cannot double-start.
  startedSessions.add(sessionId);
  const startResult = await postJson("/session/start", {
    sessionId,
    title: info?.title ?? null,
    parentID: info?.parentID ?? null,
    version: info?.version ?? null,
    project: proj.name,
    cwd: proj.cwd,
  });
  const startCtx = (startResult as any)?.context;
  if (typeof startCtx === "string" && startCtx.length > 0) {
    startContextCache.set(sessionId, startCtx);
  }
}

function stashFor(sid: string): Set<string> {
  let s = stashedFiles.get(sid);
  if (!s) { s = new Set<string>(); stashedFiles.set(sid, s); }
  return s;
}

function subtaskSetFor(sid: string): Set<string> {
  let s = seenSubtaskIds.get(sid);
  if (!s) { s = new Set<string>(); seenSubtaskIds.set(sid, s); }
  return s;
}

function toolCallSetFor(sid: string): Set<string> {
  let s = seenToolCallIds.get(sid);
  if (!s) { s = new Set<string>(); seenToolCallIds.set(sid, s); }
  return s;
}

function pruneSessionMaps(sid: string): void {
  stashedFiles.delete(sid);
  seenSubtaskIds.delete(sid);
  seenToolCallIds.delete(sid);
  sessionProjects.delete(sid);
  startedSessions.delete(sid);
}

function safeSlice(v: unknown, max: number): string {
  if (typeof v === "string") return v.slice(0, max);
  if (v == null) return "";
  try { return JSON.stringify(v).slice(0, max); } catch { return ""; }
}

const AGENTMEMORY_INSTRUCTIONS = `<agentmemory-instructions>
You have access to agentmemory for persistent cross-session memory. Use these tools proactively.

CORE TOOLS:

memory_save — Save an insight, decision, or fact to long-term memory.
  Required: content (text), concepts (2-5 comma-separated keywords), type (pattern/preference/architecture/bug/workflow/fact)
  Optional: files (comma-separated paths)
  Use when: user says "remember this", after discovering a bug, after making an architectural decision, after learning a project convention.

memory_recall — Search past observations by keywords.
  Use when: user says "recall", "what did we do", "do you remember", or needs context from past sessions.

memory_smart_search — Hybrid semantic+keyword search with progressive disclosure.
  Use when: you need the most relevant past context, fuzzy/conceptual searches, or recall doesn't find what you need.

memory_sessions — List recent sessions with status and observation counts.
  Use when: user asks about session/past history, "what did we work on".

memory_file_history — Get past observations about specific files (across all sessions).
  Use when: you're about to edit a file and want to know its history, common pitfalls, or past edits.

memory_lesson_save — Save a lesson learned (what worked, what to avoid).
  Use when: you discover a pattern that could help future sessions avoid mistakes.

memory_lesson_recall — Search lessons by query. Returns lessons sorted by confidence.
  Use when: before making a decision, check if past lessons apply.

memory_governance_delete — Delete specific memories. Requires explicit user confirmation.
  Use when: user says "forget this", "delete that memory".

memory_patterns — Detect recurring patterns across sessions.
  Use when: you want to understand project-level trends over time.

memory_consolidate — Run the 4-tier memory consolidation pipeline.
  Use when: you want to compress and organize accumulated session observations.

All memory tools start with \`agentmemory_memory_\`. Use the exact names as they appear in your tool list. Tool results are JSON. Always check what was returned before presenting to the user.
</agentmemory-instructions>`;

function extractFilePaths(args: Record<string, unknown>): string[] {
  const files: string[] = [];
  for (const key of FILE_KEYS) {
    const val = args[key];
    if (typeof val === "string" && val.length > 0) {
      files.push(val);
    }
  }
  return files;
}

function extractErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (e.data && typeof e.data === "object") {
      const d = e.data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
    }
    if (typeof e.name === "string") return e.name;
    try { return JSON.stringify(err); } catch { return ""; }
  }
  return String(err ?? "");
}

// Internal hook factory — the v2 default export below instantiates it and
// drives the returned hooks from v2 registrations. Not exported: v1-style
// named plugin exports are dead in the opencode >= 2.0 loader.
const AgentmemoryCapturePlugin = async (ctx: any) => {
  defaultProjectCwd = ctx.worktree || ctx.project?.id || process.cwd();
  defaultProjectName = resolveProjectName(defaultProjectCwd);

  return {
    event: async ({ event }) => {
      const type = event.type;
      const props = (event as any).properties || {};

      // ── session.created ──
      if (type === "session.created") {
        const info = props.info as Record<string, unknown> | undefined;
        activeSessionId = (info?.id as string) || props.sessionID || null;
        if (!activeSessionId) return;
        stashedFiles.set(activeSessionId, new Set());
        seenSubtaskIds.delete(activeSessionId);
        seenToolCallIds.delete(activeSessionId);
        contextInjectedSessions.delete(activeSessionId);
        // Snapshot the session id locally — `activeSessionId` is mutable
        // and another `session.created` event during the await could
        // rebind it, causing context to be cached against the wrong key.
        const sessionId = activeSessionId;
        // Attribute this session to its own directory when the event
        // carries one; a multi-directory OpenCode process otherwise
        // records every session under whichever repo loaded the plugin.
        const sessionDir =
          typeof info?.directory === "string" && info.directory
            ? info.directory
            : defaultProjectCwd;
        let proj: { name: string | null; cwd: string | null };
        if (sessionDir) {
          const entry = { cwd: sessionDir, name: resolveProjectName(sessionDir) };
          sessionProjects.set(sessionId, entry);
          proj = entry;
        } else {
          proj = projectFor(sessionId);
        }
        await ensureSessionStart(sessionId, (info ?? null) as Record<string, unknown> | null, proj);
        if (pendingConfig) {
          await observe(sessionId, "config_loaded", pendingConfig);
          pendingConfig = null;
        }
      }

      // ── session.idle ── (summarize handled in session.status idle branch)

      // ── session.status ──
      if (type === "session.status") {
        const status = props.status as Record<string, unknown> | undefined;
        const sid = props.sessionID || activeSessionId;
        if (!sid || !status) return;
        if (status.type === "idle") {
          await post("/summarize", { sessionId: sid });
        }
        await observe(sid, "session_status", {
          status_type: status.type,
          attempt: status.attempt ?? null,
          message: safeSlice(status.message, 2000),
        });
      }

      // ── session.compacted ──
      if (type === "session.compacted") {
        const sid = props.sessionID || activeSessionId;
        if (sid) {
          await post("/summarize", { sessionId: sid });
          await observe(sid, "session_compacted", {});
        }
      }

      // ── session.updated ──
      if (type === "session.updated") {
        const info = props.info as Record<string, unknown> | undefined;
        const sid = (info?.id as string) || props.sessionID || activeSessionId;
        if (!sid) return;
        await observe(sid, "session_updated", {
          title: info?.title ?? null,
          parentID: info?.parentID ?? null,
          additions: (info?.summary as any)?.additions ?? null,
          deletions: (info?.summary as any)?.deletions ?? null,
          files: (info?.summary as any)?.files ?? null,
        });
      }

      // ── session.diff ──
      if (type === "session.diff") {
        const sid = props.sessionID || activeSessionId;
        if (!sid || !Array.isArray(props.diff)) return;
        const diffs = props.diff as Array<Record<string, unknown>>;
        await observe(sid, "session_diff", {
          files: diffs.map(d => d.file),
          additions: diffs.reduce((s, d) => s + ((d.additions as number) || 0), 0),
          deletions: diffs.reduce((s, d) => s + ((d.deletions as number) || 0), 0),
          diffs: diffs.slice(0, 50),
        });
      }

      // ── session.deleted ──
      if (type === "session.deleted") {
        const sid = props.info?.id || props.sessionID || activeSessionId;
        if (!sid) {
          if (DEBUG) console.error("[agentmemory] session.deleted with no session ID");
          return;
        }
        await post("/session/end", { sessionId: sid });
        post("/crystals/auto", { olderThanDays: 7 }, 30000);
        post("/consolidate-pipeline", { tier: "all", force: true }, 30000);
        if (sid === activeSessionId) activeSessionId = null;
        pruneSessionMaps(sid);
        startContextCache.delete(sid);
        contextInjectedSessions.delete(sid);
      }

      // ── session.error ──
      if (type === "session.error") {
        const sid = props.sessionID || activeSessionId;
        if (sid) {
          await observe(sid, "post_tool_failure", {
            tool_name: "session.error",
            tool_input: "",
            tool_output: safeSlice(props.error, 6000),
          });
        }
      }

      // ── message.updated ──
      if (type === "message.updated") {
        const info = props.info as Record<string, unknown> | undefined;
        if (!info) return;

        if (info.role === "assistant") {
          const sid = props.sessionID || (info.sessionID as string) || activeSessionId;
          if (!sid) return;
          const tokens = info.tokens as Record<string, unknown> | undefined;
          const error = info.error ? extractErrorMessage(info.error) : null;
          await observe(sid, "assistant_message", {
            messageID: info.id,
            parentID: info.parentID,
            modelID: info.modelID,
            providerID: info.providerID,
            mode: info.mode,
            cost: info.cost ?? 0,
            tokens: {
              input: tokens?.input ?? 0,
              output: tokens?.output ?? 0,
              reasoning: tokens?.reasoning ?? 0,
              cache_read: (tokens?.cache as any)?.read ?? 0,
              cache_write: (tokens?.cache as any)?.write ?? 0,
            },
            finish: info.finish ?? null,
            error,
            duration_ms: (info.time && typeof (info.time as any).completed === "number")
              ? (info.time as any).completed - ((info.time as any).created || 0)
              : null,
          });
        }
      }

      // ── message.removed ──
      if (type === "message.removed") {
        const sid = props.sessionID || activeSessionId;
        if (sid) {
          await observe(sid, "message_removed", {
            messageID: props.messageID,
          });
        }
      }

      // ── message.part.updated ──
      if (type === "message.part.updated") {
        const part = props.part as Record<string, unknown> | undefined;
        if (!part) return;
        const sid = (part.sessionID as string) || props.sessionID || activeSessionId;
        if (!sid) return;

        if (part.type === "subtask") {
          const subtaskId = part.id as string;
          if (!subtaskId) return;
          const subtaskSet = subtaskSetFor(sid);
          if (subtaskSet.has(subtaskId)) return;
          subtaskSet.add(subtaskId);
          await observe(sid, "subagent_start", {
            subtask_id: part.id,
            agent: part.agent,
            prompt: safeSlice(part.prompt, 4000),
            description: safeSlice(part.description, 2000),
          });
          return;
        }

        if (part.type === "tool") {
          const state = part.state as Record<string, unknown> | undefined;
          if (!state) return;
          const callId = part.callID as string;
          if (!callId) return;
          const toolName = part.tool as string;

          if (state.status === "completed") {
            const callSet = toolCallSetFor(sid);
            if (callSet.has(callId)) return;
            callSet.add(callId);
            const st = state as Record<string, unknown>;
            const rawTime = (st.time as any) || {};
            const startTime = typeof rawTime.start === "number" ? rawTime.start : null;
            const endTime = typeof rawTime.end === "number" ? rawTime.end : null;
            await observe(sid, "post_tool_use", {
              tool_name: toolName,
              call_id: callId,
              tool_input: safeSlice(st.input, 4000),
              tool_output: safeSlice(st.output, 6000),
              title: st.title ?? null,
              metadata: st.metadata || {},
              duration_ms: (startTime != null && endTime != null) ? endTime - startTime : null,
              attachments: Array.isArray(st.attachments)
                ? (st.attachments as Array<Record<string, unknown>>).map(a => a.filename || a.url)
                : [],
            });
          } else if (state.status === "error") {
            const callSet = toolCallSetFor(sid);
            if (callSet.has(callId)) return;
            callSet.add(callId);
            const st = state as Record<string, unknown>;
            const rawTime = (st.time as any) || {};
            const startTime = typeof rawTime.start === "number" ? rawTime.start : null;
            const endTime = typeof rawTime.end === "number" ? rawTime.end : null;
            await observe(sid, "post_tool_failure", {
              tool_name: toolName,
              call_id: callId,
              tool_input: safeSlice(st.input, 4000),
              tool_output: safeSlice(st.error, 6000),
              duration_ms: (startTime != null && endTime != null) ? endTime - startTime : null,
            });
          }
          return;
        }

        if (part.type === "step-finish") {
          await observe(sid, "step_finish", {
            messageID: part.messageID,
            reason: part.reason ?? null,
            cost: (part as any).cost ?? 0,
            input_tokens: ((part as any).tokens?.input as number) ?? 0,
            output_tokens: ((part as any).tokens?.output as number) ?? 0,
            reasoning_tokens: ((part as any).tokens?.reasoning as number) ?? 0,
          });
          return;
        }

        if (part.type === "reasoning") {
          await observe(sid, "reasoning", {
            messageID: part.messageID,
            text: safeSlice((part as any).text, 4000),
          });
          return;
        }

        if (part.type === "file") {
          const filename = (part as any).filename || (part as any).url || null;
          if (filename) stashFor(sid).add(filename);
          return;
        }

        if (part.type === "patch") {
          await observe(sid, "patch_applied", {
            messageID: part.messageID,
            hash: (part as any).hash,
            files: (part as any).files || [],
          });
          return;
        }

        if (part.type === "compaction") {
          await observe(sid, "compaction_event", {
            messageID: part.messageID,
            auto: (part as any).auto ?? false,
          });
          return;
        }

        if (part.type === "agent") {
          await observe(sid, "agent_selected", {
            messageID: part.messageID,
            name: (part as any).name,
          });
          return;
        }

        if (part.type === "retry") {
          await observe(sid, "retry_attempt", {
            messageID: part.messageID,
            attempt: (part as any).attempt,
            error: safeSlice((part as any).error, 2000),
          });
          return;
        }
      }

      // ── file.edited ──
      if (type === "file.edited") {
        const sid = props.sessionID || activeSessionId;
        if (sid && typeof props.file === "string" && props.file.length > 0) {
          const stash = stashFor(sid);
          stash.add(props.file);
          if (stash.size > MAX_STASHED_FILES) {
            const keep = [...stash].slice(-MAX_STASHED_FILES);
            stash.clear();
            for (const f of keep) stash.add(f);
          }
        }
      }

      // ── permission.updated ──
      if (type === "permission.updated") {
        const sid = props.sessionID || activeSessionId;
        if (!sid) return;
        await observe(sid, "notification", {
          notification_type: "permission_prompt",
          permission: props.type || "unknown",
          pattern: Array.isArray(props.pattern)
            ? props.pattern.join(", ")
            : (props.pattern || ""),
          tool_call_id: props.callID || null,
          title: props.title || props.type || "",
          metadata: props.metadata || {},
        });
      }

      // ── permission.replied ──
      if (type === "permission.replied") {
        const sid = props.sessionID || activeSessionId;
        if (!sid) return;
        await observe(sid, "permission_replied", {
          permission_id: props.permissionID || props.requestID || "",
          response: props.response || props.reply || "",
        });
      }

      // ── todo.updated ──
      if (type === "todo.updated") {
        const sid = props.sessionID || activeSessionId;
        const todos = Array.isArray(props.todos) ? props.todos.slice(0, 100) : [];
        if (!sid || todos.length === 0) return;
        const completed = todos.filter((t: any) => t.status === "completed");
        const active = todos.filter((t: any) => t.status !== "completed");
        await observe(sid, "task_completed", {
          completed: completed.map((t: any) => ({ content: t.content, priority: t.priority })),
          in_progress: active.map((t: any) => ({ content: t.content, priority: t.priority })),
          total: todos.length,
        });
      }

      // ── command.executed ──
      if (type === "command.executed") {
        const sid = props.sessionID || activeSessionId;
        if (sid) {
          await observe(sid, "command_executed", {
            name: props.name,
            arguments: props.arguments || "",
          });
        }
      }
    },

    // ── chat.message ──
    "chat.message": async (input, output) => {
      const sid = input.sessionID || activeSessionId;
      if (!sid) return;
      const parts = output.parts || [];
      const files = parts
        .filter((p: any) => p.type === "file")
        .map((p: any) => p.filename || p.url)
        .filter(Boolean);
      for (const f of files) {
        const stash = stashFor(sid);
        stash.add(f);
        if (stash.size > MAX_STASHED_FILES) {
          const keep = [...stash].slice(-MAX_STASHED_FILES);
          stash.clear();
          for (const k of keep) stash.add(k);
        }
      }

      const textParts = parts.filter((p: any) => p.type === "text" && !p.synthetic && !p.ignored);
      const userText = textParts.map((p: any) => p.text || "").join("\n");

      await observe(sid, "prompt_submit", {
        agent: input.agent ?? null,
        model: input.model ?? null,
        variant: input.variant ?? null,
        prompt: userText.slice(0, 6000),
        files: files.slice(0, 20),
        parts_summary: parts.map((p: any) => p.type).filter(Boolean),
      });
    },

    // ── chat.params ──
    "chat.params": async (input, output) => {
      if (!input.model || !output) return;
      const sid = input.sessionID || activeSessionId;
      if (!sid) return;
      await observe(sid, "llm_params", {
        agent: input.agent,
        model: `${input.model.providerID}/${input.model.id}`,
        provider_url: input.model.api?.url ?? null,
        temperature: output.temperature,
        topP: output.topP,
        max_output_tokens: input.model.limit?.output ?? null,
        context_limit: input.model.limit?.context ?? null,
        cost_1k_input: input.model.cost?.input ?? 0,
        cost_1k_output: input.model.cost?.output ?? 0,
      });
    },

    // ── tool.execute.before ──
    "tool.execute.before": async (input, output) => {
      if (!FILE_TOOLS.has(String(input.tool ?? "").toLowerCase())) return;
      const sid = input.sessionID || activeSessionId;
      if (!sid) return;
      const args = output.args as Record<string, unknown> | undefined;
      if (!args) return;
      const stash = stashFor(sid);
      for (const fp of extractFilePaths(args)) {
        stash.add(fp);
      }
      if (stash.size > MAX_STASHED_FILES) {
        const keep = [...stash].slice(-MAX_STASHED_FILES);
        stash.clear();
        for (const f of keep) stash.add(f);
      }
    },

    // ── experimental.chat.system.transform ──
    "experimental.chat.system.transform": async (input, output) => {
      const sid = input.sessionID || activeSessionId;
      if (!sid) return;

      if (!contextInjectedSessions.has(sid)) {
        if (!Array.isArray(output.system)) return;
        output.system.push(AGENTMEMORY_INSTRUCTIONS);
        // prefer the context already fetched at session.created;
        // fall back to a fresh /context call if the cache missed (e.g.
        // session resumed across plugin reloads).
        let ctx = startContextCache.get(sid);
        if (typeof ctx !== "string" || ctx.length === 0) {
          const result = await postJson("/context", {
            sessionId: sid,
            project: projectFor(sid).name,
          });
          ctx = (result as any)?.context;
        } else {
          startContextCache.delete(sid);
        }
        if (typeof ctx === "string" && ctx.length > 0) {
          output.system.push(ctx);
        }
        contextInjectedSessions.add(sid);
      }

      const stash = stashFor(sid);
      if (stash.size === 0) return;
      const files = [...stash].slice(0, 5);

      const enrichResult = await postJson("/enrich", {
        sessionId: sid,
        files,
        toolName: "enrich_inject",
      });

      const enrichCtx = (enrichResult as any)?.context;
      if (typeof enrichCtx === "string" && enrichCtx.length > 0) {
        if (Array.isArray(output.system)) {
          output.system.push(enrichCtx);
        }
        for (const f of files) stash.delete(f);
      }
    },

    // ── experimental.session.compacting (WIP) ──
    "experimental.session.compacting": async (input, output) => {
      const sid = input.sessionID || activeSessionId;
      if (!sid) return;

      const result = await postJson("/context", {
        sessionId: sid,
        project: projectFor(sid).name,
      });
      const ctx = (result as any)?.context;
      if (typeof ctx === "string" && ctx.length > 0) {
        if (Array.isArray(output.context)) {
          output.context.push(ctx);
        }
      }
    },

    // ── config ──
    config: async (input) => {
      const payload: Record<string, unknown> = {
        theme: input.theme ?? null,
        model: input.model ?? null,
        autoupdate: input.autoupdate ?? null,
        agents: typeof input.agent === "object" && input.agent !== null && !Array.isArray(input.agent)
          ? Object.keys(input.agent as Record<string, unknown>)
          : Array.isArray(input.agent) ? input.agent : [],
        mcp_servers: typeof input.mcp === "object" && input.mcp !== null && !Array.isArray(input.mcp)
          ? Object.keys(input.mcp as Record<string, unknown>)
          : Array.isArray(input.mcp) ? input.mcp : [],
        providers: typeof input.provider === "object" && input.provider !== null && !Array.isArray(input.provider)
          ? Object.keys(input.provider as Record<string, unknown>)
          : Array.isArray(input.provider) ? input.provider : [],
        permission: input.permission ?? null,
      };
      if (activeSessionId) {
        await observe(activeSessionId, "config_loaded", payload);
      } else {
        pendingConfig = payload;
      }
    },
  };
};

// ── v2 runtime (opencode >= 2.0) ─────────────────────────────────────────────
// Default export with id + setup, as required by the v2 plugin loader.
// Mapping from the v1 hooks above:
//   event                                  → for-await pump over the async
//                                            iterable from ctx.event.subscribe
//   tool.execute.before (file stash)       → ctx.tool.hook("execute.before")
//   experimental.chat.system.transform     → ctx.session.hook("context")
//                                            (best-effort injection)
//   experimental.session.compacting        → ctx.session.hook("compaction")
//   chat.message / chat.params / config    → no v2 equivalent; skipped names
//                                            reported in one warning
// The v1 factory is instantiated with a shim ctx and its returned hooks are
// driven from the v2 registrations, so all capture logic stays in one place.
export default {
  id: "agentmemory-capture",
  setup: async (ctx: any) => {
    const directory: string = ctx?.location?.directory ?? process.cwd();
    const v1 = await AgentmemoryCapturePlugin({
      worktree: directory,
      directory,
      project: { id: directory },
    } as any);
    const hooks = v1 ?? {};

    // Hooks with no v2 equivalent — all names collected and reported once.
    const skipped: string[] = [];
    for (const name of ["chat.message", "chat.params", "config"]) {
      if (hooks[name as keyof typeof hooks]) skipped.push(name);
    }
    if (skipped.length > 0) {
      console.error(
        `[agentmemory] v2 runtime: hook(s) with no v2 equivalent: ${skipped.join(", ")} — ` +
          "prompt/params/config capture is degraded. Event capture, file stash, " +
          "session_context telemetry, and compaction context injection remain active.",
      );
    }

    // ── event pump ──
    // ctx.event.subscribe() returns an async-iterable stream (each yielded
    // item is a decoded event), not a callback API. A callback argument lands
    // in the stream factory's ignored options slot, so callback passing is
    // only kept as a fallback for older runtime shapes.
    let cleanup: (() => Promise<void>) | null = null;
    if (typeof ctx?.event?.subscribe === "function") {
      let stream: any = null;
      try {
        stream = ctx.event.subscribe();
      } catch (e) {
        console.error(`[agentmemory] event subscribe failed: ${(e as Error).message}`);
      }
      if (stream && typeof stream[Symbol.asyncIterator] === "function") {
        const pump = (async () => {
          try {
            for await (const event of stream) {
              try {
                await hooks.event?.({ event });
              } catch (e) {
                if (DEBUG) console.error("[agentmemory] event handler failed:", (e as Error).message);
              }
            }
          } catch (e) {
            if (DEBUG) console.error("[agentmemory] event stream ended:", (e as Error).message);
          }
        })();
        cleanup = async () => {
          try { await stream.return?.(); } catch { /* already closed */ }
          try { await pump; } catch { /* settled above */ }
        };
      } else if (typeof stream === "function") {
        // Fallback: subscribe(handler) — handler receives the event directly.
        const sub = stream((event: any) => {
          void Promise.resolve()
            .then(() => hooks.event?.({ event }))
            .catch((e: Error) => {
              if (DEBUG) console.error("[agentmemory] event handler failed:", e.message);
            });
        });
        cleanup = async () => {
          try { await (sub as any)?.return?.(); } catch { /* noop */ }
        };
      } else {
        console.error("[agentmemory] ctx.event.subscribe returned no async iterable — event capture disabled");
      }
    } else {
      console.error("[agentmemory] ctx.event.subscribe unavailable — event capture disabled");
    }

    // ── session hooks (v2 replacements) ──
    if (typeof ctx?.session?.hook === "function") {
      try {
        await ctx.session.hook("context", async (input: any) => {
          try {
            const sid = input?.sessionID ?? input?.session?.id ?? null;
            if (sid && typeof sid === "string") {
              void ensureSessionStart(sid, null, projectFor(sid)).catch(() => {});
              await observe(sid, "session_context", { keys: Object.keys(input ?? {}) });
              // Best-effort injection: same cache the v1 system.transform used.
              const arr = Array.isArray(input?.context) ? input.context : Array.isArray(input?.system) ? input.system : null;
              const cached = startContextCache.get(sid);
              if (arr && typeof cached === "string" && cached.length > 0) {
                arr.push(cached);
                startContextCache.delete(sid);
              }
            }
          } catch (e) {
            if (DEBUG) console.error("[agentmemory] context hook failed:", (e as Error).message);
          }
        });
      } catch (e) {
        console.error(`[agentmemory] session.hook("context") failed: ${(e as Error).message}`);
      }
      try {
        await ctx.session.hook("compaction", async (input: any, output: any) => {
          try {
            const sid = input?.sessionID ?? input?.session?.id ?? null;
            if (sid && typeof sid === "string") {
              await observe(sid, "compaction_event", { auto: false });
              const result = await postJson("/context", { sessionId: sid, project: projectFor(sid).name });
              const ctxText = (result as any)?.context;
              const arr = Array.isArray(output?.context) ? output.context : null;
              if (typeof ctxText === "string" && ctxText.length > 0 && arr) {
                arr.push(ctxText);
              }
            }
          } catch (e) {
            if (DEBUG) console.error("[agentmemory] compaction hook failed:", (e as Error).message);
          }
        });
      } catch (e) {
        console.error(`[agentmemory] session.hook("compaction") failed: ${(e as Error).message}`);
      }
    }

    // ── file stash ──
    const toolHook = ctx?.tool?.hook;
    if (typeof toolHook === "function") {
      await toolHook("execute.before", async (payload: any) => {
        if (!FILE_TOOLS.has(String(payload?.tool ?? "").toLowerCase())) return;
        const sid = payload?.sessionID || activeSessionId;
        if (!sid) return;
        const args = (payload?.input ?? payload?.args) as Record<string, unknown> | undefined;
        if (!args) return;
        const stash = stashFor(sid);
        for (const fp of extractFilePaths(args)) {
          stash.add(fp);
        }
        if (stash.size > MAX_STASHED_FILES) {
          const keep = [...stash].slice(-MAX_STASHED_FILES);
          stash.clear();
          for (const f of keep) stash.add(f);
        }
      });
    }

    return cleanup ?? undefined;
  },
};
