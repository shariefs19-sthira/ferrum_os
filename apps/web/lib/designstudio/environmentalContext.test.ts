import { describe, expect, it } from "vitest"
import type { ParcelContext } from "../workspace/parcelContext"
import {
  buildEnvironmentalContext,
  buildEnvironmentalLayers,
  computeOffsetMetres,
  deriveCadastralBoundary,
  deriveLocalOrigin,
  getLodProfile,
  lodProfiles,
} from "./environmentalContext"

const sampleFallback = { lat: 12.9762, lon: 77.5896 }
const osmSampleCentre = { lat: 12.9762, lon: 77.5896 }
const osm = { sourceDate: "2026-09-05T04:35:36Z", license: "ODbL", attribution: "© OpenStreetMap contributors", isLiveFetch: false }

const verifiedParcel: ParcelContext = {
  version: 1,
  method: "ulpin",
  ulpin: "KA-BLR-0001-2024",
  state: "Karnataka",
  district: "Bengaluru Urban",
  area_sqm: 1600,
  land_use: "Residential",
  coordinates: { lat: 28.6139, lng: 77.209 }, // Delhi - far from the Bengaluru OSM fixture, deliberately
  provenance: { source: "Ferrum verified survey record", vintage: "2026-09-10", status: "VERIFIED" },
}

const gapParcel: ParcelContext = {
  version: 1,
  method: "coordinates",
  ulpin: null,
  state: "GAP",
  district: "GAP",
  area_sqm: 0,
  land_use: "GAP",
  coordinates: { lat: 12.9, lng: 77.5 },
  provenance: { source: "User-entered coordinates", vintage: "2026-09-16", status: "GAP" },
}

describe("deriveLocalOrigin", () => {
  it("uses the parcel's own coordinate as the authoritative origin when a parcel is loaded", () => {
    const origin = deriveLocalOrigin(verifiedParcel, sampleFallback)
    expect(origin).toMatchObject({ lat: 28.6139, lon: 77.209, source: "parcel-context" })
  })

  it("falls back to the fixed sample point, clearly labeled, when no parcel is loaded", () => {
    const origin = deriveLocalOrigin(null, sampleFallback)
    expect(origin).toMatchObject({ lat: sampleFallback.lat, lon: sampleFallback.lon, source: "sample-fallback" })
    expect(origin.note).toMatch(/not a real site/)
  })

  it("falls back when a parcel is loaded but carries no coordinate (GAP)", () => {
    const noCoordParcel: ParcelContext = { ...gapParcel, coordinates: null }
    const origin = deriveLocalOrigin(noCoordParcel, sampleFallback)
    expect(origin.source).toBe("sample-fallback")
  })
})

describe("deriveCadastralBoundary - authoritative-boundary precedence", () => {
  it("never renders a boundary when no parcel is loaded", () => {
    const boundary = deriveCadastralBoundary(null)
    expect(boundary.status).toBe("NO-PARCEL-SELECTED")
    expect(boundary.geometrySource).toBe("NONE")
    expect(boundary.halfExtentM).toBeNull()
  })

  it("derives an indicative extent from the parcel's own area, never a fabricated survey polygon", () => {
    const boundary = deriveCadastralBoundary(verifiedParcel)
    expect(boundary.status).toBe("PARCEL-DERIVED")
    expect(boundary.geometrySource).toBe("AREA-DERIVED-INDICATIVE-EXTENT")
    expect(boundary.halfExtentM).toBeCloseTo(Math.sqrt(1600) / 2, 6)
    expect(boundary.disclaimer).toMatch(/not a surveyed cadastral polygon/)
    expect(boundary.disclaimer).toMatch(/never implies survey accuracy/)
  })

  it("treats a zero-area GAP parcel as no boundary, not a zero-size boundary", () => {
    const boundary = deriveCadastralBoundary(gapParcel)
    expect(boundary.status).toBe("NO-PARCEL-SELECTED")
  })
})

