# ARCHITECT_PREDESIGN_FACTS.md — W-93

Every fact category an architect considers before designing, sourced live this session (2026-09-07), classified per fact: **Computable** (Ferrum's engines can derive it today from existing inputs), **Needs KB row** (a real, versioned, cited data point Ferrum doesn't have yet but could store), or **Needs user input** (only the client/site/survey can supply it — no code path substitutes).

Existing engine baseline checked before classifying: `apps/web/lib/parcelIntel/sampleRulesets.ts` already carries FAR/coverage/setback/height as **SAMPLE** bands (explicitly labeled, not verified regulation); `apps/web/lib/checks/isCode.ts` runs real structural checks; no soil/climate/accessibility/vernacular KB exists yet.

---

## 1. Site

| Fact | Source | Classification |
|---|---|---|
| Sun path (solar azimuth/altitude by date/time) | Astronomical formula (no external data needed — pure geometry from lat/lon) | **Computable** — pure math from parcel coordinates, no KB row needed |
| Wind direction/speed (prevailing) | IS 875 Part 3 (wind pressure) — already partially wired (`SutraPanel.tsx` cites "IS 875 Part 3 Cl 6.3/7.2 wind pressure") | **Needs KB row** — wind-zone map by region, not yet a stored dataset |
| Topography/slope | Requires a DEM (digital elevation model) or actual site survey | **Needs user input** (survey-grade) or **Needs KB row** if a public DEM (e.g. SRTM, Bhuvan) is integrated for a coarse estimate |
| Soil bearing capacity (SBC) | IS 1904:2021 (foundation design) + IS 6403 (bearing capacity) — presumptive Table 1 values usable only for ≤2-storey preliminary design; final design needs SPT (IS 2131) + PLT (IS 1888) | **Needs KB row** for presumptive regional values (low confidence, clearly labeled); **Needs user input** (a real geotechnical report) for anything beyond 2 storeys or final design |
| Vegetation (existing trees, protected species) | Site survey; some states have tree-protection acts requiring permits to remove | **Needs user input** — no remote-sensing substitute reliably identifies individual protected trees |
| Noise (ambient/traffic) | Would require a noise-mapping dataset (none identified as publicly available at parcel granularity) | **Needs user input** or a coarse **Needs KB row** if road-classification-based noise-zone estimates are built |
| Views (what's visible from the plot) | Requires 3D terrain + surrounding-building height data | **Needs KB row** (surrounding-building-height layer, itself dependent on OSM footprint data already partially in use per `docs/PLOT_TRUTH_ENGINE_SPEC.md`) |
| Access (road frontage, width, cut) | Site Details step pattern already seen in `homeplannner.com`'s flow (Front/Back/Right/Left = Road/Others Property) — a real, useful input-question pattern | **Needs user input**, though the *question design* is now documented (see `docs/COMPETITIVE_AI_PLANNERS.md`) |
| Utilities (water/power/sewer availability at plot) | No national open dataset found | **Needs user input** |

## 2. Regulatory

| Fact | Source | Classification |
|---|---|---|
| Setbacks (front/rear/side) | NBC 2016 Part 3 baseline: 3.0m front / 2.0m rear / 1.5m side for 100–200 m² plots; +0.5m per storey above 4 storeys (Cl 6.4); **NBC is advisory — state/municipal Bye-Laws override it** | **Computable** using existing sample bands (`sampleRulesets.ts`), but currently SAMPLE-labeled, not the real NBC/local-Bye-Law figures — **upgrading to real NBC Part 3 baseline + per-state Bye-Law override is a Needs KB row** |
| FAR/FSI | NBC Part 3; state-specific (called FSI in Maharashtra) | Same as above — **Computable (sample) today; Needs KB row for real, cited, state-correct values** |
| Ground coverage | NBC Part 3 | Same pattern — **Computable (sample); Needs KB row for real values** |
| Height limits | NBC Part 3; airport-proximity (AAI NOC) height restrictions are a separate, unrelated gate | **Needs KB row** — height cap alone is sample-covered; the AAI NOC height-restriction-zone overlay is a wholly separate dataset not yet identified |
| Zoning (land-use classification) | Master Plan / Development Plan per city — no single national source | **Needs KB row**, city-by-city, high effort |
| Heritage restrictions | ASI (Archaeological Survey of India) protected-monument buffer zones (100m prohibited + 200m regulated, per the Ancient Monuments Act) are a known, publicly documented rule | **Needs KB row** — the buffer-distance rule itself is computable once a monument-location dataset exists; the dataset itself doesn't yet exist in Ferrum |
| Flood zone | CWC (Central Water Commission) flood-hazard mapping; also state disaster-management flood atlases | **Needs KB row** (dataset not yet integrated) |

## 3. Context

| Fact | Source | Classification |
|---|---|---|
| Neighbouring building heights/footprints | OSM (already partially used for existing-building footprints) | **Computable**, INDICATIVE-labeled ("existing-from-OSM, not a survey" per the existing `W-51` convention) |
| Street width | OSM tags (where present) or survey | **Needs KB row** (OSM width tagging is inconsistent in India) or **Needs user input** for reliability |
| Privacy/sightlines to neighbours | Derived from neighbouring heights + setbacks once both exist | **Computable** once §1 (views) and §3 (neighbouring heights) data exist — currently blocked on those |

## 4. Program

| Fact | Source | Classification |
|---|---|---|
| Client needs (room count, adjacencies) | The client, by definition | **Needs user input** — this is exactly what Ferrum's SUTRA guided-tree (`W-58`) already exists to capture |
| Circulation (corridor widths, stair widths) | NBC Part 3 minimums (e.g. common-area circulation width standards) | **Needs KB row** — a real, citable minimum-dimensions table |
| Room adjacency logic (kitchen-near-dining, etc.) | No regulatory source — a design-heuristic, not a code requirement | **Needs KB row** as a *design pattern* dataset (distinct from regulatory data — should be labeled as heuristic, not code-mandated, to avoid the honesty-label conflation `RULE 5/29` guards against) |
| NBC Part 3 accessibility (ramps, door widths, tactile paths) | NBC 2016 Part 3 + Part 4 (fire/life safety) — 900mm door width is the commonly-cited accessible-door baseline; ramps, tactile guidance paths, accessible parking bays for buildings used by the public | **Needs KB row** — mandatory for commercial/public buildings per NBC 2016 Part 3; a real, citable, code-mandated dimension set Ferrum doesn't have yet |

## 5. Climate / sustainability

| Fact | Source | Classification |
|---|---|---|
| ECBC/Eco Niwas Samhita compliance | ECBC 2017 (commercial, voluntary at national level, state-adoptable); Eco Niwas Samhita 2018 = the residential-specific code, targets 25% energy-consumption reduction vs. conventional construction | **Needs KB row** — ECBC/ENS is currently absent from Ferrum's KB entirely; voluntary-adoption status varies by state, must be labeled accordingly |
| Daylight requirements | ECBC 2017 mandates passive daylight/shading strategies; auto-dimming controls required for daylit areas >25m² in commercial buildings | **Needs KB row** |
| Natural ventilation | ECBC 2017 defers to NBC 2005's ventilation design guidelines (wind-induced) | **Computable** in principle once wind-direction data (§1) exists — currently blocked on that KB row |

## 6. Structure

| Fact | Source | Classification |
|---|---|---|
| Spans, member sizing | IS 456 (RCC design) — already partially wired (`SutraPanel.tsx` cites "IS 456 Cl 23.2.1... simplified span/depth screen") | **Computable** — this is Ferrum's most mature existing engine area (`lib/checks/isCode.ts`, `lib/studio/structuralLive.ts`) |
| Soil bearing capacity → foundation type/depth | IS 1904 (see §1) | **Computable** for the presumptive-table screening level once the SBC KB row exists; final design remains **Needs user input** (real geotech report) regardless of engine maturity — this is a hard, permanent limit, not a temporary gap |

## 7. Services (MEP)

| Fact | Source | Classification |
|---|---|---|
| Electrical/plumbing/HVAC sizing | National Electrical Code, NBC Part 8/9, IS codes per system | **Needs KB row** — currently zero MEP-specific data in Ferrum; large, separate future scope, not a quick add |

## 8. Economics

| Fact | Source | Classification |
|---|---|---|
| Budget/cost estimation | Ferrum's own `costEngine.ts` + government reference rates (already real, per `W2-312 FERRUM-RATE ENGINE`) | **Computable** — already Ferrum's most mature economics area |
| Constructability | Design-review judgment, not a codified rule set | **Needs user input** (professional review) — not meaningfully automatable without fabricating false confidence |

## 9. Aesthetics

| Fact | Source | Classification |
|---|---|---|
| Massing, proportion, rhythm, materiality | Design judgment / precedent libraries (e.g. Time-Saver Standards-class references) — not codified regulation | **Needs KB row** as a *style/pattern catalog* (already partially scoped conceptually via `W-51`'s "style library"/Vaastu-axis parametric catalog) — explicitly a design-heuristic dataset, not a compliance one |

## 10. Vernacular / typology

| Fact | Source | Classification |
|---|---|---|
| Regional building typologies (climate-responsive courtyard forms, verandah depths, roof pitches by rainfall zone, etc.) | Regional architecture literature, not a single codified national source | **Needs KB row**, and likely the least standardized category in this entire list — high research effort per region |

## 11. Vaastu (India-specific)

| Fact | Source | Classification |
|---|---|---|
| Direction-based room placement (kitchen SE, master bedroom SW, etc.) | Traditional practice, not a regulatory code — must be labeled as a *cultural/traditional preference*, never as a structural or legal requirement | **Needs KB row**, explicitly labeled non-regulatory. `homeplannner.com`'s intake flow (kitchen placement, plot-direction compass) is a real, observed example of a competitor treating this as a first-class input — worth matching as an *optional, clearly-labeled* preference layer, not a computed "fact" |

## 12. Legal

| Fact | Source | Classification |
|---|---|---|
| Title status | State RoR / ULPIN (per `docs/PLOT_TRUTH_ENGINE_SPEC.md`'s full source map — DILRMP geo-referencing only 49.1% complete nationally) | **Needs user input** for anything beyond what `PLOT_TRUTH_ENGINE_SPEC.md`'s "instant/request-time/unavailable" classification already covers — this category is fully addressed by that existing spec, not duplicated here |
| Easements | State RoR / local sub-registrar records | **Needs user input** — no reliable remote-sensing or open-data substitute exists |
| Right-of-way (RoW) | Local municipal road-widening/RoW plans | **Needs KB row** where a municipality publishes a digitized RoW plan (rare); otherwise **Needs user input** |

---

## Proposed new KB rows (priority order, by how directly they extend Ferrum's existing engines)

1. **Real NBC Part 3 setback/FAR/coverage/height table**, replacing/supplementing the current SAMPLE bands in `sampleRulesets.ts` — highest priority, directly upgrades an existing, already-shipping feature from sample to cited-real data.
2. **IS 1904 presumptive SBC table** by soil type — directly extends the existing structural-check engine.
3. **NBC Part 3/4 accessibility minimums** (door widths, ramp slopes, tactile paths) — a bounded, well-documented, citable dataset.
4. **ECBC/Eco Niwas Samhita passive-design + daylight rules** — net-new category, moderate effort.
5. **ASI heritage-buffer rule + a monument-location dataset** — the rule is simple (100m/200m buffers); the dataset is the hard part.
6. **Vaastu preference layer** — explicitly optional/non-regulatory, lowest research risk since it needs no external verification, only correct labeling.
7. **Vernacular/typology catalog** — highest effort, most valuable for differentiation, lowest urgency.

---

*Every source cited above (NBC 2016 Part 3/4, ECBC 2017, Eco Niwas Samhita, IS 1904/1888/2131/6403/875/456) was verified via live search this session, not recalled from training data. Existing Ferrum engine state was verified by reading `apps/web/lib/parcelIntel/sampleRulesets.ts` and `apps/web/lib/checks/isCode.ts` directly, not assumed.*
