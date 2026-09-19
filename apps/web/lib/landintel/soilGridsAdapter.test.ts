import { describe, expect, it, vi } from 'vitest'
import { assessGeotechnicalEvidence } from './geotechnicalIntelligence'
import {
  buildSoilGridsUrl,
  createMemorySoilGridsCache,
  fetchSoilGridsScreening,
  SOILGRIDS_ATTRIBUTION,
  validateSoilGridsRequest,
  type SoilGridsFetch,
} from './soilGridsAdapter'

const NOW = new Date('2026-09-19T10:00:00.000Z')
const LATER = new Date('2026-09-20T10:00:00.000Z')

type Vals = { 'Q0.05': number | null; 'Q0.5'?: number | null; 'Q0.95': number | null; mean: number | null }
const layer = (name: string, unit: { d_factor: number; mapped_units: string; target_units: string }, depths: Record<string, Vals>) => ({
  name, unit_measure: { ...unit, uncertainty_unit: '' },
  depths: Object.entries(depths).map(([label, values]) => ({ range: { unit_depth: 'cm' }, label, values })),
})
const feature = (layers: unknown[]) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { layers } })
const NULLS: Vals = { 'Q0.05': null, 'Q0.95': null, mean: null }
const CLAY_UNIT = { d_factor: 10, mapped_units: 'g/kg', target_units: '%' }

// Values captured from the live ISRIC endpoint at (77.10, 13.20), Bengaluru Rural periphery, 2026-09-19.
const peripheryFixture = feature([
  layer('clay', CLAY_UNIT, { '0-5cm': { 'Q0.05': 57, 'Q0.5': 210, 'Q0.95': 724, mean: 222 } }),
  layer('sand', CLAY_UNIT, { '0-5cm': { 'Q0.05': 400, 'Q0.5': 500, 'Q0.95': 560, mean: 490 } }),
])
// Central Bengaluru cell (77.5946, 12.9716) returned all-null values with HTTP 200.
const centralBengaluruFixture = feature([layer('clay', CLAY_UNIT, { '0-5cm': NULLS, '5-15cm': NULLS })])
const oceanFixture = feature([layer('clay', CLAY_UNIT, { '0-5cm': NULLS })])

const okFetch = (body: unknown): SoilGridsFetch => vi.fn(async () => ({ ok: true, status: 200, json: async () => body }))
const statusFetch = (status: number): SoilGridsFetch => vi.fn(async () => ({ ok: false, status, json: async () => ({}) }))
const opts = (fetchImpl: SoilGridsFetch, extra = {}) => ({ fetchImpl, now: () => NOW, properties: ['clay', 'sand'], depths: ['0-5cm'], ...extra })

