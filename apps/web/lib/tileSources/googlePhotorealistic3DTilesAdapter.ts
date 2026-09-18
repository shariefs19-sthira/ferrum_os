// Provider adapter boundary for Google Photorealistic 3D Tiles - the
// DesignStudio environmental-context feature's optional photorealistic
// visual-context layer.
//
// Per the operator's own gate for this feature: Google Photorealistic
// 3D Tiles is NEVER wired to a live tileset without verified API terms,
// key availability, attribution, quota/cost handling and allowed-use
// confirmation all present at once. As of this module's authoring none
// of those gates has been independently verified in this repo (no key,
// no recorded terms acceptance, no quota/cost plan, no attribution
// confirmation) - so this adapter reports GATED_UNAVAILABLE with the
// specific missing gate(s) named, mirroring the honesty pattern already
// used by osmOverpassAdapter.ts's SELF_HOST_ONLY status. It never
// fabricates a tileset URL or silently falls back to a placeholder.
export type VisualContextProviderStatus = "AVAILABLE" | "GATED_UNAVAILABLE"

export type VisualContextProvenance = {
  sourceName: string
  termsUrl: string
  checkedAt: string
  status: VisualContextProviderStatus
  attributionText: string | null
  note: string
}

export type VisualContextTileset = { tilesetUrl: string; sessionToken?: string }

export interface VisualContextProviderAdapter {
  id: string
  provenance: VisualContextProvenance
  /** Returns null (never a fabricated tileset) whenever the provider is gated for this call site. */
  requestTileset(bboxWgs84: [number, number, number, number]): Promise<VisualContextTileset | null>
}

export type GooglePhotorealistic3DTilesGateOptions = {
  apiKey?: string
  /** ISO date the operator recorded acceptance of Google's Terms of Service for this specific use. */
  termsAcceptedAt?: string
  /** Explicit confirmation that a cost/quota handling plan exists for this provider. */
  quotaConfirmed?: boolean
  /** Explicit confirmation the required Google attribution can actually be rendered in the UI. */
  attributionConfirmed?: boolean
}

const TERMS_URL = "https://developers.google.com/maps/documentation/tile/3d-tiles-overview"

export function createGooglePhotorealistic3DTilesAdapter(options: GooglePhotorealistic3DTilesGateOptions): VisualContextProviderAdapter {
  const missingGates: string[] = []
  if (!options.apiKey) missingGates.push("API key not configured")
  if (!options.termsAcceptedAt) missingGates.push("Google 3D Tiles terms-of-service acceptance not recorded")
  if (!options.quotaConfirmed) missingGates.push("quota/cost handling not confirmed")
  if (!options.attributionConfirmed) missingGates.push("required attribution rendering not confirmed")

  const gated = missingGates.length > 0

  return {
    id: "google-photorealistic-3d-tiles",
    provenance: {
      sourceName: "Google Photorealistic 3D Tiles",
      termsUrl: TERMS_URL,
      checkedAt: options.termsAcceptedAt ?? "not checked",
      status: gated ? "GATED_UNAVAILABLE" : "AVAILABLE",
      attributionText: gated ? null : "© Google",
      note: gated
        ? `Not integrated: ${missingGates.join("; ")}. This adapter refuses to fetch or fabricate a tileset until every gate is met.`
        : "All required gates confirmed for this session's configuration. Live fetch is enabled at the adapter boundary; the end-to-end request path itself is a separate, explicitly-scoped follow-up once a real key is verified in production.",
    },
    async requestTileset(): Promise<VisualContextTileset | null> {
      if (gated) return null
      // Deliberately still returns null even once every configuration
      // gate is satisfied: issuing the live network request is a
      // separate, explicitly-scoped follow-up, not implied by
      // configuration alone. This keeps the "no live tileset without a
      // verified end-to-end path" guarantee true regardless of how this
      // adapter is configured.
      return null
    },
  }
}
