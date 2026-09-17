import type { CockpitProduct } from '../components/workspace/ProductCockpitPreview'

export type LifecycleStage = 'Land' | 'Design' | 'Build' | 'Invest'

/**
 * W2-500 (Project Decision Console). New, explicit product -> lifecycle
 * stage mapping. No such mapping existed anywhere in the codebase before
 * this (confirmed in docs/design/HOMEPAGE_REDESIGN_2026.md §5.4, "Stage
 * indicator — new mapping required"): `WorkspaceProduct` (lib/types.ts) is
 * a different, unrelated 10-value enum used for per-product
 * compliance-permission scoping in WorkspaceCockpit.tsx, not a
 * Land/Design/Build/Invest grouping, despite sharing two words with it.
 *
 * Derived from each product's own tagline in HomepageCockpitHero's
 * `products` array / apps/web/app/page.tsx's `productShowcaseItems`, and
 * each stage's own body copy in `stageCopy` below (reasonable inference,
 * not an existing source of truth) — see
 * docs/design/HOMEPAGE_REDESIGN_2026.md §5.4 for the same table this
 * mirrors. Kept as one small, inspectable constant rather than inline/
 * hidden logic so it's easy to audit or correct.
 */
export const stageForProduct: Record<CockpitProduct, LifecycleStage> = {
  landintel: 'Land',
  designstudio: 'Design',
  structura: 'Design',
  'boq-pro': 'Build',
  promarket: 'Build',
  buildos: 'Build',
  procurehub: 'Build',
  investflow: 'Invest',
  communitybuild: 'Invest',
  transact: 'Invest',
}

/**
 * Reused verbatim from the former apps/web/app/page.tsx `valuePropItems`
 * (the "Value Proposition" section, removed in W2-500 so this copy is
 * presented once — as the hero's stage indicator — instead of twice).
 */
export const stageCopy: Array<{ title: LifecycleStage; body: string }> = [
  { title: 'Land', body: 'Check feasibility, zoning and risk before you buy or build.' },
  { title: 'Design', body: 'Generate plans and get them engineered to IS codes.' },
  { title: 'Build', body: 'Estimate, procure, manage and track your project.' },
  { title: 'Invest', body: 'Model returns and raise capital with confidence.' },
]
