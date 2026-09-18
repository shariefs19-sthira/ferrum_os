# LandIntel geotechnical intelligence

## Product boundary

LandIntel combines regional public evidence and project-limited investigation
inputs to improve early site screening. It does not convert a regional map into
a site investigation or foundation design.

The visible panel therefore reports evidence coverage, limitations, conflicts,
unknowns and downstream holds before it reports any suitability state. Bearing
capacity, settlement, foundation type, excavation support and dewatering remain
project-specific professional outputs.

## Canonical evidence model

Every geotechnical observation records:

- topic, value and unit;
- `SOURCE-VERIFIED`, `USER-PROVIDED`, `INDICATIVE`, `INFERRED`, `UNKNOWN`,
  `STALE UPSTREAM DATA` or `CONFLICT` status;
- observed, inferred, modelled or professionally interpreted method;
- confidence and spatial coverage, including gaps;
- regional-screening or project-investigation scope;
- source URI, observation/publication/retrieval dates and transformation steps;
- input checksums, limitations and validity date.

`SOURCE-VERIFIED` means that Ferrum can trace the retrieved record to its stated
source. It does not mean the layer is accurate at foundation scale.
`USER-PROVIDED` stays distinct until a separately governed verification step is
completed.
Even a `SOURCE-VERIFIED` regional record cannot satisfy a project-investigation
requirement; provenance and engineering applicability are separate controls.

## Covered parameters

The canonical topic set covers terrain and slope; regional geology/lithology;
soil classification and properties; groundwater; flood/drainage; seismic,
landslide, subsidence, karst, liquefaction, contamination and radon screening;
boreholes; CPT/SPT and laboratory testing; bearing/settlement inputs; foundation
constraints; excavation/retaining; dewatering; and chemical
aggressivity/corrosion.

## Project input contract

Supported input classes are geotechnical reports, borehole logs, CPT results,
SPT results, laboratory tests, groundwater readings and accountable
professional interpretations. Inputs require an issue date, responsible party,
professional role, revision, SHA-256 checksum and explicit units. Coordinates
require a horizontal CRS; supplied levels also require a vertical datum.

## Source registry

The first registry entries are deliberately declarative. No adapter is shown as
connected, and no parcel coverage is implied. Before a connector can become
active it must preserve the selected record's licence, dates, scale/resolution,
coverage, evidence method and transformation lineage.

The registry currently identifies these authority portals:

- [USGS National Geologic Map Database](https://ngmdb.usgs.gov/ngmdb/ngmdb_home.html)
- [USGS 3D Elevation Program](https://www.usgs.gov/3d-elevation-program/about-3dep-products-services)
- [FEMA National Flood Hazard Layer access](https://msc.fema.gov/portal/advanceSearch)
- [British Geological Survey GeoIndex](https://mapapps2.bgs.ac.uk/geoindex/home.html)
- [Geological Survey of India Bhukosh](https://bhukosh.gsi.gov.in/Bhukosh/Public)

Each source has a published screening boundary. Layer-specific availability,
licence, currency and coverage must be checked at ingest rather than assumed
from the portal's existence.

## Deterministic holds

- Any `CONFLICT` blocks suitability until resolved.
- Any `STALE UPSTREAM DATA` requires refresh and recomputation.
- Missing soil, groundwater, investigation/testing, bearing/settlement or
  foundation-constraint evidence holds Structures, Foundations and BOQ.
- Missing groundwater/foundation constraints, conflicts or stale evidence also
  invalidate dependent DesignStudio decisions.
- A screen with only regional or unknown evidence remains `SCREENING ONLY`.

This contract makes incomplete evidence useful without presenting it as an
engineering conclusion.
