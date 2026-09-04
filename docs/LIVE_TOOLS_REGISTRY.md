# LIVE_TOOLS_REGISTRY.md — Registry of previously/currently-live tools

Backs AGENTS.md RULE 29's Feature Conservation addendum: no restyle or
sweep may remove or demote a tool listed here without an explicit,
logged decision. ATLAS's audit battery checks every sweep/restyle row
against this registry, not only rows that explicitly claim to touch a
listed tool.

| Tool | Product page | Component | Real data source | Status |
|------|---------------|-----------|-------------------|--------|
| ULPIN / Bhu-Aadhaar lookup | LandIntel | `UlpinMapExplorer` | D1-backed sample parcel seed set (state/district/area_sqm/land_use, INDICATIVE) | RESTORED via W-16 (2026-09-04) after being removed by commit `331c1b08` — see AGENTS.md RULE 29 addendum exemplar incident |
| Trust-share calculator | BOQ Pro | three-mode rate calculator (Mode 1 FERRUM live, Mode 2 GOVT REFERENCE watermarked INDICATIVE, Mode 3 CUSTOM live recompute) | Per W2-311/W2-312 | LIVE |
| Test-fit calculator | DesignStudio | `TestFitCalculator` | Per W2-373 INTERACTION_FIRST hero placement | LIVE |
| Stamp-duty estimator | Transact | `StampDutyEstimator` | State-wise stamp-duty/registration-fee rates, INDICATIVE | LIVE |
| IS-code structural check widget | Structura | `IsCheckWidget` | Per W2-373 INTERACTION_FIRST hero placement | LIVE |
| Rate-compare calculator | ProMarket | `RateCompareCalculator` | Per W2-373 INTERACTION_FIRST hero placement | LIVE |
| IRR/NPV modeler | InvestFlow | `IrrNpvModeler` | Per W2-373 INTERACTION_FIRST hero placement; IRR/NPV outputs INDICATIVE per WORKSPACE_SPEC.md §2 | LIVE |
| CDE status mock | CommunityBuild | `CdeStatusMock` | Per W2-373 INTERACTION_FIRST hero placement | LIVE |
| Interactive parcel map | LandIntel | Leaflet/OSM map component | Real map tiles, sample parcel overlay | LIVE |
| Plot Estimator | resources/tools hub | `PlotEstimator` | Per W2-85 landing | LIVE |

## Notes

- This registry is seeded 2026-09-04 from currently-known real tools
  cited in docs/WAVE_QUEUE.md and docs/WORKSPACE_SPEC.md §2 — it is not
  exhaustive of every interactive element in the app, only tools with a
  real (non-purely-decorative) data path behind them.
- A tool's entry gets a Status change (not deletion) when it's
  genuinely retired by an explicit, logged operator/conductor decision
  — never silently dropped by a sweep that didn't know it existed.
- Add a row here whenever a new real tool ships; ATLAS's regression
  check is only as good as this list staying current.
