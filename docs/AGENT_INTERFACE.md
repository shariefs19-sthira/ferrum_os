# AGENT INTERFACE v1 (CRANE-authored, 2026-09-01)

## 0. Principle

Ferrum OS is agent-native: every capability a human reaches through the
marketing site or app is also reachable by an agent through a typed,
stable interface, backed by the same data. There is no second-class,
UI-only path. `docs/LAUNCH_ARCHITECTURE.md` names the AI surface
(llms.txt, MCP tools, OpenAPI, schema.org); this document is the concrete
spec for it — tool names, inputs, outputs, backing seam, and how each
maps onto the same REST route an agent using plain HTTP (A2A-style) can
call instead of MCP.

This spec governs the architecture wave's two agent-facing tasks:
W2-274 (MCP server) and W2-275 (OpenAPI at `/docs/api`). Both are built
from this document, not from scratch, so the tool set and the REST
surface stay in lockstep — one capability, two transports.

## 1. Topology recap

Static site (`apps/web/out`) + thin Worker (`apps/web/worker.ts`),
co-hosted. Worker owns three route families:

- `/api/*` — REST, OpenAPI-documented, callable by agents or scripts
- `/mcp` — MCP server, same capabilities as tool calls
- `/docs/api` — OpenAPI spec + human-readable reference

Worker reads/writes D1 `ferrum-os-data` (binding `DB`,
id `049b0f34-adb3-4f7f-85ec-60170019f3a0`). It is thin: read-only tool
logic plus one write path (lead capture). No auth-gated workspace at
launch — every tool below is either public-read or a public write with
its own scoping (see §4).

## 2. Capability inventory

Five read tools, one write tool, at launch. Each has a home product,
an MCP tool name, and a REST equivalent.

| Capability | Product | MCP tool | REST route | Seam |
|---|---|---|---|---|
| ULPIN parcel lookup (indicative) | LandIntel | `ulpin-demo` | `GET /api/ulpin/:id` | `LandRecordsProvider` |
| Rate comparison (indicative) | ProMarket / InvestFlow | *(none — REST only, see §3)* | `GET /api/rates/compare` | `RatesProvider` |
| Massing/test-fit generation | DesignStudio | `testfit` | `POST /api/testfit` | `GeometryExporter` (SVG out) |
| BOQ estimate | BOQ Pro | `boq-estimate` | `POST /api/boq-estimate` | D1 rate tables |
| IS-code compliance check | Structura | `is-check` | `POST /api/is-check` | static rule tables (no D1) |
| Plan generation (client DXF export) | DesignStudio | `plan-gen` | `POST /api/plan-gen` | `GeometryExporter` (DXF out) |
| Lead capture | site-wide (get-started, contact, product CTAs) | *(no MCP tool — write, gated)* | `POST /api/leads` | D1 `leads` table |

Rate comparison has no MCP tool at launch: it's a thin read over the
same `RatesProvider` seam `boq-estimate` already uses, and giving it a
second tool duplicates surface without adding capability. It ships as
REST-only; promote it to an MCP tool post-launch only if agent usage
shows real demand for it as a standalone call.

## 3. Tool contracts

Each tool below is the MCP definition. The REST route in §2 takes the
same input as JSON body (POST) or query string (GET) and returns the
same output shape — an agent calling either transport gets identical
data.

### `ulpin-demo`
- Input: `{ ulpin: string }`
- Output: `{ ulpin, state, district, area_sqm, land_use, indicative: true }`
- Backed by the same sample parcel dataset the LandIntel product page
  demos (`LandIntelLookup.tsx`). INDICATIVE until the real DILRMP/ULPIN
  API lands (post-launch rail, per `LAUNCH_ARCHITECTURE.md`).

### `testfit`
- Input: `{ plot_width_m: number, plot_depth_m: number, floors: number, setback_m?: number }`
- Output: `{ svg: string, floor_area_sqm: number, coverage_pct: number }`
- SVG massing only at launch (`LAUNCH_ARCHITECTURE.md`: "SVG massing/plan
  viz... WebGPU FEA + 3D viewer" is post-launch).

### `boq-estimate`
- Input: `{ items: Array<{ category: string, quantity: number, unit: string }> }`
- Output: `{ line_items: Array<{ category, quantity, unit, rate, amount }>, total, indicative: true }`
- Rates come from D1, seeded from the same indicative rate set BOQ Pro's
  UI uses — no separate agent-only pricing source.

### `is-check`
- Input: `{ structure_type: string, params: Record<string, number> }`
- Output: `{ code: string, checks: Array<{ rule, pass: boolean, note }> }`
- Static rule tables mirroring Structura's IS 456/875/800 checks
  (`docs/RELUME_ADDENDUM.md` product-page precedent for Structura). No
  D1 dependency — rules are code, not data, so this tool works even if
  D1 is unavailable.

### `plan-gen`
- Input: `{ testfit_id: string, options?: Record<string, unknown> }`
- Output: `{ dxf_url: string, expires_at: string }`
- Wraps a prior `testfit` result into an exportable DXF. Export stays
  client-side per `LAUNCH_ARCHITECTURE.md` ("R2 deferred, exports stay
  client-side") — the Worker returns a short-lived signed URL to a
  client-generated blob, not a server-rendered file.

## 4. Auth, scope, rate limits

- Read tools (`ulpin-demo`, `testfit`, `boq-estimate`, `is-check`,
  rate-compare): unauthenticated, rate-limited per-IP at the Worker
  edge (exact limits are a W2-274/275 implementation detail, not a
  spec commitment here — keep them generous enough that a single
  agent session doing normal exploratory calls never trips them).
- `plan-gen`: unauthenticated but scoped — the returned DXF URL is
  short-lived and tied to a prior `testfit` call's id, so it can't be
  used to generate arbitrary exports without first calling `testfit`.
- `leads` (write): unauthenticated POST, same validation the human
  lead-capture forms already run (required fields, email format). No
  MCP tool wraps it deliberately — lead capture is a conversion action
  tied to a specific human-facing CTA context (which product, which
  page), and an agent filing leads on a user's behalf without that
  context attached is a misuse risk worth designing out at the
  interface level, not just relying on rate limits to catch.
- No workspace/account auth at launch (`LAUNCH_ARCHITECTURE.md`: "auth
  + workspace" is a post-launch rail). Every tool above is stateless
  per-call; nothing here assumes a logged-in agent identity.

## 5. Discovery

- `llms.txt` at site root: plain-language capability summary + links to
  `/docs/api` and `/mcp`, per `LAUNCH_ARCHITECTURE.md`'s AI surface line.
- `/docs/api`: OpenAPI 3.x spec (W2-275) documenting the REST routes in
  §2, human-readable via Swagger-style rendering.
- `/mcp`: MCP server manifest (W2-274) listing the five tools in §3
  with their JSON-Schema input/output — generated from the same schema
  source as the OpenAPI spec so the two never drift apart.
- schema.org markup on product pages (already present via
  `ArticleJsonLd` and product structured data) gives crawling agents a
  non-MCP discovery path too — this is unchanged by this document.

## 6. What this document does not cover

- Concrete JSON-Schema files (generated during W2-274/275
  implementation, not hand-authored here).
- Rate-limit numbers, D1 schema for `leads`/rate tables (implementation
  detail, decided when W2-276's worker+D1 scaffold is built).
- Any capability beyond the five read tools + lead capture — if a
  sixth product needs an agent-facing capability post-launch, it gets
  its own entry here first, then an implementation task, in that order.
