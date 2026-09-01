// Minimal ASCII DXF (R12) writer — client-side geometry export per
// docs/AGENT_INTERFACE.md §3 (plan-gen) and docs/LAUNCH_ARCHITECTURE.md
// ("R2 deferred, exports stay client-side"). No CAD library dependency:
// DXF R12's ENTITIES section is plain text, and a plot boundary +
// buildable-area rectangle pair (mirroring GeometryExporter's SVG
// output) needs nothing beyond LINE entities.

export type DxfRect = {
  /** Layer name, e.g. "PLOT" or "BUILDABLE". */
  layer: string
  x: number
  y: number
  width: number
  height: number
}

export type DxfExportInput = {
  rects: DxfRect[]
}

function line(layer: string, x1: number, y1: number, x2: number, y2: number): string {
  return [
    '0', 'LINE',
    '8', layer,
    '10', String(x1),
    '20', String(y1),
    '30', '0',
    '11', String(x2),
    '21', String(y2),
    '31', '0',
  ].join('\n')
}

function rectLines(rect: DxfRect): string {
  const { layer, x, y, width, height } = rect
  return [
    line(layer, x, y, x + width, y),
    line(layer, x + width, y, x + width, y + height),
    line(layer, x + width, y + height, x, y + height),
    line(layer, x, y + height, x, y),
  ].join('\n')
}

/**
 * Produces a valid, minimal ASCII DXF R12 document: HEADER (version
 * only), ENTITIES (one LINE per rectangle edge), EOF. Openable in any
 * DXF-reading CAD tool without a HEADER/TABLES section — R12 makes
 * both optional as long as ENTITIES uses only entity types that don't
 * reference a table (LINE qualifies).
 */
export function writeDxf(input: DxfExportInput): string {
  const entities = input.rects.map(rectLines).join('\n')
  return [
    '0', 'SECTION',
    '2', 'HEADER',
    '9', '$ACADVER',
    '1', 'AC1009',
    '0', 'ENDSEC',
    '0', 'SECTION',
    '2', 'ENTITIES',
    entities,
    '0', 'ENDSEC',
    '0', 'EOF',
  ].join('\n')
}

/** Builds the two-rectangle plot/buildable geometry GeometryExporter.testfit uses. */
export function testfitToDxfInput(params: {
  plot_width_m: number
  plot_depth_m: number
  setback_m?: number
}): DxfExportInput {
  const setback = params.setback_m ?? 0
  return {
    rects: [
      { layer: 'PLOT', x: 0, y: 0, width: params.plot_width_m, height: params.plot_depth_m },
      {
        layer: 'BUILDABLE',
        x: setback,
        y: setback,
        width: Math.max(params.plot_width_m - 2 * setback, 0),
        height: Math.max(params.plot_depth_m - 2 * setback, 0),
      },
    ],
  }
}
