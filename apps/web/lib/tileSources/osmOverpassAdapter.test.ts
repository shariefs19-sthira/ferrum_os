import { afterEach, describe, expect, it, vi } from "vitest"
import { createOsmOverpassAdapter } from "./osmOverpassAdapter"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("OSM/Overpass footprint adapter (self-host v1)", () => {
  it("refuses to fetch with no endpoint configured, rather than silently using the public one", async () => {
    const adapter = createOsmOverpassAdapter({})
    expect(adapter.provenance.status).toBe("SELF_HOST_ONLY")
    const result = await adapter.fetchFootprints([12.97, 77.59, 12.98, 77.6])
    expect(result).toBeNull()
  })

  it("carries the real ODbL attribution requirement regardless of endpoint", () => {
    const adapter = createOsmOverpassAdapter({})
    expect(adapter.provenance.attributionText).toBe("© OpenStreetMap contributors")
  })

  it("parses building footprint geometry without depending on a live public service", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [{ geometry: [
          { lat: 12.9752, lon: 77.605 },
          { lat: 12.9752, lon: 77.606 },
          { lat: 12.9762, lon: 77.606 },
          { lat: 12.9752, lon: 77.605 },
        ] }],
      }),
    }))

    const adapter = createOsmOverpassAdapter({ allowPublicEndpointForTesting: true })
    const result = await adapter.fetchFootprints([12.9752, 77.605, 12.977, 77.607])

    expect(result?.type).toBe("FeatureCollection")
    expect(result?.features).toHaveLength(1)
    expect(result?.features[0].geometry.type).toBe("Polygon")
  })

  // Real, live network call to the public Overpass endpoint - allowed
  // ONLY via the explicit testing opt-in, for a tiny bbox, matching the
  // public policy's "casual, small" allowance. This is not the
  // production path (that requires a self-hosted endpoint) - it proves
  // the fetch/parse contract actually works against the real API.
  it.runIf(process.env.RUN_LIVE_OVERPASS_TEST === "1")("fetches real building footprint geometry when explicitly opted into the public test endpoint (live)", async () => {
    const adapter = createOsmOverpassAdapter({ allowPublicEndpointForTesting: true })
    const result = await adapter.fetchFootprints([12.9752, 77.605, 12.977, 77.607]) // small MG Road, Bengaluru bbox
    expect(result).not.toBeNull()
    expect(result!.type).toBe("FeatureCollection")
    expect(result!.features.length).toBeGreaterThan(0)
    const first = result!.features[0]
    expect(first.geometry.type).toBe("Polygon")
    expect(Array.isArray(first.geometry.coordinates)).toBe(true)
  }, 30000)
})
