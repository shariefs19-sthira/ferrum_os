"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { keyboardReadingSheet, planReadingSheet, type ReadingSheetPlan } from "./panelLayout"

/** A visual viewport this much shorter than the layout viewport means the on-screen keyboard is up. */
const KEYBOARD_DELTA_PX = 150

type Measured = { viewportTop: number; viewportHeight: number; canvas: { top: number; bottom: number } | null; keyboard: boolean }

/**
 * Model canvas rectangle at rest: scroll-normalised (the cockpit shell scrolls,
 * and Reading must not flip on/off as it does) and clipped to the shell so
 * pixels scrolled or laid out beyond it never count as visible model.
 */
function measureCanvas(): { top: number; bottom: number } | null {
  const canvas = document.querySelector<HTMLElement>("[data-cockpit-canvas]")
  if (!canvas) return null
  const shell = canvas.closest<HTMLElement>("[data-workspace-cockpit]")
  const region = canvas.closest<HTMLElement>("[data-cockpit-region]")
  const rect = canvas.getBoundingClientRect()
  if (rect.height <= 0) return null
  const scrolled = shell?.scrollTop ?? 0
  let top = rect.top + scrolled
  let bottom = rect.bottom + scrolled
  for (const clip of [shell, region]) {
    if (!clip) continue
    const box = clip.getBoundingClientRect()
    if (box.height <= 0) continue
    top = Math.max(top, box.top)
    bottom = Math.min(bottom, box.bottom)
  }
  return bottom > top ? { top, bottom } : null
}

/**
 * Availability + geometry of the Reading sheet, from the visual viewport and the
 * real canvas geometry. While the keyboard is open the last availability is kept
 * (the model is hidden by the keyboard, not by the sheet) so typing never
 * bounces the user out of Reading.
 */
export function useReadingSheetPlan(active: boolean): ReadingSheetPlan | null {
  const [measured, setMeasured] = useState<Measured | null>(null)
  const lastAvailable = useRef<boolean | null>(null)
  const measure = useCallback(() => {
    const viewport = window.visualViewport
    const viewportTop = viewport?.offsetTop ?? 0
    const viewportHeight = viewport?.height ?? window.innerHeight
    const keyboard = Boolean(viewport) && window.innerHeight - viewportHeight > KEYBOARD_DELTA_PX
    setMeasured(previous => ({ viewportTop, viewportHeight, keyboard, canvas: keyboard && previous ? previous.canvas : measureCanvas() }))
  }, [])

  useEffect(() => {
    if (!active) {
      lastAvailable.current = null
      setMeasured(null)
      return
    }
    measure()
    const viewport = window.visualViewport
    viewport?.addEventListener("resize", measure)
    viewport?.addEventListener("scroll", measure)
    window.addEventListener("resize", measure)
    window.addEventListener("orientationchange", measure)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    document.querySelectorAll("[data-cockpit-canvas], [data-cockpit-region]").forEach(target => observer?.observe(target))
    return () => {
      viewport?.removeEventListener("resize", measure)
      viewport?.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
      observer?.disconnect()
    }
  }, [active, measure])

  if (!active || !measured) return null
  const plan = planReadingSheet(measured)
  if (measured.keyboard && lastAvailable.current !== null) {
    return { ...plan, ...keyboardReadingSheet(measured.viewportTop, measured.viewportHeight), available: lastAvailable.current }
  }
  lastAvailable.current = plan.available
  return plan
}
