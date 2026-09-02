"use client"

import { useState } from "react"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus("loading")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          product: "newsletter",
          source_page: "footer-newsletter",
        }),
      })
      setStatus(res.ok ? "done" : "error")
      if (res.ok) setEmail("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <footer className="border-t border-relume-border bg-relume-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Newsletter</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">Stay in the loop on new product releases.</h2>
          </div>

          <form className="w-full max-w-lg" onSubmit={submit}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-white/60 focus:ring-2 focus:ring-relume-ink/30"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-relume-ink transition hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Joining..." : "Join now"}
              </button>
            </div>
            {status === "done" && (
              <p className="mt-2 text-sm text-white/70">Thanks — you're on the list.</p>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm text-red-300">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </footer>
  )
}
