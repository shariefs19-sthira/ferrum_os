"use client"

import { useState } from "react"

type Doc = { id: string; filename: string; size_bytes: number | null; created_at: string }

/**
 * KYC capture, document upload, and scheduling for an active Transact
 * case (W2-330), gated by docs/COMPLIANCE_GATE.md. KYC is explicitly
 * self-declared — no government identity API is integrated, so this
 * never claims to verify anything.
 */
export default function TransactLifecyclePanel({ caseId }: { caseId: string }) {
  const [fullName, setFullName] = useState("")
  const [docType, setDocType] = useState("PAN")
  const [last4, setLast4] = useState("")
  const [kycStatus, setKycStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  const [file, setFile] = useState<File | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "not_configured" | "error">("idle")

  const [date, setDate] = useState("")
  const [window_, setWindow] = useState("")
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [devPreview, setDevPreview] = useState<string | null>(null)

  const submitKyc = async (e: React.FormEvent) => {
    e.preventDefault()
    setKycStatus("loading")
    try {
      const res = await fetch(`/api/transact/cases/${caseId}/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, document_type: docType, document_ref_last4: last4 }),
      })
      setKycStatus(res.ok ? "done" : "error")
    } catch {
      setKycStatus("error")
    }
  }

  const uploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploadStatus("loading")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`/api/transact/cases/${caseId}/documents`, { method: "POST", body: formData })
      if (res.status === 503) {
        setUploadStatus("not_configured")
        return
      }
      if (!res.ok) {
        setUploadStatus("error")
        return
      }
      const data = await res.json()
      setDocs((prev) => [{ id: data.id, filename: data.filename, size_bytes: data.size_bytes, created_at: new Date().toISOString() }, ...prev])
      setUploadStatus("idle")
      setFile(null)
    } catch {
      setUploadStatus("error")
    }
  }

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setScheduleStatus("loading")
    try {
      const res = await fetch(`/api/transact/cases/${caseId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requested_date: date, requested_window: window_ || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      setDevPreview(data.dev_notification_preview ?? null)
      setScheduleStatus(res.ok ? "done" : "error")
    } catch {
      setScheduleStatus("error")
    }
  }

  return (
    <div className="mt-4 space-y-6 rounded-lg border border-relume-border bg-relume-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-relume-ink opacity-60">
        Case lifecycle — KYC, documents, scheduling
      </p>

      <div>
        <p className="text-sm font-medium text-relume-ink">KYC (self-declared)</p>
        <p className="mt-1 text-xs text-relume-ink opacity-70">
          Not verified against any government database — recorded as self-declared only.
        </p>
        {kycStatus === "done" ? (
          <p className="mt-2 text-sm text-emerald-700">Recorded.</p>
        ) : (
          <form onSubmit={submitKyc} className="mt-3 grid gap-3 sm:grid-cols-3">
            <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm">
              <option value="PAN">PAN</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="Passport">Passport</option>
            </select>
            <input required maxLength={4} placeholder="Last 4 digits" value={last4} onChange={(e) => setLast4(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
            <button type="submit" disabled={kycStatus === "loading"} className="sm:col-span-3 rounded-full bg-relume-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {kycStatus === "loading" ? "Saving..." : "Submit KYC"}
            </button>
          </form>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-relume-ink">Documents</p>
        <form onSubmit={uploadDoc} className="mt-3 flex flex-wrap items-center gap-3">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
          <button type="submit" disabled={!file || uploadStatus === "loading"} className="rounded-full border border-relume-border px-4 py-2 text-sm font-medium disabled:opacity-50">
            {uploadStatus === "loading" ? "Uploading..." : "Upload"}
          </button>
        </form>
        {uploadStatus === "not_configured" && (
          <p className="mt-2 text-xs text-amber-700">Document storage isn&apos;t configured for this environment yet.</p>
        )}
        {docs.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-relume-ink">
            {docs.map((d) => (
              <li key={d.id}>{d.filename}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-relume-ink">Request a registration slot</p>
        {scheduleStatus === "done" ? (
          <div className="mt-2 text-sm text-emerald-700">
            <p>Slot requested — this is a request, not a confirmed booking.</p>
            {devPreview && <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800">Dev mode (no email service configured): {devPreview}</p>}
          </div>
        ) : (
          <form onSubmit={submitSchedule} className="mt-3 flex flex-wrap gap-3">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
            <input placeholder="Preferred window (optional)" value={window_} onChange={(e) => setWindow(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
            <button type="submit" disabled={scheduleStatus === "loading"} className="rounded-full bg-relume-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {scheduleStatus === "loading" ? "Requesting..." : "Request slot"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
