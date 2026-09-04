// Prompt Polish: rewrite user prompt (shorter, clearer, always English) before it reaches the LLM.
// Opt-in: prefix prompt with "pp ". Without marker, prompt passes through untouched.
// Config via env: POLISH_BASE_URL, POLISH_API_KEY, POLISH_MODEL (OpenAI-compatible).
// Fail-open: any error sends the original prompt.
// Shows a TUI toast so the user can tell the hook actually ran.

const MARKER = /^pp[\s:]/

const SYSTEM = `You rewrite user prompts for a coding agent. Make the prompt concise, explicit, unambiguous, and in English.
Rules:
- ALWAYS output in English, regardless of the input language. Translate faithfully.
- Keep ALL technical substance: file paths, identifiers, constraints, numbers. Do not translate code identifiers.
- Fix grammar and vagueness; state the goal and expected outcome.
- Output ONLY the rewritten prompt. No commentary, no quotes.`

async function polish(prompt: string): Promise<string | null> {
  const base = process.env.POLISH_BASE_URL
  const key = process.env.POLISH_API_KEY
  const model = process.env.POLISH_MODEL
  if (!base || !key || !model) throw new Error("POLISH_BASE_URL/POLISH_API_KEY/POLISH_MODEL not set")
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 1024,
    }),
  })
  if (!res.ok) throw new Error(`polish API ${res.status}`)
  const data: any = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error("polish API returned empty content")
  return text
}

export const PromptPolish = async ({ client }: { client: any }) => {
  const toast = (message: string, variant: "info" | "warning" = "info") =>
    client?.tui?.showToast({ body: { message, variant } })?.catch(() => {})

  const warn = (message: string) =>
    client
      ?.app?.log({ body: { service: "prompt-polish", level: "warn", message } })
      ?.catch(() => console.warn("[prompt-polish]", message))

  return {
    "chat.message": async (_input: unknown, output: { parts: any[] }) => {
      const part = output.parts.find((p) => p.type === "text" && typeof p.text === "string")
      if (!part || !MARKER.test(part.text)) return
      const raw = part.text.replace(MARKER, "").trim()
      if (!raw) return
      try {
        const improved = await polish(raw)
        part.text = improved
        await toast("prompt has been enhanced")
      } catch (e: any) {
        await warn(`fail-open, original prompt sent: ${e?.message ?? e}`)
        await toast(`prompt-polish failed, original sent: ${e?.message ?? e}`, "warning")
      }
    },
  }
}
