"use client"

import { useEffect, useState } from "react"

type ArtifactSummary = { id: string; type: string; title: string; created_at: string }

/**
 * Real saved-artifact list (W2-327) — CRUD/export/share against the
 * live /api/workspace/artifacts routes, tied to W2-326 auth. Sits below
 * the PREVIEW mock grid on /project-workspace; this part is real.
 */
export default function SavedArtifactsPanel() {
  const [artifacts, setArtifacts] = useState<ArtifactSummary[] | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({})

  const load = async () => {
    const sessionRes = await fetch("/api/auth/session")
    const sessionData = await sessionRes.json()
    if (!sessionData.user) {
      setAuthed(false)
      return
    }
    setAuthed(true)
    const res = await fetch("/api/workspace/artifacts")
    const data = await res.json()
    setArtifacts(data.artifacts ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string) => {
    await fetch(`/api/workspace/artifacts/${id}`, { method: "DELETE" })
    setArtifacts((prev) => prev?.filter((a) => a.id !== id) ?? null)
  }

  const share = async (id: string) => {
    const res = await fetch(`/api/workspace/artifacts/${id}/share`, { method: "POST" })
    const data = await res.json()
    if (data.share_token) {
      setShareUrls((prev) => ({ ...prev, [id]: `${window.location.origin}/api/workspace/shared/${data.share_token}` }))
    }
  }

  if (authed === null) return null

  if (!authed) {
    return (
      <div className="rounded-lg border border-relume-border bg-relume-surface p-6 text-center text-sm text-relume-ink">
        <a href="/login" className="underline underline-offset-4">Sign in</a> to see your real saved artifacts here.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-relume-border bg-relume-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-relume-ink opacity-60">Your saved artifacts</p>
      {artifacts && artifacts.length === 0 && (
        <p className="mt-4 text-sm text-relume-ink opacity-70">
          Nothing saved yet — run a calculator (like the Ferrum rate estimator) and use &quot;Save to workspace&quot;.
        </p>
      )}
      <ul className="mt-4 space-y-3">
        {artifacts?.map((a) => (
          <li key={a.id} className="flex flex-col gap-2 rounded-lg border border-relume-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-relume-ink">{a.title}</p>
              <p className="text-xs text-relume-ink opacity-60">{a.type} · {new Date(a.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`/api/workspace/artifacts/${a.id}/export`} className="rounded-full border border-relume-border px-3 py-1 text-xs hover:bg-relume-ink hover:text-white">
                Export
              </a>
              <button onClick={() => share(a.id)} className="rounded-full border border-relume-border px-3 py-1 text-xs hover:bg-relume-ink hover:text-white">
                Share
              </button>
              <button onClick={() => remove(a.id)} className="rounded-full border border-relume-border px-3 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white">
                Delete
              </button>
            </div>
            {shareUrls[a.id] && (
              <p className="w-full break-all text-xs text-relume-ink opacity-70">Share link: {shareUrls[a.id]}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
