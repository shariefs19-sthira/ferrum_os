"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"

type FullscreenState = { active: boolean; profile: "default" | "high"; toggle: () => void }
const FullscreenContext = createContext<FullscreenState>({ active: false, profile: "default", toggle: () => undefined })

export function useFullscreenState() { return useContext(FullscreenContext) }

export default function FullscreenController({ children, previewSource }: { children: (state: FullscreenState) => ReactNode; previewSource?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const enter = useCallback(async () => {
    const host = hostRef.current
    if (!host) return
    setActive(true)
    try { if (!document.fullscreenElement && host.requestFullscreen) await host.requestFullscreen() } catch { /* CSS 100dvh fallback remains active. */ }
  }, [])
  const toggle = useCallback(() => {
    if (previewSource) {
      window.localStorage.setItem("ferrum-workspace-fullscreen-pending", "true")
      window.location.assign(`/project-workspace?source=${encodeURIComponent(previewSource)}`)
      return
    }
    if (active) {
      setActive(false)
      if (document.fullscreenElement) void document.exitFullscreen()
    } else void enter()
  }, [active, enter, previewSource])
  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", sync)
    if (!previewSource && window.localStorage.getItem("ferrum-workspace-fullscreen-pending") === "true") {
      window.localStorage.removeItem("ferrum-workspace-fullscreen-pending")
      void enter()
    }
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [enter, previewSource])
  const state: FullscreenState = { active, profile: active ? "high" : "default", toggle }
  return <FullscreenContext.Provider value={state}><div ref={hostRef} className={active ? "fixed inset-0 z-[100] h-[100dvh] overflow-hidden bg-relume-surface" : "contents"} data-fullscreen-controller data-fullscreen-active={active || undefined} data-detail-profile={state.profile}>{children(state)}</div></FullscreenContext.Provider>
}
