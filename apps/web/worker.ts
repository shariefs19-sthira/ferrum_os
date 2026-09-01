// Ferrum OS Worker — thin edge layer per docs/AGENT_INTERFACE.md and
// docs/LAUNCH_ARCHITECTURE.md. Serves the static site (ASSETS binding)
// plus /api/*, /mcp, /docs/api, /.well-known/agent.json.
//
// W2-276 scaffolded the route shape. W2-277 wires ulpin-demo, testfit,
// boq-estimate, and rate-compare to real provider seams (still on
// INDICATIVE sample data). is-check, plan-gen, irr-npv, cde-status,
// and leads stay stubbed — they're either out of W2-277's three named
// seams or land with the MCP server task (W2-274).

import { Hono } from 'hono'
import { LiveLandRecordsProvider } from './lib/providers/LiveLandRecordsProvider'
import { LiveMarketRatesProvider } from './lib/providers/LiveMarketRatesProvider'
import { SvgGeometryExporter } from './lib/providers/GeometryExporter'
import { buildMcpServer, createMcpTransport } from './lib/mcp/server'
import { openApiSpec } from './lib/openapi/spec'
import { renderOpenApiHtml } from './lib/openapi/render'
import { runIsCheck } from './lib/checks/isCode'
import { estimateIrr } from './lib/finance/irrNpv'
import { D1StampDutyProvider } from './lib/providers/StampDutyProvider'
import { computeAskBand } from './lib/transact/askBand'
import { D1GovtReferenceRatesProvider } from './lib/providers/GovtReferenceRatesProvider'
import { computeFerrumRate, type Role } from './lib/rateEngine/ferrumRateEngine'
import { initialStep, isValidTransition, isTerminalStep, type CaseRole } from './lib/transact/caseFlow'
import type { PaymentProvider } from './lib/payments/PaymentProvider'
import { RazorpayProvider } from './lib/payments/RazorpayProvider'
import { StubPaymentProvider } from './lib/payments/StubPaymentProvider'

function getPaymentProvider(env: Env): PaymentProvider {
  if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    return new RazorpayProvider(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET, env.RAZORPAY_WEBHOOK_SECRET)
  }
  return new StubPaymentProvider()
}

export type Env = {
  DB: D1Database
  ASSETS: Fetcher
  // Live-feed adapter key (W2-316) — no operator has provisioned this
  // yet, so LiveLandRecordsProvider/LiveMarketRatesProvider always
  // fall through to D1 seed data until it's set.
  OGD_API_KEY?: string
  // Razorpay test/live keys (W2-324) — unset until an operator provisions
  // them, so getPaymentProvider() falls back to StubPaymentProvider (a
  // fully labeled simulated flow) rather than blocking the pipeline.
  RAZORPAY_KEY_ID?: string
  RAZORPAY_KEY_SECRET?: string
  RAZORPAY_WEBHOOK_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/ulpin/:id', async (c) => {
  const provider = new LiveLandRecordsProvider(c.env.DB, c.env.OGD_API_KEY)
  const parcel = await provider.lookup(c.req.param('id'))
  if (!parcel) return c.json({ error: 'not_found' }, 404)
  return c.json({ ...parcel, indicative: true })
})

app.post('/api/testfit', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (
    !body ||
    typeof body.plot_width_m !== 'number' ||
    typeof body.plot_depth_m !== 'number' ||
    typeof body.floors !== 'number'
  ) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const exporter = new SvgGeometryExporter()
  return c.json(exporter.testfit(body))
})

app.post('/api/plan-gen', (c) => c.json({ error: 'not_implemented', tool: 'plan-gen' }, 501))

app.post('/api/is-check', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.structure_type !== 'string' || typeof body.params !== 'object') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  return c.json(runIsCheck(body.structure_type, body.params))
})

app.post('/api/boq-estimate', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.items)) return c.json({ error: 'invalid_input' }, 400)
  const region = typeof body.region === 'string' ? body.region : 'Bengaluru'
  const useFerrum = body.mode === 'ferrum'
  const role: Role = body.role === 'buyer' || body.role === 'seller' ? body.role : 'contractor'
  const ratesProvider = new LiveMarketRatesProvider(c.env.DB, c.env.OGD_API_KEY)
  const govtProvider = new D1GovtReferenceRatesProvider(c.env.DB)
  const lineItems = []
  let total = 0
  for (const item of body.items) {
    if (useFerrum) {
      const govtRow = await govtProvider.getRate(item.category, region)
      const marketRow = await ratesProvider.getRate(item.category, region)
      const userRate = typeof item.user_rate === 'number' ? item.user_rate : (marketRow?.rate ?? 0)
      const ferrum = computeFerrumRate(govtRow?.rate ?? 0, marketRow?.rate ?? 0, userRate, role, body.weights)
      const amount = ferrum.role_output.value * (item.quantity ?? 0)
      total += amount
      lineItems.push({
        category: item.category,
        quantity: item.quantity,
        unit: marketRow?.unit ?? govtRow?.unit ?? item.unit,
        rate: ferrum.role_output.value,
        amount,
        ferrum_rate_detail: ferrum,
      })
    } else {
      const rateRow = await ratesProvider.getRate(item.category, region)
      const rate = rateRow?.rate ?? 0
      const amount = rate * (item.quantity ?? 0)
      total += amount
      lineItems.push({ category: item.category, quantity: item.quantity, unit: rateRow?.unit ?? item.unit, rate, amount })
    }
  }
  return c.json({ line_items: lineItems, total, indicative: true })
})

