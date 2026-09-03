# OSM neighbour pipeline proposal

## Status

**PROPOSAL — not implemented.** The current parcel map renders OpenStreetMap
tiles with attribution; it does not establish a surveyed boundary, fetch a
neighbour dataset, or generate 3D massing. Any future implementation requires
separate approval, service-policy review, and deployment verification.

## Goal

Provide optional context around a user-supplied site polygon: nearby mapped
building footprints, roads, water, green/open areas, and other OpenStreetMap
features that can be rendered as simple context massing. The output is for
early visual orientation only, not for dimensions, ownership, rights, legal
boundaries, height verification, access, setback, or feasibility conclusions.

## Pipeline

```text
user polygon + map revision
  -> validate coordinates, CRS, and maximum query area
  -> fetch OSM features for a bounded buffer
  -> cache raw response with query, timestamp, and source metadata
  -> normalise/filter geometry and tags
  -> derive display-only context massing
  -> render feature provenance, freshness, attribution, and INDICATIVE label
```

## Fetch stage

1. Accept only a user-confirmed polygon in WGS84 and reject malformed,
   self-intersecting, or unbounded geometry.
2. Apply a small configurable buffer and hard maximum area/feature limits
   before requesting data. Exceeding a limit returns a user-visible “refine
   area” state, never a silent partial scene.
3. Query a policy-approved OSM service using its published usage policy,
   attribution requirements, rate limits, and an identifying application User
   Agent where required. Do not scrape map tiles as feature data.
4. Cache by normalized query and source timestamp; throttle repeated requests.
   Cache expiry and provider error handling must remain visible in the result.
5. Preserve raw source IDs, tags, query parameters, timestamp, provider, and
   attribution with each derived feature.

## Normalisation and massing

| Source feature | Display treatment | Confidence label |
| --- | --- | --- |
| `building=*` polygon with explicit height | Extrude footprint to the tagged height. | `OSM_TAGGED_HEIGHT` |
| `building=*` polygon with `building:levels` | Derive a display height from the configured per-level assumption; show the assumption. | `OSM_DERIVED_HEIGHT` |
| `building=*` polygon without height data | Render a low neutral footprint or a clearly assumed extrusion; never imply measured height. | `OSM_ASSUMED_HEIGHT` |
| roads / paths | Render as flat context lines or surfaces. | `OSM_MAPPED_FEATURE` |
| water / green / landuse | Render as flat, labeled context areas. | `OSM_MAPPED_FEATURE` |
| point features | Render only when relevant to context; do not convert a point into a building mass. | `OSM_POINT_FEATURE` |

Massing is a rendering transform, not a building survey. It must preserve the
source geometry separately from derived display geometry and never combine
missing attributes into a claimed measurement.

## Mandatory user-facing labeling

Every viewport, export, and downstream artifact containing pipeline output
must display:

> **INDICATIVE — OSM community-mapped context, not a survey, title record, or
> approved plan. Verify boundaries, heights, access, services, and constraints
> with authoritative records and qualified professionals.**

The UI must also expose source attribution, data timestamp, provider/query
status, and per-feature confidence label. A stale, rate-limited, empty, or
failed response remains visibly distinct from an area with no mapped features.

## Guardrails and non-goals

- Preserve OpenStreetMap attribution and comply with applicable ODbL/provider
  requirements before release.
- Do not send authenticated project data, personal data, or hidden parcel
  notes to the provider.
- Do not use OSM data as a substitute for official land records, a survey,
  entitlement, code check, or development approval.
- Do not claim live, complete, current, or verified neighbour data.
- Do not make an unbounded Overpass request or depend on a single public
  endpoint without a failure and quota plan.

## Acceptance evidence for a future implementation

1. Fixture tests prove geometry validation, buffer limits, tag handling,
   labeling, and no-height behaviour.
2. A deployed-edge test records normal, empty, stale, throttled, and provider
   error states without silent fallback.
3. Visual QA confirms attribution and the INDICATIVE label are present in map,
   massing, and export surfaces.
4. A product/legal review records provider-policy, attribution, caching, and
   privacy decisions before release.
