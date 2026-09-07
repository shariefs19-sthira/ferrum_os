# PLOT_TRUTH_ENGINE_SPEC.md — W-90 LAND_DATA_UNIVERSE

Live research per RULE 54. Every fact below is search-verified against government/program/vendor sources this pass (2026-09-07), not recalled. Where a source's exact commercial-access terms could not be confirmed, it is marked **UNVERIFIED** rather than assumed favorable or unfavorable.

---

## 1. ULPIN / Bhu-Aadhaar — attribute set + state integration status

**What ULPIN actually is:** a 14-digit ID assigned per land parcel, derived from the parcel's geo-referenced coordinates (an ECCMA "Property Natural Identifier Unit" standard, OGC-compliant), issued under DILRMP (Department of Land Resources). It is an *identifier*, not itself a full attribute bundle — the attributes below are what DILRMP's underlying Record of Rights (RoR) computerization + geo-referencing work associates with a parcel once it has a ULPIN.

| Attribute | Source layer | Notes |
|---|---|---|
| ULPIN (14-digit ID) | Geo-referenced cadastral map + survey | The identifier itself |
| Owner name(s) | State RoR (computerized) | Text field, state-specific formatting |
| Survey/sub-division number | State RoR | Pre-existing cadastral reference, ULPIN maps onto it |
| Area | Cadastral survey | Usually in local units (acre/guntha/cent/hectare depending on state) |
| Land classification (agricultural/non-agricultural/govt) | State RoR | Determines applicable rules |
| Geo-coordinates (parcel vertices) | Geo-referenced cadastral map | The basis of the ID itself |
| Mutation status/history | State RoR mutation register | Not uniformly digitized — see below |

**National program status (2026-09-07):**
- DILRMP extended 2021-22 through 2025-26 (5-year window, current).
- RoR computerization: **95.09%** of villages (6,25,137 of 6,57,397) as of 2023-12-31.
- Cadastral map geo-referencing (the actual ULPIN-enabling step): **only 49.10%** of villages (3,26,776 of 6,57,397) — this is the real bottleneck, not RoR digitization.
- Rural ULPIN/Bhu-Aadhaar issuance: **~30%** of rural parcels as of the most recent tracked figure, with a **March 2026 completion target** stated by the Centre — **not yet achieved as of this research date**.

**Practical implication:** a ULPIN lookup for a given parcel today has a real chance of returning "not yet geo-referenced" even where RoR digitization is complete, since geo-referencing lags RoR digitization by roughly 46 percentage points nationally. This must be surfaced as an honest per-parcel status, not silently defaulted.

**State-by-state integration status:** **UNVERIFIED at per-state granularity this pass.** DILRMP's own coverage claim varies by source (29 States/UTs per one figure, "all states" per another) and no single authoritative per-state completion percentage table was found in this search pass. This needs a dedicated per-state verification pass (e.g. querying `dilrmp.gov.in`'s own state-linkout pages one at a time) before being cited as a hard fact anywhere in Ferrum's product.

---

## 2. Exhaustive source map

