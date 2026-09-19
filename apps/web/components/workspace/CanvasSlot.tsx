"use client"

import type { WorkspaceExtract, WorkspaceProduct, WorkspaceProvenance } from "../../lib/types"
import WorkspaceCockpit from "./WorkspaceCockpit"
import type { ProductControlId } from "../../lib/workspace/controlRegistry"

export const productControls: Record<WorkspaceProduct, ProductControlId> = { Land:"landintel", Design:"designstudio", Structure:"structura", Cost:"boq-pro", Market:"promarket", Procure:"procurehub", Invest:"investflow", Build:"buildos", Community:"communitybuild", Transact:"transact" }

type LiveMetrics = {
  extracts: WorkspaceExtract[]
  lengthMetres: number
  areaSquareMetres: number
  provenance: WorkspaceProvenance
}

/** W2-401 canvas region; shell chrome and rail ownership remain separate. */
export default function CanvasSlot({
  product,
  onLiveMetricsChange,
  fullscreenControl,
  sutraOccludesCanvas,
}: {
  product: WorkspaceProduct
  onLiveMetricsChange?: (metrics: LiveMetrics) => void
  fullscreenControl?: { active: boolean; label: string; onClick: () => void }
  /** SUTRA is presented as a full-height overlay over this canvas (below
   * the `lg` breakpoint, while open) -- z-40, above every canvas overlay
   * this component renders. Canvas-side floating controls that would sit
   * under that overlay (Site Constraints) hide instead of rendering
   * inert/unreachable behind it. */
  sutraOccludesCanvas?: boolean
}) {
  return (
    <div className="h-full" aria-label={`${product} workspace canvas`} data-workspace-canvas data-active-product={product}>
      <WorkspaceCockpit canvasFirst activeProduct={product} controlProduct={productControls[product]} onLiveMetricsChange={onLiveMetricsChange} fullscreenControl={fullscreenControl} sutraOccludesCanvas={sutraOccludesCanvas} />
    </div>
  )
}
