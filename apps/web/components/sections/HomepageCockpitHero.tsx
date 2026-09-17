"use client"

import { useState } from 'react'
import Link from 'next/link'
import ProductCockpitPreview, { type CockpitProduct } from '../workspace/ProductCockpitPreview'
import EvidenceStateBadge, { type EvidenceState } from './EvidenceStateBadge'
import HeroPreviewPlaceholder from './HeroPreviewPlaceholder'
import { stageCopy, stageForProduct } from '../../lib/homepageStages'

// evidenceState reflects the truthfulness of *this cockpit preview
// specifically* (every ProductCockpitPreview instance renders deterministic,
// unverified geometry regardless of product), not that product's full
// marketing-page feature list — BuildOS/ProcureHub are marked ROADMAP
// because their product pages disclose zero live functionality today
// (docs/design/FERRUM_DOMAIN_AND_ROUTE_MATRIX_2026.md); the rest show
// INDICATIVE, matching the existing "INDICATIVE deterministic geometry"
// disclosure already present in ProductCockpitPreview.tsx.
const products: Array<{ id: CockpitProduct; label: string; href: string; state: string; evidenceState: EvidenceState }> = [
  { id: 'landintel', label: 'LandIntel', href: '/products/landintel', state: 'Seeded lookup + map', evidenceState: 'INDICATIVE' },
  { id: 'designstudio', label: 'DesignStudio', href: '/products/designstudio', state: 'Deterministic massing', evidenceState: 'INDICATIVE' },
  { id: 'structura', label: 'Structura', href: '/products/structura', state: 'Textbook check preview', evidenceState: 'INDICATIVE' },
  { id: 'boq-pro', label: 'BOQ Pro', href: '/products/boq-pro', state: 'Measured quantities', evidenceState: 'INDICATIVE' },
  { id: 'promarket', label: 'ProMarket', href: '/products/promarket', state: 'Seeded comparison', evidenceState: 'INDICATIVE' },
  { id: 'buildos', label: 'BuildOS', href: '/products/buildos', state: 'Roadmap workflow', evidenceState: 'ROADMAP' },
  { id: 'procurehub', label: 'ProcureHub', href: '/products/procurehub', state: 'Roadmap workflow', evidenceState: 'ROADMAP' },
  { id: 'investflow', label: 'InvestFlow', href: '/products/investflow', state: 'Indicative model', evidenceState: 'INDICATIVE' },
  { id: 'communitybuild', label: 'CommunityBuild', href: '/products/communitybuild', state: 'Sample project state', evidenceState: 'INDICATIVE' },
  { id: 'transact', label: 'Transact', href: '/products/transact', state: 'Indicative estimate', evidenceState: 'INDICATIVE' },
]

export default function HomepageCockpitHero() {
  const [activeId, setActiveId] = useState<CockpitProduct>('landintel')
  // 3D-mount gate (see HeroPreviewPlaceholder.tsx for the full rationale):
  // stays false until the visitor explicitly clicks "Load interactive
  // preview" once; from then on the real cockpit chain (and therefore
  // Space3D) stays mounted for every subsequently selected product too.
  const [hasInteracted, setHasInteracted] = useState(false)
  const active = products.find((product) => product.id === activeId) ?? products[0]
  const activeStage = stageForProduct[activeId]

  return (
    <section className="overflow-hidden border-b border-relume-border bg-relume-surface" data-home-cockpit-hero>
      <div className="mx-auto w-full max-w-relume-container px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">Ferrum OS · project operating environment</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-relume-tight text-relume-ink sm:text-5xl lg:text-6xl">
              See the project. Change the decision. Keep the evidence attached.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-relume-muted">
              Move between land, design, engineering, quantities and delivery through one working cockpit. Every surface below is labelled as live, sample, indicative, gap or roadmap.
            </p>
          </div>
          {/* One primary CTA (dominant visual weight: solid fill) and one
              subordinate secondary CTA (outline only) — per the Console
              spec's "one primary hero CTA, one secondary product-discovery
              CTA" requirement. */}
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={active.href} className="inline-flex min-h-11 items-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              Open {active.label} cockpit
            </Link>
            <Link href="/products" className="inline-flex min-h-11 items-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-muted hover:bg-relume-surface-secondary hover:text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              See all 10 products
            </Link>
          </div>
        </div>

        {/* Stage indicator: Land / Design / Build / Invest, tied to the
            active product via lib/homepageStages.ts. Purely indicative
            (not independently tappable), so no touch-target constraint
            applies to it (docs/design/HOMEPAGE_REDESIGN_2026.md §5.4,
            "Mobile section sequence"). */}
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Project lifecycle stage" data-stage-indicator>
          {stageCopy.map((stage) => (
            <span
              key={stage.title}
              aria-current={stage.title === activeStage ? 'true' : undefined}
              title={stage.body}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                stage.title === activeStage
                  ? 'border-relume-ink bg-relume-ink text-white'
                  : 'border-relume-border text-relume-muted'
              }`}
            >
              {stage.title}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Ferrum product cockpits">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              role="tab"
              aria-selected={activeId === product.id}
              aria-controls="homepage-cockpit-stage"
              onClick={() => setActiveId(product.id)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${activeId === product.id ? 'border-relume-ink bg-relume-ink text-white' : 'border-relume-border bg-relume-surface text-relume-ink hover:bg-relume-surface-secondary'}`}
            >
              {product.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-relume-muted">
          <p className="flex flex-wrap items-center gap-2">
            <strong className="text-relume-ink">{active.label}</strong> · {active.state}
            <EvidenceStateBadge state={active.evidenceState} />
          </p>
          <p>Product state is preserved locally in this browser.</p>
        </div>
      </div>

      <div id="homepage-cockpit-stage" role="tabpanel" aria-label={`${active.label} cockpit`} className="min-w-0" data-home-cockpit-product={active.id}>
        {hasInteracted ? (
          <ProductCockpitPreview key={active.id} product={active.id} label={active.label} layout="product-page" />
        ) : (
          <HeroPreviewPlaceholder
            productLabel={active.label}
            task={active.state}
            evidenceState={active.evidenceState}
            onLoad={() => setHasInteracted(true)}
          />
        )}
      </div>
    </section>
  )
}
