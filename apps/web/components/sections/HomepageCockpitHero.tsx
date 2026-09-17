"use client"

import { useRef, useState } from 'react'
import Link from 'next/link'
import ProductCockpitPreview, { type CockpitProduct } from '../workspace/ProductCockpitPreview'
import EvidenceStateBadge from './EvidenceStateBadge'
import HeroPreviewPlaceholder from './HeroPreviewPlaceholder'
import HeroRoadmapPreview from './HeroRoadmapPreview'
import { stageCopy } from '../../lib/homepageStages'
import { productExperienceList, type ProductAccentToken } from '../../lib/productExperienceRegistry'

// W2-500: all ten products' data now comes from one place
// (lib/productExperienceRegistry.ts) instead of an inline array here.
// Selecting a product tab updates the preview/tool area, the stage
// indicator, the evidence badge, the CTA and the accent styling all from
// the same registry entry in one state update (setActiveId below) — there
// is no separate per-field state to fall out of sync.
const products = productExperienceList

// Accent tokens are a fixed, small set (see productExperienceRegistry.ts's
// ProductAccentToken comment) mapped to literal Tailwind classes so the
// JIT compiler can see them — `border-${token}`-style interpolation would
// not be detected by Tailwind's static analysis.
const accentBorderClass: Record<ProductAccentToken, string> = {
  'relume-command': 'border-relume-command',
  'relume-steel': 'border-relume-steel',
}
const accentDotClass: Record<ProductAccentToken, string> = {
  'relume-command': 'bg-relume-command',
  'relume-steel': 'bg-relume-steel',
}

