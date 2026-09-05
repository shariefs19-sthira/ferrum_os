// Tile/footprint source adapter contract - distinct from
// lib/rateEngine (BOQ pricing facts): these adapters provide map tiles
// or building-footprint geometry for the site/parcel surfaces
// (LandIntel, the cockpit's parcel context, W-33's pre-seed wiring).
//
// LicenseStatus is deliberately not the same enum as rateEngine's
// RateStatus - a tile source's blocker is almost always licensing, not
// "was the fact extracted": SELF_HOST_ONLY (the public endpoint's own
// usage policy forbids production/commercial traffic; a self-hosted
// instance is required and this adapter will not silently fall back to
// the public one for real traffic), REQUIRES_PAID_LICENSE (a real
// commercial license must be purchased before this source can be used
// live - CONCEPT-status until that happens), BLOCKED (terms of use
// prohibit this use case outright, no license path exists via public
// docs).
export type LicenseStatus = "LICENSED" | "REQUIRES_PAID_LICENSE" | "SELF_HOST_ONLY" | "BLOCKED"

export type TileSourceProvenance = {
  sourceName: string
  termsUrl: string
  checkedAt: string
  status: LicenseStatus
  attributionText: string | null // required exact attribution string, or null if BLOCKED (no lawful use to attribute)
  note: string
}

// Minimal local GeoJSON shape - @types/geojson isn't installed and this
// contract only needs enough structure to carry real footprint
// geometry, not the full spec.
export type FootprintFeature = {
  type: "Feature"
  properties: Record<string, unknown>
  geometry: { type: "Polygon" | "MultiPolygon"; coordinates: unknown }
}
export type FootprintCollection = { type: "FeatureCollection"; features: FootprintFeature[] }

export interface TileSourceAdapter {
  id: string
  provenance: TileSourceProvenance
  // Returns null (never fabricated geometry) when the adapter's
  // license status doesn't permit a live fetch for this call site.
  fetchFootprints(bboxWgs84: [number, number, number, number]): Promise<FootprintCollection | null>
}
