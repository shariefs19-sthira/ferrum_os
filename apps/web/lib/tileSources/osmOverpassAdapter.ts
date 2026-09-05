import type { FootprintCollection, TileSourceAdapter } from "./types"

// OSM/Overpass building-footprint adapter (self-host v1), per the
// operator-directed tile-source due diligence: the public Overpass
// instances' own usage policy states commercial use should run
// against a self-hosted or paid Overpass server, not the shared free
// endpoint (https://wiki.openstreetmap.org/wiki/Overpass_API - "less
// than 100 queries fetching less 10 MB of data per day" for "regular
// applications", and explicitly "Commercial use should use self-hosted
// or paid Overpass servers"). This adapter enforces that at the code
// level: it refuses to run against the public overpass-api.de endpoint
// unless the caller explicitly opts in for a non-production check
// (allowPublicEndpointForTesting), and always requires a base URL to
// be passed rather than defaulting to one.
//
// Attribution required regardless of endpoint (ODbL): "© OpenStreetMap
// contributors" - baked into the returned provenance, not left to the
// caller to remember.
const PUBLIC_OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"
const OSM_ATTRIBUTION = "© OpenStreetMap contributors"

export function createOsmOverpassAdapter(options: {
  selfHostedEndpoint?: string
  allowPublicEndpointForTesting?: boolean
}): TileSourceAdapter {
  const endpoint = options.selfHostedEndpoint ?? (options.allowPublicEndpointForTesting ? PUBLIC_OVERPASS_ENDPOINT : null)

  return {
    id: "osm-overpass-footprints",
    provenance: {
      sourceName: "OpenStreetMap building footprints via Overpass API",
      termsUrl: "https://wiki.openstreetmap.org/wiki/Overpass_API",
      checkedAt: "2026-09-05",
      status: options.selfHostedEndpoint ? "LICENSED" : "SELF_HOST_ONLY",
      attributionText: OSM_ATTRIBUTION,
      note: options.selfHostedEndpoint
        ? `Using a configured self-hosted/paid endpoint (${options.selfHostedEndpoint}), per the public policy's own commercial-use requirement.`
        : "No self-hosted endpoint configured. The public overpass-api.de endpoint's own usage policy reserves it for casual/non-commercial use and explicitly directs commercial use to a self-hosted or paid server - this adapter will not fetch against it for real traffic without allowPublicEndpointForTesting set, and even then only for a small, clearly-labeled test.",
    },
    async fetchFootprints(bboxWgs84): Promise<FootprintCollection | null> {
      if (!endpoint) {
        return null
      }
      const [south, west, north, east] = bboxWgs84
      const query = `[out:json][timeout:25];(way["building"](${south},${west},${north},${east}););out geom;`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain", "User-Agent": "ferrum-os-tile-adapter-test/1.0 (contact: operator)" },
        body: query,
      })
      if (!res.ok) {
        throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`)
      }
      const data = (await res.json()) as { elements?: Array<{ geometry?: Array<{ lat: number; lon: number }> }> }
      const features = (data.elements ?? [])
        .filter((el) => el.geometry && el.geometry.length > 2)
        .map((el) => ({
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "Polygon" as const,
            coordinates: [el.geometry!.map((pt) => [pt.lon, pt.lat])],
          },
        }))
      return { type: "FeatureCollection", features }
    },
  }
}
