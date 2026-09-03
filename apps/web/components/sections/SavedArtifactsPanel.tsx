"use client"

import { useEffect, useState } from "react"

type ArtifactSummary = { id: string; type: string; title: string; created_at: string }
type ProjectSummary = { id: string; name: string; city: string }

/**
 * Real saved-artifact list (W2-327) — CRUD/export/share against the
 * live /api/workspace/artifacts routes, tied to W2-326 auth. Sits below
 * the PREVIEW mock grid on /project-workspace; this part is real.
 */
export default function SavedArtifactsPanel() {
  const [artifacts, setArtifacts] = useState<ArtifactSummary[] | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({})
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [attachTarget, setAttachTarget] = useState<Record<string, string>>({})
  const [attachStatus, setAttachStatus] = useState<Record<string, "idle" | "attached" | "error">>({})

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
    const projectsRes = await fetch("/api/projects")
    const projectsData = await projectsRes.json()
    setProjects(projectsData.projects ?? [])
  }

  const attach = async (artifactId: string) => {
    const projectId = attachTarget[artifactId]
    if (!projectId) return
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/attach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artifact_id: artifactId }),
    })
    setAttachStatus((prev) => ({ ...prev, [artifactId]: res.ok ? "attached" : "error" }))
  }

  useEffect(() => {
    load()
  }, [])

  const remove = async (id: string) => {
    await fetch(`/api/workspace/artifacts/${id}`, { method: "DELETE" })
    setArtifacts((prev) => prev?.filter((a) => a.id !== id) ?? null)
  }

  const rename = async (id: string, currentTitle: string) => {
    const newTitle = window.prompt("Rename artifact", currentTitle)
    if (!newTitle || newTitle === currentTitle) return
    const res = await fetch(`/api/workspace/artifacts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    })
    if (!res.ok) return
    setArtifacts((prev) => prev?.map((a) => (a.id === id ? { ...a, title: newTitle } : a)) ?? null)
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
              <button onClick={() => rename(a.id, a.title)} className="rounded-full border border-relume-border px-3 py-1 text-xs hover:bg-relume-ink hover:text-white">
                Rename
              </button>
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
            {projects.length > 0 && (
              <div className="flex w-full flex-wrap items-center gap-2">
                <select
                  value={attachTarget[a.id] ?? ""}
                  onChange={(e) => setAttachTarget((prev) => ({ ...prev, [a.id]: e.target.value }))}
                  className="rounded-lg border border-relume-border px-2 py-1 text-xs"
                >
                  <option value="">Attach to project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
                <button
                  onClick={() => attach(a.id)}
                  disabled={!attachTarget[a.id]}
                  className="rounded-full border border-relume-border px-3 py-1 text-xs hover:bg-relume-ink hover:text-white disabled:opacity-50"
                >
                  Attach
                </button>
                {attachStatus[a.id] === "attached" && <span className="text-xs text-emerald-700">Attached.</span>}
                {attachStatus[a.id] === "error" && <span className="text-xs text-red-600">Failed to attach.</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
