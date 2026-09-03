# WORKSPACE_RESEARCH.md — W2-401 research addendum

Research input for the DesignStudio shell rebuild (W2-401), gathered via
live web search 2026-09-03. Six 2026-current reference products, five
concrete UI/UX patterns each, sourced. This is a pattern catalog to draw
from — it is not itself a design decision or an approval to build any
specific pattern; the operator sketch and conductor sign-off (per the
same RULE 17 discipline as W2-372) still govern what W2-401 actually
implements.

For the WORKSPACE object model and API surface, see `docs/WORKSPACE_SPEC.md`
— a separate document; both landed independently under the same intended
filename and were split apart on merge rather than one overwriting the
other.

## Autodesk Forma (Site Design + Building Design)

1. Central 3D canvas with a persistent contextual toolbar at the bottom
   edge — shortcuts and tool tips surface only for the tool currently
   active, not a permanently-visible mega-toolbar.
2. Cloud-run analyses (daylight, sun-hours, carbon, wind, noise) return
   in seconds to minutes instead of the hours/overnight turnaround of
   traditional simulation — the workflow assumes near-instant iteration.
3. "Forma Board" — a separate collaborative visual workspace panel
   distinct from the 3D canvas, for team review/annotation rather than
   modeling.
4. Geolocated site setup as a first step (minutes, not a separate GIS
   import workflow) — site context loads before design tools activate.
5. One-way-then-two-way handoff to Revit: schematic work in Forma,
   detailed documentation in Revit, with a defined sync point rather
   than a single monolithic tool trying to do both.

