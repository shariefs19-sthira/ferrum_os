# AGENT INTERFACE v2 (CRANE-authored, 2026-09-01)

v1 (landed 2026-09-01, commit 9f9bf26) covered 5 of 9 products and had
no MCP Apps, A2A, payments, or security sections. v2 expands to the
full W2-305 scope: all 9 products, MCP Apps plan, A2A agent-card spec,
agent auth + rate-card design, payments evaluation, llms.txt/AGENTS.md/
OpenAPI alignment, and an MCP security section.

## 0. Principle

Ferrum OS is agent-native: every capability a human reaches through the
marketing site or app is also reachable by an agent through a typed,
stable interface, backed by the same data. There is no second-class,
UI-only path. `docs/LAUNCH_ARCHITECTURE.md` names the AI surface
(llms.txt, MCP tools, OpenAPI, schema.org); this document is the concrete
spec for it — tool names, inputs, outputs, backing seam, and how each
maps onto the same REST route an agent using plain HTTP (A2A-style) can
call instead of MCP.

This spec governs the architecture wave's agent-facing tasks — W2-274
(MCP server) and W2-275 (OpenAPI at `/docs/api`) most directly, plus
W2-276/277/278 as the seams both depend on. All five are built from
this document, not from scratch, so the tool set, the REST surface, and
the A2A card stay in lockstep — one capability, three discovery paths.

## 1. Topology recap

Static site (`apps/web/out`) + thin Worker (`apps/web/worker.ts`),
co-hosted. Worker owns four route families:

- `/api/*` — REST, OpenAPI-documented, callable by agents or scripts
- `/mcp` — MCP server, same capabilities as tool calls
- `/docs/api` — OpenAPI spec + human-readable reference
- `/.well-known/agent.json` — A2A agent card (§7)

Worker reads/writes D1 `ferrum-os-data` (binding `DB`,
id `049b0f34-adb3-4f7f-85ec-60170019f3a0`). It is thin: read-only tool
logic plus one write path (lead capture). No auth-gated workspace at
launch — every tool below is either public-read or a public write with
its own scoping (see §5).

## 2. Capability inventory — all 9 products

Six read tools, one write tool, at launch; three more read tools
deferred post-launch because their product depends on workspace auth
that doesn't exist yet (§1, §5). Each row has a home product, an MCP
tool name, and a REST equivalent.

| Capability | Product | MCP tool | REST route | Seam | Status |
|---|---|---|---|---|---|
| ULPIN parcel lookup (indicative) | LandIntel | `ulpin-demo` | `GET /api/ulpin/:id` | `LandRecordsProvider` | launch |
| Massing/test-fit generation | DesignStudio | `testfit` | `POST /api/testfit` | `GeometryExporter` (SVG) | launch |
| Plan generation (client DXF export) | DesignStudio | `plan-gen` | `POST /api/plan-gen` | `GeometryExporter` (DXF) | launch |
| IS-code compliance check | Structura | `is-check` | `POST /api/is-check` | static rule tables | launch |
| BOQ estimate | BOQ Pro | `boq-estimate` | `POST /api/boq-estimate` | D1 rate tables | launch |
| Rate comparison (indicative) | ProMarket | `rate-compare` | `GET /api/rates/compare` | `RatesProvider` | launch |
| IRR/NPV modeling | InvestFlow | `irr-npv` | `POST /api/irr-npv` | stateless calc, no D1 | launch |
| CDE status read (mock/indicative) | CommunityBuild | `cde-status` | `GET /api/cde-status/:project_id` | indicative mock dataset | launch |
| Project status | BuildOS | *(none yet)* | *(none yet)* | needs workspace auth | post-launch |
| Procurement workflow status | ProcureHub | *(none yet)* | *(none yet)* | needs workspace auth | post-launch |
| Lead capture | site-wide | *(no MCP tool — write, gated)* | `POST /api/leads` | D1 `leads` table | launch |

v1 shipped `rate-compare` as REST-only, reasoning that it duplicated
`boq-estimate`'s seam. On reflection for the full 9-product catalog
that reasoning doesn't hold: ProMarket is its own product with its own
page and its own parity task (W2-271), so it gets a real MCP tool like
every other product-anchored capability — REST-only would make it the
one inconsistent entry in an otherwise uniform table.

