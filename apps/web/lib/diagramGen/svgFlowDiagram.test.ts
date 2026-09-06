import { describe, expect, it } from "vitest"
import { renderFlowDiagramSvg, type FlowNode } from "./svgFlowDiagram"

describe("renderFlowDiagramSvg (W-73, self-contained HTML+SVG, no charting library)", () => {
  const nodes: FlowNode[] = [
    { id: "a", title: "Plot", lines: ["100 m²"], status: "neutral" },
    { id: "b", title: "Coverage", lines: ["OK"], status: "pass" },
    { id: "c", title: "FAR", lines: ["Exceeded"], status: "fail" },
  ]

  it("renders one box per node and one arrow per gap between nodes", () => {
    const svg = renderFlowDiagramSvg(nodes)
    expect((svg.match(/<rect/g) ?? []).length).toBe(3)
    expect((svg.match(/<line/g) ?? []).length).toBe(2)
  })

  it("colors each box by its real pass/fail/neutral status, not a fixed palette", () => {
    const svg = renderFlowDiagramSvg(nodes)
    expect(svg).toContain('data-node-status="pass"')
    expect(svg).toContain('data-node-status="fail"')
    expect(svg).toContain('data-node-status="neutral"')
  })

  it("escapes text content so a label can never break the SVG markup", () => {
    const svg = renderFlowDiagramSvg([{ id: "x", title: "<script>", lines: ['"quoted" & more'], status: "neutral" }])
    expect(svg).not.toContain("<script>")
    expect(svg).toContain("&lt;script&gt;")
  })

  it("is valid, parseable SVG/XML", () => {
    const svg = renderFlowDiagramSvg(nodes)
    expect(() => new DOMParser().parseFromString(svg, "image/svg+xml").querySelector("parsererror")).not.toThrow()
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
    expect(doc.querySelector("parsererror")).toBeNull()
  })
})
