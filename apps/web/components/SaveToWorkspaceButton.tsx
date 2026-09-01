"use client"

import { useState } from "react"

/**
 * Generic "save this result to my workspace" action (W2-327), tied to
 * W2-326 auth. Drop into any calculator's result panel — it doesn't
 * know or care about the shape of `data`, it just stores it as JSON.
 */
export default function SaveToWorkspaceButton({ type, title, data }: { type: string; title: string; data: unknown }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "unauthorized" | "error">("idle")

  const save = async () => {
    setStatus("saving")
    try {
      const res = await fetch("/api/workspace/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, data }),
      })
      if (res.status === 401) {
        setStatus("unauthorized")
        return
      }
      setStatus(res.ok ? "saved" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "saved") return <p className="text-xs text-emerald-700">Saved to your workspace.</p>
  if (status === "unauthorized") {
    return (
      <p className="text-xs text-relume-ink opacity-70">
        <a href="/login" className="underline underline-offset-4">Sign in</a> to save this to your workspace.
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={status === "saving"}
      className="rounded-full border border-relume-border px-4 py-2 text-xs font-medium text-relume-ink transition hover:bg-relume-ink hover:text-white disabled:opacity-50"
    >
      {status === "saving" ? "Saving..." : "Save to workspace"}
    </button>
  )
}
