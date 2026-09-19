/**
 * Workspace panel layout contract (first slice: the cockpit shell).
 *
 * Pure, deterministic state for the docked SUTRA panel and the desktop tool
 * rail: geometry limits, clamping, a versioned localStorage schema with
 * guards, and the transitions the UI can request. No React, no DOM - so the
 * rules are unit-testable and later product panels can adopt the same
 * contract without copying behaviour.
 *
 * Persisted per product (a Land layout never leaks into a Cost layout):
 *   key   ferrum:workspace-panel-layout:v1:<product>
 *   value { version: 1, sutraWidth: number | null, sutraSide, sutraCollapsed, railWidth }
 * `sutraWidth: null` means "automatic" (viewport-proportional default).
 */

export const PANEL_LAYOUT_VERSION = 1

export type DockSide = "left" | "right"

export type PanelLayout = {
  version: typeof PANEL_LAYOUT_VERSION
  /** Explicit SUTRA width in px, or null to use the automatic default. */
  sutraWidth: number | null
  sutraSide: DockSide
  sutraCollapsed: boolean
  railWidth: number
}

export const PANEL_LIMITS = {
  sutra: { min: 320, max: 720, autoMin: 352, autoMax: 480, autoRatio: 0.26 },
  /** 112px is the width the rail buttons were designed for; only widening is safe. */
  rail: { min: 112, max: 200 },
  /** The model/canvas column never shrinks below this, whatever the user drags. */
  canvasMin: 360,
  /** Width of the collapsed SUTRA strip (also the restore button hit target). */
  collapsedStrip: 44,
  splitter: 12,
  keyStep: 16,
  keyStepLarge: 64,
} as const

export const DEFAULT_PANEL_LAYOUT: PanelLayout = {
  version: PANEL_LAYOUT_VERSION,
  sutraWidth: null,
  sutraSide: "right",
  sutraCollapsed: false,
  railWidth: PANEL_LIMITS.rail.min,
}