describe('SoilGrids adapter', () => {
  it('parses a modelled point into INDICATIVE / MODELLED / REGIONAL_SCREENING evidence with lineage', async () => {
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture)))
    expect(r.outcome).toBe('LIVE')
    expect(r.attribution).toBe(SOILGRIDS_ATTRIBUTION)
    expect(r.licence).toBe('CC BY 4.0')
    expect(r.watermark).toBe('INDICATIVE MODELLED REGIONAL_SCREENING')
    const clay = r.evidence.find((e) => e.property === 'clay')!
    expect(clay).toMatchObject({ status: 'INDICATIVE', method: 'MODELLED', scope: 'REGIONAL_SCREENING', unit: '%', depth: '0-5cm', topic: 'soil-classification-properties' })
    expect(clay.value).toBeCloseTo(22.2)
    expect(clay.uncertainty).toMatchObject({ q05: 5.7, q95: 72.4 })
    expect(clay.lineage).toMatchObject({ sourceId: 'isric-soilgrids-2.0', retrievedAt: NOW.toISOString(), observationDate: null })
    expect(clay.lineage!.sourceUri).toContain('lat=13.2')
    expect(clay.coverage.kind).toBe('POINT')
  })

  it('gives LOW confidence and a limitation for a wide interval, MEDIUM (never HIGH) for a narrow one', async () => {
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture)))
    const clay = r.evidence.find((e) => e.property === 'clay')!
    const sand = r.evidence.find((e) => e.property === 'sand')!
    expect(clay.confidence).toBe('LOW')
    expect(clay.limitations.join(' ')).toMatch(/wide 90% prediction interval/i)
    expect(sand.confidence).toBe('MEDIUM')
    expect(r.evidence.every((e) => e.confidence !== 'HIGH')).toBe(true)
  })

  it('returns UNKNOWN, never zero, for the masked central-Bengaluru cell', async () => {
    const r = await fetchSoilGridsScreening(12.9716, 77.5946, opts(okFetch(centralBengaluruFixture), { depths: ['0-5cm', '5-15cm'] }))
    expect(r.outcome).toBe('NO_DATA')
    expect(r.evidence).toHaveLength(2)
    for (const e of r.evidence) expect(e).toMatchObject({ status: 'UNKNOWN', value: null, unit: null, confidence: 'UNKNOWN' })
  })

  it('returns UNKNOWN for an ocean/no-data point', async () => {
    const r = await fetchSoilGridsScreening(0, -30, opts(okFetch(oceanFixture)))
    expect(r.outcome).toBe('NO_DATA')
    expect(r.evidence.every((e) => e.status === 'UNKNOWN' && e.value === null)).toBe(true)
  })

  it('rejects invalid coordinates and parameters without calling upstream', async () => {
    const fetchImpl = okFetch(peripheryFixture)
    for (const [lat, lon] of [[91, 0], [-91, 0], [0, 181], [0, -181], [Number.NaN, 0], [0, Number.POSITIVE_INFINITY], ['12' as unknown as number, 77]]) {
      const r = await fetchSoilGridsScreening(lat, lon, opts(fetchImpl))
      expect(r.outcome).toBe('INVALID_INPUT')
      expect(r.evidence).toEqual([])
    }
    expect((await fetchSoilGridsScreening(12, 77, opts(fetchImpl, { properties: ['bearing'] }))).issues.join(' ')).toMatch(/unsupported soilgrids property/i)
    expect(validateSoilGridsRequest(12, 77, ['clay'], ['0-1cm']).join(' ')).toMatch(/unsupported soilgrids depth/i)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('builds a deterministic WGS84 request URL', () => {
    expect(buildSoilGridsUrl(13.2, 77.1, ['clay'], ['0-5cm'])).toBe(
      'https://rest.isric.org/soilgrids/v2.0/properties/query?lon=77.1&lat=13.2&property=clay&depth=0-5cm&value=Q0.05&value=Q0.5&value=Q0.95&value=mean',
    )
  })

  it('returns UNKNOWN on HTTP 503 with no cache', async () => {
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(statusFetch(503)))
    expect(r.outcome).toBe('UPSTREAM_UNAVAILABLE')
    expect(r.evidence).toHaveLength(1)
    expect(r.evidence[0]).toMatchObject({ status: 'UNKNOWN', value: null })
  })

  it('serves cached data as STALE UPSTREAM DATA on 503, with the original retrieval time', async () => {
    const cache = createMemorySoilGridsCache()
    const live = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture), { cache }))
    expect(live.outcome).toBe('LIVE')
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(statusFetch(503), { cache, now: () => LATER }))
    expect(r.outcome).toBe('STALE_CACHE')
    expect(r.retrievedAt).toBe(NOW.toISOString())
    for (const e of r.evidence) {
      expect(e.status).toBe('STALE UPSTREAM DATA')
      expect(e.limitations[0]).toMatch(/cached soilgrids response from 2026-09-19/i)
    }
    expect(r.evidence.find((e) => e.property === 'sand')!.confidence).toBe('LOW')
    expect(assessGeotechnicalEvidence(r.evidence).holds.join(' ')).toMatch(/stale upstream/i)
  })

  it('falls back on network errors and does not cache no-data responses', async () => {
    const cache = createMemorySoilGridsCache()
    await fetchSoilGridsScreening(12.9716, 77.5946, opts(okFetch(centralBengaluruFixture), { cache }))
    const failing: SoilGridsFetch = vi.fn(async () => { throw new Error('ECONNRESET') })
    const r = await fetchSoilGridsScreening(12.9716, 77.5946, opts(failing, { cache }))
    expect(r.outcome).toBe('UPSTREAM_UNAVAILABLE')
    expect(r.issues.join(' ')).toMatch(/ECONNRESET/)
  })

  it('does not fall back to cache for a 4xx rejection', async () => {
    const cache = createMemorySoilGridsCache()
    await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture), { cache }))
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(statusFetch(422), { cache }))
    expect(r.outcome).toBe('UPSTREAM_REJECTED')
    expect(r.evidence[0].status).toBe('UNKNOWN')
  })

  it('treats malformed bodies and bad unit metadata as UNKNOWN, not zero', async () => {
    const malformed = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch({ nope: true })))
    expect(malformed.outcome).toBe('UPSTREAM_UNAVAILABLE')
    const badUnit = feature([layer('clay', { d_factor: 0, mapped_units: 'g/kg', target_units: '%' }, { '0-5cm': { 'Q0.05': 1, 'Q0.95': 2, mean: 1 } })])
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(badUnit)))
    expect(r.outcome).toBe('NO_DATA')
    expect(r.evidence[0]).toMatchObject({ status: 'UNKNOWN', value: null })
  })

  it('emits only the soil-properties topic and no unsupported engineering outputs', async () => {
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture)))
    const forbiddenTopics = ['bearing-settlement-inputs', 'boreholes', 'cpt-spt', 'laboratory-tests', 'foundation-constraints', 'excavation-retaining']
    for (const e of r.evidence) {
      expect(e.topic).toBe('soil-classification-properties')
      expect(forbiddenTopics).not.toContain(e.topic)
      expect(e.scope).toBe('REGIONAL_SCREENING')
      expect(`${e.label} ${e.unit}`).not.toMatch(/uscs|bearing|\bspt\b|\bcpt\b|borehole|kpa|allowable/i)
      expect(['string']).not.toContain(typeof e.value)
    }
    expect(r.evidence[0].limitations.join(' ')).toMatch(/not evidence of: Allowable bearing capacity/i)
  })

  it('never clears project-investigation holds', async () => {
    const r = await fetchSoilGridsScreening(13.2, 77.1, opts(okFetch(peripheryFixture)))
    const a = assessGeotechnicalEvidence(r.evidence)
    expect(a.suitability).toBe('SCREENING ONLY')
    expect(a.holds.join(' ')).toMatch(/project investigation evidence required/i)
  })
})
