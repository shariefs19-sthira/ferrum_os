"use client"

import { useState } from "react"

type Lead = {
  id: number
  name: string
  email: string
  phone: string | null
  product: string
  source_page: string
  state: string | null
  message: string | null
  created_at: string
}

/**
 * Minimal operator lead view (W2-328) — not a real admin-role system,
 * gated by a shared secret (ADMIN_TOKEN) checked server-side against
 * GET /api/admin/leads. The token is never persisted (no cookie/storage)
 * — re-entered per visit, which is the correct tradeoff for a stopgap
 * operator tool, not a permanent multi-user surface.
 */
export default function AdminLeadsView() {
  const [token, setToken] = useState("")
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "not_configured">("idle")

  const load = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch(`/api/admin/leads?token=${encodeURIComponent(token)}`)
      if (res.status === 503) {
        setStatus("not_configured")
        return
      }
      if (!res.ok) {
        setStatus("error")
        return
      }
      const data = await res.json()
      setLeads(data.leads)
      setStatus("idle")
    } catch {
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">Leads (operator view)</h1>
        <p className="mt-2 text-sm text-slate-600">
          Internal tool — not a customer-facing page. Requires the operator token.
        </p>

        {!leads && (
          <form onSubmit={load} className="mt-6 flex max-w-md gap-3">
            <input
              type="password"
              placeholder="Admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
            />
            <button type="submit" disabled={status === "loading"} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60">
              {status === "loading" ? "Loading..." : "View leads"}
            </button>
          </form>
        )}

        {status === "not_configured" && (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            This view isn&apos;t configured yet — no ADMIN_TOKEN has been set for this environment.
          </p>
        )}
        {status === "error" && <p className="mt-4 text-sm text-red-600">Invalid token or request failed.</p>}

        {leads && (
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Product</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Source</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2 text-slate-900">{l.name}</td>
                    <td className="px-4 py-2 text-slate-700">{l.email}</td>
                    <td className="px-4 py-2 text-slate-700">{l.product}</td>
                    <td className="px-4 py-2 text-slate-700">{l.source_page}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No leads yet.</p>}
          </div>
        )}
      </div>
    </main>
  )
}
