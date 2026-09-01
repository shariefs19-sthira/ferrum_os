"use client"

import { useState } from "react"

/**
 * Subscribe action for paid /pricing tiers (W2-329), gated by
 * docs/COMPLIANCE_GATE.md — test-mode only. Redirects to sign in first
 * if there's no session; the pricing page has no inline auth UI, and a
 * silent 401 would be a dead end for the user.
 */
export default function SubscribeButton({ planId, label, className }: { planId: string; label: string; className: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed" | "error">("idle")

  const subscribe = async () => {
    setStatus("loading")
    try {
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()
      if (!sessionData.user) {
        window.location.href = "/login"
        return
      }
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      })
      setStatus(res.ok ? "subscribed" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "subscribed") {
    return <p className="text-sm text-emerald-700">Subscribed (test mode) — manage this from your account.</p>
  }

  return (
    <div>
      <button type="button" onClick={subscribe} disabled={status === "loading"} className={className}>
        {status === "loading" ? "Starting..." : label}
      </button>
      {status === "error" && <p className="mt-2 text-xs text-red-600">Something went wrong — try again.</p>}
    </div>
  )
}
