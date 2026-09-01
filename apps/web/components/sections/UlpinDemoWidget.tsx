"use client"

import { useState } from "react"

type ParcelResult = {
  ulpin: string
  state: string
  district: string
  area_sqm: number
  land_use: string
  indicative: boolean
}

const SAMPLE_ULPINS = ["KA-BLR-0001-2024", "MH-PUN-0002-2024", "TN-CHN-0003-2024"]

/**
 * Parity: ULPIN demo (sample data) — W2-269. Calls the real
 * /api/ulpin/:id route against the seeded indicative D1 dataset.
 * Separate from the pre-existing LandIntelLookup component, which
 * targets a different (localhost:8000) backend and is out of scope
 * for this task — left untouched.
 */
export default function UlpinDemoWidget() {
  const [ulpin, setUlpin] = useState(SAMPLE_ULPINS[0])
  const [result, setResult] = useState<ParcelResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/ulpin/${encodeURIComponent(ulpin)}`)
      if (!res.ok) {
        setError("No sample parcel found for that ULPIN. Try one of the sample IDs below.")
        return
      }
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="flex flex-wrap gap-2">
        {SAMPLE_ULPINS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setUlpin(sample)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${ulpin === sample ? "border-relume-ink bg-relume-ink text-white" : "border-relume-border text-relume-ink"}`}
          >
            {sample}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <input value={ulpin} onChange={(e) => setUlpin(e.target.value)} className="flex-1 rounded-lg border border-relume-border px-3 py-2 text-sm" />
        <button
          type="button"
          onClick={handleLookup}
          disabled={loading}
          className="rounded-full bg-relume-ink px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Looking up..." : "Lookup"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-relume-ink sm:grid-cols-4">
          <p><strong>State:</strong> {result.state}</p>
          <p><strong>District:</strong> {result.district}</p>
          <p><strong>Area:</strong> {result.area_sqm} m²</p>
          <p><strong>Land use:</strong> {result.land_use}</p>
        </div>
      )}
    </div>
  )
}
