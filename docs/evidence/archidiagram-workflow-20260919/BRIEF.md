# ArchiDiagram workflow benchmark — brief (ATLAS, 2026-09-19)

Read-only research. INDICATIVE. No app code, shared docs, or competitor media/models touched or copied.
Base: origin/main `5d6ec4db5`. The operator's screenshot was not visible to ATLAS; scope taken from the two URLs named in the task.

## 1. What ArchiDiagram actually shows (evidence class per item)

| Item | Class | Evidence |
|---|---|---|
| Sun Diagram: 3D sun path from geolocation, shadow analysis, batch export | **SketchUp plugin workflow** (Standard/free, Studio, Pro tiers; SketchUp 2020+) | https://archidiagram.com/sun-diagram/ ; https://forums.sketchup.com/t/plugin-sun-diagram-3d-sun-path-shadow-analysis-batch-export/345345 |
| Dynamic Symbols, Shadow Slice | SketchUp plugin | https://archidiagram.com/ |
| Site-analysis sample (Sample-54): sun path + shadow analysis via Sun Diagram, curved 3D wind arrows, red site vs grey context, neighbouring-tower solar blocking | **Downloadable presentation sample** (SketchUp project + preview video); whole method is plugin-based, no web alternative shown | https://archidiagram.com/site-analysis-diagram/ |
| Wind arrows, access, contours, north arrow | **Diagrammatic** drawing steps; no wind dataset or access source stated. North arrow not mentioned; contour/access referenced but not demonstrated | same page |
| Web app "cloud architecture diagramming tool" | **Vendor-labelled BETA.** https://app.archidiagram.com returned only a page title to ATLAS's fetch; no login attempted; no features confirmed | https://app.archidiagram.com |
| "Trusted by 45,000+ / join 60,000+ architects" | **Vendor claim**, unverified | https://archidiagram.com/ |

Not found and **not inferred**: structural analysis, BOQ, code compliance, CFD/wind simulation, measured-data ingestion. The sample page states no data-source standard.

Takeaway: ArchiDiagram is a presentation-diagram workflow (precise sun geometry + hand-composed diagrammatic annotation), not an evidence engine. Provenance-labelled honesty is the gap Ferrum can own.

## 2. Ferrum current state (apps/web at base 5d6ec4db5)

| Capability | State | Line evidence |
|---|---|---|
| Parcel-anchored local origin, indicative extent | **LIVE (indicative)** | `lib/designstudio/environmentalContext.ts:118-149`; layer `:159` |
| Terrain | **Registry-only / UNAVAILABLE** — flat plane, no DTM/DSM | `environmentalContext.ts:183`; terrain capabilities ROADMAP `lib/productFeatureRegistry.ts:79` |
| OSM context buildings | **Seeded fixture** unless live fetch; confidence `SAMPLE-FIXTURE` | `environmentalContext.ts:203,218`; Space3D draws `sampleSiteContext` `components/workspace/Space3D.tsx:83,185` |
| Photoreal context | **Registry-only** ("Provider not integrated") | `environmentalContext.ts:225` |
| Proposed design | LIVE, AUTHOR-CONTROLLED | `environmentalContext.ts:245` |
| Confidence vocabulary | LIVE | `environmentalContext.ts:21` |
| Space3D sun/shadow | **Static** hard-coded directional light at (28,44,22); no date/time/lat input; no north indicator; shadow maps off in low-power/mobile | `Space3D.tsx:68-72`, `:48-51` |
| Space3D views | Perspective + top + axon insets, orbit controls | `Space3D.tsx:215-218` |
| Sun path / time-shadow controls | **Missing** | no sun/solar module found under `components/workspace`, `lib/designstudio` |
| Wind | **Missing** (no dataset); climate panel shows GAP without a series | `components/landintel/ClimateYearPanel.tsx:14` |
| Access / road | **Registry-only**: "NO ACCESS SOURCE CONNECTED" | `components/landintel/AccessConnectivityPanel.tsx:31` |
| North orientation | Map Composer gate requirement (export blocked until it passes); not a rendered on-map symbol | `lib/landintel/mapComposerRequirements.ts:12`; `productFeatureRegistry.ts:80` |
| Shell catalog | INDICATIVE typologies; orientation/access UNKNOWN by design | `lib/designstudio/shellCatalog.ts:44,153` |
| MapLibre | Dependency present (`apps/web/package.json:18`, 6.10.0); registry entry still says "Planned; current web dependency is Leaflet" — stale | `lib/capabilities/openSourceRegistry.ts:51` |

## 3. Recommended slice (after LandIntel 2D/3D map lands): "Site Sun & Context Overlay"

One bounded slice. Not wind/CFD/BOQ.

