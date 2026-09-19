# DesignStudio building-template suitability ranking

`apps/web/lib/designstudio/suitabilityAssessment.ts` ranks a
`BuildingTemplate` (building-library kernel) against a specific
parcel/context across seven dimensions: **physical fit, planning,
environmental, structural, geotechnical, supply, delivery**.

This module is additive and read-only with respect to existing
contracts. It never redefines or forks them - it imports and evaluates
against:

- `./buildingLibraryKernel` - `BuildingTemplate`, `ProjectTemplateInputs`,
  `TemplateEvaluation`, `evaluateTemplateForProject`.
- `../landintel/geotechnicalIntelligence` - `GeotechnicalAssessment`.
- `../workspace/parcelContext` - `ParcelContext`.
- `./environmentalContext` - `EnvironmentalContext`.
- `./jurisdictionPacks` - `JurisdictionPack`.

Supply and delivery have no prior domain contract in this codebase, so
this module defines minimal, explicitly-labelled input types
(`SupplyContext`, `DeliveryContext`) rather than inventing certainty
where none exists.

## Per-dimension states

Each dimension resolves to exactly one of:

- `SUPPORTED` - no outstanding gap is recorded for this dimension as of
  the evaluation date. Never a compliance or approval claim.
- `CONDITIONAL` - usable evidence exists but with a named limitation
  (indicative data, geometry-only fit, an available-but-unverified rule
  pack, screened-not-investigated geotechnical evidence, etc).
- `BLOCKED` - a specific fact makes the template unusable as-is
  (out-of-envelope dimensions, conflicting geotechnical evidence, no
  precomputed structural envelope, unavailable required material,
  research-required jurisdiction).
- `UNKNOWN` - required input is missing; the dimension cannot be
  evaluated.
- `STALE` - evidence exists but a recompute/review trigger has fired
  (a structural recompute trigger, an expired template review window).

**Compliance is never inferred.** The planning and physical-fit
dimensions are deliberately capped below `SUPPORTED`: an available
jurisdiction pack or an in-envelope geometry match only means the
evidence needed to *ask* the compliance question exists, never that the
answer is yes.

## Overall result

`assessBuildingTemplateSuitability()` computes `overallState` as the
single weakest dimension, ranked worst-first:
`BLOCKED > STALE > UNKNOWN > CONDITIONAL > SUPPORTED`. The
`governingDimension` field names which dimension set that result, so a
caller never has to re-derive it from the per-dimension list.

## Deterministic change-impact outputs

`changeImpact` on the aggregate result reports, deterministically from
the same inputs:

- `evidenceReused` - dimensions with no outstanding missing input that
  can be carried forward unchanged.
- `recheckRequired` - dimensions in `STALE` state.
- `recomputationRequired` - the building-library kernel's own
  `RecomputeTrigger` list (`SOIL`, `WIND`, `SEISMIC`, `SNOW`,
  `JURISDICTION`, `DIMENSIONS`, `MATERIALS`, `LOADS`, `USER CHANGE`).
- `professionalReviewRequired` - `structural`, `geotechnical` and
  `planning` whenever they are not `SUPPORTED` (they never are on their
  own evidence alone - see above).
- `missingInputs` - the de-duplicated union of every dimension's
  missing-input list.

## Tests

`apps/web/lib/designstudio/suitabilityAssessment.test.ts` covers every
dimension's boundary states (`UNKNOWN`/`BLOCKED`/`CONDITIONAL`/
`SUPPORTED`/`STALE`), the state-severity ordering, the change-impact
routing rules, and the aggregate "weakest dimension governs" behaviour.
