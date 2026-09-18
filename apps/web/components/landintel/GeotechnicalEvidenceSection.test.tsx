import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import GeotechnicalEvidenceSection from './GeotechnicalEvidenceSection'
import { writeParcelContext, type ParcelContext } from '../../lib/workspace/parcelContext'

const parcelContext = (overrides: Partial<ParcelContext> = {}): ParcelContext => ({
  version: 1, method: 'ulpin', ulpin: 'KA-BLR-0001-2024', state: 'Karnataka', district: 'Bengaluru Urban',
  area_sqm: 1200, land_use: 'Residential', coordinates: { lat: 12.97, lng: 77.59 },
  provenance: { source: 'Seeded D1 record', vintage: '2026-09-18', status: 'INDICATIVE' },
  ...overrides,
})

/**
 * Integration test for the actual composition wired into
 * app/products/landintel/page.tsx's Land theme tab -- this mounts the real
 * GeotechnicalEvidenceSection (no mocked useParcelContext, no manually
 * supplied generatedFor prop) to prove the live mount path: the section
 * captures whatever site is active AT MOUNT as its persisted generatedFor,
 * and a later live parcel swap (the real writeParcelContext(), as any
 * other part of the app would call it) is what the legend detects as
 * stale -- not a prop the test hands the component directly.
 */
describe('GeotechnicalEvidenceSection (live mount path)', () => {
  beforeEach(() => localStorage.clear())

  it('renders both the intelligence panel and the map-layer legend', () => {
    render(<GeotechnicalEvidenceSection />)
    expect(screen.getByText('Ground conditions, with evidence limits visible')).toBeTruthy()
    expect(screen.getByText('Every item is categorised, not drawn')).toBeTruthy()
  })

  it('captures the site active at mount as generatedFor, and does NOT go stale while that site stays active', () => {
    writeParcelContext(parcelContext())
    render(<GeotechnicalEvidenceSection />)
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')
  })

  it('a real parcel swap after mount (via writeParcelContext, not a prop) makes the legend re-render as stale', () => {
    writeParcelContext(parcelContext({ ulpin: 'KA-BLR-0001-2024', district: 'Bengaluru Urban' }))
    const { rerender } = render(<GeotechnicalEvidenceSection />)
    // Before any swap: the default screening's 20 topics all sit in
    // UNKNOWN_GAP (no source connected), none in Stale.
    expect(screen.getByText('UNKNOWN gap').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('20')
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')

    // Simulate the user resolving a different site elsewhere in the app
    // (e.g. UlpinMapExplorer's own commit()) while this section stays
    // mounted -- this is the live mount path the prior isolated-component
    // test could not exercise, because it supplied generatedFor directly
    // rather than letting the section capture it from a real mount.
    writeParcelContext(parcelContext({ ulpin: 'MH-PUN-0002-2024', district: 'Pune', state: 'Maharashtra' }))
    rerender(<GeotechnicalEvidenceSection />)

    // generatedFor was captured ONCE at mount (Bengaluru) and never
    // recomputed -- so it still differs from the now-active Pune context,
    // and every previously-UNKNOWN_GAP item reclassifies to Stale.
    expect(screen.getByText('UNKNOWN gap').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('0')
    expect(screen.getByText('Stale').parentElement!.querySelector('[data-map-layer-count]')!.textContent).toBe('20')
  })
})
