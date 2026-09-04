"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { WorkspaceProduct, WorkspaceTool, WorkspaceMoreAction, WorkspaceExtract, WorkspaceProvenance } from "../../../lib/types"
import TabRail from "../../../components/workspace/TabRail"
import ToolsRuler from "../../../components/workspace/ToolsRuler"
import MoreDrawer from "../../../components/workspace/MoreDrawer"
import ExtractPanel from "../../../components/workspace/ExtractPanel"
import CanvasSlot from "../../../components/workspace/CanvasSlot"
import CommandBar from "../../../components/workspace/CommandBar"

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
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem('ferrum-preview-session', 'active')
  }, [])

  const handleMoreAction = (action: WorkspaceMoreAction) => {
    // Real actions (activity ledger, extract export, contextual help) are
    // separate, not-yet-built work - logging so the wiring point is
    // visible rather than silently doing nothing.
    // eslint-disable-next-line no-console
    console.log("[workspace] more action not yet wired:", action)
  }

  const handleCommand = (text: string) => {
    // eslint-disable-next-line no-console
    console.log("[workspace-command-bar] not yet wired to intent API:", text)
  }

  const noExtracts: WorkspaceExtract[] = []
  const noProvenance: WorkspaceProvenance = { source: "Not yet wired", freshness: "N/A", status: "ROADMAP" }

  return (
    <div className="flex h-screen flex-col">
      <TabRail activeProduct={activeProduct} onProductChange={setActiveProduct} />
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <p className="mb-3 text-xs text-relume-muted">Project: {projectId}</p>
          <CanvasSlot product={activeProduct} />
        </div>
        <ToolsRuler
          activeTool={activeTool}
          extractOpen={extractOpen}
          onExtractOpenChange={setExtractOpen}
          onMoreOpenChange={setMoreOpen}
          onToolChange={setActiveTool}
        />
      </div>
      {extractOpen && (
        <ExtractPanel
          extracts={noExtracts}
          onClose={() => setExtractOpen(false)}
          product={activeProduct}
          provenance={noProvenance}
        />
      )}
      <CommandBar onSubmit={handleCommand} />
      <MoreDrawer onMoreAction={handleMoreAction} onMoreOpenChange={setMoreOpen} open={moreOpen} />
    </div>
  )
}
