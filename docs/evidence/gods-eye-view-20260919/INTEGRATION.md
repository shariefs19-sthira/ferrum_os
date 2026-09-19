# gods-eye-view integration research (ATLAS, 2026-09-19)

INDICATIVE research note. Nothing here is implemented; no product code touched.

## 1. Pinned source

- Repo: https://github.com/bilawalsidhu/gods-eye-view
- Commit: `0d41b6be5490db1f10a171f238be75db4d4ec3b4` (2026-09-16T11:57:56-07:00, "Merge pull request #626 ... fix/vessel-partial-feed-status")
- Files read at that commit: `README.md` (521 lines; searched for license/Cesium/Google terms, not read end to end), `LICENSE` (62), `DATA_SOURCES.md` (194), `package.json`.
- Map/camera paths read: `src/camera.js` (82), `src/maps/google3d.js` (81), `src/maps/imagery.js` (29), `src/maps/terrain.js` (35), `src/maps/controller.js` (349), `src/maps/credits.js`, `src/director/camera.js` (54), `src/scenes/cameraMotion.js` (70), `src/ui/cameraOrientationControls.js` (378). Of these, `camera.js` and `imagery.js` were read in full; the others were only skimmed via export/import listings.
- Not read: `src/cameraVerbs.js` (1550 lines), `docs/DIRECTOR-CAMERA.md`, the rest of the tree.

## 2. Stack fact that shapes everything

The project is vanilla JS on **CesiumJS** (`cesium ^1.124.0`) with Vite. Every map/camera file above imports `cesium`. Ferrum's `apps/web/package.json` has `maplibre-gl 6.10.0` and `three ^0.185.1`, and no `cesium`. Direct reuse of the map/camera code would need a new dependency (CRANE-only per AGENTS.md RULE 1) and a large engine, against RULE 41's 600KB-gzipped cockpit budget. Treat the code as a pattern source, not a drop-in.

## 3. MIT code that could improve the parcel-centered 3D site view

`LICENSE` grants MIT to source code only (Copyright (c) 2026 Bilawal Sidhu). The copyright notice must be retained on any copied file.

| Idea | Source | Ferrum use | Reuse mode |
|---|---|---|---|
| Orbit-around-target camera frame: read/set target, heading, pitch, range; tilt toggle (oblique -35 deg, straight-down -89 deg); reset-north | `src/ui/cameraOrientationControls.js` (`readCameraTargetFrame`, `setCameraTargetFrame`, `toggleCameraTilt`, `resetCameraNorth`, `createCameraOrientationAnimator`) | Parcel-centered view: camera state is a frame around the parcel centroid, not free-fly. Maps to MapLibre center/bearing/pitch/zoom and `easeTo`. | Reimplement the model (pure math); Cesium calls do not port. |
| Camera move as data: resolve pose, sample a move at progress in [0,1] | `src/director/camera.js` (`resolveCameraMove`, `sampleCameraMove`), `src/scenes/cameraMotion.js` | Deterministic, testable fly-in to a parcel. Upstream has `.test.mjs` files showing the test shape. | Small pure functions; portable once Cesium types are replaced (function bodies not verified). |
| Preset fly-in: top-down high start, delayed oblique descent, returns a cancel function | `src/camera.js` `flyToAustin` | Parcel open animation cancellable on user input. | Pattern only. |
| Keyless fallback stack: no credential gives Esri imagery + keyless terrain; credit registry | `src/maps/imagery.js`, `terrain.js`, `credits.js`, `controller.js` | Degradation profile per RULE 41(2): honest reduced mode when no 3D source exists; attribution kept visible. | Pattern only; see section 4 for Esri terms. |
| Startup route selection between direct-Google, ion, and keyless | `src/maps/google3d.js` `selectMapStartupRoute` | Explicit route selection with a labeled fallback. | Pattern only. |

Not recommended: `src/cameraVerbs.js` (voice-driven verbs), CCTV/ALPR layers, flight/vessel/satellite layers. Wrong domain and privacy-sensitive.

## 4. Data and license restrictions

The MIT grant does not cover data or assets. Per `LICENSE` and `DATA_SOURCES.md`:

