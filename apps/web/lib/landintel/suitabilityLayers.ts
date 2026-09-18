export type SuitabilityLayer = {
  id: string
  title: string
  summary: string
  decisionRole: string
  evidenceNeeded: string
  keywords: string[]
}

export const suitabilityDecisionStates = [
  'Hard exclusion',
  'Weighted preference',
  'Data conflict',
  'UNKNOWN',
  'Suitable development zone',
] as const

export const landIntelSuitabilityLayers: SuitabilityLayer[] = [
  {
    id: 'parcel-statutory-boundaries',
    title: 'Parcel & statutory boundaries',
    summary: 'Establish the parcel extent, survey identity, easements, reservations, and statutory overlays before any ranking begins.',
    decisionRole: 'Hard exclusion foundation',
    evidenceNeeded: 'Authority parcel geometry, survey record, statutory boundary layers',
    keywords: ['parcel boundary', 'statutory boundary', 'survey', 'easement', 'reservation'],
  },
  {
    id: 'setbacks-zoning',
    title: 'Setbacks & zoning',
    summary: 'Test permitted use, setbacks, floor-area controls, coverage, height, and other current planning constraints.',
    decisionRole: 'Hard exclusion',
    evidenceNeeded: 'Current authority zoning map and clause-cited development controls',
    keywords: ['setback', 'zoning', 'permitted use', 'far', 'coverage', 'height'],
  },
  {
    id: 'topography-slope',
    title: 'Topography & slope',
    summary: 'Compare terrain, gradients, level changes, and earthwork implications without treating a basemap as a survey.',
    decisionRole: 'Exclusion + weighted preference',
    evidenceNeeded: 'Surveyed contours or qualified terrain model with vertical datum',
    keywords: ['topography', 'slope', 'terrain', 'contour', 'earthwork'],
  },
  {
    id: 'drainage-flood',
    title: 'Drainage & flood exposure',
    summary: 'Identify drainage paths, water bodies, flood susceptibility, and buffer requirements that can constrain development.',
    decisionRole: 'Hard exclusion + conflict check',
    evidenceNeeded: 'Authority drainage, hydrology, flood and buffer datasets',
    keywords: ['drainage', 'flood', 'water body', 'hydrology', 'buffer'],
  },
  {
    id: 'soil-geotechnical',
    title: 'Soil & geotechnical conditions',
    summary: 'Expose ground-condition evidence that affects foundation feasibility, treatment, risk, and comparative development cost.',
    decisionRole: 'Weighted preference + risk',
    evidenceNeeded: 'Geotechnical investigation, bore logs, groundwater and laboratory results',
    keywords: ['soil', 'geotechnical', 'bearing capacity', 'groundwater', 'foundation'],
  },
  {
    id: 'ecology-protected-areas',
    title: 'Ecology & protected areas',
    summary: 'Screen protected areas, sensitive habitats, vegetation, buffers, and environmental constraints with dated sources.',
    decisionRole: 'Hard exclusion + weighted preference',
    evidenceNeeded: 'Notified protected-area, ecology, vegetation and environmental layers',
    keywords: ['ecology', 'protected area', 'habitat', 'vegetation', 'environment'],
  },
  {
    id: 'utilities-access',
    title: 'Utilities & access',
    summary: 'Assess lawful access and the proximity, capacity, and crossing constraints of essential infrastructure services.',
    decisionRole: 'Weighted preference + conflict check',
    evidenceNeeded: 'Verified road access, right-of-way and utility network records',
    keywords: ['utilities', 'access', 'road', 'right of way', 'infrastructure'],
  },
  {
    id: 'cost-constructability',
    title: 'Development cost & constructability',
    summary: 'Compare enabling works, access, terrain, ground risk, servicing, and other cost drivers after physical constraints are known.',
    decisionRole: 'Weighted preference',
    evidenceNeeded: 'Constraint-linked quantities, verified rates, logistics and construction assumptions',
    keywords: ['development cost', 'constructability', 'enabling works', 'logistics', 'site cost'],
  },
]
