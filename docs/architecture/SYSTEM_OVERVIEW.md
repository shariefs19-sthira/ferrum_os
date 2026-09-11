# Ferrum OS — System Overview

## What this is

Ferrum OS is an India-first construction & investment platform. Its own
public agent card (`app.get('/.well-known/agent.json')`,
`apps/web/worker.ts:1348-1366`) describes it in one line, reused here
verbatim because it's the product's own authored self-description, not
marketing copy invented for this document:

> "India-first construction & investment platform — land feasibility, AI
> design, structural checks, BOQ estimation, rate comparison, IRR/NPV
> modeling, CDE status."

The home page (`apps/web/app/page.tsx:12-23`) lists the ten products this
maps to: **LandIntel** (land feasibility & ULPIN lookup), **DesignStudio**
(AI architectural design), **Structura** (structural analysis & IS
compliance), **BOQ Pro** (automated BOQ & cost estimation), **ProMarket**
(verified professionals marketplace), **BuildOS** (project management &
digital PMC), **ProcureHub** (material procurement & suppliers),
**InvestFlow** (investment forecasting), **CommunityBuild** (fractional
development), and **Transact** (indicative stamp-duty & ask-band
estimation).

`apps/web/app/page.tsx:36-41`'s own "how it works" copy is explicit about
what's real today vs. roadmap, and is worth reproducing because it's the
most honest single summary of build status in the repo:

- **Look up your land** — indicative sample land details today; real
  zoning/risk data is roadmap.
- **Design it** — test-fit massing and DXF export today; AI-generated
  plans are roadmap.
- **Engineer it** — two textbook IS-code checks today (IS 456, IS 800);
  full FEA is roadmap.
- **Build & manage** — BOQ estimation today; procurement and project
  tracking are roadmap.

`docs/AGENT_INTERFACE.md` (§0) frames the product as "agent-native": every
capability a human reaches through the site is also reachable by an agent
through a typed interface (REST, MCP, A2A) backed by the same data — see
`docs/api/ENDPOINT_REFERENCE.md` for the concrete route inventory.

## Component breakdown

### 1. Cloudflare Worker edge layer (`apps/web/worker.ts`, 1,371 lines)

A single Hono app (`hono@4.13.5`, `apps/web/worker.ts:11,88`) that owns
four route families, per its own header comment
(`apps/web/worker.ts:1-3`) and `docs/AGENT_INTERFACE.md` §1:

- `/api/*` — REST routes (health, ULPIN, testfit, is-check, boq-estimate,
  rates, irr-npv, cde-status, leads, stamp-duty/ask-band/ferrum-rate,
  transact cases, payments, subscriptions, auth, projects/workspace,
  analysis — full inventory in `docs/api/ENDPOINT_REFERENCE.md`)
- `/mcp` — a stateless MCP server, built fresh per request
  (`apps/web/worker.ts:1324-1329`, `buildMcpServer`/`createMcpTransport`
  from `./lib/mcp/server`) — "stateless (no sessionIdGenerator) ... A
  fresh McpServer + transport per request keeps this correct under
  Workers' per-request isolate model" (comment at line 1319-1323)
- `/docs/api` — the OpenAPI spec (`apps/web/lib/openapi/spec.ts`),
  content-negotiated: `Accept: application/json` or `?format=json` gets
  JSON, a browser GET gets an HTML rendering (`apps/web/worker.ts:1336-1341`)
- `/.well-known/agent.json` — the A2A agent card (`apps/web/worker.ts:1348-1366`)

Everything else falls through to the static asset bundle:
`app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw))` (`apps/web/worker.ts:1369`).

