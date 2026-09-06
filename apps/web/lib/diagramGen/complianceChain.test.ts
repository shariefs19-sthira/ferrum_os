import { describe, expect, it } from "vitest"
import { buildComplianceChainNodes } from "./complianceChain"

describe("buildComplianceChainNodes (real project data, not placeholders)", () => {
  it("marks every check PASS when the real values are within their real limits", () => {
    const nodes = buildComplianceChainNodes({
      plotAreaSqm: 600,
      buildingFootprintSqm: 300,
      maxCoverageAreaSqm: 360,
      maxCoveragePercent: 60,
      grossFloorAreaSqm: 900,
      maxFarAreaSqm: 900,
      farLimit: 1.5,
      structuralPass: true,
      floors: 3,
    })
    expect(nodes.find((n) => n.id === "coverage")!.status).toBe("pass")
    expect(nodes.find((n) => n.id === "far")!.status).toBe("pass")
    expect(nodes.find((n) => n.id === "structural")!.status).toBe("pass")
    expect(nodes.find((n) => n.id === "overall")!.status).toBe("pass")
  })

  it("marks the specific failing check(s) FAIL, and overall FAIL, when a real value exceeds its real limit", () => {
    const nodes = buildComplianceChainNodes({
      plotAreaSqm: 600,
      buildingFootprintSqm: 400, // exceeds maxCoverageAreaSqm
      maxCoverageAreaSqm: 360,
      maxCoveragePercent: 60,
      grossFloorAreaSqm: 900,
      maxFarAreaSqm: 900,
      farLimit: 1.5,
      structuralPass: true,
      floors: 3,
    })
    expect(nodes.find((n) => n.id === "coverage")!.status).toBe("fail")
    expect(nodes.find((n) => n.id === "far")!.status).toBe("pass")
    expect(nodes.find((n) => n.id === "overall")!.status).toBe("fail")
  })

  it("the overall node is honestly labeled INDICATIVE/sample-ruleset, never presented as a real jurisdiction filing result", () => {
    const nodes = buildComplianceChainNodes({
      plotAreaSqm: 100,
      buildingFootprintSqm: 50,
      maxCoverageAreaSqm: 60,
      maxCoveragePercent: 60,
      grossFloorAreaSqm: 150,
      maxFarAreaSqm: 150,
      farLimit: 1.5,
      structuralPass: true,
      floors: 3,
    })
    const overall = nodes.find((n) => n.id === "overall")!
    expect(overall.lines.join(" ")).toMatch(/INDICATIVE/)
  })
})
