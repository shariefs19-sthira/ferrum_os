# LandIntel Site3D — God's Eye View camera controls (MASON, 2026-09-19)

INDICATIVE. Wires the pure `siteViewCamera` helpers (from 3ddebd7) into `SiteMap3D`: a "Top-down/Oblique" toggle and a "Reset north" compass (`data-site-view-controls`, top-left, 44px targets), applied with MapLibre `easeTo` around the *selected point*. No automatic camera move on load (`easeTo` not called until a control is pressed). No Cesium/Google/key/dataset/dependency.

Capture: `node capture.mjs http://127.0.0.1:4391` (next dev, no `_headers`, i.e. CSP-unrestricted, live OpenFreeMap tiles, SwiftShader WebGL2). Data in `results.json`, screenshots `*-3d-*.png`, `*-2d.png`. Widths 320/390/768/1024/1440, all `data-3d-status=ready`, coverage `covered` at the Bengaluru sample point (not a parcel).

Measured per width: oblique(55°) -> top-down(0°) -> oblique via real clicks; after Rotate right bearing -2.6, Reset north -> 0.0; camera centre == selected point; selected point unchanged; controls 88x44 / 44x44; no control on map centre; no control/attribution overlap (existing bottom-left stack raised bottom-8 -> bottom-16 because the expanded MapLibre attribution overlapped it at 320/390); no horizontal overflow; 2D plan (Leaflet + marker) still renders after toggling back.

## CRANE release blocker (not fixed here; `_headers` untouched)
Enforced CSP in `apps/web/public/_headers` has no `https://tiles.openfreemap.org` in `connect-src` (grep count 0), so on the deployed edge 3D falls back to 2D. See `../site3d-live-20260919b-csp-current/` and `-csp-proposed/`. This work is COMMITTED/PUSHED only, not LANDED and not LIVE.
