import type { ParcelContext } from "../workspace/parcelContext"

// ATLAS: governed LandIntel parcel selection -> Project Context ->
// DesignStudio environmental-context handoff.
//
// `ParcelContext` (lib/workspace/parcelContext.ts) is the ONLY
// authoritative source of the selected parcel/boundary in this
// codebase today. This module is read-only with respect to it - it
// never redefines, forks, or silently substitutes that contract. Where
// ParcelContext doesn't carry a field this feature needs (it has no
// surveyed boundary ring, only a point + area_sqm), this module says so
// explicitly rather than inventing one.
//
// Five separate, independently-labeled layers come out of this module:
// cadastral/survey boundary, terrain, OSM context, optional
// photorealistic visual context, and the independently-authored
// proposed design. Nothing here ever merges two of those into one, and
// nothing here ever uses a lower-confidence layer to silently correct a
// higher-confidence one.

export type LayerConfidence = "VERIFIED" | "AUTHOR-CONTROLLED" | "INDICATIVE" | "SAMPLE-FIXTURE" | "UNKNOWN" | "UNAVAILABLE"

export type LayerProvenance = {
  crs: string
  units: string
  horizontalDatum: string
  verticalDatum: string
  sourceDate: string
  licence: string
  attribution: string
  coverage: string
  resolution: string
  confidence: LayerConfidence
  completeness: string
}

export type EnvironmentalLayerKind = "cadastral-boundary" | "terrain" | "osm-context" | "photoreal-context" | "proposed-design"

export type EnvironmentalLayer = {
  kind: EnvironmentalLayerKind
  id: string
  label: string
  defaultVisible: boolean
  provenance: LayerProvenance
  note: string
}

export type LocalOrigin = {
  lat: number
  lon: number
  source: "parcel-context" | "sample-fallback"
  note: string
}

export type CrossSourceOffsetDiagnostic = {
  fromLayer: EnvironmentalLayerKind
  toLayer: EnvironmentalLayerKind
  offsetMetres: number
  /** Beyond this, the scene does not attempt to render the offset layer in-frame; it stays a diagnostic-only fact. */
  withinSceneRangeM: number
  withinSceneRange: boolean
  note: string
}

export type LodLevel = "high" | "standard" | "low"
export type LodProfile = { id: LodLevel; label: string; treeCount: number; groundSegments: number; description: string }

export const lodProfiles: LodProfile[] = [
  { id: "high", label: "High detail", treeCount: 10, groundSegments: 48, description: "Full mesh density for close review. Higher GPU/memory cost. Scene extent and boundary data are unaffected." },
  { id: "standard", label: "Standard", treeCount: 6, groundSegments: 24, description: "Balanced density for general review. Scene extent and boundary data are unaffected." },
  { id: "low", label: "Low / mobile", treeCount: 3, groundSegments: 8, description: "Reduced mesh density for low-power devices. Scene extent and boundary data are unaffected." },
]

export function getLodProfile(level: LodLevel): LodProfile {
  return lodProfiles.find((profile) => profile.id === level) ?? lodProfiles[1]
}

export type CadastralBoundaryGeometry = {
  status: "PARCEL-DERIVED" | "NO-PARCEL-SELECTED"
  geometrySource: "AREA-DERIVED-INDICATIVE-EXTENT" | "NONE"
  /** Half the side length (metres) of a square extent centred on the local origin. Null when no parcel is loaded. */
  halfExtentM: number | null
  disclaimer: string
}

export type OsmAttributeCompleteness = {
  heightM: "PRESENT" | "UNKNOWN"
  buildingClass: "PRESENT" | "UNKNOWN"
  roofType: "PRESENT" | "UNKNOWN"
}

export type EnvironmentalContext = {
  origin: LocalOrigin
  layers: EnvironmentalLayer[]
  cadastralBoundary: CadastralBoundaryGeometry
  osmAttributeCompleteness: OsmAttributeCompleteness
  crossSourceOffsets: CrossSourceOffsetDiagnostic[]
  lodProfiles: LodProfile[]
  defaultLod: LodLevel
  /** Never used for dimensions, setbacks, levels or structural decisions - enforced by keeping this layer geometry-free. */
  measurementExcludedLayers: EnvironmentalLayerKind[]
  exportConstraints: string[]
}

const METRES_PER_DEGREE_LAT = 111320

function metresPerDegreeLon(latDeg: number): number {
  return METRES_PER_DEGREE_LAT * Math.cos((latDeg * Math.PI) / 180)
}

/** Equirectangular approximation, adequate at site scale (sub-100km); not for geodetic survey use. */
export function computeOffsetMetres(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const dLat = (a.lat - b.lat) * METRES_PER_DEGREE_LAT
  const dLon = (a.lon - b.lon) * metresPerDegreeLon((a.lat + b.lat) / 2)
  return Math.sqrt(dLat * dLat + dLon * dLon)
}

