import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
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
    fireEvent.click(await screen.findByRole("button", { name: /Working context/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Explain all LandIntel features" }))
    expect(await screen.findByText(/LandIntel includes/)).toBeTruthy()
    expect(screen.getByText(/Scenario forecast/)).toBeTruthy()
  })

  it("changes the SUTRA action when a user selects an annotated tool", async () => {
    render(<><button data-sutra-product="landintel" data-sutra-feature-id="location-coordinates">Coordinates</button><Concierge /></>)
    fireEvent.click(screen.getByRole("button", { name: "Coordinates" }))
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.click(await screen.findByRole("button", { name: /Working context/ }))
    const explain = await screen.findByRole("button", { name: "Explain Coordinates" })
    fireEvent.click(explain)
    expect(await screen.findByText(/decimal coordinates/)).toBeTruthy()
    expect(screen.getByText(/does not infer a parcel boundary/)).toBeTruthy()
  })

  it("exposes provider choices without granting unconnected models Ferrum access", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.click(screen.getByRole("button", { name: /Model & connections/ }))
    fireEvent.change(screen.getByRole("combobox", { name: "Agent model" }), { target: { value: "anthropic" } })
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "change the project" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText(/needs an approved provider connection/)).toBeTruthy()
  })

  it("shows the construction connector catalogue with truthful connection status", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.click(screen.getByRole("button", { name: /Model & connections/ }))
    fireEvent.click(screen.getByRole("button", { name: "Connections" }))
    expect(screen.getByText("Governed connector catalogue")).toBeTruthy()
    expect(screen.getByText(/Autodesk Construction Cloud/)).toBeTruthy()
    expect(screen.getByText(/not claims of active integration/)).toBeTruthy()
  })

  it("keeps the composer free of generic suggestion chips", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    expect(screen.queryByRole("button", { name: "Products" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Pricing" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Try a tool" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Talk to someone" })).toBeNull()
  })

  it("minimizes to the persistent launcher, keeps the conversation, and restores focus", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "how often are the adopt hold drop stances reviewed" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    await screen.findByText(/Sources?:/)

    fireEvent.click(screen.getByRole("button", { name: "Minimize SUTRA" }))
    expect(screen.queryByRole("dialog", { name: "SUTRA AI assistant" })).toBeNull()
    const launcher = screen.getByRole("button", { name: "Open SUTRA" })
    expect(launcher.textContent).toContain("SUTRA")
    await waitFor(() => expect(document.activeElement).toBe(launcher))

    fireEvent.click(launcher)
    expect(await screen.findByText(/Sources?:/)).toBeTruthy()
  })

  it("minimizes on Escape", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog", { name: "SUTRA AI assistant" })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open SUTRA" }))
  })

  it("starts with model and connections chrome collapsed, then expands and collapses with accessible state", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    const toggle = screen.getByRole("button", { name: /Model & connections/ })
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(screen.queryByRole("combobox", { name: "Agent model" })).toBeNull()
    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByRole("combobox", { name: "Agent model" })).toBeTruthy()
    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(document.getElementById("sutra-chrome-panel")?.hasAttribute("hidden")).toBe(true)
  })

  it("opens as a tall header-to-bottom side panel that respects the cookie safe area and keeps the conversation as the growing region", () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
    const dialog = screen.getByRole("dialog", { name: "SUTRA AI assistant" })
    expect(dialog.className).toContain("sm:top-[5rem]")
    expect(dialog.className).toContain("var(--cookie-consent-h,0px)")
    expect(dialog.className).not.toMatch(/sm:h-\[/)
    expect(dialog.className).toContain("sm:w-[clamp(24rem,36vw,36rem)]")
    const log = screen.getByRole("log", { name: "Conversation" })
    expect(log.className).toContain("flex-1")
    expect(log.className).toContain("min-h-0")
    expect(log.className).toContain("overflow-y-auto")
  })

  describe("on a phone viewport", () => {
    beforeEach(() => {
      vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    })
    afterEach(() => {
      vi.unstubAllGlobals()
      document.body.style.overflow = ""
    })

    it("opens full-screen, collapses secondary chrome by default, and locks then restores background scroll", async () => {
      render(<Concierge />)
      fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
      const dialog = await screen.findByRole("dialog", { name: "SUTRA AI assistant" })
      expect(dialog.getAttribute("data-sutra-fullscreen")).toBe("true")
      expect(dialog.className).toContain("fixed inset-0")
      await waitFor(() => expect(screen.getByRole("button", { name: /Model & connections/ }).getAttribute("aria-expanded")).toBe("false"))
      expect(screen.getByRole("textbox", { name: "Message" })).toBeTruthy()
      expect(document.body.style.overflow).toBe("hidden")

      fireEvent.click(screen.getByRole("button", { name: "Minimize SUTRA" }))
      expect(document.body.style.overflow).toBe("")
    })

    it("collapses the working-context card by default and expands it on demand", async () => {
      render(<Concierge />)
      window.dispatchEvent(new CustomEvent("ferrum:sutra-context", { detail: {
        id: "landintel", label: "LandIntel", lens: "Decide whether a parcel is viable.",
        persona: "Land buyer", evidenceState: "INDICATIVE", provenance: "Seeded ULPIN source.",
        outputs: ["parcel record"], controls: ["ULPIN lookup"],
      } }))
      fireEvent.click(screen.getByRole("button", { name: "Open SUTRA" }))
      const toggle = await screen.findByRole("button", { name: /Working context/ })
      await waitFor(() => expect(toggle.getAttribute("aria-expanded")).toBe("false"))
      expect(screen.queryByRole("button", { name: "Explain all LandIntel features" })).toBeNull()
      fireEvent.click(toggle)
      expect(screen.getByRole("button", { name: "Explain all LandIntel features" })).toBeTruthy()
    })
  })

  it("keeps the cockpit canvas free of the global float and opens from the cockpit event", async () => {
    render(<><main data-workspace-cockpit /><Concierge /></>)
    await waitFor(() => expect(screen.queryByRole("button", { name: "Open SUTRA" })).toBeNull())
    window.dispatchEvent(new CustomEvent("ferrum:open-sutra"))
    expect(await screen.findByRole("dialog", { name: "SUTRA AI assistant" })).toBeTruthy()
  })
})
