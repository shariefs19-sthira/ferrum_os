"use client"

import type { ReactNode } from "react"
import type { DockSide } from "../../lib/workspace/panelLayout"

export type CompactSutraMode = "full" | "reading"

const buttonClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-white/30 px-2.5 text-xs font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-relume-accent disabled:cursor-not-allowed disabled:opacity-40"

function Icon({ children }: { children: ReactNode }) {
  return <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
}

type DesktopProps = {
  variant: "desktop"
  side: DockSide
  width: number
  min: number
  max: number
  onSideChange: (side: DockSide) => void
  onNarrower: () => void
  onWider: () => void
  onCollapse: () => void
  onReset: () => void
  onClose: () => void
  resetDisabled: boolean
}

type CompactProps = {
  variant: "compact"
  mode: CompactSutraMode
  onModeChange: (mode: CompactSutraMode) => void
  onMinimize: () => void
}

/**
 * In-flow toolbar at the top of the SUTRA region, so its controls can never
 * overlay message text. Desktop: dock side, width steps (non-drag alternative
 * to the splitter), collapse, reset, close. Tablet/phone: size presets and an
 * explicit Minimize. Every control is a 44px+ target.
 */
export default function SutraDockBar(props: DesktopProps | CompactProps) {
  if (props.variant === "compact") {
    return (
      <div className="flex shrink-0 items-center justify-end gap-2 px-3 py-1" role="toolbar" aria-label="SUTRA size" data-sutra-minimize-bar data-sutra-dock-bar="compact">
        <button type="button" className={buttonClass} aria-pressed={props.mode === "full"} onClick={() => props.onModeChange("full")} data-sutra-preset="full">
          <Icon><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>Full<span className="sr-only"> screen</span>
        </button>
        <button type="button" className={buttonClass} aria-pressed={props.mode === "reading"} onClick={() => props.onModeChange("reading")} data-sutra-preset="reading">
          <Icon><path d="M4 4h16v9H4zM4 17h16M4 21h10" /></Icon>Reading<span className="sr-only"> size</span>
        </button>
        <button type="button" className={buttonClass} onClick={props.onMinimize} aria-label="Minimize SUTRA" data-sutra-minimize>
          <Icon><path d="M5 19h14" /></Icon>Minimize
        </button>
      </div>
    )
  }
  const otherSide: DockSide = props.side === "right" ? "left" : "right"
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 border-b border-white/10 px-2 py-1" role="toolbar" aria-label="SUTRA dock controls" data-sutra-dock-bar="desktop">
      <button type="button" className={buttonClass} onClick={() => props.onSideChange(otherSide)} aria-label={`Move SUTRA to the ${otherSide}`} title={`Move SUTRA to the ${otherSide}`} data-sutra-side-toggle>
        <Icon>{otherSide === "left" ? <path d="M19 12H5M11 6l-6 6 6 6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}</Icon>
      </button>
      <button type="button" className={buttonClass} onClick={props.onNarrower} disabled={props.width <= props.min} aria-label="Make SUTRA narrower" title="Narrower" data-sutra-narrower>
        <Icon><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></Icon>
      </button>
      <button type="button" className={buttonClass} onClick={props.onWider} disabled={props.width >= props.max} aria-label="Make SUTRA wider" title="Wider" data-sutra-wider>
        <Icon><path d="M3 6l5 6-5 6M21 6l-5 6 5 6" /></Icon>
      </button>
      <button type="button" className={buttonClass} onClick={props.onCollapse} aria-label="Collapse SUTRA" title="Collapse" data-sutra-collapse>
        <Icon><path d="M4 12h16" /></Icon>
      </button>
      <button type="button" className={buttonClass} onClick={props.onReset} disabled={props.resetDisabled} aria-label="Reset workspace layout" title="Reset layout" data-sutra-layout-reset>
        <Icon><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></Icon>
      </button>
      <button type="button" className={buttonClass} onClick={props.onClose} aria-label="Close SUTRA" title="Close" data-sutra-close>
        <Icon><path d="M6 6l12 12M18 6L6 18" /></Icon>
      </button>
    </div>
  )
}
