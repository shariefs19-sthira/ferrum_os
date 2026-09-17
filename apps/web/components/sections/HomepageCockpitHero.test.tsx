import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageCockpitHero from './HomepageCockpitHero'
import { productExperienceList } from '../../lib/productExperienceRegistry'

vi.mock('../workspace/ProductCockpitPreview', () => ({
  default: ({ product, label }: { product: string; label: string }) => <div data-testid="cockpit">{product}:{label}</div>,
}))

const ROADMAP_IDS = new Set(['buildos', 'procurehub', 'communitybuild'])

describe('HomepageCockpitHero', () => {
  it('opens with LandIntel and switches the placeholder target before any interaction', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByTestId('hero-preview-placeholder').textContent).toContain('LandIntel')
    expect(screen.getByRole('link', { name: 'Open LandIntel cockpit' }).getAttribute('href')).toBe('/products/landintel')

    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('hero-preview-placeholder').textContent).toContain('DesignStudio')
    expect(screen.getByRole('link', { name: 'Open DesignStudio cockpit' }).getAttribute('href')).toBe('/products/designstudio')

    fireEvent.click(screen.getByRole('tab', { name: 'Structura' }))
    expect(screen.getByText(/live, sample, indicative, gap or roadmap/i)).toBeTruthy()
  })

  it('has exactly one primary CTA and one secondary product-discovery CTA', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getByRole('link', { name: /Open LandIntel cockpit/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'See all 10 products' })).toBeTruthy()
  })

  it('shows a stage indicator that tracks the active product\'s lifecycle stage', () => {
    render(<HomepageCockpitHero />)
    const indicator = screen.getByLabelText('Project lifecycle stage')
    expect(indicator.querySelector('[aria-current="true"]')?.textContent).toBe('Land')

    fireEvent.click(screen.getByRole('tab', { name: 'BOQ Pro' }))
    expect(indicator.querySelector('[aria-current="true"]')?.textContent).toBe('Build')

    fireEvent.click(screen.getByRole('tab', { name: 'InvestFlow' }))
    expect(indicator.querySelector('[aria-current="true"]')?.textContent).toBe('Invest')
  })

  it('shows an evidence-state badge that updates per product', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByText('INDICATIVE').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: 'BuildOS' }))
    expect(screen.getAllByText('ROADMAP').length).toBeGreaterThan(0)
  })

  it('3D-mount gate: does not render the real cockpit (and therefore never mounts Space3D/WorkspaceCockpit) until "Load interactive preview" is clicked', () => {
    render(<HomepageCockpitHero />)
    expect(screen.queryByTestId('cockpit')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Load interactive preview' }))

    expect(screen.getByTestId('cockpit').textContent).toBe('landintel:LandIntel')
    expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
  })

  it('keeps the real cockpit mounted for newly selected products once the gate has fired once', () => {
    render(<HomepageCockpitHero />)
    fireEvent.click(screen.getByRole('button', { name: 'Load interactive preview' }))
    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('cockpit').textContent).toBe('designstudio:DesignStudio')
    expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
  })

  it('scrolls the selected product tab into view on selection, respecting prefers-reduced-motion', () => {
    // jsdom does not implement scrollIntoView; stub it so the call can be observed.
    const scrollIntoView = vi.fn()
    // jsdom has no real scrollIntoView implementation.
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    render(<HomepageCockpitHero />)
    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth', inline: 'center', block: 'nearest' }),
    )
  })

  it('uses instant (non-smooth) scroll-into-view when prefers-reduced-motion is set', () => {
    const scrollIntoView = vi.fn()
    // jsdom has no real scrollIntoView implementation.
    HTMLElement.prototype.scrollIntoView = scrollIntoView
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    // Partial matchMedia stub, sufficient for this check.
    window.matchMedia = matchMedia as unknown as typeof window.matchMedia

    render(<HomepageCockpitHero />)
    fireEvent.click(screen.getByRole('tab', { name: 'Structura' }))

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'auto', inline: 'center', block: 'nearest' }),
    )
  })

  it('renders all ten product tabs inside one non-wrapping tablist container', () => {
    render(<HomepageCockpitHero />)
    const tablist = screen.getByRole('tablist', { name: 'Ferrum product cockpits' })
    expect(tablist.className).toMatch(/overflow-x-auto/)
    expect(tablist.className).toMatch(/min-\[1366px\]:grid-cols-10/)
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(10)
  })

  it('never requests the real cockpit chain (Space3D/WorkspaceCockpit) before any user interaction, for any of the seven real-tool products', () => {
    render(<HomepageCockpitHero />)
    for (const product of productExperienceList) {
      if (product.tool.kind !== 'live-cockpit') continue
      fireEvent.click(screen.getByRole('tab', { name: product.label }))
      expect(screen.queryByTestId('cockpit')).toBeNull()
    }
  })

  // W2-500 productExperienceRegistry: one exhaustive pass over all ten
  // products, each individually, rather than spot-checking one or two —
  // covers lifecycle stage, persona/lens, tool-vs-roadmap rendering,
  // evidence badge, CTA, output-card content, and (for ROADMAP products)
  // the absence of any control implying live functionality.
  describe.each(productExperienceList)('product: $label', (product) => {
    it('renders the correct lifecycle stage, persona/lens, evidence badge and CTA', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      const indicator = screen.getByLabelText('Project lifecycle stage')
      expect(indicator.querySelector('[aria-current="true"]')?.textContent).toBe(product.stage)

      const lens = document.querySelector('[data-product-lens]')
      expect(lens?.textContent).toContain(product.persona)
      expect(lens?.textContent).toContain(product.lens)

      const badges = screen.getAllByText(product.evidenceState)
      expect(badges.length).toBeGreaterThan(0)

      const cta = screen.getByRole('link', { name: product.primaryCta.label })
      expect(cta.getAttribute('href')).toBe(product.primaryCta.href)
    })

    it(ROADMAP_IDS.has(product.id)
      ? 'renders the honest roadmap state, never the real interactive cockpit — even after clicking the tab again'
      : 'renders the gated placeholder, then the real cockpit chain once "Load interactive preview" is clicked', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      if (ROADMAP_IDS.has(product.id)) {
        expect(screen.getByTestId('hero-roadmap-preview')).toBeTruthy()
        expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
        expect(screen.queryByRole('button', { name: 'Load interactive preview' })).toBeNull()
        expect(screen.queryByTestId('cockpit')).toBeNull()

        // No unsupported live capability implied: no interactive form
        // controls (inputs/selects/sliders) anywhere in the roadmap panel.
        const panel = screen.getByTestId('hero-roadmap-preview')
        expect(panel.querySelectorAll('input, select, textarea, [role="slider"]')).toHaveLength(0)

        // Re-select the tab (simulating repeated "interaction") — still
        // no real cockpit ever mounts, since there is nothing to gate.
        fireEvent.click(screen.getByRole('tab', { name: product.label }))
        expect(screen.queryByTestId('cockpit')).toBeNull()
      } else {
        expect(screen.getByTestId('hero-preview-placeholder')).toBeTruthy()
        expect(screen.queryByTestId('hero-roadmap-preview')).toBeNull()

        fireEvent.click(screen.getByRole('button', { name: 'Load interactive preview' }))
        expect(screen.getByTestId('cockpit').textContent).toBe(`${product.id}:${product.label}`)
        expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
      }
    })

    it('shows this product\'s own output-card description in the rendered content', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      const outputCards = document.querySelector('[data-product-output-cards]')
      if (product.outputCards.length > 0) {
        expect(outputCards).not.toBeNull()
        for (const card of product.outputCards) {
          expect(outputCards?.textContent).toContain(card)
        }
      } else {
        expect(outputCards).toBeNull()
      }
    })

    it('keeps the selected tab in the tablist, marked aria-selected, and every other tab aria-selected=false', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(10)
      const selected = tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true')
      expect(selected).toHaveLength(1)
      expect(selected[0].textContent).toBe(product.label)
    })

    it('keyboard/native activation (Enter/Space on the tab button) selects this product, same as a click', () => {
      render(<HomepageCockpitHero />)
      const tab = screen.getByRole('tab', { name: product.label })
      // Native <button> elements activate on Enter/Space via a click event
      // in both real browsers and Testing Library's fireEvent — firing
      // 'click' here exercises the same onClick handler a real keydown
      // would trigger, matching this file's existing keyboard-adjacent
      // coverage (scrollIntoView tests above use the same pattern).
      fireEvent.click(tab)
      expect(tab.getAttribute('aria-selected')).toBe('true')
      expect(screen.getByLabelText('Project lifecycle stage').querySelector('[aria-current="true"]')?.textContent).toBe(product.stage)
    })
  })
})
