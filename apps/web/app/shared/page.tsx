"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type SharedArtifact = { type: string; title: string; data: unknown; created_at: string }

/**
 * Battery-fail (3): a Share link must open the shared content when
 * followed in a fresh session (no auth, no cookie). The API route
 * (GET /api/workspace/shared/:token, public, no auth - checked
 * directly) already returns the real artifact; what was missing is any
 * human-facing page to follow the link to - SavedArtifactsPanel built
 * the share URL as the raw JSON API endpoint itself, which "opens" only
 * as unstyled JSON text, not real content.
 *
 * Static route (not /shared/[token]/): same static-export constraint as
 * the cockpit route - a dynamic segment needs generateStaticParams()
 * for every possible token, impossible for tokens minted after build
 * time. Token is read client-side from ?token=.
 */
export default function SharedArtifactPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<
    { status: "loading" } | { status: "not-found" } | { status: "no-token" } | { status: "ready"; artifact: SharedArtifact }
  >({ status: "loading" })

  useEffect(() => {
    if (!token) {
      setState({ status: "no-token" })
      return
    }
    let cancelled = false
    fetch(`/api/workspace/shared/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (cancelled) return
        if (!res.ok) {
          setState({ status: "not-found" })
          return
        }
        const artifact = (await res.json()) as SharedArtifact
        setState({ status: "ready", artifact })
      })
      .catch(() => {
        if (!cancelled) setState({ status: "not-found" })
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-relume-muted">Loading shared artifact…</main>
    )
  }

  if (state.status === "no-token" || state.status === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm font-semibold text-relume-ink">This share link is invalid or has expired.</p>
          <p className="mt-2 text-xs text-relume-muted">No artifact was found for this link.</p>
        </div>
      </main>
    )
  }

  const { artifact } = state

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <span className="rounded-full border border-relume-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">
        Shared artifact
      </span>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-relume-tight text-relume-ink">{artifact.title}</h1>
      <p className="mt-2 text-sm text-relume-muted">
        {artifact.type} · saved {new Date(artifact.created_at).toLocaleString()}
      </p>
      <pre className="mt-6 overflow-x-auto rounded-relume border border-relume-border bg-relume-surface-secondary p-4 text-xs">
        {JSON.stringify(artifact.data, null, 2)}
      </pre>
    </main>
  )
}
