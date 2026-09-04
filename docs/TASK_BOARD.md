# TASK_BOARD.md — Pull-queue (AGENTS.md RULE 35)

Seeded 2026-09-04. While AGENTS.md RULE 34 (single-outcome focus) is in
effect, every row here is a Workspace row — everything else stays
DEFERRED-per-RULE-34 in docs/WAVE_QUEUE.md, not on this board at all.

Per RULE 35(2): a seat claims the top READY row it's eligible for whose
deps are DONE and whose envelope overlaps no CLAIMED row, executes,
marks DONE with SHA + live proof, then immediately pulls next. Per
RULE 35(4): seats update this board only on DONE or STUCK.

| ID | Title | Envelope (files) | Eligible seats | Acceptance | Deps | Status |
|----|-------|-------------------|-----------------|------------|------|--------|
| W-26 | ROUTING_FLIP | `apps/web/app/project-workspace/page.tsx` (route swap: cockpit becomes the default), new `apps/web/app/project-workspace/projects/page.tsx` (demoted project-list shelf) | CRANE | **TOP OF BOARD — nothing outranks it, per the operator (2026-09-04); placed as this table's first row for that reason, not appended at the end.** `/project-workspace` renders the cockpit immediately: a preview session is auto-created (per W-17's preview-mode convention, `localStorage` flag, zero credential collection) so the cockpit has a real project to render into rather than an empty state; all five sketch regions (top-strip tabs, right tools ruler, center 3D space, bottom-left more-tools drawer, bottom-full-width extract panel) are visible in one viewport. The project list (previously at `/project-workspace`) demotes to `/project-workspace/projects`. Acceptance: opening `/project-workspace` shows tabs + ruler + 3D space + extract panel + command bar together in one viewport, verified at both 1366 and 375 on the deployed edge. | — | READY — PRIORITY-JUMP |
| W-01 | Migration + save200 | D1 migration file(s), the workspace save/persist endpoint | CRANE | Migration applies clean on the deployed D1 instance; a save call returns 200 against the deployed edge, verified by an actual request, not a local smoke test | — | CLAIMED (CRANE) |
| W-02 | Add `three` dependency | `apps/web/package.json`, `pnpm-lock.yaml` | CRANE | `three` installed as the single approved new dependency (per W2-380's operator approval, RULE 1 dependency-addition rule — CRANE-only); build stays green | — | READY |
| W-03 | `lib/types.ts` integration merge | `apps/web/lib/types.ts` | CRANE | Workspace object-model types (WorkspaceProject/Artifact per WORKSPACE_SPEC.md §1) merged into the shared contract file with no breaking change to existing consumers; typecheck green | W-02 | READY |
| W-04 | page.tsx assembly — mount RIVET comps + MASON canvas | the workspace route's `page.tsx` | CRANE | RIVET's rail components and MASON's 3D canvas both mount without collision on the deployed edge; first-viewport screenshot at 1366 + 375 per RULE 24 | W-03 | READY |
| W-05 | Space3D three-integration + gates + proofs | the 3D configurator component(s) (MASON's S4/three.js piece, folded from W2-384 into W2-401) | MASON | Plot-anchored 3D view renders on the deployed edge; RULE 2 structural pass/fail gate wired live; RULE 29/30 numeric/unit obligations verified on-screen; live proof attached | W-02 | READY |
| W-06 | ExportBar — IFC/DXF | export UI component + wiring to `lib/ifc-export.ts` | MASON | Export control produces a real IFC and DXF file from a live workspace artifact, not a stub; verified against the deployed edge. Gated on W-20's bundle-safety result (2026-09-04): if W-20 passes, this row wires the existing writer in as-is; if it fails, this row waits for MASON's browser-only rewrite from W-20 instead | W-20 | READY |
| W-07 | Wire components into workspace route | workspace route wiring (RIVET's rails + CRANE's page.tsx assembly) | RIVET | RIVET's components are live-reachable through the assembled route on the deployed edge; no dead mounts | W-04 | READY |
| W-08 | Intent API | new Worker route implementing WORKSPACE_SPEC.md §5's intent-phrase routing onto §4's contracts | CRANE | Each §5 intent phrase's mapped contract call succeeds against the deployed Worker; 400s behave per §4 | — | READY |
| W-09 | Command bar UI | command-bar component consuming W-08's intent API | RIVET | A typed phrase from §5's list resolves to the correct §4 action, verified live; first-viewport screenshot per RULE 24 | W-08 | READY |
| W-10 | ATLAS 8-step battery | none (audit only — no source envelope claimed) | ATLAS | Independent audit of W-07 and W-09 against WORKSPACE_SPEC.md §6's acceptance checklist; 8-step battery results logged on this row, no self-certification by CRANE/MASON/RIVET | W-07, W-09 | READY |
| W-11 | Workspace shelf EMPTY-STATE | workspace shelf component (signed-out view + sample-artifact CTA) | RIVET | Signed-out visitors to the workspace shelf see a real empty-state (not a bare box) with a sample-artifact CTA; verified on the deployed edge — direct response to the operator's live observation of a bare empty box | — | READY |
| W-12 | Keyboard fit-model control | 3D configurator input handling (keyboard controls for fit-to-model) | MASON | A keyboard shortcut/control fits the model view in the 3D configurator, verified live; accessibility note per RULE 28/29 conventions where applicable | — | READY |
| W-13 | View-state permalinks | workspace view-state serialization + URL routing | MASON | A workspace view's current state (camera/selection/artifact) round-trips through a shareable permalink URL, verified live | — | READY |
| W-14 | AQ-RIVET-004 app-link diagnostic | mobile app-link wiring (apps/mobile/**, per RIVET's exclusive paths) | RIVET | Diagnose and fix the app-link issue per AQ-RIVET-004. Note: the underlying AQ-RIVET-004 proposal's actual text is not on disk in this session — SCRIBE has not seen its full scope, only the label given. RIVET should confirm scope against its own proposal record before executing, per the same practice used for AQ-RIVET-001 | — | READY |
| W-16 | LANDINTEL RESTORE | `apps/web/app/products/landintel/page.tsx` (hero + featureItems/howItWorksSteps/FAQ copy) | RIVET | `UlpinMapExplorer` (real D1-backed ULPIN/Bhu-Aadhaar lookup) returns as the PRIMARY hero tool, with sample chips + Lookup control + a result card carrying its provenance strip; `SteppedForecastModule` (land-use forecast) stays live as a SECONDARY panel, not removed; both tools live and dual-unit (RULE 30) on the deployed edge; honesty chips (INDICATIVE/VERIFIED) present on both. Forensics: commit `331c1b08` (W2-372 UI_UX_MODERNIZATION, 2026-09-04) is confirmed via `git log -S "ULPIN"`/`git show` as the commit that replaced the lookup with the forecast module — logged as a friction entry in docs/TASK_REPORTS.md, not just fixed silently. Acceptance: first-viewport screenshot at 1366+375 shows the lookup first; a real lookup executes against the deployed edge; the forecast module is still present and functional below/beside it. | — | READY |
| W-17 | AUTH-PREVIEW | `apps/web/app/signup/page.tsx`, `apps/web/app/login/page.tsx` (form removal + preview gate); Log in / Start Free Trial CTA targets sitewide; workspace + account surface PREVIEW chip | RIVET | Zero credential inputs (no email/password fields, nothing collected) on both `/signup` and `/login` at 1366+375 — both routes replaced with an honest preview gate carrying the copy "Accounts arrive with the live release — explore everything now in preview" and one "Enter preview" action that sets a `localStorage` session flag only. Every Log in / Start Free Trial CTA sitewide routes to the preview gate, not a credential form. Workspace and account surfaces open in preview mode with a visible PREVIEW chip. Real auth (email+password, hashed, sessions) is explicitly NOT this row's scope — it stays a separate roadmap row for post-live. **Discrepancy flagged, not silently overridden (RULE 27):** docs/WAVE_QUEUE.md's W2-326 AUTH_COMPLETE row already shows DONE with a landing SHA (`4ef78791`, PBKDF2/WebCrypto password auth, sessions, verify/reset flows) — real backend auth code already exists on `origin/main`. This row does not touch or remove that backend; it hides the *frontend* credential-collection surface behind a preview gate per the operator's explicit instruction, pending an operator-set "live release" milestone. RIVET/whoever executes this should not delete or revert W2-326's backend work — only the two page UIs and the CTA routing change. | — | READY |
| W-20 | IFC EXPORT: bundle-safety gate before build-vs-reuse decision | `apps/web/lib/ifc-export.ts` (test/bundle harness only — no production code changes until the gate result is known); `apps/web/components/workspace/ExportBar.tsx` (W-06) is downstream, not this row's envelope | CRANE | **MASON's proposal, verbatim as given to SCRIBE:** a browser-only STEP writer, separating a validation-only `web-ifc` path from the client export path. **CRANE's counter-finding, given as this row's acceptance note:** `lib/ifc-export.ts` already writes STEP/SPF text directly (plain string generation, not `web-ifc`'s typed schema classes, which SCRIBE confirmed by reading the file are noted there as non-constructable at this `web-ifc` version) — so before either proposal is built, Step 1 of this row is a Workers-bundle test proving the *writer* path is actually browser/Workers-safe with zero runtime deps in that path. SCRIBE's own disk check of the file found one real risk worth testing, not assuming away: `getWebIfc()` (used only for the round-trip *verification* path, not the writer) calls `createRequire`/Node's `module` built-in to force-load `web-ifc`'s Node build — a Node-only mechanism that would not survive a Workers/browser bundle if that function or its import got pulled in by the bundler. The test must confirm the bundle only pulls in the writer path, not `getWebIfc()`. If the bundle-safety test passes clean: this row becomes "wire the existing `lib/ifc-export.ts` writer into ExportBar (W-06)," NOT a duplicate rewrite of a browser-only STEP writer from scratch — MASON's proposal is then satisfied by reuse, not new code. If the test fails (the writer path itself pulls in something Node-only): MASON's original browser-only-writer proposal proceeds as planned, since the reuse premise would be false. | — | Step 1 DONE, result FAIL (see TASK_REPORTS.md) — bundler resolves `getWebIfc()`'s `createRequire`/`import('module')` even though the test entry only imported `exportMassingToIfc`, because it lives in the same file. Per this row's own decision rule: MASON's original browser-only-writer proposal proceeds. Flagged alternative (splitting `getWebIfc`/`countIfcGeometry` into their own file) not verified, out of this row's test-only envelope. |
| W-22 | ARCHVIZ_GRAPHICS | the 3D configurator's rendering pipeline (center viewport per docs/UX_FLOW.md phase 3) | MASON | Quality bar, as given: multiple viewports (plan + axonometric), a PBR material set, an IBL (image-based lighting) sun, a reflective podium surface, instanced greenery, all within a stated fps budget. **Acceptance (amended by the operator, 2026-09-04): the described quality bar + a headless screenshot + an fps probe — no reference-image-file dependency.** (An earlier draft of this row cited a `docs/references/graphics_target.png` region/palette diff; the operator withdrew that dependency before this row was finalized, so no such file is required or was fabricated.) Acceptance reference: docs/UX_FLOW.md phase (3)'s center-viewport description. | three (already-approved dependency, W2-380), W-21 | READY (W-21 not yet seeded — see Notes) |
| W-23 | NODE_PANEL | n/a — roadmap only, no envelope claimed | (unassigned) | Dynamo-style visual parametrics node panel. **Status: ROADMAP-LABEL, as given** — not a pull-eligible READY row under RULE 35; recorded here (rather than only in docs/WAVE_QUEUE.md) because the operator named it with a board-style ID. No seat claims this row while it carries ROADMAP-LABEL status. | — | ROADMAP-LABEL |
| W-24 | COMPLIANCE_ENGINE | new lib module (parcel + building type → permissions ruleset engine) | CRANE or MASON | Deterministic ruleset: given a parcel + building type, returns a permissions list where each item carries authority, stage (BUY or BUILD), an indicative timeline/fees figure, and a documents checklist. Sourced from the existing `2026.1-SAMPLE` versioned ruleset (per `apps/web/lib/parcelIntel/sampleRulesets.ts`, confirmed on disk — not a new ruleset invented for this row). Unit-tested against known-good/known-bad vectors. Every output item honesty-labeled (INDICATIVE, matching the sample ruleset's own version tag) per RULE 5/29 — no permission item may read as verified/current-government-rate when it's derived from the 2026.1-SAMPLE set. | — | READY |
| W-25 | PERMISSIONS_TABS | cockpit 10-slot top-strip tabs (two new: DILIGENCE, PERMITS); bottom extract panel (per-tab compliance table render) | RIVET or MASON | Two new cockpit tabs in the 10-slot top strip: **DILIGENCE** (buy-stage) and **PERMITS** (build-stage). The bottom, full-width extract panel renders W-24's compliance table filtered to whichever of the two tabs is highlighted. Each table row carries an add-on-service CTA (a lead-capture action, INDICATIVE chip per RULE 5/29 — no add-on service may read as already fulfilled) and a status-tracker column reserved for a later service-mode feature (column present and correctly labeled now; the tracking logic itself is out of this row's scope). Depends on W-24 existing to have real data to render. | W-24 | READY |

## Notes

- Envelopes are deliberately scoped to avoid overlap per RULE 35(2)'s
  claim rule; CRANE holds `lib/types.ts` (W-03) as the sole editor of
  that shared contract file until it marks W-03 DONE, per RULE 35(5) —
  RIVET and MASON's rows do not touch it.
- W-01 was already CLAIMED (CRANE) at seeding time per the operator's
  instruction — not a claim SCRIBE made on CRANE's behalf beyond
  recording what was stated.
- No row here supersedes docs/WAVE_QUEUE.md; it remains the permanent
  ledger of record. This board is the pull-queue mechanism RULE 35
  layers on top of it while RULE 34's Workspace focus is in effect.
- W-11..W-14 (added 2026-09-04 per AGENTS.md RULE 36's observe-refine
  loop) are operator live-site observations, converted directly to
  board rows without a seat relay, per RULE 36(1). Each DONE among
  them gets a docs/TASK_REPORTS.md entry per RULE 36(3), same as every
  other row.
- W-16 (added 2026-09-04, same RULE 36 mechanism) restores a tool a
  sweep actually removed — see AGENTS.md RULE 29's Feature Conservation
  addendum and docs/LIVE_TOOLS_REGISTRY.md. Assigned RIVET (the
  operator's instruction allowed MASON or RIVET; SCRIBE assigned RIVET
  as the seat already carrying similar UI-restoration work on W-11).
  W-15 is intentionally unused here — not seeded by this instruction,
  left open for the next observation.
- W-20 (added 2026-09-04) exists to resolve a MASON-vs-CRANE
  build-vs-reuse disagreement on IFC export before either side writes
  more code — assigned CRANE since the gate tests CRANE's own existing
  file; W-06 (ExportBar, MASON) is downstream and blocked on this
  row's result, not touched by it directly.
- **W-18, W-19, W-21 do not exist as seeded rows** as of 2026-09-04,
  despite being referenced by ID in later instructions (W-22's original
  dependency list named W-21; docs/UX_FLOW.md was asked to be linked as
  an acceptance reference for W-19 and W-21 specifically). SCRIBE has
  not invented scope for any of the three to fill the gap — flagged
  here, on W-22's row, and in docs/UX_FLOW.md's own Notes section
  instead. Whoever defines W-18/W-19/W-21 should seed them for real and
  update W-22's Deps column and UX_FLOW.md's references once they
  exist.
- W-22 and W-23 (added 2026-09-04) were seeded across two messages —
  the first gave the row content and an acceptance criterion citing a
  reference image file; a follow-up message from the same operator
  amended W-22's acceptance to drop that file dependency before this
  board was pushed. The row above reflects the amended (final)
  acceptance only; the withdrawn reference-file version was never
  committed.
- W-24/W-25 (added 2026-09-04) were seeded with a choice of eligible
  seat ("CRANE or MASON" / "RIVET or MASON") left open by the
  operator, per this board's own convention of not force-assigning
  when the instruction itself offers a choice — whichever seat pulls
  first per RULE 35(2) claims it.
- W-26 (added 2026-09-04) is deliberately placed as this table's
  literal first row and carries a non-standard Status value
  ("READY — PRIORITY-JUMP", mirroring docs/WAVE_QUEUE.md's existing
  PRIORITY-JUMP convention, e.g. W2-375) because the operator stated
  explicitly that nothing outranks it. CRANE should claim and pull
  this row ahead of any other CRANE-eligible READY row, including
  ones with an earlier ID.
