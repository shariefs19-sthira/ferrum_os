"use client"

import { useState } from "react"
import { ARTIFACT_SAVED_EVENT } from "../lib/workspace/events"

/**
 * Generic "save this result to my workspace" action (W2-327), tied to
 * W2-326 auth. Drop into any calculator's result panel — it doesn't
 * know or care about the shape of `data`, it just stores it as JSON.
 *
 * provenanceSource/provenanceFreshness (W2-400) are optional and stored
 * as their own columns (see migrations/0013_artifact_provenance.sql) —
 * pass them only when the caller has something real to say (a source
 * name, a computed-at timestamp); omit rather than invent one.
 */
export default function SaveToWorkspaceButton({
  type,
  title,
  data,
  provenanceSource,
  provenanceFreshness,
}: {
  type: string
  title: string
  data: unknown
  provenanceSource?: string
  provenanceFreshness?: string
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "unauthorized" | "error">("idle")

  const save = async () => {
    setStatus("saving")
    try {
      const res = await fetch("/api/workspace/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          data,
          ...(provenanceSource ? { provenance_source: provenanceSource } : {}),
          ...(provenanceFreshness ? { provenance_freshness: provenanceFreshness } : {}),
        }),
      })
      if (res.status === 401) {
        setStatus("unauthorized")
        return
      }
      setStatus(res.ok ? "saved" : "error")
      if (res.ok) {
        window.dispatchEvent(new CustomEvent(ARTIFACT_SAVED_EVENT, { detail: { type, title } }))
      }
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
