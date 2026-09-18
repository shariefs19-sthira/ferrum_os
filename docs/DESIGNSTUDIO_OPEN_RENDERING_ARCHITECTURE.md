# DesignStudio open rendering architecture

Status: implementation baseline, 2026-09-19.

## Product boundary

DesignStudio uses an open-source-first rendering and model pipeline. Proprietary renderers are optional user-installed export plugins. They are never required for the Ferrum website, do not receive project write authority, and cannot change governed project records.

| Layer | Primary implementation | Status | Authority |
| --- | --- | --- | --- |
| Interactive rendered cockpit | Three.js PBR | Active | Read-only visualization of Ferrum geometry |
| Progressive beauty preview | three-gpu-pathtracer | Active in compatible WebGL2 sessions | Read-only visualization |
| IFC parsing and properties | web-ifc | Active dependency | Parse-only until a user approves an intake action |
| High-resolution rendering | Blender Cycles isolated worker | Next | Immutable scene input; image output only |
| D5 / V-Ray | Optional export plugins | Plugin only | No Ferrum project write access |

## Scene contract

The canonical browser scene uses metres, a local project origin, typed object identifiers and PBR materials. Visualization assets use glTF/GLB. Engineering exchange remains IFC/DXF with source checksums, units, CRS/datum where relevant, revision and approval status preserved independently from the render scene.

The progressive path tracer is a presentation view. It cannot change geometry, measured quantities, compliance results or approval state. A rendered image is never evidence of dimensional correctness.

## Shell catalogue admission

The catalogue stores original Ferrum outer-shell studies derived from regional typologies and climate responses. It must not copy a named practice's project geometry, drawings, facade composition or protected trade dress.

Each shell requires:

- region and applicable state context;
- building-use and plot-area range;
- geometry parameters and passive-response rationale;
- source, review date and copyright boundary;
- `INDICATIVE` status;
- explicit separation from planning approval, engineering verification and construction documentation.

Named architect practices may enter a precedent research register only when a lawful source, citation, date, observable design principle and reuse boundary have been recorded. A marketing list of “top 100 firms” is not a defensible ranking and is not a source of reusable models.

## SUTRA recommendation contract

When LandIntel provides a locked parcel, the first-stage ranker may use recorded state, district, plot area and land use. It must show the matched facts and retain these as `UNKNOWN` until connected evidence exists:

- orientation and solar obstruction;
- access and adjoining conditions;
- topography, drainage and geotechnical conditions;
- authority-verified zoning, setbacks, FAR and height;
- structural system, services and constructability.

Without a locked parcel, DesignStudio shows a neutral comparative shell and asks for parcel selection or manual plot inputs. It must not silently assume Bengaluru or any other locality for a project recommendation.

## Release sequence

1. Browser shell selection and Three.js PBR viewport.
2. Progressive browser beauty preview with device fallback.
3. Evidence-linked material and climate presets.
4. Isolated Cycles render worker with immutable scene manifests.
5. Optional exporter plugin SDK for third-party desktop renderers.

No phase changes engineering, planning or issue status without its own evidence and approval gate.

## Real-world context twin

The primary global building-context source is Overture Maps Buildings, with direct OpenStreetMap access as a fallback and freshness check. MapLibre GL JS provides the open map surface; Three.js provides the authored building scene. Large contexts may be converted into governed 3D Tiles and streamed through an open client. Cesium ion and Google Photorealistic 3D Tiles remain optional service adapters.

Source priority is fixed:

1. Accepted project survey and cadastral evidence control boundaries, coordinates and levels.
2. Source-qualified DTM, DSM or LiDAR controls terrain analysis within its stated accuracy.
3. Overture and OpenStreetMap supply contextual building and road geometry with missing attributes preserved as `UNKNOWN`.
4. Photorealistic meshes supply visual context only.
5. The proposed design remains independently authored and revision controlled.

No global source is assumed to contain reliable facade-window geometry. SUTRA can use neighbouring massing, orientation, weather and measured obstructions to propose facade and opening options, but it cannot present those options as approved placement.

The first open analysis stack is BEE Eco Niwas Samhita checks, Radiance/Honeybee daylight and glare simulation, EnergyPlus/OpenStudio thermal simulation, and specialist-reviewed OpenFOAM studies where computational fluid dynamics is justified. Inputs, versions, assumptions and result status must remain visible beside each recommendation.

## International product kernel

Ferrum OS is worldwide in scope. India is the first deep jurisdiction pack, not a hard-coded operating boundary. The worldwide kernel uses open, vendor-neutral IFC for built-asset exchange, OGC standards for geospatial context, explicit unit/CRS handling, and evidence-controlled information states.

Country support is released through independently versioned jurisdiction packs. Each pack resolves the country, subnational authority, municipality or authority having jurisdiction, rule edition, effective date, local amendments, official source and licence. A pack cannot convert a design into an approval; it can show checked clauses, unresolved requirements and the professional or authority responsible for closure.

Where a reviewed pack is unavailable, the design and environmental simulation tools remain usable while regulatory conclusions stay `UNKNOWN`. SUTRA must never apply Indian, United States, European or other rules outside their recorded scope.

### Regional delivery contract

Ferrum may use Cloudflare's coarse edge country/region signal to localize discovery, currency, language and the set of jurisdiction packs presented to a visitor. The signal is returned by `/api/region`, is not persisted by that endpoint, and can be overridden by the user.

User location never selects the governing design code. Project Context owns the project country, authority and parcel location. A user in India working on a London project receives the United Kingdom project pack once that project jurisdiction is selected and verified. The governing rule is: **user location personalizes discovery; project location governs design and compliance.**
