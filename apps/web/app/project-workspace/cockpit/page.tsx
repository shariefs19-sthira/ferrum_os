"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { WorkspaceProduct, WorkspaceTool, WorkspaceMoreAction, WorkspaceExtract, WorkspaceProvenance } from "../../../lib/types"
import TabRail from "../../../components/workspace/TabRail"
import ToolsRuler from "../../../components/workspace/ToolsRuler"
import MoreDrawer from "../../../components/workspace/MoreDrawer"
import ExtractPanel from "../../../components/workspace/ExtractPanel"
import CanvasSlot from "../../../components/workspace/CanvasSlot"
import SutraPanel from "../../../components/workspace/SutraPanel"

/**
 * W2-401 WORKSPACE_SHELL — the cockpit. Assembly only (CRANE is the sole
 * editor of this file, per the disjoint-files split): TabRail/
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

  const [activeProduct, setActiveProduct] = useState<WorkspaceProduct>("Land")
  const [activeTool, setActiveTool] = useState<WorkspaceTool>("select")
  const [extractOpen, setExtractOpen] = useState(false)
  const [sutraOpen, setSutraOpen] = useState(false)
  const [territoryOpen, setTerritoryOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

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

  const handleCommand = (text: string) => {
    window.dispatchEvent(new CustomEvent("ferrum:workspace-command", { detail: text }))
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

  return (
    <div className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-relume-surface" data-workspace-fullscreen>
      <header className="flex min-h-12 items-center gap-2 border-b border-relume-border bg-relume-command px-3 text-white" aria-label="Workspace app bar">
        <strong className="font-heading text-sm">Ferrum Workspace</strong><span className="mr-auto text-xs text-white/60">{projectId}</span>
        <button type="button" aria-expanded={territoryOpen} onClick={()=>setTerritoryOpen(value=>!value)} className="min-h-10 rounded-full border border-white/25 px-3 text-xs">Territory</button>
        <button type="button" aria-expanded={extractOpen} onClick={()=>setExtractOpen(value=>!value)} className="min-h-10 rounded-full border border-white/25 px-3 text-xs">Extract</button>
        <button type="button" aria-expanded={sutraOpen} onClick={()=>setSutraOpen(value=>!value)} className="min-h-10 rounded-full bg-relume-accent px-3 text-xs font-semibold text-relume-command">SUTRA</button>
      </header>
      <TabRail activeProduct={activeProduct} onProductChange={setActiveProduct} />
      <div className="relative min-h-0 flex-1 overflow-hidden">
      <main className="h-full min-h-0">
        <CanvasSlot product={activeProduct} onLiveMetricsChange={handleLiveMetricsChange} />
      </main>
      <div className="absolute left-2 top-2 z-30 max-w-[calc(100%-1rem)] shadow-lg"><ToolsRuler
        activeTool={activeTool}
        extractOpen={extractOpen}
        onExtractOpenChange={setExtractOpen}
        onMoreOpenChange={setMoreOpen}
        onToolChange={setActiveTool}
      /></div>
      {territoryOpen && <aside className="absolute bottom-2 left-2 top-2 z-40 w-[min(20rem,calc(100%-1rem))] overflow-y-auto border border-relume-border bg-white p-5 shadow-2xl" aria-label="Territorial context"><button type="button" onClick={()=>setTerritoryOpen(false)} className="float-right min-h-11 px-3">Close</button><p className="text-xs font-semibold uppercase tracking-wider text-relume-muted">Territorial context</p><h2 className="mt-3 text-xl font-semibold">No parcel attached</h2><p className="mt-3 text-sm leading-6 text-relume-muted">This preview has no authoritative parcel or jurisdiction record. Attach a verified LandIntel result before applying territorial constraints.</p><span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold">ROADMAP</span></aside>}
      {sutraOpen && <div className="absolute bottom-2 right-2 top-2 z-40 w-[min(22rem,calc(100%-1rem))] shadow-2xl"><SutraPanel onSubmit={handleCommand} /></div>}
      {extractOpen && <div className="absolute inset-x-2 bottom-2 z-50 max-h-[65%] overflow-y-auto shadow-2xl"><ExtractPanel areaSquareMetres={liveMetrics?.areaSquareMetres} extracts={liveMetrics?.extracts ?? noExtracts} lengthMetres={liveMetrics?.lengthMetres} onClose={() => setExtractOpen(false)} product={activeProduct} provenance={liveMetrics?.provenance ?? noProvenance} /></div>}
      </div>
      <MoreDrawer onMoreAction={handleMoreAction} onMoreOpenChange={setMoreOpen} open={moreOpen} />
    </div>
  )
}
