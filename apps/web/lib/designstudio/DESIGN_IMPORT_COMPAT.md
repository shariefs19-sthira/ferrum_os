# Design/import compatibility registry + intake-state evaluator

Two isolated modules. Neither edits the existing OpenBIM ingestion code
(`lib/ifcIntake.ts`, `lib/modelIntake.ts`, `lib/ifc-export.ts`, `lib/dxf/`) —
`designIntakeStateEvaluator.ts` imports `ModelIntakeState`, `EvidenceValue<T>`
and `machineReleaseChecks` from `lib/modelIntake.ts` **as types/constants
only**, to stay reconciled with the real intake state machine rather than
inventing a parallel one.

- `designImportCompatRegistry.ts` — a capability contract per industry file
  format: parser availability, geometry fidelity, units/CRS/datum/origin/
  revision requirement levels, applicable geometry-warning categories, and
  registered downstream artifact consumers.
- `designIntakeStateEvaluator.ts` — reads the registry and decides, for one
  imported file, what approval state it can honestly reach, plus the
  downstream stale-impact rule for when that file later changes.

## Ground rule

**Exactly one format has a real, implemented parser wired into this repo:
IFC, via `web-ifc 0.0.77` in `apps/web/lib/ifcIntake.ts` +
`apps/web/lib/modelIntake.ts`.** Every other format is `parserAvailability:
'NO_PARSER_*' | 'METADATA_ONLY' | 'REFERENCE_ONLY' | 'TABULAR_TEXT' |
'DOCUMENT_ONLY'` — no parser exists for them here, and the evaluator refuses
to let any evidence a caller supplies move them off `PREVIEWED`.

Even for IFC, `web-ifc` only reads schema, per-type entity counts, the
coordination-matrix origin and the declared length unit. It does **not**
extract CRS, vertical datum, geometry bounds, or evaluate geometry warnings —
`ifcIntake.ts` returns intake state `VALIDATION REQUIRED` with an empty
`approval.evidence` array on every parse, never `VALIDATED` on its own.

## Approval states (reconciled with `modelIntake.ts`'s `ModelIntakeState`)

`PREVIEWED` → `VALIDATION REQUIRED` → `VALIDATED` — `'APPROVED FOR MACHINE'`
is a real `ModelIntakeState` value this evaluator **never returns**; see
`approvedForMachineUnreachableReason`.

- **PREVIEWED**: format recognized; no parse has happened yet (or the format
  has no implemented parser at all).
- **VALIDATION REQUIRED**: a real parser ran (`parserEvidence` supplied for
  IFC) but required evidence or a human review remain open. This is where
  `ifcIntake.ts` leaves every fresh parse today.
- **VALIDATED**: every `REQUIRED` field is `EvidenceValue.status ===
  'OBSERVED'` (parser-produced) *or* named in a completed human
  `ReviewRecord.verifiedFields`, no `BLOCKING` geometry warning is
  outstanding, and the `ReviewRecord` itself has a reviewer, a timestamp and
  at least one evidence entry.

**A caller cannot reach VALIDATED by asserting plain booleans, an empty
warnings list, or `'USER PROVIDED'` declarations alone** — the evaluator's
types force structured `EvidenceValue`/`ReviewRecord` input, and
`'USER PROVIDED'` (an uploader's own unverified claim) is explicitly
insufficient, matching `ifcIntake.ts`'s own note that a declared revision
"must be confirmed against the project register."

## Why APPROVED FOR MACHINE is never computed here

Real machine release requires all six `modelIntake.machineReleaseChecks`
(exact revision/checksum selected, units/CRS/datum/control validated,
warnings closed, previous-revision reviewed, export compatibility validated,
named approver + audit evidence) — several of which (checksum/previous-
revision comparison, export compatibility) this evaluator has no way to
verify. Rather than build a partial, guessable path to that state, this
module caps at `VALIDATED` and exports
`approvedForMachineUnreachableReason` stating why.

## Downstream stale-impact rule

`computeStaleImpact(formatId, changeKind)` marks **every** downstream
artifact consumer registered for that format (`downstreamConsumers`) as
stale on any change (`REVISION_BUMP`, `APPROVAL_DOWNGRADE`,
`NEW_BLOCKING_WARNING`, `FILE_REPLACED`). This repo has no dependency graph
finer than "derived from this import," so the rule is deliberately
conservative rather than guessing at partial invalidation it can't verify.

## Formats covered

IFC (`IMPLEMENTED_METADATA_PARSER` — web-ifc 0.0.77, the only real parser),
DXF, DWG (metadata-only), RVT (reference-only), DGN (metadata-only),
LandXML, gbXML, BCF, SAF, STEP, STL, OBJ, glTF/GLB, CSV, PDF (document-only)
— all fourteen non-IFC formats are capped at `PREVIEWED` unconditionally.

## Tests

`designImportCompatRegistry.test.ts`, `designIntakeStateEvaluator.test.ts` —
covering forged/caller-supplied metadata, current IFC capability parity with
`ifcIntake.ts`, and every unsupported format's truthful `PREVIEWED` cap. Run:
`pnpm --filter ./apps/web exec vitest run lib/designstudio/designImport lib/designstudio/designIntakeState`.
