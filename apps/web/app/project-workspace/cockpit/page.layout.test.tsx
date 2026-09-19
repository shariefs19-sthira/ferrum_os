import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("product=Design") }))
vi.mock("../../../components/workspace/WorkflowRail", () => ({ default: () => <nav aria-label="Workflow" /> }))
vi.mock("../../../components/workspace/ToolsRuler", () => ({ default: ({ rail }: { rail?: boolean }) => <aside aria-label="Workspace tools" data-rail={rail ? "true" : "false"} /> }))
vi.mock("../../../components/workspace/MoreDrawer", () => ({ default: () => null }))
vi.mock("../../../components/workspace/ExtractPanel", () => ({ default: () => null }))
vi.mock("../../../components/workspace/ProductSkin", () => ({ default: () => null }))
vi.mock("../../../components/workspace/CanvasSlot", () => ({
  default: ({ sutraOccludesCanvas }: { sutraOccludesCanvas?: boolean }) => <div data-testid="canvas" data-cockpit-canvas data-occluded={String(Boolean(sutraOccludesCanvas))}><button type="button">Model control</button></div>,
  productControls: new Proxy({}, { get: () => undefined }),
}))
vi.mock("../../../components/workspace/SutraPanel", () => ({ default: () => <div data-testid="sutra-panel"><label>Ask SUTRA<input /></label></div> }))

import ProjectWorkspaceCockpit from "./page"

const GRID_WIDTH = 1440
let desktop = true
let phone = false
// Canvas geometry the mocked getBoundingClientRect reports for [data-cockpit-canvas] (null = unmeasurable).
let canvasRect: { top: number; bottom: number } | null = { top: 120, bottom: 560 }

function installBrowserStubs() {
  window.matchMedia = ((query: string) => {
    const matches = query.includes("min-width: 1024px") ? desktop : query.includes("max-width: 767px") ? phone : false
    return { matches, media: query, addEventListener: () => undefined, removeEventListener: () => undefined, addListener: () => undefined, removeListener: () => undefined, onchange: null, dispatchEvent: () => false } as unknown as MediaQueryList
  }) as typeof window.matchMedia
  class RO {
    constructor(private cb: () => void) {}
    observe() { this.cb() }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal("ResizeObserver", RO)
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute("data-cockpit-canvas") && canvasRect) return { width: 320, height: canvasRect.bottom - canvasRect.top, top: canvasRect.top, left: 0, right: 320, bottom: canvasRect.bottom, x: 0, y: canvasRect.top, toJSON: () => ({}) } as DOMRect
    const width = this.hasAttribute("data-workspace-grid") ? GRID_WIDTH : 0
    return { width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect
  })
  // jsdom has no PointerEvent; a MouseEvent subclass keeps clientX/button/pointerId.
  class TestPointerEvent extends MouseEvent {
    pointerId: number
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 0
    }
  }
  vi.stubGlobal("PointerEvent", TestPointerEvent)
  HTMLElement.prototype.setPointerCapture = vi.fn()
  HTMLElement.prototype.releasePointerCapture = vi.fn()
}

const KEY = "ferrum:workspace-panel-layout:v1:Design"
const region = () => document.querySelector<HTMLElement>("[data-sutra-region]")!
const grid = () => document.querySelector<HTMLElement>("[data-workspace-grid]")!
const sutraSplitter = () => screen.getByRole("separator", { name: "Resize SUTRA" })

async function openDesktop() {
  render(<ProjectWorkspaceCockpit />)
  await act(async () => {})
}

