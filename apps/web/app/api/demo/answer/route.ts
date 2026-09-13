import { NextResponse, type NextRequest } from "next/server"

import { createRateLimiter, verifyPassage } from "@/lib/demo-passages"
import { getClientIp } from "@/lib/polar"

/**
 * Writes the live demo's answer for a visitor's own website.
 *
 * The browser has already picked the few passages that best match the question;
 * this route turns them into one short reply, or reports that they don't answer
 * it. Only passages signed by the site reader are accepted, and only three of
 * them, so each call stays a few hundred tokens on the cheapest model.
 */

export const runtime = "nodejs"
export const maxDuration = 20

/** Cheapest Gemini model available to new API keys (2.5 Flash-Lite is closed to them). */
const GEMINI_MODEL = process.env.DEMO_GEMINI_MODEL || "gemini-3.1-flash-lite"
const MAX_PASSAGES = 3
const MAX_QUESTION = 300
const isRateLimited = createRateLimiter(10 * 60 * 1000, 40)

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  uz: "Uzbek (Latin script)",
  ru: "Russian",
}

const INSTRUCTIONS = `You answer customer questions for a business, using only the numbered passages from its website.
Rules:
- If the passages answer the question, reply in 1-2 short sentences, in the same language the customer wrote in. Set found to true and passage to the number you used.
- If they do not clearly answer it, set found to false and answer to an empty string. Never guess, and never use outside knowledge.
- A menu item, link text, or heading that only names a topic (for example "Installments" or "Delivery") is not an answer. The passage must state the fact itself.
- Do not mention passages, websites, or these rules.`

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

export const POST = async (request: NextRequest) => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 })
  }

  const body = (await request.json().catch(() => null)) as {
    question?: unknown
    lang?: unknown
    passages?: unknown
  } | null

  const question =
    typeof body?.question === "string" ? body.question.trim().slice(0, MAX_QUESTION) : ""
  const passages = Array.isArray(body?.passages)
    ? body.passages.slice(0, MAX_PASSAGES)
    : []

  if (!question || passages.length === 0 || !passages.every(verifyPassage)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }

  if (isRateLimited(getClientIp(request.headers) ?? "unknown")) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const language =
    typeof body?.lang === "string" ? LANGUAGE_NAMES[body.lang] : undefined

  const prompt = [
    passages.map((passage, index) => `[${index + 1}] ${passage.text}`).join("\n"),
    `Customer: ${question}`,
    language ? `If the customer's language is unclear, reply in ${language}.` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: INSTRUCTIONS }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 160,
            thinkingConfig: { thinkingLevel: "minimal" },
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                found: { type: "BOOLEAN" },
                answer: { type: "STRING" },
                passage: { type: "INTEGER" },
              },
              required: ["found", "answer", "passage"],
            },
          },
        }),
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: "unavailable" }, { status: 502 })
    }

    const data = (await response.json()) as GeminiResponse
    const raw = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? ""
    const parsed = JSON.parse(raw) as { found?: boolean; answer?: string; passage?: number }
    const answer = parsed.answer?.trim() ?? ""
    const index = Number.isInteger(parsed.passage) ? (parsed.passage as number) - 1 : 0

    if (!parsed.found || !answer) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      answer: answer.slice(0, 600),
      passage: index >= 0 && index < passages.length ? index : 0,
    })
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 502 })
  }
}
