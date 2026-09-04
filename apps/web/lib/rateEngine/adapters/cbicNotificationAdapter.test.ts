import { describe, expect, it } from "vitest"
import { cbicCementNotificationAdapter } from "./cbicNotificationAdapter"
import { runAdapters } from "./types"

// These tests make a real network call to the live CBIC PDF and run
// real text extraction (pdf-parse) - deliberately, per this fleet's
// RULE 25 live-proof standard: a mocked PDF would prove the parsing
// logic works on fabricated text, not that this adapter can read the
// actual government document. If the source ever goes offline or the
// notification's HSN-code mentions change wording, these tests will
// fail honestly rather than pass on stale fixtures.
describe("cbicCementNotificationAdapter (W-46, real extraction)", () => {
  it("extracts real HSN/rate facts from the live notification PDF, with real provenance", async () => {
    const result = await cbicCementNotificationAdapter.fetch()
    expect(result.provenance.sourceUrl).toMatch(/^https:\/\/courier\.cbic\.gov\.in\//)
    expect(result.provenance.fetchedAt).not.toBeNull()
    expect(result.status).toBe("VERIFIED-PUBLIC")
    expect(result.items.length).toBeGreaterThan(0)

    const cement = result.items.find((item) => item.itemCode === "2523")
    expect(cement).toBeDefined()
    expect(cement?.gst?.ratePercent).toBe(18)
    expect(cement?.gst?.provenance.status).toBe("VERIFIED-PUBLIC")
  }, 30000)

  it("never claims VERIFIED-PUBLIC without at least one item actually extracted", async () => {
    const result = await cbicCementNotificationAdapter.fetch()
    if (result.status === "VERIFIED-PUBLIC") {
      expect(result.items.length).toBeGreaterThan(0)
    }
  }, 30000)
})

describe("runAdapters (W-46 provenance pipeline)", () => {
  it("reports real extracted items through the pipeline, not a hidden/optimistic count", async () => {
    const { results, totalItems } = await runAdapters([cbicCementNotificationAdapter])
    expect(results).toHaveLength(1)
    expect(totalItems).toBe(results[0].result.items.length)
    expect(totalItems).toBeGreaterThan(0)
  }, 30000)
})
