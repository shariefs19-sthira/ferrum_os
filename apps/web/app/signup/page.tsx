"use client"

import { useState } from "react"
import Link from 'next/link'
import SectionShell from '../../components/sections/SectionShell'
import SectionHeading from '../../components/sections/SectionHeading'

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [emailTaken, setEmailTaken] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("loading")
    // W2-362: read the live DOM values via FormData rather than trusting
    // only React state. Some password managers / browser autofill set
    // input values through the native setter and dispatch events that
    // don't bubble to React's root listener — React's onChange never
    // fires, so `password` state can silently stay "" while the input
    // visibly shows a real value the user typed or the manager filled.
    // FormData reads whatever is actually in the DOM at submit time,
    // which is what the user sees and what should be submitted.
    const formData = new FormData(e.currentTarget)
    const submittedName = (formData.get("name") as string) || name
    const submittedEmail = (formData.get("email") as string) || email
    const submittedPassword = (formData.get("password") as string) || password
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: submittedName, email: submittedEmail, password: submittedPassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setEmailTaken(data.error === "email_taken")
        setErrorMsg(
          data.error === "email_taken"
            ? "An account with this email already exists."
            : data.error === "rate_limited"
              ? "Too many attempts — try again later."
              : data.error === "invalid_input"
                ? "Check your email and password (at least 8 characters) and try again."
                : "Something went wrong — try again.",
        )
        setStatus("error")
        return
      }
      // Fire-and-forget lead capture alongside real account creation
      // (W2-341) — a marketing/lead-tracking record distinct from the
      // account itself, doesn't block or affect the signup outcome.
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: submittedName, email: submittedEmail, product: "signup-lead", source_page: "signup" }),
      }).catch(() => {})
      window.location.href = "/account"
    } catch {
      setErrorMsg("Something went wrong — try again.")
      setStatus("error")
    }
  }

  return (
    <main>
      <SectionShell>
        <div className="mx-auto max-w-md">
          <SectionHeading as="h1" className="text-center">Sign Up</SectionHeading>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-relume-ink">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-relume-ink">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-relume-ink">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-relume-border bg-relume-surface px-4 py-3 text-sm text-relume-ink"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">
                {errorMsg}
                {emailTaken && (
                  <>
                    {" "}
                    <Link href="/login" className="font-medium underline">
                      Log in
                    </Link>
                  </>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-relume-ink">
            Already have an account? <Link href="/login" className="underline underline-offset-4">Log in</Link>
          </p>
        </div>
      </SectionShell>
    </main>
  )
}
