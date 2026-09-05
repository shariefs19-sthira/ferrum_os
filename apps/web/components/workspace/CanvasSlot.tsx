"use client"

import type { WorkspaceExtract, WorkspaceProduct, WorkspaceProvenance } from "../../lib/types"
import WorkspaceCockpit from "./WorkspaceCockpit"

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
      <WorkspaceCockpit canvasFirst onLiveMetricsChange={onLiveMetricsChange} />
    </div>
  )
}