Sources: [Forma Site Design tools overview](https://blogs.autodesk.com/forma/2026/08/28/forma-site-design-tools-overview/), [Autodesk Forma Review 2026](https://illustrarch.com/articles/design-softwares/73363-autodesk-forma-review.html), [Forma Building Design announcement](https://www.archpaper.com/2026/04/autodesk-forma-building-design/)

## Snaptrude

1. Text-prompt-to-geometry: a room/program brief in natural language
   becomes editable BIM geometry directly, not a separate "generate then
   import" step.
2. A live-linked spreadsheet panel bound to the 3D model — editing a
   number in the sheet moves geometry, and vice versa, same data.
3. One-click "mass to BIM" conversion — a coarse massing block promotes
   to detailed BIM elements without remodeling from scratch.
4. Real-time multi-user collaborative editing, same canvas, same
   session (not file-locking or branch/merge).
5. Export to Revit/Rhino/IFC framed as "no re-modeling" — the export
   step is explicitly designed not to lose or flatten the working model.

Sources: [Snaptrude 2026 architecture software roundup](https://www.snaptrude.com/blog/best-architecture-software-2026), [Snaptrude Review 2026](https://aichief.com/ai-interior-design/snaptrude/), [Snaptrude on CheckThat.ai](https://checkthat.ai/brands/snaptrude)

## Hypar

1. Deliberately minimalist, "Figma-like" UI as of Hypar 2.0 — a
   correction away from an earlier complex multi-function ecosystem.
2. Function-based composition: named functions (daylight analysis, core
   placement, facade optimization) chain into a workflow, rather than
   one monolithic "generate building" action.
3. Real-time space-utilization tracking surfaced alongside the design
   view, not as a separate report generated after the fact.
4. AI layout-suggestion as an assistive overlay on the space-planning
   view, not a replace-the-whole-plan generator.
5. One-click Revit export positioned as the exit point of the
   parametric/rule-based authoring flow.

Sources: [Hypar 2.0 — AEC Magazine](https://aecmag.com/features/hypar-2-0/), [Hypar Review — DataDrivenAEC](https://datadrivenaec.com/tools/hypar)

## Finch

1. Design-intent-first interaction: the architect states a goal (e.g.
   "maximize south-facing units"), Finch resolves the geometry — the UI
   surfaces goals/constraints, not manual geometry operations.
2. A centralized "Plan Library" encodes a firm's own standards/precedent
   plans, and generation draws from that library rather than a generic
   global one.
3. Bidirectional live streaming with Rhino/Revit/Grasshopper — a change
   made in either tool propagates back, not a one-way export.
4. AI-generated code-compliant floor plans and unit layouts as the
   primary output artifact, not a rendering/visualization.
5. Delivered as a plug-in into existing tools (Revit/Rhino/Grasshopper)
   rather than a new standalone modeling app — it augments, not replaces.

Sources: [Finch product page](https://www.finch3d.com/product), [Finch 3D Review 2026 — AI Building Tools](https://aibuildingtools.com/tools/finch-3d), [Finch on Autodesk Marketplace](https://marketplace.autodesk.com/apps/f9df1515-ccf9-49c1-b47d-be644a6df802)

## TestFit

1. Parametric, real-time iteration: dragging a numeric input (unit
   count, setback, parking ratio) redraws the site plan live, no
   separate "recalculate" step.
2. Financial feasibility (yield on cost) computed and displayed
   alongside the geometry, in the same view — not a separate
   spreadsheet export.
3. Automated parking-space counting built directly into the site-plan
   view as a first-class number, not a manual takeoff.
4. Generates and ranks many layout options at once against zoning +
   parking + unit-mix + financial constraints together, rather than one
   option per manual iteration.
5. Downstream integration to Revit/SketchUp/AutoCAD framed as feasibility
   → design handoff, i.e. TestFit owns the "should we build this" phase
   and hands off once the answer is yes.

Sources: [TestFit Real Estate Feasibility Platform](https://www.testfit.io/), [TestFit Site Solver](https://www.testfit.io/product/site-solver), [TestFit feasibility tools](https://www.testfit.io/feasibility-tools)

## SketchUp for Web

1. Full 3D modeling entirely in-browser — zero install, functional
   parity with desktop core modeling tools, not a stripped-down viewer.
2. Cloud-native save by default (Trimble account), not a local-file
   default with cloud as an add-on.
3. Direct in-canvas access to a shared component/asset library (3D
   Warehouse) — inserting a real object is a search inside the modeling
   view, not a separate import workflow.
4. No subscription required to start modeling — the free entry point is
   the full authoring surface, not a demo/trial-limited one.
5. Cross-platform by construction (browser-based) rather than
   maintaining separate native builds per OS.

Sources: [SketchUp for Web](https://sketchup.trimble.com/en/products/sketchup-for-web), [SketchUp for Web help docs](https://help.sketchup.com/en/sketchup-web/sketchup-web), [SketchUp Free](https://sketchup.trimble.com/en/plans-and-pricing/sketchup-free)

## Cross-cutting patterns worth flagging for W2-401

Patterns that appear independently across three or more of the six
products above (not a recommendation by itself — a signal of what's
become table-stakes in this category):

- **Live/real-time feedback on parameter change** (Forma, Snaptrude,
  Hypar, TestFit) — no "apply" button between input and visible result.
- **A secondary numeric/data panel bound to the same model as the 3D
  view** (Snaptrude's spreadsheet, TestFit's yield-on-cost, Forma's
  analysis panel) — matches the operator sketch's DATA-EXTRACT panel
  concept directly.
- **Browser-native, install-free entry** (SketchUp for Web, Snaptrude,
  Forma, Hypar) — the desktop-plugin model (Finch, TestFit's CAD
  integrations) is the minority pattern among 2026-current tools, not
  the majority.
- **Constrained/curated action sets over open-ended modeling** (Hypar's
  function composition, Finch's intent-first goals, TestFit's
  constraint-bounded generation) — directly relevant to W2-401's
  proposed assistant intent API being an enumerated, closed list rather
  than free-form.

## Research method note

All six queries run via live web search, 2026-09-03, current-year results
only (per the operator's own "current month is September 2026" framing).
No pattern above is inferred or assumed — each traces to a specific
cited source. Where a search result described roadmap/marketing language
rather than a verifiable interface behavior, it was excluded rather than
softened into an unverifiable claim.
