"use client"

import { useState } from "react"

const features = [
  'Multi-site visibility',
  'Faster land diligence',
  'Smarter delivery decisions'
];

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error === "rate_limited" ? "Too many attempts — try again later." : "Invalid email or password.")
        setStatus("error")
        return
      }
      window.location.href = "/account"
    } catch {
      setErrorMsg("Something went wrong — try again.")
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center px-6 py-12 md:px-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">F</div>
            <span className="text-lg font-semibold text-slate-900">Ferrum OS</span>
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Welcome back
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Sign in to manage projects, land intelligence, and execution workflows from one place.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <a href="/forgot-password" className="text-sm font-medium text-blue-700 transition hover:text-blue-800">
                Forgot password?
              </a>
              <a href="/get-started" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
                Start Free Trial
              </a>
            </div>

            {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>

        <aside className="hidden lg:block">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Built for teams</p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">Keep every decision aligned</h2>
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-base text-blue-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
