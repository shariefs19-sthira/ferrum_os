// W-46 RATE_ENGINE catalog schema — distinct from ferrumRateEngine.ts
// (W2-312's weighted-band estimator, which blends already-known rate
// numbers). This module defines the single item catalog the operator
// wants shared across BOQ, structural, and design surfaces: the same
// door/beam/tile/paint entry is what a user plugs into a design AND
// what BOQ prices AND what structure checks against dimensions for.
//
// Every rate/dimension fact on an item carries its own RateProvenance
// - never a blanket "this catalog is verified" claim. A source that
// cannot be read/verified right now (paywalled, or - as with the CBIC
// PDF adapter test - fetched but not text-extractable with tooling
// available in this environment) is CONCEPT or ROADMAP, never guessed
// into VERIFIED-PUBLIC.

export type RateStatus =
  | "VERIFIED-PUBLIC" // real source URL + real fetch date, fact read directly from the source
  | "ROADMAP" // source identified (paywalled, ambiguous, or unparseable) - reference only, no fact extracted
  | "CONCEPT" // no public source exists yet for this fact; schema/shape only, operator fills the real value later

export type RateProvenance = {
  sourceName: string
  sourceUrl: string | null // required (non-null) when status is VERIFIED-PUBLIC or ROADMAP; null only for CONCEPT
  fetchedAt: string | null // ISO date; same non-null rule as sourceUrl
  status: RateStatus
  note?: string // e.g. why extraction stopped short (tooling gap, paywall, ambiguity)
}

export const CatalogCategories = [
  "civil",
  "steel",
  "electrical",
  "plumbing",
  "sanitary",
  "paint",
  "doors-hardware",
] as const
export type CatalogCategory = (typeof CatalogCategories)[number]

// Parametric hooks: the same fields a design/structure surface needs
// to place this item as a real building element, not just a BOQ line.
export type ParametricHooks = {
  unit: string // "bag" | "kg" | "m" | "m2" | "m3" | "nos" | ...
  densityKgPerM3?: number
  coverageRatePerUnit?: number // e.g. paint m2 per litre
  standardSizes?: string[] // e.g. ["8mm","10mm","12mm","16mm"] for TMT
  strengthClass?: string // e.g. "Fe500D", "M25", "OPC 43"
}

export type GstFact = {
  hsn: string
  ratePercent: number
  provenance: RateProvenance
}

export type PriceFact = {
  amountInr: number
  unit: string
  provenance: RateProvenance
}

export type CatalogItem = {
  id: string
  category: CatalogCategory
  itemCode: string // HSN, manufacturer SKU, or an internal code when neither exists yet
  name: string
  hooks: ParametricHooks
  gst?: GstFact
  price?: PriceFact
}
