import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import Concierge from "./Concierge"
import { clearFeedback, getFeedback } from "../lib/ai/feedback"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe("Concierge", () => {
  beforeEach(() => {
    clearFeedback()
  })

  it("opens, answers a grounded question with a citation, and records useful feedback", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))

    const input = screen.getByRole("textbox", { name: "Message" })
    fireEvent.change(input, { target: { value: "how often are the adopt hold drop stances reviewed" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByText(/Sources?:/)).toBeTruthy()
    expect(screen.getByText("Was this useful?")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Mark answer as useful" }))
    expect(screen.getByText("Thanks for the feedback.")).toBeTruthy()

    const stored = getFeedback()
    expect(stored.length).toBe(1)
    expect(stored[0].useful).toBe(true)
  })

  it("falls back honestly and shows no citations for an unrecognized query", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))

    const input = screen.getByRole("textbox", { name: "Message" })
    fireEvent.change(input, { target: { value: "zzzz gibberish nonsense 999" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByText(/I couldn't find that/)).toBeTruthy()
    expect(screen.queryByText(/Sources?:/)).toBeNull()
  })

  it("captures an optional correction on not-useful feedback", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))

    const input = screen.getByRole("textbox", { name: "Message" })
    fireEvent.change(input, { target: { value: "how often are the adopt hold drop stances reviewed" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    await screen.findByText(/Sources?:/)

    fireEvent.click(screen.getByRole("button", { name: "Mark answer as not useful" }))
    const correctionInput = screen.getByRole("textbox", { name: "Correction for this answer" })
    fireEvent.change(correctionInput, { target: { value: "I wanted the FAQ update cadence" } })
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    const stored = getFeedback()
    expect(stored.length).toBe(1)
    expect(stored[0].useful).toBe(false)
    expect(stored[0].correction).toBe("I wanted the FAQ update cadence")
  })

  it("uses the selected Ferrum product as governed SUTRA conversation context", async () => {
    render(<Concierge />)
    window.dispatchEvent(new CustomEvent("ferrum:sutra-context", { detail: {
      id: "landintel", label: "LandIntel", lens: "Decide whether a parcel is viable.",
      persona: "Land buyer", evidenceState: "INDICATIVE", provenance: "Seeded ULPIN source.",
      outputs: ["parcel record"], controls: ["ULPIN lookup"],
    } }))
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.click(await screen.findByRole("button", { name: "Explain all LandIntel features" }))
    expect(await screen.findByText(/LandIntel includes/)).toBeTruthy()
    expect(screen.getByText(/Scenario forecast/)).toBeTruthy()
  })

  it("changes the SUTRA action when a user selects an annotated tool", async () => {
    render(<><button data-sutra-product="landintel" data-sutra-feature-id="location-coordinates">Coordinates</button><Concierge /></>)
    fireEvent.click(screen.getByRole("button", { name: "Coordinates" }))
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    const explain = await screen.findByRole("button", { name: "Explain Coordinates" })
    fireEvent.click(explain)
    expect(await screen.findByText(/decimal coordinates/)).toBeTruthy()
    expect(screen.getByText(/does not infer a parcel boundary/)).toBeTruthy()
  })

  it("exposes provider choices without granting unconnected models Ferrum access", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.change(screen.getByRole("combobox", { name: "Agent model" }), { target: { value: "anthropic" } })
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "change the project" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText(/needs an approved provider connection/)).toBeTruthy()
  })

  it("shows the construction connector catalogue with truthful connection status", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.click(screen.getByRole("button", { name: "Connections" }))
    expect(screen.getByText("Governed connector catalogue")).toBeTruthy()
    expect(screen.getByText(/Autodesk Construction Cloud/)).toBeTruthy()
    expect(screen.getByText(/not claims of active integration/)).toBeTruthy()
  })
})
