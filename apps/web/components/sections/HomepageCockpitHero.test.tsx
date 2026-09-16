import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import HomepageCockpitHero from './HomepageCockpitHero'

vi.mock('../workspace/ProductCockpitPreview', () => ({
  default: ({ product, label }: { product: string; label: string }) => <div data-testid="cockpit">{product}:{label}</div>,
}))

describe('HomepageCockpitHero', () => {
  it('opens with LandIntel and switches the real cockpit target', () => {
    render(<HomepageCockpitHero />)
    expect(screen.getAllByRole('tab')).toHaveLength(10)
    expect(screen.getByTestId('cockpit').textContent).toBe('landintel:LandIntel')
    expect(screen.getByRole('link', { name: 'Open LandIntel cockpit' }).getAttribute('href')).toBe('/products/landintel')

    fireEvent.click(screen.getByRole('tab', { name: 'DesignStudio' }))
    expect(screen.getByTestId('cockpit').textContent).toBe('designstudio:DesignStudio')
    expect(screen.getByRole('link', { name: 'Open DesignStudio cockpit' }).getAttribute('href')).toBe('/products/designstudio')

    fireEvent.click(screen.getByRole('tab', { name: 'Structura' }))
    expect(screen.getByTestId('cockpit').textContent).toBe('structura:Structura')
    expect(screen.getByText(/live, sample, indicative, gap or roadmap/i)).toBeTruthy()
  })
})
