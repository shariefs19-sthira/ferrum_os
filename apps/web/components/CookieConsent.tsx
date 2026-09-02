"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "ferrum-cookie-consent"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "accepted")
  }, [])

  if (!visible) return null

  const acceptCookies = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-relume-border bg-white p-5 shadow-xl sm:inset-x-auto sm:right-6 sm:left-auto"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-relume-muted">
          We use essential cookies to keep Ferrum OS secure and improve your experience.
        </p>
        <button
          type="button"
          onClick={acceptCookies}
          className="shrink-0 rounded-full bg-relume-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </aside>
  )
}
