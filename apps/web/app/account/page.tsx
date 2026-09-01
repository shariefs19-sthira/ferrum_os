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
      <main className="min-h-screen bg-slate-50 px-6 py-24 text-center text-slate-600">
        Loading...
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-24 text-center">
        <p className="text-slate-700">You&apos;re not signed in.</p>
        <a href="/login" className="mt-4 inline-block rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700">
          Sign in
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Your account</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email verified</dt>
            <dd className="font-medium text-slate-900">{user.email_verified ? "Yes" : "No"}</dd>
          </div>
        </dl>
        <button
          onClick={logout}
          className="mt-8 w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
