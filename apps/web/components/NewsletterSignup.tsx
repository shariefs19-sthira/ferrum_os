"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

export default function NewsletterSignup() {
  const pathname = usePathname()
  const route = pathname.replace(/\.html$/, "").replace(/\/$/, "")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  if (route === "/login" || route === "/signup") return null

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
      <div className="mx-auto max-w-relume-container px-6 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(20rem,1fr)_minmax(24rem,32rem)] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Newsletter</p>
            <h2 className="mt-3 max-w-[24ch] text-3xl font-semibold leading-tight tracking-relume-tight text-white sm:text-4xl">Stay in the loop on new product releases.</h2>
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
                className="shrink-0 whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-semibold text-relume-ink transition hover:opacity-90 disabled:opacity-60"
              >
                {status === "loading" ? "Joining..." : "Join now"}
              </button>
            </div>
            {status === "done" && (
              <p className="mt-2 text-sm text-white/70">Thanks — you&apos;re on the list.</p>
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
