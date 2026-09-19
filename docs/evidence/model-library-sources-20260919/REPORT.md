# Model-Library Source Policy Report — INDICATIVE

Seat: ATLAS · Evidence date: 2026-09-19 · Status: INDICATIVE (research only; not legal advice; no files downloaded or ingested; no app code touched).
Method: primary official pages fetched 2026-09-19 (summaries via WebFetch; quotes are as returned). Where a primary page could not be fetched, the cell says UNKNOWN or UNVERIFIED.

## Separation rules (apply to every source)
Free access, or open-source *rendering code*, is not an open right to the *content*. Five layers carry separate rights and must be recorded separately: (1) source geometry/data, (2) building design IP, (3) map/tile imagery, (4) text/image media, (5) engineering validation. **No plan, BOQ, or FEA from any source below is prevalidated by Ferrum**; any use requires Ferrum's own engineer review. OSM-derived data needs ODbL attribution/share-alike (https://www.openstreetmap.org/copyright).

## Eligibility matrix
Legend: A = real-site surrounding visual context, B = reusable Ferrum building shell, C = design inspiration only. Y = plausible subject to conditions, N = no, U = UNKNOWN.

| Source | URL (evidence 2026-09-19) | What is actually available | Terms found | Commercial catalog reuse / redistribution / derivatives | A | B | C |
|---|---|---|---|---|---|---|---|
| Google Photorealistic 3D Tiles | https://developers.google.com/maps/documentation/tile/policies | Keyed, billed streaming visualization tiles via Map Tiles API. No downloadable model. | Must not "pre-fetch, index, store, or cache" except limited conditions; prohibits "image analysis, machine interpretation, object detection or identification, geodata extraction or resale, and offline uses"; Google attribution required. | No / No / No (extraction and offline use forbidden) | Y, live render only, keyed, attributed, no storage | N | N |
| Google Open Buildings | https://sites.research.google/gr/open-buildings/ | 2D footprint polygons + confidence (0.65-1.0), area, Plus Code. No height, type, or 3D. v3 (May 2023), 58M km2, Africa/S+SE Asia/LatAm/Caribbean; conflict zones excluded. | CC BY-4.0 or ODbL v1.0 (user's choice); attribution required. | Y with attribution (CC BY-4.0); ODbL adds share-alike | Y footprints only (extrusion needs external height); quality drops in dense/high-rise/arid areas | N (not a 3D model) | N |
| CADMapper | https://cadmapper.com/terms | CAD/3D exports of city blocks built from OSM etc. | Downloads under ODbL, OSM contributors' terms; commercial use allowed if "attribution and share-alike terms" met; scraping/automated access needs written permission. | Y under ODbL (attribution + share-alike); export is a derivative database. Non-OSM layers (terrain/imagery) UNKNOWN | Y with ODbL handling | N (massing only) | Y |
| Great Buildings Collection | http://www.greatbuildings.com/ (host unreachable from this env: ECONNREFUSED, curl 000; terms seen only via search snippets of /licensing.html) | Building documentation: images, drawings, commentary, some 3D models. | Snippets: every image "copyrighted by its photographer, with all rights reserved". Model terms UNVERIFIED. | UNKNOWN / presume No | N | N | Y (link out only) |
| Cities and Buildings Database (UW) | https://content.lib.washington.edu/buildingsweb/index.html | Digitized architectural images (photos, sketches, models), searchable metadata. No engineering-grade geometry. | "copyright controlled as indicated. Copying, printing, or distributing any of them without the permission of the copyright holder is expressly prohibited"; per-image (c) holders; educational/research access. | No / No / No without per-image holder permission | N | N | Y (view/link only) |
| WikiHouse | https://www.wikihouse.cc/terms | Modular timber building system, design resources, CNC-ready files via community/manufacturers. | Most files CC BY-SA 4.0; commercial use allowed; derivatives must stay under the same licence; keep licence notices; provided "as is" without warranties/certification; needs structural-engineer and code review; "WikiHouse" name restricted to approved partners. Per-file licence must still be checked. | Y with attribution + share-alike (share-alike may conflict with proprietary catalog terms; legal review) | N | Y candidate (per-design licence check + engineer review) | Y |
| Paperhouses (operator-named; architectural plans platform) | https://www.paperhouses.com/ (unreachable from this env: curl 000 on www and apex; no primary page read) | UNKNOWN (primary site not reached; identified only by operator as an architectural plans platform) | UNKNOWN. No terms read from the primary site. | BLOCKED (licence/redistribution unknown; pending primary evidence) | N | U | U (architecture-plan candidate; ingestion_gate=blocked until primary terms are read) |
| Open Source Ecology (incl. Hab Lab housing) | https://wiki.opensourceecology.org/wiki/Housing ; https://www.opensourceecology.org/ | Hab Lab dorm design description (CEB walls, 22 beds/9 rooms) and a SketchUp .skp of the site (MediaFire link, off-platform). GVCS machine designs. | Content "CreativeCommons by-sa4.0" unless otherwise noted; wiki warns Factor e Farm is "permanently under construction"; as-built deviated from plan. | Y with attribution + share-alike; embedded third-party media may differ (check per file) | N | Weak; experimental designs, not a code-compliant shell library | Y |
| NDSU Extension building plans | https://www.ndsu.edu/agriculture/ag-hub/ag-topics/ag-buildings/building-plans/housing-building-plans | Downloadable PDF plans (farm/housing/etc.), originating from USDA Coop Farm Buildings Plan Exchange, Midwest Plan Service, NDSU ABE, some Canadian Plan Service/APA. | No copyright or reuse statement found on the page; mixed-source provenance (search snippet: plans are "conceptual" and need professional tailoring). | UNKNOWN (mixed origins; would need NDSU/MWPS/etc. permission) | N | U pending permission | Y |

