"use client"

import type { WorkspaceExtract, WorkspaceProduct, WorkspaceProvenance } from "../../lib/types"
import WorkspaceCockpit from "./WorkspaceCockpit"
import type { ProductControlId } from "../../lib/workspace/controlRegistry"

const productControls: Record<WorkspaceProduct, ProductControlId> = { Land:"landintel", Design:"designstudio", Structure:"structura", Cost:"boq-pro", Market:"promarket", Procure:"procurehub", Invest:"investflow", Build:"buildos", Community:"communitybuild", Transact:"transact" }

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
}: {
  product: WorkspaceProduct
  onLiveMetricsChange?: (metrics: LiveMetrics) => void
}) {
  return (
    <div className="h-full" aria-label={`${product} workspace canvas`} data-workspace-canvas>
      <WorkspaceCockpit canvasFirst controlProduct={productControls[product]} onLiveMetricsChange={onLiveMetricsChange} />
    </div>
  )
}
