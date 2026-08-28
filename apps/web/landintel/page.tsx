"use client"

import { useState } from "react"

export default function LandIntelPage() {
  const [ulpin, setUlpin] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ulpin.length !== 14 || !/^\d+$/.test(ulpin)) {
      setError("ULPIN must be exactly 14 digits")
      return
    }
    
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("http://localhost:8000/api/v1/ulpin/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ulpin }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Lookup failed")
      setResult(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🏞️ LandIntel: ULPIN Lookup</h1>
        
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter 14-digit ULPIN</label>
            <input
              type="text"
              maxLength={14}
              value={ulpin}
              onChange={(e) => setUlpin(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g., 12345678901234"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Fetching Land Data..." : "Lookup Land Details"}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ Land Found</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <p><strong>Owner:</strong> {result.ownerName}</p>
              <p><strong>Area:</strong> {result.area} sq.ft</p>
              <p><strong>District:</strong> {result.district}</p>
              <p><strong>Village:</strong> {result.village}</p>
              <p><strong>Survey No:</strong> {result.surveyNo}</p>
              <p><strong>Zoning:</strong> {result.zoning} (FAR: {result.maxFAR})</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
