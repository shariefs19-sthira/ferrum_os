import { describe, expect, it } from 'vitest'
import {
  classifyObservation, effectiveConfidence, gateStatuses, lengthLabel, missingEvidence, offsetMetres, siteModules,
  siteTopics, synthesize, topicsForModule, validateObservation, type SiteObservation,
} from './siteAnalysis'
import { compassLabel, computeSunGeometry } from './siteSolar'
import {
  buildHandoff, emptyStore, handoffStatus, observationsFor, reviewFor, withHandoff, withObservations, withReview,
} from './siteAnalysisStore'
import type { ParcelContext } from '../workspace/parcelContext'

const NOW = '2026-09-19'
const KEY = 'parcel-a'

function observation(patch: Partial<SiteObservation> = {}): SiteObservation {
  return {
    id: 'obs-1', parcelKey: KEY, module: 'climate', topic: 'wind', basis: 'OBSERVED', confidence: 'HIGH',
    observedOn: '2026-09-10', observer: 'A. Surveyor', sourceRef: 'Field sheet FS-12',
    location: { lat: 12.9762, lng: 77.5896 }, locationSource: 'ENTERED', bearingDeg: 225,
    note: 'Steady breeze from the south-west during the visit.', createdAt: '2026-09-10T08:00:00.000Z', ...patch,
  }
}

const parcel: ParcelContext = {
  version: 1, method: 'map', ulpin: null, state: 'Karnataka', district: 'Bengaluru Urban', area_sqm: 1200, land_use: 'Residential',
  coordinates: { lat: 12.9762, lng: 77.5896 }, provenance: { source: 'Map pin', vintage: '2026-09-19', status: 'INDICATIVE' },
}

describe('site analysis model coverage', () => {
  it('defines all five modules with the required topics', () => {
    expect(siteModules.map((module) => module.id)).toEqual(['climate', 'physical', 'urban', 'infrastructure', 'cultural'])
    const ids = siteTopics.map((topic) => topic.id)
    for (const required of ['regional-climate', 'site-climate', 'sun-orientation', 'shadow', 'wind', 'microclimate', 'terrain-contours', 'soil-logs', 'hydrology', 'trees-ecology', 'adjacent-buildings', 'statutory-envelope', 'views-privacy', 'noise', 'pedestrian-entry', 'vehicle-entry', 'service-entry', 'roads-transit', 'water', 'power', 'gas', 'telecom', 'sewer', 'rights-of-way', 'heritage', 'archaeology', 'community-use']) {
      expect(ids).toContain(required)
    }
    expect(new Set(ids).size).toBe(ids.length)
    for (const item of siteModules) expect(topicsForModule(item.id).length).toBeGreaterThan(0)
  })

  it('every topic states the connector it still needs, so nothing reads as automated', () => {
    for (const topic of siteTopics) expect(topic.pendingConnector.length).toBeGreaterThan(10)
  })
})

