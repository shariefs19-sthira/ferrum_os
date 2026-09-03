"use client"

import { useState } from "react"
import SaveToWorkspaceButton from "../SaveToWorkspaceButton"

type IrrNpvResult = { irr: number | null; npv: number; indicative: boolean }

/** Parity: IRR/NPV modeler — W2-270. Calls the real /api/irr-npv route. */
export default function IrrNpvModeler() {
  const [cashFlows, setCashFlows] = useState("-1000, 300, 400, 500, 600")
  const [discountRate, setDiscountRate] = useState("10")
  const [result, setResult] = useState<IrrNpvResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleModel = async () => {
    setLoading(true)
    setError("")
    try {
      const parsed = cashFlows.split(",").map((v) => Number(v.trim()))
      if (parsed.some((v) => Number.isNaN(v))) throw new Error("Cash flows must be a comma-separated list of numbers")
      const res = await fetch("/api/irr-npv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cash_flows: parsed, discount_rate: Number(discountRate) / 100 }),
      })
      if (!res.ok) throw new Error("Modeling failed")
      setResult(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modeling failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <label className="block text-sm text-relume-ink">
        Cash flows (comma-separated, year 0 first)
        <input value={cashFlows} onChange={(e) => setCashFlows(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
      </label>
      <label className="mt-4 block max-w-xs text-sm text-relume-ink">
        Discount rate (%)
        <input value={discountRate} onChange={(e) => setDiscountRate(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
      </label>
      <button
        type="button"
        onClick={handleModel}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Modeling..." : "Calculate IRR/NPV"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-relume-ink">
          <p><strong>IRR:</strong> {result.irr !== null ? `${(result.irr * 100).toFixed(2)}%` : "Did not converge"}</p>
          <p><strong>NPV:</strong> ₹{result.npv.toLocaleString("en-IN")}</p>
          <div className="col-span-2">
            <SaveToWorkspaceButton
              type="irr_npv"
              title={`IRR/NPV — discount rate ${discountRate}%`}
              data={{ ...result, cash_flows: cashFlows.split(",").map((v) => Number(v.trim())), discount_rate: Number(discountRate) / 100 }}
              provenanceSource="Ferrum Analysis Engine (IRR/NPV calculator)"
              provenanceFreshness={new Date().toISOString()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
