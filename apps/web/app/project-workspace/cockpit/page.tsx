"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { WorkspaceProduct, WorkspaceTool, WorkspaceMoreAction, WorkspaceExtract, WorkspaceProvenance } from "../../../lib/types"
import WorkflowRail from "../../../components/workspace/WorkflowRail"
import ToolsRuler from "../../../components/workspace/ToolsRuler"
import MoreDrawer from "../../../components/workspace/MoreDrawer"
import ExtractPanel from "../../../components/workspace/ExtractPanel"
import CanvasSlot, { productControls } from "../../../components/workspace/CanvasSlot"
import SutraPanel from "../../../components/workspace/SutraPanel"
import FullscreenController from "../../../components/workspace/FullscreenController"
import ProductSkin from "../../../components/workspace/ProductSkin"
import type { SutraEvent } from "../../../lib/sutra/events"
import { withWorkspaceProduct, workspaceProductFromParam } from "../../../lib/workspace/workflowNavigation"

/**
 * W2-401 WORKSPACE_SHELL — the cockpit. Assembly only (CRANE is the sole
 * editor of this file, per the disjoint-files split): WorkflowRail/
 * ToolsRuler/MoreDrawer/ExtractPanel are RIVET's (w2-401/rivet-
 * workspace-rails, already landed) - not rebuilt here, just wired
 * together. CanvasSlot is a placeholder for MASON's not-yet-landed S4
 * component. CommandBar is new, not yet wired to the intent API (7
 * enumerated intents: add-floor, set-setback, show-BOQ, check-structura,
 * save, switch-tab, units - that dispatch logic is separate, not-yet-
 * built work).
 *
 * Static route (not /project-workspace/[id]/): this site is a static
 * export (output: export, apps/web/out served via the ASSETS binding),
 * so a dynamic segment would need generateStaticParams() covering every
 * possible project id at build time, impossible for user-created
 * projects — caught by actually running the build, which failed with
 * the missing-generateStaticParams error on the first attempt. The
 * project id is read client-side from ?project= instead.
 *
 * No ?project= (the direct-entry route, /project-workspace itself,
 * operator W-26 routing flip): falls back to a stable 'preview' id and
 * sets the same 'ferrum-preview-session' localStorage flag PreviewGate
 * uses, rather than blocking on "no project selected" — there is no
 * server-side auth middleware on this static-export site to bypass
 * (checked: no middleware.ts exists; requireUser() only gates the
 * Worker's D1 API routes, never page rendering), so this flag is the
 * whole "preview session" concept.
 */