app.get('/api/rates/compare', async (c) => {
  const category = c.req.query('category')
  const region = c.req.query('region')
  if (!category) return c.json({ error: 'invalid_input' }, 400)
  const provider = new LiveMarketRatesProvider(c.env.DB, c.env.OGD_API_KEY)
  const rates = await provider.compare(category, region)
  return c.json({ category, region: region ?? null, rates, indicative: true })
})

app.post('/api/irr-npv', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.cash_flows) || typeof body.discount_rate !== 'number') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const npv = body.cash_flows.reduce((sum: number, cf: number, i: number) => sum + cf / Math.pow(1 + body.discount_rate, i), 0)
  const irr = estimateIrr(body.cash_flows)
  return c.json({ irr, npv: Math.round(npv * 100) / 100, indicative: true })
})

app.get('/api/cde-status/:project_id', (c) => {
  const project_id = c.req.param('project_id')
  return c.json({
    project_id,
    phase: 'Design Development',
    open_items: 4,
    last_updated: new Date().toISOString(),
    indicative: true,
  })
})

// Lead capture — the one write path (AGENT_INTERFACE.md §5). Real D1
// insert; `state` (added by migrations/0003_transact.sql) is optional
// so this same route serves both ordinary product leads and the
// Transact demand-token waitlist (W2-286) without a parallel table.
app.post('/api/leads', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
    return c.json({ error: 'invalid_lead' }, 400)
  }
  await c.env.DB.prepare(
    'INSERT INTO leads (name, email, phone, product, source_page, state) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(
      body.name,
      body.email,
      typeof body.phone === 'string' ? body.phone : null,
      typeof body.product === 'string' ? body.product : 'unspecified',
      typeof body.source_page === 'string' ? body.source_page : 'unspecified',
      typeof body.state === 'string' ? body.state : null,
    )
    .run()
  return c.json({ status: 'captured' })
})

// Transact Stage-1 tools (W2-283..286), gated by docs/COMPLIANCE_GATE.md.
// Every response is INDICATIVE — no current-government-rate claim, no
// guarantee language, no commission/pricing claim (compliance gate §2).
app.get('/api/stamp-duty/:state', async (c) => {
  const provider = new D1StampDutyProvider(c.env.DB)
  const row = await provider.getRate(c.req.param('state'))
  if (!row) return c.json({ error: 'not_found' }, 404)
  return c.json({ ...row, indicative: true })
})

app.post('/api/ask-band', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.base_value !== 'number' || typeof body.urgency !== 'number') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  return c.json(computeAskBand(body))
})

// Mode 2 (GOVT REFERENCE) for the three-mode rate calculator (W2-311).
app.get('/api/govt-reference-rate', async (c) => {
  const category = c.req.query('category')
  const region = c.req.query('region')
  if (!category || !region) return c.json({ error: 'invalid_input' }, 400)
  const provider = new D1GovtReferenceRatesProvider(c.env.DB)
  const row = await provider.getRate(category, region)
  if (!row) return c.json({ error: 'not_found' }, 404)
  return c.json({ ...row, indicative: true })
})

// Mode 1 (FERRUM) direct lookup for the three-mode calculator (W2-312).
app.post('/api/ferrum-rate', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.category !== 'string' || typeof body.region !== 'string') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const role: Role = body.role === 'buyer' || body.role === 'seller' ? body.role : 'contractor'
  const govtProvider = new D1GovtReferenceRatesProvider(c.env.DB)
  const ratesProvider = new LiveMarketRatesProvider(c.env.DB, c.env.OGD_API_KEY)
  const govtRow = await govtProvider.getRate(body.category, body.region)
  const marketRow = await ratesProvider.getRate(body.category, body.region)
  const userRate = typeof body.user_rate === 'number' ? body.user_rate : (marketRow?.rate ?? 0)
  const timeAdjustment =
    body.project_start_month && typeof body.quarterly_escalation_factor === 'number'
      ? { project_start_month: body.project_start_month, quarterly_escalation_factor: body.quarterly_escalation_factor }
      : undefined
  const result = computeFerrumRate(govtRow?.rate ?? 0, marketRow?.rate ?? 0, userRate, role, body.weights, timeAdjustment)
  return c.json(result)
})