export function deriveLocalOrigin(parcel: ParcelContext | null, sampleFallback: { lat: number; lon: number }): LocalOrigin {
  if (parcel?.coordinates) {
    return {
      lat: parcel.coordinates.lat,
      lon: parcel.coordinates.lng,
      source: "parcel-context",
      note: `Local scene origin bound to the selected parcel's recorded coordinate (${parcel.provenance.source}, ${parcel.provenance.vintage}, status ${parcel.provenance.status}).`,
    }
  }
  return {
    lat: sampleFallback.lat,
    lon: sampleFallback.lon,
    source: "sample-fallback",
    note: "No parcel is loaded in Project Context. The scene renders around a fixed sample reference point, not a real site.",
  }
}

export function deriveCadastralBoundary(parcel: ParcelContext | null): CadastralBoundaryGeometry {
  if (!parcel || !parcel.coordinates || !(parcel.area_sqm > 0)) {
    return {
      status: "NO-PARCEL-SELECTED",
      geometrySource: "NONE",
      halfExtentM: null,
      disclaimer: "No authoritative parcel is loaded from Project Context. No boundary is rendered or implied.",
    }
  }
  const halfExtentM = Math.sqrt(parcel.area_sqm) / 2
  return {
    status: "PARCEL-DERIVED",
    geometrySource: "AREA-DERIVED-INDICATIVE-EXTENT",
    halfExtentM,
    disclaimer: `Indicative extent only, sized from the parcel's recorded area (${parcel.area_sqm} m²) around its recorded coordinate. This controls data extent and scene size for clipping - it is not a surveyed cadastral polygon and never implies survey accuracy. Provenance: ${parcel.provenance.source} (${parcel.provenance.status}, ${parcel.provenance.vintage}).`,
  }
}

export type OsmLayerSourceInfo = { sourceDate: string; license: string; attribution: string; isLiveFetch: boolean }

export function buildEnvironmentalLayers(parcel: ParcelContext | null, boundary: CadastralBoundaryGeometry, osm: OsmLayerSourceInfo): EnvironmentalLayer[] {
  return [
    {
      kind: "cadastral-boundary",
      id: "layer-cadastral-boundary",
      label: "Parcel selection extent",
      defaultVisible: true,
      provenance: {
        crs: parcel?.coordinates ? "EPSG:4326" : "UNKNOWN",
        units: "metres",
        horizontalDatum: parcel?.coordinates ? "WGS84 (assumed from recorded lat/lng; not independently verified)" : "UNKNOWN",
        verticalDatum: "UNKNOWN - no elevation reference is attached to this boundary",
        sourceDate: parcel?.provenance.vintage ?? "UNKNOWN",
        licence: parcel ? "Project Context (internal) - see parcel provenance" : "UNKNOWN",
        attribution: parcel?.provenance.source ?? "No parcel selected",
        coverage: boundary.status === "PARCEL-DERIVED" ? "Single parcel extent" : "None",
        resolution: boundary.status === "PARCEL-DERIVED" && boundary.halfExtentM !== null ? `${(boundary.halfExtentM * 2).toFixed(1)} m indicative extent side length` : "UNKNOWN",
        // A verified parcel record does not make the generated square a
        // surveyed boundary. Until Project Context carries a real boundary
        // ring, this extent remains indicative even when its point/area
        // inputs come from a verified record.
        confidence: !parcel ? "UNAVAILABLE" : parcel.provenance.status === "GAP" ? "UNKNOWN" : "INDICATIVE",
        completeness: "No surveyed boundary ring exists in Project Context today; this layer shows an area-derived indicative extent, never a cadastral polygon.",
      },
      note: boundary.disclaimer,
    },
    {
      kind: "terrain",
      id: "layer-terrain",
      label: "Terrain",
      defaultVisible: true,
      provenance: {
        crs: "UNKNOWN",
        units: "metres",
        horizontalDatum: "UNKNOWN",
        verticalDatum: "UNKNOWN",
        sourceDate: "UNKNOWN",
        licence: "UNKNOWN",
        attribution: "No terrain source connected",
        coverage: "None",
        resolution: "UNKNOWN",
        confidence: "UNAVAILABLE",
        completeness: "No DTM/DSM source is connected. The rendered ground plane is a flat reference surface only, never a real elevation model.",
      },
      note: "NO TERRAIN SOURCE CONNECTED. No slope, drainage, cut/fill or elevation conclusion is asserted.",
    },
    {
      kind: "osm-context",
      id: "layer-osm-context",
      label: "OSM contextual buildings & roads",
      defaultVisible: true,
      provenance: {
        crs: "EPSG:4326",
        units: "metres",
        horizontalDatum: "WGS84",
        verticalDatum: "UNKNOWN - OSM carries no vertical datum",
        sourceDate: osm.sourceDate,
        licence: osm.license,
        attribution: osm.attribution,
        coverage: osm.isLiveFetch ? "Live-fetched bbox around the local origin" : "Fixed sample fixture bbox - NOT the live parcel bbox",
        resolution: "Building footprint outlines only; no road geometry seeded in the current fixture",
        // Fetching OSM live verifies transport, not geometry completeness or
        // survey accuracy. Keep it contextual under every fetch mode.
        confidence: osm.isLiveFetch ? "INDICATIVE" : "SAMPLE-FIXTURE",
        completeness: "Height is present per building where the source provides it; building class and roof type are UNKNOWN and are never inferred as a specific value.",
      },
      note: "Contextual massing only - never used for dimensions, setbacks, levels or structural decisions.",
    },
    {
      kind: "photoreal-context",
      id: "layer-photoreal-context",
      label: "Photorealistic visual context (optional)",
      defaultVisible: false,
      provenance: {
        crs: "UNKNOWN",
        units: "UNKNOWN",
        horizontalDatum: "UNKNOWN",
        verticalDatum: "UNKNOWN",
        sourceDate: "UNKNOWN",
        licence: "UNKNOWN",
        attribution: "UNKNOWN",
        coverage: "None",
        resolution: "UNKNOWN",
        confidence: "UNAVAILABLE",
        completeness: "Provider not integrated - see the Google Photorealistic 3D Tiles adapter's own gating status.",
      },
      note: "GATED UNAVAILABLE pending verified API terms, key availability, attribution and quota/cost handling. Never used for dimensions, setbacks, levels or structural decisions, even once connected.",
    },
    {
      kind: "proposed-design",
      id: "layer-proposed-design",
      label: "Proposed design",
      defaultVisible: true,
      provenance: {
        crs: "Local scene metres, relative to the local origin",
        units: "metres",
        horizontalDatum: "N/A - independently authored geometry",
        verticalDatum: "N/A",
        sourceDate: "Live - reflects current Studio Parameters",
        licence: "Ferrum-authored",
        attribution: "Independently authored from Studio Parameters",
        coverage: "Proposed building envelope",
        resolution: "Parametric",
        confidence: "AUTHOR-CONTROLLED",
        completeness: "Authored independently of terrain, OSM and photoreal context - never derived from or clipped to them.",
      },
      note: "The only layer editable through Studio Parameters; never overwritten by terrain, OSM or photoreal context data.",
    },
  ]
}

