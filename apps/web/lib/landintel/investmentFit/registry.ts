import type { FitRequirement, IntendedUse, RiskTolerance } from './types'

// VERSIONED PREFERENCE REGISTRY (data, not code). Add a preference by adding an entry; no component change.
// Same definition-object pattern as lib/workspace/controlRegistry.ts (W-48): id, label, type, min/max/step, options, help.
// New entries start as 'draft' and only become 'active' after review (see SPEC.md).
export const REGISTRY_VERSION = '2026.09.19-1'

export type PrefInput = 'select' | 'number' | 'boolean' | 'area' | 'length' | 'distance'
export type PrefStatus = 'draft' | 'active' | 'retired'
export type Consumer = 'suit' | 'budget' | 'return' | 'verdict'
export type PrefDef = {
  id: string; label: string; category: string; input: PrefInput
  options?: { value: string; label: string }[]
  min?: number; max?: number; step?: number
  unit?: string // base unit; area=m2, length=m, distance=km (dual units are always shown, RULE 30)
  addedOn: string; status: PrefStatus
  consumedBy: Consumer // which typed judgment reads it
  stateLabel: string // how it is written into the state text
  core?: boolean // read by the SAMPLE stub's arithmetic
  help: string
}
export type PrefValue = string | number | boolean
export type PrefValues = Record<string, PrefValue>

const YN = [{ value: 'must', label: 'Must have' }, { value: 'nice', label: 'Nice to have' }, { value: 'avoid', label: 'Avoid' }]
const D = '2026-09-19'
const P = (id: string, label: string, category: string, input: PrefInput, consumedBy: Consumer, extra: Partial<PrefDef> = {}): PrefDef => ({ id, label, category, input, consumedBy, addedOn: D, status: 'active', stateLabel: label, help: '', ...extra })

export const CATEGORIES = ['Use and money', 'Site', 'Access', 'Utilities', 'Risk', 'Legal and title', 'Neighbourhood', 'Market'] as const

