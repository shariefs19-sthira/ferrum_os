import { describe, expect, it } from "vitest"
import {
  DEFAULT_PANEL_LAYOUT,
  PANEL_LIMITS,
  autoSutraWidth,
  clampRailWidth,
  clampSutraWidth,
  maxSutraWidth,
  panelLayoutReducer,
  panelLayoutStorageKey,
  parsePanelLayout,
  resolvePanelLayout,
  serializePanelLayout,
  splitterKeyAction,
  READING_SHEET,
  keyboardReadingSheet,
  planReadingSheet,
  widthFromDrag,
  type PanelLayout,
} from "./panelLayout"

describe("panel layout geometry", () => {
  it("keeps the model column at least canvasMin wide at every desktop width", () => {
    for (const container of [1024, 1280, 1366, 1440, 1920, 2560]) {
      const rail = PANEL_LIMITS.rail.min
      const max = maxSutraWidth(container, rail)
      const widest = clampSutraWidth(10_000, container, rail)
      expect(widest).toBe(max)
      expect(container - rail - widest - PANEL_LIMITS.splitter).toBeGreaterThanOrEqual(PANEL_LIMITS.canvasMin)
    }
  })

  it("never lets SUTRA fall under its minimum, even in a container too narrow to honour both", () => {
    expect(clampSutraWidth(10, 1500, 112)).toBe(PANEL_LIMITS.sutra.min)
    expect(maxSutraWidth(500, 112)).toBe(PANEL_LIMITS.sutra.min)
  })

  it("caps SUTRA at the absolute maximum on very wide screens", () => {
    expect(clampSutraWidth(5000, 3840, 112)).toBe(PANEL_LIMITS.sutra.max)
  })

  it("a wider tool rail leaves less room for SUTRA", () => {
    expect(maxSutraWidth(1024, 200)).toBeLessThan(maxSutraWidth(1024, 112))
  })

  it("uses the previous responsive default (26vw clamped 352-480) when no width is chosen", () => {
    expect(autoSutraWidth(1024)).toBe(352)
    expect(autoSutraWidth(1440)).toBe(374)
    expect(autoSutraWidth(3000)).toBe(480)
  })

  it("clamps the rail to 112-200 and survives garbage", () => {
    expect(clampRailWidth(50)).toBe(112)
    expect(clampRailWidth(999)).toBe(200)
    expect(clampRailWidth(Number.NaN)).toBe(112)
  })

  it("re-clamps a saved width when the window shrinks, without losing the saved preference", () => {
    const layout: PanelLayout = { ...DEFAULT_PANEL_LAYOUT, sutraWidth: 700 }
    expect(resolvePanelLayout(layout, 1920).sutraWidth).toBe(700)
    expect(resolvePanelLayout(layout, 1024).sutraWidth).toBe(maxSutraWidth(1024, 112))
    expect(layout.sutraWidth).toBe(700)
  })

  it("reports whether the layout is still the default (drives the Reset button)", () => {
    expect(resolvePanelLayout(DEFAULT_PANEL_LAYOUT, 1440).isDefault).toBe(true)
    expect(resolvePanelLayout({ ...DEFAULT_PANEL_LAYOUT, sutraSide: "left" }, 1440).isDefault).toBe(false)
    expect(resolvePanelLayout({ ...DEFAULT_PANEL_LAYOUT, sutraCollapsed: true }, 1440).isDefault).toBe(false)
  })
})

describe("panel layout persistence schema", () => {
  it("round-trips a valid layout", () => {
    const layout: PanelLayout = { version: 1, sutraWidth: 520, sutraSide: "left", sutraCollapsed: true, railWidth: 160 }
    expect(parsePanelLayout(serializePanelLayout(layout))).toEqual(layout)
  })

  it("scopes storage per product and per schema version", () => {
    expect(panelLayoutStorageKey("Land")).toBe("ferrum:workspace-panel-layout:v1:Land")
    expect(panelLayoutStorageKey("Land")).not.toBe(panelLayoutStorageKey("Cost"))
  })

  it.each([
    ["null", null],
    ["empty", ""],
    ["not json", "{oops"],
    ["array", "[1,2]"],
    ["scalar", "42"],
    ["wrong version", JSON.stringify({ version: 2, sutraWidth: 500, sutraSide: "left" })],
    ["missing version", JSON.stringify({ sutraWidth: 500, sutraSide: "left" })],
  ])("falls back to defaults for %s", (_name, raw) => {
    expect(parsePanelLayout(raw as string | null)).toEqual(DEFAULT_PANEL_LAYOUT)
  })

  it("sanitises each field independently", () => {
    const parsed = parsePanelLayout(JSON.stringify({ version: 1, sutraWidth: "wide", sutraSide: "top", sutraCollapsed: "yes", railWidth: 9999 }))
    expect(parsed).toEqual({ version: 1, sutraWidth: null, sutraSide: "right", sutraCollapsed: false, railWidth: 200 })
  })

  it("clamps out-of-range stored widths to the hard limits", () => {
    expect(parsePanelLayout(JSON.stringify({ version: 1, sutraWidth: 5, sutraSide: "right" })).sutraWidth).toBe(320)
    expect(parsePanelLayout(JSON.stringify({ version: 1, sutraWidth: 99999, sutraSide: "right" })).sutraWidth).toBe(720)
  })
})

