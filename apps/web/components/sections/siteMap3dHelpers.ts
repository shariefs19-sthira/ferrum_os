/**
 * Pure helpers for the LandIntel 3D site-context map (SiteMap3D).
 *
 * Data model, stated honestly:
 *  - Footprints come from OpenStreetMap contributors via OpenFreeMap's
 *    OpenMapTiles `building` layer (ODbL). They are observed geometry where
 *    OSM has mapped a building, and absent where OSM has not.
 *  - Heights are NOT observed by this map. The tile field `render_height` is
 *    the tagged `height` / `building:levels * 3.66` when OSM has one, and the
 *    OpenMapTiles default of exactly 5 m when it has neither. Client-side we
 *    cannot prove a 5 m value was defaulted (a mapper could tag 5 m), so we
 *    label it "assumed (default) height" and everything else "OSM-derived
 *    height". Neither is survey-grade.
 */

export const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright'
export const OPENFREEMAP_TILEJSON_URL = 'https://tiles.openfreemap.org/planet'
/** Same-origin MapLibre worker (Next.js cannot bundle it) — see scripts/sync-maplibre-worker.mjs. */
export const MAPLIBRE_WORKER_URL = '/maplibre/maplibre-gl-worker.mjs'

export const BUILDINGS_SOURCE_ID = 'site-openfreemap'
export const BUILDINGS_LAYER_ID = 'site-3d-buildings'
export const FOOTPRINT_OUTLINE_LAYER_ID = 'site-building-footprints'
/** Building tiles carry the layer from z14; extrusions appear at BUILDINGS_MIN_ZOOM. */
export const BUILDINGS_MIN_ZOOM = 15
export const DEFAULT_3D_ZOOM = 17
export const DEFAULT_3D_PITCH = 60
export const DEFAULT_3D_BEARING = -17.6
export const MAX_PITCH = 75
export const TILE_LOAD_TIMEOUT_MS = 20000
/** OpenMapTiles default for buildings with neither `height` nor `building:levels`. */
export const DEFAULT_RENDER_HEIGHT_M = 5

export const RECORDED_HEIGHT_COLOR = '#5f7189'
export const ASSUMED_HEIGHT_COLOR = '#e0b872'
export const FOOTPRINT_OUTLINE_COLOR = '#1f3a5f'

export const MAP_3D_ATTRIBUTION = [
  { label: 'OpenFreeMap', href: 'https://openfreemap.org' },
  { label: 'OpenMapTiles', href: 'https://openmaptiles.org/' },
  { label: 'Data © OpenStreetMap contributors (ODbL)', href: 'https://www.openstreetmap.org/copyright' },
] as const

export const NOT_SURVEY_GRADE_NOTICE = 'Context only — not survey-grade. Footprints are OpenStreetMap-mapped and may be missing, offset or outdated; heights are OSM-tagged or assumed. This is not a parcel boundary and does not confirm what stands on the selected site.'

/**
 * Disclosure: the provider necessarily sees the viewed area (tile z/x/y), the requester's IP address and browser headers
 * (incl. the site origin as Referer under strict-origin-when-cross-origin). Every request URL is built from the constants above
 * with no query string; ULPIN, parcel ids, project metadata and auth data are never placed in them.
 */
export const EXTERNAL_TILE_DISCLOSURE = 'Privacy: 3D loads map tiles from OpenFreeMap, which can see the area you view (plus your IP address). No ULPIN, parcel ID, project data or login details are in tile requests.'

export type Building3dCoverage = 'loading' | 'zoomed-out' | 'covered' | 'none'
export type Map3dStatus = 'loading' | 'ready' | 'failed'
export type Map3dFailureReason = 'webgl2-unavailable' | 'style-failed' | 'timeout' | 'tiles-failed' | 'init-failed'

export type BuildingFeatureLike = { properties?: Record<string, unknown> | null }
export type BuildingCounts = { total: number; recordedHeight: number; assumedHeight: number }

/** True when the browser can create a WebGL2 context (MapLibre GL JS 6 requires it). */
export function detectWebGL2(doc: Pick<Document, 'createElement'> | undefined = typeof document === 'undefined' ? undefined : document): boolean {
  if (!doc) return false
  try {
    const canvas = doc.createElement('canvas') as HTMLCanvasElement
    return Boolean(canvas.getContext?.('webgl2'))
  } catch { return false }
}

/** A height is "assumed" when it is the OpenMapTiles default (or absent) and the building has no raised base — mirrors extrusionColorExpression(). */
export function isAssumedHeight(properties?: Record<string, unknown> | null): boolean {
  const height = Number(properties?.render_height ?? DEFAULT_RENDER_HEIGHT_M)
  const base = Number(properties?.render_min_height ?? 0)
  return Number.isFinite(height) && height === DEFAULT_RENDER_HEIGHT_M && !(base > 0)
}

