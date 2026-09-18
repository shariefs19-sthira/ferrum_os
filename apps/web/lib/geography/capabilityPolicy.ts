/**
 * Region capability policy engine.
 *
 * Netflix-style locality-aware feature availability: WHAT a feature shows
 * (data, regulatory conclusions, localized copy, live-service backed
 * results) varies by jurisdiction. WHETHER a device/browser can run the
 * feature at all never does — this engine only ever gates content and
 * conclusions, never device capability.
 *
 * Hard rule: this engine never infers a jurisdiction, a compliance
 * conclusion, or evidence freshness. Every input is either supplied
 * explicitly by the caller (with its own provenance) or the corresponding
 * dimension is treated as missing, which drives the verdict toward
 * UNAVAILABLE/EXTERNAL_GATE rather than being silently assumed favorable.
 */

import type {
  CapabilityEvaluationInput,
  CapabilityVerdict,
  EvidenceItem,
  FeatureAvailabilityStatus,
  FreshnessVerdict,
} from "./types"

const DEFAULT_MAX_DATASET_AGE_DAYS = 90
const DEFAULT_MIN_LOCALIZATION_COMPLETENESS = 0.8
const MS_PER_DAY = 24 * 60 * 60 * 1000

const STATUS_RANK: Record<FeatureAvailabilityStatus, number> = {
  AVAILABLE: 0,
  PARTIAL: 1,
  INDICATIVE: 2,
  EXTERNAL_GATE: 3,
  UNAVAILABLE: 4,
}

const FALLBACK_TEXT: Record<FeatureAvailabilityStatus, (label: string) => string> = {
  AVAILABLE: () => "None — feature renders in full.",
  PARTIAL: (label) =>
    `Render ${label} with the data/service it does have; label the missing dimension (e.g. localization) rather than hiding or faking it.`,
  INDICATIVE: (label) =>
    `Render ${label} watermarked INDICATIVE — NOT A LEGAL OPINION; do not present its output as current or verified.`,
  EXTERNAL_GATE: (label) =>
    `Do not compute or publish ${label}'s conclusion; route the request to the compliance/regulatory verification queue and show a pending-verification state.`,
  UNAVAILABLE: (label) =>
    `Do not render ${label}; show an explicit "not available in your region" state and, if applicable, a way to request coverage.`,
}

function daysBetween(fromIso: string, toIso: string): number | null {
  const from = Date.parse(fromIso)
  const to = Date.parse(toIso)
  if (Number.isNaN(from) || Number.isNaN(to)) return null
  return Math.max(0, (to - from) / MS_PER_DAY)
}

function isoNow(explicit?: string): string {
  return explicit ?? new Date().toISOString()
}

/**
 * Evaluate one feature's availability for one request. Pure and
 * deterministic given its inputs — no network access, no clock reads
 * unless `evaluatedAt` is omitted (tests should always pass it).
 */
