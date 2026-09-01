"use client"

import { useState } from "react"

type CdeStatusResult = { project_id: string; phase: string; open_items: number; last_updated: string; indicative: boolean }

/** Parity: CDE dashboard mock — W2-272. Calls the real /api/cde-status/:project_id route (indicative). */
export default function CdeStatusMock() {
  const [projectId, setProjectId] = useState("demo-project-01")
  const [result, setResult] = useState<CdeStatusResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFetch = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cde-status/${encodeURIComponent(projectId)}`)
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="flex gap-3">
        <input value={projectId} onChange={(e) => setProjectId(e.target.value)} className="flex-1 rounded-lg border border-relume-border px-3 py-2 text-sm" />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="rounded-full bg-relume-ink px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Fetching..." : "Fetch status"}
        </button>
      </div>
      {result && (
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-relume-ink sm:grid-cols-3">
          <p><strong>Phase:</strong> {result.phase}</p>
          <p><strong>Open items:</strong> {result.open_items}</p>
          <p><strong>Updated:</strong> {new Date(result.last_updated).toLocaleString()}</p>
        </div>
      )}
      <p className="mt-4 text-xs text-relume-ink opacity-70">Indicative mock data — not a live CDE integration.</p>
    </div>
  )
}