export function summariseBuildings(features: readonly BuildingFeatureLike[]): BuildingCounts {
  const seen = new Set<string>()
  const counts: BuildingCounts = { total: 0, recordedHeight: 0, assumedHeight: 0 }
  for (const feature of features) {
    const p = feature.properties ?? {}
    // The same building can be returned once per tile it spans; key on geometry-independent props.
    const key = `${p.osm_id ?? p.id ?? ''}|${p.render_height ?? ''}|${p.render_min_height ?? ''}|${p.colour ?? ''}`
    const id = p.osm_id ?? p.id
    if (id !== undefined && id !== null) { if (seen.has(key)) continue; seen.add(key) }
    counts.total += 1
    if (isAssumedHeight(p)) counts.assumedHeight += 1; else counts.recordedHeight += 1
  }
  return counts
}

export function resolveCoverage(zoom: number, counts: BuildingCounts | null, tilesSettled: boolean): Building3dCoverage {
  if (zoom < BUILDINGS_MIN_ZOOM) return 'zoomed-out'
  if (!tilesSettled || !counts) return 'loading'
  return counts.total > 0 ? 'covered' : 'none'
}

export function coverageMessage(coverage: Building3dCoverage, counts: BuildingCounts | null): string {
  switch (coverage) {
    case 'loading': return 'Loading OpenStreetMap building footprints…'
    case 'zoomed-out': return `Zoom in to level ${BUILDINGS_MIN_ZOOM}+ to load building footprints.`
    case 'covered': {
      const c = counts ?? { total: 0, recordedHeight: 0, assumedHeight: 0 }
      return `${c.total} OSM building footprint${c.total === 1 ? '' : 's'} in view · ${c.recordedHeight} with OSM-derived height · ${c.assumedHeight} at an assumed ${DEFAULT_RENDER_HEIGHT_M} m default.`
    }
    case 'none': return 'No OpenStreetMap building footprints found in this view. That means OSM has none mapped here — not that the site is empty. Nothing is drawn or invented.'
  }
}

export function failureMessage(reason: Map3dFailureReason): string {
  switch (reason) {
    case 'webgl2-unavailable': return '3D needs WebGL2, which this browser or device does not provide. Showing the 2D plan.'
    case 'style-failed': return '3D map tiles could not be loaded (OpenFreeMap unreachable or blocked). Showing the 2D plan.'
    case 'tiles-failed': return '3D building tiles failed to load for this area. Showing the 2D plan.'
    case 'timeout': return '3D map took too long to load. Showing the 2D plan.'
    case 'init-failed': return '3D map could not start. Showing the 2D plan.'
  }
}

/** Height-class colouring: OSM-derived heights dark slate, assumed default heights amber. */
export function extrusionColorExpression(): unknown[] {
  return ['case', ['all', ['==', ['coalesce', ['get', 'render_height'], DEFAULT_RENDER_HEIGHT_M], DEFAULT_RENDER_HEIGHT_M], ['<=', ['coalesce', ['get', 'render_min_height'], 0], 0]], ASSUMED_HEIGHT_COLOR, RECORDED_HEIGHT_COLOR]
}

/** Layers per the official MapLibre "3D buildings" example (OpenFreeMap `building` source-layer). */
export function buildingLayerSpecs() {
  const hideFilter = ['!=', ['get', 'hide_3d'], true]
  const source = { id: BUILDINGS_SOURCE_ID, spec: { type: 'vector', url: OPENFREEMAP_TILEJSON_URL } }
  const extrusion = {
    id: BUILDINGS_LAYER_ID,
    source: BUILDINGS_SOURCE_ID,
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: BUILDINGS_MIN_ZOOM,
    filter: hideFilter,
    paint: {
      'fill-extrusion-color': extrusionColorExpression(),
      'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], BUILDINGS_MIN_ZOOM, 0, BUILDINGS_MIN_ZOOM + 1, ['coalesce', ['get', 'render_height'], DEFAULT_RENDER_HEIGHT_M]],
      'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], BUILDINGS_MIN_ZOOM, 0, BUILDINGS_MIN_ZOOM + 1, ['coalesce', ['get', 'render_min_height'], 0]],
      'fill-extrusion-opacity': 0.92,
    },
  }
  const outline = {
    id: FOOTPRINT_OUTLINE_LAYER_ID,
    source: BUILDINGS_SOURCE_ID,
    'source-layer': 'building',
    type: 'line',
    minzoom: BUILDINGS_MIN_ZOOM,
    filter: hideFilter,
    paint: { 'line-color': FOOTPRINT_OUTLINE_COLOR, 'line-width': 1, 'line-opacity': 0.85 },
  }
  return { source, extrusion, outline }
}

export type ViewSnapshot = { lat: number; lng: number; zoom: number; pitch: number; bearing: number }

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Great-circle-free small-distance check: true when two points are within `metres` of each other. */
export function withinMetres(a: { lat: number; lng: number }, b: { lat: number; lng: number }, metres: number): boolean {
  const dLat = (a.lat - b.lat) * 111_320
  const dLng = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng) <= metres
}
