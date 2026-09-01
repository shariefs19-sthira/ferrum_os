"use client"

import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [devToken, setDevToken] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      setDevToken(data.dev_reset_token ?? null)
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
        <p className="mt-4 text-sm text-slate-600">
          Enter your account email. If it matches an account, we&apos;ll send a reset link.
        </p>

        {status === "done" ? (
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            <p>If that email matches an account, a reset link is on its way.</p>
            {devToken && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                Dev mode (no email service configured): reset token — <span className="font-mono">{devToken}</span>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">Something went wrong — try again.</p>}
          </form>
        )}
      </div>
    </main>
  )
}
