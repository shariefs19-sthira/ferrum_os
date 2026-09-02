"use client"

import { useEffect, useState } from "react"

type SessionUser = { id: string; email: string; email_verified: boolean } | null

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-relume-surface-secondary px-6 py-24 text-center text-relume-muted">
        Loading...
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-relume-surface-secondary px-6 py-24 text-center">
        <p className="text-relume-muted">You&apos;re not signed in.</p>
        <a href="/login" className="mt-4 inline-block rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:bg-relume-ink">
          Sign in
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-relume-surface-secondary px-6 py-24">
      <div className="mx-auto max-w-md rounded-3xl border border-relume-border bg-white p-8">
        <h1 className="text-2xl font-bold text-relume-ink">Your account</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-relume-muted">Email</dt>
            <dd className="font-medium text-relume-ink">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-relume-muted">Email verified</dt>
            <dd className="font-medium text-relume-ink">{user.email_verified ? "Yes" : "No"}</dd>
          </div>
        </dl>
        <button
          onClick={logout}
          className="mt-8 w-full rounded-full border border-relume-border px-5 py-3 text-sm font-medium text-relume-muted transition hover:bg-relume-surface-secondary"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