// Transact case tracking (W2-322), gated by docs/COMPLIANCE_GATE.md.
// Buyer/seller state machine — see lib/transact/caseFlow.ts. token_payment
// (buyer step 3) is Stage-1 test-mode only; no real Razorpay charge exists
// yet (W2-324 not landed), advancing past it just records the case moved
// on, matching the "ship stub if dependency missing" rule.
app.post('/api/transact/cases', async (c) => {
  const body = await c.req.json().catch(() => null)
  const role: CaseRole | undefined = body?.role === 'buyer' || body?.role === 'seller' ? body.role : undefined
  if (!body || !role || typeof body.contact_name !== 'string' || typeof body.contact_email !== 'string') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const id = crypto.randomUUID()
  const step = initialStep(role)
  await c.env.DB.batch([
    c.env.DB.prepare(
      'INSERT INTO transact_cases (id, role, contact_name, contact_email, contact_phone, property_ref, state, current_step) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ).bind(
      id,
      role,
      body.contact_name,
      body.contact_email,
      typeof body.contact_phone === 'string' ? body.contact_phone : null,
      typeof body.property_ref === 'string' ? body.property_ref : null,
      typeof body.state === 'string' ? body.state : null,
      step,
    ),
    c.env.DB.prepare('INSERT INTO case_events (id, case_id, from_step, to_step, note) VALUES (?, ?, NULL, ?, ?)').bind(
      crypto.randomUUID(),
      id,
      step,
      'case created',
    ),
  ])
  return c.json({ id, role, current_step: step, status: 'in_progress', indicative: true })
})

app.get('/api/transact/cases/:id', async (c) => {
  const caseId = c.req.param('id')
  const caseRow = await c.env.DB.prepare('SELECT * FROM transact_cases WHERE id = ?').bind(caseId).first()
  if (!caseRow) return c.json({ error: 'not_found' }, 404)
  const events = await c.env.DB.prepare('SELECT * FROM case_events WHERE case_id = ? ORDER BY created_at ASC')
    .bind(caseId)
    .all()
  return c.json({ ...caseRow, events: events.results, indicative: true })
})

app.post('/api/transact/cases/:id/advance', async (c) => {
  const caseId = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  const caseRow = await c.env.DB.prepare('SELECT * FROM transact_cases WHERE id = ?').bind(caseId).first<{
    role: CaseRole
    current_step: string
    status: string
  }>()
  if (!caseRow) return c.json({ error: 'not_found' }, 404)
  if (caseRow.status !== 'in_progress') return c.json({ error: 'case_closed' }, 409)
  if (!body || typeof body.to_step !== 'string' || !isValidTransition(caseRow.role, caseRow.current_step, body.to_step)) {
    return c.json({ error: 'invalid_transition', current_step: caseRow.current_step }, 400)
  }
  const newStatus = isTerminalStep(caseRow.role, body.to_step) ? 'closed' : 'in_progress'
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE transact_cases SET current_step = ?, status = ?, updated_at = datetime('now') WHERE id = ?").bind(
      body.to_step,
      newStatus,
      caseId,
    ),
    c.env.DB.prepare('INSERT INTO case_events (id, case_id, from_step, to_step, note) VALUES (?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(),
      caseId,
      caseRow.current_step,
      body.to_step,
      typeof body.note === 'string' ? body.note : null,
    ),
  ])
  return c.json({ id: caseId, current_step: body.to_step, status: newStatus, indicative: true })
})

// Payments (W2-324), gated by docs/COMPLIANCE_GATE.md. Test-mode by
// default (StubPaymentProvider) until an operator provisions real
// Razorpay secrets — every response carries `simulated`/`mode` so the
// client can label the flow honestly either way.
app.post('/api/payments/order', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.amount_paise !== 'number' || body.amount_paise <= 0) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const id = crypto.randomUUID()
  const provider = getPaymentProvider(c.env)
  const result = await provider.createOrder({ amountPaise: body.amount_paise, currency: 'INR', receipt: id })
  await c.env.DB.prepare(
    'INSERT INTO orders (id, case_id, provider, provider_order_id, amount_paise, currency, mode, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      id,
      typeof body.case_id === 'string' ? body.case_id : null,
      'razorpay',
      result.providerOrderId,
      body.amount_paise,
      'INR',
      result.mode,
      'created',
    )
    .run()
  return c.json({
    id,
    provider_order_id: result.providerOrderId,
    // Razorpay's key_id is a publishable identifier (analogous to a
    // Stripe publishable key) — safe to return to the client, and
    // required to open Razorpay Checkout. Omitted in simulated mode
    // since there is no real checkout to open.
    key_id: result.simulated ? null : c.env.RAZORPAY_KEY_ID,
    amount_paise: body.amount_paise,
    currency: 'INR',
    mode: result.mode,
    simulated: result.simulated,
    indicative: true,
  })
})

