import { describe, expect, it } from "vitest"
import { evaluateFeatureAvailability } from "./capabilityPolicy"
import type { CapabilityEvaluationInput, FeatureRequirement } from "./types"

const NOW = "2026-09-19T00:00:00.000Z"

const baseRequirement: FeatureRequirement = {
  featureId: "stamp-duty-estimator",
  label: "Stamp duty estimator",
  requiresRegulatoryVerification: true,
  requiresLocalization: true,
  requiresLiveService: true,
}

const freshDataset = {
  covered: true,
  datasetId: "in-stamp-duty-2026",
  lastUpdated: "2026-09-01T00:00:00.000Z",
  sourceUrl: "https://example.test/evidence/in-stamp-duty-2026",
}

const verifiedRegulatory = {
  verified: true,
  verifiedBy: "counsel-review-2026-09",
  verifiedAt: "2026-09-01T00:00:00.000Z",
  citation: "Karnataka Stamp Act schedule, 2026 revision",
}

const completeLocalization = {
  locale: "en-IN",
  translated: true,
  completeness: 0.95,
}

const upService = {
  operational: true,
  provider: "rate-engine",
  checkedAt: NOW,
}

const declaredJurisdiction = {
  country: "IN",
  region: "IN-KA",
  source: "project-record" as const,
  declaredAt: NOW,
  projectRecordId: "project-verified-001",
  projectRecordCitation: "project://project-verified-001/jurisdiction",
}

function buildInput(overrides: Partial<CapabilityEvaluationInput> = {}): CapabilityEvaluationInput {
  return {
    jurisdiction: declaredJurisdiction,
    requirement: baseRequirement,
    datasetCoverage: freshDataset,
    regulatoryVerification: verifiedRegulatory,
    localization: completeLocalization,
    serviceAvailability: upService,
    evaluatedAt: NOW,
    ...overrides,
  }
}

