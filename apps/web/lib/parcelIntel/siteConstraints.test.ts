import { describe, expect, it } from 'vitest'
import { getSiteConstraintsEvidence } from './siteConstraints'

describe('site constraints evidence contract', () => {
  it('keeps authority values GAP while exposing official Pune source candidates', () => {
    const evidence = getSiteConstraintsEvidence({
      version: 1,
      method: 'ulpin',
      ulpin: 'MH-PUN-0002-2024',
      state: 'Maharashtra',
      district: 'Pune',
      area_sqm: 1200,
      land_use: 'Residential',
      coordinates: { lat: 18.5208, lng: 73.8551 },
      provenance: { source: 'Seeded record', vintage: '2026-09-16', status: 'INDICATIVE' },
    })

    expect(evidence.locationLabel).toBe('Pune, Maharashtra')
    expect(evidence.status).toBe('GAP')
    expect(evidence.planningAuthority).toBeNull()
    expect(evidence.clause).toBeNull()
    expect(evidence.sources).toHaveLength(2)
    expect(evidence.sources.every((source) => source.status === 'GAP')).toBe(true)
  })
})
