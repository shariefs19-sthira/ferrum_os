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
})
