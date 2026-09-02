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
    <main className="min-h-screen bg-relume-surface-secondary text-relume-ink">
      <div className="mx-auto grid min-h-screen max-w-7xl items-center px-6 py-12 md:px-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-relume-border bg-white p-8 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-relume-ink text-base font-bold text-white">F</div>
            <span className="text-lg font-semibold text-relume-ink">Ferrum OS</span>
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight text-relume-ink md:text-5xl">
            Welcome back
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-relume-muted">
            Sign in to manage projects, land intelligence, and execution workflows from one place.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-relume-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-relume-border bg-relume-surface-secondary px-4 py-3 text-base text-relume-ink outline-none transition focus:border-relume-ink focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-relume-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-relume-border bg-relume-surface-secondary px-4 py-3 text-base text-relume-ink outline-none transition focus:border-relume-ink focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <a href="/forgot-password" className="text-sm font-medium text-relume-ink transition hover:text-relume-ink">
                Forgot password?
              </a>
              <a href="/get-started" className="text-sm font-medium text-relume-muted transition hover:text-relume-ink">
                Start Free Trial
              </a>
            </div>

            {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-relume-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-relume-ink disabled:opacity-60"
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>

        <aside className="hidden lg:block">
          <div className="rounded-3xl border border-relume-border bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Built for teams</p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">Keep every decision aligned</h2>
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-base text-white/70">
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
