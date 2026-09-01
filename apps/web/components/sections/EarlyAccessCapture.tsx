"use client"

import { useState } from "react"

type EarlyAccessCaptureProps = {
  product: string
  sourcePage: string
}

/**
 * Generic early-access lead capture — W2-313. Writes to the real
 * /api/leads route. Distinct from WaitlistCapture (Transact-specific
 * copy) since Dashboard/Workspace previews need their own framing.
 */
export default function EarlyAccessCapture({ product, sourcePage }: EarlyAccessCaptureProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, product, source_page: sourcePage }),
      })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-6 text-sm text-relume-ink">
        You&apos;re on the early-access list. We&apos;ll be in touch as this becomes available.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-lg border border-relume-border bg-relume-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-4 w-full rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Joining..." : "Get early access"}
      </button>
      {status === "error" && <p className="mt-3 text-sm text-red-600">Something went wrong — try again.</p>}
    </form>
  )
}
