"use client"

import { useEffect, useRef, useState } from "react"
import { safeGet, safeSet } from "../lib/safeStorage"

const STORAGE_KEY = "ferrum-cookie-consent"
/** Published on <html> while the banner is showing so fixed corner chrome
 * (the SUTRA launcher) can sit above it and globals.css can reserve the
 * strip it occupies (body padding, workspace shell height) — the banner
 * never floats over page or workspace controls. */
export const COOKIE_HEIGHT_VAR = "--cookie-consent-h"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const bannerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    // Blocked/throwing storage reads as "not accepted yet": the bar shows and
    // "Got it" dismisses it for this page session via safeStorage's in-memory copy.
    setVisible(safeGet(STORAGE_KEY) !== "accepted")
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
    safeSet(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  // A flush bottom bar that reserves its own space (see globals.css) rather
  // than a floating card: it stays below the SUTRA layer (z-50) and below
  // workspace sheets, which never need to cover it because the shell stops
  // above it.
  return (
    <aside
      ref={bannerRef}
      role="dialog"
      aria-label="Cookie consent"
      data-cookie-consent
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-relume-border bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="text-xs leading-4 text-relume-muted sm:text-sm sm:leading-5">
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
