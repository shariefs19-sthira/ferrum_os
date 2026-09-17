import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageCockpitHero from './HomepageCockpitHero'

vi.mock('../workspace/ProductCockpitPreview', () => ({
  default: ({ product, label }: { product: string; label: string }) => <div data-testid="cockpit">{product}:{label}</div>,
}))

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
})
