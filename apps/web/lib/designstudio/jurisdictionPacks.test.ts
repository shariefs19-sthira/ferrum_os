import { describe, expect, it } from "vitest"
import { getJurisdictionPack, jurisdictionPacks } from "./jurisdictionPacks"

describe("international jurisdiction packs", () => {
  it("keeps a worldwide kernel separate from local rules", () => {
    expect(getJurisdictionPack("global-openbim")?.scope).toBe("Worldwide")
    expect(jurisdictionPacks.some((pack) => pack.id === "india")).toBe(true)
  })

  it("preserves unknown rules outside reviewed packs", () => {
    expect(getJurisdictionPack("other-jurisdiction")?.rule).toContain("UNKNOWN")
  })
})
