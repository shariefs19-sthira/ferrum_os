"use client"

import { useState } from "react"

/**
 * Transact Stage-1: demand-token waitlist capture — W2-286. Writes to
 * the real /api/leads route (product='Transact',
 * source_page='transact-waitlist'). Per docs/COMPLIANCE_GATE.md: this
 * is a waitlist, not a queue position or investment — no priority
 * allocation or return is implied.
 */
export default function WaitlistCapture() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, state, product: "Transact", source_page: "transact-waitlist" }),
      })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-sm text-relume-ink">
        You&apos;re on the list. This records your interest — it is not a commitment on either side, and does not guarantee priority access.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
        <input placeholder="State (optional)" value={state} onChange={(e) => setState(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Joining..." : "Join the waitlist"}
      </button>
      {status === "error" && <p className="mt-3 text-sm text-red-600">Something went wrong — try again.</p>}
      <p className="mt-4 text-xs text-relume-ink opacity-70">
        Joining records your interest only. No commitment, no priority allocation, no investment return is implied.
      </p>
    </form>
  )
}
