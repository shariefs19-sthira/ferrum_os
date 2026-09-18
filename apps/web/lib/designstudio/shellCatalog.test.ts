import { describe, expect, it } from 'vitest'
import { buildingShellCatalog, recommendBuildingShells } from './shellCatalog'
import type { ParcelContext } from '../workspace/parcelContext'

const parcel = (state: string, district: string, area_sqm = 500, land_use = 'Residential'): ParcelContext => ({
  version: 1,
  method: 'test',
  ulpin: null,
  state,
  district,
  area_sqm,
  land_use,
  coordinates: null,
  provenance: { source: 'test fixture', vintage: '2026-09-19', status: 'INDICATIVE' },
})

describe('regional building-shell catalogue', () => {
  it.each([
    ['Kerala', 'Ernakulam', 'kerala-courtyard'],
    ['Goa', 'North Goa', 'goa-indo-portuguese'],
    ['Assam', 'Kamrup', 'assam-raised'],
    ['Ladakh', 'Leh', 'ladakh-solar'],
  ])('ranks the regional study for %s', (state, district, expected) => {
    expect(recommendBuildingShells(parcel(state, district))[0].shell.id).toBe(expected)
  })

  it('fails to the neutral shell when there is no parcel context', () => {
    const result = recommendBuildingShells(null)[0]
    expect(result.shell.id).toBe('india-neutral-adaptive')
    expect(result.unknowns[0]).toContain('No locked LandIntel parcel')
  })

  it('keeps every shell indicative and records the non-copying boundary', () => {
    expect(buildingShellCatalog.length).toBeGreaterThanOrEqual(10)
    expect(buildingShellCatalog.every((shell) => shell.provenance.status === 'INDICATIVE')).toBe(true)
    expect(buildingShellCatalog.every((shell) => shell.provenance.copyrightBoundary.includes('no architect project geometry'))).toBe(true)
  })
})
