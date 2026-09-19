"use client"

import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from "react"
import {
  DEFAULT_PANEL_LAYOUT,
  panelLayoutReducer,
  panelLayoutStorageKey,
  parsePanelLayout,
  resolvePanelLayout,
  serializePanelLayout,
  type PanelLayout,
  type ResolvedPanelLayout,
} from "./panelLayout"

/** Width of an element, kept current with ResizeObserver (window resize fallback). 0 until measured. */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => setWidth(Math.round(element.getBoundingClientRect().width))
    measure()
    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(measure)
      observer.observe(element)
      return () => observer.disconnect()
    }
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [ref])
  return width
}

function readStored(product: string): PanelLayout {
  try {
    return parsePanelLayout(window.localStorage.getItem(panelLayoutStorageKey(product)))
  } catch {
    return DEFAULT_PANEL_LAYOUT
  }
}

/**
 * Per-product panel layout: loads after mount (so server and first client
 * render agree), re-loads when the product changes, and persists every change.
 * Storage access is best-effort - private mode or blocked storage just means
 * the layout lasts for the session.
 */
export function usePanelLayout(product: string, containerWidth: number, railVisible: boolean) {
  const [layout, dispatch] = useReducer(panelLayoutReducer, DEFAULT_PANEL_LAYOUT)
  const loadedFor = useRef<string | null>(null)

  useEffect(() => {
    dispatch({ type: "load", layout: readStored(product) })
    loadedFor.current = product
  }, [product])

  useEffect(() => {
    if (loadedFor.current !== product) return
    try {
      window.localStorage.setItem(panelLayoutStorageKey(product), serializePanelLayout(layout))
    } catch {
      /* storage unavailable: keep the in-memory layout */
    }
  }, [layout, product])

  const resolved: ResolvedPanelLayout = resolvePanelLayout(layout, containerWidth, railVisible)
  // Only DEFAULT layouts on an unmeasured container should not be clamped against 0.
  const measured = containerWidth > 0

  const setSutraWidth = useCallback((width: number) => dispatch({ type: "set-sutra-width", width, containerWidth }), [containerWidth])
  const nudgeSutraWidth = useCallback((delta: number) => dispatch({ type: "nudge-sutra-width", delta, containerWidth, current: resolved.sutraWidth }), [containerWidth, resolved.sutraWidth])
  const setRailWidth = useCallback((width: number) => dispatch({ type: "set-rail-width", width }), [])
  const setSide = useCallback((side: PanelLayout["sutraSide"]) => dispatch({ type: "set-side", side }), [])
  const setCollapsed = useCallback((collapsed: boolean) => dispatch({ type: "set-collapsed", collapsed }), [])
  const reset = useCallback(() => dispatch({ type: "reset" }), [])

  return { layout: resolved, measured, setSutraWidth, nudgeSutraWidth, setRailWidth, setSide, setCollapsed, reset }
}
