# WORKSPACE_SPEC.md — v1

Status: v1, finalized 2026-09-04 per AGENTS.md RULE 34 (single-outcome
focus — Workspace is now the fleet's sole build target until §6 below
is fully checked off live). Object model and API surface in §1 are
verbatim as supplied by the operator. The per-product artifact-type
table in §2 is derived from real docs/WAVE_QUEUE.md rows, cited inline.
§4 (contracts) and §5 (intent phrases) are mechanical derivations from
§1/§2 — no new business rules invented beyond what's already on disk.
**§3 remains explicitly incomplete** — see the flag at the end of §2 —
rather than filled in with invented content; it does not block §6's
backend/API acceptance items, only the shell's region-layout item.

For the W2-401 research addendum (six 2026-current reference products,
five sourced UI/UX patterns each), see `docs/WORKSPACE_RESEARCH.md` — a
separate document; both landed independently under the same intended
filename and were split apart on merge rather than one overwriting the
other.

## 1. Object model (verbatim, operator-supplied)

```
WorkspaceProject {
  id, name, createdAt, updatedAt,
  unitsPref: m | ft,
  primaryAreaUnit
}
  1—N
Artifact {
  id, projectId,
  type: PARCEL | MASSING | PLAN | STRUCTURAL | BOQ | INVEST | MARKET | PROCURE,
  version,
  inputs: JSON,
  outputs: JSON,
  provenance: { source, freshness, status: INDICATIVE | VERIFIED },
  savedAt,
  sourceTool,
  sourceRow,
  lineage: [prior artifact ids]
}
```

## API

```
/api/workspace/projects            CRUD
/api/workspace/projects/:id/artifacts   POST, GET
```

## 2. Artifact types — one per product requirement (derived from existing rows)

Each type below cites the disk row(s) that establish the underlying
product requirement it represents, plus the RULE 29/30 obligations that
apply to any numeric or unit-bearing field in its payload.

| Type | Fields (verbatim, operator-supplied) | Source row(s) | Provenance obligation | Units obligation |
|------|---------------------------------------|----------------|------------------------|-------------------|
| PARCEL | ulpin, state, district, area, land-use, map-ref | W2-381 S1 PARCEL_INTEL (ULPIN lookup → plot/zoning/FAR, DONE — landing marker `ea32064d`) | `area` inherits INDICATIVE until real per-parcel/per-city sources land, per W2-380's binding honesty condition | `area` is a RULE 30 field — m²/sqft/cents/guntha/ground/acre, both units visible, exact conversion constants |
| MASSING | plot-w/d, floors, setback, coverage, FSI, floor-area | W2-380 STUDIO_ENGINE parent + W2-383 S3 STYLE_LIBRARY (catalog entries emit massing params) | Sample FAR/DCR data stays INDICATIVE per W2-380's honesty condition until real sources land | `plot-w/d` and `floor-area` are RULE 30 fields (length + area duality); `coverage`/`FSI` are RULE 29 percentage/ratio fields — must reconcile to their stated base |
| PLAN | rooms, openings, elevations, dxf/ifc refs | W2-384 S4 STUDIO_3D (three.js configurator) + W2-387/1cde1750 (`lib/ifc-export.ts`, IFC4 export, landed) | `dxf/ifc refs` point to generated export artifacts, not hand-authored ones — provenance = generation tool + timestamp, not a claimed hand-verification | Room/opening dimensions are RULE 30 fields |
| STRUCTURAL | span/depth, slenderness, axial, pass/fail per check | W2-382 S2 STRUCTURAL_LIVE (constraint API, IS 456/800 checks, <100ms) | `pass/fail` is a computed result, not a claim — provenance = the specific IS-code check version applied | span/depth are RULE 30 length fields; slenderness/axial are RULE 29 numeric fields with stated precision |
| BOQ | category, region, mode, trust shares, band, median | W2-311/W2-312 BOQ Pro three-mode rate calculator (Mode 1 FERRUM, Mode 2 GOVT REFERENCE watermarked INDICATIVE, Mode 3 CUSTOM live recompute) | Mode 2 stays INDICATIVE (CPWD DSR reference, not a current government figure) per W2-311's own row text; Mode 3 is VERIFIED as pure client-side math | `trust shares` are RULE 29 fields — must sum to 100, display normalized; `band` must contain its stated `median` |
| INVEST | ticket, tenure, IRR, NPV | W2-254 Relume: InvestFlow page (product surface); IRR/NPV computation itself not yet a landed row — flagged, not assumed | IRR/NPV outputs are INDICATIVE until a dedicated computation row lands and is audited | `ticket` is a currency field (₹), RULE 29 unit-consistency applies |
| MARKET | shortlist, bands | W2-251 Relume: ProMarket (product surface; professionals marketplace) | `bands` (rate/fee bands) stay INDICATIVE absent a dedicated verified-data row | `bands` are RULE 29 fields — median-containment and reconciliation apply |
| PROCURE | vendors, qty, bands | W2-253 Relume: ProcureHub page (product surface) | `bands` (vendor rate bands) stay INDICATIVE absent a dedicated verified-data row | `qty` carries unit obligations per RULE 30 where it's an area/length quantity (e.g. material coverage) |

**Flag — not filled in:** the operator's later message referenced "the
sketch mapping above (5 regions → components)" for the WORKSPACE_SHELL
UI, but no sketch or region/component mapping was actually visible in
this session's context — SCRIBE has not seen it and has not invented
one. §3 below is a placeholder pending that content; do not treat it as
drafted.

## 3. Sketch mapping (5 regions → components) — PENDING, not fabricated

(No content here. The operator's message states a sketch exists and
that W2-401 is unblocked by its arrival, but the sketch itself was not
included in what SCRIBE received. Whoever has the actual sketch —
attached elsewhere, in a different session, or as a file not surfaced
here — should supply the 5-region breakdown so this section can be
completed for real.)

