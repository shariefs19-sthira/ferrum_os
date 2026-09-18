import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomepageJourney, { type HomepageJourneyStep } from './HomepageJourney'

const steps: HomepageJourneyStep[] = [
  {
    id: 'land',
    title: 'Look up your land',
    summary: 'Find the parcel.',
    productLabel: 'LandIntel',
    productHref: '/products/landintel',
    features: [{ title: 'ULPIN lookup', body: 'Seeded lookup details.', availability: 'AVAILABLE' }],
  },
  {
    id: 'design',
    title: 'Develop the scheme',
    summary: 'Create the massing.',
    productLabel: 'DesignStudio',
    productHref: '/products/designstudio',
    features: [{ title: 'AI plans', body: 'Not connected yet.', availability: 'ROADMAP' }],
  },
]

function motionPreference(reduce: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
}

describe('HomepageJourney', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows synchronized product detail and changes it on a timed cycle', () => {
    vi.useFakeTimers()
    motionPreference(false)
    render(<HomepageJourney items={steps} intervalMs={1000} />)

    expect(screen.getByRole('heading', { name: 'LandIntel' })).toBeTruthy()
    expect(screen.getByText('ULPIN lookup')).toBeTruthy()

    act(() => vi.advanceTimersByTime(1000))

    expect(screen.getByRole('heading', { name: 'DesignStudio' })).toBeTruthy()
    expect(screen.getByText('AI plans')).toBeTruthy()
    expect(screen.getAllByText('ROADMAP').length).toBeGreaterThan(0)
  })

  it('lets the user select a step and exposes the matching product route', () => {
    motionPreference(false)
    render(<HomepageJourney items={steps} />)

    fireEvent.click(screen.getByRole('tab', { name: /DesignStudio/ }))

    expect(screen.getByRole('tab', { name: /DesignStudio/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('link', { name: 'Explore DesignStudio' }).getAttribute('href')).toBe('/products/designstudio')
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('journey-tab-design')
  })

  it('does not auto-advance when reduced motion is preferred', () => {
    vi.useFakeTimers()
    motionPreference(true)
    render(<HomepageJourney items={steps} intervalMs={1000} />)

    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByRole('heading', { name: 'LandIntel' })).toBeTruthy()
    expect(screen.getByText(/disabled by your motion preference/i)).toBeTruthy()
  })
})