app.post('/api/payments/verify', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.order_id !== 'string' || typeof body.razorpay_payment_id !== 'string' || typeof body.razorpay_signature !== 'string') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(body.order_id).first<{
    id: string
    provider_order_id: string | null
  }>()
  if (!order) return c.json({ error: 'not_found' }, 404)
  const provider = getPaymentProvider(c.env)
  const verified = await provider.verifyPaymentSignature(
    order.provider_order_id ?? order.id,
    body.razorpay_payment_id,
    body.razorpay_signature,
  )
  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO payments (id, order_id, provider_payment_id, signature_verified, status) VALUES (?, ?, ?, ?, ?)').bind(
      crypto.randomUUID(),
      body.order_id,
      body.razorpay_payment_id,
      verified ? 1 : 0,
      verified ? 'verified' : 'failed',
    ),
    c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(verified ? 'paid' : 'failed', body.order_id),
  ])
  return c.json({ order_id: body.order_id, status: verified ? 'paid' : 'failed', indicative: true })
})

app.post('/api/payments/webhook', async (c) => {
  const rawBody = await c.req.text()
  const signature = c.req.header('X-Razorpay-Signature') ?? ''
  const provider = getPaymentProvider(c.env)
  const verified = await provider.verifyWebhookSignature(rawBody, signature)
  if (!verified) return c.json({ error: 'invalid_signature' }, 400)
  return c.json({ received: true })
})

// MCP server — stateless (no sessionIdGenerator, per AGENT_INTERFACE.md
// §5's "no workspace/account auth at launch"). A fresh McpServer +
// transport per request keeps this correct under Workers' per-request
// isolate model — there is no long-lived process to hold session state
// in even if we wanted it.
app.all('/mcp', async (c) => {
  const server = buildMcpServer(c.env.DB, c.env.OGD_API_KEY)
  const transport = createMcpTransport()
  await server.connect(transport)
  return transport.handleRequest(c.req.raw)
})

// OpenAPI spec per docs/AGENT_INTERFACE.md §5/§8 — generated from the
// same route inventory the MCP server (W2-274) registers as tools.
// Content-negotiates: Accept: application/json (or ?format=json) gets
// the machine-readable spec; a plain browser GET gets a readable HTML
// index, no external Swagger UI CDN load.
app.get('/docs/api', (c) => {
  const acceptsHtml = c.req.header('Accept')?.includes('text/html')
  const wantsHtml = acceptsHtml && c.req.query('format') !== 'json'
  if (wantsHtml) return c.html(renderOpenApiHtml(openApiSpec))
  return c.json(openApiSpec)
})

// A2A agent card per docs/AGENT_INTERFACE.md §7. Static shape is
// stable now even though the tools it lists aren't wired yet — an
// agent reading this card today gets an honest picture: it lists
// what will exist, and every route it points to answers 501 until its
// task lands, never a fabricated 200.
app.get('/.well-known/agent.json', (c) =>
  c.json({
    name: 'Ferrum OS',
    description:
      'India-first construction & investment platform — land feasibility, AI design, structural checks, BOQ estimation, rate comparison, IRR/NPV modeling, CDE status.',
    capabilities: { streaming: false, pushNotifications: false },
    skills: [
      { id: 'ulpin-demo', name: 'ULPIN parcel lookup', description: 'Indicative parcel lookup by ULPIN.' },
      { id: 'testfit', name: 'Test-fit massing', description: 'Generate SVG massing for a plot.' },
      { id: 'plan-gen', name: 'Plan + DXF export', description: 'Export a test-fit result as DXF.' },
      { id: 'is-check', name: 'IS-code compliance check', description: 'Check structural params against IS 456/875/800.' },
      { id: 'boq-estimate', name: 'BOQ estimate', description: 'Indicative bill-of-quantities estimate.' },
      { id: 'rate-compare', name: 'Rate comparison', description: 'Indicative material/labor rate comparison.' },
      { id: 'irr-npv', name: 'IRR/NPV modeling', description: 'Investment return modeling from cash flows.' },
      { id: 'cde-status', name: 'CDE status read', description: 'Indicative common-data-environment project status.' },
    ],
    authentication: { schemes: [] },
  }),
)

// Everything else falls through to the static asset bundle.
app.get('*', (c) => c.env.ASSETS.fetch(c.req.raw))

export default app
