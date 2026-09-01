"use client"

import { useState } from "react"

type AskBandResult = { low: number; high: number; suggested: number; indicative: boolean }

/**
 * Transact Stage-1: ask-band estimator + urgency slider — W2-285.
 * Uses sample comparable multipliers, not a live listings feed
 * (labeled sample per docs/COMPLIANCE_GATE.md).
 */
export default function AskBandEstimator() {
  const [baseValue, setBaseValue] = useState("5000000")
  const [urgency, setUrgency] = useState(30)
  const [result, setResult] = useState<AskBandResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEstimate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ask-band", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_value: Number(baseValue), urgency }),
      })
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <label className="block text-sm text-relume-ink">
        Base value (₹, from sample comparables)
        <input value={baseValue} onChange={(e) => setBaseValue(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
      </label>
      <label className="mt-4 block text-sm text-relume-ink">
        Urgency: {urgency}%
        <input
          type="range"
          min={0}
          max={100}
          value={urgency}
          onChange={(e) => setUrgency(Number(e.target.value))}
          className="mt-2 w-full"
        />
      </label>
      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Estimating..." : "Estimate ask band"}
      </button>
      {result && (
        <div className="mt-6 space-y-2 text-sm text-relume-ink">
          <p><strong>Range:</strong> ₹{result.low.toLocaleString("en-IN")} – ₹{result.high.toLocaleString("en-IN")}</p>
          <p><strong>Suggested:</strong> ₹{result.suggested.toLocaleString("en-IN")}</p>
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-relume-ink">
            INDICATIVE — based on sample comparable data, not a live market feed. Not a legal or financial opinion; not a guaranteed sale price.
          </p>
        </div>
      )}
    </div>
  )
}
