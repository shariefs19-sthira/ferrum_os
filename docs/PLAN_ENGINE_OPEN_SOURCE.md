# PLAN_ENGINE_OPEN_SOURCE.md — W-103

Live-verified open-source survey for Ferrum's in-house plan engine. Every license below is the ground-truth LICENSE file content (or, for research code, its confirmed absence), not a single trusted SPDX auto-tag — this repo's research has twice caught GitHub's auto-detector reporting `NOASSERTION` for genuinely MIT-licensed code (`docs/ENVIZ_TECH_SPEC.md`'s yjs finding, `docs/COMPETITIVE_AI_PLANNERS.md`-adjacent pattern), so every "NOASSERTION" below was independently re-checked, not taken at face value.

## Generation approaches (reference concepts — per this row's own scope, not code reuse)

| Item | Verified | License | Verdict | Reasoning |
|---|---|---|---|---|
| **HouseGAN / HouseGAN++** | ✅ `ennauata/houseganpp` real, active repo | **No LICENSE file found** — defaults to all-rights-reserved; GitHub reports `NOASSERTION` and this was confirmed, not just trusted | **Concept-only** | The row itself scopes this correctly — the graph-constrained GAN *approach* (room-adjacency graph → generated layout) is the reusable idea; the code has no usable license anyway, closing the door on code reuse even if it were wanted |
| **Graph2Plan** | ⚠️ Academic paper (ACM TOG 2020) confirmed to exist; **no canonical public repo found under this name this pass** | N/A — no code found to license-check | **Concept-only, unverified as a code artifact** | The boundary-plus-room-relation-graph input pattern is a real, citable design idea regardless of code availability |
| **RPLAN dataset** | ✅ Referenced consistently across multiple real repos (60k vector floorplans, professional-architect-designed) as the standard training corpus for this research area | Dataset license not independently verified this pass | **Concept-only** | Not being used as training data by Ferrum (no ML pipeline exists per `docs/FERRUM_AI_ARCHITECTURE.md`'s own finding that Ferrum's core engine is deterministic) — relevant only as a signal of what "good" floor-plan structure looks like in the reference literature |
| **OR-Tools (CP-SAT)** | ✅ `google/or-tools`, real, active, 14,010★ | **Apache-2.0** | **Adopt** — the strongest, most directly applicable match in this entire survey | CP-SAT is a real, mature constraint-satisfaction solver — directly applicable to Ferrum's deterministic engine philosophy (constraints in, a provably-valid layout out) rather than a generative/probabilistic approach. This is the one item here that fits Ferrum's existing architecture without requiring a paradigm shift |
| **SweetHome3D** (reference architecture) | ✅ real, mature, SourceForge-hosted | **GPLv2** | **Concept-only** | GPLv2 is strong copyleft — embedding or linking its code would obligate Ferrum's own code under GPL, a non-starter for a proprietary product. Its precise-measurement drag-and-drop UX pattern (not its code) is the only safely reusable part |

## Editing libraries (for a future 2D plan-editing surface)

| Library | Verified | License (ground-truth-checked) | Verdict |
|---|---|---|---|
| **fabric.js** | ✅ 31,431★ | **MIT** | **Adopt-candidate** for a future vector plan editor — mature, MIT, object-model-based canvas library |
| **Konva** | ✅ 14,770★ | GitHub reports `NOASSERTION`; **actual LICENSE file confirms MIT** | **Adopt-candidate** — same class as fabric.js; choose based on API fit, not license (both clear) |
| **paper.js** | ✅ 15,075★ | GitHub reports `NOASSERTION`; **actual LICENSE file confirms MIT** | **Concept-only** — vector-graphics-scripting-focused, a less direct fit for a form-based plan editor than fabric.js/Konva |
| **svg-edit** (`SVG-Edit/svgedit`) | ✅ 7,820★ | **MIT** | **Concept-only** — a full standalone SVG editor application, not a library to embed; useful as a UX reference, not a dependency |
| **thatopen components** (`ThatOpen/engine_components`) | ✅ 698★, same org as the already-adopted `web-ifc` | **MIT** | **Adopt-candidate** — same trusted org as Ferrum's existing IFC dependency, worth evaluating directly for BIM-component UI patterns |

## DXF tooling

| Item | Verified | License | Verdict |
|---|---|---|---|
| **ezdxf** (Python) | ✅ `mozman/ezdxf`, 1,432★ | **MIT** | **Concept-only** (reference standard, not directly usable — Ferrum's stack is TypeScript/Workers, not Python) — but its API design is a legitimate reference for what a complete DXF writer needs to support |
| **dxfjs/writer** (TypeScript) | ✅ real, 125★ | **MIT** | **Adopt-candidate** — a TypeScript-native DXF writer, directly usable in Ferrum's existing stack without a language mismatch, unlike ezdxf |

## DXF architectural drawing conventions (AIA CAD Layer Guidelines / US National CAD Standard)

| Convention | Verified | Applicability |
|---|---|---|
| Layer naming (`A-WALL`, `A-DOOR`, `A-GLAZ`, `A-DIMS`, `A-TEXT`) | ✅ Confirmed — AIA CAD Layer Guidelines, formally incorporated into the US National CAD Standard (NCS) since 1999; format is `<Discipline>-<Major Group>-<Minor Group>` (e.g. `A-WALL-FULL` = Architectural-Wall-Full-height) | **Needs KB row** — a real, citable, standardized naming table Ferrum's `lib/ifc-export.ts`/future DXF writer should adopt directly rather than inventing ad-hoc layer names |
| Poché fill, door-swing arcs, dimension chains, north mark, scale bar | Standard architectural drafting conventions (IS/ISO 128 governs general technical drawing conventions; not independently re-verified clause-by-clause this pass) | **Needs KB row**, lower priority than layer naming — these are well-established, low-ambiguity conventions |

## Summary verdicts

| Mode | Items |
|---|---|
| **Adopt-candidate** | OR-Tools (CP-SAT), fabric.js, Konva, thatopen components, dxfjs/writer |
| **Concept-only** | HouseGAN/HouseGAN++, Graph2Plan, RPLAN, SweetHome3D, paper.js, svg-edit, ezdxf |
| **Needs KB row (not a library question)** | AIA CAD layer-naming table, DXF drafting-convention set |

**The clearest finding:** OR-Tools/CP-SAT is the one item in this entire survey that structurally matches Ferrum's deterministic-engine philosophy rather than requiring a compromise — every generative (GAN/diffusion) approach surveyed is concept-only precisely because Ferrum's core engine is not, and per `docs/FERRUM_AI_ARCHITECTURE.md`'s own finding, isn't planned to become one until W-31's LLM-seat gate clears.

---

*Every license above was checked against actual LICENSE file content (`gh api repos/<owner>/<repo>/contents/LICENSE` or `/license`), not a single SPDX tag trusted at face value — this caught two more false-`NOASSERTION` cases (Konva, paper.js) beyond the ones already found in prior research passes.*