export const PREF_REGISTRY: PrefDef[] = [
  // Use and money (core)
  P('use', 'Intended use', 'Use and money', 'select', 'suit', { core: true, options: [{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }, { value: 'agricultural', label: 'Agricultural' }, { value: 'industrial', label: 'Industrial' }, { value: 'mixed', label: 'Mixed use' }, { value: 'hold', label: 'Land hold (appreciation)' }], help: 'What you plan to do with the land.' }),
  P('budget-min', 'Budget minimum', 'Use and money', 'number', 'budget', { core: true, unit: 'INR crore', min: 0, max: 500, step: 0.1 }),
  P('budget-max', 'Budget maximum', 'Use and money', 'number', 'budget', { core: true, unit: 'INR crore', min: 0, max: 500, step: 0.1 }),
  P('target-return', 'Target return', 'Use and money', 'number', 'return', { core: true, unit: '% a year', min: 0, max: 40, step: 0.5 }),
  P('hold-years', 'Holding period', 'Use and money', 'number', 'return', { core: true, unit: 'years', min: 1, max: 30, step: 1 }),
  P('risk', 'Risk tolerance', 'Use and money', 'select', 'verdict', { core: true, options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] }),
  P('financing', 'Financing', 'Use and money', 'select', 'budget', { options: [{ value: 'own', label: 'Own funds' }, { value: 'loan', label: 'Bank loan' }, { value: 'partner', label: 'Partnership' }] }),
  P('exit', 'Exit plan', 'Use and money', 'select', 'return', { options: [{ value: 'sell', label: 'Sell as land' }, { value: 'build', label: 'Build and sell' }, { value: 'rent', label: 'Build and rent' }] }),
  // Site
  P('min-area', 'Minimum plot area', 'Site', 'area', 'suit', { core: true, unit: 'm2', min: 0, max: 400000, step: 10 }),
  P('max-area', 'Maximum plot area', 'Site', 'area', 'budget', { unit: 'm2', min: 0, max: 400000, step: 10 }),
  P('zone', 'Preferred zone', 'Site', 'select', 'suit', { core: true, options: [{ value: '', label: 'No preference' }, { value: 'R1', label: 'R1' }, { value: 'R2', label: 'R2' }, { value: 'C1', label: 'C1' }, { value: 'I1', label: 'I1' }] }),
  P('orientation', 'Plot facing', 'Site', 'select', 'suit', { options: [{ value: 'east', label: 'East' }, { value: 'north', label: 'North' }, { value: 'west', label: 'West' }, { value: 'south', label: 'South' }] }),
  P('shape', 'Regular plot shape', 'Site', 'select', 'suit', { options: YN }),
  P('frontage', 'Minimum road frontage', 'Site', 'length', 'suit', { unit: 'm', min: 0, max: 200, step: 1 }),
  P('slope', 'Maximum slope', 'Site', 'number', 'suit', { unit: '%', min: 0, max: 40, step: 1 }),
  P('soil', 'Soil bearing (foundation)', 'Site', 'select', 'suit', { options: [{ value: 'any', label: 'Any' }, { value: 'firm', label: 'Firm only' }] }),
  P('corner', 'Corner plot', 'Site', 'select', 'suit', { options: YN }),
  P('greenery', 'Existing trees or greenery', 'Site', 'select', 'suit', { options: YN }),
  P('fencing', 'Existing boundary fencing', 'Site', 'select', 'suit', { options: YN }),
  P('structure', 'Existing structure on plot', 'Site', 'select', 'suit', { options: YN }),
  P('elevation', 'Minimum elevation above road', 'Site', 'length', 'suit', { unit: 'm', min: 0, max: 20, step: 0.5 }),
  // Access
  P('road-width', 'Minimum approach road width', 'Access', 'length', 'suit', { unit: 'm', min: 0, max: 60, step: 0.5 }),
  P('metro', 'Maximum distance to metro', 'Access', 'distance', 'suit', { unit: 'km', min: 0, max: 50, step: 0.5 }),
  P('highway', 'Maximum distance to highway', 'Access', 'distance', 'suit', { unit: 'km', min: 0, max: 100, step: 1 }),
  P('bus', 'Maximum distance to bus stop', 'Access', 'distance', 'suit', { unit: 'km', min: 0, max: 20, step: 0.5 }),
  P('airport', 'Maximum distance to airport', 'Access', 'distance', 'suit', { unit: 'km', min: 0, max: 200, step: 5 }),
  P('rail', 'Maximum distance to railway station', 'Access', 'distance', 'suit', { unit: 'km', min: 0, max: 100, step: 1 }),
  P('all-weather', 'All-weather road', 'Access', 'select', 'suit', { options: YN }),
  // Utilities
  P('water', 'Piped water available', 'Utilities', 'select', 'suit', { options: YN }),
  P('borewell', 'Borewell feasible', 'Utilities', 'select', 'suit', { options: YN }),
  P('power', 'Grid power at boundary', 'Utilities', 'select', 'suit', { options: YN }),
  P('sewer', 'Sewer connection', 'Utilities', 'select', 'suit', { options: YN }),
  P('gas', 'Piped gas', 'Utilities', 'select', 'suit', { options: YN }),
  P('fibre', 'Fibre internet', 'Utilities', 'select', 'suit', { options: YN }),
  P('drainage', 'Storm drainage', 'Utilities', 'select', 'suit', { options: YN }),
  P('street-light', 'Street lighting', 'Utilities', 'select', 'suit', { options: YN }),
  // Risk
  P('flood', 'Maximum flood risk', 'Risk', 'select', 'verdict', { options: [{ value: 'low', label: 'Low only' }, { value: 'moderate', label: 'Up to moderate' }, { value: 'any', label: 'Any' }] }),
  P('seismic', 'Maximum seismic zone', 'Risk', 'number', 'verdict', { unit: 'zone', min: 2, max: 5, step: 1 }),
  P('landslide', 'Landslide risk', 'Risk', 'select', 'verdict', { options: YN }),
  P('coastal', 'Coastal regulation (CRZ) area', 'Risk', 'select', 'verdict', { options: YN }),
  P('waterlogging', 'History of waterlogging', 'Risk', 'select', 'verdict', { options: YN }),
  P('contamination', 'Prior industrial use or contamination', 'Risk', 'select', 'verdict', { options: YN }),
  P('lake-buffer', 'Near lake or drain buffer', 'Risk', 'select', 'verdict', { options: YN }),
  // Legal and title
  P('verified', 'Require a VERIFIED record', 'Legal and title', 'boolean', 'verdict', { core: true }),
  P('title', 'Clear title', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('encumbrance', 'Encumbrance-free', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('litigation', 'No pending litigation', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('approved-layout', 'Approved layout', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('conversion', 'Land-use conversion done', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('rera', 'RERA-registered project nearby', 'Legal and title', 'select', 'verdict', { options: YN }),
  P('tax-arrears', 'No property-tax arrears', 'Legal and title', 'select', 'verdict', { options: YN }),
  // Neighbourhood
  P('school', 'Maximum distance to school', 'Neighbourhood', 'distance', 'suit', { unit: 'km', min: 0, max: 20, step: 0.5 }),
  P('hospital', 'Maximum distance to hospital', 'Neighbourhood', 'distance', 'suit', { unit: 'km', min: 0, max: 30, step: 0.5 }),
  P('market', 'Maximum distance to market', 'Neighbourhood', 'distance', 'suit', { unit: 'km', min: 0, max: 20, step: 0.5 }),
  P('noise', 'Quiet surroundings', 'Neighbourhood', 'select', 'suit', { options: YN }),
  P('growth-corridor', 'Inside a growth corridor', 'Neighbourhood', 'select', 'return', { options: YN }),
  P('planned-infra', 'Planned infrastructure nearby', 'Neighbourhood', 'select', 'return', { options: YN }),
  P('gated', 'Inside a gated community', 'Neighbourhood', 'select', 'suit', { options: YN }),
  P('industry-near', 'Away from heavy industry', 'Neighbourhood', 'select', 'suit', { options: YN }),
  // Market
  P('rate-band', 'Rate within local band', 'Market', 'select', 'budget', { options: YN }),
  P('liquidity', 'Easy resale (liquidity)', 'Market', 'select', 'return', { options: YN }),
  P('appreciation', 'Historical appreciation', 'Market', 'number', 'return', { unit: '% a year', min: 0, max: 30, step: 0.5 }),
  P('rental-yield', 'Minimum rental yield', 'Market', 'number', 'return', { unit: '% a year', min: 0, max: 15, step: 0.5 }),
  P('supply', 'Low nearby supply', 'Market', 'select', 'return', { options: YN }),
  P('developer-activity', 'Active developers nearby', 'Market', 'select', 'return', { options: YN }),
  // Draft / retired entries show the governance states (not selectable by users)
  P('ai-noise-model', 'Night noise estimate', 'Neighbourhood', 'number', 'suit', { status: 'draft', unit: 'dB', addedOn: '2026-09-19' }),
  P('old-cess', 'Legacy cess band', 'Market', 'select', 'budget', { status: 'retired', options: YN }),
]

export const DEFAULT_CHOSEN = ['use', 'budget-max', 'target-return', 'hold-years', 'min-area']
export const DEFAULT_VALUES: PrefValues = { use: 'residential', 'budget-min': 0.5, 'budget-max': 2, 'target-return': 8, 'hold-years': 5, risk: 'medium', 'min-area': 200 }
export const activePrefs = (reg: PrefDef[] = PREF_REGISTRY) => reg.filter((p) => p.status === 'active')
export const prefById = (id: string, reg: PrefDef[] = PREF_REGISTRY) => reg.find((p) => p.id === id)

/** A "suggested values" set of N chosen preferences for previews and tests. */
export function sampleChosen(n: number): { chosen: string[]; values: PrefValues } {
  const ids = activePrefs().map((p) => p.id)
  const chosen = [...DEFAULT_CHOSEN, ...ids.filter((i) => !DEFAULT_CHOSEN.includes(i))].slice(0, n)
  const values: PrefValues = {}
  for (const id of chosen) {
    const d = prefById(id)!
    if (id in DEFAULT_VALUES) values[id] = DEFAULT_VALUES[id]
    else if (d.input === 'select') values[id] = d.options![Math.min(1, d.options!.length - 1)].value
    else if (d.input === 'boolean') values[id] = false
    else values[id] = d.min !== undefined && d.max !== undefined ? Math.round((d.min + d.max) / 4) : 1
  }
  return { chosen, values }
}

/** Adapter: registry values -> the arithmetic requirement the (stub or real) engine weighs. Unstated => null (UNKNOWN). */
export function toRequirement(v: PrefValues): FitRequirement {
  const n = (k: string) => (typeof v[k] === 'number' ? (v[k] as number) : null)
  return {
    intendedUse: (typeof v.use === 'string' && v.use ? (v.use as IntendedUse) : null),
    budgetMinCr: n('budget-min'), budgetMaxCr: n('budget-max'), targetReturnPct: n('target-return'), holdYears: n('hold-years'),
    risk: (typeof v.risk === 'string' && v.risk ? (v.risk as RiskTolerance) : null),
    minAreaSqm: n('min-area'), preferredZone: typeof v.zone === 'string' ? v.zone : '', requireVerifiedRecord: v.verified === true,
  }
}

export function formatPref(def: PrefDef, value: PrefValue): string {
  if (def.input === 'select') return def.options?.find((o) => o.value === value)?.label ?? String(value)
  if (def.input === 'boolean') return value ? 'Yes' : 'No'
  return `${value}${def.unit ? ` ${def.unit}` : ''}`
}

/** What the state text and the details view list: every stated preference, the judgment that reads it. */
export function usedPreferences(v: PrefValues, reg: PrefDef[] = PREF_REGISTRY): { id: string; label: string; value: string; consumedBy: string }[] {
  return Object.entries(v).filter(([, val]) => val !== '' && val !== undefined).flatMap(([id, val]) => { const d = prefById(id, reg); return d && d.status === 'active' ? [{ id, label: d.stateLabel, value: formatPref(d, val), consumedBy: d.consumedBy }] : [] })
}
