import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import ToolsRuler from "./ToolsRuler"

const baseProps = {
  activeTool: "select" as const,
  extractOpen: false,
  onExtractOpenChange: vi.fn(),
  onMoreOpenChange: vi.fn(),
  onToolChange: vi.fn(),
}

// W2-503: the `rail=false` branch (this component's only genuinely dead
// call path today — its live call site always passes `rail`) used to be
// a horizontally scrolling row. It now reuses the same trigger +
// role="listbox" pattern TabRail.tsx/HomepageCockpitHero.tsx ship, so
// this mirrors TabRail.test.tsx's shape for that same pattern.
describe("ToolsRuler rail=false (trigger+listbox, no horizontal scroll)", () => {
  it("has no overflow-x-auto scroll container", () => {
    render(<ToolsRuler {...baseProps} />)
    expect(document.querySelector(".overflow-x-auto")).toBeNull()
  })

  it("opens the listbox from the trigger and lists the three canvas tools", () => {
    render(<ToolsRuler {...baseProps} />)
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute("aria-expanded")).toBe("false")

    fireEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    const listbox = screen.getByRole("listbox", { name: "Workspace tools" })
    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(3)
    expect(listbox).toBeTruthy()
  })

  it("selecting an option commits the tool, closes the menu and returns focus to the trigger", () => {
    const onToolChange = vi.fn()
    render(<ToolsRuler {...baseProps} onToolChange={onToolChange} />)
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    fireEvent.click(trigger)

    fireEvent.click(screen.getByRole("option", { name: "Measure" }))
    expect(onToolChange).toHaveBeenCalledWith("measure")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it("Escape closes the listbox and returns focus to the trigger without changing the tool", () => {
    const onToolChange = vi.fn()
    render(<ToolsRuler {...baseProps} onToolChange={onToolChange} />)
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    fireEvent.click(trigger)
    expect(screen.getByRole("listbox")).toBeTruthy()

    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(onToolChange).not.toHaveBeenCalled()
  })
})

describe("ToolsRuler rail=true (vertical rail without horizontal scroll)", () => {
  it("renders canvas tools and one extract action without an overflow-x container", () => {
    render(<ToolsRuler {...baseProps} rail />)
    expect(document.querySelector('[aria-haspopup="listbox"]')).toBeNull()
    expect(document.querySelector(".overflow-x-auto")).toBeNull()
    expect(screen.getAllByRole("button", { name: /Select|Measure|Compare/ })).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Open extract" })).toBeTruthy()
  })
})
