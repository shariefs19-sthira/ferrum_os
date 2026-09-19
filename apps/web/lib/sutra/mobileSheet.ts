"use client"

import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

/** Phones get the full-screen SUTRA sheet; `sm`/`md` and up keep their existing presentation. */
export const PHONE_MAX_WIDTH_PX = 639

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** True while the viewport is at most `maxWidth` wide. False when matchMedia is unavailable (SSR, jsdom). */
export function useMaxWidthQuery(maxWidth: number = PHONE_MAX_WIDTH_PX) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const sync = () => setMatches(query.matches)
    sync()
    query.addEventListener?.("change", sync)
    return () => query.removeEventListener?.("change", sync)
  }, [maxWidth])
  return matches
}

/**
 * Locks background scroll while a full-screen sheet is open, and restores the
 * previous inline values on cleanup. `overscroll-behavior` stops scroll
 * chaining from the sheet into the page on iOS/Android.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { body, documentElement: root } = document
    const previous = { bodyOverflow: body.style.overflow, rootOverflow: root.style.overflow, rootOverscroll: root.style.overscrollBehavior }
    body.style.overflow = "hidden"
    root.style.overflow = "hidden"
    root.style.overscrollBehavior = "none"
    return () => {
      body.style.overflow = previous.bodyOverflow
      root.style.overflow = previous.rootOverflow
      root.style.overscrollBehavior = previous.rootOverscroll
    }
  }, [active])
}

/**
 * Tracks the visual viewport so a full-screen sheet shrinks above the on-screen
 * keyboard instead of hiding the composer. Returns null until measured (or
 * when unsupported), in which case CSS `inset-0` applies.
 */
export function useVisualViewportBox(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null)
  useEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      setBox(null)
      return
    }
    const viewport = window.visualViewport
    const sync = () => setBox({ top: viewport.offsetTop, height: viewport.height })
    sync()
    viewport.addEventListener("resize", sync)
    viewport.addEventListener("scroll", sync)
    return () => {
      viewport.removeEventListener("resize", sync)
      viewport.removeEventListener("scroll", sync)
      setBox(null)
    }
  }, [active])
  return box
}

/** Keeps Tab / Shift+Tab inside `container` while a modal SUTRA sheet is open. */
export function trapTabKey(event: ReactKeyboardEvent<HTMLElement> | KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (items.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
