"use client"

import { useState } from "react"

type StampDutyResult = { state: string; rate_pct: number; registration_fee_pct: number; note: string; indicative: boolean }

// W2-339: all 28 states + 8 UTs, matching migrations/0007_stamp_duty_all_states.sql
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
]

/**
 * Transact Stage-1: stamp-duty/registration-fee estimator — W2-284.
 * Every rate is illustrative sample data, never presented as a
 * current government figure, per docs/COMPLIANCE_GATE.md.
 */
export default function StampDutyEstimator() {
  const [state, setState] = useState(STATES[0])
  const [propertyValue, setPropertyValue] = useState("5000000")
  const [result, setResult] = useState<StampDutyResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEstimate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stamp-duty/${encodeURIComponent(state)}`)
      setResult(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const value = Number(propertyValue) || 0
  const stampDuty = result ? (value * result.rate_pct) / 100 : 0
  const registrationFee = result ? (value * result.registration_fee_pct) / 100 : 0

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-relume-ink">
          State
          <select value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm">
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-sm text-relume-ink">
          Property value (₹)
          <input value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} className="mt-1 w-full rounded-lg border border-relume-border px-3 py-2 text-sm" />
        </label>
      </div>
      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Estimating..." : "Estimate"}
      </button>
      {result && (
        <div className="mt-6 space-y-2 text-sm text-relume-ink">
          <p><strong>Stamp duty (indicative):</strong> ₹{stampDuty.toLocaleString("en-IN")} ({result.rate_pct}%)</p>
          <p><strong>Registration fee (indicative):</strong> ₹{registrationFee.toLocaleString("en-IN")} ({result.registration_fee_pct}%)</p>
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-relume-ink">
            INDICATIVE — {result.note}. Not a legal opinion. Stamp duty and registration fees are paid by you directly to the government; Ferrum OS does not collect or hold these funds.
          </p>
        </div>
      )}
    </div>
  )
}
