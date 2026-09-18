# Design/import compatibility registry + intake-state evaluator

Two isolated modules, no dependency on or edit to the existing OpenBIM
ingestion code (`lib/ifcIntake.ts`, `lib/modelIntake.ts`, `lib/ifc-export.ts`,
`lib/dxf/`):

- `designImportCompatRegistry.ts` — a capability contract per industry file
  format: parser availability, geometry fidelity, units/CRS/datum/origin/
  revision requirement levels, applicable geometry-warning categories, and
  registered downstream artifact consumers.
- `designIntakeStateEvaluator.ts` — reads the registry and decides, for one
  imported file, what approval state it can honestly reach, plus the
  downstream stale-impact rule for when that file later changes.

## Ground rule

**No parser for any format is implemented in this repo.** Every registry
entry states what's truthfully possible today, not what's aspirational:

| Tier | Meaning |
|---|---|
| `NO_PARSER_OPEN_TEXT` / `NO_PARSER_OPEN_BINARY` | Open, documented format; structurally parseable; no reader built yet. |
| `METADATA_ONLY` | Proprietary binary (DWG, DGN); only file-level metadata is honest — no geometry access. |
| `REFERENCE_ONLY` | Proprietary and effectively closed (RVT); tracked as a pointer only, never opened. |
| `TABULAR_TEXT` | Plain delimited text (CSV); attribute-only, never geometry. |
| `DOCUMENT_ONLY` | A rendered document (PDF); reference only. |

Because no format has a verified native geometry parser, **`APPROVED_FOR_MACHINE`
is unreachable for every format today** — the evaluator caps at `VALIDATED`
for open/structured formats (`NO_PARSER_OPEN_TEXT`/`NO_PARSER_OPEN_BINARY`/
`TABULAR_TEXT`) and at `PREVIEWED` for anything opaque or unopened
(`METADATA_ONLY`, `REFERENCE_ONLY`, `DOCUMENT_ONLY`) — since for those,
"no warning found" would only mean "never checked," not "checked and clean."
The specific reason is stated in `blockedReasons` rather than silently
allowing the top state or hiding the gap.

## Approval states

`PREVIEWED` → `VALIDATED` → `APPROVED_FOR_MACHINE`

- **PREVIEWED**: format recognized; no metadata or geometry checks required.
- **VALIDATED**: every `REQUIRED` metadata field for the format is present
  (per `designImportCompatRegistry.ts`'s `requirements`) and no `BLOCKING`
  geometry warning is outstanding.
- **APPROVED_FOR_MACHINE**: `VALIDATED`, plus a verified native geometry
  parser for the format — not present for any format in this registry yet.

## Downstream stale-impact rule

`computeStaleImpact(formatId, changeKind)` marks **every** downstream
artifact consumer registered for that format (`downstreamConsumers`) as
stale on any change (`REVISION_BUMP`, `APPROVAL_DOWNGRADE`,
`NEW_BLOCKING_WARNING`, `FILE_REPLACED`). This repo has no dependency graph
finer than "derived from this import," so the rule is deliberately
conservative rather than guessing at partial invalidation it can't verify.

## Formats covered

IFC, DXF, DWG (metadata-only), RVT (reference-only), DGN (metadata-only),
LandXML, gbXML, BCF, SAF, STEP, STL, OBJ, glTF/GLB, CSV, PDF (document-only).

## Tests

`designImportCompatRegistry.test.ts`, `designIntakeStateEvaluator.test.ts` —
run via `pnpm --filter ./apps/web exec vitest run lib/designstudio/designImport lib/designstudio/designIntakeState`.