The Worker imports provider seams under `apps/web/lib/`: land records
(`./lib/providers/LiveLandRecordsProvider`), market rates
(`./lib/providers/LiveMarketRatesProvider`), geometry export
(`./lib/providers/GeometryExporter`), stamp duty
(`./lib/providers/StampDutyProvider`), govt reference rates
(`./lib/providers/GovtReferenceRatesProvider`), the Ferrum rate engine
(`./lib/rateEngine/ferrumRateEngine`), IS-code checks
(`./lib/checks/isCode`), IRR/NPV (`./lib/finance/irrNpv`), Transact case
flow (`./lib/transact/caseFlow`, `./lib/transact/notifications`),
payments (`./lib/payments/PaymentProvider`, `RazorpayProvider`,
`StubPaymentProvider`), auth (`./lib/auth/password`, `./lib/auth/session`,
`./lib/auth/email`, `./lib/auth/rateLimit`, `./lib/auth/ipRateLimit`),
the analysis engine (`./lib/analysis/feasibilityScore`, `costEngine`,
`sensitivity`, `investmentCase`, `riskFlags`, `cityComparison`,
`sampleData`, `types`), and parcel intel (`./lib/parcelIntel/parcelIntel`)
— all imports listed at `apps/web/worker.ts:12-42`.

The `Env` type (`apps/web/worker.ts:57-86`) declares the Worker's real
bindings and secrets, each with an explicit fallback behavior when unset:

| Binding | Purpose | Behavior when unset |
|---|---|---|
| `DB` | D1 database (required) | — |
| `ASSETS` | static asset fetcher (required) | — |
| `OGD_API_KEY?` | live-feed adapter key (W2-316) | providers fall through to D1 seed data |
| `RAZORPAY_KEY_ID?` / `RAZORPAY_KEY_SECRET?` / `RAZORPAY_WEBHOOK_SECRET?` | Razorpay | `getPaymentProvider` falls back to `StubPaymentProvider` (line 50-55) |
| `RESEND_API_KEY?` | Resend email | verify/reset emails return the raw token in the API response instead of sending mail |
| `ADMIN_TOKEN?` | `/api/admin/leads` gate | route returns `503 admin_view_not_configured` |
| `TRANSACT_DOCS?` | R2 bucket for document uploads | upload route returns `503 document_upload_not_configured` |

### 2. Next.js frontend (`apps/web/app/**`)

Next.js `^14.1.0` with React `18.2.0` (`apps/web/package.json:18,20-21`),
statically exported. `wrangler.jsonc`'s `assets.directory` points at
`./apps/web/out` (`wrangler.jsonc:6`) — the build output Next's static
export produces, served by the Worker's `ASSETS` binding for every route
that isn't `/api/*`, `/mcp`, `/docs/api`, or `/.well-known/agent.json`.

### 3. D1 database

`wrangler.jsonc:9-15` declares one D1 binding:

```jsonc
"d1_databases": [{
  "binding": "DB",
  "database_name": "ferrum-os-data",
  "database_id": "049b0f34-adb3-4f7f-85ec-60170019f3a0"
}]
```

`docs/LAUNCH_ARCHITECTURE.md:3-4` and `docs/AGENT_INTERFACE.md:36-38`
both cite this same binding/ID for "rates/parcels/leads/plans" storage.
R2 (`TRANSACT_DOCS`) is a second, currently-unprovisioned storage
binding used only by the Transact document-upload route.

### 4. PowerShell/Python fleet automation layer

Two generations of dispatcher exist side by side — see
`docs/architecture/COMPONENT_SPECIFICATIONS.md` for the full mechanics
of each:

- **`scripts/FLEET_WATCH.ps1`** (1,562 lines) — the older, seat-agnostic
  harness (heartbeat scan, Codex/Claude revival, board dispatch, the
  W-98 trigger daemon, local auto-deploy). Per
  `docs/fleet/AUTOMATION_RUNBOOK.md`, this is legacy and gated shut by
  `docs/FLEET_WATCH_STOP` while the replacement below is validated
  under an operator-run canary — see
  `docs/architecture/COMPONENT_SPECIFICATIONS.md` for the exact
  held-vs-running nuance (the process itself can still be running; the
  stop file makes its dispatch a no-op per cycle).
