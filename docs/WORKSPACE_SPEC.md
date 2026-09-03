# WORKSPACE_SPEC.md — v1

Status: v1 draft. Object model and API surface below are verbatim as
supplied by the operator. The per-product artifact-type table is derived
from real docs/WAVE_QUEUE.md rows, cited inline. **One section is
explicitly incomplete** — see the flag at the end of §2 — rather than
filled in with invented content.

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
