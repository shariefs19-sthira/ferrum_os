import { productExperienceRegistry } from '../productExperienceRegistry'
import { productFeatureRegistry, productLabels, type ProductFeature } from '../productFeatureRegistry'
import type { EvidenceState } from '../../components/sections/EvidenceStateBadge'
import type { ProductControlId } from './controlRegistry'

/**
 * Which existing, already-live component a product's cockpit surface mounts.
 * No entry means there is no live tool: the surface then states ROADMAP and
 * offers no action. Titles describe only what the mounted component does
 * today (productFeatureRegistry's AVAILABLE rows are the source of truth).
 */
export type ProductToolKey = 'ulpin-lookup' | 'is-check' | 'boq-cost-split' | 'rate-comparison' | 'irr-npv' | 'stamp-duty-ask-band'

const liveToolByProduct: Partial<Record<ProductControlId, { key: ProductToolKey; title: string }>> = {
  landintel: { key: 'ulpin-lookup', title: 'ULPIN parcel lookup' },
  structura: { key: 'is-check', title: 'IS 456 / IS 800 clause checks' },
  'boq-pro': { key: 'boq-cost-split', title: 'BOQ cost-split scenario' },
  promarket: { key: 'rate-comparison', title: 'Sample-city rate comparison' },
  investflow: { key: 'irr-npv', title: 'IRR / NPV modeler' },
  transact: { key: 'stamp-duty-ask-band', title: 'Stamp duty & ask band' },
}

export type ProductSurface = {
  product: ProductControlId
  label: string
  state: 'LIVE' | 'ROADMAP'
  tool: { key: ProductToolKey; title: string } | null
  evidenceState: EvidenceState
  lens: string
  provenance: string
  /** Features that are AVAILABLE or TEST_MODE today. */
  available: ProductFeature[]
  /** Features that are explicitly not built. Never rendered as actions. */
  roadmap: ProductFeature[]
  /** Reason the whole product has no live tool (ROADMAP products only). */
  roadmapReason?: string
}

/** Design keeps the building model and shell controls, not a tool panel. */
export const hasProductToolSurface = (product: ProductControlId) => product !== 'designstudio'

export function resolveProductSurface(product: ProductControlId): ProductSurface {
  const experience = productExperienceRegistry[product]
  const features = productFeatureRegistry[product]
  const live = experience.tool.kind === 'live-cockpit'
  return {
    product,
    label: productLabels[product],
    state: live ? 'LIVE' : 'ROADMAP',
    tool: live ? liveToolByProduct[product] ?? null : null,
    evidenceState: experience.evidenceState,
    lens: experience.lens,
    provenance: experience.provenance,
    available: features.filter((feature) => feature.availability !== 'ROADMAP'),
    roadmap: features.filter((feature) => feature.availability === 'ROADMAP'),
    roadmapReason: experience.tool.kind === 'live-cockpit' ? undefined : experience.tool.reason,
  }
}
