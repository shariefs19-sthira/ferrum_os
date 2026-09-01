"use client"

import { useState } from "react"

type IsCheckResult = {
  code: string
  checks: Array<{ rule: string; pass: boolean; note: string }>
}

const STRUCTURE_TYPES = [
  { value: "rc-beam", label: "RC Beam (IS 456)" },
  { value: "steel-column", label: "Steel Column (IS 800)" },
]

/** Parity: IS 456/800 checker — W2-268. Calls the real /api/is-check route. */
export default function IsCheckWidget() {
  const [structureType, setStructureType] = useState("rc-beam")
  const [rcParams, setRcParams] = useState({ b: "300", d: "500", fy: "415", Ast: "600" })
  const [steelParams, setSteelParams] = useState({ K: "1", L: "3000", r: "25" })
  const [result, setResult] = useState<IsCheckResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    const params =
      structureType === "rc-beam"
        ? { b: Number(rcParams.b), d: Number(rcParams.d), fy: Number(rcParams.fy), Ast: Number(rcParams.Ast) }
        : { K: Number(steelParams.K), L: Number(steelParams.L), r: Number(steelParams.r) }
    try {
      const res = await fetch("/api/is-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structure_type: structureType, params }),
      })
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <label className="block text-sm text-relume-ink">
        Structure type
        <select
          value={structureType}
          onChange={(e) => setStructureType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm"
        >
          {STRUCTURE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      {structureType === "rc-beam" ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="text-sm text-relume-ink">
            b (mm)
            <input value={rcParams.b} onChange={(e) => setRcParams({ ...rcParams, b: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-relume-ink">
            d (mm)
            <input value={rcParams.d} onChange={(e) => setRcParams({ ...rcParams, d: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-relume-ink">
            fy (N/mm²)
            <input value={rcParams.fy} onChange={(e) => setRcParams({ ...rcParams, fy: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-relume-ink">
            Ast (mm²)
            <input value={rcParams.Ast} onChange={(e) => setRcParams({ ...rcParams, Ast: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <label className="text-sm text-relume-ink">
            K
            <input value={steelParams.K} onChange={(e) => setSteelParams({ ...steelParams, K: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-relume-ink">
            L (mm)
            <input value={steelParams.L} onChange={(e) => setSteelParams({ ...steelParams, L: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm text-relume-ink">
            r (mm)
            <input value={steelParams.r} onChange={(e) => setSteelParams({ ...steelParams, r: e.target.value })} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={handleCheck}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Run check"}
      </button>

      {result && (
        <div className="mt-6 space-y-3">
          {result.checks.map((check) => (
            <div key={check.rule} className={`rounded-lg border p-4 text-sm ${check.pass ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
              <p className="font-semibold text-relume-ink">{check.rule} — {check.pass ? "Pass" : "Fail"}</p>
              <p className="mt-1 text-relume-ink">{check.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
