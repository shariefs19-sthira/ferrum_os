import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import SuitabilitySummaryPanel from "./SuitabilitySummaryPanel"
import { useParcelContext } from "../../lib/workspace/parcelContext"

vi.mock("../../lib/workspace/parcelContext", () => ({ useParcelContext: vi.fn() }))

const dimensionLabels = ["Physical fit", "Planning", "Environmental", "Structural", "Geotechnical", "Supply", "Delivery"]

describe("SuitabilitySummaryPanel", () => {
  describe("with no active project context", () => {
    beforeEach(() => vi.mocked(useParcelContext).mockReturnValue(null))

    it("renders as an accessible, labelled section with a heading", () => {
      render(<SuitabilitySummaryPanel />)
      const section = document.querySelector("[data-suitability-summary]")
      expect(section).toBeTruthy()
      expect(section?.getAttribute("aria-labelledby")).toBe("suitability-summary-heading")
      expect(screen.getByRole("heading", { name: /Suitability across seven evidence-linked dimensions/ })).toBeTruthy()
    })

    it("clearly marks itself as an INDICATIVE sample fixture, never a real evaluation", () => {
      render(<SuitabilitySummaryPanel />)
      expect(document.querySelector('[data-suitability-mode="sample-fixture"]')).toBeTruthy()
      expect(screen.getByText(/SAMPLE FIXTURE - INDICATIVE/)).toBeTruthy()
      expect(screen.getByText(/not a real project evaluation/)).toBeTruthy()
    })

    it("shows all seven dimensions, each with an explicit state", () => {
      render(<SuitabilitySummaryPanel />)
      const list = screen.getByLabelText("Suitability dimensions")
      for (const label of dimensionLabels) {
        expect(within(list).getByText(label)).toBeTruthy()
      }
      expect(document.querySelectorAll("[data-suitability-dimension]").length).toBe(7)
    })

    it("never reports SUPPORTED or CONDITIONAL without INDICATIVE/UNKNOWN/STALE-consistent labelling", () => {
      render(<SuitabilitySummaryPanel />)
      const states = Array.from(document.querySelectorAll("[data-suitability-state]")).map((el) => el.getAttribute("data-suitability-state"))
      expect(states.length).toBe(7)
      expect(states).not.toContain("SUPPORTED")
      for (const state of states) {
        expect(["SUPPORTED", "CONDITIONAL", "BLOCKED", "UNKNOWN", "STALE"]).toContain(state)
      }
      // A CONDITIONAL badge always renders with an explicit INDICATIVE qualifier.
      const conditionalBadges = Array.from(document.querySelectorAll('[data-suitability-state="CONDITIONAL"]'))
      for (const badge of conditionalBadges) expect(badge.textContent).toMatch(/INDICATIVE/)
    })

    it("shows an overall state governed by the weakest dimension, with change-impact sections", () => {
      render(<SuitabilitySummaryPanel />)
      const overall = document.querySelector("[data-suitability-overall-state]")
      expect(overall).toBeTruthy()
      expect(screen.getByText(/Governed by/)).toBeTruthy()
      expect(screen.getByText("Evidence reused")).toBeTruthy()
      expect(screen.getByText("Recheck required")).toBeTruthy()
      expect(screen.getByText("Recomputation required")).toBeTruthy()
      expect(screen.getByText("Professional review required")).toBeTruthy()
    })

    it("carries the INDICATIVE compliance disclaimer", () => {
      render(<SuitabilitySummaryPanel />)
      expect(screen.getByText(/not a legal, structural or regulatory compliance determination/)).toBeTruthy()
    })

    it("exposes evidence behind an accessible disclosure control", () => {
      render(<SuitabilitySummaryPanel />)
      const summaries = screen.getAllByText(/Evidence \(\d+\)/)
      expect(summaries.length).toBeGreaterThan(0)
      expect(summaries[0].closest("summary")).toBeTruthy()
    })
  })

  describe("with an active project context", () => {
    beforeEach(() =>
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
      }),
    )

    it("switches to project-context mode and never shows the sample-fixture note", () => {
      render(<SuitabilitySummaryPanel />)
      expect(document.querySelector('[data-suitability-mode="project-context"]')).toBeTruthy()
      expect(document.querySelector('[data-suitability-mode="sample-fixture"]')).toBeNull()
      expect(screen.queryByText(/SAMPLE FIXTURE - INDICATIVE/)).toBeNull()
      expect(screen.getByText("New Delhi, Delhi")).toBeTruthy()
    })

    it("does not fabricate structural/geotechnical evidence for a real parcel with no captured dimensions", () => {
      render(<SuitabilitySummaryPanel />)
      const structural = document.querySelector('[data-suitability-dimension="structural"]')
      const geotechnical = document.querySelector('[data-suitability-dimension="geotechnical"]')
      // No catalogue template has a precomputed structural analysis envelope
      // today (an honest fact, not a fabricated one) - that alone is enough
      // to BLOCK the structural dimension regardless of dimension inputs.
      expect(structural?.querySelector("[data-suitability-state]")?.getAttribute("data-suitability-state")).toBe("BLOCKED")
      // No geotechnical evidence source is wired into DesignStudio yet, so
      // this stays UNKNOWN rather than a guessed CONDITIONAL/SUPPORTED.
      expect(geotechnical?.querySelector("[data-suitability-state]")?.getAttribute("data-suitability-state")).toBe("UNKNOWN")
    })

    it("keeps planning UNKNOWN until the project explicitly resolves its jurisdiction", () => {
      render(<SuitabilitySummaryPanel />)
      const planning = document.querySelector('[data-suitability-dimension="planning"]')
      expect(planning?.querySelector("[data-suitability-state]")?.getAttribute("data-suitability-state")).toBe("UNKNOWN")
      expect(planning?.textContent).toMatch(/No jurisdiction pack is resolved/)
      expect(planning?.textContent).toMatch(/country, state\/province and local authority/)
    })

    it("governs the overall result by the weakest (structural) dimension, never SUPPORTED", () => {
      render(<SuitabilitySummaryPanel />)
      const overall = document.querySelector("[data-suitability-overall-state]")
      expect(overall?.getAttribute("data-suitability-overall-state")).toBe("BLOCKED")
      expect(screen.getByText(/Governed by/).textContent).toMatch(/Structural/)
    })
  })
})