BuildOS and ProcureHub get no tool at launch because their real
capability (live project state, procurement workflow status) requires
a logged-in workspace, and `LAUNCH_ARCHITECTURE.md` defers "auth +
workspace" to a post-launch rail. Shipping a stateless stub tool under
their name that can't do what the product actually does would be
worse than shipping nothing — it would misrepresent the capability to
any agent that reads the catalog. They get real tools once workspace
auth exists, not sooner.

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

### `plan-gen`
- Input: `{ testfit_id: string, options?: Record<string, unknown> }`
- Output: `{ dxf_url: string, expires_at: string }`
- Wraps a prior `testfit` result into an exportable DXF. Export stays
  client-side per `LAUNCH_ARCHITECTURE.md` ("R2 deferred, exports stay
  client-side") — the Worker returns a short-lived signed URL to a
  client-generated blob, not a server-rendered file.

### `is-check`
- Input: `{ structure_type: string, params: Record<string, number> }`
- Output: `{ code: string, checks: Array<{ rule, pass: boolean, note }> }`
- Static rule tables mirroring Structura's IS 456/875/800 checks. No
  D1 dependency — rules are code, not data, so this tool works even if
  D1 is unavailable.

### `boq-estimate`
- Input: `{ items: Array<{ category: string, quantity: number, unit: string }> }`
- Output: `{ line_items: Array<{ category, quantity, unit, rate, amount }>, total, indicative: true }`
- Rates come from D1, seeded from the same indicative rate set BOQ Pro's
  UI uses — no separate agent-only pricing source.

### `rate-compare`
- Input: `{ category: string, region?: string }`
- Output: `{ category, region, rates: Array<{ source, rate, unit }>, indicative: true }`
- Backs both ProMarket's own capability and the W2-271 parity
  calculator; same `RatesProvider` seam and D1 tables as `boq-estimate`.

### `irr-npv`
- Input: `{ cash_flows: number[], discount_rate: number }`
- Output: `{ irr: number | null, npv: number, indicative: true }`
- Stateless financial calculation, no D1 dependency. Backs the W2-270
  parity modeler and InvestFlow's own IRR/NPV capability with the same
  math — one implementation, two surfaces.

### `cde-status`
- Input: `{ project_id: string }`
- Output: `{ project_id, phase: string, open_items: number, last_updated: string, indicative: true }`
- Reads the same indicative mock dataset the W2-272 CDE dashboard mock
  uses. Explicitly `indicative: true` in every response — this is not
  live project data, and the tool contract says so on every call, not
  just in this doc.

## 4. MCP Apps plan

MCP Apps (interactive UI resources returned alongside a tool result,
rendered inline by a compatible client) are worth building only where
the output is genuinely visual and a plain JSON/text response would
lose information a human-in-the-loop agent session needs to act on.

**Get an MCP App at launch:**
- `testfit` — the SVG massing output *is* the deliverable; rendering it
  inline instead of returning a data URI string is the whole point.
- `is-check` — a pass/fail table with per-rule notes reads far better
  as a rendered table than as a wall of JSON when a human is reviewing
  agent output.
- `boq-estimate` — same reasoning: a line-item table with a total row
  is a UI artifact, not just data.

**REST/plain-JSON only at launch (no App):**
- `ulpin-demo`, `rate-compare`, `irr-npv`, `cde-status` — each returns
  a handful of scalar fields. An App wrapper adds surface area without
  adding clarity; a well-formatted JSON object is already legible.
- `plan-gen` — returns a URL, not renderable content; the App belongs
  (if anywhere) on the DXF viewer a human would open that URL in, which
  is out of scope for this Worker.

Building three Apps rather than six keeps the in-chat-UI surface
proportional to where it earns its cost, and leaves the option open to
add more post-launch once real usage shows which plain-JSON tools
users actually want rendered.

## 5. Auth, scope, and rate-card

- Read tools (`ulpin-demo`, `testfit`, `is-check`, `boq-estimate`,
  `rate-compare`, `irr-npv`, `cde-status`): unauthenticated, rate-limited
  per-IP at the Worker edge (exact numbers are a W2-274/275
  implementation detail, not a spec commitment here — keep them
  generous enough that a single agent session doing normal exploratory
  calls never trips them).
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
- **Rate-card at launch:** one tier — anonymous, IP-rate-limited, free,
  for every tool in §2. There is no usage-metered agent billing at
  launch because there is no metering infrastructure and no product
  reason to build one before real agent traffic exists to size it
  against.
- **Rate-card post-launch (deferred, not committed here):** once
  workspace auth exists, an API-key tier tracking the same Freemium /
  Pro (₹499) / Enterprise (₹9,999) plans already live on `/pricing`
  is the natural fit — reuse the existing pricing model rather than
  invent a separate agent price list. Concrete per-tier rate-limit
  numbers are an implementation decision for whenever that tier is
  actually built, not a number to fabricate here.
- No workspace/account auth at launch (`LAUNCH_ARCHITECTURE.md`: "auth
  + workspace" is a post-launch rail). Every launch tool above is
  stateless per-call; nothing here assumes a logged-in agent identity.

## 6. Payments evaluation: x402 vs AP2

Two agent-payment protocols are live in the ecosystem as of this
research: **x402** (HTTP 402 Payment Required, stablecoin/onchain
settlement) and **AP2** (Agent Payments Protocol, payment-network
agnostic — cards, bank rails, and crypto all fit under its mandate
model).

**Recommendation: AP2-style mandates, not x402, if/when Ferrum builds
agent payments at all.**

Reasoning:
- x402's settlement layer is stablecoin/crypto-native by design. RBI's
  posture on crypto payment rails in India has been consistently
  restrictive (banking-channel access for crypto exchanges has been
  contested territory since the 2018 circular and its 2020 Supreme
  Court reversal, and no crypto-payment rail has clear RBI sanction as
  of this writing). Building the primary payment path for an
  India-first platform on rails the domestic regulator has not
  endorsed is a launch risk, not a launch feature.
- AP2's mandate model (a cryptographically signed statement of what an
  agent is authorized to spend, on whose behalf, under what limits) is
  payment-rail agnostic — it can sit on top of UPI, card networks, or
  net banking, all of which already have clear RBI frameworks and are
  already how Ferrum's human users would pay. That makes it the
  interface that doesn't require the regulatory question to be solved
  before the product question can be.
- Neither protocol is needed at launch: every launch tool in §2 is
  free (§5's rate-card has one tier, and it's free). This section is
  future-facing — a recommendation for *when* agent payments become a
  real requirement, not a build item for this wave.

**India-regulatory flag, explicit:** any future agent-payment build on
Ferrum needs a compliance review before implementation, the same way
`docs/COMPLIANCE_GATE.md` gates the Transact product's stamp-duty and
pricing copy. This document does not substitute for that review; it
only says which protocol family is worth reviewing first.

## 7. A2A agent-card spec

An A2A-compatible agent discovers Ferrum's capabilities via a card at
`/.well-known/agent.json`. Shape, at launch:

```json
{
  "name": "Ferrum OS",
  "description": "India-first construction & investment platform — land feasibility, AI design, structural checks, BOQ estimation, rate comparison, IRR/NPV modeling, CDE status.",
  "url": "https://<production-domain>/",
  "capabilities": { "streaming": false, "pushNotifications": false },
  "skills": [
    { "id": "ulpin-demo", "name": "ULPIN parcel lookup", "description": "Indicative parcel lookup by ULPIN." },
    { "id": "testfit", "name": "Test-fit massing", "description": "Generate SVG massing for a plot." },
    { "id": "plan-gen", "name": "Plan + DXF export", "description": "Export a test-fit result as DXF." },
    { "id": "is-check", "name": "IS-code compliance check", "description": "Check structural params against IS 456/875/800." },
    { "id": "boq-estimate", "name": "BOQ estimate", "description": "Indicative bill-of-quantities estimate." },
    { "id": "rate-compare", "name": "Rate comparison", "description": "Indicative material/labor rate comparison." },
    { "id": "irr-npv", "name": "IRR/NPV modeling", "description": "Investment return modeling from cash flows." },
    { "id": "cde-status", "name": "CDE status read", "description": "Indicative common-data-environment project status." }
  ],
  "authentication": { "schemes": [] }
}
```

Notes:
- `skills` lists the same eight read tools from §2/§3 — the agent card
  is a third discovery surface for the same capability set, not a
  fourth set of capabilities. `leads` is intentionally absent for the
  same reason it has no MCP tool (§5).
- `authentication.schemes` is empty at launch (no auth, §5); it gains
  an entry once the post-launch API-key tier exists.
- `capabilities.streaming` and `pushNotifications` are both `false` —
  every tool here is a single request/response call, nothing long-running
  or async at launch.

## 8. llms.txt / AGENTS.md / OpenAPI alignment

Three documents use overlapping vocabulary and must not be confused
with each other:

- **`/llms.txt`** (public, site root): plain-language capability
  summary for AI crawlers/agents browsing the live site, linking to
  `/docs/api`, `/mcp`, and `/.well-known/agent.json`. Generated from
  §2 of this document — the product/capability list, not the internal
  build process.
- **`/docs/api`** (public, site root): the OpenAPI 3.x spec (W2-275)
  documenting the REST routes in §2 in machine-readable form, with a
  human-readable rendering.
- **`AGENTS.md`** (repo root, internal): governs how *development*
  agents (CRANE and the rest of the fleet) work in *this repository* —
  RULE 6 protected paths, stage-gates, land discipline. It has nothing
  to do with the public agent-facing surface this document specifies
  and is not read by anyone calling Ferrum's live API. The name
  collision between "AGENTS.md" (repo governance) and "agent
  interface" (public API surface) is coincidental; this section exists
  so nobody conflates the two when implementing W2-273/274/275.

All three (`llms.txt`, `/docs/api`, the A2A card) are generated from
this document's §2/§3 tool inventory as the single source of truth —
none of them hand-authors a separate capability list that could drift
from this one.

## 9. MCP security

- **Input validation:** every tool input in §3 is a typed, bounded
  shape (numbers, enums, short strings) validated at the Worker edge
  before it reaches any provider seam. No tool accepts free-form code,
  file paths, or shell-adjacent strings.
- **No code execution:** none of the eight read tools execute
  user-supplied code or templates. `is-check`'s rule tables are fixed
  code shipped with the Worker, not data an agent can extend or
  override — this also means `is-check` has no injection surface, since
  its "rules" aren't interpreted from input.
- **No PII in outputs:** every read tool output in §3 is either
  indicative/sample data (`ulpin-demo`, `boq-estimate`, `rate-compare`,
  `cde-status` — all explicitly flagged `indicative: true`) or a pure
  function of the caller's own input (`testfit`, `is-check`, `irr-npv`
  return only derived values, nothing stored or looked up per-caller).
