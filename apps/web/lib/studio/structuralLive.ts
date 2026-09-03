// S2 STRUCTURAL_LIVE (W2-382, part of the W2-380 STUDIO_ENGINE S1-S6
// mission block) — pure, dependency-free constraint checks for massing
// elements a user drags in DesignStudio: pass/fail against simplified
// IS 456/800 checks, same "textbook rule, not the full code" convention
// as lib/checks/isCode.ts. No D1/fetch/env access, matching lib/analysis/**
// and lib/parcelIntel/** — <100ms is trivially met by pure arithmetic.
//
// No live DesignStudio "draggable element" data model exists in the repo
// yet (the current test-fit tool only produces a coarse envelope —
// floor_area_sqm/plot_width_m/plot_depth_m/floors/setback_m, not
// per-member spans/loads) — this defines the minimal element shape the
// UI will need to send, matching the granularity isCode.ts already
// expects (b, d, fy, Ast for a beam; K, L, r for a column).

export type BeamElement = {
  id: string
  kind: 'beam'
  span_m: number
  depth_mm: number
  width_mm: number
  /** Uniformly distributed load, kN/m — used only for the deflection note context, not a full deflection calculation (see below). */
  udl_kn_per_m: number
  /** 'simple' (span/depth basic value 20) or 'continuous' (26), IS 456 Table 23.2.1. Cantilever (7) intentionally unsupported — this checker does not attempt cantilever tip-load deflection. */
  support: 'simple' | 'continuous'
}

export type ColumnElement = {
  id: string
  kind: 'column'
  axial_load_kn: number
  width_mm: number
  depth_mm: number
  /** Effective length factor K, IS 800 Cl 3.8 (e.g. 1.0 for pinned-pinned). */
  k_factor: number
  height_mm: number
}

export type MassingElement = BeamElement | ColumnElement

export type ElementCheckResult = {
  id: string
  kind: 'beam' | 'column'
  checks: Array<{ rule: string; pass: boolean; note: string }>
}

export type StructuralLiveResult = {
  indicative: true
  results: ElementCheckResult[]
}

// IS 456 Cl 23.2.1 basic span/effective-depth ratio (no modification
// factors for reinforcement percentage/flange width — a simplified,
// conservative check, same spirit as isCode.ts's rc-beam minimum-Ast
// check, which is also unmodified-factor).
const SPAN_DEPTH_BASIC_RATIO: Record<BeamElement['support'], number> = {
  simple: 20,
  continuous: 26,
}

// IS 800 Cl 3.8 — same limit isCode.ts's steel-column check already uses
// for members resisting loads other than wind/seismic.
const SLENDERNESS_LIMIT = 180

// IS 456 Cl 39.1, simplified working-stress axial check for a short
// column: allowable direct compressive stress on gross concrete area
// taken as 0.25*fck (a conservative constant, not the full
// Puz interaction-with-reinforcement design of Cl 39.3/39.4/Annex E) at
// the default fck = 20 N/mm² (M20) used elsewhere in this repo — no
// per-element fck input exists yet in the massing tool, so this cannot
// vary by grade until that field exists.
const ASSUMED_FCK_N_MM2 = 20
const ALLOWABLE_AXIAL_STRESS_N_MM2 = 0.25 * ASSUMED_FCK_N_MM2

function checkBeam(el: BeamElement): ElementCheckResult {
  const checks: ElementCheckResult['checks'] = []

  const spanMm = el.span_m * 1000
  const ratio = spanMm / el.depth_mm
  const limit = SPAN_DEPTH_BASIC_RATIO[el.support]
  const spanRatioPass = ratio <= limit
  checks.push({
    rule: 'IS 456 Cl 23.2.1 span/effective-depth ratio (deflection control, no modification factors)',
    pass: spanRatioPass,
    note: `span/depth = ${ratio.toFixed(1)} (limit ${limit} for a ${el.support} support). ${spanRatioPass ? 'Within limit — deflection control satisfied by this simplified check.' : 'Exceeds limit — increase depth or verify by explicit deflection calculation.'}`,
  })

  // IS 456 Cl 23.2's allowable-deflection note (span/250) is expressed
  // here via the same span/depth ratio result, not a separate explicit
  // deflection calculation — this checker has no material stiffness
  // (E) or load-case input beyond udl_kn_per_m to compute an actual
  // deflection value; udl_kn_per_m is carried for the note only.
  checks.push({
    rule: 'IS 456 Cl 23.2 allowable deflection (span/250)',
    pass: spanRatioPass,
    note: `Not independently calculated — no elastic modulus input exists in this element shape yet. Using the same span/depth pass/fail as the proxy IS 456 itself allows in lieu of explicit calculation (Cl 23.2.1). UDL ${el.udl_kn_per_m} kN/m recorded for future explicit-deflection support.`,
  })

  return { id: el.id, kind: 'beam', checks }
}

function checkColumn(el: ColumnElement): ElementCheckResult {
  const checks: ElementCheckResult['checks'] = []

  const r = Math.sqrt((el.width_mm * el.width_mm + el.depth_mm * el.depth_mm) / 12) // radius of gyration, rectangular section, weaker axis approximated via both dims
  const slenderness = (el.k_factor * el.height_mm) / r
  const slendernessPass = slenderness <= SLENDERNESS_LIMIT
  checks.push({
    rule: 'IS 800 Cl 3.8 slenderness ratio limit',
    pass: slendernessPass,
    note: `KL/r = ${slenderness.toFixed(1)} (limit ${SLENDERNESS_LIMIT}). ${slendernessPass ? 'Within limit.' : 'Exceeds limit — reduce height or increase section.'}`,
  })

  const area = el.width_mm * el.depth_mm
  const axialStress = (el.axial_load_kn * 1000) / area
  const axialPass = axialStress <= ALLOWABLE_AXIAL_STRESS_N_MM2
  checks.push({
    rule: `IS 456 Cl 39.1 axial stress limit (simplified, assumed fck=${ASSUMED_FCK_N_MM2} N/mm², no reinforcement interaction)`,
    pass: axialPass,
    note: `Axial stress = ${axialStress.toFixed(2)} N/mm² (allowable ${ALLOWABLE_AXIAL_STRESS_N_MM2} N/mm²). ${axialPass ? 'Within limit.' : 'Exceeds limit — increase section or verify by full Cl 39.3/39.4 design.'}`,
  })

  return { id: el.id, kind: 'column', checks }
}

export function checkStructuralLive(elements: MassingElement[]): StructuralLiveResult {
  return {
    indicative: true,
    results: elements.map((el) => (el.kind === 'beam' ? checkBeam(el) : checkColumn(el))),
  }
}
