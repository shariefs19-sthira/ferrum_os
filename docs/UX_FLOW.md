# UX_FLOW.md — Six-phase UX north-star (agreed 2026-09-04)

Reference document for the Workspace experience, cited as the acceptance
standard for docs/TASK_BOARD.md rows W-16, W-19, W-21, W-22, W-24,
W-25, W-26, W-27, W-28, W-29, W-30, and W-31 (see
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

## (2.5) Diligence gate (before the DesignStudio bridge)
Inserted 2026-09-04, between Location-aware forecast and Cockpit.
Before the "Open in DesignStudio with these parameters" bridge commits
the user forward, a diligence gate surfaces the buy-stage permissions
picture for the parcel: the DILIGENCE tab's compliance table (per
docs/TASK_BOARD.md W-24's COMPLIANCE_ENGINE output — authority, stage,
indicative timeline/fees, documents checklist, all INDICATIVE-labeled
per the 2026.1-SAMPLE ruleset) is available at this point in the flow,
not only later inside the cockpit. This lets a user see what buying the
parcel actually requires before they invest effort designing on it.

## (3) Cockpit as default project view
Once a project exists, the cockpit (not the marketing/dashboard page)
is the default view. Per docs/TASK_BOARD.md W-26 ROUTING_FLIP
(2026-09-04, top-of-board priority): `/project-workspace` itself
renders the cockpit immediately, with a preview session auto-created
so there's always a real project to render into — the project list
that used to live at `/project-workspace` demotes to
`/project-workspace/projects`. Five sketch regions:
- **Top strip** — a 10-tab rail (per RIVET's `TabRail` component).
- **Right** — a tools ruler (`ToolsRuler`).
- **Center** — the 3D archviz space, with plan and axonometric ("axo")
  viewports (per docs/TASK_BOARD.md W-22's ARCHVIZ_GRAPHICS quality
  bar: PBR materials, an IBL sun, a reflective podium surface,
  instanced greenery, within an fps budget).
- **Bottom-left** — a more-tools drawer (`MoreDrawer`).
- **Bottom, full-width** — a data-extract panel for whichever product
  is currently highlighted (`ExtractPanel`).

## (4) Conversation-first interaction loop (rewritten 2026-09-04)
The command bar (RIVET's `CommandBar`, docs/TASK_BOARD.md W-09) is THE
primary way a user drives the cockpit — not one input option among
several, per docs/TASK_BOARD.md W-27 CONVERSATIONAL_PRIMARY. Three
entry points feed the same underlying pipeline:

- **Text.** A typed phrase, resolved per docs/WORKSPACE_SPEC.md §5's
  intent phrase list, extended (W-27) to the full parameter set: floors,
  plot width/depth, setback, use, room bias, and free-form adjustments
  ("make it Vaastu-friendlier").
- **Voice.** The browser Web Speech API where supported; its transcript
  feeds the identical text pipeline, not a separate one. Where
  unsupported, an honest chip says so — never a silent no-op.
- **Guided option chips (docs/TASK_BOARD.md W-28 GUIDED_OPTIONS).** When
  the user gives no text or voice input, the cockpit offers constrained
  option chips, one decision point at a time, in order: use → floors →
  massing style → rooms split → compliance add-ons. Every offered
  option is derived from the ruleset (W-24's COMPLIANCE_ENGINE plus the
  parcel's real FAR/DCR/setback data) — only legally/feasibly buildable
  choices are ever shown as tappable, so an infeasible option is never
  offered in the first place. This is the flow's stand-out claim: the
  site does the modelling, the user picks from real, pre-validated
  choices.

All three entry points resolve through the same intent API (W-08) onto
§4's CRUD/artifact contracts, and every resolved intent drives the
deterministic engine so the building reshapes live in the 3D space —
not a form submit, an immediate visual update.

**Manual sliders are demoted, not deleted.** The direct-manipulation
slider controls that predate this rewrite move to More → Advanced
(RIVET's `MoreDrawer`) for users who want them; they are removed from
the cockpit's default view. A first-time or default-view user sees
conversation and guided options first — sliders are an opt-in power
surface, not the default interaction model.

**The questionnaire is KB-grounded (2026-09-04).** Every option W-28's
guided chips offer, and every clause the assistant cites in a W-27
conversational reply, resolves against docs/TASK_BOARD.md W-29's
versioned knowledge base (NBC 2016, IS 456/875/1893, SP 7, four city
DCR samples, dimensional-standards tables) and W-30's vocabulary
ontology (so the same underlying fact reads correctly whichever
professional term the current stage uses) — not a free-floating
assistant answer with no traceable source. If a future LLM layer (W-31,
gated on its own separate approval) is added, it stays strictly a
language layer over this same grounded data; it never originates a
number or option on its own.

## (4.5) Permits tracker (alongside design)
Inserted 2026-09-04, between the command bar/intent loop and Save/
export/share. While a project is under active design, the PERMITS tab
(per docs/TASK_BOARD.md W-25 PERMISSIONS_TABS) sits alongside the
design loop, not gating it — the build-stage compliance table (same
COMPLIANCE_ENGINE source as the (2.5) diligence gate, filtered to
BUILD-stage items) stays visible and updatable as the design changes,
with its own add-on-service CTAs (lead-capture, INDICATIVE chip) and a
status-tracker column reserved for a later service-mode feature. This
phase runs in parallel with (4), not sequentially after it — a user can
check permits status at any point during design without leaving the
loop.

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
