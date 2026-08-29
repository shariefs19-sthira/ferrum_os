"use client"

import { useState, useEffect } from "react"
import { SoilCard } from "../../components/sections/SoilCard"

export default function LandIntelPage() {
  const [ulpin, setUlpin] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [mode, setMode] = useState<"live" | "fallback">("fallback")
  // State for telemetry counts
  const [telemetry, setTelemetry] = useState({ live: 0, fallback: 0 })

  // Poll the health endpoint for telemetry data
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://localhost:8000/health") // Assuming same host/port
        if (res.ok) {
          const data = await res.json()
          setTelemetry({
            live: data.live_count || 0,
            fallback: data.fallback_count || 0
          })
        }
      } catch (err) {
        console.error("Failed to fetch telemetry:", err)
        // Optionally set an error state or just ignore to keep polling
      }
    }

    fetchTelemetry() // Fetch immediately on mount
    const interval = setInterval(fetchTelemetry, 5000) // Poll every 5 seconds

    return () => clearInterval(interval) // Cleanup on unmount
  }, []) // Empty dependency array means this effect runs once on mount

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
      setMode((data.mode === "live" ? "live" : "fallback"))
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
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">🗺️ LandIntel: ULPIN Lookup</h1>
          {/* Updated badge to show LIVE/FALLBACK counts */}
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${mode === "live" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
            {mode === "live" ? "LIVE" : "FALLBACK"} {telemetry.live} / {telemetry.fallback}
          </span>
        </div>
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter 14-digit ULPIN</label>
            <input type="text" maxLength={14} value={ulpin} onChange={(e) => setUlpin(e.target.value.replace(/\D/g, ""))} placeholder="e.g., 12345678901234" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm" />
            {error && <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 transition-all font-medium shadow-sm">{loading ? "Fetching Land Data..." : "Lookup Land Details"}</button>
        </form>
        {infoMessage && infoMessage.toLowerCase().includes('offline') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">⚠️ {infoMessage}</p>
          </div>
        )}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Land Found</h2>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p><strong>Owner:</strong> {result.ownerName}</p>
                <p><strong>Area:</strong> {result.area} sq.ft</p>
                <p><strong>District:</strong> {result.district}</p>
                <p><strong>Village:</strong> {result.village}</p>
                <p><strong>Survey No:</strong> {result.surveyNo}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">🏛️ Zoning Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="bg-white p-3 rounded shadow-sm"><p className="text-gray-500 text-xs uppercase">Permissible Use</p><p className="font-bold text-blue-700">{result.zoning}</p></div>
                <div className="bg-white p-3 rounded shadow-sm"><p className="text-gray-500 text-xs uppercase">Max FAR</p><p className="font-bold text-blue-700">{result.maxFAR}</p></div>
                <div className="bg-white p-3 rounded shadow-sm"><p className="text-gray-500 text-xs uppercase">Max Height</p><p className="font-bold text-blue-700">{result.maxHeight}</p></div>
              </div>
            </div>
            <SoilCard type={result.soilType || "Red Sandy Loam"} risk={result.floodRisk || "Low"} />
            <button onClick={downloadPDF} className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Download PDF Report</button>
          </div>
        )}
      </div>
    </div>
  )
}