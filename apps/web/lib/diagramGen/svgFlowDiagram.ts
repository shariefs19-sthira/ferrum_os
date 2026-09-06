// W-73 INTEGRATE_DIAGRAMGEN - self-contained HTML+SVG diagram
// generation, no charting library (per docs/TECH_SCOUT.md #6/#7:
// concept adapted - own implementation, no code from either scouted
// repo). A minimal directed-flow renderer: boxes in a row, connected
// by arrows, each box carrying a label and a pass/fail/neutral status
// color - exactly enough to render a real compliance/massing chain,
// not a general diagramming library.
export type FlowNodeStatus = "pass" | "fail" | "neutral"

export type FlowNode = {
  id: string
  title: string
  lines: string[]
  status: FlowNodeStatus
}

const STATUS_COLORS: Record<FlowNodeStatus, { fill: string; stroke: string; text: string }> = {
  pass: { fill: "#ecfdf5", stroke: "#059669", text: "#065f46" },
  fail: { fill: "#fef2f2", stroke: "#dc2626", text: "#7f1d1d" },
  neutral: { fill: "#f8fafc", stroke: "#64748b", text: "#0f172a" },
}

const BOX_WIDTH = 200
const BOX_HEIGHT = 110
const GAP = 60
const PADDING = 30

export function renderFlowDiagramSvg(nodes: FlowNode[]): string {
  const width = PADDING * 2 + nodes.length * BOX_WIDTH + (nodes.length - 1) * GAP
  const height = PADDING * 2 + BOX_HEIGHT

  const boxes = nodes
    .map((node, index) => {
      const x = PADDING + index * (BOX_WIDTH + GAP)
      const y = PADDING
      const colors = STATUS_COLORS[node.status]
      const textLines = [node.title, ...node.lines]
      const textSvg = textLines
        .map(
          (line, lineIndex) =>
            `<text x="${x + BOX_WIDTH / 2}" y="${y + 28 + lineIndex * 20}" text-anchor="middle" font-size="${lineIndex === 0 ? 14 : 12}" font-weight="${lineIndex === 0 ? "700" : "400"}" fill="${colors.text}">${escapeXml(line)}</text>`,
        )
        .join("")
      return `<g data-node-id="${node.id}" data-node-status="${node.status}">
        <rect x="${x}" y="${y}" width="${BOX_WIDTH}" height="${BOX_HEIGHT}" rx="10" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2" />
        ${textSvg}
      </g>`
    })
    .join("\n")

  const arrows = nodes
    .slice(0, -1)
    .map((_, index) => {
      const x1 = PADDING + index * (BOX_WIDTH + GAP) + BOX_WIDTH
      const x2 = x1 + GAP
      const y = PADDING + BOX_HEIGHT / 2
      return `<line x1="${x1}" y1="${y}" x2="${x2 - 8}" y2="${y}" stroke="#475569" stroke-width="2" marker-end="url(#arrowhead)" />`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="auto" role="img" aria-label="Compliance chain diagram">
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#475569" />
      </marker>
    </defs>
    ${arrows}
    ${boxes}
  </svg>`
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
