export type RulePackStatus = "AVAILABLE" | "ADAPTER-READY" | "RESEARCH-REQUIRED"

export type JurisdictionPack = {
  id: string
  label: string
  scope: string
  status: RulePackStatus
  capabilities: string[]
  rule: string
}

/** Jurisdiction packs extend the global kernel; they never imply code approval. */
export const jurisdictionPacks: JurisdictionPack[] = [
  {
    id: "global-openbim",
    label: "Global project kernel",
    scope: "Worldwide",
    status: "AVAILABLE",
    capabilities: ["IFC/openBIM exchange", "OGC geospatial context", "Explicit units", "ISO 19650-aligned information states"],
    rule: "Stores geometry, evidence, provenance and approvals without assuming a country-specific planning or building rule.",
  },
  {
    id: "india",
    label: "India jurisdiction pack",
    scope: "India, resolved further by state, urban local body and development authority",
    status: "AVAILABLE",
    capabilities: ["BEE Eco Niwas Samhita checks", "Indian parcel identifiers", "State and authority source adapters"],
    rule: "Applies only after the governing authority, source version and effective date are identified.",
  },
  {
    id: "united-states",
    label: "United States jurisdiction adapter",
    scope: "Country, state, county and city/AHJ",
    status: "ADAPTER-READY",
    capabilities: ["State/local code adoption registry", "Open parcel and permit connectors", "Climate-zone analysis"],
    rule: "Model codes are never treated as locally adopted law without the AHJ, edition and amendments.",
  },
  {
    id: "european-union",
    label: "European jurisdiction adapters",
    scope: "EU framework plus member-state and municipal rules",
    status: "ADAPTER-READY",
    capabilities: ["National cadastral/open-data connectors", "Energy-performance rule adapters", "Local planning overlays"],
    rule: "Country and municipality packs remain independent; EU-level policy does not substitute for local planning control.",
  },
  {
    id: "other-jurisdiction",
    label: "Additional country pack",
    scope: "Any country and its subnational authorities",
    status: "RESEARCH-REQUIRED",
    capabilities: ["Source registry", "Rule extraction", "Professional validation", "Versioned release"],
    rule: "Until a reviewed pack exists, SUTRA provides design analysis with regulatory fields marked UNKNOWN.",
  },
]

export function getJurisdictionPack(id: string): JurisdictionPack | undefined {
  return jurisdictionPacks.find((pack) => pack.id === id)
}

