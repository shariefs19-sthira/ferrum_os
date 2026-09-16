"use client"

import { useState } from 'react'
import Link from 'next/link'
import ProductCockpitPreview, { type CockpitProduct } from '../workspace/ProductCockpitPreview'

const products: Array<{ id: CockpitProduct; label: string; href: string; state: string }> = [
  { id: 'landintel', label: 'LandIntel', href: '/products/landintel', state: 'Seeded lookup + map' },
  { id: 'designstudio', label: 'DesignStudio', href: '/products/designstudio', state: 'Deterministic massing' },
  { id: 'structura', label: 'Structura', href: '/products/structura', state: 'Textbook check preview' },
  { id: 'boq-pro', label: 'BOQ Pro', href: '/products/boq-pro', state: 'Measured quantities' },
  { id: 'promarket', label: 'ProMarket', href: '/products/promarket', state: 'Seeded comparison' },
  { id: 'buildos', label: 'BuildOS', href: '/products/buildos', state: 'Roadmap workflow' },
  { id: 'procurehub', label: 'ProcureHub', href: '/products/procurehub', state: 'Roadmap workflow' },
  { id: 'investflow', label: 'InvestFlow', href: '/products/investflow', state: 'Indicative model' },
  { id: 'communitybuild', label: 'CommunityBuild', href: '/products/communitybuild', state: 'Sample project state' },
  { id: 'transact', label: 'Transact', href: '/products/transact', state: 'Indicative estimate' },
]

export default function HomepageCockpitHero() {
  const [activeId, setActiveId] = useState<CockpitProduct>('landintel')
  const active = products.find((product) => product.id === activeId) ?? products[0]

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
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={active.href} className="inline-flex min-h-11 items-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              Open {active.label} cockpit
            </Link>
            <Link href="/products" className="inline-flex min-h-11 items-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
              Explore products
            </Link>
          </div>
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
          <p><strong className="text-relume-ink">{active.label}</strong> · {active.state}</p>
          <p>Product state is preserved locally in this browser.</p>
        </div>
      </div>

      <div id="homepage-cockpit-stage" role="tabpanel" aria-label={`${active.label} cockpit`} className="min-w-0" data-home-cockpit-product={active.id}>
        <ProductCockpitPreview key={active.id} product={active.id} label={active.label} layout="product-page" />
      </div>
    </section>
  )
}