## 4. API contracts (finalized 2026-09-04)

Mechanical elaboration of §1's API surface — field names/types are
exactly §1's object model, nothing added.

```
POST /api/workspace/projects
  body:   { name: string, unitsPref: "m"|"ft", primaryAreaUnit: string }
  200:    WorkspaceProject { id, name, createdAt, updatedAt, unitsPref, primaryAreaUnit }
  400:    validation error (missing name, invalid unitsPref)

GET /api/workspace/projects
  200:    WorkspaceProject[]

GET /api/workspace/projects/:id
  200:    WorkspaceProject
  404:    not found

PATCH /api/workspace/projects/:id
  body:   partial WorkspaceProject (name / unitsPref / primaryAreaUnit)
  200:    updated WorkspaceProject
  404:    not found

DELETE /api/workspace/projects/:id
  204:    deleted
  404:    not found

POST /api/workspace/projects/:id/artifacts
  body:   { type: PARCEL|MASSING|PLAN|STRUCTURAL|BOQ|INVEST|MARKET|PROCURE,
            inputs: JSON, outputs: JSON,
            provenance: { source, freshness, status: INDICATIVE|VERIFIED },
            sourceTool, sourceRow, lineage: [artifact id, ...] }
  200:    Artifact { id, projectId, type, version, inputs, outputs,
            provenance, savedAt, sourceTool, sourceRow, lineage }
  400:    validation error (missing provenance.status, unknown type,
           a numeric/unit-bearing field in `inputs`/`outputs` missing
           its RULE 29/30 obligation per §2's per-type table)
  404:    projectId not found

GET /api/workspace/projects/:id/artifacts
  query:  ?type=<ArtifactType> (optional filter)
  200:    Artifact[] (version-descending per type, per RULE 25's
           living-resume-of-work-state expectation — the latest saved
           artifact of a type is always first)
```

Every write endpoint rejects (400) an artifact whose `provenance.status`
is absent — §2's per-type table is not optional metadata, it's a
required field on every write, enforced at the API boundary, not left to
each UI surface to remember.

## 5. Intent phrase list (finalized 2026-09-04)

Natural-language phrases a Workspace UI surface should route to the §4
contracts above — derived mechanically from the object model and the
per-type table in §2, not a new feature surface. Each phrase maps to
exactly one contract call; none of these imply UI not already implied
by §1-§4.

| Intent phrase (example user wording) | Routes to |
|---|---|
| "start a new project" / "create a workspace" | `POST /api/workspace/projects` |
| "open [project name]" / "switch to my [project]" | `GET /api/workspace/projects/:id` |
| "rename this project" / "switch to feet" / "switch to metric" | `PATCH /api/workspace/projects/:id` (name or unitsPref) |
| "delete this project" | `DELETE /api/workspace/projects/:id` |
| "save this as a parcel/massing/plan/structural check/BOQ/investment case/market shortlist/procurement list" | `POST /api/workspace/projects/:id/artifacts` with the matching `type` |
| "show me my saved plans" / "show me every BOQ I've run here" | `GET /api/workspace/projects/:id/artifacts?type=<TYPE>` |
| "what did I change since the last version" | `GET .../artifacts?type=<TYPE>` then diff `version`/`lineage` client-side — no separate diff endpoint; §4 does not define one |
| "where did this number come from" | reads the artifact's own `provenance` field (source/freshness/status) — never a separate lookup, since provenance travels on the artifact itself per §1 |

This list is intentionally scoped to CRUD + save/recall — it does not
invent a chat/command-palette feature; it only names the phrases a
future intent-router (if built) would need to resolve against the
contracts already defined above.

## 6. Acceptance checklist — Workspace LIVE-complete (RULE 25 standard)

Per AGENTS.md RULE 34, this checklist is what "LIVE-complete" means for
lifting the single-outcome focus. Every line must be true against the
**deployed edge**, not local dev or a green build — landed/committed
does not satisfy any line here.

- [ ] All five §4 project endpoints (`POST`/`GET`/`GET :id`/`PATCH`/
      `DELETE`) respond correctly against the deployed Worker, verified
      by a real request/response pair per endpoint (not just a 200
      smoke check).
- [ ] Both §4 artifact endpoints (`POST`/`GET` with `?type=`) work for
      at least one real artifact of each of the 8 types in §2's table.
- [ ] Every artifact write in that verification carries a non-empty
      `provenance` object with a valid `status` (INDICATIVE|VERIFIED) —
      the 400-on-missing-provenance rule in §4 is exercised, not just
      documented.
- [ ] Every length/area field on a saved artifact (per §2's "Units
      obligation" column) displays both unit systems simultaneously on
      the deployed shell, per RULE 30 — screenshotted proof, not a
      code-review claim.
- [ ] Every RULE 29 numeric field named in §2 (trust shares, coverage/
      FSI, pass/fail basis) reconciles on screen exactly as RULE 29
      requires — sums to 100, band contains its median, etc.
- [ ] WORKSPACE_SHELL (W2-401) renders the project list, at least one
      open project, and at least one saved artifact of each type,
      captured at 1366 and 375 per RULE 24's first-viewport live proof.
- [ ] §3's 5-region sketch mapping is either supplied and implemented,
      or the operator has explicitly signed off on shipping without it
      — §3 remaining a flagged placeholder is not itself a blocker to
      checking this line, but silent omission is.
- [ ] ATLAS has independently audited the above against the deployed
      edge (no self-certification, consistent with every other
      SWEEP-style gate in this fleet).

Only once every line above is checked does RULE 34 lift — logged per
its own text as a new WAVE_QUEUE.md row and an ACTIVITY_LOG.md entry.