describe("evaluateFeatureAvailability", () => {
  it("returns AVAILABLE when every dimension is evidenced, fresh, and verified", () => {
    const verdict = evaluateFeatureAvailability(buildInput())
    expect(verdict.status).toBe("AVAILABLE")
    expect(verdict.fallback).toContain("None")
    expect(verdict.evidence.map((e) => e.dimension)).toEqual([
      "jurisdiction",
      "dataset",
      "regulatory",
      "service",
      "localization",
    ])
  })

  it("never infers a jurisdiction — missing jurisdiction is UNAVAILABLE, not a guess", () => {
    const verdict = evaluateFeatureAvailability(buildInput({ jurisdiction: undefined }))
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("Jurisdiction not declared")
    expect(verdict.evidence).toHaveLength(1)
    expect(verdict.evidence[0].dimension).toBe("jurisdiction")
  })

  it("treats a user-declared jurisdiction as ephemeral and unverified even when a caller supplies coverage-like fields", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ jurisdiction: { ...declaredJurisdiction, source: "user-declared" } }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("typed for this assessment only")
    expect(verdict.evidence.map((item) => item.summary).join(" ")).toContain("ephemeral and unverified")
  })

  it("never returns AVAILABLE without a cited persisted project record and cited dataset coverage", () => {
    const missingProjectCitation = evaluateFeatureAvailability(
      buildInput({ jurisdiction: { ...declaredJurisdiction, projectRecordCitation: undefined } }),
    )
    const missingDatasetCitation = evaluateFeatureAvailability(
      buildInput({ datasetCoverage: { ...freshDataset, sourceUrl: undefined } }),
    )
    expect(missingProjectCitation.status).toBe("UNAVAILABLE")
    expect(missingDatasetCitation.status).toBe("UNAVAILABLE")
  })

  it("is UNAVAILABLE when the dataset does not cover the jurisdiction", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ datasetCoverage: { ...freshDataset, covered: false } }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("No cited dataset coverage")
  })

  it("is UNAVAILABLE when no dataset coverage evidence was supplied at all", () => {
    const verdict = evaluateFeatureAvailability(buildInput({ datasetCoverage: undefined }))
    expect(verdict.status).toBe("UNAVAILABLE")
  })

  it("downgrades to INDICATIVE when the dataset is stale, without claiming compliance", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        datasetCoverage: { ...freshDataset, lastUpdated: "2026-01-01T00:00:00.000Z" },
      }),
    )
    expect(verdict.status).toBe("INDICATIVE")
    expect(verdict.freshness.stale).toBe(true)
    expect(verdict.fallback).toContain("INDICATIVE — NOT A LEGAL OPINION")
  })

  it("rejects a future dataset timestamp as clock-invalid rather than clamping it fresh", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        datasetCoverage: { ...freshDataset, lastUpdated: "2026-09-20T00:00:00.000Z" }, // 1 day after NOW
      }),
    )
    expect(verdict.status).toBe("INDICATIVE")
    expect(verdict.freshness.clockInvalid).toBe(true)
    expect(verdict.freshness.stale).toBe(true)
    expect(verdict.freshness.ageDays).toBeNull()
    expect(verdict.reason).toContain("clock-invalid")
  })

  it("caps status at INDICATIVE when jurisdiction came only from IP geolocation", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ jurisdiction: { ...declaredJurisdiction, source: "ip-geolocation" } }),
    )
    expect(verdict.status).toBe("INDICATIVE")
    expect(verdict.reason).toContain("IP geolocation")
  })

  it("is EXTERNAL_GATE when regulatory verification is required but absent", () => {
    const verdict = evaluateFeatureAvailability(buildInput({ regulatoryVerification: undefined }))
    expect(verdict.status).toBe("EXTERNAL_GATE")
    expect(verdict.fallback).toContain("compliance/regulatory verification queue")
  })

  it("is EXTERNAL_GATE when regulatory verification is present but not verified", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ regulatoryVerification: { verified: false, verifiedBy: "pending-reviewer" } }),
    )
    expect(verdict.status).toBe("EXTERNAL_GATE")
  })

  it("is EXTERNAL_GATE when verified=true but verifier/citation/date are missing — a bare flag is not evidence", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ regulatoryVerification: { verified: true } }),
    )
    expect(verdict.status).toBe("EXTERNAL_GATE")
    expect(verdict.reason).toContain("verifier")
    expect(verdict.reason).toContain("citation")
  })

  it("is EXTERNAL_GATE when verified=true but only some attribution fields are present", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        regulatoryVerification: { verified: true, verifiedBy: "counsel-review-2026-09" },
      }),
    )
    expect(verdict.status).toBe("EXTERNAL_GATE")
    expect(verdict.reason).toContain("verification date")
    expect(verdict.reason).toContain("citation")
    expect(verdict.reason).not.toContain("missing verifier")
  })

  it("is UNAVAILABLE when a required live service is down, even with everything else green", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ serviceAvailability: { operational: false, checkedAt: NOW } }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("live service")
  })

  it("is UNAVAILABLE when operational=true but checkedAt is missing/unparseable", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ serviceAvailability: { operational: true, provider: "rate-engine", checkedAt: "" } }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("checkedAt")
  })

  it("is UNAVAILABLE when the service health check is stale beyond the freshness bound", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        serviceAvailability: {
          operational: true,
          provider: "rate-engine",
          checkedAt: "2026-09-18T23:00:00.000Z", // 60 minutes before NOW, default bound is 15
        },
      }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("stale")
  })

  it("is UNAVAILABLE when operational=true but checkedAt is in the future — never clamped to operational", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        serviceAvailability: {
          operational: true,
          provider: "rate-engine",
          checkedAt: "2026-09-19T01:00:00.000Z", // 1 hour after NOW
        },
      }),
    )
    expect(verdict.status).toBe("UNAVAILABLE")
    expect(verdict.reason).toContain("checkedAt")
  })

  it("accepts operational=true within the configured freshness bound", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        requirement: { ...baseRequirement, maxServiceCheckAgeMinutes: 120 },
        serviceAvailability: {
          operational: true,
          provider: "rate-engine",
          checkedAt: "2026-09-18T23:00:00.000Z", // 60 minutes before NOW, within a 120-minute bound
        },
      }),
    )
    expect(verdict.status).toBe("AVAILABLE")
  })

  it("is PARTIAL when localization is incomplete but everything else is green", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({ localization: { locale: "en-IN", translated: true, completeness: 0.4 } }),
    )
    expect(verdict.status).toBe("PARTIAL")
  })

  it("treats missing localization evidence as PARTIAL, not a silent pass", () => {
    const verdict = evaluateFeatureAvailability(buildInput({ localization: undefined }))
    expect(verdict.status).toBe("PARTIAL")
  })

  it("picks the most severe dimension when several are degraded at once", () => {
    const verdict = evaluateFeatureAvailability(
      buildInput({
        localization: { locale: "en-IN", translated: false, completeness: 0.1 },
        regulatoryVerification: undefined,
      }),
    )
    // EXTERNAL_GATE outranks PARTIAL.
    expect(verdict.status).toBe("EXTERNAL_GATE")
  })

  it("never gates on a feature that declares no regulatory/localization/service requirement", () => {
    const looseRequirement: FeatureRequirement = {
      featureId: "global-workspace",
      label: "Project workspace",
      requiresRegulatoryVerification: false,
      requiresLocalization: false,
      requiresLiveService: false,
    }
    const verdict = evaluateFeatureAvailability(
      buildInput({
        requirement: looseRequirement,
        regulatoryVerification: undefined,
        localization: undefined,
        serviceAvailability: undefined,
      }),
    )
    expect(verdict.status).toBe("AVAILABLE")
  })

  it("carries the feature id and a freshness verdict on every result", () => {
    const verdict = evaluateFeatureAvailability(buildInput())
    expect(verdict.featureId).toBe("stamp-duty-estimator")
    expect(verdict.freshness.asOf).toBe(NOW)
    expect(verdict.freshness.stale).toBe(false)
    expect(verdict.freshness.clockInvalid).toBe(false)
  })
})
