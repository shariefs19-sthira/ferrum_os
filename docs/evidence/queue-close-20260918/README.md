# Queue-close rendered evidence — 2026-09-18

This bundle records rendered-edge acceptance evidence captured from the public
Ferrum OS Worker. It is evidence for the exact deployed release below; it does
not claim that later commits on `main` were deployed.

## Release under test

- Public Worker: `https://ferrumos-preview.shariefsatyala.workers.dev`
- Deployed Git SHA: `ac5b220c22e9e49d0321df6f0d40cc18509c0891`
- Cloudflare version: `cb1db4b8-e31c-4128-b134-d3e35b32816e`
- Capture time: `2026-09-18T18:02:25.100Z` (`2026-09-18 23:32:25 IST`)
- Every captured route returned HTTP 200 with no recorded console or page
  errors. Exact extracted text, interaction results and viewport sizes are in
  `capture-report.json`.

## Acceptance matrix

| Surface | Rendered result | Evidence status |
|---|---|---|
| BOQ Pro model-linked take-off | Desktop and mobile show the selectable quantity line, highlighted source geometry, calculation basis, source element IDs, assumptions/exclusions, revision fingerprint, checker state, `UNKNOWN` formwork and `INDICATIVE` qualification. | **LIVE for the bounded deterministic sample workflow.** It is not engineering certification and rates remain unverified. |
| LandIntel site intelligence | Environment, governed terrain and access/proximity views render. Terrain and access panels explicitly show `NO ... SOURCE CONNECTED`, `UNKNOWN`, required evidence and `ROADMAP` analyses. | **LIVE as a governed disclosure/specification surface.** Terrain ingestion, analytical results, licensed access/POI data and real parcel context are not live. |
| DesignStudio environmental context | Desktop and mobile render separated context layers, provenance fields, export controls and `INDICATIVE — CONTEXT ONLY`. | **LIVE as a guarded context panel.** Google Photorealistic 3D Tiles, survey boundary and terrain integration remain unavailable/gated. |
| Project cockpit IFC export | A real desktop pointer click downloaded `ferrum-plan.ifc` and rendered `IFC4 exported with 3 storey(s) — 12 walls, 3 slabs, 3 spaces.` | **LIVE on desktop for the bounded sample export.** Mobile interaction is not accepted: the tool rail intercepted the export control. |

## Files and SHA-256

| File | Bytes | SHA-256 |
|---|---:|---|
| `boq-model-linked-desktop.png` | 75,149 | `70296b39a40567ecb0aa8cdc383a1985868792b0211bda6b60bda0d4f3e46662` |
| `boq-model-linked-mobile.png` | 159,561 | `1edd2130aa29c32f34287cb13d69e8e6ed502f2c15f6c28440f6b09857a77a74` |
| `landintel-environment-desktop.png` | 515,919 | `c3eba6b8031bb403c530958fac49786d53329dce5f32d5b078c6e2761fe667fe` |
| `landintel-terrain-desktop.png` | 210,963 | `5544c001ecbfa82377b2e375594961056bfb58b0c710aaa15ed5e111b3fdebd1` |
| `landintel-access-mobile.png` | 157,572 | `9e2513a7323b60b5989bdd2ec6831e492a5ef60aed54c4f0f49ba605e33f767c` |
| `designstudio-environment-desktop.png` | 268,501 | `1cebf98b28e5e15f912a650539b26c4ff4f1fdc98c8a5d628241bfe8612f863a` |
| `designstudio-environment-mobile.png` | 1,079,466 | `e671f1594c8acd0541be7953058201cfe3c994bd027f5f307ffae22046b0ec2a` |
| `cockpit-ifc-export-desktop.png` | 133,748 | `41e8c8cb7a6958a8ffaf8dd3987e7ce6964621b7e8f68a9cf1a3b44af345d459` |
| `cockpit-ifc-export-mobile.png` | 187,852 | `9e4389adcb25ef1ef1e59d8ef464428570f95b6dd166f80af38124aa0737f98d` |
| `ferrum-plan.ifc` | 12,655 | `1ce93b5a37de3e17f1b9fa4380870847d00078232cb0dd8a8473e09e55ae18f3` |
| `capture-report.json` | 28,159 | `2b2e5a4a833a37098352d5c3f5c6a057d12e0d15adb647574c12549077c0dd8f` |

`capture.mjs` is retained as the reproducible capture procedure. It uses real
pointer input for acceptance interactions and records failures rather than
forcing a DOM click through an overlapping control.
