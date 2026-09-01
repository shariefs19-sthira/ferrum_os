// GeometryExporter — seam per docs/LAUNCH_ARCHITECTURE.md and
// docs/AGENT_INTERFACE.md §2/§3 (testfit, plan-gen). SVG massing is
// server-computed (pure function, no D1). DXF export stays
// client-side per LAUNCH_ARCHITECTURE.md ("R2 deferred, exports stay
// client-side") — the client-side exporter itself is W2-278; this
// seam only produces the massing geometry a client can later turn
// into a DXF, and issues the short-lived reference id plan-gen scopes
// its signed URL to (AGENT_INTERFACE.md §5).

export type TestFitInput = {
  plot_width_m: number
  plot_depth_m: number
  floors: number
  setback_m?: number
}

export type TestFitResult = {
  testfit_id: string
  svg: string
  floor_area_sqm: number
  coverage_pct: number
}

export interface GeometryExporter {
  testfit(input: TestFitInput): TestFitResult
}

export class SvgGeometryExporter implements GeometryExporter {
  testfit(input: TestFitInput): TestFitResult {
    const setback = input.setback_m ?? 0
    const buildableWidth = Math.max(input.plot_width_m - 2 * setback, 0)
    const buildableDepth = Math.max(input.plot_depth_m - 2 * setback, 0)
    const floorArea = buildableWidth * buildableDepth
    const plotArea = input.plot_width_m * input.plot_depth_m
    const coveragePct = plotArea > 0 ? Math.round((floorArea / plotArea) * 1000) / 10 : 0

    const scale = 10
    const svgW = input.plot_width_m * scale
    const svgH = input.plot_depth_m * scale
    const bx = setback * scale
    const by = setback * scale
    const bw = buildableWidth * scale
    const bh = buildableDepth * scale

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">` +
      `<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="none" stroke="#070707" stroke-width="1"/>` +
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#F5F5F5" stroke="#070707" stroke-width="1"/>` +
      `</svg>`

    return {
      testfit_id: crypto.randomUUID(),
      svg,
      floor_area_sqm: Math.round(floorArea * input.floors * 100) / 100,
      coverage_pct: coveragePct,
    }
  }
}
