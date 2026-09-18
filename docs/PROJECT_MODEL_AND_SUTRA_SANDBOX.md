# Canonical Project Model and SUTRA sandbox

## One source model, concurrent derived work

Ferrum's source of truth is a versioned semantic Project Model, not a rendered image or a disconnected plan file. Each revision identifies the project, parent revision, SHA-256 checksum, author, project location, semantic model, generated plan/elevation views and current freeze state.

The same revision may drive parallel work in DesignStudio, Structura/FEA, BOQ Pro, ProcureHub, BuildOS and InvestFlow. Parallel computation reduces lead time; it does not remove professional gates. Each derived artifact retains its source revision and checksum, owner, evidence, assumptions and evidence status. A mismatch against the current Project Model is displayed as `STALE UPSTREAM DATA` until the artifact is recomputed and reviewed.

Release progresses one gate at a time:

`WORKING → CONCEPT FROZEN → COORDINATION FROZEN → ENGINEERING VERIFIED → APPROVED FOR ISSUE → FABRICATION/CONSTRUCTION RELEASED`

Engineering verification, issue approval and construction/fabrication release each require their own recorded evidence. A released revision remains immutable; subsequent change creates a successor revision and invalidates dependent outputs.

## Existing professional tools remain authoring sources

Ferrum accepts controlled intake from existing authoring, analysis and delivery systems. The preferred path is an open exchange standard: Revit and other BIM tools through authored IFC; survey through LandXML/IFC/XYZ; and tabular operational data through documented CSV/API contracts. AutoCAD DXF/DWG, Tekla fabrication packages, STAAD.Pro, ETABS, quantity, procurement, QA/QC and scheduling systems use bounded plugin/adapter contracts where an open exchange cannot carry the required semantics.

Every intake retains the native file and SHA-256 checksum, native revision, author, source tool and version, units, CRS, horizontal and vertical datums, bounds, parsed entity types, warnings, approval record and affected downstream artifacts. It advances through `IMPORTED → PREVIEWED → VALIDATED → ENGINEERING VERIFIED → APPROVED FOR ISSUE`. Successful rendering proves only preview; validation, engineering verification and issue approval require separate evidence.

The adapter registry is an architecture contract. It does not claim that proprietary native parsers or vendor connectors are live. Revit-native, DWG, Tekla-native/fabrication, STAAD.Pro and ETABS connectors remain explicitly gated until licensing, provider access, conformance tests and operational acceptance are complete.

## SUTRA and specialist models

SUTRA orchestrates Ferrum-native reasoning and optional connected Claude or Codex models inside a project sandbox. Every request is bound to one tenant, project and actor. The sandbox discloses only named context slices, starts read-only, treats model output as a proposal and records provider, model and version, context disclosed, retention choice and training consent.

An agent may change project state only after a human confirmation record is attached to that exact request. No sandbox model receives repository access, website administration, deployment authority or release authority. External providers cannot use Ferrum customer data for training through this sandbox.

## Lawful knowledge and controlled improvement

The knowledge layer accepts open, public-domain, licensed or customer-authorized sources. Retrieval preserves title, edition/version, jurisdiction, licence and source URI so SUTRA can cite the basis of an answer. Customer-authorized material remains tenant-isolated.

User interaction never silently changes model weights. Promotion into a learning release requires an eligible licence, explicit customer training opt-in where customer material is involved, named human review, a recorded evaluation and a versioned approved release. Failed candidates remain outside production.

## Value measure

Ferrum measures verified and coordinated deliverable coverage against the project's required artifact register. Current, source-verified and coordinated coverage are reported separately, alongside stale and unknown gaps. Duplicate drafts and unrequired outputs do not increase coverage. This ties value to controlled decisions and usable deliverables rather than raw generation volume.

The executable contracts live in `apps/web/lib/projectGraph/canonicalProjectModel.ts`, `apps/web/lib/projectGraph/professionalToolIntake.ts` and `apps/web/lib/sutra/sandboxPolicy.ts`.