describe("panel layout reducer", () => {
  it("clamps widths against the container", () => {
    const next = panelLayoutReducer(DEFAULT_PANEL_LAYOUT, { type: "set-sutra-width", width: 900, containerWidth: 1024 })
    expect(next.sutraWidth).toBe(maxSutraWidth(1024, 112))
  })

  it("nudges relative to the current effective width", () => {
    const next = panelLayoutReducer(DEFAULT_PANEL_LAYOUT, { type: "nudge-sutra-width", delta: 64, containerWidth: 1440, current: 374 })
    expect(next.sutraWidth).toBe(438)
  })

  it("moves side, collapses and restores, and returns the same object when nothing changes", () => {
    const left = panelLayoutReducer(DEFAULT_PANEL_LAYOUT, { type: "set-side", side: "left" })
    expect(left.sutraSide).toBe("left")
    expect(panelLayoutReducer(left, { type: "set-side", side: "left" })).toBe(left)
    const collapsed = panelLayoutReducer(left, { type: "set-collapsed", collapsed: true })
    expect(collapsed.sutraCollapsed).toBe(true)
    expect(collapsed.sutraSide).toBe("left")
    expect(panelLayoutReducer(collapsed, { type: "set-collapsed", collapsed: false }).sutraCollapsed).toBe(false)
  })

  it("reset restores every default, including side, collapse and rail", () => {
    const messy: PanelLayout = { version: 1, sutraWidth: 600, sutraSide: "left", sutraCollapsed: true, railWidth: 180 }
    expect(panelLayoutReducer(messy, { type: "reset" })).toEqual(DEFAULT_PANEL_LAYOUT)
  })
})

describe("splitter input maths", () => {
  it("dragging toward the panel's outside edge grows it for either dock side", () => {
    expect(widthFromDrag(400, 1000, 940, -1)).toBe(460) // right-docked: pointer moves left -> wider
    expect(widthFromDrag(400, 300, 360, 1)).toBe(460) // left-docked: pointer moves right -> wider
  })

  it("maps keys, honouring which arrow grows the panel and Shift for large steps", () => {
    expect(splitterKeyAction("ArrowLeft", false, "ArrowLeft")).toEqual({ kind: "delta", delta: 16 })
    expect(splitterKeyAction("ArrowRight", false, "ArrowLeft")).toEqual({ kind: "delta", delta: -16 })
    expect(splitterKeyAction("ArrowRight", true, "ArrowRight")).toEqual({ kind: "delta", delta: 64 })
    expect(splitterKeyAction("Home", false, "ArrowLeft")).toEqual({ kind: "min" })
    expect(splitterKeyAction("End", false, "ArrowLeft")).toEqual({ kind: "max" })
    expect(splitterKeyAction("Enter", false, "ArrowLeft")).toEqual({ kind: "reset" })
    expect(splitterKeyAction("a", false, "ArrowLeft")).toBeNull()
  })
})

describe("reading sheet availability", () => {
  const plan = (vh: number, canvasTop: number, canvasBottom: number, viewportTop = 0) => planReadingSheet({ viewportTop, viewportHeight: vh, canvas: { top: canvasTop, bottom: canvasBottom } })

  it("offers Reading with 45% sheet when >= 180px of model stays above it", () => {
    const p = plan(844, 250, 800)
    expect(p.available).toBe(true)
    expect(p.sheetHeight).toBe(380)
    expect(p.modelVisible).toBeGreaterThanOrEqual(READING_SHEET.minModelPx)
  })

  it("shrinks the sheet to protect the model minimum, down to the sheet floor", () => {
    const p = plan(700, 300, 650)
    expect(p.sheetHeight).toBe(220)
    expect(p.modelVisible).toBe(180)
    expect(p.available).toBe(true)
  })

  it("disables Reading on the reported failing viewports", () => {
    // illustrative canvas offsets for 320x568, 320x640, 667x375 (real geometry is asserted by the rendered audit)
    expect(plan(568, 190, 520).available).toBe(false)
    expect(plan(640, 300, 590).available).toBe(false)
    expect(plan(375, 150, 330).available).toBe(false)
  })

  it("never counts canvas pixels outside the visual viewport or below the sheet", () => {
    // keyboard-shrunk / scrolled visual viewport starting at 100
    const p = plan(500, 0, 400, 100)
    expect(p.modelVisible).toBeLessThanOrEqual(300)
    expect(plan(844, 250, 400).available).toBe(false) // canvas itself only 150px tall
  })

  it("is unavailable when the canvas cannot be measured", () => {
    expect(planReadingSheet({ viewportTop: 0, viewportHeight: 844, canvas: null }).available).toBe(false)
  })

  it("keyboard sheet stays usable and inside the visual viewport", () => {
    const k = keyboardReadingSheet(40, 300)
    expect(k.sheetHeight).toBe(200)
    expect(k.sheetTop + k.sheetHeight).toBe(340)
  })
})
