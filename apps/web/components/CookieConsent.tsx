"use client"

import { useEffect, useRef, useState } from "react"
import { safeGet, safeSet } from "../lib/safeStorage"
import styles from "./cookieConsent.module.css"

const STORAGE_KEY = "ferrum-cookie-consent"
/** Published on <html> while the banner is showing so fixed corner chrome
 * (the SUTRA launcher) can sit above it and globals.css can reserve the
 * strip it occupies (body padding, workspace shell height) — the banner
 * never floats over page or workspace controls. */
export const COOKIE_HEIGHT_VAR = "--cookie-consent-h"

/**
 * DEMO/SCREENSHOT SWITCH ONLY — not a shipped feature flag.
 * `?cookieVariant=A|B|C` selects one of the operator's allotment candidates
 * for CRANE's screenshot audit (scripts/cookie-allotment-audit.mjs). No
 * query param (the default, and the only path any real visitor hits today)
 * renders variant "D": the unchanged current bottom bar. This keeps the
 * existing CookieConsent.test.tsx suite passing unmodified.
 */
type Variant = "A" | "B" | "C" | "D"

function readVariant(): Variant {
  if (typeof window === "undefined") return "D"
  const q = new URLSearchParams(window.location.search).get("cookieVariant")
  return q === "A" || q === "B" || q === "C" ? q : "D"
}

const CONSENT_TEXT = "We use essential cookies to keep Ferrum OS secure and improve your experience."

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [variant, setVariant] = useState<Variant>("D")
  const bannerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setVariant(readVariant())
    // Blocked/throwing storage reads as "not accepted yet": the bar shows and
    // "Got it" dismisses it for this page session via safeStorage's in-memory copy.
    setVisible(safeGet(STORAGE_KEY) !== "accepted")
  }, [])

  // Publish height for the SUTRA launcher / globals.css reservation. Kept
  // for every variant so the launcher lift behaviour is comparable across
  // candidates; variant A additionally uses its own band reservation
  // (below) which does not depend on this var.
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
  }, [visible, variant])

  // Variant A: reserve a real row for the bar by wrapping the rest of
  // body's children in a scroll container that sits above it. Runtime-only
  // DOM restructuring confined to this component (layout.tsx/SiteShell are
  // out of lease) — gated entirely behind ?cookieVariant=A so it never runs
  // for a real visitor.
  useEffect(() => {
    if (variant !== "A" || !visible) return
    const body = document.body
    const aside = bannerRef.current
    body.setAttribute("data-cookie-variant", "A")
    const prevBodyStyle = body.getAttribute("style")
    body.style.display = "flex"
    body.style.flexDirection = "column"
    body.style.height = "100dvh"
    body.style.overflow = "hidden"
    body.style.margin = "0"
    let wrapper = document.getElementById("cookie-band-scroll") as HTMLDivElement | null
    let created = false
    if (!wrapper) {
      wrapper = document.createElement("div")
      wrapper.id = "cookie-band-scroll"
      wrapper.className = styles.bandScroll
      const toMove: ChildNode[] = []
      body.childNodes.forEach((node) => {
        if (node === aside) return
        if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === "SCRIPT") return
        toMove.push(node)
      })
      toMove.forEach((node) => wrapper!.appendChild(node))
      body.insertBefore(wrapper, body.firstChild)
      created = true
    }
    return () => {
      body.removeAttribute("data-cookie-variant")
      if (prevBodyStyle === null) body.removeAttribute("style")
      else body.setAttribute("style", prevBodyStyle)
      if (created && wrapper && wrapper.parentNode === body) {
        while (wrapper.firstChild) body.insertBefore(wrapper.firstChild, wrapper)
        body.removeChild(wrapper)
      }
    }
  }, [variant, visible])

  // Variant B: make the page behind the modal inert (unfocusable,
  // unclickable, hidden from AT) for as long as the modal is open.
  useEffect(() => {
    if (variant !== "B" || !visible) return
    const body = document.body
    const others: Element[] = []
    body.querySelectorAll(":scope > *").forEach((el) => {
      // Skip the element itself and anything containing it (in production
      // it's a direct body child; test renderers add a wrapper div).
      if (el.hasAttribute("data-cookie-consent")) return
      if (el.querySelector("[data-cookie-consent]")) return
      if (el.tagName === "SCRIPT") return
      others.push(el)
    })
    others.forEach((el) => {
      el.setAttribute("inert", "")
      el.setAttribute("aria-hidden", "true")
    })
    return () => {
      others.forEach((el) => {
        el.removeAttribute("inert")
        el.removeAttribute("aria-hidden")
      })
    }
  }, [variant, visible])

  if (!visible) return null

  const acceptCookies = () => {
    safeSet(STORAGE_KEY, "accepted")
    setVisible(false)
  }

  if (variant === "B") {
    return (
      <div className={styles.modalScrim} data-cookie-consent data-variant="B">
        <div
          ref={bannerRef as any}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          className={styles.modalCard}
          onKeyDown={(e) => {
            // Escape must NOT silently accept — it does nothing here; the
            // visitor must make a choice for the modal to close.
            if (e.key === "Escape") e.preventDefault()
          }}
        >
          <p className="text-sm leading-5 text-relume-muted">{CONSENT_TEXT}</p>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              autoFocus
              onClick={acceptCookies}
              className="min-h-11 shrink-0 rounded-full bg-relume-ink px-5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-accent"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "C") {
    return (
      <aside
        ref={bannerRef}
        role="dialog"
        aria-label="Cookie consent"
        data-cookie-consent
        data-variant="C"
        className={styles.cornerCard}
      >
        <p className="text-xs leading-4 text-relume-muted">{CONSENT_TEXT}</p>
        <div className="mt-2 flex justify-end">
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

  if (variant === "A") {
    return (
      <aside
        ref={bannerRef}
        role="dialog"
        aria-label="Cookie consent"
        data-cookie-consent
        data-variant="A"
        className={`${styles.bandBarRow} relative z-[45] border-t border-relume-border bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <p className="text-xs leading-4 text-relume-muted sm:text-sm sm:leading-5">{CONSENT_TEXT}</p>
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

  // Variant D — current behaviour, unchanged, as the baseline.
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
      data-variant="D"
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-relume-border bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="text-xs leading-4 text-relume-muted sm:text-sm sm:leading-5">{CONSENT_TEXT}</p>
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