- **Write surface stays minimal:** `leads` is the only write path in
  the entire interface, and it is deliberately excluded from MCP (§5) —
  the smallest possible write surface for an agent to reach.
- **Signed, scoped URLs:** `plan-gen`'s DXF URL is short-lived and
  scoped to a specific prior `testfit` call (§3, §5) — it is not a
  general-purpose file-serving endpoint.
- **Rate limiting is the primary abuse control** at launch (§5) since
  there is no auth to revoke; per-IP limits at the Worker edge are the
  first line of defense against scripted abuse of any single tool.
- **D1 access is scoped to the Worker's own binding** (`DB`) — no tool
  contract in §3 exposes raw query access, table names, or schema
  details beyond what each tool's typed output already returns.

## 10. What this document does not cover

- Concrete JSON-Schema files (generated during W2-274/275
  implementation, not hand-authored here).
- Exact rate-limit numbers, D1 schema for `leads`/rate tables
  (implementation detail, decided when W2-276's worker+D1 scaffold is
  built).
- Any capability beyond the eight read tools + lead capture — if
  BuildOS or ProcureHub gain a real tool once workspace auth exists,
  it gets its own entry here first, then an implementation task, in
  that order.
- A concrete payments implementation — §6 is a protocol-family
  recommendation for a future build, not a build item in this wave.
