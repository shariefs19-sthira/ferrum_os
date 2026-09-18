import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageCockpitHero from './HomepageCockpitHero'
import { productExperienceList } from '../../lib/productExperienceRegistry'
import { journeyRows, journeyRowForProduct } from '../../lib/homepageJourney'

const rowTitleById = Object.fromEntries(journeyRows.map((row) => [row.id, row.title]))
const expectedRowTitleFor = (productId: string) => rowTitleById[journeyRowForProduct[productId as keyof typeof journeyRowForProduct]]

// Children render in a sibling container, not inside `cockpit` itself, so
// every pre-existing `getByTestId('cockpit').textContent).toBe('id:Label')`
// exact-match assertion keeps working unchanged.
vi.mock('../workspace/ProductCockpitPreview', () => ({
  default: ({ product, label, children }: { product: string; label: string; children?: React.ReactNode }) => (
    <div>
      <div data-testid="cockpit-children">{children}</div>
      <div data-testid="cockpit">{product}:{label}</div>
    </div>
  ),
}))

// PRODUCT-ISOLATION-001-selected-product-only: each product's real primary
// panel component, mocked here to a stable, queryable marker -- these are
// the exact same components each product's own /products/<id>/page.tsx
// passes as ProductCockpitPreview's children (verified against their own,
// separately-tested source: UlpinMapExplorer.test.tsx etc.). What this file
// tests is the WIRING (the right one appears for the right product, and no
// other), not those components' own internal behavior.
vi.mock('./UlpinMapExplorer', () => ({
  default: () => <div data-testid="ulpin-map-explorer">UlpinMapExplorer</div>,
}))
vi.mock('./StampDutyEstimator', () => ({
  default: () => <div data-testid="stamp-duty-estimator">StampDutyEstimator</div>,
}))
vi.mock('./SteppedForecastModule', () => ({
  default: ({ product }: { product: string }) => <div data-testid="stepped-forecast-module" data-product={product}>SteppedForecastModule:{product}</div>,
}))

const ROADMAP_IDS = new Set(['buildos', 'procurehub', 'communitybuild'])
const ALL_PANEL_TESTIDS = ['ulpin-map-explorer', 'stamp-duty-estimator', 'stepped-forecast-module']