export function panelLayoutStorageKey(product: string): string {
  return `ferrum:workspace-panel-layout:v${PANEL_LAYOUT_VERSION}:${product}`
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function clampRailWidth(width: number): number {
  if (!Number.isFinite(width)) return PANEL_LIMITS.rail.min
  return Math.round(clamp(width, PANEL_LIMITS.rail.min, PANEL_LIMITS.rail.max))
}

/** Widest SUTRA may be while the canvas keeps its minimum. Never below the SUTRA minimum. */
export function maxSutraWidth(containerWidth: number, railWidth: number): number {
  const available = containerWidth - railWidth - PANEL_LIMITS.canvasMin - PANEL_LIMITS.splitter
  return Math.max(PANEL_LIMITS.sutra.min, Math.min(PANEL_LIMITS.sutra.max, Math.floor(available)))
}

export function autoSutraWidth(containerWidth: number): number {
  const { autoMin, autoMax, autoRatio } = PANEL_LIMITS.sutra
  return Math.round(clamp(containerWidth * autoRatio, autoMin, autoMax))
}

export function clampSutraWidth(width: number, containerWidth: number, railWidth: number): number {
  const max = maxSutraWidth(containerWidth, railWidth)
  if (!Number.isFinite(width)) return Math.min(autoSutraWidth(containerWidth), max)
  return Math.round(clamp(width, PANEL_LIMITS.sutra.min, max))
}

export type ResolvedPanelLayout = {
  sutraWidth: number
  sutraMin: number
  sutraMax: number
  railWidth: number
  sutraSide: DockSide
  sutraCollapsed: boolean
  /** True when the user has not chosen a width (or rail) yet. */
  isDefault: boolean
}

/**
 * Turn stored preferences into the effective geometry for the measured
 * container. The stored value is never rewritten by resolving, so a layout
 * saved on a wide monitor is honoured again (re-clamped) when the window grows.
 * `railVisible` is false in fullscreen, where the rail column does not exist.
 */
export function resolvePanelLayout(layout: PanelLayout, containerWidth: number, railVisible = true): ResolvedPanelLayout {
  const railWidth = railVisible ? clampRailWidth(layout.railWidth) : 0
  const sutraMax = maxSutraWidth(containerWidth, railWidth)
  const sutraWidth = layout.sutraWidth === null ? Math.min(autoSutraWidth(containerWidth), sutraMax) : clampSutraWidth(layout.sutraWidth, containerWidth, railWidth)
  return {
    sutraWidth,
    sutraMin: PANEL_LIMITS.sutra.min,
    sutraMax,
    railWidth: clampRailWidth(layout.railWidth),
    sutraSide: layout.sutraSide,
    sutraCollapsed: layout.sutraCollapsed,
    isDefault: layout.sutraWidth === null && layout.railWidth === PANEL_LIMITS.rail.min && layout.sutraSide === "right" && !layout.sutraCollapsed,
  }
}

/** Parse untrusted localStorage text. Any schema, version or type problem yields the defaults. */
export function parsePanelLayout(raw: string | null | undefined): PanelLayout {
  if (!raw) return DEFAULT_PANEL_LAYOUT
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return DEFAULT_PANEL_LAYOUT
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return DEFAULT_PANEL_LAYOUT
  const record = value as Record<string, unknown>
  if (record.version !== PANEL_LAYOUT_VERSION) return DEFAULT_PANEL_LAYOUT
  const sutraWidth = typeof record.sutraWidth === "number" && Number.isFinite(record.sutraWidth)
    ? Math.round(clamp(record.sutraWidth, PANEL_LIMITS.sutra.min, PANEL_LIMITS.sutra.max))
    : null
  const railWidth = typeof record.railWidth === "number" ? clampRailWidth(record.railWidth) : PANEL_LIMITS.rail.min
  return {
    version: PANEL_LAYOUT_VERSION,
    sutraWidth,
    sutraSide: record.sutraSide === "left" ? "left" : "right",
    sutraCollapsed: record.sutraCollapsed === true,
    railWidth,
  }
}

export function serializePanelLayout(layout: PanelLayout): string {
  return JSON.stringify(layout)
}

export type PanelLayoutAction =
  | { type: "load"; layout: PanelLayout }
  | { type: "set-sutra-width"; width: number; containerWidth: number }
  | { type: "nudge-sutra-width"; delta: number; containerWidth: number; current: number }
  | { type: "set-rail-width"; width: number }
  | { type: "set-side"; side: DockSide }
  | { type: "set-collapsed"; collapsed: boolean }
  | { type: "reset" }

export function panelLayoutReducer(state: PanelLayout, action: PanelLayoutAction): PanelLayout {
  switch (action.type) {
    case "load":
      return action.layout
    case "set-sutra-width":
      return { ...state, sutraWidth: clampSutraWidth(action.width, action.containerWidth, state.railWidth) }
    case "nudge-sutra-width":
      return { ...state, sutraWidth: clampSutraWidth(action.current + action.delta, action.containerWidth, state.railWidth) }
    case "set-rail-width":
      return { ...state, railWidth: clampRailWidth(action.width) }
    case "set-side":
      return state.sutraSide === action.side ? state : { ...state, sutraSide: action.side }
    case "set-collapsed":
      return state.sutraCollapsed === action.collapsed ? state : { ...state, sutraCollapsed: action.collapsed }
    case "reset":
      return DEFAULT_PANEL_LAYOUT
  }
}

/**
 * Splitter maths shared by pointer drag and keyboard. `direction` is +1 when
 * moving the pointer right grows the panel (the panel is left of its splitter)
 * and -1 when the panel is right of its splitter.
 */
export function widthFromDrag(startWidth: number, startX: number, currentX: number, direction: 1 | -1): number {
  return startWidth + (currentX - startX) * direction
}

export type SplitterKeyResult = { kind: "delta"; delta: number } | { kind: "min" } | { kind: "max" } | { kind: "reset" } | null

/** Map a keyboard event key to a splitter action. `growKey` is the arrow that grows the panel. */
export function splitterKeyAction(key: string, shiftKey: boolean, growKey: "ArrowLeft" | "ArrowRight"): SplitterKeyResult {
  const step = shiftKey ? PANEL_LIMITS.keyStepLarge : PANEL_LIMITS.keyStep
  if (key === "ArrowLeft" || key === "ArrowRight") return { kind: "delta", delta: key === growKey ? step : -step }
  if (key === "Home") return { kind: "min" }
  if (key === "End") return { kind: "max" }
  if (key === "Enter") return { kind: "reset" }
  return null
}

/**
 * Reading bottom sheet (tablet/phone SUTRA). Reading mode exists so the model
 * stays usable above the sheet, so it is only offered when real model pixels
 * remain: the canvas rectangle, clipped to the visual viewport, must still
 * show >= `minModelPx` above the sheet AND the sheet must keep >= `minSheetPx`
 * (toolbar + composer + a message line). Otherwise Reading is disabled and
 * Full + Minimize remain.
 */
export const READING_SHEET = { preferredRatio: 0.45, minSheetPx: 200, minModelPx: 180 } as const

export type ReadingSheetInput = {
  /** Visual viewport top / height in layout coordinates (offsetTop, height). */
  viewportTop: number
  viewportHeight: number
  /** Model canvas rectangle at rest (scroll-normalised, already clipped to its shell), or null if it cannot be measured. */
  canvas: { top: number; bottom: number } | null
}

export type ReadingSheetPlan = {
  available: boolean
  sheetHeight: number
  sheetTop: number
  /** Model pixels left above the sheet (0 when unmeasurable). */
  modelVisible: number
}

export function planReadingSheet({ viewportTop, viewportHeight, canvas }: ReadingSheetInput): ReadingSheetPlan {
  const viewportBottom = viewportTop + viewportHeight
  const preferred = Math.round(viewportHeight * READING_SHEET.preferredRatio)
  if (!canvas || !Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return { available: false, sheetHeight: preferred, sheetTop: viewportBottom - preferred, modelVisible: 0 }
  }
  const modelTop = Math.max(canvas.top, viewportTop)
  const canvasVisible = Math.min(canvas.bottom, viewportBottom) - modelTop
  // Shrink the sheet (never below its floor) to give the model its minimum.
  const sheetHeight = Math.min(preferred, Math.round(viewportBottom - modelTop - READING_SHEET.minModelPx))
  const sheetTop = viewportBottom - sheetHeight
  const modelVisible = Math.max(0, Math.round(Math.min(canvas.bottom, sheetTop) - modelTop))
  const available = canvasVisible >= READING_SHEET.minModelPx && sheetHeight >= READING_SHEET.minSheetPx && modelVisible >= READING_SHEET.minModelPx
  return { available, sheetHeight, sheetTop, modelVisible }
}

/** With the on-screen keyboard up the model is hidden anyway: keep the sheet usable and follow the visual viewport. */
export function keyboardReadingSheet(viewportTop: number, viewportHeight: number): { sheetHeight: number; sheetTop: number } {
  const sheetHeight = Math.min(viewportHeight, Math.max(Math.round(viewportHeight * READING_SHEET.preferredRatio), READING_SHEET.minSheetPx))
  return { sheetHeight, sheetTop: viewportTop + viewportHeight - sheetHeight }
}
