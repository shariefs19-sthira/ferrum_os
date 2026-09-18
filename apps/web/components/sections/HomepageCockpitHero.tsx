"use client"

import { useEffect, useRef, useState } from 'react'
import ProductCockpitPreview, { type CockpitProduct } from '../workspace/ProductCockpitPreview'
import EvidenceStateBadge from './EvidenceStateBadge'
import HeroPreviewPlaceholder from './HeroPreviewPlaceholder'
import HeroRoadmapPreview from './HeroRoadmapPreview'
import { productExperienceList, type ProductAccentToken } from '../../lib/productExperienceRegistry'
import { journeyRows, journeyRowForProduct } from '../../lib/homepageJourney'

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
  const activeJourneyRowId = journeyRowForProduct[activeId]
  const isLiveTool = active.tool.kind === 'live-cockpit'

  // W2-501: below 1366px the ten-product rail is no longer a horizontally
  // scrolling row of tabs — it's a compact trigger ("<Label> ▾") that opens
  // a floating vertical listbox. `isRailMenuOpen` / `focusedId` implement
  // that listbox's own open state and roving-tabindex keyboard focus,
  // independent of `activeId` (the *selected* product) so arrowing through
  // options previews nothing until Enter/Space/click commits a selection —
  // the same selection semantics a native <select> has.
  const [isRailMenuOpen, setIsRailMenuOpen] = useState(false)
  const [focusedId, setFocusedId] = useState<CockpitProduct>(activeId)
  const railMenuRef = useRef<HTMLDivElement | null>(null)
  const railTriggerRef = useRef<HTMLButtonElement | null>(null)
  const optionRefs = useRef<Partial<Record<CockpitProduct, HTMLDivElement | null>>>({})

  function selectProduct(id: CockpitProduct) {
    setActiveId(id)
    setIsRailMenuOpen(false)
    railTriggerRef.current?.focus()
  }

  function toggleRailMenu() {
    setIsRailMenuOpen((current) => {
      const next = !current
      if (next) setFocusedId(activeId)
      return next
    })
  }

  function closeRailMenu() {
    setIsRailMenuOpen(false)
    railTriggerRef.current?.focus()
  }

  // Escape closes the listbox and returns focus to its trigger; Arrow/Home/
  // End move the roving-tabindex focus among the ten options. This is the
  // same document-level-listener-while-open shape MobileMenu.tsx already
  // uses for its Escape handling, reused here rather than inventing a new
  // one.
  useEffect(() => {
    if (!isRailMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRailMenu()
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        setFocusedId((current) => {
          const index = products.findIndex((product) => product.id === current)
          if (event.key === 'ArrowDown') return products[(index + 1) % products.length].id
          if (event.key === 'ArrowUp') return products[(index - 1 + products.length) % products.length].id
          if (event.key === 'Home') return products[0].id
          return products[products.length - 1].id
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRailMenuOpen])

  // Click-outside close — same containerRef-wraps-trigger-and-panel /
  // `mousedown` + `!ref.contains(target)` shape as MobileMenu.tsx.
  useEffect(() => {
    if (!isRailMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (railMenuRef.current && !railMenuRef.current.contains(event.target as Node)) {
        setIsRailMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isRailMenuOpen])

  // Moves real DOM focus to the roving-tabindex option and — since the ten
  // options (each min-h-11 / 44px) can exceed the popover's capped height —
  // scrolls it into view, honouring prefers-reduced-motion the same way
  // the old horizontally-scrolling rail's tab-select did (that call is now
  // dead code at its original site: the >=1366px grid rail shows all ten
  // tabs at once and never scrolls, so the pattern moved here instead of
  // being duplicated).
  useEffect(() => {
    if (!isRailMenuOpen) return
    const el = optionRefs.current[focusedId]
    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el?.focus()
    el?.scrollIntoView?.({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })
  }, [isRailMenuOpen, focusedId])

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLDivElement>, id: CockpitProduct) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectProduct(id)
    }
  }

  return (
    <section className="overflow-hidden border-b border-relume-border bg-relume-surface" data-home-cockpit-hero>
      <div className="mx-auto w-full max-w-relume-container px-4 pb-5 pt-6 sm:px-6 lg:px-8">
        {/*
          W2-501: the rail, proposition/preview composition and evidence
          line now render inside one bordered shell — "cockpit framing" —
          instead of a hero section with a rail floating below it. The
          rail is the shell's top toolbar (rendered first, above the
          proposition/preview content); the balanced proposition-left/
          preview-right grid and the evidence-metadata line sit below it,
          each separated only by a rule (border-t), never a color or
          background change, keeping the whole shell reading as one
          application surface built from existing relume-* tokens.
        */}
        <div className="overflow-hidden rounded-2xl border border-relume-border bg-relume-surface" data-cockpit-shell>
          {/* Tool rail / tab-strip — the shell's top toolbar. Two distinct
              layouts:
                - below 1366px: a compact trigger ("<Label> ▾") that opens
                  a floating vertical listbox (role="listbox" / role="option")
                  — no horizontal scroll anywhere at this width.
                - at >=1366px: unchanged from before — a 10-column grid so
                  all ten tabs are visible simultaneously with no scroll.
                  1366px has no matching default Tailwind breakpoint, so
                  this uses the arbitrary `min-[1366px]:` variant
                  (supported by the installed Tailwind 3.4) rather than
                  widening `lg` (1024px) itself, which stays the
                  breakpoint for the two-column proposition/preview split
                  below. */}
          <div className="border-b border-relume-border px-2 py-2 sm:px-3" data-cockpit-rail>
            {/* >=1366px: full ten-tab grid — role="tab"/role="tablist"/
                aria-selected semantics unchanged. */}
            <div
              role="tablist"
              aria-label="Ferrum product cockpits"
              className="hidden min-[1366px]:grid min-[1366px]:grid-cols-10 min-[1366px]:divide-x min-[1366px]:divide-relume-border"
            >
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === product.id}
                  aria-controls="homepage-cockpit-stage"
                  onClick={() => selectProduct(product.id)}
                  className={`min-h-11 min-w-0 flex-1 justify-center whitespace-nowrap rounded-none border-0 px-2 text-[11px] font-medium tracking-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
                    activeId === product.id
                      ? 'bg-relume-ink text-white'
                      : 'bg-relume-surface text-relume-ink hover:bg-relume-surface-secondary'
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>

            {/* Below 1366px: compact trigger + floating listbox. Reuses
                MobileMenu.tsx's containerRef-wraps-trigger-and-panel /
                Escape-returns-focus / click-outside-closes pattern. */}
            <div ref={railMenuRef} className="relative min-[1366px]:hidden">
              <button
                ref={railTriggerRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isRailMenuOpen}
                aria-controls="homepage-cockpit-rail-listbox"
                onClick={toggleRailMenu}
                className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-full border border-relume-border bg-relume-surface px-6 py-3 text-sm font-medium text-relume-ink transition-colors duration-200 hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
              >
                <span>{active.label}</span>
                <span aria-hidden="true">▾</span>
              </button>

              {isRailMenuOpen && (
                <div
                  id="homepage-cockpit-rail-listbox"
                  role="listbox"
                  aria-label="Ferrum product cockpits"
                  className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-relume-border bg-relume-surface p-2 shadow-xl"
                >
                  {products.map((product) => (
                    <div
                      key={product.id}
                      ref={(el) => {
                        optionRefs.current[product.id] = el
                      }}
                      role="option"
                      aria-selected={activeId === product.id}
                      tabIndex={focusedId === product.id ? 0 : -1}
                      onClick={() => selectProduct(product.id)}
                      onKeyDown={(event) => handleOptionKeyDown(event, product.id)}
                      className={`flex min-h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink ${
                        activeId === product.id
                          ? 'bg-relume-ink text-white'
                          : 'text-relume-ink hover:bg-relume-surface-secondary'
                      }`}
                    >
                      {product.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*
            Mobile content order (below `lg`, within the shell, below the
            rail toolbar above): proposition -> selected preview.
            Achieved with Tailwind `order-*` utilities on this single
            responsive grid (grid-cols-1 below `lg`, 12-column side-by-side
            at `lg`+) rather than duplicating JSX per breakpoint.
          */}
          <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:items-start lg:gap-8 lg:p-8">
            {/* Left column: the project-journey panel. Replaces the former
                hero narrative (headline/proposition prose + a four-stage
                pill indicator) with a compact, permanently visible
                five-row breakdown of the same underlying concept, at finer
                grain (the old "Build" stage lumped four different products'
                different jobs together). This is NOT a second navigation
                system: the rows are non-interactive -- the tab rail above
                is still the only clickable product/category control. A row
                only ever changes emphasis, driven by the same `activeId`
                the rail and cockpit already share, via
                lib/homepageJourney.ts's product -> row mapping.
                lg:col-span-4/8 (roughly one third / two thirds, cockpit
                dominant) per the required desktop 1366+ proportion. */}
            <div className="order-1 min-w-0 lg:order-1 lg:col-span-4">
              <p className="border-b border-relume-border pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">
                What you can do in Ferrum
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-relume-tight text-relume-ink sm:text-3xl lg:text-4xl">
                Move one project through its connected decisions.
              </h1>
              <p className="mt-3 text-sm leading-6 text-relume-muted">
                Start at the question you have. Keep the project context visible as you examine feasibility, develop the design, define scope, coordinate delivery, and understand commercial options.
              </p>

              <ul className="mt-5 space-y-2" aria-label="Project journey" data-journey-panel>
                {journeyRows.map((row) => {
                  const isActiveRow = row.id === activeJourneyRowId
                  return (
                    <li
                      key={row.id}
                      aria-current={isActiveRow ? 'true' : undefined}
                      data-journey-row={row.id}
                      data-journey-row-active={isActiveRow || undefined}
                      className={`rounded-xl border px-3 py-2.5 transition-colors duration-200 ${
                        isActiveRow ? 'border-relume-ink bg-relume-ink text-white' : 'border-relume-border text-relume-ink'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${isActiveRow ? 'text-white' : 'text-relume-ink'}`}>{row.title}</p>
                      <p className={`mt-1 text-xs leading-5 ${isActiveRow ? 'text-white/80' : 'text-relume-muted'}`}>{row.body}</p>
                      {isActiveRow && (
                        <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-white/80" data-journey-row-active-product>
                          <span aria-hidden="true" className={`mt-1 h-2 w-2 shrink-0 rounded-full ${accentDotClass[active.accent]}`} />
                          <span>
                            <strong className="text-white">{active.label}</strong> — {active.persona}
                          </span>
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
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
                visible above the fold at 1366x768; stacks below the
                proposition on mobile via `order-2`. */}
            <div
              id="homepage-cockpit-stage"
              role="tabpanel"
              aria-label={`${active.label} cockpit`}
              className={`order-2 min-w-0 border-t-2 lg:order-2 lg:col-span-8 ${accentBorderClass[active.accent]}`}
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
          </div>

          {/* Evidence metadata line — always the shell's last strip.
              Provenance/status text (the evidence badge) uses the
              monospace stack via EvidenceStateBadge's own `font-mono`
              class; this file's surrounding text (product name, task,
              note) stays on the regular sans body font, matching the
              "monospace for provenance/status only, never headline/body
              copy" rule. */}
          <div className="flex flex-col gap-2 border-t border-relume-border px-4 py-2 text-xs text-relume-muted sm:px-6 lg:px-8">
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