export function evaluateFeatureAvailability(
  input: CapabilityEvaluationInput,
): CapabilityVerdict {
  const { requirement } = input
  const evaluatedAt = isoNow(input.evaluatedAt)
  const evidence: EvidenceItem[] = []

  // Gate 1 — jurisdiction must be explicitly declared. No IP-silent default.
  if (!input.jurisdiction) {
    evidence.push({
      dimension: "jurisdiction",
      summary: "No jurisdiction was declared for this request.",
    })
    return buildVerdict(requirement.featureId, requirement.label, "UNAVAILABLE", evidence, {
      asOf: evaluatedAt,
      maxAgeDays: null,
      ageDays: null,
      stale: false,
    }, "Jurisdiction not declared — the caller must supply one explicitly before this feature can be evaluated.")
  }
  const jurisdictionLabel = input.jurisdiction.region
    ? `${input.jurisdiction.region}, ${input.jurisdiction.country}`
    : input.jurisdiction.country
  evidence.push({
    dimension: "jurisdiction",
    summary: `Jurisdiction ${jurisdictionLabel} declared via ${input.jurisdiction.source}.`,
    asOf: input.jurisdiction.declaredAt,
  })

  // Gate 2 — dataset must actually cover this jurisdiction.
  if (!input.datasetCoverage || !input.datasetCoverage.covered) {
    evidence.push({
      dimension: "dataset",
      summary: input.datasetCoverage
        ? `Dataset "${input.datasetCoverage.datasetId}" does not cover ${jurisdictionLabel}.`
        : "No dataset coverage evidence was supplied.",
    })
    return buildVerdict(requirement.featureId, requirement.label, "UNAVAILABLE", evidence, {
      asOf: evaluatedAt,
      maxAgeDays: null,
      ageDays: null,
      stale: false,
    }, `No dataset coverage for ${jurisdictionLabel}.`)
  }
  evidence.push({
    dimension: "dataset",
    summary: `Dataset "${input.datasetCoverage.datasetId}" covers ${jurisdictionLabel}.`,
    asOf: input.datasetCoverage.lastUpdated,
  })

  const maxAgeDays = requirement.maxDatasetAgeDays ?? DEFAULT_MAX_DATASET_AGE_DAYS
  const ageDays = daysBetween(input.datasetCoverage.lastUpdated, evaluatedAt)
  const stale = ageDays === null ? true : ageDays > maxAgeDays
  const freshness: FreshnessVerdict = { asOf: evaluatedAt, maxAgeDays, ageDays, stale }

  const candidates: { status: FeatureAvailabilityStatus; reason: string }[] = []

  if (stale) {
    candidates.push({
      status: "INDICATIVE",
      reason:
        ageDays === null
          ? "Dataset freshness could not be computed from the supplied timestamps."
          : `Dataset is ${ageDays.toFixed(1)} days old, exceeding the ${maxAgeDays}-day freshness bound.`,
    })
  }

  if (input.jurisdiction.source === "ip-geolocation") {
    candidates.push({
      status: "INDICATIVE",
      reason: "Jurisdiction came from IP geolocation only — a low-trust signal, never authoritative.",
    })
  }

  if (requirement.requiresRegulatoryVerification) {
    const rv = input.regulatoryVerification
    if (!rv || !rv.verified) {
      evidence.push({
        dimension: "regulatory",
        summary: rv
          ? `Regulatory content not yet verified (last attempt by ${rv.verifiedBy ?? "unknown"}).`
          : "No regulatory verification evidence was supplied.",
        asOf: rv?.verifiedAt,
      })
      candidates.push({
        status: "EXTERNAL_GATE",
        reason: "This feature requires regulatory verification and none is on record as verified.",
      })
    } else {
      evidence.push({
        dimension: "regulatory",
        summary: `Verified by ${rv.verifiedBy ?? "unspecified reviewer"}${rv.citation ? ` (${rv.citation})` : ""}.`,
        asOf: rv.verifiedAt,
      })
    }
  }

  if (requirement.requiresLiveService) {
    const sa = input.serviceAvailability
    if (!sa || !sa.operational) {
      evidence.push({
        dimension: "service",
        summary: sa
          ? `Service "${sa.provider ?? requirement.featureId}" reported not operational.`
          : "No service-availability evidence was supplied.",
        asOf: sa?.checkedAt,
      })
      candidates.push({
        status: "UNAVAILABLE",
        reason: "This feature depends on a live service that is not currently operational.",
      })
    } else {
      evidence.push({
        dimension: "service",
        summary: `Service "${sa.provider ?? requirement.featureId}" operational.`,
        asOf: sa.checkedAt,
      })
    }
  }

  if (requirement.requiresLocalization) {
    const loc = input.localization
    const minCompleteness = requirement.minLocalizationCompleteness ?? DEFAULT_MIN_LOCALIZATION_COMPLETENESS
    if (!loc) {
      evidence.push({
        dimension: "localization",
        summary: "No localization-status evidence was supplied.",
      })
      candidates.push({
        status: "PARTIAL",
        reason: "Localization status unknown — treated as not fully localized.",
      })
    } else {
      evidence.push({
        dimension: "localization",
        summary: `Locale ${loc.locale}: ${loc.translated ? "translated" : "not translated"}, ${(loc.completeness * 100).toFixed(0)}% complete.`,
      })
      if (!loc.translated || loc.completeness < minCompleteness) {
        candidates.push({
          status: "PARTIAL",
          reason: `Localization for ${loc.locale} is below the ${(minCompleteness * 100).toFixed(0)}% completeness bound.`,
        })
      }
    }
  }

  if (candidates.length === 0) {
    return buildVerdict(
      requirement.featureId,
      requirement.label,
      "AVAILABLE",
      evidence,
      freshness,
      "All required evidence present, fresh, and — where required — regulator-verified.",
    )
  }

  const worstRank = Math.max(...candidates.map((c) => STATUS_RANK[c.status]))
  const winners = candidates.filter((c) => STATUS_RANK[c.status] === worstRank)
  const status = winners[0].status
  const reason = winners.map((w) => w.reason).join(" ")

  return buildVerdict(requirement.featureId, requirement.label, status, evidence, freshness, reason)
}

function buildVerdict(
  featureId: string,
  label: string,
  status: FeatureAvailabilityStatus,
  evidence: EvidenceItem[],
  freshness: FreshnessVerdict,
  reason: string,
): CapabilityVerdict {
  return {
    featureId,
    status,
    reason,
    evidence,
    freshness,
    fallback: FALLBACK_TEXT[status](label),
  }
}
