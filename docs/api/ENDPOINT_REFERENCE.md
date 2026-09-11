# Ferrum OS — Endpoint Reference

Every route below was read directly from `apps/web/worker.ts` (all 1,371
lines, this worktree). Auth = "session cookie" means the route calls
`requireUser(c.env, c.req.header('Cookie'))` (defined at
`apps/web/worker.ts:44-48`, backed by `lib/auth/session.ts`), returning
`401 {"error":"unauthorized"}` if there's no valid session. Rate limits
are cited with the exact key/limit/window arguments passed to
`checkIpRateLimit(db, request, key, limit, windowSeconds)` or
`checkRateLimit(db, key, limit, windowSeconds)` as literally coded.

A formal OpenAPI 3.0.3 document already exists at
`apps/web/lib/openapi/spec.ts`, served at `GET /docs/api` (JSON via
`Accept: application/json` or `?format=json`; HTML otherwise) — it
documents a subset of these routes (the eight read tools + leads named
in `docs/AGENT_INTERFACE.md` §2) with full JSON-Schema request/response
shapes. This document is not a replacement for that spec; it's a
complete route inventory (including the routes the OpenAPI spec doesn't
cover — payments, transact, auth, workspace, projects, analysis, admin)
cross-checked against it, not duplicating its per-field schemas.

## Health

### `GET /api/health`
No auth, no rate limit. `apps/web/worker.ts:90`.
Response: `{"status":"ok"}`

```bash
curl https://ferrumos-preview.shariefsatyala.workers.dev/api/health
```

## ULPIN / land lookup

### `GET /api/ulpin/:id`
No auth, no rate limit. `apps/web/worker.ts:92-101`.
Looks up via `LiveLandRecordsProvider`; adds `plot_intel` via
`computePlotIntel` (S1 PARCEL_INTEL, W2-381).
- `404 {"error":"not_found"}` if the provider returns nothing.
- `200`: `{...parcel, indicative: true, plot_intel}`

```bash
curl https://ferrumos-preview.shariefsatyala.workers.dev/api/ulpin/KA0101010101001
```

### `GET /api/rates/compare`
No auth, no rate limit. `apps/web/worker.ts:167-174`.
Query params: `category` (required), `region` (optional).
- `400 {"error":"invalid_input"}` if `category` missing.
- `200`: `{category, region, rates, indicative: true}`

### `GET /api/stamp-duty/:state`
No auth, no rate limit. `apps/web/worker.ts:232-237`.
- `404 {"error":"not_found"}` if the state isn't in `D1StampDutyProvider`.
- `200`: `{...row, indicative: true}`

### `GET /api/govt-reference-rate`
No auth, no rate limit. `apps/web/worker.ts:249-257`.
Query params: `category`, `region` (both required).
- `400 {"error":"invalid_input"}` if either missing.
- `404 {"error":"not_found"}` if no matching row.

## Test-fit / BOQ / rates (write tools)

### `POST /api/testfit`
No auth. Rate limit: `checkIpRateLimit(..., 'testfit', 60, 60)` — 60
requests / 60s per IP (`apps/web/worker.ts:104`).
Body: `{plot_width_m: number, plot_depth_m: number, floors: number,
setback_m?: number}` (validated: all three required fields must be
`typeof === 'number'`).
- `429 {"error":"rate_limited"}`
- `400 {"error":"invalid_input"}`
- `200`: `SvgGeometryExporter.testfit(body)` output

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/testfit \
  -H 'Content-Type: application/json' \
  -d '{"plot_width_m": 12, "plot_depth_m": 18, "floors": 3}'
```

### `POST /api/plan-gen`
No auth, no rate limit. `apps/web/worker.ts:118`.
Always returns `501 {"error":"not_implemented","tool":"plan-gen"}` —
not built; the DXF-export seam described in `docs/AGENT_INTERFACE.md`
§3 (`plan-gen`) never landed.

### `POST /api/is-check`
No auth. Rate limit: `checkIpRateLimit(..., 'is-check', 60, 60)`
(`apps/web/worker.ts:121`).
Body: `{structure_type: string, params: object}`.
- `429`/`400` as above.
- `200`: `runIsCheck(structure_type, params)` output.

### `POST /api/boq-estimate`
No auth. Rate limit: `checkIpRateLimit(..., 'boq-estimate', 60, 60)`
(`apps/web/worker.ts:130`).
Body: `{items: Array<{category, quantity, unit, user_rate?}>, region?:
string, mode?: 'ferrum', role?: 'buyer'|'seller'}` (`region` defaults to
`'Bengaluru'`; `role` defaults to `'contractor'`).
- `400 {"error":"invalid_input"}` if `items` isn't an array.
- `200`: `{line_items, total, indicative: true}`

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/boq-estimate \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"category":"cement","quantity":100,"unit":"bag"}],"region":"Bengaluru"}'
```

