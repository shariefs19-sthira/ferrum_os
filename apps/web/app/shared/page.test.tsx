import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

// Battery-fail (3): a Share link, followed in a fresh session (no auth
// state at all), must open the shared content. Mocks next/navigation's
// useSearchParams (the only thing this page reads besides fetch) to
// simulate arriving via ?token=... exactly as SavedArtifactsPanel's
// share() constructs the link, then mocks fetch as a fresh,
// cookie-free response from the real public API route.
const searchParamsValue = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParamsValue,
}))

describe("/shared page (battery-fail 3)", () => {
  beforeEach(() => {
    searchParamsValue.forEach((_, key) => searchParamsValue.delete(key))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("opens the shared content for a valid token in a fresh (unauthenticated) session", async () => {
    searchParamsValue.set("token", "real-token-abc")
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        expect(url).toBe("/api/workspace/shared/real-token-abc")
        return new Response(
          JSON.stringify({ type: "note", title: "Shared thing", data: { probe: true }, created_at: "2026-09-04T00:00:00Z" }),
          { status: 200 },
        )
      }),
    )

    const { default: SharedArtifactPage } = await import("./page")
    render(<SharedArtifactPage />)

    await waitFor(() => expect(screen.getByText("Shared thing")).toBeTruthy())
    expect(screen.getByText(/probe/)).toBeTruthy()
  })

  it("shows an explicit not-found state for an unknown token, not a crash or blank page", async () => {
    searchParamsValue.set("token", "does-not-exist")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "not_found" }), { status: 404 })),
    )

    const { default: SharedArtifactPage } = await import("./page")
    render(<SharedArtifactPage />)

    await waitFor(() => expect(screen.getByText(/invalid or has expired/i)).toBeTruthy())
  })
})
