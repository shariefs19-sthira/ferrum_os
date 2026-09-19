import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ASSUMED_HEIGHT_COLOR, BUILDINGS_LAYER_ID, BUILDINGS_MIN_ZOOM, MAP_3D_ATTRIBUTION, NOT_SURVEY_GRADE_NOTICE, OPENFREEMAP_TILEJSON_URL, RECORDED_HEIGHT_COLOR,
  buildingLayerSpecs, coverageMessage, detectWebGL2, failureMessage, isAssumedHeight, resolveCoverage, summariseBuildings, withinMetres,
} from './siteMap3dHelpers'

describe('siteMap3dHelpers', () => {
  it('treats only the exact 5 m OpenMapTiles default without a raised base as an assumed height', () => {
    expect(isAssumedHeight({ render_height: 5, render_min_height: 0 })).toBe(true)
    expect(isAssumedHeight({ render_height: 5 })).toBe(true)
    expect(isAssumedHeight({ render_height: 12.5, render_min_height: 0 })).toBe(false)
    expect(isAssumedHeight({ render_height: 5, render_min_height: 3 })).toBe(false)
    expect(isAssumedHeight({})).toBe(true) // absent render_height renders with the same default as the paint expression
    expect(isAssumedHeight(null)).toBe(true)
  })

  it('summarises footprints into recorded vs assumed heights and reconciles to the total', () => {
    const counts = summariseBuildings([{ properties: { render_height: 5 } }, { properties: { render_height: 21.9 } }, { properties: { render_height: 18, render_min_height: 6 } }, { properties: null }])
    expect(counts).toEqual({ total: 4, recordedHeight: 2, assumedHeight: 2 })
    expect(counts.recordedHeight + counts.assumedHeight).toBe(counts.total)
    expect(summariseBuildings([])).toEqual({ total: 0, recordedHeight: 0, assumedHeight: 0 })
  })

  it('dedupes tile-split features only when an OSM id exists', () => {
    const feature = { properties: { osm_id: 7, render_height: 9 } }
    expect(summariseBuildings([feature, feature, { properties: { osm_id: 8, render_height: 9 } }]).total).toBe(2)
  })

  it('resolves coverage without calling an unsettled or zoomed-out view empty', () => {
    const none = { total: 0, recordedHeight: 0, assumedHeight: 0 }
    expect(resolveCoverage(BUILDINGS_MIN_ZOOM - 1, none, true)).toBe('zoomed-out')
    expect(resolveCoverage(17, null, true)).toBe('loading')
    expect(resolveCoverage(17, none, false)).toBe('loading')
    expect(resolveCoverage(17, none, true)).toBe('none')
    expect(resolveCoverage(17, { total: 3, recordedHeight: 3, assumedHeight: 0 }, true)).toBe('covered')
  })

  it('words the empty state as absence of OSM data, never as an empty site, and never claims survey grade', () => {
    expect(coverageMessage('none', null)).toMatch(/OSM has none mapped here — not that the site is empty/)
    expect(coverageMessage('covered', { total: 1, recordedHeight: 0, assumedHeight: 1 })).toMatch(/1 OSM building footprint in view/)
    expect(NOT_SURVEY_GRADE_NOTICE).toMatch(/not survey-grade/i)
    expect(NOT_SURVEY_GRADE_NOTICE).toMatch(/not a parcel boundary/i)
    for (const reason of ['webgl2-unavailable', 'style-failed', 'tiles-failed', 'timeout', 'init-failed'] as const) expect(failureMessage(reason)).toMatch(/2D plan/)
  })

  it('builds the official-example 3D building layers on OpenFreeMap with both height classes and a footprint outline', () => {
    const { source, extrusion, outline } = buildingLayerSpecs()
    expect(source.spec).toEqual({ type: 'vector', url: OPENFREEMAP_TILEJSON_URL })
    expect(extrusion).toMatchObject({ id: BUILDINGS_LAYER_ID, type: 'fill-extrusion', 'source-layer': 'building', minzoom: BUILDINGS_MIN_ZOOM })
    expect(extrusion.filter).toEqual(['!=', ['get', 'hide_3d'], true])
    const json = JSON.stringify(extrusion.paint)
    expect(json).toContain(ASSUMED_HEIGHT_COLOR); expect(json).toContain(RECORDED_HEIGHT_COLOR)
    expect(json).toContain('render_height'); expect(json).toContain('render_min_height')
    expect(outline).toMatchObject({ type: 'line', 'source-layer': 'building' })
  })

  it('shows source attribution for OpenFreeMap, OpenMapTiles and OpenStreetMap (ODbL)', () => {
    expect(MAP_3D_ATTRIBUTION.map((item) => item.label).join(' ')).toMatch(/OpenFreeMap.*OpenMapTiles.*OpenStreetMap contributors \(ODbL\)/)
    expect(MAP_3D_ATTRIBUTION.every((item) => item.href.startsWith('https://'))).toBe(true)
  })

  it('detects WebGL2 by context creation and tolerates throwing or missing contexts', () => {
    expect(detectWebGL2({ createElement: () => ({ getContext: (kind: string) => (kind === 'webgl2' ? {} : null) }) as never })).toBe(true)
    expect(detectWebGL2({ createElement: () => ({ getContext: () => null }) as never })).toBe(false)
    expect(detectWebGL2({ createElement: () => { throw new Error('blocked') } })).toBe(false)
    expect(detectWebGL2(undefined)).toBe(false)
  })

  it('measures small distances for marker/centre parity checks', () => {
    expect(withinMetres({ lat: 12.9716, lng: 77.5946 }, { lat: 12.9716, lng: 77.5946 }, 0.1)).toBe(true)
    expect(withinMetres({ lat: 12.9716, lng: 77.5946 }, { lat: 12.9726, lng: 77.5946 }, 50)).toBe(false)
  })

  it('keeps the same-origin MapLibre worker byte-identical to the installed package and CDN-free', () => {
    const publicDir = path.resolve(__dirname, '../../public/maplibre')
    const packageDir = path.dirname(require.resolve('maplibre-gl/package.json'))
    const lf = (file: string) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n') // tolerate autocrlf checkouts
    for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) expect(lf(path.join(publicDir, file))).toBe(lf(path.join(packageDir, 'dist', file)))
    const source = readFileSync(path.resolve(__dirname, 'SiteMap3D.tsx'), 'utf8')
    expect(source).not.toMatch(/import\([^)]*https?:\/\//)
    expect(source).not.toMatch(/from ['"]https?:\/\//)
    expect(source).toContain("import('maplibre-gl')")
  })
})
