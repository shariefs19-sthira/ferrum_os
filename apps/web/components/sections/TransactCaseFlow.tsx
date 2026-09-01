"use client"

import { useState } from "react"
import TransactLifecyclePanel from "./TransactLifecyclePanel"

const BUYER_STEPS = ["shortlist", "legal_cross_check", "token_payment", "registration_checklist", "slot_requested"]
const SELLER_STEPS = ["intake", "opinion_slot", "ask_band", "mandate_confirm", "listing_card"]

const STEP_LABELS: Record<string, string> = {
  shortlist: "Shortlist",
  legal_cross_check: "Legal cross-check report",
  token_payment: "Token payment (test mode)",
  registration_checklist: "Registration checklist",
  slot_requested: "Registration slot requested",
  intake: "Intake",
  opinion_slot: "Opinion slot booked",
  ask_band: "Ask-band set",
  mandate_confirm: "Mandate confirmed",
  listing_card: "Listing card published",
}

type CaseState = {
  id: string
  role: "buyer" | "seller"
  current_step: string
  status: string
}

/**
 * Buyer/seller case tracker — W2-322, gated by docs/COMPLIANCE_GATE.md.
 * Stage-1 test-mode only: token_payment (buyer step 3) does not move real
 * funds — no Razorpay integration exists yet (W2-324 not landed). This UI
 * only demonstrates and exercises the real state machine in
 * lib/transact/caseFlow.ts against the real /api/transact/cases routes.
 */
export default function TransactCaseFlow() {
  const [role, setRole] = useState<"buyer" | "seller">("buyer")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [caseState, setCaseState] = useState<CaseState | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  const steps = caseState ? (caseState.role === "buyer" ? BUYER_STEPS : SELLER_STEPS) : role === "buyer" ? BUYER_STEPS : SELLER_STEPS
  const currentIdx = caseState ? steps.indexOf(caseState.current_step) : -1

  const startCase = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/transact/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, contact_name: name, contact_email: email }),
      })
      if (!res.ok) throw new Error("failed")
      setCaseState(await res.json())
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  const advance = async () => {
    if (!caseState) return
    const next = steps[currentIdx + 1]
    if (!next) return
    setStatus("loading")
    try {
      const res = await fetch(`/api/transact/cases/${caseState.id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_step: next }),
      })
      if (!res.ok) throw new Error("failed")
      setCaseState(await res.json().then((r) => ({ ...caseState, ...r })))
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-relume-ink opacity-60">
        Case flow demo — Stage-1, indicative, not a legal or payment commitment
      </p>

      {!caseState ? (
        <form onSubmit={startCase} className="mt-4 space-y-4">
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={role === "buyer"} onChange={() => setRole("buyer")} /> Buyer
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={role === "seller"} onChange={() => setRole("seller")} /> Seller
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
            <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-relume-border px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Starting..." : `Start ${role} flow`}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={s} className={`flex items-center gap-3 text-sm ${i <= currentIdx ? "text-relume-ink" : "text-relume-ink opacity-40"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${i <= currentIdx ? "bg-relume-ink text-white" : "border border-relume-border"}`}>
                  {i + 1}
                </span>
                {STEP_LABELS[s]}
              </li>
            ))}
          </ol>
          {currentIdx < steps.length - 1 ? (
            <button
              onClick={advance}
              disabled={status === "loading"}
              className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {status === "loading" ? "Advancing..." : `Advance to ${STEP_LABELS[steps[currentIdx + 1]]}`}
            </button>
          ) : (
            <p className="mt-4 text-sm text-emerald-700">Flow complete — case closed.</p>
          )}
          {status === "error" && <p className="mt-3 text-sm text-red-600">Something went wrong — try again.</p>}
          <TransactLifecyclePanel caseId={caseState.id} />
        </div>
      )}
      <p className="mt-4 text-xs text-relume-ink opacity-70">
        This demonstrates the process only. Token payment is test-mode — no funds move. Ferrum OS is a facilitator, not a legal practitioner, and gives no legal, tax, or financial advice.
      </p>
    </div>
  )
}
