"use client"

import { useState } from "react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

type OrderState = {
  id: string
  provider_order_id: string | null
  key_id: string | null
  amount_paise: number
  mode: "test" | "live"
  simulated: boolean
}

/**
 * Token-payment demo — W2-324, gated by docs/COMPLIANCE_GATE.md.
 * Stage-1, test-mode only. In simulated mode (no operator-provisioned
 * Razorpay keys) this exercises the real order/verify routes end to
 * end without opening a real checkout. In real test-mode it opens the
 * actual Razorpay Checkout widget against test keys — never live keys
 * without a Stage-2 compliance sign-off.
 */
export default function PaymentDemo() {
  const [order, setOrder] = useState<OrderState | null>(null)
  const [verified, setVerified] = useState<"idle" | "verifying" | "paid" | "failed">("idle")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  const AMOUNT_PAISE = 100000 // ₹1,000 token amount, illustrative

  const startOrder = async () => {
    setStatus("loading")
    try {
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_paise: AMOUNT_PAISE }),
      })
      if (!res.ok) throw new Error("failed")
      const data: OrderState = await res.json()
      setOrder(data)
      setStatus("idle")
      if (data.simulated) {
        await simulatePay(data)
      } else {
        openCheckout(data)
      }
    } catch {
      setStatus("error")
    }
  }

  const verify = async (orderId: string, paymentId: string, signature: string) => {
    setVerified("verifying")
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature }),
      })
      const data = await res.json()
      setVerified(data.status === "paid" ? "paid" : "failed")
    } catch {
      setVerified("failed")
    }
  }

  const simulatePay = async (o: OrderState) => {
    await verify(o.id, `sim_payment_${o.id}`, "simulated")
  }

  const openCheckout = (o: OrderState) => {
    if (!o.key_id || !o.provider_order_id || !window.Razorpay) return
    const rzp = new window.Razorpay({
      key: o.key_id,
      amount: o.amount_paise,
      currency: "INR",
      order_id: o.provider_order_id,
      name: "Ferrum OS — Transact (test mode)",
      description: "Token payment — Stage-1 test mode, not a purchase",
      handler: (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        verify(o.id, response.razorpay_payment_id, response.razorpay_signature)
      },
    })
    rzp.open()
  }

  const downloadReceipt = async () => {
    if (!order) return
    const doc = await PDFDocument.create()
    const page = doc.addPage([400, 500])
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    let y = 460
    const draw = (text: string, opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb> } = {}) => {
      page.drawText(text, { x: 40, y, size: opts.size ?? 11, font: opts.f ?? font, color: opts.color ?? rgb(0, 0, 0) })
      y -= (opts.size ?? 11) + 10
    }
    draw("Ferrum OS — Test-Mode Payment Receipt", { size: 16, f: bold })
    draw("NOT A GST TAX INVOICE — sample / test-mode record only", { size: 10, color: rgb(0.7, 0, 0) })
    y -= 10
    draw(`Order ID: ${order.id}`)
    draw(`Provider order ID: ${order.provider_order_id ?? "simulated"}`)
    draw(`Amount: Rs. ${(order.amount_paise / 100).toFixed(2)}`)
    draw(`Mode: ${order.mode}${order.simulated ? " (simulated — no real payment occurred)" : ""}`)
    draw(`Status: ${verified}`)
    y -= 10
    draw("This document does not carry GST registration details and is not", { size: 9 })
    draw("valid for tax, accounting, or legal purposes.", { size: 9 })
    const bytes = await doc.save()
    const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ferrum-os-test-receipt-${order.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-relume-ink opacity-60">
          Token payment demo — Stage-1, test mode only, not a purchase
        </p>
        {!order && (
          <button
            onClick={startOrder}
            disabled={status === "loading"}
            className="mt-4 rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Creating order..." : "Start token payment (test mode)"}
          </button>
        )}
        {order && (
          <div className="mt-4 space-y-2 text-sm text-relume-ink">
            <p>
              Order <span className="font-mono">{order.id}</span> — Rs. {(order.amount_paise / 100).toFixed(2)}{" "}
              {order.simulated && <span className="text-amber-700">(simulated — no live payment gateway connected)</span>}
            </p>
            {verified === "verifying" && <p>Verifying...</p>}
            {verified === "paid" && (
              <>
                <p className="text-emerald-700">Verified — test payment recorded.</p>
                <button onClick={downloadReceipt} className="mt-2 rounded-full border border-relume-border px-5 py-2 text-sm font-medium hover:bg-relume-ink hover:text-white">
                  Download sample receipt (PDF)
                </button>
              </>
            )}
            {verified === "failed" && <p className="text-red-600">Verification failed.</p>}
          </div>
        )}
        {status === "error" && <p className="mt-3 text-sm text-red-600">Something went wrong — try again.</p>}
        <p className="mt-4 text-xs text-relume-ink opacity-70">
          Test mode only — no real funds move. Ferrum OS does not custody payments; funds (when live) move directly through the payment gateway.
        </p>
      </div>
    </>
  )
}
