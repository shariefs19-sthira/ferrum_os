import { beforeEach, describe, expect, it } from 'vitest'
import { PARCEL_CONTEXT_KEY, readParcelContext, writeParcelContext, type ParcelContext } from './parcelContext'

const context: ParcelContext = {
  version: 1,
  method: 'ulpin',
  ulpin: 'TN-CHN-0003-2024',
  state: 'Tamil Nadu',
  district: 'Chennai',
  area_sqm: 1200,
  land_use: 'Residential',
  coordinates: null,
  provenance: { source: 'Ferrum seeded D1 ULPIN record', vintage: '2026-09-10', status: 'INDICATIVE' },
}

describe('parcel context', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips one shared resolved context', () => {
    writeParcelContext(context)
    expect(readParcelContext()).toEqual(context)
  })

  it('rejects malformed storage and preserves a location-only GAP context', () => {
    localStorage.setItem(PARCEL_CONTEXT_KEY, JSON.stringify({ version: 1, area_sqm: -1 }))
    expect(readParcelContext()).toBeNull()
    const locationOnly = { ...context, ulpin: null, state: 'GAP', district: 'Coordinate-only location', area_sqm: 0, land_use: 'GAP', coordinates: { lat: 12.9716, lng: 77.5946 }, provenance: { source: 'User-entered coordinates', vintage: '2026-09-16', status: 'GAP' as const } }
    writeParcelContext(locationOnly)
    expect(readParcelContext()).toEqual(locationOnly)
  })
})
