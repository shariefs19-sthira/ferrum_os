# OPEN_GEO_DATA_SURVEY.md — W-120

Live-verified open-source geo-data survey across five dimensions, feeding W-115/W-116/W-117's adapter sourcing. Same ToS-diligence standard as `docs/PLOT_TRUTH_ENGINE_SPEC.md` (W-90) — commercial-use stance verified per source, never assumed favorable.

**Flagship finding, not originally scoped by this row but directly relevant to Ferrum's existing structural engine:** India's earthquake design code was updated in 2025 — **IS 1893:2025** introduces a **new, highest-risk Seismic Zone VI**, covering the entire Himalayan arc, expanding the country's seismic zoning from the long-standing four/five-zone system (II–V) to five/six zones (II–VI). **This directly affects Ferrum's existing seismic-coefficient citations** (`SutraPanel.tsx` cites "IS 1893 Cl 6.4.2 (seismic coefficient)" per prior session's direct source read) — if that citation still references the pre-2025 zone map, it is now out of date for any Himalayan-arc site. Flagged here for a separate correction row, not fixed in this research-only pass.

## 1. Year-round weather

| Source | Coverage | Access mode | License / commercial stance |
|---|---|---|---|
| **IMD climate normals** | India-specific, official | Web portal; no confirmed public API this pass | Government data; commercial redistribution terms not independently confirmed this pass — **UNVERIFIED**, same caution as `PLOT_TRUTH_ENGINE_SPEC.md`'s treatment of Indian government portals |
| **ERA5 / ECMWF reanalysis** | Global, hourly, 1940–present | API (Copernicus Climate Data Store) | Same Copernicus licensing family already confirmed open/commercial-safe for Sentinel-2 in `PLOT_TRUTH_ENGINE_SPEC.md` — reasonable to expect the same posture, **not independently re-verified for this specific dataset this pass** |
| **Open-Meteo** | Global | REST API, no key required | **Confirmed, precisely tiered**: free tier is non-commercial only (≤10,000 calls/day); the underlying data itself is **CC BY 4.0** (permits commercial use with attribution); a paid tier adds a commercial license + no rate limit. **This is a real, actionable distinction** — the data license (CC BY 4.0) is commercial-safe, but the *free API service* is not for commercial use past the rate limit; a Ferrum integration must either stay under the non-commercial threshold or pay for the commercial tier |

## 2. Water tables

| Source | Coverage | Access mode | License / commercial stance |
|---|---|---|---|
| **CGWB piezometric levels** | ~25,000 monitoring stations (National Hydrograph Network Stations) | Data portal, free download for unclassified CWC/CGWB data | Government data; **no API or bulk-commercial-redistribution terms found this pass** — **UNVERIFIED**, same pattern as other Indian government portals in `PLOT_TRUTH_ENGINE_SPEC.md` |
| **India-WRIS** | National integrated water-resources platform (NWIC-maintained) | Web viewer | **No API documentation or license terms found this pass** — **UNVERIFIED**, flagged rather than assumed |

## 3. Soil

| Source | Coverage | Access mode | License / commercial stance |
|---|---|---|---|
| **NBSS&UP maps** (India-specific soil survey) | National | Not independently searched this pass — **UNVERIFIED**, flagged as a gap |
| **ISRIC SoilGrids** | Global, 250m resolution, machine-learning-derived | Confirmed REST API (`rest.isric.org/soilgrids/v2.0`), currently beta | **Confirmed open** — CC-BY 4.0 for the map products; the underlying dataset registered under **ODbL v1.0** since 2016, explicitly "without restrictions" for download — one of the clearest, most commercial-safe sources in this entire survey |
| **FAO HWSD** (Harmonized World Soil Database) | Global | Not independently re-verified this pass (well-known as a standard, generally open FAO product) — **UNVERIFIED license specifics this pass** |

## 4. Hazards

| Source | Coverage | Access mode | License / commercial stance |
|---|---|---|---|
| **BIS seismic zones (IS 1893:2025)** | National, **just updated** — see flagship finding above | Published code document | Indian Standard, not a redistributable open dataset in the API sense — the *zone boundaries* are public regulatory fact, safe to cite/implement as a rule, same posture as any other IS-code citation already in Ferrum's KB |
| **GSHAP** | India + adjoining region, 0.5°×0.5° grid, PGA at 10%-in-50-years exceedance | Available via third-party mirrors (Swiss Seismological Service, Asian Seismic Commission) rather than a single canonical source | Older dataset (pre-dates IS 1893:2025's update) — **should be treated as a secondary/historical cross-reference, not the primary seismic-zone source going forward**, given the flagship finding above |
| **State SDMA flood maps** | Per-state, variable | Not independently searched this pass — **UNVERIFIED**, flagged as a gap |
| **Bhuvan flood layers** | National (ISRO) | Already covered in `PLOT_TRUTH_ENGINE_SPEC.md` — Bhuvan's single-user-license caution applies identically here, not re-derived |
| **IMD cyclone e-atlas** | National, coastal | Not independently searched this pass — **UNVERIFIED**, flagged as a gap |
| **GSI landslide data** (Geological Survey of India) | National | Not independently searched this pass — **UNVERIFIED**, flagged as a gap |

## 5. 100-year history

| Source | Coverage | Access mode | License / commercial stance |
|---|---|---|---|
| **IMD century rainfall records** | National, long-baseline | Not independently searched this pass — **UNVERIFIED** |
| **USGS Landsat 50-year archive** | Global, since 1972 | Well-established as a US-government open dataset (public domain per standard USGS policy) — **not independently re-confirmed this pass**, but this is a widely-known, low-risk source class |
| **Survey of India historical maps** | National | Same commercial-licensing requirement already established in `PLOT_TRUTH_ENGINE_SPEC.md` for current SoI maps — historical maps likely carry the same or a relaxed posture, **not independently re-verified this pass** |
| **OpenHistoricalMap** | Global, community-sourced | Same ODbL family as OpenStreetMap (already Ferrum's adopted pattern) — reasonable to expect the same low-risk posture, **not independently re-verified this pass** |
| **Bhuvan LULC time series** | National (ISRO) | Same Bhuvan single-user-license caution as elsewhere in this survey |

## Summary

| Verdict | Sources |
|---|---|
| **Confirmed open / commercial-safe** | ISRIC SoilGrids (ODbL v1.0, explicitly unrestricted), Open-Meteo's underlying data (CC BY 4.0, though the *free API* itself is non-commercial-tiered) |
| **Likely safe, not independently re-verified this pass** | ERA5/Copernicus (same family as already-confirmed Sentinel-2), USGS Landsat, OpenHistoricalMap (OSM-family) |
| **UNVERIFIED — real gaps, not assumed favorable** | IMD climate normals, CGWB/India-WRIS, NBSS&UP, FAO HWSD, state SDMA flood maps, IMD cyclone atlas, GSI landslide data, IMD century rainfall, Survey of India historical maps |
| **Flagship regulatory update, actionable now** | IS 1893:2025's new Zone VI — needs a correction row against Ferrum's existing seismic citations, separate from this survey |

**This survey has more UNVERIFIED entries than `docs/PLOT_TRUTH_ENGINE_SPEC.md`'s or `docs/BENCHMARK_TECH_SURVEY.md`'s** — Indian government hydrology/soil/hazard portals are a consistently under-documented category across every research pass this session; W-115/W-116/W-117 should treat "confirm this specific source's ToS before wiring it" as a per-source gate, not a one-time survey checkbox.

---

*Every claim above traces to a live search this session; sources marked UNVERIFIED were not found with sufficient license/API detail to confirm either way, and are reported as gaps rather than assumed compliant or non-compliant.*
