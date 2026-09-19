"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

const STORAGE_KEY = "ferrum-cookie-consent"
/** Published on <html> while the banner is showing so fixed corner chrome
 * (the SUTRA launcher) can sit above it instead of underneath it. */
export const COOKIE_HEIGHT_VAR = "--cookie-consent-h"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLElement>(null)
  // The workspace shell is `fixed inset-0 z-[70]` and its sheets sit at z-[80];
  // a banner beneath them can never be reached, so on workspace routes it
  // renders above them (z-[90]) rather than being silently un-dismissable.
  const inWorkspace = (usePathname() ?? "").startsWith("/project-workspace")

  useEffect(() => {
    setVisible(window.localStorage.getItem(STORAGE_KEY) !== "accepted")
  }, [])

  useEffect(() => {
    const banner = bannerRef.current
    if (!visible || !banner) return
    const root = document.documentElement
    const publish = () => root.style.setProperty(COOKIE_HEIGHT_VAR, `${Math.ceil(banner.getBoundingClientRect().height)}px`)
    publish()
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publish)
    observer?.observe(banner)
    return () => {
      observer?.disconnect()
      root.style.removeProperty(COOKIE_HEIGHT_VAR)
    }
  }, [visible])

  if (!visible) return null

  const acceptCookies = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  // Below the SUTRA launcher/panel (z-50) so the assistant always wins the
  // corner; on phones the launcher lifts by the published height, at sm+ the
  // banner moves to the opposite (left) corner instead.
  return (
    <aside
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie consent"
      data-cookie-consent
      className={`fixed inset-x-3 bottom-3 mx-auto max-w-xl rounded-2xl border border-relume-border bg-white p-3 shadow-xl sm:inset-x-auto sm:bottom-6 sm:left-6 sm:mx-0 sm:max-w-md sm:p-4 ${inWorkspace ? "z-[90]" : "z-[45]"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-relume-muted sm:text-sm sm:leading-6">
          We use essential cookies to keep Ferrum OS secure and improve your experience.
        </p>
        <button
          type="button"
          onClick={acceptCookies}
          className="min-h-11 shrink-0 rounded-full bg-relume-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent"
        >
          Got it
        </button>
      </div>
    </aside>
  )
}
