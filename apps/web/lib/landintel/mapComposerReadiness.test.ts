import { describe, expect, it } from 'vitest'
import { buildActiveLayers, evaluateMapComposerReadiness, summarizeReadiness } from './mapComposerReadiness'
import { emptyMapComposerMetadata, type MapComposerMetadata } from './mapComposerState'
import type { ParcelContext } from '../workspace/parcelContext'

const validMetadata: MapComposerMetadata = {
  ...emptyMapComposerMetadata,
  title: 'Whitefield pre-purchase suitability map',
  purpose: 'Evaluate parcel suitability before purchase decision',
  crs: 'EPSG:4326',
  author: 'Jordan Lee',
  issueDate: '2026-09-01',
  revision: 'Rev A',
  layers: [{ id: 'l1', name: 'Survey overlay', source: 'District survey office', observationDate: '2026-08-01', editable: true }],
}

const seededParcel: ParcelContext = {
  version: 1,
  method: 'ulpin',
  ulpin: 'KA-BLR-0001-2024',
  state: 'Karnataka',
  district: 'Bengaluru Urban',
  area_sqm: 1500,
  land_use: 'Commercial',
  coordinates: { lat: 12.9716, lng: 77.5946 },
  provenance: { source: 'Ferrum seeded D1 ULPIN record', vintage: '2026-09-10', status: 'INDICATIVE' },
}

const gapParcel: ParcelContext = {
  version: 1,
  method: 'coordinates',
  ulpin: null,
  state: 'GAP',
  district: 'GAP',
  area_sqm: 0,
  land_use: 'GAP',
  coordinates: { lat: 12.9, lng: 77.5 },
  provenance: { source: 'User-entered coordinates', vintage: '2026-09-16', status: 'GAP' },
}

describe('evaluateMapComposerReadiness', () => {
  it('returns all 11 canonical checks in canonical order', () => {
    const checks = evaluateMapComposerReadiness(emptyMapComposerMetadata, null)
    expect(checks).toHaveLength(11)
    expect(checks.map((c) => c.id)).toEqual([
      'purpose-subject', 'project-boundary', 'scale-units', 'north-orientation', 'crs-epsg',
      'source-dates', 'active-layer-legend', 'locator-inset', 'label-collisions',
      'confidence-unknown', 'indicative-status',
    ])
  })

  it('blocks every check with no context and no metadata', () => {
    const summary = summarizeReadiness(evaluateMapComposerReadiness(emptyMapComposerMetadata, null))
    expect(summary).toEqual({ passed: 0, total: 11, blocked: true })
  })

  it('never passes project-boundary or label-collisions, even with fully valid metadata and a real parcel', () => {
    const checks = evaluateMapComposerReadiness({ ...validMetadata, indicativeAcknowledged: true }, seededParcel)
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]))
    expect(byId['project-boundary'].passed).toBe(false)
    expect(byId['label-collisions'].passed).toBe(false)
    expect(summarizeReadiness(checks).blocked).toBe(true)
  })

  it('passes format/geometry-backed checks once real evidence and valid metadata exist', () => {
    const checks = evaluateMapComposerReadiness({ ...validMetadata, indicativeAcknowledged: true }, seededParcel)
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]))
    expect(byId['purpose-subject'].passed).toBe(true)
    expect(byId['crs-epsg'].passed).toBe(true)
    expect(byId['scale-units'].passed).toBe(true)
    expect(byId['north-orientation'].passed).toBe(true)
    expect(byId['source-dates'].passed).toBe(true)
    expect(byId['active-layer-legend'].passed).toBe(true)
    expect(byId['confidence-unknown'].passed).toBe(true)
    expect(byId['indicative-status'].passed).toBe(true)
  })

  it('rejects a future observation date and an unacknowledged future issue date', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const checks = evaluateMapComposerReadiness({ ...validMetadata, issueDate: future }, seededParcel)
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]))
    expect(byId['source-dates'].passed).toBe(false)
  })

  it('treats a GAP location as missing provenance for geometry and boundary checks', () => {
    const checks = evaluateMapComposerReadiness(validMetadata, gapParcel)
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]))
    expect(byId['scale-units'].passed).toBe(false)
    expect(byId['project-boundary'].passed).toBe(false)
    expect(byId['locator-inset'].reason).toMatch(/Regional context is not established/)
  })

  it('requires an INDICATIVE acknowledgment before that check passes, but does not require it when nothing is loaded', () => {
    const noParcel = evaluateMapComposerReadiness(validMetadata, null)
    expect(noParcel.find((c) => c.id === 'indicative-status')?.passed).toBe(false)
    const unacknowledged = evaluateMapComposerReadiness(validMetadata, seededParcel)
    expect(unacknowledged.find((c) => c.id === 'indicative-status')?.passed).toBe(false)
    const acknowledged = evaluateMapComposerReadiness({ ...validMetadata, indicativeAcknowledged: true }, seededParcel)
    expect(acknowledged.find((c) => c.id === 'indicative-status')?.passed).toBe(true)
  })
})

describe('buildActiveLayers', () => {
  it('prepends a read-only layer derived from the loaded parcel context', () => {
    const layers = buildActiveLayers(emptyMapComposerMetadata, seededParcel)
    expect(layers[0]).toMatchObject({ id: 'parcel-context', editable: false, source: seededParcel.provenance.source })
  })

  it('returns only user-added layers when no parcel is loaded', () => {
    const layers = buildActiveLayers(validMetadata, null)
    expect(layers).toEqual(validMetadata.layers)
  })
})
