# UX_FLOW.md — Six-phase UX north-star (agreed 2026-09-04)

Reference document for the Workspace experience, cited as the acceptance
standard for docs/TASK_BOARD.md rows W-16, W-19, W-21, and W-22 (see
Notes at the end — W-19 and W-21 are referenced here as the operator's
own citations but are not yet seeded rows on the board as of this
writing; SCRIBE has not invented their scope beyond what's named below).

## (1) Discovery
The ULPIN/Bhu-Aadhaar lookup is the primary hero interaction (per
AGENTS.md RULE 29's Feature Conservation addendum and
docs/TASK_BOARD.md's W-16). A successful lookup produces a land record
card carrying its provenance (source, freshness, INDICATIVE/VERIFIED
status per docs/WORKSPACE_SPEC.md's Artifact model).

## (2) Location-aware forecast
From the land record: a pin/buffer interaction over the parcel drives a
zoning/FAR/coverage read, which produces a proposed building type with
its reasoning shown (not just an output number). A bridge action —
"Open in DesignStudio with these parameters" — carries the forecast's
inputs forward into the Workspace cockpit rather than requiring the
user to re-enter them.

## (3) Cockpit as default project view
Once a project exists, the cockpit (not the marketing/dashboard page)
is the default view. Five sketch regions:
- **Top strip** — a 10-tab rail (per RIVET's `TabRail` component).
- **Right** — a tools ruler (`ToolsRuler`).
- **Center** — the 3D archviz space, with plan and axonometric ("axo")
  viewports (per docs/TASK_BOARD.md W-22's ARCHVIZ_GRAPHICS quality
  bar: PBR materials, an IBL sun, a reflective podium surface,
  instanced greenery, within an fps budget).
- **Bottom-left** — a more-tools drawer (`MoreDrawer`).
- **Bottom, full-width** — a data-extract panel for whichever product
  is currently highlighted (`ExtractPanel`).

## (4) Command bar + intent API interaction loop
A command bar (RIVET's `CommandBar`, docs/TASK_BOARD.md W-09) accepts a
typed intent phrase (per docs/WORKSPACE_SPEC.md §5's intent phrase
list) and resolves it against the intent API (W-08) onto §4's CRUD/
artifact contracts — the loop the cockpit runs on for every user action
beyond direct manipulation.

## (5) Save / export / share
A workspace artifact can be saved (per §1's Artifact model), exported
(DXF and IFC per `lib/ifc-export.ts` and docs/TASK_BOARD.md W-06/W-20,
PDF per the existing Analysis Engine print path), and shared.

## (6) Project list + loop back
Returning to the project list closes the loop — a user can reopen any
prior project and re-enter at phase (3), or start a new Discovery pass
at phase (1) for a different parcel.

## Honesty footer (every phase)
Every phase in this flow carries the fleet's existing numeric/unit and
preview-mode honesty obligations, not a separate standard:
- **RULE 29** (Numeric-UX sanity, plus its Feature Conservation
  addendum) — every number on screen reconciles to its real math; no
  previously-live tool is silently removed by a later phase's UI work.
- **RULE 30** (Unit duality) — every length/area value in every phase
  shows both unit systems simultaneously.
- **Preview mode** — while docs/TASK_BOARD.md W-17 (AUTH-PREVIEW) is in
  effect, every phase above is reachable and fully functional in
  preview mode, with a visible PREVIEW chip, and zero credential
  collection anywhere in the loop.

## Notes

- This document is the acceptance reference SCRIBE was instructed to
  link for W-16, W-19, W-21, and W-22. W-16 and W-22 are real,
  already-seeded docs/TASK_BOARD.md rows as of this writing. **W-19 and
  W-21 are not yet seeded rows** — the instruction linking this doc to
  them named IDs that don't exist on the board yet; SCRIBE has recorded
  the link intent here and flagged the gap in docs/TASK_BOARD.md's
  Notes section rather than inventing scope for either row. Whoever
  seeds W-19/W-21 should link back to this document's relevant phase.
- The six phases above are recorded as given, in the order given —
  SCRIBE has not reordered, merged, or expanded any phase beyond what
  was actually specified.
