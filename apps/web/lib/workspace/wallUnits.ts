import { METRES_TO_FEET, metresAndFeet } from '../units'

// RULE 30: every wall length is shown in metres AND feet together, using the
// exact 0.3048 m/ft relation already in lib/units.ts (METRES_TO_FEET = 1/0.3048).
// Feet are display/input only; wall geometry stays in metres.

/** Exact feet -> metres (inverse of METRES_TO_FEET, no rounded constant). */
export const feetToMetres = (feet: number) => feet / METRES_TO_FEET

export const metresToFeet = (metres: number) => metresAndFeet(metres).feet

/** e.g. "9.92 m · 32.55 ft": both units, fixed precision, for one-line labels. */
export function formatDualLength(metres: number, digits = 2): string {
  const units = metresAndFeet(metres)
  return `${units.metres.toFixed(digits)} m · ${units.feet.toFixed(digits)} ft`
}

/** Spoken form for aria-labels: "9.92 metres and 32.55 feet". */
export function spokenDualLength(metres: number, digits = 2): string {
  const units = metresAndFeet(metres)
  return `${units.metres.toFixed(digits)} metres and ${units.feet.toFixed(digits)} feet`
}

/** Wall thickness: millimetres (how it is specified) plus feet to 3 decimals. */
export function formatThickness(thicknessM: number): { mm: string; ft: string } {
  return { mm: `${(thicknessM * 1000).toFixed(0)} mm`, ft: `${metresToFeet(thicknessM).toFixed(3)} ft` }
}
