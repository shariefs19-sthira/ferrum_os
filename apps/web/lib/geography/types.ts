/**
 * Region capability policy — shared types.
 *
 * These types describe the INPUT EVIDENCE a caller must supply and the
 * OUTPUT VERDICT the engine returns. The engine (capabilityPolicy.ts) never
 * infers a jurisdiction, a compliance conclusion, or a locale on its own —
 * every input here must be supplied explicitly by the caller, with its own
 * provenance, or the engine returns UNAVAILABLE citing the missing field.
 */

/** How the caller obtained the jurisdiction it is declaring. */
export type LocationSource =
  | "project-record" // the project's own recorded site jurisdiction
  | "user-declared" // the signed-in user explicitly picked/typed this
  | "operator-override" // a human operator set this for a specific case
  | "ip-geolocation" // coarse, low-trust signal — never authoritative

/**
 * A declared jurisdiction. `region` is an optional subdivision (state,
 * province) below `country`. Both are required to be explicit strings —
 * there is no default jurisdiction and no "detect automatically" mode.
 */
export type Jurisdiction = {
  /** ISO 3166-1 alpha-2 country code, upper case (e.g. "IN", "US"). */
  country: string
  /** Optional ISO 3166-2 subdivision code (e.g. "US-CA", "IN-KA"). */
  region?: string
  source: LocationSource
  /** ISO timestamp this jurisdiction was declared/captured. */
  declaredAt: string
}

/** Whether the feature's underlying dataset actually covers this jurisdiction. */
export type DatasetCoverage = {
  covered: boolean
  datasetId: string
  /** ISO timestamp of the dataset's last refresh for this jurisdiction. */
  lastUpdated: string
  sourceUrl?: string
}

/**
 * Whether a qualified human/authority has verified the regulatory content
 * (rule text, rate, threshold) this feature relies on. Required whenever
 * the feature carries a `requiresRegulatoryVerification` flag; the engine
 * never treats "dataset present" as a stand-in for "regulator-verified".
 */
export type RegulatoryVerification = {
  verified: boolean
  verifiedBy?: string
  verifiedAt?: string
  citation?: string
}

/** Whether the feature's copy/UI is actually translated for this locale. */
export type LocalizationStatus = {
  locale: string
  translated: boolean
  /** 0..1 — share of user-facing strings actually localized (not machine fallback). */
  completeness: number
}

/** Whether the backing service/integration this feature depends on is up. */
export type ServiceAvailability = {
  operational: boolean
  provider?: string
  /** ISO timestamp of the last health check. */
  checkedAt: string
}

/** Static declaration of what a feature needs, independent of any request. */
export type FeatureRequirement = {
  featureId: string
  /** Human label for the doc/UI, e.g. "Stamp duty estimator". */
  label: string
  requiresRegulatoryVerification: boolean
  requiresLocalization: boolean
  requiresLiveService: boolean
  /** Evidence older than this is treated as stale (defaults applied by engine). */
  maxDatasetAgeDays?: number
  /** Localization completeness below this is treated as PARTIAL, not AVAILABLE. */
  minLocalizationCompleteness?: number
}

/** Everything the engine needs to evaluate one feature for one request. */
export type CapabilityEvaluationInput = {
  jurisdiction?: Jurisdiction
  requirement: FeatureRequirement
  datasetCoverage?: DatasetCoverage
  regulatoryVerification?: RegulatoryVerification
  localization?: LocalizationStatus
  serviceAvailability?: ServiceAvailability
  /** ISO timestamp "now" — injectable for deterministic tests. */
  evaluatedAt?: string
}

export type FeatureAvailabilityStatus =
  | "AVAILABLE" // fully evidenced, fresh, verified where required, operational
  | "INDICATIVE" // evidenced but stale, unverified-but-permitted, or sample data
  | "PARTIAL" // evidenced but incompletely localized or service-degraded
  | "EXTERNAL_GATE" // blocked on a required regulatory verification that hasn't happened
  | "UNAVAILABLE" // no jurisdiction, no dataset coverage, or service down

/** One evidence line the verdict is built from — always attributable and dated. */
export type EvidenceItem = {
  dimension: "jurisdiction" | "dataset" | "regulatory" | "localization" | "service"
  summary: string
  asOf?: string
}

export type FreshnessVerdict = {
  asOf: string
  maxAgeDays: number | null
  ageDays: number | null
  stale: boolean
}

export type CapabilityVerdict = {
  featureId: string
  status: FeatureAvailabilityStatus
  reason: string
  evidence: EvidenceItem[]
  freshness: FreshnessVerdict
  /** What the caller should render/do instead of the full feature. */
  fallback: string
}
