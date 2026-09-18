import type { CockpitProduct } from '../components/workspace/ProductCockpitPreview'

// CODEX-SENTINEL-20260918-1700-cockpit-journey-context. Five permanently
// visible explanatory rows for the homepage's project-journey panel --
// replaces the old four-stage (Land/Design/Build/Invest) pill indicator
// with a finer partition so "Build" (which used to lump BOQ Pro, ProMarket,
// BuildOS, and ProcureHub together) splits into the scope/cost decision and
// the delivery-coordination decision, matching how those products actually
// differ in what they help with. Every product maps to exactly one row --
// this is the ONLY category grouping on the homepage; it does not add a
// second navigation system, it re-labels the hero's existing stage concept.
export type JourneyRowId =
  | 'understand-site'
  | 'develop-scheme'
  | 'define-scope-cost'
  | 'coordinate-delivery'
  | 'evaluate-commercial'

export type JourneyRow = {
  id: JourneyRowId
  title: string
  body: string
}

export const journeyRows: JourneyRow[] = [
  {
    id: 'understand-site',
    title: 'Understand the site',
    body: 'Check feasibility, zoning, and site risk signals before you commit.',
  },
  {
    id: 'develop-scheme',
    title: 'Develop the scheme',
    body: 'Generate a design and check it against structural and code guidance.',
  },
  {
    id: 'define-scope-cost',
    title: 'Define scope and cost',
    body: 'Turn the scheme into a measured bill of quantities and compare rates.',
  },
  {
    id: 'coordinate-delivery',
    title: 'Coordinate delivery',
    body: 'Track procurement, scheduling, and build execution for the same project.',
  },
  {
    id: 'evaluate-commercial',
    title: 'Evaluate the commercial path',
    body: 'Review indicative return, funding, and ownership models for the same project.',
  },
]

export const journeyRowForProduct: Record<CockpitProduct, JourneyRowId> = {
  landintel: 'understand-site',
  designstudio: 'develop-scheme',
  structura: 'develop-scheme',
  'boq-pro': 'define-scope-cost',
  promarket: 'define-scope-cost',
  buildos: 'coordinate-delivery',
  procurehub: 'coordinate-delivery',
  investflow: 'evaluate-commercial',
  communitybuild: 'evaluate-commercial',
  transact: 'evaluate-commercial',
}