- **`scripts/fleet/**`** (Python: `runner.py`, `queue.py`, `adapters.py`,
  `evidence.py`, driven by `Invoke-FleetRunner.ps1`) — the newer,
  guarded "compiled-board/plan/execute" replacement, still under
  operator-supervised canary per `docs/fleet/AUTOMATION_RUNBOOK.md`.
- **`scripts/land.ps1`** — the squash-landing script both systems defer
  to for merging a feature branch onto `main`.

## Technology versions (verified from `package.json`/`wrangler.jsonc`)

`apps/web/package.json` dependencies:

| Package | Version |
|---|---|
| `hono` | `4.13.5` |
| `leaflet` | `1.9.4` |
| `next` | `^14.1.0` |
| `pdf-lib` | `^1.17.1` |
| `react` / `react-dom` | `18.2.0` |
| `tesseract.js` | `7.0.0` |
| `three` | `^0.185.1` |
| `web-ifc` | `^0.0.77` |
| `zod` | `4.5.4` |

`apps/web/package.json` devDependencies (selected): `@cloudflare/workers-types 5.20260901.1`,
`@modelcontextprotocol/sdk 1.30.0`, `typescript ^5.3.3`, `vitest ^1.6.1`,
`tailwindcss ^3.4.19`, `eslint ^8.57.0`, `eslint-config-next ^14.2.35`,
`openapi-types 12.1.3`, `playwright ^1.42.1`, `turbo ^1.13.4`.

Root `package.json` devDependencies: `wrangler 4.130.0` (pinned — see
`docs/deployment/DEPLOYMENT_GUIDE.md` for why it's a pinned root
devDependency rather than resolved via `npx`).

`wrangler.jsonc`: `compatibility_date: "2026-08-01"`, `main:
"apps/web/worker.ts"`, worker name `"ferrumos-preview"`.

## Deployment topology

```
                 ┌─────────────────────────────────────┐
                 │         Cloudflare Worker            │
                 │        "ferrumos-preview"             │
                 │      (apps/web/worker.ts, Hono)       │
                 │                                       │
  request ──────▶│  /api/*            REST routes        │
                 │  /mcp              MCP server         │
                 │  /docs/api         OpenAPI spec        │
                 │  /.well-known/     A2A agent card      │
                 │    agent.json                          │
                 │  *  (fallthrough) ─┐                  │
                 └────────────────────┼───────────────────┘
                                      │            │
                      ASSETS binding  │            │ DB binding
                                      ▼            ▼
                    ┌──────────────────────┐  ┌───────────────────┐
                    │  Static export        │  │  D1 database       │
                    │  apps/web/out          │  │  ferrum-os-data     │
                    │  (Next.js 14, React 18)│  │  (id 049b0f34-…)    │
                    └──────────────────────┘  └───────────────────┘
```

Every non-API route falls through to the `ASSETS` binding
(`apps/web/worker.ts:1369`), which serves the static Next.js export from
`./apps/web/out` (`wrangler.jsonc:5-8`). Every route that touches
persistent data goes through the `DB` binding to D1 `ferrum-os-data`.
Optional bindings (`RAZORPAY_*`, `RESEND_API_KEY`, `ADMIN_TOKEN`,
`TRANSACT_DOCS`) gate specific routes, each falling back to a labeled
stub/`503` rather than a silent failure when unset (see the `Env` table
above).

See `docs/deployment/DEPLOYMENT_GUIDE.md` for the actual build/deploy
commands and the AUTHORED → LANDED → DEPLOYED → RENDERED-EDGE-VERIFIED
distinction this repo's own docs use.

## What this document does not cover

- Exact route contracts (request/response shapes, auth, rate limits) —
  see `docs/api/ENDPOINT_REFERENCE.md`.
- Fleet dispatcher internals — see
  `docs/architecture/COMPONENT_SPECIFICATIONS.md`.
- Build/deploy/rollback mechanics — see
  `docs/deployment/DEPLOYMENT_GUIDE.md`.
- Branching/landing conventions and recurring pitfalls — see
  `docs/development/CONTRIBUTION_GUIDE.md`.