## Layer notes
- **Source geometry**: only Open Buildings (footprints) and OSM-derived CADMapper exports carry an explicit open data licence; both need attribution, ODbL adds share-alike.
- **Building design IP**: only WikiHouse and OSE state CC BY-SA 4.0; all others UNKNOWN or restrictive.
- **Map tiles**: Google tiles are a licensed live service, not an asset.
- **Text/image media**: Great Buildings and UW CBD are all-rights-reserved per item; link out only.
- **Engineering validation**: none. WikiHouse explicitly disclaims certification; NDSU material says professional tailoring is required.

## Proposed provenance/permission metadata schema (future catalog entries)
```json
{
  "entry_id": "string",
  "source": { "name": "", "primary_url": "", "retrieved_at": "ISO-8601", "content_hash": "sha256" },
  "layer": "source_geometry | design_ip | map_tiles | media | engineering",
  "licence": { "spdx": "CC-BY-SA-4.0 | ODbL-1.0 | CC-BY-4.0 | proprietary | UNKNOWN", "terms_url": "", "verified_at": "", "verified_by": "" },
  "rights": { "commercial_use": "yes|no|unknown", "redistribution": "yes|no|unknown", "derivatives": "yes|no|unknown", "share_alike": true, "attribution_text": "", "trademark_restrictions": "" },
  "restrictions": ["no_extraction", "no_offline", "keyed_service", "per_item_copyright"],
  "usage_class": "A_site_context | B_building_shell | C_inspiration_only",
  "engineering_status": "unvalidated | ferrum_reviewed | third_party_stamped",
  "engineering_evidence_url": "",
  "quality": { "completeness": "", "known_gaps": "", "confidence": "" },
  "ingestion_gate": "blocked | legal_review | approved",
  "notes": ""
}
```
Rule: `ingestion_gate=approved` requires `licence.verified_at`, no `unknown` rights fields, and `engineering_status` shown to users as unvalidated unless reviewed.

## Prioritized lawful-ingestion shortlist (none ingested now)
1. **Google Open Buildings v3 footprints** (CC BY-4.0 or ODbL) for A where covered; store attribution; no height.
2. **OSM building footprints/heights directly** (ODbL) for A worldwide; CADMapper only as a convenience export, same ODbL duties.
3. **WikiHouse designs** for B: per-design licence check, legal review of share-alike against catalog terms, Ferrum engineer review.
4. **OSE Hab Lab** for C, and possibly B for earth-block concepts; treat as experimental.
5. Google 3D Tiles: live viewer only, never stored in the catalog. Others (Great Buildings, UW CBD, NDSU): link/reference only, or seek written permission. Paperhouses: architecture-plan candidate, BLOCKED pending primary-site licence evidence.

## Link validation (curl -L, 2026-09-19)
200: Google tiles policies, Open Buildings, CADMapper terms, WikiHouse home + terms, UW CBD, OSE wiki Housing, OSE home, NDSU housing plans, OSM copyright.
Unreachable (000): greatbuildings.com (home, licensing), paperhouses.com.

## Limitations
Summaries came from an LLM-assisted fetch, not manual reading; Great Buildings model terms and Paperhouses (primary site unreached; identity per operator only) are unverified; NDSU/MWPS rights not found. Re-verify before any ingestion.

-- ATLAS