- **Google Photorealistic 3D Tiles / Map Tiles API:** proprietary Google Maps Platform ToS, own key required; content "may not be cached, stored, rehosted, or committed"; Google attribution must stay visible. Also reachable via Cesium ion, whose free plan is for eligible personal/non-commercial use (README). Ferrum is a commercial product: do not adopt without a separate operator/legal decision. Nothing from this source may be committed as fixture or evidence.
- **Esri World Imagery:** Esri Master Agreement; "Powered by Esri" credit required. Commercial-use terms not verified by me; hold until checked.
- **OpenStreetMap-derived (Overpass, Nominatim, ALPR, datacenters, dams):** ODbL 1.0, attribution plus share-alike on the data; Nominatim has a usage policy (about 1 req/s).
- **TeleGeography submarine cables:** CC BY-NC-SA 3.0, non-commercial. Excluded.
- **Bhote Koshi event pack and derived river centerline** (`public/events/bhote-koshi-2026/`, `src/data/bhoteKoshiFloodPath.js`): CC BY-NC 4.0. Excluded.
- **Re:Earth/Mapterhorn terrain:** mesh CC BY 4.0 (attribution), geoid EGM2008. Candidate keyless terrain; attribution required.
- **OpenSky:** non-commercial. Excluded (also irrelevant).
- **`public/models/**` 3D models:** third-party licenses per `public/models/README.md`, not MIT. Excluded.
- **Camera-frame feeds:** can contain people and plates; excluded on privacy grounds regardless of license.
- RULE 30 note: upstream uses metres/degrees only; any range/altitude readout in Ferrum needs m and ft shown together.

## 5. Smallest disjoint implementation contract

Goal: a pure, dependency-free camera-frame module for a parcel-centered site view, consumable by whichever seat owns the LandIntel map. It touches no existing file.

- **New files only** (proposed owner: MASON; ATLAS does not add product code here):
  - `apps/web/lib/landintel/siteViewCamera.ts`
  - `apps/web/lib/landintel/siteViewCamera.test.ts`
- **API (pure functions, no DOM, no maplibre/three/cesium imports):**
  - `type SiteViewFrame = { center: [lng, lat]; bearingDeg: number; pitchDeg: number; rangeM: number }`
  - `frameForParcel(centroid, opts?) -> SiteViewFrame` (oblique default, bearing 0, range derived from parcel extent)
  - `toggleTilt(frame)` (oblique <-> top-down), `resetNorth(frame)`
  - `sampleFlyIn(from, to, progress) -> SiteViewFrame`, progress clamped to [0,1], cubic in-out easing, deterministic
  - `rangeReadout(rangeM) -> { m, ft }` using exact 0.3048 (RULE 30)
- **Acceptance (unit tests):** progress 0 and 1 return exactly `from`/`to`; tilt toggle is an involution; bearing normalizes to [0,360); ft/m readout round-trips within stated precision; no imports outside `lib/`.
- **Attribution:** file header credits "pattern adapted from bilawalsidhu/gods-eye-view @ 0d41b6b (MIT, (c) 2026 Bilawal Sidhu)" and includes the MIT notice if any code is copied rather than reimplemented.
- **Must not:** edit LandIntel map files, cockpit, or SUTRA files; add dependencies (RULE 1, RULE 6); load Google tiles or Esri imagery; store any third-party tile or dataset.
- **Wiring** into the map/cockpit is a separate row owned by the seats that own those files. FRONTEND-VISIBLE ACCEPTANCE (RULE 25) belongs to that wiring row; the module alone is an internal chore per RULE 25(2) and should be folded into it.
- **Open for operator:** whether any commercial 3D-tile source (Google/ion) is acceptable at all. Until answered, the wiring row uses MapLibre pitch/bearing over existing Ferrum sources.

## 6. RULE 17 proposal

Add a MapLibre `easeTo`-driven "Reset north / Tilt" control pair to the parcel view using the frame model above; no new dependency; touch targets at least 44px (RULE 41).

Caveat: I read AGENTS.md lines 1-945 of 1323 only; rules after RULE 47 were not reviewed.

-- ATLAS