describe("computeOffsetMetres", () => {
  it("returns ~0 for identical points", () => {
    expect(computeOffsetMetres(sampleFallback, sampleFallback)).toBeCloseTo(0, 6)
  })

  it("returns a physically plausible distance for a known large separation (Bengaluru vs Delhi)", () => {
    const metres = computeOffsetMetres({ lat: 12.9762, lon: 77.5896 }, { lat: 28.6139, lon: 77.209 })
    const km = metres / 1000
    // Great-circle distance Bengaluru-Delhi is ~1740 km; the equirectangular
    // approximation used here is adequate at site scale, not geodetic, so
    // this only checks the result is in the right order of magnitude.
    expect(km).toBeGreaterThan(1500)
    expect(km).toBeLessThan(2000)
  })
})

describe("buildEnvironmentalLayers - layer separation", () => {
  const boundary = deriveCadastralBoundary(verifiedParcel)
  const layers = buildEnvironmentalLayers(verifiedParcel, boundary, osm)

  it("produces exactly the five required, distinct layer kinds", () => {
    expect(layers.map((l) => l.kind)).toEqual(["cadastral-boundary", "terrain", "osm-context", "photoreal-context", "proposed-design"])
  })

  it("gives every layer full provenance fields - none left undefined", () => {
    for (const layer of layers) {
      const p = layer.provenance
      expect(p.crs).toBeTruthy()
      expect(p.units).toBeTruthy()
      expect(p.horizontalDatum).toBeTruthy()
      expect(p.verticalDatum).toBeTruthy()
      expect(p.sourceDate).toBeTruthy()
      expect(p.licence).toBeTruthy()
      expect(p.attribution).toBeTruthy()
      expect(p.coverage).toBeTruthy()
      expect(p.resolution).toBeTruthy()
      expect(p.confidence).toBeTruthy()
      expect(p.completeness).toBeTruthy()
    }
  })

  it("never lets the OSM context layer claim VERIFIED confidence from a sample fixture", () => {
    const osmLayer = layers.find((l) => l.kind === "osm-context")!
    expect(osmLayer.provenance.confidence).toBe("SAMPLE-FIXTURE")
  })

  it("marks the photoreal layer UNAVAILABLE and geometry-free (never a fabricated placeholder)", () => {
    const photoreal = layers.find((l) => l.kind === "photoreal-context")!
    expect(photoreal.provenance.confidence).toBe("UNAVAILABLE")
    expect(photoreal.defaultVisible).toBe(false)
    expect(photoreal.note).toMatch(/GATED UNAVAILABLE/)
  })

  it("keeps the proposed design AUTHOR-CONTROLLED, never derived from context layers", () => {
    const proposed = layers.find((l) => l.kind === "proposed-design")!
    expect(proposed.provenance.confidence).toBe("AUTHOR-CONTROLLED")
    expect(proposed.provenance.completeness).toMatch(/never derived from or clipped to them/)
  })

  it("reports terrain as UNAVAILABLE with no fabricated elevation claim when no source is connected", () => {
    const terrain = layers.find((l) => l.kind === "terrain")!
    expect(terrain.provenance.confidence).toBe("UNAVAILABLE")
    expect(terrain.note).toMatch(/NO TERRAIN SOURCE CONNECTED/)
  })
})

describe("cadastral boundary confidence never exceeds the actual geometry", () => {
  it("remains INDICATIVE when a verified record only supplies point and area", () => {
    const boundary = deriveCadastralBoundary(verifiedParcel)
    const layers = buildEnvironmentalLayers(verifiedParcel, boundary, osm)
    expect(layers[0].provenance.confidence).toBe("INDICATIVE")
  })

  it("keeps live-fetched OSM contextual rather than calling it verified", () => {
    const boundary = deriveCadastralBoundary(verifiedParcel)
    const layers = buildEnvironmentalLayers(verifiedParcel, boundary, { ...osm, isLiveFetch: true })
    expect(layers.find((layer) => layer.kind === "osm-context")?.provenance.confidence).toBe("INDICATIVE")
  })

  it("is UNKNOWN when the parcel provenance is GAP, never silently INDICATIVE", () => {
    const gapWithArea: ParcelContext = { ...gapParcel, area_sqm: 500 }
    const boundary = deriveCadastralBoundary(gapWithArea)
    const layers = buildEnvironmentalLayers(gapWithArea, boundary, osm)
    expect(layers[0].provenance.confidence).toBe("UNKNOWN")
  })

  it("is UNAVAILABLE with no parcel loaded", () => {
    const boundary = deriveCadastralBoundary(null)
    const layers = buildEnvironmentalLayers(null, boundary, osm)
    expect(layers[0].provenance.confidence).toBe("UNAVAILABLE")
  })
})