| Source | Type | Coverage | Accuracy | Access mode | Cost | Legal/ToS stance on commercial redistribution |
|---|---|---|---|---|---|---|
| **DILRMP / dolr.gov.in** | Government (national) | National gateway, links to state portals | Authoritative where geo-referenced (49.1% of villages) | Web portal; no unified national API found | Free | Government open-data posture; redistribution terms not separately verified this pass — **UNVERIFIED** |
| **State RoR portals** (Bhoomi/Karnataka, Mahabhulekh/Maharashtra, Bhu Bharati/Telangana, eServices/Tamil Nadu, etc.) | Government (state) | Varies by state, generally high within each state's own digitized villages | Authoritative (source of record) | Web portal per state; **no confirmed public API for any single state found this pass** | Free to view | **UNVERIFIED per state** — no state portal's ToS on bulk/commercial redistribution was confirmed this pass; must be checked per state before building on it |
| **Landeed** (private aggregator) | Private, commercial | Multi-state (confirmed: Maharashtra, Telangana, Tamil Nadu + others), 6 languages | Derived from official state databases (per vendor claim) | **Commercial API** — the only confirmed API-based multi-state access path found this pass | Paid (pricing not published/found this pass) | Private vendor's own ToS govern — **not verified this pass**; using it means depending on a third party's own compliance with state ToS, an added risk layer |
| **Bhuvan (ISRO/NRSC)** | Government (national) | Pan-India satellite imagery + thematic layers | High (ISRO-operated) | Open API + WMS, confirmed | Free (NDSAP — National Data Sharing and Accessibility Policy) | **Grants only a single-user license for Thematic Services** per the portal's stated terms — commercial/multi-user redistribution rights are **not clearly granted**; terms are described as "scattered across the site" by available sources — **treat as non-redistributable without further per-layer confirmation** |
| **Copernicus / Sentinel-2** (ESA) | Government (EU, international) | Global, includes India | High, 10m resolution | Open API (Copernicus Data Space Ecosystem) | Free | **Confirmed open** — free, full access; redistribution, adaptation, and commercial use are explicitly permitted under EU law, subject only to an attribution notice ("Copernicus Sentinel data [Year]") — **this is the compliant default imagery source** |
| **Google Earth Engine** | Private (Google), free tier for noncommercial | Global | High, multiple sensor sources aggregated | API | **Free tier is noncommercial/academic only** — a fee-for-service or commercial product built on it requires a **paid commercial license**; redistribution/resale of Products/Content without Google's written authorization is explicitly prohibited | **Red line: do not use the free/noncommercial tier for anything Ferrum charges for** — a paid commercial GEE license is the only compliant path if GEE's aggregation convenience is wanted |
| **EOX Sentinel-2 cloudless (s2maps.eu)** | Private (EOX IT Services) | Global cloudless mosaic | High (already integrated in Ferrum's codebase, currently inactive per prior research — see `TECH_SCOUT.md`) | Tile API | CC BY-NC-SA 4.0 (non-commercial) for recent vintages; **commercial use requires EOX's own paid license, not currently purchased** | Already correctly gated in Ferrum's code (`REQUIRES_PAID_LICENSE`, `fetchFootprints` returns `null`) — no new finding here, confirms prior audit |
| **Survey of India** | Government (national) | National, cadastral/topographic base maps | Authoritative (national mapping agency) | Online Maps Portal; Open Series maps (1:50K, free PDF) available | Free for Open Series; **licensing fee required for other/commercial map production/circulation** under the Survey of India (Regulation of Mapping) Rules, 1967 | **Any commercial map product built from SoI data requires an explicit SoI license** — this is a hard legal gate, not a ToS nicety; India's 2021 Geospatial Policy loosened some restrictions but licensing is still confirmed required for commercial circulation |
| **OpenStreetMap** | Open community | Global, variable density (urban India generally decent, rural sparse) | Variable, crowd-sourced | Overpass API / tile servers, already in use (Leaflet/OSM in Ferrum's current LandIntel) | Free | ODbL — share-alike on the *database*, but using it to render/derive facts (not redistributing the raw OSM database itself) is the low-risk, already-adopted pattern Ferrum already uses |

---

## 3. Feasibility spec — PLOT TRUTH ENGINE

**Concept:** given a parcel identifier (ULPIN where available, else lat/lon or an address), aggregate every available attribute from the sources above into one response, each field carrying its own **provenance** (which source), **confidence** (how authoritative), and **freshness** (as-of date) — never a single blended "fact" with no traceable origin. This directly extends Ferrum's existing `provenance_source`/`provenance_freshness` pattern (`W2-400`) and the `ProvenanceStrip` convention (`W2-387`) to a much larger attribute universe.

### Attribute classification

| Class | Meaning | Example attributes | Latency |
|---|---|---|---|
| **Instant (geospatial/derived)** | Computable immediately from open imagery/geometry once a parcel boundary is known — no per-request external call needed beyond a one-time tile fetch | Plot boundary/area (from cadastral geometry or Sentinel-derived boundary estimate), lat/lon, nearby OSM-footprint buildings, imagery-date chip, rough zoning-district overlay if a public zoning layer exists | Milliseconds to low seconds |
| **Request-time (state RoR fetch)** | Requires a live query against a specific state's own RoR system — no bulk pre-fetch is legally or practically viable given per-state ToS uncertainty | Owner name, survey number, land classification, mutation status | Seconds (if a compliant path exists) to **unavailable** (if the state has no API and only a login-gated web portal) |
| **Unavailable** | No compliant path currently exists | Full mutation history in most states; anything behind Landeed-style third-party aggregation without Ferrum's own direct ToS clearance; any Survey of India commercial-map-derived attribute without a purchased SoI license | N/A — must render as an honest "not available" state, never fabricated or silently omitted |

### Architecture (parcel resolution → attribute aggregation)

1. **Resolution step:** input (ULPIN, or lat/lon, or address) resolves to a parcel boundary. Compliant sources for this step today: OSM footprints (already in use) + Sentinel-2 imagery (confirmed open) for a visual boundary; a real cadastral-precision boundary requires either a state RoR fetch (where geo-referencing is complete — only 49.1% of villages nationally) or remains an INDICATIVE approximation.
2. **Aggregation step:** for each attribute class above, the engine either computes it instantly, issues a request-time fetch (only where a specific state's compliant access path has been separately verified — none confirmed as a public API in this research pass), or marks it unavailable.
3. **Every returned field carries:** `source` (which system), `confidence` (VERIFIED / INDICATIVE / SAMPLE, per Ferrum's existing convention), `freshness` (as-of date/imagery date), matching the `ProvenanceStrip` pattern already shipping.

### Licensing red lines (hard gates, not judgment calls)

| Red line | Why | Compliant alternative |
|---|---|---|
| Using Google Earth Engine's free/noncommercial tier for any Ferrum feature users pay for, directly or indirectly | Explicitly prohibited by GEE's own terms — a real legal exposure, not a style preference | Sentinel-2 direct from Copernicus (free, commercial-use-confirmed), or a **paid** GEE commercial license if GEE's specific aggregation/processing convenience is worth the cost |
| Redistributing/reselling Bhuvan Thematic Service data | Portal states a single-user license; commercial redistribution rights not confirmed | Use Bhuvan for direct visualization/reference only, not as a data layer redistributed inside a paid Ferrum product, until NRSC's terms are confirmed in writing for that use case |
| Building a commercial map product on Survey of India cadastral data without a purchased SoI license | Legal requirement under the 1967 Rules, not just a ToS line | Either purchase the SoI license for the specific commercial use, or stay on Sentinel-2/OSM-derived boundaries labeled INDICATIVE (not survey-precision) |
| Scraping any state RoR portal without confirming that state's own ToS | Unverified legal exposure, state-by-state — none of the state portals' commercial-access terms were confirmed this pass | Either use a state's official API where one is confirmed to exist (none found this pass), or route through a licensed aggregator whose own ToS have been checked (e.g. Landeed, itself unverified this pass), or don't offer that attribute for that state yet |
| EOX Sentinel-2 cloudless commercial use without the paid license | Same finding as `TECH_SCOUT.md` — already correctly gated in code | No change — the existing `REQUIRES_PAID_LICENSE` stub stays correct |

---

*Every fact above traces to a web search performed this session (2026-09-07), not training-data recall. The state-by-state DILRMP completion table and every individual state RoR portal's commercial-access ToS are flagged UNVERIFIED and need a dedicated follow-up pass before being relied on as settled fact anywhere in the product.*