export const EXPORT_CONSTRAINTS = [
  'OSM building/road data is ODbL-licensed: any redistributed export carrying this layer must carry the "© OpenStreetMap contributors" attribution and remain share-alike.',
  "Photorealistic visual context, once connected, will carry its own provider redistribution terms - never bundled into an export until those terms are independently verified.",
  "The cadastral boundary layer is an indicative, area-derived extent, not a surveyed polygon - it must never be exported or relied on as survey evidence.",
  "Terrain has no connected source; there is no terrain data to export.",
]

const CROSS_SOURCE_RANGE_M = 5000

export type BuildEnvironmentalContextInput = {
  parcel: ParcelContext | null
  sampleFallbackOrigin: { lat: number; lon: number }
  osmSampleCentre: { lat: number; lon: number }
  osm: OsmLayerSourceInfo
  lodLevel?: LodLevel
}

export function buildEnvironmentalContext(input: BuildEnvironmentalContextInput): EnvironmentalContext {
  const origin = deriveLocalOrigin(input.parcel, input.sampleFallbackOrigin)
  const boundary = deriveCadastralBoundary(input.parcel)
  const layers = buildEnvironmentalLayers(input.parcel, boundary, input.osm)

  const crossSourceOffsets: CrossSourceOffsetDiagnostic[] = []
  if (origin.source === "parcel-context") {
    const offsetMetres = computeOffsetMetres(origin, { lat: input.osmSampleCentre.lat, lon: input.osmSampleCentre.lon })
    const withinSceneRange = offsetMetres <= CROSS_SOURCE_RANGE_M
    crossSourceOffsets.push({
      fromLayer: "cadastral-boundary",
      toLayer: "osm-context",
      offsetMetres,
      withinSceneRangeM: CROSS_SOURCE_RANGE_M,
      withinSceneRange,
      note: withinSceneRange
        ? `OSM contextual fixture data is anchored ${offsetMetres.toFixed(1)} m from the selected parcel's local origin - it is sample fixture geometry, not the parcel's own surroundings, positioned in its own true relative frame rather than snapped to the parcel.`
        : `OSM contextual fixture data is ${(offsetMetres / 1000).toFixed(1)} km from the selected parcel's local origin - outside this scene's render range, so it is not drawn rather than being fabricated as adjacent context.`,
    })
  }

  return {
    origin,
    layers,
    cadastralBoundary: boundary,
    osmAttributeCompleteness: { heightM: "PRESENT", buildingClass: "UNKNOWN", roofType: "UNKNOWN" },
    crossSourceOffsets,
    lodProfiles,
    defaultLod: input.lodLevel ?? "standard",
    measurementExcludedLayers: ["cadastral-boundary", "terrain", "osm-context", "photoreal-context"],
    exportConstraints: EXPORT_CONSTRAINTS,
  }
}
