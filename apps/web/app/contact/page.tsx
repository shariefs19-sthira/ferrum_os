"use client"

import { useState } from "react"

export default function ContactPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus("loading")
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          product: "contact",
          source_page: "contact",
          message: subject ? `Subject: ${subject}\n\n${message}` : message,
        }),
      })
      setStatus(response.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen bg-relume-surface-secondary px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-relume-prose">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-semibold tracking-relume-tight text-relume-ink sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            Send the team a project, product, partnership, or support question.
          </p>
        </div>

        <div className="rounded-relume border border-relume-border bg-white p-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl">
            Send us a message
          </h2>
          {status === "done" ? (
            <p className="rounded-md border border-relume-border bg-relume-surface-secondary p-4 text-sm text-relume-ink">
              Thanks — your message has been received.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-relume-muted">
                    First name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-relume-border px-3 py-2 focus:border-relume-ink focus:outline-none focus:ring-2 focus:ring-relume-ink"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-relume-muted">
                    Last name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="mt-1 block w-full rounded-md border border-relume-border px-3 py-2 focus:border-relume-ink focus:outline-none focus:ring-2 focus:ring-relume-ink"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-relume-muted">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 block w-full rounded-md border border-relume-border px-3 py-2 focus:border-relume-ink focus:outline-none focus:ring-2 focus:ring-relume-ink"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-relume-muted">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="mt-1 block w-full rounded-md border border-relume-border px-3 py-2 focus:border-relume-ink focus:outline-none focus:ring-2 focus:ring-relume-ink"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-relume-muted">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="mt-1 block w-full rounded-md border border-relume-border px-3 py-2 focus:border-relume-ink focus:outline-none focus:ring-2 focus:ring-relume-ink"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-relume-ink">The message could not be sent. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-relume-ink px-4 py-3 text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-relume-ink focus:ring-offset-2 disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
