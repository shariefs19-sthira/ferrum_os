"use client"

import { useState } from "react"

type Mode = "ferrum" | "govt" | "custom"

const CATEGORIES = ["Cement (OPC 53)", "TMT Steel (Fe 500D)", "Skilled Mason (labor)"]
const REGIONS = ["Bengaluru", "Pune", "Chennai"]

type GovtRateResult = { category: string; region: string; unit: string; rate: number; source_note: string; indicative: boolean }

/**
 * BOQ Pro three-mode rate calculator — W2-311. Mode 2 (GOVT REFERENCE)
 * and Mode 3 (CUSTOM) are real and functional. Mode 1 (FERRUM) ships
 * as a clearly labeled stub — the real weighted-rate engine lands
 * with W2-312 and this component is updated then, not before.
 */
export default function ThreeModeCalculator() {
  const [mode, setMode] = useState<Mode>("govt")

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("ferrum")}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${mode === "ferrum" ? "border-relume-ink bg-relume-ink text-white" : "border-relume-border text-relume-ink"}`}
        >
          Mode 1 · Ferrum
        </button>
        <button
          type="button"
          onClick={() => setMode("govt")}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${mode === "govt" ? "border-relume-ink bg-relume-ink text-white" : "border-relume-border text-relume-ink"}`}
        >
          Mode 2 · Govt reference
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`rounded-full border px-4 py-2 text-sm font-medium ${mode === "custom" ? "border-relume-ink bg-relume-ink text-white" : "border-relume-border text-relume-ink"}`}
        >
          Mode 3 · Custom
        </button>
      </div>

      <div className="mt-6">
        {mode === "ferrum" && <FerrumModeStub />}
        {mode === "govt" && <GovtReferenceMode />}
        {mode === "custom" && <CustomMode />}
      </div>
    </div>
  )
}

function FerrumModeStub() {
  return (
    <div className="rounded-lg border border-dashed border-relume-border p-6 text-center">
      <p className="text-sm font-semibold text-relume-ink">Coming soon</p>
      <p className="mt-2 text-sm text-relume-ink">
        The Ferrum weighted-rate engine — combining government reference, market data, and your own assumptions into one band — is being built next.
      </p>
    </div>
  )
}

function GovtReferenceMode() {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [region, setRegion] = useState(REGIONS[0])
  const [result, setResult] = useState<GovtRateResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/govt-reference-rate?category=${encodeURIComponent(category)}&region=${encodeURIComponent(region)}`)
      setResult(res.ok ? await res.json() : null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-relume-ink">
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm text-relume-ink">
          Region
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm">
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={handleLookup}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Looking up..." : "Look up reference rate"}
      </button>
      {result && (
        <div className="mt-4 text-sm text-relume-ink">
          <p><strong>Rate:</strong> ₹{result.rate} {result.unit}</p>
          <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs">
            INDICATIVE — {result.source_note}.
          </p>
        </div>
      )}
    </div>
  )
}

function CustomMode() {
  const [materialRate, setMaterialRate] = useState("400")
  const [laborRate, setLaborRate] = useState("800")
  const [quantity, setQuantity] = useState("100")
  const [cityFactor, setCityFactor] = useState("1.0")
  const [gstPct, setGstPct] = useState("18")

  const material = Number(materialRate) || 0
  const labor = Number(laborRate) || 0
  const qty = Number(quantity) || 0
  const city = Number(cityFactor) || 1
  const gst = Number(gstPct) || 0

  const base = (material + labor) * qty * city
  const gstAmount = base * (gst / 100)
  const total = base + gstAmount

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-relume-ink">
          Material rate (₹/unit)
          <input value={materialRate} onChange={(e) => setMaterialRate(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          Labour rate (₹/unit)
          <input value={laborRate} onChange={(e) => setLaborRate(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          Quantity
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          City factor (e.g. 1.0)
          <input value={cityFactor} onChange={(e) => setCityFactor(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm text-relume-ink">
          GST (%)
          <input value={gstPct} onChange={(e) => setGstPct(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
      </div>
      <div className="mt-6 space-y-1 text-sm text-relume-ink">
        <p>Base: ₹{base.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        <p>GST: ₹{gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
        <p className="font-semibold">Total: ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p>
      </div>
      <p className="mt-4 text-xs text-relume-ink opacity-70">Live recompute — updates as you change any field above.</p>
    </div>
  )
}