describe('observation validation', () => {
  it('accepts a complete on-site observation', () => {
    expect(validateObservation(observation(), NOW)).toEqual([])
  })

  it('requires observer, source reference and a real, non-future date', () => {
    const fields = validateObservation(observation({ observer: ' ', sourceRef: '', observedOn: '2026-09-20' }), NOW).map((issue) => issue.field)
    expect(fields).toEqual(expect.arrayContaining(['observer', 'sourceRef', 'observedOn']))
    expect(validateObservation(observation({ observedOn: '2026-02-30' }), NOW).some((issue) => issue.field === 'observedOn')).toBe(true)
  })

  it('requires a location for point and directional topics but not document topics', () => {
    expect(validateObservation(observation({ location: null }), NOW).some((issue) => issue.field === 'location')).toBe(true)
    const doc = observation({ module: 'urban', topic: 'statutory-envelope', basis: 'USER_PROVIDED', location: null, locationSource: null, bearingDeg: null, note: 'Setback table read from the cited drawing.' })
    expect(validateObservation(doc, NOW)).toEqual([])
  })

  it('rejects out-of-range coordinates and bearings', () => {
    const fields = validateObservation(observation({ location: { lat: 91, lng: 181 }, bearingDeg: 360 }), NOW).map((issue) => issue.field)
    expect(fields).toEqual(expect.arrayContaining(['location.lat', 'location.lng', 'bearingDeg']))
  })

  it('blocks a document topic from being recorded as OBSERVED on site', () => {
    const issues = validateObservation(observation({ module: 'cultural', topic: 'heritage', basis: 'OBSERVED', location: null, locationSource: null, bearingDeg: null }), NOW)
    expect(issues.some((issue) => issue.field === 'basis')).toBe(true)
  })

  it('does not open a second capture path for soil logs', () => {
    const issues = validateObservation(observation({ module: 'physical', topic: 'soil-logs', basis: 'USER_PROVIDED', location: null, locationSource: null, bearingDeg: null }), NOW)
    expect(issues.some((issue) => issue.field === 'topic' && issue.message.includes('Geotechnical observation intake'))).toBe(true)
  })

  it.each([
    'Bearing capacity looks fine here.',
    'Foundation suitability confirmed.',
    'The legal boundary follows the wall.',
    'Title is clear.',
    'The setback complies with the code.',
    'Approved by the ward office.',
    'No heritage on this plot.',
    'Not protected by any authority.',
    'Heritage cleared.',
    'Safe to build here.',
  ])('rejects the conclusion %s', (note) => {
    expect(validateObservation(observation({ note }), NOW).some((issue) => issue.field === 'note')).toBe(true)
  })
})

describe('confidence and false-promotion guards', () => {
  it('caps INFERRED and USER_PROVIDED confidence at MEDIUM', () => {
    expect(effectiveConfidence({ basis: 'INFERRED', confidence: 'HIGH', topic: 'wind' })).toBe('MEDIUM')
    expect(effectiveConfidence({ basis: 'USER_PROVIDED', confidence: 'HIGH', topic: 'wind' })).toBe('MEDIUM')
    expect(effectiveConfidence({ basis: 'OBSERVED', confidence: 'HIGH', topic: 'wind' })).toBe('HIGH')
  })

  it('caps even an observed record at MEDIUM when the topic still needs an authority or survey gate', () => {
    expect(effectiveConfidence({ basis: 'OBSERVED', confidence: 'HIGH', topic: 'power' })).toBe('MEDIUM')
  })

  it('never produces a verified state from any input', () => {
    for (const basis of ['OBSERVED', 'INFERRED', 'USER_PROVIDED'] as const) {
      const state = classifyObservation(observation({ basis }), NOW).state
      expect(['OBSERVED', 'INFERRED', 'USER_PROVIDED']).toContain(state)
      expect(state).not.toMatch(/VERIFIED/)
    }
  })

  it('holds inferred, stale, invalid and low-confidence records back from design', () => {
    expect(classifyObservation(observation({ basis: 'INFERRED' }), NOW).heldBackReason).toMatch(/inference/i)
    expect(classifyObservation(observation({ observedOn: '2024-01-01' }), NOW)).toMatchObject({ state: 'STALE' })
    expect(classifyObservation(observation({ observer: '' }), NOW)).toMatchObject({ state: 'INVALID' })
    expect(classifyObservation(observation({ confidence: 'LOW' }), NOW).heldBackReason).toMatch(/low confidence/i)
    expect(classifyObservation(observation(), NOW).heldBackReason).toBeNull()
  })

  it('does not let a stale or inferred record turn an empty slot into an observed one', () => {
    const synthesis = synthesize(KEY, [observation({ basis: 'INFERRED' })], NOW, true)
    const wind = synthesis.modules[0].slots.find((slot) => slot.topic.id === 'wind')
    expect(wind?.state).toBe('INFERRED')
    expect(synthesis.qualified).toHaveLength(0)
  })
})

