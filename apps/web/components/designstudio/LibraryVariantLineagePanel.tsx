"use client"

import { useMemo } from "react"
import type { ReactNode } from "react"
import { useParcelContext } from "../../lib/workspace/parcelContext"
import { buildingShellCatalog, recommendBuildingShells } from "../../lib/designstudio/shellCatalog"
import { getBuildingTemplateByShellId } from "../../lib/designstudio/buildingLibraryKernel"
import { computeValidationState, validationStateAtLeast, type ParameterDelta, type ValidationState } from "../../lib/designstudio/libraryEvolutionContract"
import {
  LIBRARY_VARIANT_SAMPLE_NOTE,
  buildSampleCandidate,
  evaluateSamplePromotionGate,
} from "../../lib/designstudio/libraryVariantSampleFixture"

const validationSteps: ReadonlyArray<{ state: ValidationState; label: string; meaning: string }> = [
  { state: "GENERATED", label: "GENERATED", meaning: "Derived by deterministic parameter edits to an approved parent. Nothing has been checked." },
  { state: "GEOMETRY_CHECKED", label: "GEOMETRY CHECKED", meaning: "Requires a recorded geometry-check identifier. Not a structural result." },
  { state: "ENGINEERING_VERIFIED", label: "ENGINEERING VERIFIED", meaning: "Requires a recorded engineering-verification identifier from a named professional." },
  { state: "APPROVED_FOR_ISSUE", label: "APPROVED FOR ISSUE", meaning: "Requires an identified human approval record on top of the checks above." },
]

const consentLabels = {
  NOT_GRANTED: "NOT GRANTED",
  RETRIEVAL_ONLY: "RETRIEVAL ONLY",
  TRAINING_OPT_IN: "TRAINING OPT-IN",
} as const

const kindLabels: Record<ParameterDelta["kind"], string> = {
  DIMENSION: "Dimension",
  MATERIAL: "Material",
  PROGRAMME: "Programme",
  OPENING: "Opening",
  STRUCTURAL_SYSTEM: "Structural system",
}

const show = (value: string | number | null) => (value === null ? "none" : String(value))

function Card({ title, children, attr }: { title: string; children: ReactNode; attr?: Record<string, string> }) {
  return (
    <div className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4" {...attr}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">{title}</p>
      <div className="mt-2 text-sm leading-6 text-relume-ink">{children}</div>
    </div>
  )
}

