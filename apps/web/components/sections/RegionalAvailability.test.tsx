import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import RegionalAvailability from "./RegionalAvailability"

describe("RegionalAvailability", () => {
  it("keeps regional availability UNKNOWN until the user explicitly declares a country", () => {
    render(<RegionalAvailability />)

    expect((screen.getByLabelText("Country code") as HTMLInputElement).value).toBe("")
    expect(screen.getAllByText("UNAVAILABLE").length).toBeGreaterThan(0)
    expect(screen.getByText(/does not use device or IP location/i)).toBeTruthy()
    expect(screen.getAllByText(/No jurisdiction was declared/i).length).toBeGreaterThan(0)
  })

  it("keeps a recognized user-declared country unverified and unavailable", () => {
    render(<RegionalAvailability />)
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "in" } })

    expect(screen.getByDisplayValue("IN")).toBeTruthy()
    expect(screen.getAllByText("AVAILABLE").length).toBe(1)
    expect(screen.getAllByText("UNAVAILABLE").length).toBeGreaterThan(5)
    expect(screen.getAllByText(/Jurisdiction IN declared via user-declared/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/entry is not persisted/i)).toBeTruthy()
    expect(screen.getAllByText(/ephemeral and unverified/i).length).toBeGreaterThan(0)
  })

  it("keeps an unrecognized two-letter entry unverified and unavailable", () => {
    render(<RegionalAvailability />)
    fireEvent.change(screen.getByLabelText("Country code"), { target: { value: "zz" } })

    expect(screen.getByDisplayValue("ZZ")).toBeTruthy()
    expect(screen.getAllByText("UNAVAILABLE").length).toBeGreaterThan(5)
    expect(screen.queryAllByText("AVAILABLE")).toHaveLength(1)
    expect(screen.getAllByText(/does not prove regional or regulatory coverage/i).length).toBeGreaterThan(0)
  })

  it("renders all policy statuses in an accessible status key and exposes evidence fallback", () => {
    render(<RegionalAvailability />)

    const statusKey = within(screen.getByLabelText("Availability status key"))
    for (const status of ["AVAILABLE", "INDICATIVE", "PARTIAL", "EXTERNAL_GATE", "UNAVAILABLE"]) {
      expect(statusKey.getByText(status)).toBeTruthy()
    }
    expect(screen.getAllByText("Evidence and fallback").length).toBeGreaterThan(0)
  })

  it("gives every Evidence and fallback summary a 44px target and visible focus ring", () => {
    const { container } = render(<RegionalAvailability />)

    const toggles = container.querySelectorAll("summary[data-regional-evidence-toggle]")
    expect(toggles).toHaveLength(5)
    for (const toggle of Array.from(toggles)) {
      expect(toggle.className).toMatch(/\bmin-h-11\b/)
      expect(toggle.className).toMatch(/\bflex\b/)
      expect(toggle.className).toMatch(/\bitems-center\b/)
      expect(toggle.className).toMatch(/focus-visible:outline-2/)
      expect(toggle.className).toMatch(/focus-visible:outline-relume-command/)
      expect(toggle.parentElement?.tagName).toBe("DETAILS")
      expect(toggle.textContent).toBe("Evidence and fallback")
    }
  })

  it("keeps conservative UNKNOWN semantics while evidence is disclosed", () => {
    const { container } = render(<RegionalAvailability />)
    const details = container.querySelector("details") as HTMLDetailsElement
    details.open = true

    expect(details.textContent).toMatch(/Fallback:/)
    expect(screen.queryAllByText("AVAILABLE")).toHaveLength(1)
  })
})
