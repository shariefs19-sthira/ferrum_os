"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ARTIFACT_SAVED_EVENT } from "../../lib/workspace/events"

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
    let sessionData: { user?: unknown } | null
    try {
      const sessionRes = await fetch("/api/auth/session")
      sessionData = await sessionRes.json()
    } catch {
      // Session lookup failed (offline, or no Worker behind a static host):
      // show the signed-out empty state rather than a permanent skeleton.
      setAuthed(false)
      return
    }
    if (!sessionData?.user) {
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
    // Battery-fail (1): a save elsewhere on the page (SaveToWorkspaceButton)
    // must reflect here without a reload. The two components have no
    // shared parent state, so a window CustomEvent is the coordination
    // point - reload the real list from the API rather than optimistically
    // guessing the new row's shape.
    const onSaved = () => load()
    window.addEventListener(ARTIFACT_SAVED_EVENT, onSaved)
    return () => window.removeEventListener(ARTIFACT_SAVED_EVENT, onSaved)
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
      setShareUrls((prev) => ({ ...prev, [id]: `${window.location.origin}/shared?token=${data.share_token}` }))
    }
  }

  if (authed === null) {
    // Session request pending: keep the region rendered (never blank).
    return (
      <div
        role="status"
        aria-busy="true"
        data-testid="saved-artifacts-pending"
        className="rounded-lg border border-relume-border bg-relume-surface p-6"
      >
        <span className="sr-only">Checking your session and loading saved artifacts...</span>
        <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
          <div className="h-3 w-40 rounded-full bg-relume-border" />
          <div className="mt-4 rounded-lg border border-relume-border p-3">
            <div className="h-4 w-2/3 rounded-full bg-relume-border" />
            <div className="mt-2 h-3 w-1/3 rounded-full bg-relume-border" />
          </div>
          <div className="mt-4 h-11 w-48 rounded-full bg-relume-border" />
        </div>
      </div>
    )
  }

  if (!authed) {
    const disabledControl =
      "inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-full border border-relume-border px-4 text-xs opacity-50"
    return (
      <div data-testid="saved-artifacts-signed-out" className="rounded-lg border border-relume-border bg-relume-surface p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-relume-ink opacity-60">Your saved artifacts</p>
        <p className="mt-2 text-sm text-relume-ink opacity-70">
          Sign in to see your real saved artifacts here. The row below only shows how one will look.
        </p>
        <ul className="mt-4 space-y-3" aria-label="Sample saved artifact (preview)">
          <li
            data-testid="saved-artifacts-preview-row"
            className="flex flex-col gap-2 rounded-lg border border-dashed border-relume-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-left">
              <p className="flex flex-wrap items-center gap-2 font-medium text-relume-ink">
                <span className="rounded-full border border-relume-command px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-relume-command">
                  Preview
                </span>
                Sample rate estimate
              </p>
              <p className="text-xs text-relume-ink opacity-60">rate-estimate · 19 Sep 2026 · example only, not a saved artifact</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled title="Available once you save a real artifact" className={disabledControl}>
                Export
              </button>
              <button type="button" disabled title="Available once you save a real artifact" className={disabledControl}>
                Share
              </button>
            </div>
          </li>
        </ul>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/project-workspace/cockpit"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-relume-command px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command"
          >
            Open a sample project
          </Link>
          <a
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-relume-border px-6 text-sm font-medium text-relume-ink underline underline-offset-4 transition hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent"
          >
            Sign in
          </a>
        </div>
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
