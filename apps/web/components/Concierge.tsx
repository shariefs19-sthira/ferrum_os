"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { answerWithGrounding, type Citation, type ConciergeAnswer } from "../lib/ai/concierge"
import { recordFeedback } from "../lib/ai/feedback"

type Message = {
  role: "user" | "assistant"
  text: string
  citations?: Citation[]
  source?: ConciergeAnswer["source"]
  query?: string
  feedback?: "useful" | "not-useful"
  correctionOpen?: boolean
}

const QUICK_REPLIES = [
  { label: "Products", query: "products" },
  { label: "Pricing", query: "pricing" },
  { label: "Try a tool", query: "test-fit" },
  { label: "Talk to someone", query: "contact" },
]

/**
 * CONCIERGE — W2-307, grounded per AI-02 (CLAUDE-20260917-AI-FOUNDATION-LIVE).
 * Still no LLM, no external network call: answerWithGrounding tries the
 * deterministic catalog route first (free, instant), then a deterministic
 * keyword-retrieval index with visible citations, then an honest fallback
 * — never a fabricated answer. AI-03 adds local useful/not-useful +
 * optional correction capture, stored client-side only.
 */
export default function Concierge() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi — I can point you to a Ferrum OS product, tool, or page. What are you looking for?" },
  ])
  const panelRef = useRef<HTMLDivElement>(null)
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<number, string>>({})

  useEffect(() => {
    if (open && panelRef.current) panelRef.current.focus()
  }, [open])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: "user", text }])
    const answer = answerWithGrounding(text)
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: answer.text, citations: answer.citations, source: answer.source, query: text },
    ])
    if (answer.navigateHref) {
      setTimeout(() => router.push(answer.navigateHref as string), 400)
    }
    setInput("")
  }

  const handleFeedback = (index: number, useful: boolean, correction?: string) => {
    setMessages((prev) => {
      const next = [...prev]
      const m = next[index]
      if (!m || m.role !== "assistant" || m.feedback) return prev
      if (!useful && correction === undefined) {
        next[index] = { ...m, correctionOpen: true }
        return next
      }
      next[index] = { ...m, feedback: useful ? "useful" : "not-useful", correctionOpen: false }
      recordFeedback({
        query: m.query ?? "",
        answerText: m.text,
        answerSource: m.source ?? "fallback",
        useful,
        correction: correction?.trim() || undefined,
      })
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(input)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Ferrum OS concierge"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-relume-ink text-white shadow-lg transition hover:opacity-90"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.9-.32-4.14-.89L3 20l1.06-3.68A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Ferrum OS concierge"
      aria-modal="false"
      tabIndex={-1}
      className="fixed bottom-6 right-6 z-50 flex h-[28rem] max-h-dvh-safe-3rem w-[22rem] max-w-[calc(100vw-3rem)] flex-col rounded-lg border border-relume-border bg-relume-surface shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-relume-border px-4 py-3">
        <span className="text-sm font-semibold text-relume-ink">Ferrum OS Concierge</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close concierge"
          className="inline-flex h-11 w-11 items-center justify-center text-relume-ink"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "bg-relume-ink text-white" : "border border-relume-border text-relume-ink"
              }`}
            >
              {m.text}
            </span>
            {m.role === "assistant" && m.citations && m.citations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-relume-muted">
                <span>Source{m.citations.length > 1 ? "s" : ""}:</span>
                {m.citations.map((c, ci) => (
                  <a
                    key={ci}
                    href={c.href}
                    className="underline decoration-dotted hover:text-relume-ink"
                  >
                    {c.title}
                  </a>
                ))}
              </div>
            )}
            {m.role === "assistant" && m.source && m.source !== "deterministic" && (
              <div className="mt-1 text-xs text-relume-muted">
                {m.feedback ? (
                  <span>Thanks for the feedback.</span>
                ) : m.correctionOpen ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={correctionDrafts[i] ?? ""}
                      onChange={(e) => setCorrectionDrafts((prev) => ({ ...prev, [i]: e.target.value }))}
                      placeholder="What should it have said? (optional)"
                      aria-label="Correction for this answer"
                      className="min-h-11 min-w-0 flex-1 rounded-lg border border-relume-border px-2 py-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleFeedback(i, false, correctionDrafts[i] ?? "")}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-relume-border px-3 text-relume-ink"
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Was this useful?</span>
                    <button
                      type="button"
                      onClick={() => handleFeedback(i, true)}
                      aria-label="Mark answer as useful"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-relume-border px-2 text-relume-ink"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(i, false)}
                      aria-label="Mark answer as not useful"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-relume-border px-2 text-relume-ink"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-relume-border px-4 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => handleSend(q.query)}
              className="min-h-11 rounded-full border border-relume-border px-3 py-1 text-xs font-medium text-relume-ink"
            >
              {q.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a product or tool..."
            aria-label="Message"
            className="min-w-0 flex-1 rounded-lg border border-relume-border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-relume-ink px-4 py-2 text-sm font-medium text-white"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
