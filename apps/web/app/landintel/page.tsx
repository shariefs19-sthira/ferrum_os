"use client"

import { useState, useEffect } from "react"
import PlotEstimator from "../../components/PlotEstimator"
import { SoilCard } from "../../components/sections/SoilCard"
import ProductSpecs from "../../components/ProductSpecs"

export default function LandIntelPage() {
  const [ulpin, setUlpin] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [mode, setMode] = useState<"live" | "fallback">("fallback")
  const [telemetry, setTelemetry] = useState({ live: 0, fallback: 0 })

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://localhost:8000/health")
        if (res.ok) {
          const data = await res.json()
          setTelemetry({
            live: data.live_count || 0,
            fallback: data.fallback_count || 0
          })
        }
      } catch (err) {
        console.error("Failed to fetch telemetry:", err)
      }
    }

    fetchTelemetry()
    const interval = setInterval(fetchTelemetry, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ulpin.length !== 14 || !/^\d+$/.test(ulpin)) {
      setError("ULPIN must be exactly 14 digits")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    setMode("fallback")
    try {
      const res = await fetch("http://localhost:8000/api/v1/ulpin/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ulpin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.message || "Lookup failed")
      setResult(data.data)
      setInfoMessage(data.message || "")
      setMode(data.mode === "live" ? "live" : "fallback")
      setError("")
    } catch (err: any) {
      setError(err.message || String(err))
      setInfoMessage("")
      setMode("fallback")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!result) return
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ulpin/${result.ulpin}/report`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `land_report_${result.ulpin}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("PDF download error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">LandIntel</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">ULPIN Lookup</h1>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${mode === "live" ? "border-emerald-200 bg-emerald-100 text-emerald-800" : "border-amber-200 bg-amber-100 text-amber-800"}`}>
            {mode === "live" ? "LIVE" : "FALLBACK"} {telemetry.live} / {telemetry.fallback}
          </span>
        </div>

        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Enter 14-digit ULPIN</label>
              <input
                type="text"
                maxLength={14}
                value={ulpin}
                onChange={(e) => setUlpin(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g., 12345678901234"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Fetching Land Data..." : "Lookup Land Details"}
            </button>
          </form>

          {infoMessage && infoMessage.toLowerCase().includes('offline') && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⚠️ {infoMessage}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h2 className="mb-3 text-lg font-semibold text-emerald-900">Land Found</h2>
                <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                  <p><span className="font-medium text-slate-900">Owner:</span> {result.ownerName}</p>
                  <p><span className="font-medium text-slate-900">Area:</span> {result.area} sq.ft</p>
                  <p><span className="font-medium text-slate-900">District:</span> {result.district}</p>
                  <p><span className="font-medium text-slate-900">Village:</span> {result.village}</p>
                  <p className="sm:col-span-2"><span className="font-medium text-slate-900">Survey No:</span> {result.surveyNo}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <h2 className="mb-3 text-lg font-semibold text-blue-900">Zoning Summary</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Permissible Use</p><p className="mt-2 font-bold text-blue-700">{result.zoning}</p></div>
                  <div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Max FAR</p><p className="mt-2 font-bold text-blue-700">{result.maxFAR}</p></div>
                  <div className="rounded-xl bg-white p-3 shadow-sm"><p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Max Height</p><p className="mt-2 font-bold text-blue-700">{result.maxHeight}</p></div>
                </div>
              </div>

              <SoilCard type={result.soilType || "Red Sandy Loam"} risk={result.floodRisk || "Low"} />

              <button
                onClick={downloadPDF}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF Report
              </button>
            </div>
          )}
        </div>
      </section>

      <PlotEstimator />
      <ProductSpecs />
    </div>
  )
}