import { render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import LibraryVariantLineagePanel from "./LibraryVariantLineagePanel"
import { useParcelContext } from "../../lib/workspace/parcelContext"
import { suitabilitySampleParcel } from "../../lib/designstudio/suitabilitySampleFixture"

vi.mock("../../lib/workspace/parcelContext", () => ({ useParcelContext: vi.fn() }))

describe("LibraryVariantLineagePanel", () => {
  beforeEach(() => vi.mocked(useParcelContext).mockReturnValue(null))

  it("renders a labelled section with a heading", () => {
    render(<LibraryVariantLineagePanel />)
    const section = document.querySelector("[data-library-variant-lineage]")
    expect(section?.getAttribute("aria-labelledby")).toBe("library-variant-heading")
    expect(screen.getByRole("heading", { name: /How a private variant derives from an approved parent/ })).toBeTruthy()
  })

  it("labels the intent as an INDICATIVE sample when no project context is active", () => {
    render(<LibraryVariantLineagePanel />)
    expect(document.querySelector('[data-library-variant-mode="sample-fixture"]')).toBeTruthy()
    expect(screen.getByText(/SAMPLE INTENT - INDICATIVE/)).toBeTruthy()
  })

  it("keeps the sample-intent label even when a project parcel is loaded", () => {
    vi.mocked(useParcelContext).mockReturnValue(suitabilitySampleParcel)
    render(<LibraryVariantLineagePanel />)
    expect(document.querySelector('[data-library-variant-mode="project-context-parent"]')).toBeTruthy()
    expect(screen.getByText(/SAMPLE INTENT - INDICATIVE/)).toBeTruthy()
  })

  it("shows parent template, version, intent facets and derived deltas", () => {
    render(<LibraryVariantLineagePanel />)
    const parent = document.querySelector("[data-library-variant-parent]")
    expect(parent?.textContent).toMatch(/v\d+\.\d+\.\d+/)
    expect(parent?.textContent).toMatch(/lineage depth 0/)
    expect(document.querySelector("[data-library-variant-intent]")?.textContent).toMatch(/Home office/)
    const deltas = document.querySelectorAll("[data-library-variant-delta]")
    expect(deltas.length).toBeGreaterThan(0)
    expect(within(screen.getByLabelText("Parameter deltas")).getAllByText(/→/).length).toBe(deltas.length)
  })

  it("shows provenance, a non-public licence and NOT GRANTED consent", () => {
    render(<LibraryVariantLineagePanel />)
    expect(document.querySelector("[data-library-variant-provenance]")).toBeTruthy()
    expect(document.querySelector('[data-library-variant-licence="TENANT_PRIVATE_DERIVATIVE"]')?.textContent).toMatch(/Public library reuse: not permitted/)
    const consent = document.querySelector("[data-library-variant-consent]")
    expect(consent?.getAttribute("data-library-variant-consent")).toBe("NOT_GRANTED")
    expect(consent?.textContent).toMatch(/NOT GRANTED/)
    expect(consent?.textContent).toMatch(/never counts as training consent/)
  })

  it("keeps the four validation stages distinct with only GENERATED current", () => {
    render(<LibraryVariantLineagePanel />)
    const steps = Array.from(document.querySelectorAll("[data-validation-step]"))
    expect(steps.map((step) => step.getAttribute("data-validation-step"))).toEqual([
      "GENERATED",
      "GEOMETRY_CHECKED",
      "ENGINEERING_VERIFIED",
      "APPROVED_FOR_ISSUE",
    ])
    expect(steps.map((step) => step.getAttribute("data-validation-reached"))).toEqual(["true", "false", "false", "false"])
    for (const label of ["GENERATED", "GEOMETRY CHECKED", "ENGINEERING VERIFIED", "APPROVED FOR ISSUE"]) {
      expect(screen.getByText(label)).toBeTruthy()
    }
  })

  it("holds the human review gate and lists what blocks it", () => {
    render(<LibraryVariantLineagePanel />)
    expect(document.querySelector('[data-library-variant-gate="held"]')).toBeTruthy()
    expect(screen.getByText(/HELD — HUMAN REVIEW REQUIRED/)).toBeTruthy()
    const blockers = screen.getByLabelText("Promotion blockers")
    expect(within(blockers).getByText(/identified human reviewer/)).toBeTruthy()
    expect(within(blockers).getByText(/Engineering verification is required/)).toBeTruthy()
    expect(within(blockers).getByText(/TRAINING_OPT_IN/)).toBeTruthy()
    expect(document.querySelector('[data-library-variant-gate="open"]')).toBeNull()
  })

  it("never claims self-training, structural verification, copied architect IP or 15-minute readiness", () => {
    render(<LibraryVariantLineagePanel />)
    const text = document.querySelector("[data-library-variant-lineage]")?.textContent ?? ""
    expect(text).not.toMatch(/self-train|learns from|15[- ]minute|fifteen/i)
    expect(text).not.toMatch(/structurally verified(?!,)/i)
    expect(text).toMatch(/not structurally verified, not approved for issue, and not a reproduction of any architect/)
    expect(text).toMatch(/INDICATIVE/)
  })
})
