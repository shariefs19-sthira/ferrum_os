import type { FlowNode } from "./svgFlowDiagram"

// W-73's first real use: an "explain this building" massing/compliance
// chain diagram built from actual project values (plot area, coverage,
// FAR, structural check) - never placeholder numbers. Every input here
// is a value WorkspaceCockpit already computes live (coverageArea/
// farArea from the real land-use ruleset, structuralPass from the
// existing IS 456 span/depth check) - this module only formats them
// into a diagram, it does not invent or approximate any of them.
export type ComplianceChainInput = {
  plotAreaSqm: number
  buildingFootprintSqm: number
  maxCoverageAreaSqm: number
  maxCoveragePercent: number
  grossFloorAreaSqm: number
  maxFarAreaSqm: number
  farLimit: number
  structuralPass: boolean
  floors: number
}

export function buildComplianceChainNodes(input: ComplianceChainInput): FlowNode[] {
  const coveragePass = input.buildingFootprintSqm <= input.maxCoverageAreaSqm
  const farPass = input.grossFloorAreaSqm <= input.maxFarAreaSqm

  const plotNode: FlowNode = {
    id: "plot",
    title: "Plot",
    lines: [`${input.plotAreaSqm.toFixed(1)} m²`, `${input.floors} floor(s) proposed`],
    status: "neutral",
  }

  const coverageNode: FlowNode = {
    id: "coverage",
    title: "Ground coverage",
    lines: [
      `${input.buildingFootprintSqm.toFixed(1)} / ${input.maxCoverageAreaSqm.toFixed(1)} m²`,
      `limit ${input.maxCoveragePercent}% of plot`,
    ],
    status: coveragePass ? "pass" : "fail",
  }

  const farNode: FlowNode = {
    id: "far",
    title: "Floor Area Ratio",
    lines: [`${input.grossFloorAreaSqm.toFixed(1)} / ${input.maxFarAreaSqm.toFixed(1)} m²`, `limit FAR ${input.farLimit}`],
    status: farPass ? "pass" : "fail",
  }

  const structuralNode: FlowNode = {
    id: "structural",
    title: "Structural check",
    lines: ["IS 456 Cl 23.2.1", input.structuralPass ? "span/depth OK" : "review required"],
    status: input.structuralPass ? "pass" : "fail",
  }

  const overallPass = coveragePass && farPass && input.structuralPass
  const overallNode: FlowNode = {
    id: "overall",
    title: overallPass ? "Compliant (sample rules)" : "Needs review",
    lines: ["INDICATIVE - sample ruleset, not a jurisdiction filing"],
    status: overallPass ? "pass" : "fail",
  }

  return [plotNode, coverageNode, farNode, structuralNode, overallNode]
}
