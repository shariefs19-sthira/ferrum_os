import { describe, expect, it } from "vitest"
import { createGooglePhotorealistic3DTilesAdapter } from "./googlePhotorealistic3DTilesAdapter"

describe("Google Photorealistic 3D Tiles provider adapter boundary", () => {
  it("is gated unavailable with no configuration at all", async () => {
    const adapter = createGooglePhotorealistic3DTilesAdapter({})
    expect(adapter.provenance.status).toBe("GATED_UNAVAILABLE")
    expect(adapter.provenance.attributionText).toBeNull()
    expect(await adapter.requestTileset(["12.9", "77.5", "13.0", "77.6"] as unknown as [number, number, number, number])).toBeNull()
  })

  it("names every specific missing gate, not a generic message", () => {
    const adapter = createGooglePhotorealistic3DTilesAdapter({})
    expect(adapter.provenance.note).toMatch(/API key not configured/)
    expect(adapter.provenance.note).toMatch(/terms-of-service acceptance not recorded/)
    expect(adapter.provenance.note).toMatch(/quota\/cost handling not confirmed/)
    expect(adapter.provenance.note).toMatch(/attribution rendering not confirmed/)
  })

  it("stays gated when only some gates are satisfied (partial configuration)", async () => {
    const adapter = createGooglePhotorealistic3DTilesAdapter({ apiKey: "test-key", termsAcceptedAt: "2026-09-18" })
    expect(adapter.provenance.status).toBe("GATED_UNAVAILABLE")
    expect(adapter.provenance.note).toMatch(/quota\/cost handling not confirmed/)
    expect(adapter.provenance.note).toMatch(/attribution rendering not confirmed/)
    expect(adapter.provenance.note).not.toMatch(/API key not configured/)
    expect(await adapter.requestTileset([0, 0, 1, 1])).toBeNull()
  })

  it("reports AVAILABLE only once every gate is satisfied, but still never fabricates a live tileset", async () => {
    const adapter = createGooglePhotorealistic3DTilesAdapter({
      apiKey: "test-key",
      termsAcceptedAt: "2026-09-18",
      quotaConfirmed: true,
      attributionConfirmed: true,
    })
    expect(adapter.provenance.status).toBe("AVAILABLE")
    expect(adapter.provenance.attributionText).toBe("© Google")
    // The end-to-end fetch path is a separate, explicitly-scoped follow-up -
    // configuration alone must never produce a fabricated tileset.
    expect(await adapter.requestTileset([0, 0, 1, 1])).toBeNull()
  })

  it("carries the real Google 3D Tiles terms URL regardless of gate status", () => {
    const gated = createGooglePhotorealistic3DTilesAdapter({})
    const available = createGooglePhotorealistic3DTilesAdapter({ apiKey: "k", termsAcceptedAt: "2026-09-18", quotaConfirmed: true, attributionConfirmed: true })
    expect(gated.provenance.termsUrl).toBe("https://developers.google.com/maps/documentation/tile/3d-tiles-overview")
    expect(available.provenance.termsUrl).toBe(gated.provenance.termsUrl)
  })
})
