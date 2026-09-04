"use client"

import type { WorkspaceProduct } from "../../lib/types"

/**
 * W2-401 shell chrome — the main canvas area. This is MASON's
 * 3D-space/configurator component's slot, not a CRANE-owned
 * implementation (disjoint-files split: CRANE owns shell chrome/page
 * assembly, RIVET owns the tool-rail/extract-panel controls, MASON owns
 * the canvas itself). No real component exists yet to mount here (S4
 * STUDIO_3D is still OPEN as of this landing) — this placeholder exists
 * so the shell assembles and is swappable for the real component in one
 * line once it lands, rather than the shell's layout being blocked on
 * MASON's work finishing first.
 */
export default function CanvasSlot({ product }: { product: WorkspaceProduct }) {
  return (
    <div
      role="img"
      aria-label={`${product} canvas — not yet implemented`}
      className="flex min-h-96 flex-1 items-center justify-center rounded-relume border border-dashed border-relume-border text-sm text-relume-muted"
    >
      {product} canvas (MASON, not yet landed)
    </div>
  )
}