describe("buildEnvironmentalContext - full assembly", () => {
  it("computes a cross-source offset diagnostic only once a real parcel origin is active", () => {
    const noParcel = buildEnvironmentalContext({ parcel: null, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(noParcel.crossSourceOffsets).toHaveLength(0)

    const withParcel = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(withParcel.crossSourceOffsets).toHaveLength(1)
    expect(withParcel.crossSourceOffsets[0].fromLayer).toBe("cadastral-boundary")
    expect(withParcel.crossSourceOffsets[0].toLayer).toBe("osm-context")
  })

  it("flags the OSM fixture as out of scene range when the parcel is far from the fixture's true location", () => {
    const context = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    const diagnostic = context.crossSourceOffsets[0]
    expect(diagnostic.withinSceneRange).toBe(false)
    expect(diagnostic.note).toMatch(/outside this scene's render range/)
  })

  it("keeps the OSM fixture in-range when the parcel coincides with the fixture location", () => {
    const nearbyParcel: ParcelContext = { ...verifiedParcel, coordinates: { lat: osmSampleCentre.lat, lng: osmSampleCentre.lon } }
    const context = buildEnvironmentalContext({ parcel: nearbyParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(context.crossSourceOffsets[0].withinSceneRange).toBe(true)
    expect(context.crossSourceOffsets[0].offsetMetres).toBeCloseTo(0, 3)
  })

  it("excludes every unavailable or contextual layer from measurement", () => {
    const context = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(context.measurementExcludedLayers).toEqual(["cadastral-boundary", "terrain", "osm-context", "photoreal-context"])
    expect(context.measurementExcludedLayers).not.toContain("proposed-design")
  })

  it("carries non-empty export constraints naming OSM ODbL attribution and boundary non-survey-accuracy", () => {
    const context = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(context.exportConstraints.length).toBeGreaterThan(0)
    expect(context.exportConstraints.some((line) => /ODbL/.test(line))).toBe(true)
    expect(context.exportConstraints.some((line) => /not a surveyed polygon/.test(line))).toBe(true)
  })

  it("defaults LOD to standard and never lets LOD selection alter cadastral boundary or origin", () => {
    const high = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm, lodLevel: "low" })
    const standard = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(standard.defaultLod).toBe("standard")
    expect(high.defaultLod).toBe("low")
    expect(high.cadastralBoundary).toEqual(standard.cadastralBoundary)
    expect(high.origin).toEqual(standard.origin)
  })
})

describe("LOD / mesh-size profiles", () => {
  it("exposes exactly three ordered profiles with distinct mesh densities", () => {
    expect(lodProfiles.map((p) => p.id)).toEqual(["high", "standard", "low"])
    expect(lodProfiles[0].treeCount).toBeGreaterThan(lodProfiles[1].treeCount)
    expect(lodProfiles[1].treeCount).toBeGreaterThan(lodProfiles[2].treeCount)
  })

  it("falls back to the standard profile for an unrecognised level", () => {
    // @ts-expect-error - exercising the runtime fallback for a bad value
    expect(getLodProfile("bogus")).toEqual(lodProfiles[1])
  })

  it("never claims LOD affects scene extent or boundary data", () => {
    for (const profile of lodProfiles) {
      expect(profile.description).toMatch(/extent and boundary data are unaffected/)
    }
  })
})

describe("missing OSM attributes stay honest", () => {
  it("marks class and roof type UNKNOWN while height is present", () => {
    const context = buildEnvironmentalContext({ parcel: verifiedParcel, sampleFallbackOrigin: sampleFallback, osmSampleCentre, osm })
    expect(context.osmAttributeCompleteness).toEqual({ heightM: "PRESENT", buildingClass: "UNKNOWN", roofType: "UNKNOWN" })
  })
})