beforeEach(() => {
  desktop = true
  phone = false
  canvasRect = { top: 120, bottom: 560 }
  window.localStorage.clear()
  installBrowserStubs()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("cockpit SUTRA dock (desktop)", () => {
  it("docks SUTRA on the right at the previous automatic width and exposes a keyboard splitter", async () => {
    await openDesktop()
    expect(region().dataset.sutraMode).toBe("docked")
    expect(region().dataset.sutraSide).toBe("right")
    expect(grid().style.gridTemplateColumns).toBe("minmax(0,1fr) 12px 374px")
    const splitter = sutraSplitter()
    expect(splitter.getAttribute("aria-orientation")).toBe("vertical")
    expect(splitter.getAttribute("aria-valuenow")).toBe("374")
    expect(splitter.getAttribute("aria-valuemin")).toBe("320")
    expect(splitter.getAttribute("aria-valuemax")).toBe("720")
    expect(splitter.getAttribute("tabindex")).toBe("0")
    expect(splitter.getAttribute("aria-controls")).toBe("sutra-region")
  })

  it("resizes with the keyboard, clamps at min and max, and Enter resets", async () => {
    await openDesktop()
    const splitter = sutraSplitter()
    splitter.focus()
    fireEvent.keyDown(splitter, { key: "ArrowLeft" }) // right-docked: ArrowLeft grows
    expect(splitter.getAttribute("aria-valuenow")).toBe("390")
    fireEvent.keyDown(splitter, { key: "ArrowRight", shiftKey: true })
    expect(splitter.getAttribute("aria-valuenow")).toBe("326")
    fireEvent.keyDown(splitter, { key: "Home" })
    expect(splitter.getAttribute("aria-valuenow")).toBe("320")
    fireEvent.keyDown(splitter, { key: "ArrowRight" })
    expect(splitter.getAttribute("aria-valuenow")).toBe("320")
    fireEvent.keyDown(splitter, { key: "End" })
    // 1440 - 112 rail - 360 canvas floor - 12 splitter = 956, capped at 720
    expect(splitter.getAttribute("aria-valuenow")).toBe("720")
    fireEvent.keyDown(splitter, { key: "Enter" })
    expect(splitter.getAttribute("aria-valuenow")).toBe("374")
  })

  it("resizes by pointer drag using pointer capture, and never past the clamps", async () => {
    await openDesktop()
    const splitter = sutraSplitter()
    fireEvent.pointerDown(splitter, { button: 0, clientX: 1000, pointerId: 1 })
    expect(splitter.getAttribute("data-dragging")).toBe("true")
    fireEvent.pointerMove(splitter, { clientX: 900, pointerId: 1 })
    expect(splitter.getAttribute("aria-valuenow")).toBe("474")
    fireEvent.pointerMove(splitter, { clientX: -4000, pointerId: 1 })
    expect(splitter.getAttribute("aria-valuenow")).toBe("720")
    fireEvent.pointerMove(splitter, { clientX: 9000, pointerId: 1 })
    expect(splitter.getAttribute("aria-valuenow")).toBe("320")
    fireEvent.pointerUp(splitter, { pointerId: 1 })
    expect(splitter.getAttribute("data-dragging")).toBe("false")
    // moves after release are ignored
    fireEvent.pointerMove(splitter, { clientX: 100, pointerId: 1 })
    expect(splitter.getAttribute("aria-valuenow")).toBe("320")
  })

  it("moves SUTRA to the left through an accessible button and keeps focus on it", async () => {
    await openDesktop()
    const move = screen.getByRole("button", { name: "Move SUTRA to the left" })
    move.focus()
    fireEvent.click(move)
    expect(region().dataset.sutraSide).toBe("left")
    expect(grid().style.gridTemplateColumns).toBe("374px 12px minmax(0,1fr)")
    expect(region().style.gridColumn).toBe("1")
    expect(document.querySelector<HTMLElement>("[data-cockpit-region]")!.style.gridColumn).toBe("3")
    expect(screen.getByRole("button", { name: "Move SUTRA to the right" })).toBe(document.activeElement)
    // on the left, ArrowRight grows
    const splitter = sutraSplitter()
    fireEvent.keyDown(splitter, { key: "ArrowRight" })
    expect(splitter.getAttribute("aria-valuenow")).toBe("390")
  })

  it("wider/narrower buttons are a non-drag alternative and disable at the limits", async () => {
    await openDesktop()
    fireEvent.click(screen.getByRole("button", { name: "Make SUTRA wider" }))
    expect(sutraSplitter().getAttribute("aria-valuenow")).toBe("438")
    for (let i = 0; i < 6; i++) fireEvent.click(screen.getByRole("button", { name: "Make SUTRA wider" }))
    expect(sutraSplitter().getAttribute("aria-valuenow")).toBe("720")
    expect((screen.getByRole("button", { name: "Make SUTRA wider" }) as HTMLButtonElement).disabled).toBe(true)
    for (let i = 0; i < 8; i++) fireEvent.click(screen.getByRole("button", { name: "Make SUTRA narrower" }))
    expect(sutraSplitter().getAttribute("aria-valuenow")).toBe("320")
    expect((screen.getByRole("button", { name: "Make SUTRA narrower" }) as HTMLButtonElement).disabled).toBe(true)
  })

  it("collapses to a 44px strip keeping SUTRA mounted, moves focus to Restore, and restores focus to Collapse", async () => {
    await openDesktop()
    const panelBefore = screen.getByTestId("sutra-panel")
    fireEvent.click(screen.getByRole("button", { name: "Collapse SUTRA" }))
    expect(region().dataset.sutraMode).toBe("collapsed")
    expect(grid().style.gridTemplateColumns).toBe("minmax(0,1fr) 44px")
    expect(screen.queryByRole("separator", { name: "Resize SUTRA" })).toBeNull()
    const restore = screen.getByRole("button", { name: "Restore SUTRA" })
    expect(document.activeElement).toBe(restore)
    expect(screen.getByTestId("sutra-panel")).toBe(panelBefore) // not remounted: conversation state survives
    fireEvent.click(restore)
    expect(region().dataset.sutraMode).toBe("docked")
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Collapse SUTRA" }))
  })

  it("the header SUTRA button restores a collapsed dock instead of closing it", async () => {
    await openDesktop()
    fireEvent.click(screen.getByRole("button", { name: "Collapse SUTRA" }))
    const toggle = screen.getByRole("button", { name: "SUTRA" })
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    fireEvent.click(toggle)
    expect(region().dataset.sutraMode).toBe("docked")
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
  })

  it("persists width, side and collapse per product, and Reset clears them", async () => {
    await openDesktop()
    fireEvent.click(screen.getByRole("button", { name: "Move SUTRA to the left" }))
    fireEvent.keyDown(sutraSplitter(), { key: "ArrowRight", shiftKey: true })
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toMatchObject({ version: 1, sutraSide: "left", sutraWidth: 438, sutraCollapsed: false })
    expect(window.localStorage.getItem("ferrum:workspace-panel-layout:v1:Land")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Reset workspace layout" }))
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toMatchObject({ sutraSide: "right", sutraWidth: null, railWidth: 112 })
    expect((screen.getByRole("button", { name: "Reset workspace layout" }) as HTMLButtonElement).disabled).toBe(true)
  })

  it("restores a saved layout on load", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 1, sutraWidth: 560, sutraSide: "left", sutraCollapsed: false, railWidth: 150 }))
    await openDesktop()
    expect(region().dataset.sutraSide).toBe("left")
    expect(grid().style.gridTemplateColumns).toBe("560px 12px minmax(0,1fr)")
    expect(document.querySelector<HTMLElement>("[data-cockpit-region]")!.style.getPropertyValue("--rail-w")).toBe("150px")
  })

  it("ignores a stored layout from another schema version or with corrupt JSON", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ version: 99, sutraWidth: 560, sutraSide: "left" }))
    await openDesktop()
    expect(region().dataset.sutraSide).toBe("right")
    expect(grid().style.gridTemplateColumns).toBe("minmax(0,1fr) 12px 374px")
  })

  it("keeps working when localStorage throws", async () => {
    // Only the layout key is blocked; unrelated pre-existing storage users are out of scope here.
    const realGet = Storage.prototype.getItem
    const realSet = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) { if (key.startsWith("ferrum:workspace-panel-layout")) throw new Error("blocked"); return realGet.call(this, key) })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) { if (key.startsWith("ferrum:workspace-panel-layout")) throw new Error("blocked"); return realSet.call(this, key, value) })
    await openDesktop()
    fireEvent.click(screen.getByRole("button", { name: "Move SUTRA to the left" }))
    expect(region().dataset.sutraSide).toBe("left")
  })

  it("resizes the tool rail 112-200px with the keyboard and persists it", async () => {
    await openDesktop()
    const rail = screen.getByRole("separator", { name: "Resize tool rail" })
    expect(rail.getAttribute("aria-valuenow")).toBe("112")
    fireEvent.keyDown(rail, { key: "ArrowLeft" }) // narrower than the minimum is refused
    expect(rail.getAttribute("aria-valuenow")).toBe("112")
    fireEvent.keyDown(rail, { key: "ArrowRight", shiftKey: true })
    expect(rail.getAttribute("aria-valuenow")).toBe("176")
    fireEvent.keyDown(rail, { key: "End" })
    expect(rail.getAttribute("aria-valuenow")).toBe("200")
    expect(JSON.parse(window.localStorage.getItem(KEY)!).railWidth).toBe(200)
    expect(document.querySelector<HTMLElement>("[data-cockpit-region]")!.style.getPropertyValue("--rail-w")).toBe("200px")
  })

  it("Close SUTRA removes the dock and returns focus to the header toggle", async () => {
    await openDesktop()
    fireEvent.click(screen.getByRole("button", { name: "Close SUTRA" }))
    expect(document.querySelector("[data-sutra-region]")).toBeNull()
    expect(grid().style.gridTemplateColumns).toBe("")
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "SUTRA" }))
  })

  it("every dock control is a real button with an accessible name", async () => {
    await openDesktop()
    const bar = screen.getByRole("toolbar", { name: "SUTRA dock controls" })
    const buttons = within(bar).getAllByRole("button")
    expect(buttons).toHaveLength(6)
    for (const button of buttons) {
      expect(button.getAttribute("aria-label")).toBeTruthy()
      expect(button.className).toMatch(/min-h-11/)
      expect(button.className).toMatch(/min-w-11/)
    }
  })
})