**Behaviour**
- One shared site coordinate (parcel origin from `deriveLocalOrigin`) feeds the MapLibre 2D view and Space3D; both show the same north and scale.
- North arrow derived from map bearing, rendered in both views.
- Sun control: date + local-time slider + presets (solstices/equinoxes). Solar azimuth/altitude computed client-side from lat/lon/date/time/time zone (public astronomical formula; any dependency add is CRANE-owned per AGENTS.md RULE 1). Drives Space3D's directional light and shadow map; 2D shows a sun-direction ray and optional shadow footprints of extruded buildings.
- Sun-path arc with hourly ticks as a thin diagrammatic overlay.
- Wind and access: **diagrammatic-only** author-placed arrows/lines, badged "DIAGRAMMATIC — not measured", or hidden until a dated source exists. No automatic wind direction.
- Layer toggle rail: sun path, shadow, north, context buildings, wind/access notes. Toggles change overlay visibility only.

**Layer contract (source + class badge shown on the layer itself, not only in a legend)**

| Layer | Data source | Class | Honesty rule |
|---|---|---|---|
| Site point/extent | Parcel record (`environmentalContext.ts:118`) | Recorded, INDICATIVE | "Not a surveyed boundary" |
| Sun position/path | Astronomical formula from lat/lon/date/time + declared TZ | **Simulated (deterministic geometry)** | Show lat/lon, date, TZ, method; no lux/energy/daylight-factor claims |
| Shadows | Sun position × extruded building heights | **Simulated** | Confidence = weakest input: OSM heights per-building or missing, terrain flat; caption "flat ground, OSM/fixture heights"; fixture shows `SAMPLE-FIXTURE` |
| North | Map bearing / project CRS | Derived | Label true vs magnetic; no declination claim unless sourced |
| Context buildings | OSM live or fixture | Third-party measured / SAMPLE-FIXTURE | ODbL attribution + date (`OsmLayerSourceInfo`, `environmentalContext.ts:153`) |
| Wind | None connected | **Diagrammatic** | Arrow = author intent, never prevailing-wind data; upgrade requires a dated station/reanalysis source |
| Access | None connected (`AccessConnectivityPanel.tsx:31`) | **Diagrammatic** | Reuse "adjacent ≠ legal access" copy |
| Terrain | None (`environmentalContext.ts:183`) | UNAVAILABLE | Shadow caption states flat-ground assumption |

**Acceptance**
1. Same lat/lon/bearing in 2D and 3D (test asserts identical origin values).
2. Known-answer tests: sun azimuth/altitude for at least 3 lat/date/time cases against an independent reference, with the tolerance stated in the UI (e.g. ±1°).
3. Every layer renders a source badge + class (measured / simulated / diagrammatic / unavailable); none without.
4. Toggling any layer never hides, dims or occludes the building model; overlays sit beside/beneath it and the building stays pickable (selection at `Space3D.tsx:328`). Test: building mesh visibility/opacity invariant across all toggle states.
5. Phone (~390 px), tablet (~820 px), desktop (≥1280 px): controls ≥44 px touch targets; rail becomes a bottom sheet on phone and does not cover the building's bounds; no horizontal scroll; low-power mode keeps sun direction but may drop shadow maps with a visible note (existing behaviour `Space3D.tsx:48-51`).
6. Non-claims copy: "Indicative site study. Not a solar-access, daylight, wind, or code-compliance analysis."
7. Reduced-motion respected for time-scrub animation.

**Out of scope**: wind simulation, energy/daylight metrics, terrain shadows, structural/BOQ/compliance, auto-exported presentation sheets, importing any ArchiDiagram file.

**Flagged for owners (not done here)**: `openSourceRegistry.ts:51` MapLibre entry stale vs `package.json:18` (SCRIBE/CRANE); Space3D's fixed sun is unlabelled.

## 4. No-IP-copy boundary
- Use public facts (feature categories, workflow order) for orientation only. Cite; do not reproduce.
- Do not download, embed or trace ArchiDiagram sample files (.skp), preview videos, images, symbols, templates or diagram layouts; do not scrape the beta app or bypass login.
- Ferrum's north arrow, sun path, wind/access glyphs and layout are original designs on Ferrum tokens; sun maths are public astronomy, not vendor code.
- Do not use ArchiDiagram/Febhouse names or "trusted by" claims in Ferrum UI or marketing.

## 5. Primary links
- https://archidiagram.com/
- https://archidiagram.com/site-analysis-diagram/
- https://archidiagram.com/sun-diagram/
- https://app.archidiagram.com (title only; beta, unverified)
- https://forums.sketchup.com/t/plugin-sun-diagram-3d-sun-path-shadow-analysis-batch-export/345345
- https://sundiagram.com/download-resources/create-3d-sun-path-using-extensions-sketchup/

## 6. Limits of this audit
Page contents came via a summarising fetch, not raw HTML or screenshots; Sample-54 details are that summary. Web app untested past its title. Ferrum line numbers are from base `5d6ec4db5` and will drift after later lands.