describe('HomepageCockpitHero', () => {
  it('opens with LandIntel\'s real cockpit rendered automatically, and switches it on tab click with no load gate', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByTestId('cockpit').textContent).toBe('landintel:LandIntel')

    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('cockpit').textContent).toBe('designstudio:DesignStudio')

    fireEvent.click(screen.getByRole('tab', { name: 'Structura' }))
    expect(screen.getAllByText(/INDICATIVE|LIVE|SAMPLE|GAP|ROADMAP/).length).toBeGreaterThan(0)
  })

  it('shows only the selected product narrative', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getByText('LandIntel · selected product')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: productExperienceList[0].lens })).toBeTruthy()
    expect(screen.getAllByText(productExperienceList[0].persona).length).toBeGreaterThan(0)
  })

  it('shows only the active product journey row and replaces it on product selection', () => {
    render(<HomepageCockpitHero />)
    const panel = screen.getByLabelText('Project journey')
    const rows = Array.from(panel.querySelectorAll('[data-journey-row]'))
    expect(rows).toHaveLength(1)
    expect(rows[0].textContent).toContain('Understand the site')
    for (const row of rows) {
      expect(row.tagName).toBe('LI')
      expect(row.querySelector('button, a, input, select')).toBeNull()
    }

    fireEvent.click(screen.getByRole('tab', { name: 'BOQ Pro' }))
    expect(panel.querySelectorAll('[data-journey-row]')).toHaveLength(1)
    expect(panel.textContent).toContain('Define scope and cost')
    expect(panel.textContent).not.toContain('Understand the site')
  })

  it('does not render the removed "Open {label} cockpit" or "See all 10 products" buttons, and adds no replacement product-navigation control in their place', () => {
    render(<HomepageCockpitHero />)
    expect(screen.queryByRole('link', { name: /Open .* cockpit/ })).toBeNull()
    expect(screen.queryByRole('link', { name: 'See all 10 products' })).toBeNull()
    // The rail (tablist at >=1366px, trigger+listbox below it) remains the
    // only product-selection mechanism — no other link/button targets a
    // per-product marketing page from within the shell.
    expect(screen.queryAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/products/'))).toHaveLength(0)
  })

  it('emphasizes the journey row matching the active product\'s category, and only that one', () => {
    render(<HomepageCockpitHero />)
    const panel = screen.getByLabelText('Project journey')
    expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain('Understand the site')

    fireEvent.click(screen.getByRole('tab', { name: 'BOQ Pro' }))
    expect(panel.querySelectorAll('[aria-current="true"]')).toHaveLength(1)
    expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain('Define scope and cost')

    fireEvent.click(screen.getByRole('tab', { name: 'BuildOS' }))
    expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain('Coordinate delivery')

    fireEvent.click(screen.getByRole('tab', { name: 'InvestFlow' }))
    expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain('Evaluate the commercial path')

    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain('Develop the scheme')
  })

  it('shows an evidence-state badge that updates per product', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByText('INDICATIVE').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('tab', { name: 'BuildOS' }))
    expect(screen.getAllByText('ROADMAP').length).toBeGreaterThan(0)
  })

  // CLICK-001-always-on-homepage-cockpit: the former 3D-mount gate
  // ("Load interactive preview" button, HeroPreviewPlaceholder) is
  // removed outright — the real cockpit chain mounts automatically, with
  // no second click/load action anywhere in the shell.
  it('renders the real cockpit automatically on first paint, with no load button anywhere', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getByTestId('cockpit').textContent).toBe('landintel:LandIntel')
    expect(screen.queryByRole('button', { name: /load interactive preview/i })).toBeNull()
    expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
    expect(screen.queryByText(/nothing 3D loads until you ask for it/i)).toBeNull()
  })

  it('mounts the newly selected product\'s real cockpit automatically on every tab switch, still with no load button', () => {
    render(<HomepageCockpitHero />)
    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('cockpit').textContent).toBe('designstudio:DesignStudio')
    expect(screen.queryByRole('button', { name: /load interactive preview/i })).toBeNull()
    expect(screen.queryByTestId('hero-preview-placeholder')).toBeNull()
  })

  it('renders all ten product tabs inside one non-wrapping tablist grid at the >=1366px breakpoint', () => {
    render(<HomepageCockpitHero />)
    const tablist = screen.getByRole('tablist', { name: 'Ferrum product cockpits' })
    expect(tablist.className).toMatch(/min-\[1366px\]:grid-cols-10/)
    // No horizontal-scroll classes on the >=1366px grid rail — the old
    // overflow-x-auto row was replaced entirely by the narrow-screen
    // listbox below; the grid rail itself never scrolled and still
    // doesn't.
    expect(tablist.className).not.toMatch(/overflow-x-auto/)
    expect(tablist.querySelectorAll('[role="tab"]')).toHaveLength(10)
  })

  it('requests the real cockpit chain (Space3D/WorkspaceCockpit) automatically for every one of the seven real-tool products, on selection alone', () => {
    render(<HomepageCockpitHero />)
    for (const product of productExperienceList) {
      if (product.tool.kind !== 'live-cockpit') continue
      fireEvent.click(screen.getByRole('tab', { name: product.label }))
      expect(screen.getByTestId('cockpit').textContent).toBe(`${product.id}:${product.label}`)
    }
  })

  describe('narrow-screen rail trigger + listbox', () => {
    it('is closed by default and opens the listbox on trigger click, showing all ten options with none using role="tab"', () => {
      render(<HomepageCockpitHero />)
      expect(screen.queryByRole('listbox')).toBeNull()

      const trigger = screen.getByRole('button', { name: /LandIntel/ })
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')

      fireEvent.click(trigger)

      expect(trigger.getAttribute('aria-expanded')).toBe('true')
      const listbox = screen.getByRole('listbox', { name: 'Ferrum product cockpits' })
      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(10)
      for (const option of options) {
        expect(option.getAttribute('role')).toBe('option')
      }
      expect(listbox.className).not.toMatch(/overflow-x-auto/)
    })

    it('closes on Escape and returns focus to the trigger', () => {
      render(<HomepageCockpitHero />)
      const trigger = screen.getByRole('button', { name: /LandIntel/ })
      fireEvent.click(trigger)
      expect(screen.getByRole('listbox')).toBeTruthy()

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(screen.queryByRole('listbox')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    })

    it('closes on selecting an option, and calls the same selectProduct handler (updates the active product)', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('button', { name: /LandIntel/ }))
      fireEvent.click(screen.getByRole('option', { name: 'DesignStudio' }))

      expect(screen.queryByRole('listbox')).toBeNull()
      expect(screen.getByRole('button', { name: /DesignStudio/ })).toBeTruthy()
      expect(screen.getByTestId('cockpit').textContent).toBe('designstudio:DesignStudio')
      const tabs = screen.getAllByRole('tab')
      expect(tabs.find((tab) => tab.textContent === 'DesignStudio')?.getAttribute('aria-selected')).toBe('true')
    })

    it('closes on click-outside', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('button', { name: /LandIntel/ }))
      expect(screen.getByRole('listbox')).toBeTruthy()

      fireEvent.mouseDown(document.body)

      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('every option is keyboard-reachable via roving tabindex (ArrowDown/ArrowUp/Home/End) and selectable with Enter', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('button', { name: /LandIntel/ }))

      const optionByName = (name: string) => screen.getByRole('option', { name })

      // Starts focused on the active option (LandIntel).
      expect(document.activeElement).toBe(optionByName('LandIntel'))

      fireEvent.keyDown(document, { key: 'ArrowDown' })
      expect(document.activeElement).toBe(optionByName('DesignStudio'))

      fireEvent.keyDown(document, { key: 'End' })
      expect(document.activeElement).toBe(optionByName('Transact'))

      fireEvent.keyDown(document, { key: 'Home' })
      expect(document.activeElement).toBe(optionByName('LandIntel'))

      fireEvent.keyDown(document, { key: 'ArrowUp' })
      expect(document.activeElement).toBe(optionByName('Transact'))

      fireEvent.keyDown(optionByName('Transact'), { key: 'Enter' })
      expect(screen.queryByRole('listbox')).toBeNull()
      expect(screen.getByRole('button', { name: /Transact/ })).toBeTruthy()
    })

    it('every one of the ten options has a min-h-11 (44px) touch target', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('button', { name: /LandIntel/ }))
      const trigger = screen.getByRole('button', { name: /LandIntel/ })
      expect(trigger.className).toMatch(/min-h-11/)
      for (const option of screen.getAllByRole('option')) {
        expect(option.className).toMatch(/min-h-11/)
      }
    })
  })

  // W2-500 productExperienceRegistry: one exhaustive pass over all ten
  // products, each individually, rather than spot-checking one or two —
  // covers lifecycle stage, persona/lens, tool-vs-roadmap rendering,
  // evidence badge, output-card content, and (for ROADMAP products) the
  // absence of any control implying live functionality.
  describe.each(productExperienceList)('product: $label', (product) => {
    it('emphasizes the correct journey row, shows the active product\'s persona under it, and the evidence badge', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      const panel = screen.getByLabelText('Project journey')
      expect(panel.querySelector('[aria-current="true"]')?.textContent).toContain(expectedRowTitleFor(product.id))

      const activeProductLine = document.querySelector('[data-journey-row-active-product]')
      expect(activeProductLine?.textContent).toContain(product.label)
      expect(activeProductLine?.textContent).toContain(product.persona)

      const badges = screen.getAllByText(product.evidenceState)
      expect(badges.length).toBeGreaterThan(0)
    })

    it(ROADMAP_IDS.has(product.id)
      ? 'renders the honest roadmap state, never the real interactive cockpit — even after clicking the tab again'
      : 'renders the real cockpit chain automatically on selection, with no load gate', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      if (ROADMAP_IDS.has(product.id)) {
        expect(screen.getByTestId('hero-roadmap-preview')).toBeTruthy()
        expect(screen.queryByRole('button', { name: /load interactive preview/i })).toBeNull()
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
        expect(screen.getByTestId('cockpit').textContent).toBe(`${product.id}:${product.label}`)
        expect(screen.queryByTestId('hero-roadmap-preview')).toBeNull()
        expect(screen.queryByRole('button', { name: /load interactive preview/i })).toBeNull()
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
      // would trigger.
      fireEvent.click(tab)
      expect(tab.getAttribute('aria-selected')).toBe('true')
      expect(screen.getByLabelText('Project journey').querySelector('[aria-current="true"]')?.textContent).toContain(expectedRowTitleFor(product.id))
    })
  })

  // PRODUCT-ISOLATION-001-selected-product-only.
  describe('product isolation', () => {
    const panelMarkerFor: Record<string, string> = {
      landintel: 'ulpin-map-explorer',
      designstudio: 'stepped-forecast-module',
      structura: 'stepped-forecast-module',
      'boq-pro': 'stepped-forecast-module',
      promarket: 'stepped-forecast-module',
      investflow: 'stepped-forecast-module',
      transact: 'stamp-duty-estimator',
    }

    it.each(Object.entries(panelMarkerFor))('shows only %s\'s own real primary panel, and none of the other panel types', (productId, expectedTestId) => {
      render(<HomepageCockpitHero />)
      const product = productExperienceList.find((item) => item.id === productId)!
      fireEvent.click(screen.getByRole('tab', { name: product.label }))

      const container = screen.getByTestId('cockpit-children')
      expect(container.querySelector(`[data-testid="${expectedTestId}"]`), `${productId} should render ${expectedTestId}`).toBeTruthy()
      for (const otherTestId of ALL_PANEL_TESTIDS) {
        if (otherTestId === expectedTestId) continue
        expect(container.querySelector(`[data-testid="${otherTestId}"]`), `${productId} should not render ${otherTestId}`).toBeNull()
      }
    })

    it('the SteppedForecastModule variant passed matches the active product exactly (DesignStudio\'s massing forecast never leaks into LandIntel/BOQ Pro/etc.)', () => {
      render(<HomepageCockpitHero />)
      for (const productId of ['designstudio', 'structura', 'boq-pro', 'promarket', 'investflow']) {
        const product = productExperienceList.find((item) => item.id === productId)!
        fireEvent.click(screen.getByRole('tab', { name: product.label }))
        const forecastModule = screen.getByTestId('stepped-forecast-module')
        expect(forecastModule.getAttribute('data-product')).toBe(productId)
      }
    })

    it('switching products atomically replaces the primary panel -- no stale prior-product panel remains visible', () => {
      render(<HomepageCockpitHero />)
      fireEvent.click(screen.getByRole('tab', { name: 'LandIntel' }))
      expect(screen.getByTestId('ulpin-map-explorer')).toBeTruthy()

      fireEvent.click(screen.getByRole('tab', { name: 'Transact' }))
      expect(screen.queryByTestId('ulpin-map-explorer')).toBeNull()
      expect(screen.getByTestId('stamp-duty-estimator')).toBeTruthy()

      fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
      expect(screen.queryByTestId('stamp-duty-estimator')).toBeNull()
      expect(screen.getByTestId('stepped-forecast-module').getAttribute('data-product')).toBe('designstudio')
    })

    it('ROADMAP products (BuildOS, ProcureHub, CommunityBuild) render none of the live-cockpit primary panels -- only the honest roadmap state', () => {
      render(<HomepageCockpitHero />)
      for (const productId of Array.from(ROADMAP_IDS)) {
        const product = productExperienceList.find((item) => item.id === productId)!
        fireEvent.click(screen.getByRole('tab', { name: product.label }))
        expect(screen.getByTestId('hero-roadmap-preview')).toBeTruthy()
        for (const testId of ALL_PANEL_TESTIDS) {
          expect(screen.queryByTestId(testId), `${productId} should not render ${testId}`).toBeNull()
        }
        expect(screen.queryByTestId('cockpit')).toBeNull()
      }
    })
  })
})
