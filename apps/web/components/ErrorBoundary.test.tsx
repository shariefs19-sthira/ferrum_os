import { afterEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import ErrorBoundary from "./ErrorBoundary"

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom - simulated render crash")
  return <div>safe content</div>
}

describe("ErrorBoundary (white-screen insurance)", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders a friendly recovery panel instead of a blank page when a child throws", () => {
    // React logs the caught error to the console by default in test
    // environments too - suppress just this expected noise, not a real
    // silencing of unexpected errors elsewhere.
    vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText(/this page hit a snag/i)).toBeTruthy()
    expect(screen.getByRole("button", { name: /reload page/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /try again/i })).toBeTruthy()
    expect(screen.queryByText("safe content")).toBeNull()
  })

  it("renders children normally when nothing throws - the boundary is invisible on the happy path", () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText("safe content")).toBeTruthy()
    expect(screen.queryByText(/this page hit a snag/i)).toBeNull()
  })

  it("the report chip copies error details to the clipboard and confirms", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>,
    )

    fireEvent.click(screen.getByRole("button", { name: /report this/i }))
    await Promise.resolve()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toMatch(/boom - simulated render crash/)
  })
})
