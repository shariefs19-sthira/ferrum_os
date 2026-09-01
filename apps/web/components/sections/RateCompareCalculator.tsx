"use client"

import { useState } from "react"

type RateRow = { category: string; region: string; unit: string; rate: number; source: string }
type RateCompareResult = { category: string; region: string | null; rates: RateRow[]; indicative: boolean }

const CATEGORIES = ["Cement (OPC 53)", "TMT Steel (Fe 500D)", "Skilled Mason (labor)"]

/** Parity: rate-compare calculator — W2-271. Calls the real /api/rates/compare route. */
export default function RateCompareCalculator() {
  const [category, setCategory] = useState(CATEGORIES[0])
  const [result, setResult] = useState<RateCompareResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/rates/compare?category=${encodeURIComponent(category)}`)
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <label className="block text-sm text-relume-ink">
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <button
        type="button"
        onClick={handleCompare}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Comparing..." : "Compare rates"}
      </button>
      {result && result.rates.length > 0 && (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-relume-border">
              <th className="py-2 pr-4 font-semibold text-relume-ink">Region</th>
              <th className="py-2 pr-4 font-semibold text-relume-ink">Rate</th>
              <th className="py-2 font-semibold text-relume-ink">Unit</th>
            </tr>
          </thead>
          <tbody>
            {result.rates.map((row) => (
              <tr key={row.region} className="border-b border-relume-border">
                <td className="py-2 pr-4 text-relume-ink">{row.region}</td>
                <td className="py-2 pr-4 text-relume-ink">₹{row.rate}</td>
                <td className="py-2 text-relume-ink">{row.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
