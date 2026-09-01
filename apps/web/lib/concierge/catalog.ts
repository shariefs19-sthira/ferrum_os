// Build-time catalog knowledge for the Concierge (W2-307). No network
// call, no LLM — a static list of real routes and real tools, matched
// against user input deterministically (lib/concierge/intents.ts).
// Kept in one file so it's the single place to update when a new
// product or tool ships, mirroring the same single-source-of-truth
// discipline docs/AGENT_INTERFACE.md applies to the tool catalog.

export type CatalogEntry = {
  id: string
  label: string
  href: string
  /** Keywords a user might type that should match this entry. */
  keywords: string[]
}

export const PRODUCTS: CatalogEntry[] = [
  { id: 'landintel', label: 'LandIntel', href: '/products/landintel', keywords: ['land', 'ulpin', 'parcel', 'feasibility'] },
  { id: 'designstudio', label: 'DesignStudio', href: '/products/designstudio', keywords: ['design', 'plan', 'massing', 'test-fit', 'testfit', 'dxf'] },
  { id: 'structura', label: 'Structura', href: '/products/structura', keywords: ['structural', 'is 456', 'is 800', 'is code', 'reinforcement', 'column', 'beam', 'compliance'] },
  { id: 'boq-pro', label: 'BOQ Pro', href: '/products/boq-pro', keywords: ['boq', 'estimate', 'bill of quantities', 'cost'] },
  { id: 'promarket', label: 'ProMarket', href: '/products/promarket', keywords: ['rate', 'material rate', 'labor rate', 'compare rates', 'hire', 'professional'] },
  { id: 'buildos', label: 'BuildOS', href: '/products/buildos', keywords: ['project management', 'buildos', 'site diary'] },
  { id: 'procurehub', label: 'ProcureHub', href: '/products/procurehub', keywords: ['procurement', 'supplier', 'material'] },
  { id: 'investflow', label: 'InvestFlow', href: '/products/investflow', keywords: ['irr', 'npv', 'investment', 'return', 'invest'] },
  { id: 'communitybuild', label: 'CommunityBuild', href: '/products/communitybuild', keywords: ['fractional', 'spv', 'community', 'cde', 'common data environment'] },
  { id: 'transact', label: 'Transact', href: '/products/transact', keywords: ['stamp duty', 'registration fee', 'ask band', 'transact', 'sell', 'buy property'] },
]

export const TOOLS: CatalogEntry[] = [
  { id: 'testfit', label: 'Test-fit calculator', href: '/products/designstudio', keywords: ['test-fit', 'testfit', 'massing', 'plot size'] },
  { id: 'is-check', label: 'IS-code checker', href: '/products/structura', keywords: ['is check', 'compliance check', 'code check'] },
  { id: 'ulpin-demo', label: 'ULPIN lookup', href: '/products/landintel', keywords: ['ulpin lookup', 'parcel lookup'] },
  { id: 'boq-estimate', label: 'BOQ estimate', href: '/products/boq-pro', keywords: ['boq estimate'] },
  { id: 'rate-compare', label: 'Rate comparison', href: '/products/promarket', keywords: ['rate comparison', 'compare rates'] },
  { id: 'irr-npv', label: 'IRR/NPV modeler', href: '/products/investflow', keywords: ['irr calculator', 'npv calculator', 'model returns'] },
  { id: 'cde-status', label: 'CDE status', href: '/products/communitybuild', keywords: ['cde status', 'project status'] },
  { id: 'stamp-duty', label: 'Stamp-duty estimator', href: '/products/transact', keywords: ['stamp duty', 'registration fee estimate'] },
  { id: 'ask-band', label: 'Ask-band estimator', href: '/products/transact', keywords: ['ask band', 'price range'] },
]

export const GENERAL: CatalogEntry[] = [
  { id: 'pricing', label: 'Pricing', href: '/pricing', keywords: ['pricing', 'price', 'cost', 'plans', 'how much'] },
  { id: 'products', label: 'All products', href: '/products', keywords: ['products', 'what do you offer', 'catalog'] },
  { id: 'careers', label: 'Careers', href: '/careers', keywords: ['careers', 'jobs', 'hiring', 'work here'] },
  { id: 'about', label: 'About', href: '/about', keywords: ['about', 'who are you', 'company'] },
  { id: 'signup', label: 'Sign up', href: '/signup', keywords: ['sign up', 'signup', 'register', 'get started', 'start free trial'] },
  { id: 'contact', label: 'Contact', href: '/contact', keywords: ['contact', 'talk to someone', 'support', 'help'] },
]