describe('synthesis, missing evidence and gates', () => {
  it('reports every topic as GAP when nothing is recorded', () => {
    const synthesis = synthesize(KEY, [], NOW, true)
    expect(synthesis.modules.flatMap((item) => item.slots).every((slot) => slot.state === 'GAP')).toBe(true)
    expect(synthesis.missing).toHaveLength(siteTopics.length)
    expect(synthesis.designRecommendation).toBe('NOT_PRODUCED')
  })

  it('marks sun orientation computed-only rather than covered when only geometry exists', () => {
    const synthesis = synthesize(KEY, [], NOW, true)
    const sun = missingEvidence(synthesis.modules[0].slots).find((item) => item.topicId === 'sun-orientation')
    expect(sun?.reason).toMatch(/computed geometry only/)
  })

  it('removes a topic from the missing list only once a qualified record exists', () => {
    const synthesis = synthesize(KEY, [observation()], NOW, true)
    expect(synthesis.missing.some((item) => item.topicId === 'wind')).toBe(false)
    expect(synthesis.modules[0].qualified).toBe(1)
    expect(synthesize(KEY, [observation({ confidence: 'LOW' })], NOW, true).missing.some((item) => item.topicId === 'wind')).toBe(true)
  })

  it('points soil logs at the existing intake instead of a second path', () => {
    const missing = synthesize(KEY, [], NOW, true).missing.find((item) => item.topicId === 'soil-logs')
    expect(missing?.reason).toMatch(/Geotechnical observation intake/)
  })

  it('leaves all four professional gates OPEN regardless of evidence', () => {
    const synthesis = synthesize(KEY, [observation()], NOW, true)
    expect(gateStatuses(synthesis.modules.flatMap((item) => item.slots)).map((item) => item.status)).toEqual(['OPEN', 'OPEN', 'OPEN', 'OPEN'])
    expect(synthesis.gates.map((item) => item.gate.id)).toEqual(['site-visit', 'survey', 'geotechnical', 'authority'])
  })

  it('changes the snapshot hash when any evidence changes', () => {
    const base = synthesize(KEY, [observation()], NOW, true).snapshotHash
    expect(synthesize(KEY, [observation({ note: 'Different note.' })], NOW, true).snapshotHash).not.toBe(base)
    expect(synthesize('parcel-b', [observation()], NOW, true).snapshotHash).not.toBe(base)
    expect(synthesize(KEY, [observation()], NOW, true).snapshotHash).toBe(base)
  })

  it('changes the snapshot when a record ages into STALE', () => {
    const record = observation({ observedOn: '2025-09-19' })
    expect(synthesize(KEY, [record], '2026-09-19', true).snapshotHash).not.toBe(synthesize(KEY, [record], '2026-09-21', true).snapshotHash)
  })
})

describe('sun geometry', () => {
  it('matches the closed-form sunrise azimuth for the Bengaluru reference latitude', () => {
    const events = computeSunGeometry(12.9762)
    expect(events).not.toBeNull()
    const june = events!.find((event) => event.id === 'june-solstice')!
    const december = events!.find((event) => event.id === 'december-solstice')!
    const march = events!.find((event) => event.id === 'march-equinox')!
    expect(march.sunriseAzimuthDeg).toBeCloseTo(90, 5)
    expect(june.sunriseAzimuthDeg).toBeCloseTo(65.9, 1)
    expect(june.sunsetAzimuthDeg).toBeCloseTo(294.1, 1)
    expect(december.sunriseAzimuthDeg).toBeCloseTo(114.1, 1)
    expect(june.noonAltitudeDeg).toBeCloseTo(79.54, 1)
    expect(june.noonBearing).toBe('N')
    expect(december.noonAltitudeDeg).toBeCloseTo(53.58, 1)
    expect(december.noonBearing).toBe('S')
  })

  it('returns no sunrise azimuth where the sun does not rise, and rejects invalid latitude', () => {
    const arctic = computeSunGeometry(80)!.find((event) => event.id === 'december-solstice')!
    expect(arctic.sunriseAzimuthDeg).toBeNull()
    expect(computeSunGeometry(Number.NaN)).toBeNull()
    expect(computeSunGeometry(91)).toBeNull()
  })

  it('labels compass bearings', () => {
    expect(compassLabel(0)).toBe('N')
    expect(compassLabel(225)).toBe('SW')
    expect(compassLabel(359)).toBe('N')
  })
})