export default function HomepageCockpitHero() {
  const [activeId, setActiveId] = useState<CockpitProduct>('landintel')
  // 3D-mount gate (see HeroPreviewPlaceholder.tsx for the full rationale):
  // stays false until the visitor explicitly clicks "Load interactive
  // preview" once; from then on the real cockpit chain (and therefore
  // Space3D) stays mounted for every subsequently selected product too —
  // but only for products whose registry `tool.kind` is 'live-cockpit'.
  // BuildOS/ProcureHub/CommunityBuild have no real cockpit to gate: there
  // is nothing to mount, live or delayed, so this flag is simply never
  // consulted for them (see `isLiveTool`/`showRoadmap` below).
  const [hasInteracted, setHasInteracted] = useState(false)
  const active = products.find((product) => product.id === activeId) ?? products[0]
  const activeStage = active.stage
  const isLiveTool = active.tool.kind === 'live-cockpit'

  // Product-rail tab refs, keyed by product id, so a selection (click or
  // keyboard activation of the native <button>) can scroll the newly
  // selected tab into view within the horizontally-scrolling rail. Only
  // matters below the 1366px breakpoint where the rail is `overflow-x-auto`
  // rather than a full 10-column grid (see the rail markup below).
  const tabRefs = useRef<Partial<Record<CockpitProduct, HTMLButtonElement | null>>>({})

  function selectProduct(id: CockpitProduct) {
    setActiveId(id)
    const el = tabRefs.current[id]
    // jsdom (unit tests) does not implement scrollIntoView, hence the
    // optional call; matches the reduced-motion pattern already used by
    // MotionObserver.tsx / Space3D.tsx (`matchMedia('(prefers-reduced-motion: reduce)')`).
    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <section className="overflow-hidden border-b border-relume-border bg-relume-surface" data-home-cockpit-hero>
      <div className="mx-auto w-full max-w-relume-container px-4 pb-5 pt-6 sm:px-6 lg:px-8">
        {/*
          Mobile content order (below `lg`): proposition -> CTA -> product
          rail -> selected preview -> evidence metadata. Achieved with
          Tailwind `order-*` utilities on this single responsive grid
          (grid-cols-1 below `lg`, 12-column side-by-side at `lg`+) rather
          than duplicating JSX per breakpoint — each child below sets both
          its unprefixed (mobile) order and its `lg:` order explicitly.
          CSS Grid's auto-placement algorithm follows computed `order`, not
          DOM order, so the same four blocks can be laid out completely
          differently at each breakpoint from one markup pass.
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* Left column: eyebrow, headline, proposition, CTAs, stage indicator. */}
          <div className="order-1 min-w-0 lg:order-1 lg:col-span-5">
            <p className="border-b border-relume-border pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
              Ferrum OS · project operating environment
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-relume-tight text-relume-ink sm:text-4xl lg:text-5xl">
              See the project. Change the decision. Keep the evidence attached.
            </h1>
            <p className="mt-3 text-base leading-7 text-relume-muted">
              Move between land, design, engineering, quantities and delivery through one working cockpit. Every surface below is labelled as live, sample, indicative, gap or roadmap.
            </p>

            {/* Restrained per-product accent (see productExperienceRegistry.ts's
                ProductAccentToken comment): a small dot plus persona/lens line,
                not a full background recolor. */}
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-relume-muted" data-product-lens>
              <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accentDotClass[active.accent]}`} />
              <span>
                <strong className="text-relume-ink">For: </strong>{active.persona}
                <br />
                <strong className="text-relume-ink">Decision: </strong>{active.lens}
              </span>
            </p>

            {/* One primary CTA (dominant visual weight: solid fill) and one
                subordinate secondary CTA (outline only) — per the Console
                spec's "one primary hero CTA, one secondary product-discovery
                CTA" requirement. */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={active.primaryCta.href} className="inline-flex min-h-11 items-center rounded-full bg-relume-ink px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
                {active.primaryCta.label}
              </Link>
              <Link href="/products" className="inline-flex min-h-11 items-center rounded-full border border-relume-border px-6 py-3 text-sm font-medium text-relume-muted transition-colors duration-200 hover:bg-relume-surface-secondary hover:text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink">
                See all 10 products
              </Link>
            </div>

            {/* Stage indicator: Land / Design / Build / Invest, tied to the
                active product via lib/homepageStages.ts (sourced through
                the registry's `stage` field). Purely indicative (not
                independently tappable), so no touch-target constraint
                applies to it (docs/design/HOMEPAGE_REDESIGN_2026.md §5.4,
                "Mobile section sequence"). relume-accent is intentionally
                not used here — the selected stage pill uses relume-ink,
                the same "one selected-state treatment" token as the
                product tabs, keeping relume-accent reserved for evidence
                badges only. */}
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Project lifecycle stage" data-stage-indicator>
              {stageCopy.map((stage) => (
                <span
                  key={stage.title}
                  aria-current={stage.title === activeStage ? 'true' : undefined}
                  title={stage.body}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    stage.title === activeStage
                      ? 'border-relume-ink bg-relume-ink text-white'
                      : 'border-relume-border text-relume-muted'
                  }`}
                >
                  {stage.title}
                </span>
              ))}
            </div>
          </div>

          {/* Right column: the selected product's preview. Three states:
                - registry `tool.kind !== 'live-cockpit'` (BuildOS,
                  ProcureHub, CommunityBuild): always the honest
                  HeroRoadmapPreview, regardless of `hasInteracted` — there
                  is nothing real to gate or mount for these three.
                - live-cockpit products, before the gate fires: the
                  existing HeroPreviewPlaceholder ("Load interactive
                  preview").
                - live-cockpit products, after the gate fires: the real
                  ProductCockpitPreview -> WorkspaceCockpit -> Space3D
                  chain, opened on this product's registry-specified
                  `defaultView`.
              Sits beside the left column at `lg`+ so the preview is
              visible above the fold at 1366x768; stacks below the rail on
              mobile via `order-3`. */}
          <div
            id="homepage-cockpit-stage"
            role="tabpanel"
            aria-label={`${active.label} cockpit`}
            className={`order-3 min-w-0 border-t-2 lg:order-2 lg:col-span-7 ${accentBorderClass[active.accent]}`}
            data-home-cockpit-product={active.id}
          >
            {!isLiveTool ? (
              <HeroRoadmapPreview
                productLabel={active.label}
                reason={active.tool.kind === 'ROADMAP' || active.tool.kind === 'GAP' ? active.tool.reason : ''}
                evidenceState={active.evidenceState}
              />
            ) : hasInteracted ? (
              <ProductCockpitPreview key={active.id} product={active.id} label={active.label} layout="product-page" defaultView={active.defaultView} />
            ) : (
              <HeroPreviewPlaceholder
                productLabel={active.label}
                task={active.outputCards[0] ?? active.provenance}
                evidenceState={active.evidenceState}
                onLoad={() => setHasInteracted(true)}
              />
            )}
          </div>

          {/* Product rail — full width, spans both columns, sits below
              them. Two distinct layouts:
                - below 1366px: a horizontally-scrolling row (unchanged
                  structural approach) with scroll-snap and a trailing
                  fade affordance.
                - at >=1366px: a 10-column grid so all ten tabs are visible
                  simultaneously with no scroll. 1366px has no matching
                  default Tailwind breakpoint, so this uses the arbitrary
                  `min-[1366px]:` variant (supported by the installed
                  Tailwind 3.4) rather than widening `lg` (1024px) itself,
                  which stays the breakpoint for the two-column hero split. */}
          <div className="relative order-2 min-w-0 lg:order-3 lg:col-span-12">
            <div
              role="tablist"
              aria-label="Ferrum product cockpits"
              className="flex snap-x snap-mandatory items-stretch gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-[1366px]:grid min-[1366px]:snap-none min-[1366px]:grid-cols-10 min-[1366px]:gap-0 min-[1366px]:divide-x min-[1366px]:divide-relume-border min-[1366px]:overflow-visible min-[1366px]:pb-0"
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  ref={(el) => {
                    tabRefs.current[product.id] = el
                  }}
                  type="button"
                  role="tab"
                  aria-selected={activeId === product.id}
                  aria-controls="homepage-cockpit-stage"
                  onClick={() => selectProduct(product.id)}
                  className={`min-h-11 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink min-[1366px]:min-w-0 min-[1366px]:flex-1 min-[1366px]:justify-center min-[1366px]:rounded-none min-[1366px]:border-0 min-[1366px]:px-2 min-[1366px]:text-[11px] min-[1366px]:tracking-tight ${
                    activeId === product.id
                      ? 'border-relume-ink bg-relume-ink text-white'
                      : 'border-relume-border bg-relume-surface text-relume-ink hover:bg-relume-surface-secondary'
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
            {/* Trailing-edge fade — a visual hint that more tabs are
                scrollable, not a click target (native scroll/swipe/keyboard
                remains the primary mechanism, per the scrollbar being
                hidden only because this affordance keeps the overflow
                discoverable). Hidden at >=1366px, where the rail no longer
                scrolls. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-11 w-10 bg-gradient-to-l from-relume-surface to-transparent min-[1366px]:hidden"
            />
          </div>

          {/* Evidence metadata line — moved below the preview on mobile
              (order-4), stays directly under the rail at `lg`+. Provenance/
              status text (the evidence badge) uses the monospace stack via
              EvidenceStateBadge's own `font-mono` class; this file's
              surrounding text (product name, task, note) stays on the
              regular sans body font, matching the "monospace for
              provenance/status only, never headline/body copy" rule. */}
          <div className="order-4 flex flex-col gap-2 border-t border-relume-border py-2 text-xs text-relume-muted lg:col-span-12">
            <p className="flex flex-wrap items-center gap-2">
              <strong className="text-relume-ink">{active.label}</strong>
              <EvidenceStateBadge state={active.evidenceState} />
              <span data-product-provenance>{active.provenance}</span>
            </p>
            {active.outputCards.length > 0 && (
              <p data-product-output-cards>
                <strong className="text-relume-ink">Shows: </strong>{active.outputCards.join(' · ')}
              </p>
            )}
            {active.controls.length > 0 && (
              <p data-product-controls>
                <strong className="text-relume-ink">Adjustable: </strong>{active.controls.join(' · ')}
              </p>
            )}
            <p>Product state is preserved locally in this browser.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
