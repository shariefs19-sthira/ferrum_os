"use client"

import { useMemo } from "react"
import { useParcelContext } from "../../lib/workspace/parcelContext"
import { sampleSiteContext } from "../../lib/workspace/sampleSiteContext"
import { buildingShellCatalog, recommendBuildingShells } from "../../lib/designstudio/shellCatalog"
import { getBuildingTemplateByShellId } from "../../lib/designstudio/buildingLibraryKernel"
import { getJurisdictionPack } from "../../lib/designstudio/jurisdictionPacks"
import { buildEnvironmentalContext } from "../../lib/designstudio/environmentalContext"
import { createUnknownGeotechnicalScreening } from "../../lib/landintel/geotechnicalIntelligence"
import {
  assessBuildingTemplateSuitability,
  type SuitabilityDimensionAssessment,
  type SuitabilityDimensionKey,
  type SuitabilityState,
} from "../../lib/designstudio/suitabilityAssessment"
import {
  SAMPLE_FIXTURE_NOTE,
  buildProjectContextTemplateInputs,
  buildSampleTemplateInputs,
  suitabilitySampleParcel,
} from "../../lib/designstudio/suitabilitySampleFixture"

const dimensionLabels: Record<SuitabilityDimensionKey, string> = {
  "physical-fit": "Physical fit",
  planning: "Planning",
  environmental: "Environmental",
  structural: "Structural",
  geotechnical: "Geotechnical",
  supply: "Supply",
  delivery: "Delivery",
}

// CONDITIONAL always carries an explicit INDICATIVE qualifier here: every
// dimension that can reach CONDITIONAL in this contract does so precisely
// because the evidence behind it is indicative/incomplete, never because it
// confirms compliance - see suitabilityAssessment.ts's per-dimension ceilings.
const stateLabels: Record<SuitabilityState, string> = {
  SUPPORTED: "SUPPORTED",
  CONDITIONAL: "CONDITIONAL · INDICATIVE",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  STALE: "STALE",
}

