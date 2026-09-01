# LAUNCH ARCHITECTURE v1 (conductor-authored, 2026-09-01)
Topology: static site (apps/web/out) + thin Worker (apps/web/worker.ts)
co-hosted; /api/*, /mcp, /docs/api. Storage: D1 "ferrum-os-data" (binding DB,
id 049b0f34-adb3-4f7f-85ec-60170019f3a0) for rates/parcels/leads/plans;
R2 deferred (exports stay client-side); KV cache optional.
Seams (interface now, real integration later): LandRecordsProvider,
RatesProvider, GeometryExporter.
AI surface: llms.txt, MCP tools (ulpin-demo, testfit, boq-estimate, plan-gen,
is-check), OpenAPI at /docs/api, schema.org, tool JSON-Schemas.
AT LAUNCH: Workers+D1 edge stack, MCP, llms.txt, OpenAPI, client DXF export,
SVG massing/plan viz, INDICATIVE sample parcel dataset, lead capture,
parity calculators, Relume design.
POST-LAUNCH RAILS: real DILRMP/ULPIN APIs, WebGPU FEA + 3D viewer, IFC
import/export, auth + workspace, digital-twin-lite, live rate feeds.
Build order: 273 → 276 → 277 → 278 → 274 → 275, after Waves A/A2/C + parity.