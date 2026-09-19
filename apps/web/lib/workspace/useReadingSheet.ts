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
export function useReadingSheetPlan(active: boolean, reading = false): ReadingSheetPlan | null {
  const [measured, setMeasured] = useState<Measured | null>(null)
  const lastAvailable = useRef<boolean | null>(null)
  // Viewport key for which a live Reading layout proved too small: Full's layout
  // (which can differ, e.g. hidden toolbar buttons) must not re-offer Reading
  // until the viewport itself changes, or Reading <-> Full would ping-pong.
  const blockedKey = useRef<string | null>(null)
  const frame = useRef(0)
  const measureNow = useCallback(() => {
    const viewport = window.visualViewport
    const viewportTop = viewport?.offsetTop ?? 0
    const viewportHeight = viewport?.height ?? window.innerHeight
    const keyboard = Boolean(viewport) && window.innerHeight - viewportHeight > KEYBOARD_DELTA_PX
    setMeasured(previous => {
      const canvas = keyboard && previous ? previous.canvas : measureCanvas()
      const same = previous && previous.viewportTop === viewportTop && previous.viewportHeight === viewportHeight && previous.keyboard === keyboard
        && previous.canvas?.top === canvas?.top && previous.canvas?.bottom === canvas?.bottom
      // Identical geometry keeps the same state object: no re-render, so observers can never loop.
      return same ? previous : { viewportTop, viewportHeight, keyboard, canvas }
    })
  }, [])
  // Layout can shift without any resize event (a toolbar row un-hides when the
  // mode changes): coalesce every trigger to one measurement per frame.
  const measure = useCallback(() => {
    if (frame.current) return
    frame.current = window.requestAnimationFrame(() => { frame.current = 0; measureNow() })
  }, [measureNow])

  useEffect(() => {
    if (!active) {
      lastAvailable.current = null
      setMeasured(null)
      return
    }
    measureNow()
    const viewport = window.visualViewport
    viewport?.addEventListener("resize", measure)
    viewport?.addEventListener("scroll", measure)
    window.addEventListener("resize", measure)
    window.addEventListener("orientationchange", measure)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    // Observe the canvas, its region and every sibling above it (their height moves the canvas without resizing it).
    const canvas = document.querySelector<HTMLElement>("[data-cockpit-canvas]")
    const shell = canvas?.closest<HTMLElement>("[data-workspace-cockpit]") ?? null
    document.querySelectorAll("[data-cockpit-canvas], [data-cockpit-region]").forEach(target => observer?.observe(target))
    shell?.querySelectorAll(":scope > *, [data-cockpit-canvas-section] > *").forEach(target => observer?.observe(target))
    const mutations = typeof MutationObserver === "undefined" || !shell ? null : new MutationObserver(measure)
    if (shell) mutations?.observe(shell, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] })
    shell?.addEventListener("scroll", measure, { passive: true })
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current)
      frame.current = 0
      mutations?.disconnect()
      shell?.removeEventListener("scroll", measure)
      viewport?.removeEventListener("resize", measure)
      viewport?.removeEventListener("scroll", measure)
      window.removeEventListener("resize", measure)
      window.removeEventListener("orientationchange", measure)
      observer?.disconnect()
    }
  }, [active, measure, measureNow])

  // The mode itself reshapes the layout above the canvas: re-measure once it has settled.
  useEffect(() => {
    if (!active) return
    measureNow()
    const settle = window.requestAnimationFrame(() => window.requestAnimationFrame(measureNow))
    return () => window.cancelAnimationFrame(settle)
  }, [active, reading, measureNow])

  if (!active || !measured) return null
  const plan = planReadingSheet(measured)
  const key = `${window.innerWidth}x${Math.round(measured.viewportHeight)}`
  if (measured.keyboard && lastAvailable.current !== null) {
    return { ...plan, ...keyboardReadingSheet(measured.viewportTop, measured.viewportHeight), available: lastAvailable.current }
  }
  if (reading && !plan.available) blockedKey.current = key
  else if (blockedKey.current !== null && blockedKey.current !== key) blockedKey.current = null
  const blocked = !reading && blockedKey.current === key
  const result = blocked ? { ...plan, available: false } : plan
  lastAvailable.current = result.available
  return result
}