describe('geometry helpers', () => {
  it('converts a coordinate offset to metres east/north', () => {
    const offset = offsetMetres({ lat: 12.9762, lng: 77.5896 }, { lat: 12.9772, lng: 77.5906 })
    expect(offset.north).toBeCloseTo(111.32, 1)
    expect(offset.east).toBeCloseTo(108.5, 0)
  })

  it('shows both unit systems using the exact foot constant', () => {
    expect(lengthLabel(100)).toBe('100 m / 328 ft')
    expect(lengthLabel(50)).toBe('50 m / 164 ft')
  })
})

describe('store, review and handoff staleness', () => {
  it('drops the review whenever the evidence changes', () => {
    let store = withObservations(emptyStore(), KEY, [observation()])
    store = withReview(store, KEY, { snapshotHash: 'abc', reviewedAt: NOW, reviewer: 'R' })
    expect(reviewFor(store, KEY)).not.toBeNull()
    store = withObservations(store, KEY, [observation(), observation({ id: 'obs-2' })])
    expect(reviewFor(store, KEY)).toBeNull()
    expect(observationsFor(store, KEY)).toHaveLength(2)
  })

  it('carries only qualified records, the missing list and OPEN gates into a handoff, with no recommendation or boundary', () => {
    const synthesis = synthesize(KEY, [observation(), observation({ id: 'obs-2', basis: 'INFERRED' })], NOW, true)
    const handoff = buildHandoff({
      parcel, review: { snapshotHash: synthesis.snapshotHash, reviewedAt: NOW, reviewer: 'R' }, qualified: synthesis.qualified,
      heldBackCount: synthesis.heldBack.length, missing: synthesis.missing.map(({ topicId, label, reason }) => ({ topicId, label, reason })),
      gates: synthesis.gates.map((item) => ({ id: item.gate.id, label: item.gate.label })), sentAt: NOW, topicLabel: (id) => id,
    })
    expect(handoff.qualified.map((item) => item.id)).toEqual(['obs-1'])
    expect(handoff.heldBackCount).toBe(1)
    expect(handoff.gates.every((gate) => gate.status === 'OPEN')).toBe(true)
    expect(handoff.boundary).toBe('UNKNOWN')
    expect(handoff.designRecommendation).toBe('NOT_PRODUCED')
    expect(JSON.stringify(handoff)).not.toMatch(/recommend(ed|ation)?":"(?!NOT_PRODUCED)/)
  })

  it('marks a handoff STALE when the parcel or the reviewed evidence changes', () => {
    const synthesis = synthesize(KEY, [observation()], NOW, true)
    const handoff = buildHandoff({
      parcel, review: { snapshotHash: synthesis.snapshotHash, reviewedAt: NOW, reviewer: 'R' }, qualified: synthesis.qualified, heldBackCount: 0,
      missing: [], gates: [], sentAt: NOW, topicLabel: (id) => id,
    })
    const key = handoff.parcelKey
    expect(handoffStatus(null, key, 'x')).toEqual({ state: 'NONE' })
    expect(handoffStatus(handoff, key, synthesis.snapshotHash)).toEqual({ state: 'CURRENT' })
    expect(handoffStatus(handoff, key, 'changed')).toMatchObject({ state: 'STALE', reason: expect.stringMatching(/evidence changed/i) })
    expect(handoffStatus(handoff, 'other-parcel', synthesis.snapshotHash)).toMatchObject({ state: 'STALE', reason: expect.stringMatching(/site changed/i) })
    expect(handoffStatus(handoff, null, synthesis.snapshotHash)).toMatchObject({ state: 'STALE' })
    expect(withHandoff(emptyStore(), handoff).handoff).toBe(handoff)
  })
})
