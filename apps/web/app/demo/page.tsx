"use client"

import { useState } from "react"

export default function DemoPage() {
  const benefits = [
    "See how our platform can streamline your construction workflow",
    "Get personalized recommendations for your specific use case",
    "Connect with our experts to discuss your project needs"
  ]

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          product: "demo",
          source_page: "demo",
          message: company ? `Company: ${company}\n\n${message}` : message,
        }),
      })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-relume-surface-secondary">
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-relume-ink sm:text-5xl">
            Book a Demo
          </h1>
          <p className="mt-4 text-xl text-relume-muted">
            See how Ferrum OS can transform your construction projects
          </p>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-relume-ink mb-6">
            What you'll get from the demo:
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-relume-muted">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-relume border border-relume-border p-8">
          <h2 className="text-2xl font-bold text-relume-ink mb-6">
            Request a Demo
          </h2>
          {status === "done" ? (
            <p className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
              Thanks — we&apos;ve received your request and will be in touch to schedule your demo.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-relume-muted">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full border border-relume-border rounded-md py-2 px-3 focus:outline-none focus:ring-relume-ink focus:border-relume-ink"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-relume-muted">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full border border-relume-border rounded-md py-2 px-3 focus:outline-none focus:ring-relume-ink focus:border-relume-ink"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-relume-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-relume-border rounded-md py-2 px-3 focus:outline-none focus:ring-relume-ink focus:border-relume-ink"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-relume-muted">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 block w-full border border-relume-border rounded-md py-2 px-3 focus:outline-none focus:ring-relume-ink focus:border-relume-ink"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-relume-muted">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 block w-full border border-relume-border rounded-md py-2 px-3 focus:outline-none focus:ring-relume-ink focus:border-relume-ink"
                ></textarea>
              </div>

              {status === "error" && <p className="text-sm text-red-600">Something went wrong — try again.</p>}

              <div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-relume-ink text-white py-3 px-4 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-relume-ink disabled:opacity-60"
                >
                  {status === "loading" ? "Requesting..." : "Request Demo"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-relume-muted">
          <p>
            Have questions? Contact us at{' '}
            <a href="mailto:demo@ferrum_os.com" className="text-relume-ink hover:text-relume-ink">
              demo@ferrum_os.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}