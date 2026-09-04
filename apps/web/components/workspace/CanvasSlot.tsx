"use client"

import type { WorkspaceProduct } from "../../lib/types"
import WorkspaceCockpit from "./WorkspaceCockpit"

/** W2-401 canvas region; shell chrome and rail ownership remain separate. */
export default function CanvasSlot({ product }: { product: WorkspaceProduct }) {
  return (
    <div aria-label={`${product} workspace canvas`} data-workspace-canvas>
      <WorkspaceCockpit />
    </div>
  )
}