export default function LibraryVariantLineagePanel() {
  const parcel = useParcelContext()
  const hasProjectContext = parcel !== null

  const shell = useMemo(() => recommendBuildingShells(parcel, 1)[0]?.shell ?? buildingShellCatalog[0], [parcel])
  const template = useMemo(() => getBuildingTemplateByShellId(shell.id), [shell.id])
  const candidate = useMemo(() => buildSampleCandidate(template), [template])
  const gate = useMemo(() => evaluateSamplePromotionGate(candidate), [candidate])
  // No geometry check, engineering verification or human approval exists for a
  // sample, so this always resolves to GENERATED - it is computed, not asserted.
  const validationState = useMemo(
    () => computeValidationState({ geometryCheckId: null, engineeringVerificationId: null, humanApprovalId: null }),
    [],
  )

  const { lineage, intentFacets: facets, deltas, licence, consent, provenance } = candidate

  return (
    <section
      className="rounded-relume border border-relume-border bg-relume-surface-secondary p-5 sm:p-6"
      aria-labelledby="library-variant-heading"
      data-library-variant-lineage
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio · library variant lineage</p>
          <h2 id="library-variant-heading" className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink">
            How a private variant derives from an approved parent
          </h2>
          <p className="mt-3 text-sm leading-6 text-relume-ink">
            A variant is a private candidate produced by deterministic parameter edits to an approved library template. It never becomes shared library content, and never
            advances past GENERATED, without recorded checks and a named human reviewer.
          </p>
        </div>
        <div
          className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4"
          data-library-variant-mode={hasProjectContext ? "project-context-parent" : "sample-fixture"}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">
            {hasProjectContext ? "Project context · sample intent" : "Sample fixture"}
          </p>
          <p className="mt-1 text-sm font-semibold text-relume-ink">INDICATIVE</p>
        </div>
      </div>

      <p className="mt-4 rounded-relume border border-relume-border bg-relume-surface p-3 text-xs font-semibold leading-5 text-relume-ink" role="status">
        {LIBRARY_VARIANT_SAMPLE_NOTE}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Card title="Parent template / version" attr={{ "data-library-variant-parent": "" }}>
          <p className="break-words font-semibold">{template.name}</p>
          <p className="mt-1 break-all font-mono text-xs text-relume-muted">
            {lineage.parentTemplateId} · v{lineage.parentTemplateVersion}
          </p>
          <p className="mt-1 text-xs text-relume-muted">
            Parent variant: {lineage.parentVariantId ?? "none (derived directly from the template)"} · lineage depth {lineage.depth}
          </p>
        </Card>
        <Card title="Candidate variant" attr={{ "data-library-variant-state": candidate.libraryState }}>
          <p className="break-all font-mono text-xs">{candidate.variantId}</p>
          <p className="mt-1 text-xs text-relume-muted">
            {candidate.libraryState.replace(/_/g, " ")} · method {provenance.generationMethod.replace(/_/g, " ").toLowerCase()}
          </p>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card title="Intent facets" attr={{ "data-library-variant-intent": "" }}>
          <dl className="space-y-1 text-xs">
            <div><dt className="inline font-semibold">Building type: </dt><dd className="inline">{facets.buildingType}</dd></div>
            <div><dt className="inline font-semibold">Programme: </dt><dd className="inline break-words">{facets.programme.join(", ")}</dd></div>
            <div><dt className="inline font-semibold">Occupancy: </dt><dd className="inline">{facets.occupancy}</dd></div>
            <div><dt className="inline font-semibold">Floors: </dt><dd className="inline">{facets.targetFloorCount}</dd></div>
            <div><dt className="inline font-semibold">Gross floor area: </dt><dd className="inline">{facets.targetGrossFloorAreaSqm} m²</dd></div>
            <div><dt className="inline font-semibold">Materials: </dt><dd className="inline break-words">{facets.materialPreferences.join(", ")}</dd></div>
            <div><dt className="inline font-semibold">Openings: </dt><dd className="inline break-words">{facets.openingPreferences.join(", ") || "none"}</dd></div>
            <div><dt className="inline font-semibold">Structural preference: </dt><dd className="inline">{facets.structuralSystemPreference ?? "none stated"}</dd></div>
          </dl>
        </Card>
        <Card title={`Derived parameter deltas (${deltas.length})`} attr={{ "data-library-variant-deltas": "" }}>
          {deltas.length === 0 ? (
            <p className="text-xs">No differences from the parent baseline.</p>
          ) : (
            <ul className="space-y-1.5 text-xs" aria-label="Parameter deltas">
              {deltas.map((delta, index) => (
                <li key={`${delta.path}-${index}`} data-library-variant-delta={delta.kind} className="break-words">
                  <span className="font-semibold">{kindLabels[delta.kind]}</span> · <span className="font-mono">{delta.path}</span>: {show(delta.fromValue)} → {show(delta.toValue)}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] leading-5 text-relume-muted">Each delta is a literal field comparison against the parent baseline; no model is consulted.</p>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Card title="Provenance" attr={{ "data-library-variant-provenance": "" }}>
          <p className="text-xs">Derived from: {provenance.derivedFrom.replace(/_/g, " ").toLowerCase()}</p>
          <p className="mt-1 break-words text-xs text-relume-muted">{provenance.copyrightBoundary}</p>
        </Card>
        <Card title="Licence" attr={{ "data-library-variant-licence": licence.rightsBasis }}>
          <p className="text-xs">{licence.rightsBasis.replace(/_/g, " ")}</p>
          <p className="mt-1 break-all text-xs text-relume-muted">Inherited from {licence.inheritedFromLicenceId}</p>
          <p className="mt-1 text-xs text-relume-muted">Public library reuse: {licence.reusableInPublicLibrary ? "permitted" : "not permitted"}</p>
          {licence.restrictions.map((restriction) => (
            <p key={restriction} className="mt-1 break-words text-xs text-relume-muted">{restriction}</p>
          ))}
        </Card>
        <Card title="Privacy consent" attr={{ "data-library-variant-consent": consent.state }}>
          <span className="inline-block rounded-full border border-relume-border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
            {consentLabels[consent.state]}
          </span>
          <p className="mt-2 text-xs text-relume-muted">Deriving a variant never counts as training consent. Any grant must be a separate, recorded act.</p>
        </Card>
      </div>

      <div className="mt-5 border-t border-relume-border pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Validation state — four distinct stages</p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Validation stages" data-library-variant-validation={validationState}>
          {validationSteps.map((step) => {
            const reached = validationStateAtLeast(validationState, step.state)
            return (
              <li
                key={step.state}
                className="min-w-0 rounded-relume border border-relume-border bg-relume-surface p-4"
                data-validation-step={step.state}
                data-validation-reached={reached ? "true" : "false"}
              >
                <p className="text-xs font-semibold text-relume-ink">{step.label}</p>
                <span className="mt-1 inline-block rounded-full border border-relume-border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-ink">
                  {reached ? "CURRENT" : "NOT REACHED"}
                </span>
                <p className="mt-2 text-xs leading-5 text-relume-muted">{step.meaning}</p>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="mt-5 rounded-relume border border-relume-border bg-relume-surface p-4" data-library-variant-gate={gate.allowed ? "open" : "held"}>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Human review gate</p>
          <span className="rounded-full border border-relume-border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-relume-ink">
            {gate.allowed ? "GATE SATISFIED" : "HELD — HUMAN REVIEW REQUIRED"}
          </span>
        </div>
        {gate.blockingReasons.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-relume-muted" aria-label="Promotion blockers">
            {gate.blockingReasons.map((reason) => (
              <li key={reason} className="break-words">{reason}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-5 text-relume-muted">Promotion to a shared library version has no automated approval path. This panel only reports the gate; it cannot pass it.</p>
      </div>

      <p className="mt-5 border-t border-relume-border pt-4 text-xs font-semibold leading-5 text-relume-ink">
        INDICATIVE — a GENERATED variant is not structurally verified, not approved for issue, and not a reproduction of any architect&apos;s work. Structural and
        regulatory review by a named professional remains required.
      </p>
    </section>
  )
}
