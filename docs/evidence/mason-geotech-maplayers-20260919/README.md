# LandIntel geotechnical map-layer legend — local-build evidence — 2026-09-19

**Status: NOT LIVE.** This bundle is rendered evidence from a **local static
build only** (`apps/web/out`, served by `capture.mjs`'s own throwaway
`http.createServer` on `localhost:48173`). It is **not** a deployed edge, not
`origin/main`, and does not satisfy RULE 22/25's live-edge verification. It
exists only because this branch is explicitly not landed or deployed, so
there is no live edge yet to capture the new
`GeotechnicalEvidenceSection`/`GeotechnicalMapLayerLegend` surface from.

## `/api/region` is stubbed — this is not a claim it works

The captured page fetches `/api/region` (a Worker-backed route) site-wide,
unrelated to the geotechnical map-layer surface this evidence is actually
about. A static file server cannot serve a Worker route at all, so
`capture.mjs` stubs that one request with a fulfilled `200 {}` response
purely to keep the console log free of noise this local harness was
structurally never going to be able to answer. **This is not a claim that
`/api/region` works, is reachable, or was verified in any way** — it is
explicitly excluded from what this evidence demonstrates, and is labelled as
such in both `capture.mjs` (inline comment) and `capture-report.json`
(`apiRegionStub` and per-capture `apiRegionStubbed: true` fields).

## What this evidence actually shows

- `landintel-geotech-maplayer-legend-desktop.png` / `-mobile.png`: the Land
  theme tab of `/products/landintel`, scrolled to the geotechnical map-layer
  legend, at 1366 desktop and iPhone-13 mobile widths.
- Zero horizontal overflow at both widths.
- Zero console errors (after the `/api/region` stub above).
- The legend's disclosure copy reads as a declarative categorisation, not a
  claim of rendered map geometry.
- Default (no real parcel resolved) counts: 20 items in UNKNOWN gap, 0 in
  every other category — matching `createUnknownGeotechnicalScreening()`.

## What this evidence does NOT show

- Anything about `/api/region`'s real behaviour (stubbed, not verified).
- A deployed/live rendering of the parcel-swap → Stale reclassification path
  (that is covered by the real, mounted integration test in
  `GeotechnicalEvidenceSection.test.tsx`, not by this screenshot capture).
- Any claim that this branch is landed or deployed.

See `capture-report.json` for the exact extracted text and per-capture
status, and `capture.mjs` for the exact script that produced it.
