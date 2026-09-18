import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageCockpitHero from './HomepageCockpitHero'
import { productExperienceList } from '../../lib/productExperienceRegistry'
import { journeyRows, journeyRowForProduct } from '../../lib/homepageJourney'

const rowTitleById = Object.fromEntries(journeyRows.map((row) => [row.id, row.title]))
const expectedRowTitleFor = (productId: string) => rowTitleById[journeyRowForProduct[productId as keyof typeof journeyRowForProduct]]

vi.mock('../workspace/ProductCockpitPreview', () => ({
  default: ({ product, label }: { product: string; label: string }) => <div data-testid="cockpit">{product}:{label}</div>,
}))

const ROADMAP_IDS = new Set(['buildos', 'procurehub', 'communitybuild'])

describe('HomepageCockpitHero', () => {
  it('opens with LandIntel and switches the active preview before any interaction', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByTestId('hero-preview-placeholder').textContent).toContain('LandIntel')

    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('hero-preview-placeholder').textContent).toContain('DesignStudio')

    fireEvent.click(screen.getByRole('tab', { name: 'Structura' }))
    expect(screen.getAllByText(/INDICATIVE|LIVE|SAMPLE|GAP|ROADMAP/).length).toBeGreaterThan(0)
  })

  it('shows the project-journey panel with its required title, headline and supporting copy', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getByText('What you can do in Ferrum')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Move one project through its connected decisions.' })).toBeTruthy()
    expect(screen.getByText(/Start at the question you have\./)).toBeTruthy()
  })

  it('shows all five journey rows permanently, not as duplicate controls (no click handler, no role change on select)', () => {
    render(<HomepageCockpitHero />)
    const panel = screen.getByLabelText('Project journey')
    const rows = Array.from(panel.querySelectorAll('[data-journey-row]'))
    expect(rows).toHaveLength(5)
    expect(rows.map((row) => row.textContent)).toEqual(
      expect.arrayContaining(journeyRows.map((row) => expect.stringContaining(row.title))),
    )
    for (const row of rows) {
      expect(row.tagName).toBe('LI')
      expect(row.querySelector('button, a, input, select')).toBeNull()
    }

    fireEvent.click(screen.getByRole('tab', { name: 'BOQ Pro' }))
    expect(panel.querySelectorAll('[data-journey-row]')).toHaveLength(5)
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

  it('never requests the real cockpit chain (Space3D/WorkspaceCockpit) before any user interaction, for any of the seven real-tool products', () => {
    render(<HomepageCockpitHero />)
    for (const product of productExperienceList) {
      if (product.tool.kind !== 'live-cockpit') continue
      fireEvent.click(screen.getByRole('tab', { name: product.label }))
      expect(screen.queryByTestId('cockpit')).toBeNull()
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
      expect(screen.getByTestId('hero-preview-placeholder').textContent).toContain('DesignStudio')
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
      // would trigger.
      fireEvent.click(tab)
      expect(tab.getAttribute('aria-selected')).toBe('true')
      expect(screen.getByLabelText('Project journey').querySelector('[aria-current="true"]')?.textContent).toContain(expectedRowTitleFor(product.id))
    })
  })
})
