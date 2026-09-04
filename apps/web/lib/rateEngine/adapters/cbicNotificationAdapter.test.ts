import { describe, expect, it } from "vitest"
import { cbicCementNotificationAdapter } from "./cbicNotificationAdapter"
import { runAdapters } from "./types"

describe("cbicCementNotificationAdapter (W-46 first adapter test)", () => {
  it("reports a real source with real provenance, not a fabricated item", async () => {
    const result = await cbicCementNotificationAdapter.fetch()
    expect(result.status).toBe("ROADMAP")
    expect(result.items).toHaveLength(0)
    expect(result.provenance.sourceUrl).toMatch(/^https:\/\/courier\.cbic\.gov\.in\//)
    expect(result.provenance.fetchedAt).not.toBeNull()
    expect(result.provenance.note).toMatch(/could not be extracted/i)
  })

  it("never claims VERIFIED-PUBLIC without an item actually extracted from the source", async () => {
    const result = await cbicCementNotificationAdapter.fetch()
    if (result.status === "VERIFIED-PUBLIC") {
      expect(result.items.length).toBeGreaterThan(0)
    }
  })
})

describe("runAdapters (W-46 provenance pipeline)", () => {
  it("counts a zero-item ROADMAP adapter in the report rather than hiding it", async () => {
    const { results, totalItems } = await runAdapters([cbicCementNotificationAdapter])
    expect(results).toHaveLength(1)
    expect(results[0].result.status).toBe("ROADMAP")
    expect(totalItems).toBe(0)
  })
})
