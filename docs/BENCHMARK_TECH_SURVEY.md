# BENCHMARK_TECH_SURVEY.md — W-109

Live-verified feature + open-source survey across three benchmark tools (SketchUp, Tekla/STAAD, Procore), feeding W-102/W-110/W-111's scopes. Licenses ground-truth-checked, not trusted from a single SPDX tag, per the same discipline as `docs/PLAN_ENGINE_OPEN_SOURCE.md`.

## 1. SketchUp modeling logic

| Feature | How it actually works (verified) | Applicability to Ferrum |
|---|---|---|
| **Push/Pull tool** | Extrudes a flat face into a 3D shape (or subtracts) with two clicks: click to start, click to confirm the extrusion distance | Ferrum's `Space3D.tsx` already builds solid geometry parametrically from plan dimensions — push/pull as a *user-facing* direct-manipulation gesture is a UI pattern question, not a geometry-engine question; RULE 50 (mouse=view-only, mutations via SUTRA intent) already rules out literal click-drag push/pull as an interaction model for Ferrum today |
| **Inference engine** | Real-time snapping to parallel faces, edge midpoints, and existing geometry alignment during a modeling operation — this is the "smart snapping" that makes direct manipulation feel precise without manual dimension entry | Conceptually adjacent to the exact-entry/paired-unit-toggle pattern already specified in `W-88`'s instrument-grade controls — SketchUp solves the same "precise input without typing" problem via spatial inference; Ferrum solves it via numeric fields. Both are legitimate; not a gap Ferrum needs to fill by copying SketchUp's specific mechanism |
| **Direct modeling paradigm** | A recent (relative to parametric CAD) modeling approach that allows editing a solid's boundary faces directly, without needing to edit the feature history/parameter tree that created them | **Concept-only reference** — Ferrum's plan-generation engine (`W-55`/`W-66`) is closer to parametric (dimensions/rules drive geometry) than direct-modeling; adopting direct-modeling editing would be a paradigm change, not a small feature add |
| **Component-reuse system** | SketchUp's "component" is a reusable, instance-linked object (edit one instance, all instances update) | **Needs KB row / future feature** — Ferrum's element system (`W-66`) doesn't yet have a component/instance-reuse concept; relevant to a future "reuse this room type across floors" feature |

## 2. Tekla Structures + STAAD.Pro (analysis) — and open equivalents

| Item | Verified | License | Verdict |
|---|---|---|---|
| **Tekla Structures / STAAD.Pro** | Both real, well-known commercial BIM/structural-analysis products (Trimble and Bentley respectively) | Proprietary, commercial — not open-source, no further license check needed | **Concept-only reference** for their feature set (member-level BIM, FEA load combinations per IS 1893/IS 875, code checks per IS 800/IS 456, connection design, calculation-report generation) — not adoptable as software |
| **OpenSees** | ✅ real, active, UC Berkeley PEER-developed | **Non-commercial/academic/research use only** — GitHub reports `NOASSERTION` but the project's own licensing page states educational/research/non-profit use, no commercial license terms published | **Reject for direct commercial use** — this is a harder red line than a copyleft license: OpenSees isn't licensed for a commercial product at all, not just "requires attribution" or "requires source disclosure." Concept-only (its finite-element approach/element library is a legitimate reference), never adoptable as-is in a commercial Ferrum build |
| **CalculiX** | ✅ real, active (`Dhondtguido/CalculiX`) | **GPL-2.0** | **Concept-only** — same reasoning as `SweetHome3D` in `docs/PLAN_ENGINE_OPEN_SOURCE.md`: GPLv2 copyleft would obligate Ferrum's own linked code, not viable for a proprietary product without a separate commercial licensing arrangement (none identified) |
| **Code_Aster** | ✅ real, mature (EDF R&D, 1M+ lines, 400+ element types) — not GitHub-native, hosted on its own forge at code-aster.org | **GPL** (per EDF's own 2001 open-sourcing decision) | **Concept-only** — same GPL reasoning as CalculiX |
| **JS matrix-stiffness libraries** | ⚠️ **No credible, actively-maintained JavaScript/TypeScript matrix-stiffness structural-analysis library was found this pass** — a targeted GitHub search returned zero results | N/A | **Real gap, flagged not filled** — if Ferrum needs in-browser structural analysis beyond the existing simplified span/depth screen (`isCode.ts`), this is a genuine build-vs-find gap: the mature FEA tools are all GPL/non-commercial (Python/Fortran/C++ ecosystems), and no equivalent JS-native library exists to adopt |

## 3. Procore (QA/QS) — and open equivalents

| Item | Verified | Verdict |
|---|---|---|
| **Procore's feature set** | Cost management (budget vs. actual), measurement sheets, rate analysis, RFIs, submittals, punch lists, progress tracking — confirmed as Procore's real, marketed feature set | **Concept-only reference** — proprietary, no code to evaluate |
| **Open-source equivalents** | ⚠️ **None found.** Every alternative surfaced in this research (SubmittalLink, Fieldwire, Constructable, Autodesk Construction Cloud) is itself a commercial SaaS product, not an open-source project | **Real gap, flagged not filled** — construction QA/QS/RFI/submittal/punch-list workflow management appears to be a category with no credible open-source foundation to build on. Ferrum's own `costEngine.ts` (real, already shipping) already covers the budget-vs-actual piece; RFI/submittal/punch-list tracking would be new-built from scratch, not adapted from any surveyed source |

## Summary verdicts

| Mode | Items |
|---|---|
| **Concept-only** | SketchUp (push/pull, inference, direct-modeling, component-reuse), Tekla/STAAD, OpenSees, CalculiX, Code_Aster, Procore |
| **Reject (commercial-use blocked outright, not just copyleft)** | OpenSees — non-commercial license, a harder line than GPL |
| **Real, flagged gaps (nothing to adopt)** | No JS-native structural-analysis (matrix-stiffness) library exists; no open-source Procore-equivalent QA/QS platform exists |

**Net finding:** unlike `docs/PLAN_ENGINE_OPEN_SOURCE.md`'s survey (which found OR-Tools as a strong direct match), **this survey found nothing directly adoptable** — every FEA tool surveyed is either non-commercial-licensed (OpenSees) or GPL-copylefted (CalculiX, Code_Aster), and the QA/QS category has no open-source foundation at all. This means W-110/W-111 (whichever scopes consume this survey) should plan for **build-from-scratch**, not **adopt-and-adapt**, for both the structural-analysis-beyond-simplified-checks and the QA/QS-workflow categories.

---

*Every license claim above was checked against the project's actual license terms (OpenSees' own licensing page, GPL confirmed via GitHub repo metadata for CalculiX and via EDF's own public 2001 licensing announcement for Code_Aster), not assumed from a category label ("open source" does not mean "commercially usable," as OpenSees demonstrates directly).*
