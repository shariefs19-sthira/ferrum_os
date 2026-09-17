import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import TabRail from "./TabRail"

// W2-502: TabRail's product rail used to overflow-x-auto scroll. It now
// renders both a `min-[1366px]:` full row (hidden by CSS at narrower
// widths, which jsdom doesn't evaluate, so it stays in the DOM here) and
// a compact trigger + role="listbox" menu, reusing HomepageCockpitHero's
// pattern. These tests target the listbox path via its
// aria-haspopup="listbox" trigger specifically, so they exercise real
// behaviour regardless of which layer CSS would show in a browser.
describe("TabRail (no horizontal scroll, trigger+listbox)", () => {
  it("has no overflow-x-auto scroll container", () => {
    render(<TabRail activeProduct="Land" onProductChange={vi.fn()} />)
    expect(document.querySelector(".overflow-x-auto")).toBeNull()
  })

  it("opens the listbox from the trigger and lists all ten products", () => {
    render(<TabRail activeProduct="Land" onProductChange={vi.fn()} />)
    // Both the >=1366px full row and the compact trigger render a "Land"
    // button in jsdom (which doesn't evaluate the CSS that hides one of
    // them) - the trigger is the one with aria-haspopup="listbox".
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    expect(trigger).toBeTruthy()
    expect(trigger.getAttribute("aria-expanded")).toBe("false")

    fireEvent.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("true")
    const listbox = screen.getByRole("listbox", { name: "Workspace products" })
    const options = screen.getAllByRole("option")
    expect(options).toHaveLength(10)
    expect(listbox).toBeTruthy()
  })

  it("selecting an option commits the product, closes the menu and returns focus to the trigger", () => {
    const onProductChange = vi.fn()
    render(<TabRail activeProduct="Land" onProductChange={onProductChange} />)
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    fireEvent.click(trigger)

    fireEvent.click(screen.getByRole("option", { name: "Transact" }))
    expect(onProductChange).toHaveBeenCalledWith("Transact")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it("Escape closes the listbox and returns focus to the trigger without changing the selection", () => {
    const onProductChange = vi.fn()
    render(<TabRail activeProduct="Land" onProductChange={onProductChange} />)
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    fireEvent.click(trigger)
    expect(screen.getByRole("listbox")).toBeTruthy()

    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(onProductChange).not.toHaveBeenCalled()
  })
})
