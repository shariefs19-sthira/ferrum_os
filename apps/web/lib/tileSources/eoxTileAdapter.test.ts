import { describe, expect, it } from "vitest"
import { createEoxTileAdapter } from "./eoxTileAdapter"

describe("EOX tile adapter (flagged, not live)", () => {
  it("never returns live data - no license held yet", async () => {
    const adapter = createEoxTileAdapter()
    const result = await adapter.fetchFootprints([0, 0, 1, 1])
    expect(result).toBeNull()
  })

  it("carries the real required status and attribution string", () => {
    const adapter = createEoxTileAdapter()
    expect(adapter.provenance.status).toBe("REQUIRES_PAID_LICENSE")
    expect(adapter.provenance.attributionText).toMatch(/s2maps\.eu by EOX IT Services GmbH/)
  })
})
