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
    fireEvent.click(screen.getByRole("button", { name: "Open Ferrum OS concierge" }))

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
    fireEvent.click(screen.getByRole("button", { name: "Open Ferrum OS concierge" }))

    const input = screen.getByRole("textbox", { name: "Message" })
    fireEvent.change(input, { target: { value: "zzzz gibberish nonsense 999" } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))

    expect(await screen.findByText(/I couldn't find that/)).toBeTruthy()
    expect(screen.queryByText(/Sources?:/)).toBeNull()
  })

  it("captures an optional correction on not-useful feedback", async () => {
    render(<Concierge />)
    fireEvent.click(screen.getByRole("button", { name: "Open Ferrum OS concierge" }))

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
})
