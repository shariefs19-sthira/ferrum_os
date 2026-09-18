"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { answerWithGrounding, type Citation, type ConciergeAnswer } from "../lib/ai/concierge"
import { recordFeedback } from "../lib/ai/feedback"
import { AGENT_MODELS, CONSTRUCTION_CONNECTOR_GROUPS, canRunModel, type AgentModelId } from "../lib/ai/agentRegistry"

type Message = {
  role: "user" | "assistant"
  text: string
  citations?: Citation[]
  source?: ConciergeAnswer["source"]
  query?: string
  feedback?: "useful" | "not-useful"
  correctionOpen?: boolean
}

type SutraContext = {
  id: string
  label: string
  lens: string
  persona: string
  evidenceState: string
  provenance: string
  outputs: string[]
  controls: string[]
}

const QUICK_REPLIES = [
  { label: "Products", query: "products" },
  { label: "Pricing", query: "pricing" },
  { label: "Try a tool", query: "test-fit" },
  { label: "Talk to someone", query: "contact" },
]

/**
 * SUTRA — W2-307, grounded per AI-02 (CLAUDE-20260917-AI-FOUNDATION-LIVE).
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
    { role: "assistant", text: "Hi — I’m SUTRA. I can help you move through Ferrum OS, its products, tools, and project decisions. What are you working on?" },
  ])
  const panelRef = useRef<HTMLElement>(null)
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<number, string>>({})
  const [selectedModel, setSelectedModel] = useState<AgentModelId>("sutra")
  const [showConnections, setShowConnections] = useState(false)
  const [workspaceContext, setWorkspaceContext] = useState<SutraContext | null>(null)

  useEffect(() => {
    if (open && panelRef.current) panelRef.current.focus()
  }, [open])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("ferrum-sutra-product-context")
      if (stored) setWorkspaceContext(JSON.parse(stored) as SutraContext)
    } catch {
      setWorkspaceContext(null)
    }
    const handleContext = (event: Event) => setWorkspaceContext((event as CustomEvent<SutraContext>).detail)
    window.addEventListener("ferrum:sutra-context", handleContext)
    return () => window.removeEventListener("ferrum:sutra-context", handleContext)
  }, [])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: "user", text }])
    if (!canRunModel(selectedModel)) {
      const model = AGENT_MODELS.find((item) => item.id === selectedModel)
      setMessages((prev) => [...prev, { role: "assistant", text: `${model?.label ?? "This model"} needs an approved provider connection before it can run here. Until connected, it receives no Ferrum data or tool access. Select SUTRA to continue now.`, source: "deterministic", query: text }])
      setInput("")
      return
    }
    const asksAboutContext = workspaceContext && /current|this product|what can|available output|adjustable|evidence|explain/i.test(text)
    if (workspaceContext && asksAboutContext) {
      const outputs = workspaceContext.outputs.length ? ` Available outputs: ${workspaceContext.outputs.join("; ")}.` : " No live output is claimed for this product yet."
      const controls = workspaceContext.controls.length ? ` Adjustable inputs: ${workspaceContext.controls.join("; ")}.` : ""
      setMessages((prev) => [...prev, { role: "assistant", text: `${workspaceContext.label}: ${workspaceContext.lens} ${workspaceContext.persona}.${outputs}${controls} Evidence state: ${workspaceContext.evidenceState}. ${workspaceContext.provenance}`, source: "deterministic", query: text }])
      setInput("")
      return
    }
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

  return (
    <>
      {!open && (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open SUTRA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-relume-ink text-white shadow-lg transition hover:opacity-90 min-[1600px]:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.9-.32-4.14-.89L3 20l1.06-3.68A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      )}
    <aside
      ref={panelRef}
      role={open ? "dialog" : "complementary"}
      aria-label="SUTRA AI assistant"
      aria-modal="false"
      tabIndex={-1}
      className={`${open ? "flex" : "hidden"} fixed bottom-6 right-6 z-50 h-[28rem] max-h-dvh-safe-3rem w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-lg border border-relume-border bg-relume-surface shadow-xl min-[1600px]:inset-y-0 min-[1600px]:right-0 min-[1600px]:flex min-[1600px]:h-dvh min-[1600px]:max-h-none min-[1600px]:w-[22rem] min-[1600px]:max-w-none min-[1600px]:rounded-none min-[1600px]:border-y-0 min-[1600px]:border-r-0 min-[1600px]:shadow-none`}
      data-sutra
    >
      <div className="flex items-center justify-between border-b border-relume-border px-4 py-3 min-[1600px]:min-h-[4.75rem]">
        <div>
          <span className="block text-sm font-semibold tracking-[0.12em] text-relume-ink">SUTRA</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Ferrum OS AI agent</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close SUTRA"
          className="inline-flex h-11 w-11 items-center justify-center text-relume-ink min-[1600px]:hidden"
        >
          ✕
        </button>
      </div>

      <div className="border-b border-relume-border px-4 py-3">
        <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">
          Agent model
          <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value as AgentModelId)} className="mt-1 w-full rounded-relume border border-relume-border bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-relume-command" aria-label="Agent model">
            {AGENT_MODELS.map((model) => <option key={model.id} value={model.id}>{model.label} · {model.stateLabel}</option>)}
          </select>
        </label>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[10px] leading-4 text-relume-muted">Ferrum permissions govern every model and tool action.</p>
          <button type="button" onClick={() => setShowConnections((current) => !current)} className="min-h-11 shrink-0 rounded-full border border-relume-border px-3 text-xs font-semibold text-relume-command" aria-expanded={showConnections}>Connections</button>
        </div>
      </div>

      {showConnections ? <div className="flex-1 overflow-y-auto px-4 py-3" data-sutra-connections>
        <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3">
          <p className="text-xs font-semibold text-relume-command">Governed connector catalogue</p>
          <p className="mt-1 text-[10px] leading-4 text-relume-muted">Catalogue entries are connection targets, not claims of active integration. Each requires an official API, user authorization, and a Ferrum permission profile.</p>
        </div>
        <ul className="mt-3 space-y-3">{CONSTRUCTION_CONNECTOR_GROUPS.map((connector) => <li key={connector.group} className="border-b border-relume-border pb-3"><p className="text-xs font-semibold text-relume-command">{connector.group}</p><p className="mt-1 text-[11px] leading-5 text-relume-muted">{connector.items}</p></li>)}</ul>
      </div> : <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        {workspaceContext && <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3" data-sutra-context>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Working context</p>
          <p className="mt-1 text-sm font-semibold text-relume-command">{workspaceContext.label}</p>
          <button type="button" onClick={() => handleSend("Explain this product and what I can do here")} className="mt-2 min-h-11 rounded-full border border-relume-border bg-white px-3 text-xs font-semibold text-relume-command">Ask SUTRA about this workspace</button>
        </div>}
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
      </div>}

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
    </aside>
    </>
  )
}
