import { describe, expect, it } from "vitest"
import { regionPolicyRule, resolveUserRegion } from "./regionPolicy"

describe("region availability policy", () => {
  it("enables the reviewed India pack without claiming approvals", () => {
    const profile = resolveUserRegion("IN")
    expect(profile.readiness).toBe("AVAILABLE")
    expect(profile.enabledExperience).toContain("BEE Eco Niwas Samhita checks")
    expect(profile.heldExperience).toContain("Local code-compliance conclusion")
  })

  it("keeps the global project kernel available when location is unknown", () => {
    const profile = resolveUserRegion(null)
    expect(profile.readiness).toBe("GLOBAL-CORE")
    expect(profile.enabledExperience).toContain("DesignStudio modelling and visualization")
  })

  it("separates user discovery from project jurisdiction", () => {
    expect(regionPolicyRule).toContain("project location governs")
  })
})

