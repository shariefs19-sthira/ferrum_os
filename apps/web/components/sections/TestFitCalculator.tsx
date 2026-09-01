"use client"

import { useState } from "react"
import DxfExportButton from "./DxfExportButton"

type TestFitResult = {
  testfit_id: string
  svg: string
  floor_area_sqm: number
  coverage_pct: number
}

/** Parity: FAR/test-fit calculator (SVG massing) — W2-266. Calls the real /api/testfit route. */
export default function TestFitCalculator() {
  const [plotWidth, setPlotWidth] = useState("20")
  const [plotDepth, setPlotDepth] = useState("30")
  const [floors, setFloors] = useState("2")
  const [setback, setSetback] = useState("2")
  const [result, setResult] = useState<TestFitResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCalculate = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/testfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plot_width_m: Number(plotWidth),
          plot_depth_m: Number(plotDepth),
          floors: Number(floors),
          setback_m: Number(setback),
        }),
      })
      if (!res.ok) throw new Error("Calculation failed")
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="text-sm text-relume-ink">
          Plot width (m)
          <input value={plotWidth} onChange={(e) => setPlotWidth(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          Plot depth (m)
          <input value={plotDepth} onChange={(e) => setPlotDepth(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          Floors
          <input value={floors} onChange={(e) => setFloors(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          Setback (m)
          <input value={setback} onChange={(e) => setSetback(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
      </div>
      <button
        type="button"
        onClick={handleCalculate}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Generate massing"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div dangerouslySetInnerHTML={{ __html: result.svg }} className="rounded-lg border border-relume-border p-4" />
          <div className="text-sm text-relume-ink">
            <p><strong>Floor area:</strong> {result.floor_area_sqm} m²</p>
            <p><strong>Coverage:</strong> {result.coverage_pct}%</p>
            <div className="mt-4">
              <DxfExportButton
                plot_width_m={Number(plotWidth)}
                plot_depth_m={Number(plotDepth)}
                setback_m={Number(setback)}
                filename={`testfit-${result.testfit_id}.dxf`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
