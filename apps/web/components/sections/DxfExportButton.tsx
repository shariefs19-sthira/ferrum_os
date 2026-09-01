"use client"

import { writeDxf, testfitToDxfInput } from "../../lib/dxf/writeDxf"

type DxfExportButtonProps = {
  plot_width_m: number
  plot_depth_m: number
  setback_m?: number
  filename?: string
}

/**
 * Client-side DXF export — no server round-trip (LAUNCH_ARCHITECTURE.md:
 * "R2 deferred, exports stay client-side"). Generates the DXF text in
 * the browser and triggers a download via a Blob object URL.
 */
export default function DxfExportButton({
  plot_width_m,
  plot_depth_m,
  setback_m,
  filename = "testfit.dxf",
}: DxfExportButtonProps) {
  const handleExport = () => {
    const dxfInput = testfitToDxfInput({ plot_width_m, plot_depth_m, setback_m })
    const dxfText = writeDxf(dxfInput)
    const blob = new Blob([dxfText], { type: "application/dxf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center justify-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-ink transition hover:bg-relume-surface-secondary"
    >
      Export DXF
    </button>
  )
}
