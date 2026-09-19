"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { answerWithGrounding, type Citation, type ConciergeAnswer } from "../lib/ai/concierge"
import { recordFeedback } from "../lib/ai/feedback"
import { AGENT_MODELS, CONSTRUCTION_CONNECTOR_GROUPS, canRunModel, type AgentModelId } from "../lib/ai/agentRegistry"
import { productFeatureRegistry, productLabels, type ProductFeature } from "../lib/productFeatureRegistry"
import type { CockpitProduct } from "./workspace/ProductCockpitPreview"
import type { UserRegionProfile } from "../lib/regions/regionPolicy"
import { trapTabKey, useBodyScrollLock, useMaxWidthQuery, useVisualViewportBox } from "../lib/sutra/mobileSheet"

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

// STANDING RULE (operator, 2026-09-19): an overlay/panel/tab never takes space
// from, covers, or reflows existing page content without an allotment the
// layout accounts for. Below DOCK_MIN_WIDTH_PX it must be a true modal (inert
// page, scrim, focus trap); at/above it, it gets a reserved column the page
// reflows around (body padding-right here). Encoded/checked by
// scripts/sutra-no-cover-audit.mjs.
const DOCK_MIN_WIDTH_PX = 1280

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
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi — I’m SUTRA. I can help you move through Ferrum OS, its products, tools, and project decisions. What are you working on?" },
  ])
  const panelRef = useRef<HTMLElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<number, string>>({})
  const [selectedModel, setSelectedModel] = useState<AgentModelId>("sutra")
  const [showConnections, setShowConnections] = useState(false)
  const [workspaceContext, setWorkspaceContext] = useState<SutraContext | null>(null)
  const [activeFeature, setActiveFeature] = useState<{ productId: CockpitProduct; feature: ProductFeature } | null>(null)
  const [regionProfile, setRegionProfile] = useState<UserRegionProfile | null>(null)
  const [cockpitPresent, setCockpitPresent] = useState(false)
  // Below DOCK_MIN_WIDTH_PX (1280) SUTRA is an explicit full-viewport MODAL
  // (inert page, scrim, focus trap) — phones and tablets alike. At/above it,
  // SUTRA is a docked panel and the page reflows to leave it a reserved
  // column (body padding-right), never covering existing content. Docked
  // width is fluid clamp(24rem, 28vw, 32rem) (operator pick, 2026-09-19);
  // the panel height (header to above the cookie bar) is unchanged from
  // SUTRA r2 at every width.
  const isModal = useMaxWidthQuery(DOCK_MIN_WIDTH_PX - 1)
  const viewportBox = useVisualViewportBox(open && isModal)
  const [chromeOpen, setChromeOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const restoreLauncherFocus = useRef(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  useBodyScrollLock(open && isModal)

  const minimize = () => {
    restoreLauncherFocus.current = true
    setOpen(false)
  }

  useEffect(() => {
    if (open || !restoreLauncherFocus.current) return
    restoreLauncherFocus.current = false
    launcherRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        minimize()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    const region = messagesRef.current
    if (open && region) region.scrollTop = region.scrollHeight
  }, [open, messages.length, showConnections])

  // >=1280: reserve the panel's width on the page (padding-right on body) so
  // SUTRA docks beside content instead of covering it. Animated, removed on
  // close/unmount/mode-change and on every route change (via the pathname
  // effect below), and skipped entirely under prefers-reduced-motion.
  useEffect(() => {
    if (!open || isModal) return
    const panel = panelRef.current
    if (!panel) return
    const body = document.body
    const prefersReducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const previousPadding = body.style.paddingRight
    const previousTransition = body.style.transition
    // Reserve everything from the panel's own left edge to the viewport's
    // right edge — not just the panel's own width — so the panel's right
    // offset margin (xl:right-[1.5rem]) is also inside the reserved column.
    // Using only rect.width left a sliver (the margin) where reflowed
    // content and the panel still overlapped.
    const reserve = () => { body.style.paddingRight = `${window.innerWidth - panel.getBoundingClientRect().left}px` }
    body.style.transition = prefersReducedMotion ? "none" : "padding-right 200ms ease"
    reserve()
    body.setAttribute("data-sutra-reflow", "true")
    // The fluid width tracks the viewport, so keep the reserved column in step on resize.
    window.addEventListener("resize", reserve)
    return () => {
      window.removeEventListener("resize", reserve)
      body.style.paddingRight = previousPadding
      body.style.transition = previousTransition
      body.removeAttribute("data-sutra-reflow")
    }
  }, [open, isModal])

  // <1280: SUTRA is a true modal — the rest of the page is inert (no focus,
  // no pointer events, hidden from assistive tech) so nothing is half-covered
  // by an undimmed panel. Reverted on close/unmount.
  useEffect(() => {
    if (!open || !isModal) return
    const keep = [panelRef.current, launcherRef.current].filter((el): el is HTMLElement => Boolean(el))
    const madeInert: HTMLElement[] = []
    // Walk down from <body> rather than only checking direct children: any
    // wrapper element that itself contains the panel/launcher is descended
    // into (not inerted), so this finds the real siblings to isolate even
    // when SUTRA is mounted a few levels deep (e.g. under a layout wrapper).
    const isolate = (node: Element) => {
      Array.from(node.children).forEach((child) => {
        if (!(child instanceof HTMLElement)) return
        if (keep.includes(child)) return // the panel/launcher itself — leave its own subtree alone
        if (keep.some((k) => child.contains(k))) {
          isolate(child) // a wrapper ancestor of the panel/launcher — descend, don't inert it
          return
        }
        if (child.hasAttribute("inert")) return
        child.setAttribute("inert", "")
        child.setAttribute("aria-hidden", "true")
        madeInert.push(child)
      })
    }
    isolate(document.body)
    return () => {
      madeInert.forEach((el) => {
        el.removeAttribute("inert")
        el.removeAttribute("aria-hidden")
      })
    }
  }, [open, isModal])

  // Route changes close SUTRA so no reflow/inert state lingers on the new page.
  const isFirstPathnameRender = useRef(true)
  useEffect(() => {
    if (isFirstPathnameRender.current) {
      isFirstPathnameRender.current = false
      return
    }
    setOpen(false)
  }, [pathname])

  const toggleChrome = () => {
    if (chromeOpen) setShowConnections(false)
    setChromeOpen((current) => !current)
  }
  const toggleContext = () => {
    setContextOpen((current) => !current)
  }
  const selectedModelLabel = AGENT_MODELS.find((model) => model.id === selectedModel)?.label ?? "SUTRA"

  useEffect(() => {
    const syncCockpitPresence = () => {
      const present = Boolean(document.querySelector('[data-workspace-cockpit]'))
      setCockpitPresent(present)
      if (launcherRef.current) launcherRef.current.style.display = present ? 'none' : ''
    }
    syncCockpitPresence()
    const observer = new MutationObserver(syncCockpitPresence)
    observer.observe(document.body, { childList: true, subtree: true })
    const openSutra = () => setOpen(true)
    const closeSutra = () => setOpen(false)
    window.addEventListener('ferrum:open-sutra', openSutra)
    window.addEventListener('ferrum:close-sutra', closeSutra)
    return () => {
      observer.disconnect()
      window.removeEventListener('ferrum:open-sutra', openSutra)
      window.removeEventListener('ferrum:close-sutra', closeSutra)
    }
  }, [])

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

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/region", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setRegionProfile(payload?.profile ?? null))
      .catch(() => setRegionProfile(null))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const handleToolSelection = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-sutra-product][data-sutra-feature-id]") : null
      if (!target) return
      const productId = target.dataset.sutraProduct as CockpitProduct
      const feature = productFeatureRegistry[productId]?.find((item) => item.id === target.dataset.sutraFeatureId)
      if (feature) setActiveFeature({ productId, feature })
    }
    document.addEventListener("click", handleToolSelection)
    return () => document.removeEventListener("click", handleToolSelection)
  }, [])

  const handleSend = (text: string) => {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { role: "user", text }])
    if (/my (region|country)|available in (my|this) (region|country)|regional availability/i.test(text) && regionProfile) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: `${regionProfile.label} is detected as a coarse, non-persisted experience region. Available now: ${regionProfile.enabledExperience.join(", ")}. Held pending a verified project jurisdiction: ${regionProfile.heldExperience.join(", ")}. Your project location, not this detected user location, governs design and compliance.`,
        source: "deterministic",
        query: text,
      }])
      setInput("")
      return
    }
    if (!canRunModel(selectedModel)) {
      const model = AGENT_MODELS.find((item) => item.id === selectedModel)
      setMessages((prev) => [...prev, { role: "assistant", text: `${model?.label ?? "This model"} needs an approved provider connection before it can run here. Until connected, it receives no Ferrum data or tool access. Select SUTRA to continue now.`, source: "deterministic", query: text }])
      setInput("")
      return
    }
    const contextualText = workspaceContext && /current|this product|what can|available output|adjustable|evidence|explain/i.test(text) && !text.toLowerCase().includes(workspaceContext.label.toLowerCase()) ? `${text} in ${workspaceContext.label}` : text
    const answer = answerWithGrounding(contextualText)
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

  const panelStyle: React.CSSProperties | undefined = open && isModal && viewportBox
    ? { top: viewportBox.top, height: viewportBox.height, bottom: "auto" }
    : undefined

  return (
    <>
      {!open && !cockpitPresent && (
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open SUTRA"
        aria-haspopup="dialog"
        aria-expanded={false}
        className="fixed bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+var(--cookie-consent-h,0px))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex h-12 items-center gap-2 rounded-full bg-relume-ink px-4 text-sm font-semibold tracking-[0.08em] text-white shadow-lg transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent [html:has([data-cookie-consent])_&]:max-sm:w-12 [html:has([data-cookie-consent])_&]:max-sm:justify-center [html:has([data-cookie-consent])_&]:max-sm:px-0"
        data-sutra-launcher
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.9-.32-4.14-.89L3 20l1.06-3.68A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="[html:has([data-cookie-consent])_&]:max-sm:sr-only">SUTRA</span>
      </button>
      )}
      {open && isModal && (
        <div
          className="fixed inset-0 z-40 bg-relume-ink/50 motion-reduce:transition-none"
          aria-hidden="true"
          data-sutra-scrim
          onClick={minimize}
        />
      )}
    <aside
      ref={panelRef}
      role={open ? "dialog" : "complementary"}
      aria-label="SUTRA AI assistant"
      aria-modal={open ? "true" : "false"}
      tabIndex={-1}
      onKeyDown={(event) => { if (open) trapTabKey(event, panelRef.current) }}
      style={panelStyle}
      className={`${open ? "flex" : "hidden"} fixed inset-0 z-50 flex-col overflow-hidden overscroll-contain bg-relume-surface outline-none xl:inset-auto xl:bottom-[calc(max(1.5rem,env(safe-area-inset-bottom))+var(--cookie-consent-h,0px))] xl:right-[max(1.5rem,env(safe-area-inset-right))] xl:top-[5rem] xl:w-[clamp(24rem,28vw,32rem)] xl:max-w-[calc(100vw-3rem)] xl:rounded-lg [@media(max-height:32rem)]:xl:top-2 xl:border xl:border-relume-border xl:shadow-xl motion-reduce:transition-none`}
      data-sutra
      data-sutra-fullscreen={open && isModal ? "true" : "false"}
      data-sutra-mode={isModal ? "modal" : "docked"}
    >
      <div className="flex items-center justify-between gap-2 border-b border-relume-border pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <span className="block text-sm font-semibold tracking-[0.12em] text-relume-ink">SUTRA</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-relume-muted">Ferrum OS AI agent</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={minimize}
            aria-label="Minimize SUTRA"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-relume-border px-3 text-xs font-semibold text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent"
            data-sutra-minimize
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeWidth={2.5} d="M5 19h14" /></svg>
            Minimize
          </button>
          <button
            type="button"
            onClick={minimize}
            aria-label="Close SUTRA"
            className="inline-flex h-11 w-11 items-center justify-center text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="border-b border-relume-border pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] max-h-[35%] overflow-y-auto overscroll-contain" data-sutra-chrome data-chrome-open={chromeOpen}>
        <button
          type="button"
          onClick={toggleChrome}
          aria-expanded={chromeOpen}
          aria-controls="sutra-chrome-panel"
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-xs font-semibold text-relume-command focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent"
        >
          <span className="min-w-0 truncate">Model &amp; connections <span className="font-normal text-relume-muted">· {selectedModelLabel}</span></span>
          <span aria-hidden="true" className="shrink-0 text-relume-muted">{chromeOpen ? "▴" : "▾"}</span>
        </button>
        <div id="sutra-chrome-panel" hidden={!chromeOpen} className="pb-3">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">
            Agent model
            <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value as AgentModelId)} className="mt-1 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 py-2 text-base font-semibold normal-case tracking-normal text-relume-command sm:text-sm" aria-label="Agent model">
              {AGENT_MODELS.map((model) => <option key={model.id} value={model.id}>{model.label} · {model.stateLabel}</option>)}
            </select>
          </label>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[10px] leading-4 text-relume-muted">Ferrum permissions govern every model and tool action.</p>
            <button type="button" onClick={() => setShowConnections((current) => !current)} className="min-h-11 shrink-0 rounded-full border border-relume-border px-3 text-xs font-semibold text-relume-command" aria-expanded={showConnections}>Connections</button>
          </div>
          <div className="mt-2 rounded-relume border border-relume-border bg-relume-surface-secondary px-3 py-2" data-region-profile>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-muted">Experience region</p>
            <p className="mt-1 text-xs font-semibold text-relume-command">{regionProfile ? `${regionProfile.label} · ${regionProfile.readiness}` : "Detecting coarse region…"}</p>
            <p className="mt-1 text-[10px] leading-4 text-relume-muted">User location personalizes discovery. Project location governs design and compliance.</p>
          </div>
        </div>
      </div>

      {showConnections ? <div ref={messagesRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3" data-sutra-connections>
        <div className="rounded-relume border border-relume-border bg-relume-surface-secondary p-3">
          <p className="text-xs font-semibold text-relume-command">Governed connector catalogue</p>
          <p className="mt-1 text-[10px] leading-4 text-relume-muted">Catalogue entries are connection targets, not claims of active integration. Each requires an official API, user authorization, and a Ferrum permission profile.</p>
        </div>
        <ul className="mt-3 space-y-3">{CONSTRUCTION_CONNECTOR_GROUPS.map((connector) => <li key={connector.group} className="border-b border-relume-border pb-3"><p className="text-xs font-semibold text-relume-command">{connector.group}</p><p className="mt-1 text-[11px] leading-5 text-relume-muted">{connector.items}</p></li>)}</ul>
      </div> : <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3" role="log" aria-live="polite" aria-label="Conversation" tabIndex={0} data-sutra-messages>
        {(workspaceContext || activeFeature) && <div className="rounded-relume border border-relume-border bg-relume-surface-secondary px-3" data-sutra-context data-context-open={contextOpen}>
          <button type="button" onClick={toggleContext} aria-expanded={contextOpen} aria-controls="sutra-context-body" className="flex min-h-11 w-full items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent">
            <span className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Working context</span><span className="block truncate text-sm font-semibold text-relume-command">{activeFeature ? productLabels[activeFeature.productId] : workspaceContext?.label}</span></span>
            <span aria-hidden="true" className="shrink-0 text-relume-muted">{contextOpen ? "▴" : "▾"}</span>
          </button>
          <div id="sutra-context-body" hidden={!contextOpen} className="pb-3">
            {activeFeature && <div className="rounded-relume border border-relume-border bg-white p-2"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Selected tool</p><p className="mt-1 text-xs font-semibold text-relume-command">{activeFeature.feature.title}</p></div>}
            <button type="button" onClick={() => activeFeature ? handleSend(`Explain ${activeFeature.feature.title} in ${productLabels[activeFeature.productId]}`) : handleSend(`Explain all features in ${workspaceContext?.label}`)} className="mt-2 min-h-11 rounded-full border border-relume-border bg-white px-3 text-xs font-semibold text-relume-command">{activeFeature ? `Explain ${activeFeature.feature.title}` : `Explain all ${workspaceContext?.label} features`}</button>
          </div>
        </div>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[88%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 text-left text-sm ${
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

      <div className="border-t border-relume-border bg-relume-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a product or tool..."
            aria-label="Message"
            enterKeyHint="send"
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-relume-border px-3 py-2 text-base sm:text-sm"
          />
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-relume-ink px-4 py-2 text-sm font-medium text-white"
          >
            Send
          </button>
        </form>
      </div>
    </aside>
    </>
  )
}