### `POST /api/ferrum-rate`
No auth. Rate limit: `checkIpRateLimit(..., 'ferrum-rate', 60, 60)`
(`apps/web/worker.ts:261`).
Body: `{category: string, region: string, role?: 'buyer'|'seller',
user_rate?: number, weights?: object, project_start_month?, quarterly_escalation_factor?: number}`.
- `400`/`429` as above.
- `200`: `computeFerrumRate(...)` output.

## IRR / NPV

### `POST /api/irr-npv`
No auth. Rate limit: `checkIpRateLimit(..., 'irr-npv', 60, 60)`
(`apps/web/worker.ts:177`).
Body: `{cash_flows: number[], discount_rate: number}`.
- `400 {"error":"invalid_input"}` if `cash_flows` isn't an array or
  `discount_rate` isn't a number.
- `200`: `{irr: number|null, npv, indicative: true}`

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/irr-npv \
  -H 'Content-Type: application/json' \
  -d '{"cash_flows":[-100000,30000,30000,30000,30000],"discount_rate":0.1}'
```

## CDE status

### `GET /api/cde-status/:project_id`
No auth, no rate limit. `apps/web/worker.ts:191-201`.
Ignores `project_id` — always returns the same fixed indicative payload
(documented in-code as a known limitation, W2-340): `{project_id, phase:
"Design Development", open_items: 4, last_updated, indicative: true,
note: "ignores input, mock data — this fixed payload is returned for
any project_id; no real per-project record exists yet"}`

## Leads

### `POST /api/leads`
No auth. Rate limit: `checkIpRateLimit(..., 'leads', 20, 60)`
(`apps/web/worker.ts:208`).
Body: `{email: string, name: string, phone?, product?, source_page?,
state?, message?}` (`email`/`name` required strings).
- `429`, `400 {"error":"invalid_lead"}`.
- `200`: `{status: "captured"}`

## Transact (gated by `docs/COMPLIANCE_GATE.md`)

### `POST /api/transact/cases`
No auth. Rate limit: `checkIpRateLimit(..., 'transact-cases-create', 20, 60)`
(`apps/web/worker.ts:286`).
Body: `{role: 'buyer'|'seller', contact_name: string, contact_email:
string, contact_phone?, property_ref?, state?}`.
- `429`/`400`.
- `200`: `{id, role, current_step, status: "in_progress", indicative: true}`

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/transact/cases \
  -H 'Content-Type: application/json' \
  -d '{"role":"buyer","contact_name":"Test User","contact_email":"test@example.com"}'
```

### `GET /api/transact/cases/:id`
No auth. `404 {"error":"not_found"}` if unknown. `200`:
`{...caseRow, events, indicative: true}`.

### `POST /api/transact/cases/:id/advance`
No auth, no explicit rate limit. Body: `{to_step: string, note?:
string}`. `404 not_found`; `409 {"error":"case_closed"}` if the case is
already closed; `400 {"error":"invalid_transition", current_step}` if
`to_step` fails `isValidTransition`.

### `POST /api/transact/cases/:id/kyc`
Self-declared only (never claims real identity verification, per the
in-code comment at `apps/web/worker.ts:367-369`). Body: `{full_name,
document_type, document_ref_last4}` (`document_ref_last4` must be
exactly 4 chars). `404`/`400`; `200`: `{id, status: "self_declared",
indicative: true}`.

### `POST /api/transact/cases/:id/documents`
Requires `TRANSACT_DOCS` R2 binding — `503
{"error":"document_upload_not_configured"}` if unset. Multipart
`formData` with a `file` field. `404`/`400`; `200`: `{id, filename,
size_bytes}`.

### `GET /api/transact/cases/:id/documents`
No auth. `404`; `200`: `{documents: [...]}`.

### `POST /api/transact/cases/:id/schedule`
No auth. Body: `{requested_date: string, requested_window?}`. `404`/`400`;
`200`: `{id, status: "requested", notification_sent, dev_notification_preview}`.

### `GET /api/transact/cases/:id/schedule`
No auth. `404`; `200`: `{slots: [...]}`.

### `POST /api/ask-band`
No auth. Rate limit: `checkIpRateLimit(..., 'ask-band', 60, 60)`
(`apps/web/worker.ts:240`). Body: `{base_value: number, urgency: number}`.

## Payments (gated by `docs/COMPLIANCE_GATE.md`)

Test-mode by default via `StubPaymentProvider` — used whenever
`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are unset
(`getPaymentProvider`, `apps/web/worker.ts:50-55`). Every response
carries `simulated`/`mode`.

### `POST /api/payments/order`
No auth. Rate limit: `checkIpRateLimit(..., 'payments-order', 20, 60)`
(`apps/web/worker.ts:453`). Body: `{amount_paise: number (>0), case_id?}`.
- `429`/`400`.
- `200`: `{id, provider_order_id, key_id (null if simulated), amount_paise, currency: "INR", mode, simulated, indicative: true}`

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/payments/order \
  -H 'Content-Type: application/json' \
  -d '{"amount_paise": 500000}'
```

### `POST /api/payments/verify`
No auth. Body: `{order_id, razorpay_payment_id, razorpay_signature}`
(all strings). `400`; `404 {"error":"not_found"}` if `order_id` unknown.
`200`: `{order_id, status: "paid"|"failed", indicative: true}`.

### `POST /api/payments/webhook`
No auth (verifies `X-Razorpay-Signature` header itself instead). Raw
text body. `400 {"error":"invalid_signature"}` if verification fails;
`200 {"received": true}` otherwise.

### `POST /api/subscriptions`
**Auth: session cookie required.** Rate limit:
`checkRateLimit(..., \`subscriptions-create:${user.id}\`, 20, 60)`
(`apps/web/worker.ts:535`). Body: `{plan_id: string}`.
- `401 {"error":"unauthorized"}`; `429`; `400 {"error":"invalid_input"}`;
  `400 {"error":"unknown_plan"}` if `plan_id` not found.

### `GET /api/subscriptions/me`
**Auth: session cookie required.**

### `POST /api/subscriptions/:id/cancel`
**Auth: session cookie required.** `404` if the subscription isn't
owned by the caller.

## Auth

Session cookies are HttpOnly/Secure (`lib/auth/session.ts`); rate
limits are D1-backed sliding windows (`lib/auth/rateLimit.ts`) since
"Workers isolates carry no in-memory state between requests"
(`apps/web/worker.ts:598-599`).

### `POST /api/auth/signup`
No auth (this creates the account). Rate limit:
`checkRateLimit(..., \`signup:${email}\`, 5, 60)`
(`apps/web/worker.ts:608`). Body: `{email: string (regex-validated),
password: string (>=8 chars), name?}`.
- `400 {"error":"invalid_input"}`; `429`; `409 {"error":"email_taken"}`.
- `200`: `{id, email, email_verified: false, dev_verify_token}` — the
  verification token is returned directly in the response body when
  `RESEND_API_KEY` is unset (dev-mode fallback).

```bash
curl -X POST https://ferrumos-preview.shariefsatyala.workers.dev/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"correcthorsebattery"}'
```

### `POST /api/auth/login`
Rate limit: `checkRateLimit(..., \`login:${email}\`, 10, 15)`
(`apps/web/worker.ts:636`). Body: `{email, password}`.
`401 {"error":"invalid_credentials"}` on failure.

### `POST /api/auth/logout`
No rate limit. Clears the session cookie regardless of whether one was
present. `200 {"ok": true}`.

### `GET /api/auth/session`
No auth required to call (it *reports* auth state). `200: {user: {...}
| null}`.

### `POST /api/auth/verify`
Body: `{token: string}`. `400 {"error":"invalid_or_expired_token"}` if
the token hash doesn't match an unused, unexpired `verify_email` row.

### `POST /api/auth/forgot-password`
Rate limit: `checkRateLimit(..., \`forgot:${email}\`, 5, 60)`
(`apps/web/worker.ts:688`). Always returns `200 {"ok": true}` even for
an unknown email — "an account-enumeration guard, not an inconsistency"
(`apps/web/worker.ts:690-691`). Includes `dev_reset_token` when
`RESEND_API_KEY` is unset.

### `POST /api/auth/reset-password`
Body: `{token, new_password (>=8 chars)}`. `400
{"error":"invalid_or_expired_token"}` on an invalid/expired/used token.

## Projects / workspace

All routes below **require a session cookie** (`requireUser`) except
`GET /api/workspace/shared/:token`, which is explicitly public.

### `GET /api/projects` / `POST /api/projects`
`POST` body: `{name: string, city: string, ulpin?: string}`. `201` on
create. Ownership scoped to `user_id`.

### `GET /api/projects/:id`
`404` for unknown or cross-user IDs (deliberately shared 404, per the
comment at `apps/web/worker.ts:728-729`: "unknown and cross-user
project/artifact IDs deliberately share a 404"). Returns the project
plus its attached artifacts.

### `POST /api/projects/:id/attach`
Body: `{artifact_id: string}`. `404` if project or artifact not owned
by caller.

### `GET /api/activity`
Returns the caller's `project_activity` rows, most recent 100.

### `GET /api/projects/:id/analysis`
Runs the Ferrum Analysis Engine (feasibility score, cost breakdown,
sensitivity, investment case, risk flags, city comparison) against the
project's attached artifacts. Caches a snapshot into `project_activity`
(type `analysis.snapshot`) only if the last one is more than 5 minutes
old — "viewing the same project repeatedly doesn't spam the activity
feed" (`apps/web/worker.ts:914-917`).

### Saved artifacts: `POST/GET /api/workspace/artifacts`,
`GET/PATCH/DELETE /api/workspace/artifacts/:id`,
`GET /api/workspace/artifacts/:id/export`,
`POST /api/workspace/artifacts/:id/share`

`POST /api/workspace/artifacts` rate limit: `checkRateLimit(...,
\`workspace-create:${user.id}\`, 60, 60)`. Body: `{type: string, title:
string, data: any, provenance_source?: string, provenance_freshness?: string}`.
`PATCH` requires at least one of `title`/`data`. `share` mints a
`share_token`, reused if one already exists for that artifact.

### `GET /api/workspace/shared/:token`
**Public — no auth.** "A share token grants read access to exactly one
artifact, nothing else about the owning user or their workspace"
(`apps/web/worker.ts:1057-1058`). `404` for an unknown token.

### `POST /api/workspace/intent`
Body: `{phrase: string, projectId?: string}`. Maps a natural-language
phrase to `{action, method, path}` via a fixed set of regexes (e.g.
`^(start a new project|create a workspace)` → `create_project`).
`400 {"error":"invalid_input"}` if `phrase` is empty; `400
{"error":"unrecognized_intent"}` if no pattern matches.

### `POST/GET /api/workspace/projects`, `GET/PATCH/DELETE
/api/workspace/projects/:id`, `POST/GET /api/workspace/projects/:id/artifacts`

The W-08 "Intent API" richer object model (`docs/WORKSPACE_SPEC.md` §4)
— a separate table set (`migrations/0014_workspace_shell.sql`) from the
older `/api/workspace/artifacts` surface above; per the in-code comment
(`apps/web/worker.ts:1071-1077`) this is "new, richer object model §1
defines, not a replacement for what's already shipped." `POST
/api/workspace/projects` rate limit: `checkRateLimit(...,
\`workspace-project-create:${user.id}\`, 60, 60)`. `POST
/api/workspace/projects/:id/artifacts` rate limit: `checkRateLimit(...,
\`workspace-artifact-create:${user.id}\`, 60, 60)`; body requires
`type` (one of `PARCEL|MASSING|PLAN|STRUCTURAL|BOQ|INVEST|MARKET|PROCURE`),
`inputs`, `outputs`, a `provenance` object (`source`, `freshness`
strings, `status` one of `INDICATIVE|VERIFIED`), `sourceTool`,
`sourceRow`.

## Admin

### `GET /api/admin/leads`
Shared-secret gate, not a real role system — "a shared-secret gate, not
a real admin-role system" (`apps/web/worker.ts:1307-1310`).
- `503 {"error":"admin_view_not_configured"}` if `ADMIN_TOKEN` is
  unset — "this route is genuinely not configured yet, not a locked
  door someone might mistake for a working one" (same comment).
- `401 {"error":"unauthorized"}` if the `?token=` query param doesn't
  match `ADMIN_TOKEN`.
- `200`: `{leads: [...]}` (most recent 200).

## Agent-facing surfaces

### `ALL /mcp`
No auth. Stateless MCP server (`buildMcpServer`/`createMcpTransport`
from `./lib/mcp/server`), fresh per request. See
`docs/AGENT_INTERFACE.md` §3 for the tool contracts this exposes
(`ulpin-demo`, `testfit`, `plan-gen`, `is-check`, `boq-estimate`,
`rate-compare`, `irr-npv`, `cde-status`).

### `GET /docs/api`
No auth. OpenAPI spec (`apps/web/lib/openapi/spec.ts`) — JSON via
`Accept: application/json` or `?format=json`; else an HTML rendering
(`renderOpenApiHtml`, no external Swagger UI CDN load).

### `GET /.well-known/agent.json`
No auth. A2A agent card — static shape defined at
`apps/web/worker.ts:1348-1366`, `authentication.schemes: []`.

### `GET *`
Fallthrough to the static asset bundle (`c.env.ASSETS.fetch(c.req.raw)`),
for every path not matched above.

## Error-code vocabulary (as literally coded)

| Code | Meaning |
|---|---|
| `400 invalid_input` / `invalid_lead` | body failed the route's own `typeof`/shape checks |
| `401 unauthorized` | no valid session cookie, or wrong `ADMIN_TOKEN` |
| `401 invalid_credentials` | login failure |
| `404 not_found` | resource missing or not owned by caller |
| `409 email_taken` | signup with an existing email |
| `409 case_closed` | advancing a closed Transact case |
| `429 rate_limited` | `checkIpRateLimit`/`checkRateLimit` tripped |
| `501 not_implemented` | `plan-gen` only |
| `503 admin_view_not_configured` | `ADMIN_TOKEN` unset |
| `503 document_upload_not_configured` | `TRANSACT_DOCS` R2 binding unset |
