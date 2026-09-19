"use client"

import { useMemo, useState } from "react"
import { evaluateFeatureAvailability } from "../../lib/geography/capabilityPolicy"
import type { CapabilityVerdict, FeatureRequirement, FeatureAvailabilityStatus } from "../../lib/geography/types"

const STATUS_COPY: Record<FeatureAvailabilityStatus, string> = {
  AVAILABLE: "All required evidence is present and current.",
  INDICATIVE: "Evidence exists, but is stale, provisional, or low-trust.",
  PARTIAL: "Some required evidence or localization is incomplete.",
  EXTERNAL_GATE: "A required independent verification is still pending.",
  UNAVAILABLE: "The evidence needed to make this available is absent.",
}

const REGIONAL_REQUIREMENTS: FeatureRequirement[] = [
  {
    featureId: "project-jurisdiction",
    label: "Project jurisdiction record",
    requiresRegulatoryVerification: false,
    requiresLocalization: false,
    requiresLiveService: false,
  },
  {
    featureId: "regional-evidence",
    label: "Regional evidence layers",
    requiresRegulatoryVerification: false,
    requiresLocalization: false,
    requiresLiveService: false,
  },
  {
    featureId: "regulated-conclusions",
    label: "Regulated conclusions",
    requiresRegulatoryVerification: true,
    requiresLocalization: true,
    requiresLiveService: false,
  },
  {
    featureId: "local-language-support",
    label: "Local-language support",
    requiresRegulatoryVerification: false,
    requiresLocalization: true,
    requiresLiveService: false,
  },
  {
    featureId: "connected-regional-services",
    label: "Connected regional services",
    requiresRegulatoryVerification: false,
    requiresLocalization: false,
    requiresLiveService: true,
  },
]

function statusClass(status: FeatureAvailabilityStatus) {
  if (status === "AVAILABLE") return "border-relume-success text-relume-command"
  if (status === "INDICATIVE" || status === "PARTIAL") return "border-relume-accent text-relume-command"
  return "border-relume-steel-soft text-relume-muted"
}

function formatFreshness(verdict: CapabilityVerdict) {
  if (verdict.freshness.maxAgeDays === null) return "Freshness: no coverage timestamp"
  if (verdict.freshness.clockInvalid) return "Freshness: clock-invalid"
  if (verdict.freshness.stale) return "Freshness: stale or unparseable"
  return `Freshness: ${verdict.freshness.ageDays?.toFixed(0) ?? "unknown"} days old`
}

export default function RegionalAvailability() {
  const [country, setCountry] = useState("")
  const [region, setRegion] = useState("")

  const results = useMemo(() => {
    const now = new Date().toISOString()
    const jurisdiction = country
      ? { country, ...(region ? { region } : {}), source: "user-declared" as const, declaredAt: now }
      : undefined

    return REGIONAL_REQUIREMENTS.map((requirement) => {
      const isProjectRecord = requirement.featureId === "project-jurisdiction"
      return evaluateFeatureAvailability({
        jurisdiction,
        requirement,
        // This is a record of the user's declaration, not a claim that a
        // geographic or regulatory dataset covers the location.
        datasetCoverage: isProjectRecord && jurisdiction
          ? { covered: true, datasetId: "user-declared-project-context", lastUpdated: now }
          : undefined,
        evaluatedAt: now,
      })
    })
  }, [country, region])

  return (
    <section className="border-b border-relume-border bg-relume-surface-secondary py-10 sm:py-14" aria-labelledby="regional-availability-title" data-regional-availability>
      <div className="mx-auto max-w-relume-container px-6 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)] lg:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-ink">Regional availability</p>
            <h2 id="regional-availability-title" className="mt-3 text-3xl font-semibold tracking-relume-tight text-relume-ink sm:text-4xl">Know the boundary before you start.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-relume-muted sm:text-base">
              Choose the project country you want to assess. Ferrum does not use device or IP location here, and this check does not change your project record.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold text-relume-ink" htmlFor="regional-country">
                Country code
                <input id="regional-country" value={country} onChange={(event) => setCountry(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))} placeholder="UNKNOWN" inputMode="text" autoComplete="country" maxLength={2} className="mt-2 min-h-11 w-full rounded-relume border border-relume-border bg-relume-surface px-3 font-mono text-sm font-medium text-relume-ink placeholder:text-relume-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command" aria-describedby="regional-country-help" />
              </label>
              <label className="text-sm font-semibold text-relume-ink" htmlFor="regional-subdivision">
                Region or subdivision <span className="font-normal text-relume-muted">optional</span>
                <input id="regional-subdivision" value={region} onChange={(event) => setRegion(event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8))} placeholder="UNKNOWN" inputMode="text" autoComplete="address-level1" maxLength={8} className="mt-2 min-h-11 w-full rounded-relume border border-relume-border bg-relume-surface px-3 font-mono text-sm font-medium text-relume-ink placeholder:text-relume-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-command" />
              </label>
            </div>
            <p id="regional-country-help" className="mt-3 text-xs leading-5 text-relume-muted">Use a two-letter country code, for example IN or US. Blank means UNKNOWN.</p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Availability status key">
              {(Object.keys(STATUS_COPY) as FeatureAvailabilityStatus[]).map((status) => <span key={status} className={`rounded-full border bg-relume-surface px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] ${statusClass(status)}`}>{status}</span>)}
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2" aria-live="polite">
            {results.map((verdict) => (
              <article key={verdict.featureId} className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold tracking-relume-tight text-relume-ink">{REGIONAL_REQUIREMENTS.find((item) => item.featureId === verdict.featureId)?.label}</h3>
                  <span className={`shrink-0 rounded-full border bg-relume-surface px-2 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] ${statusClass(verdict.status)}`}>{verdict.status}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-relume-muted">{verdict.reason}</p>
                <p className="mt-2 text-xs leading-5 text-relume-muted">{formatFreshness(verdict)}</p>
                <details className="mt-3 border-t border-relume-border pt-3 text-xs leading-5 text-relume-muted">
                  <summary className="cursor-pointer font-semibold text-relume-command">Evidence and fallback</summary>
                  <ul className="mt-2 space-y-1 break-words">
                    {verdict.evidence.map((item) => <li key={`${item.dimension}-${item.summary}`}>{item.dimension}: {item.summary}{item.asOf ? ` (${item.asOf})` : ""}</li>)}
                  </ul>
                  <p className="mt-2"><span className="font-semibold text-relume-ink">Fallback:</span> {verdict.fallback}</p>
                </details>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