function DimensionCard({ assessment }: { assessment: SuitabilityDimensionAssessment }) {
  return (
    <li className="rounded-relume border border-relume-border bg-relume-surface p-4" data-suitability-dimension={assessment.dimension}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold text-relume-ink">{dimensionLabels[assessment.dimension]}</p>
        <span
          className="rounded-full border border-relume-border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-ink"
          data-suitability-state={assessment.state}
        >
          {stateLabels[assessment.state]}
        </span>
      </div>
      {assessment.reasons.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-relume-muted">
          {assessment.reasons.slice(0, 2).map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      )}
      {assessment.missingInputs.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-relume-ink">
          <strong className="font-semibold">Missing:</strong> {assessment.missingInputs.join(", ")}
        </p>
      )}
      {assessment.requiredAction.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-relume-muted">
          <strong className="font-semibold text-relume-ink">Required action:</strong> {assessment.requiredAction[0]}
        </p>
      )}
      {assessment.evidence.length > 0 && (
        <details className="mt-2 text-xs text-relume-muted">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-relume-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            Evidence ({assessment.evidence.length})
          </summary>
          <dl className="space-y-2 pb-2">
            {assessment.evidence.map((item) => (
              <div key={item.id}>
                <dt className="font-semibold text-relume-ink">
                  {item.label} <span className="font-mono text-[10px] text-relume-muted">{item.status}</span>
                </dt>
                <dd className="mt-0.5 leading-5">{item.note}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </li>
  )
}

export default function SuitabilitySummaryPanel() {
  const parcel = useParcelContext()
  const isSample = parcel === null
  const effectiveParcel = parcel ?? suitabilitySampleParcel

  const shell = useMemo(() => recommendBuildingShells(parcel, 1)[0]?.shell ?? buildingShellCatalog[0], [parcel])
  const template = useMemo(() => getBuildingTemplateByShellId(shell.id), [shell.id])
  const templateInputs = useMemo(
    () => (isSample ? buildSampleTemplateInputs(template) : buildProjectContextTemplateInputs()),
    [isSample, template],
  )
  const jurisdictionPack = useMemo(() => getJurisdictionPack("india"), [])
  const environmentalContext = useMemo(
    () =>
      buildEnvironmentalContext({
        parcel: effectiveParcel,
        sampleFallbackOrigin: sampleSiteContext.center,
        osmSampleCentre: sampleSiteContext.center,
        osm: {
          sourceDate: sampleSiteContext.source.queriedAt,
          license: sampleSiteContext.source.license,
          attribution: sampleSiteContext.tile.attribution,
          isLiveFetch: false,
        },
      }),
    [effectiveParcel],
  )
  const geotechnicalAssessment = useMemo(() => createUnknownGeotechnicalScreening(), [])
  const evaluatedAt = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const result = useMemo(
    () =>
      assessBuildingTemplateSuitability({
        template,
        templateInputs,
        parcel: effectiveParcel,
        jurisdictionPack,
        environmentalContext,
        geotechnicalAssessment,
        // An unloaded Project Context has no verified procurement or site
        // logistics record. Keep both dimensions UNKNOWN even in the visual
        // sample instead of turning a synthetic assumption into SUPPORT.
        supply: null,
        delivery: null,
        evaluatedAt,
      }),
    [template, templateInputs, effectiveParcel, jurisdictionPack, environmentalContext, geotechnicalAssessment, evaluatedAt],
  )

  return (
    <section
      className="rounded-relume border border-relume-border bg-relume-surface-secondary p-5 sm:p-6"
      aria-labelledby="suitability-summary-heading"
      data-suitability-summary
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio · building-template suitability</p>
          <h2 id="suitability-summary-heading" className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink">
            Suitability across seven evidence-linked dimensions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-relume-ink">
            Physical fit, planning, environmental, structural, geotechnical, supply and delivery each resolve SUPPORTED, CONDITIONAL, BLOCKED, UNKNOWN or STALE from
            recorded evidence. The single weakest dimension governs the overall result. Nothing here infers legal, structural or regulatory compliance.
          </p>
        </div>
        <div
          className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4"
          data-suitability-mode={isSample ? "sample-fixture" : "project-context"}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{isSample ? "Sample fixture" : "Project context"}</p>
          <p className="mt-1 text-sm font-semibold text-relume-ink">
            {effectiveParcel.district}, {effectiveParcel.state}
          </p>
          <p className="mt-1 text-xs leading-5 text-relume-muted">{template.name}</p>
        </div>
      </div>

      {isSample && (
        <p className="mt-4 rounded-relume border border-relume-border bg-relume-surface p-3 text-xs font-semibold leading-5 text-relume-ink" role="status">
          {SAMPLE_FIXTURE_NOTE}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-relume border border-relume-border bg-relume-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Overall</p>
        <span
          className="rounded-full border border-relume-border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-relume-ink"
          data-suitability-overall-state={result.overallState}
        >
          {stateLabels[result.overallState]}
        </span>
        <p className="text-xs leading-5 text-relume-muted">
          Governed by <strong className="font-semibold text-relume-ink">{dimensionLabels[result.governingDimension]}</strong>, the weakest of the seven dimensions.
        </p>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Suitability dimensions" data-suitability-dimensions>
        {result.dimensions.map((assessment) => (
          <DimensionCard key={assessment.dimension} assessment={assessment} />
        ))}
      </ul>

      <div className="mt-5 grid gap-3 border-t border-relume-border pt-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Change impact">
        <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Evidence reused</p>
          <p className="mt-2 text-sm text-relume-ink">
            {result.changeImpact.evidenceReused.length ? result.changeImpact.evidenceReused.map((dimension) => dimensionLabels[dimension]).join(", ") : "None"}
          </p>
        </div>
        <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Recheck required</p>
          <p className="mt-2 text-sm text-relume-ink">
            {result.changeImpact.recheckRequired.length ? result.changeImpact.recheckRequired.map((dimension) => dimensionLabels[dimension]).join(", ") : "None"}
          </p>
        </div>
        <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Recomputation required</p>
          <p className="mt-2 text-sm text-relume-ink">
            {result.changeImpact.recomputationRequired.length ? result.changeImpact.recomputationRequired.join(", ") : "None"}
          </p>
        </div>
        <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Professional review required</p>
          <p className="mt-2 text-sm text-relume-ink">
            {result.changeImpact.professionalReviewRequired.length
              ? result.changeImpact.professionalReviewRequired.map((dimension) => dimensionLabels[dimension]).join(", ")
              : "None"}
          </p>
        </div>
      </div>

      {result.changeImpact.missingInputs.length > 0 && (
        <p className="mt-3 text-xs leading-5 text-relume-muted">
          <strong className="font-semibold text-relume-ink">Missing inputs:</strong> {result.changeImpact.missingInputs.join(", ")}
        </p>
      )}

      <p className="mt-5 border-t border-relume-border pt-4 text-xs font-semibold leading-5 text-relume-ink">
        INDICATIVE — not a legal, structural or regulatory compliance determination. A named professional review remains required wherever this summary marks one.
      </p>
    </section>
  )
}
