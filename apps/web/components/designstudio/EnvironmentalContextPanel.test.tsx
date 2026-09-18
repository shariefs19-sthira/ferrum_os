import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EnvironmentalContextPanel from "./EnvironmentalContextPanel"
import { useParcelContext } from "../../lib/workspace/parcelContext"

vi.mock("../../lib/workspace/parcelContext", () => ({ useParcelContext: vi.fn() }))

describe("EnvironmentalContextPanel", () => {
  beforeEach(() => vi.mocked(useParcelContext).mockReturnValue(null))

  it("shows every source-separated layer and keeps provider-gated context unavailable", () => {
    render(<EnvironmentalContextPanel />)
    expect(screen.getByText("Parcel selection extent")).toBeTruthy()
    expect(screen.getByText("Terrain")).toBeTruthy()
    expect(screen.getByText("OSM contextual buildings & roads")).toBeTruthy()
    expect(screen.getByText("Photorealistic visual context (optional)")).toBeTruthy()
    expect(screen.getByText("Proposed design")).toBeTruthy()
    expect(document.querySelector('[data-google-tiles-status="GATED_UNAVAILABLE"]')).toBeTruthy()
    expect(screen.getAllByText("GATED UNAVAILABLE").length).toBeGreaterThan(0)
  })

  it("opens provenance and exposes CRS, licence and completeness", () => {
    render(<EnvironmentalContextPanel />)
    expect(screen.getAllByText("No parcel selected").length).toBeGreaterThan(0)
    expect(screen.getByText("CRS")).toBeTruthy()
    expect(screen.getByText("Licence")).toBeTruthy()
    expect(screen.getByText("Completeness")).toBeTruthy()
    fireEvent.click(screen.getAllByRole("button", { name: "View provenance" })[0])
    expect(screen.getByText("No terrain source connected")).toBeTruthy()
  })

  it("announces LOD changes without changing the evidence boundary", () => {
    render(<EnvironmentalContextPanel />)
    fireEvent.change(screen.getByLabelText("Scene detail"), { target: { value: "low" } })
    expect(screen.getByRole("status").textContent).toMatch(/Reduced mesh density/)
    expect(screen.getByText(/INDICATIVE — CONTEXT ONLY/)).toBeTruthy()
  })

  it("reports cross-source displacement instead of snapping sample OSM to a selected parcel", () => {
    vi.mocked(useParcelContext).mockReturnValue({
      version: 1,
      method: "coordinates",
      ulpin: null,
      state: "Delhi",
      district: "New Delhi",
      area_sqm: 1200,
      land_use: "Residential",
      coordinates: { lat: 28.6139, lng: 77.209 },
      provenance: { source: "Verified project record", vintage: "2026-09-18", status: "VERIFIED" },
    })
    render(<EnvironmentalContextPanel />)
    expect(screen.getByText("New Delhi, Delhi")).toBeTruthy()
    expect(screen.getByText(/outside this scene's render range/)).toBeTruthy()
    expect(screen.getAllByText("INDICATIVE").length).toBeGreaterThan(0)
  })
})