describe("cockpit SUTRA on tablets and phones", () => {
  beforeEach(() => {
    desktop = false
    phone = true
  })

  async function openSutra() {
    render(<ProjectWorkspaceCockpit />)
    await act(async () => {})
    fireEvent.click(screen.getByRole("button", { name: "SUTRA" }))
  }

  it("opens full-screen and modal by default, with no desktop splitter", async () => {
    await openSutra()
    expect(region().dataset.sutraMode).toBe("full")
    expect(region().dataset.sutraFullscreen).toBe("true")
    expect(region().getAttribute("role")).toBe("dialog")
    expect(region().getAttribute("aria-modal")).toBe("true")
    expect(region().className).toContain("fixed inset-0")
    expect(screen.queryByRole("separator")).toBeNull()
    expect(screen.getByTestId("canvas").dataset.occluded).toBe("true")
    expect(document.body.style.overflow).toBe("hidden")
  })

  it("offers explicit Full / Reading / Minimize presets as 44px targets", async () => {
    await openSutra()
    const bar = screen.getByRole("toolbar", { name: "SUTRA size" })
    const buttons = within(bar).getAllByRole("button")
    expect(buttons).toHaveLength(3)
    for (const button of buttons) expect(button.className).toMatch(/min-h-11/)
    expect(within(bar).getByRole("button", { name: /Full/ }).getAttribute("aria-pressed")).toBe("true")
  })

  it("Reading size drops to a non-modal bottom sheet that leaves the model reachable and unlocks scroll", async () => {
    await openSutra()
    fireEvent.click(screen.getByRole("button", { name: /Reading/ }))
    expect(region().dataset.sutraMode).toBe("reading")
    expect(region().dataset.sutraFullscreen).toBe("false")
    expect(region().hasAttribute("aria-modal")).toBe(false)
    expect(region().className).toContain("env(safe-area-inset-bottom)")
    // measured plan: 45% of the 768px viewport, model keeps 302px above it
    expect(region().style.height).toBe("346px")
    expect(region().style.top).toBe("422px")
    expect(region().dataset.sutraModelVisible).toBe("302")
    expect(screen.getByTestId("canvas").dataset.occluded).toBe("false")
    expect(document.body.style.overflow).not.toBe("hidden")
    fireEvent.click(screen.getByRole("button", { name: /Full/ }))
    expect(region().dataset.sutraMode).toBe("full")
  })

  it("Minimize and Escape close SUTRA, return focus to the header toggle and reset to full-screen next time", async () => {
    await openSutra()
    fireEvent.click(screen.getByRole("button", { name: /Reading/ }))
    fireEvent.click(screen.getByRole("button", { name: "Minimize SUTRA" }))
    expect(document.querySelector("[data-sutra-region]")).toBeNull()
    const toggle = screen.getByRole("button", { name: "SUTRA" })
    expect(document.activeElement).toBe(toggle)
    fireEvent.click(toggle)
    expect(region().dataset.sutraMode).toBe("full")
    fireEvent.keyDown(document, { key: "Escape" })
    expect(document.querySelector("[data-sutra-region]")).toBeNull()
    expect(document.activeElement).toBe(toggle)
  })

  it("follows the visual viewport so the composer clears the keyboard, in full and reading modes", async () => {
    const listeners: Record<string, () => void> = {}
    const viewport = { offsetTop: 0, height: 800, addEventListener: (n: string, cb: () => void) => { listeners[n] = cb }, removeEventListener: () => undefined }
    Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport })
    canvasRect = { top: 100, bottom: 700 }
    await openSutra()
    expect(region().style.top).toBe("0px")
    expect(region().style.height).toBe("800px")
    fireEvent.click(screen.getByRole("button", { name: /Reading/ }))
    // 45% of the visual viewport = 360 -> top 440, model 100..440 = 340px
    expect(region().style.top).toBe("440px")
    expect(region().style.height).toBe("360px")
    Object.defineProperty(window, "visualViewport", { configurable: true, value: undefined })
  })

  it("keeps Full + Minimize and disables Reading when the sheet would cover the model", async () => {
    // 320x568-like: canvas starts low, so 45% would leave < 180px of model
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 568 })
    canvasRect = { top: 300, bottom: 520 }
    await openSutra()
    const reading = screen.getByRole("button", { name: /Reading/ })
    expect(reading.getAttribute("aria-disabled")).toBe("true")
    expect(region().dataset.sutraReadingAvailable).toBe("false")
    expect(screen.getByText(/Reading size unavailable/)).toBeTruthy()
    fireEvent.click(reading)
    expect(region().dataset.sutraMode).toBe("full")
    expect(screen.getByRole("button", { name: /Full/ })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Minimize SUTRA" })).toBeTruthy()
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 })
  })

  it("shrinks the sheet (not the model) when a little more room is needed, and disables Reading when the canvas is unmeasurable", async () => {
    canvasRect = { top: 300, bottom: 700 }
    const { unmount } = render(<ProjectWorkspaceCockpit />)
    await act(async () => {})
    fireEvent.click(screen.getByRole("button", { name: "SUTRA" }))
    fireEvent.click(screen.getByRole("button", { name: /Reading/ }))
    // preferred 346 would leave 768-346-300 = 122px -> sheet shrinks to 288, model = 180
    expect(region().style.height).toBe("288px")
    expect(region().dataset.sutraModelVisible).toBe("180")
    unmount()
    canvasRect = null
    await openSutra()
    expect(screen.getByRole("button", { name: /Reading/ }).getAttribute("aria-disabled")).toBe("true")
  })

  it("does not apply desktop persistence or grid overrides", async () => {
    await openSutra()
    expect(grid().style.gridTemplateColumns).toBe("")
    fireEvent.click(screen.getByRole("button", { name: /Reading/ }))
    // reading mode is per-open and never persisted
    const stored = window.localStorage.getItem(KEY)
    expect(stored === null || !stored.includes("reading")).toBe(true)
  })
})