export default function ProjectWorkspaceCockpit() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project') ?? 'preview'

  const [activeProduct, setActiveProduct] = useState<WorkspaceProduct>(() => workspaceProductFromParam(searchParams.get('product')))
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("select")
  const [extractOpen, setExtractOpen] = useState(false)
  const [sutraOpen, setSutraOpen] = useState(true)
  const [territoryOpen, setTerritoryOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [lastSutraEvent, setLastSutraEvent] = useState<SutraEvent["type"] | "idle">("idle")
  const [intentStatus, setIntentStatus] = useState("Ready for a workspace command.")

  const handleProductChange = useCallback((product: WorkspaceProduct) => {
    setActiveProduct(product)
    window.history.replaceState(null, '', withWorkspaceProduct(window.location.href, product))
  }, [])

  // W2-502: SUTRA is a real `lg:`+ grid column (docked panel, not a
  // dialog) but an accessible overlay below that (tablet side sheet /
  // mobile bottom sheet - see the SUTRA region below). `isDesktopSutra`
  // is the one piece of breakpoint state JS needs to know about, purely
  // to decide role="dialog"/focus-trap-on-open/Escape-closes behaviour,
  // which only makes sense for the overlay presentation. Tailwind's `lg`
  // default (1024px) is used consistently everywhere else in this file's
  // classNames, so the matchMedia query mirrors it rather than
  // introducing a second breakpoint value.
  const [isDesktopSutra, setIsDesktopSutra] = useState(false)
  const sutraToggleRef = useRef<HTMLButtonElement | null>(null)
  const sutraRegionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    window.localStorage.setItem('ferrum-preview-session', 'active')
  }, [])

  const handleMoreAction = (action: WorkspaceMoreAction) => {
    if (action === "advanced") {
      window.dispatchEvent(new CustomEvent("ferrum:workspace-advanced"))
      return
    }
    // eslint-disable-next-line no-console
    console.log("[workspace] more action not yet wired:", action)
  }

  const handleCommand = async (text: string) => {
    const response = await fetch('/api/workspace/intent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phrase: text, projectId }) })
    const intent = await response.json().catch(() => null) as { action?: string; error?: string } | null
    if (!response.ok || !intent?.action) { setIntentStatus(intent?.error === 'unauthorized' ? 'Sign in is required to run workspace commands.' : 'That phrase is not a supported workspace command.'); return }
    setIntentStatus(`Resolved: ${intent.action.replaceAll('_', ' ')}.`)
    window.dispatchEvent(new CustomEvent("ferrum:workspace-command", { detail: text }))
    if (/boq|extract/i.test(text)) setExtractOpen(true)
    if (/diligence|permit/i.test(text)) setTerritoryOpen(true)
    if (/share workspace brief/i.test(text)) {
      const share = { title: 'Ferrum Workspace brief', text: 'INDICATIVE workspace brief', url: window.location.href }
      if (navigator.share) void navigator.share(share).catch(() => undefined)
      else void navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
    }
  }

  const handleSutraEvent = (event: SutraEvent) => {
    setLastSutraEvent(event.type)
    if (event.type === "TOOL_CALL" && event.tool === "workspace.command") void handleCommand(event.arguments.command)
  }

  const noExtracts: WorkspaceExtract[] = []
  const noProvenance: WorkspaceProvenance = { source: "Not yet wired", freshness: "N/A", status: "ROADMAP" }

  // Battery-fail (2): a tool mutate must recompute the extract panel
  // live. liveMetrics is set from WorkspaceCockpit's real derived state
  // via CanvasSlot -> WorkspaceCockpit's onLiveMetricsChange effect,
  // not hardcoded - falls back to noExtracts/noProvenance until the
  // canvas has computed its first plan.
  type LiveMetrics = { extracts: WorkspaceExtract[]; lengthMetres: number; areaSquareMetres: number; provenance: WorkspaceProvenance }
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null)
  const handleLiveMetricsChange = useCallback((metrics: LiveMetrics) => setLiveMetrics(metrics), [])

  const closeSutra = useCallback(() => {
    setSutraOpen(false)
    sutraToggleRef.current?.focus()
  }, [])

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktopSutra(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  // Accessible bottom sheet / side sheet (below `lg`): focus moves into
  // the panel the instant it opens, rather than staying stranded on
  // whatever the page previously focused.
  useEffect(() => {
    if (!sutraOpen || isDesktopSutra) return
    const panel = sutraRegionRef.current
    const focusable = panel?.querySelector<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')
    focusable?.focus()
  }, [sutraOpen, isDesktopSutra])

  // Escape closes the overlay and returns focus to the SUTRA toggle in
  // the header - same document-level-listener-while-open shape used by
  // MobileMenu.tsx / HomepageCockpitHero.tsx / WorkflowRail.tsx. Only wired
  // while SUTRA is presented as an overlay (below `lg`); at `lg`+ it's a
  // docked grid column, not a dismissible dialog.
  useEffect(() => {
    if (!sutraOpen || isDesktopSutra) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeSutra()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [sutraOpen, isDesktopSutra, closeSutra])

  return (
    <FullscreenController>{fullscreen => <div className="fixed inset-0 z-[70] flex h-dvh-safe flex-col overflow-hidden bg-relume-surface" data-workspace-fullscreen>
      <header className="flex min-h-12 items-center gap-2 border-b border-relume-border bg-relume-command px-3 text-white" aria-label="Workspace app bar">
        <Link href="/" className="font-heading text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent" aria-label="Ferrum home">Ferrum Workspace</Link><span className="mr-auto hidden text-xs text-white/60 sm:inline">{projectId}</span>
        <button type="button" aria-expanded={territoryOpen} onClick={()=>setTerritoryOpen(value=>!value)} className="min-h-10 rounded-full border border-white/25 px-3 text-xs"><span className="sm:hidden">Context</span><span className="hidden sm:inline">Project context</span></button>
        <button ref={sutraToggleRef} type="button" aria-expanded={sutraOpen} onClick={()=>setSutraOpen(value=>!value)} className="min-h-10 rounded-full bg-relume-accent px-3 text-xs font-semibold text-relume-command">SUTRA</button>
      </header>
      <WorkflowRail activeProduct={activeProduct} onProductChange={handleProductChange} />
      <p className="sr-only" aria-live="polite">{intentStatus}</p>
      {/* W2-502: a real CSS grid replaces the old `main` (padding-reserve)
          + absolutely-positioned-SUTRA pattern. SUTRA is a genuine grid
          column at `lg:`+ (only when `sutraOpen`, sized by the
          `--sutra-w` custom property below, clamp(22rem,26vw,30rem) -
          neither the fixed 22rem nor the 33vw-of-1920px "reserves a
          third of the screen" defect the fullscreen branch used to have),
          and an accessible overlay below `lg:` (tablet side sheet /
          mobile bottom sheet - see the SUTRA region itself). Closing
          SUTRA removes its column from `grid-template-columns` entirely
          (`lg:grid-cols-1` below), so the canvas column reflows to full
          width immediately - no residual reserved space to clean up. */}
      <div
        className={`relative grid min-h-0 flex-1 grid-cols-1 overflow-hidden transition-[grid-template-columns] duration-200 motion-reduce:transition-none ${sutraOpen ? 'lg:grid-cols-[minmax(0,1fr)_var(--sutra-w)]' : 'lg:grid-cols-1'}`}
        style={{ '--sutra-w': 'clamp(22rem, 26vw, 30rem)' } as React.CSSProperties}
      >
        {/* ToolsRuler, the territory panel and ExtractPanel stay
            absolutely-positioned overlays over the canvas - now children
            of `main` (the canvas's own grid column) instead of the old
            region, so they overlay only the canvas column and never sit
            under/over the SUTRA column at `lg:`+. */}
        <main className="relative h-full min-h-0 min-w-0" data-cockpit-region>
          <CanvasSlot product={activeProduct} onLiveMetricsChange={handleLiveMetricsChange} fullscreenControl={{ active: fullscreen.active, label: fullscreen.active ? 'Exit fullscreen' : 'Fullscreen ⛶', onClick: fullscreen.toggle }} sutraOccludesCanvas={sutraOpen && !isDesktopSutra} />
          <ProductSkin product={activeProduct} />
          {!fullscreen.active && <div className="absolute bottom-2 left-2 top-2 z-30 w-20 shadow-lg"><ToolsRuler
            activeTool={activeTool}
            extractOpen={extractOpen}
            onExtractOpenChange={setExtractOpen}
            onMoreOpenChange={setMoreOpen}
            onToolChange={setActiveTool}
            rail
          /></div>}
          {territoryOpen && <aside className="absolute bottom-2 left-2 top-2 z-40 w-[min(20rem,calc(100%-1rem))] overflow-y-auto border border-relume-border bg-white p-5 shadow-2xl" aria-label="Territorial context"><button type="button" onClick={()=>setTerritoryOpen(false)} className="float-right min-h-11 px-3">Close</button><p className="text-xs font-semibold uppercase tracking-wider text-relume-muted">Territorial context</p><h2 className="mt-3 text-xl font-semibold">No parcel attached</h2><p className="mt-3 text-sm leading-6 text-relume-muted">This preview has no authoritative parcel or jurisdiction record. Attach a verified LandIntel result before applying territorial constraints.</p><span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold">ROADMAP</span></aside>}
          {extractOpen && <div className="absolute inset-x-2 bottom-2 z-50 max-h-[65%] overflow-y-auto shadow-2xl"><ExtractPanel areaSquareMetres={liveMetrics?.areaSquareMetres} extracts={liveMetrics?.extracts ?? noExtracts} lengthMetres={liveMetrics?.lengthMetres} onClose={() => setExtractOpen(false)} product={activeProduct} provenance={liveMetrics?.provenance ?? noProvenance} /></div>}
        </main>
        {sutraOpen && (
          <div
            ref={sutraRegionRef}
            className="absolute inset-x-2 bottom-2 z-40 h-[72%] shadow-2xl md:inset-x-auto md:inset-y-0 md:bottom-0 md:left-auto md:right-0 md:top-0 md:h-full md:w-[var(--sutra-w)] lg:static lg:h-full lg:w-auto"
            data-sutra-region
            data-last-sutra-event={lastSutraEvent}
            role={isDesktopSutra ? undefined : 'dialog'}
            aria-modal={isDesktopSutra ? undefined : 'false'}
            aria-label="SUTRA design assistant"
          >
            <button type="button" onClick={closeSutra} className="absolute right-3 top-2 z-50 min-h-11 px-2 text-xs font-semibold text-white" aria-label="Close SUTRA">Close</button>
            <SutraPanel onEvent={handleSutraEvent} activeProduct={productControls[activeProduct]} />
          </div>
        )}
      </div>
      <MoreDrawer onMoreAction={handleMoreAction} onMoreOpenChange={setMoreOpen} open={moreOpen} />
    </div>}</FullscreenController>
  )
}
