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
import { hashPassword, verifyPassword, generateToken, hashToken } from './lib/auth/password'
import { createSession, getSessionUser, deleteSession, setCookieHeader, clearCookieHeader, parseSessionCookie } from './lib/auth/session'
import { sendVerificationEmail, sendResetEmail } from './lib/auth/email'
import { checkRateLimit } from './lib/auth/rateLimit'
import { sendCaseNotification } from './lib/transact/notifications'

async function requireUser(env: Env, cookieHeader: string | undefined) {
  const sessionId = parseSessionCookie(cookieHeader)
  if (!sessionId) return null
  return getSessionUser(env.DB, sessionId)
}

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
  // Resend key (W2-326) — unset until an operator provisions it, so
  // verify/reset emails fall back to returning the raw token in the API
  // response (labeled dev-mode) instead of sending real mail.
  RESEND_API_KEY?: string
  // Shared-secret gate for the minimal /api/admin/leads view (W2-328).
  // There's no admin-role concept in the auth system yet (a real one is
  // out of this task's scope) — unset until an operator provisions it,
  // and the route returns 503 rather than pretending to be open or
  // silently allowing anyone through.
  ADMIN_TOKEN?: string
  // R2 bucket for Transact document uploads (W2-330) — not provisioned
  // (creating live R2 infrastructure on the operator's real Cloudflare
  // account isn't something to do unilaterally); the upload route
  // returns 503 until an operator adds the binding, matching the
  // ADMIN_TOKEN/RESEND_API_KEY precedent.
  TRANSACT_DOCS?: R2Bucket
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
    'INSERT INTO leads (name, email, phone, product, source_page, state, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(
      body.name,
      body.email,
      typeof body.phone === 'string' ? body.phone : null,
      typeof body.product === 'string' ? body.product : 'unspecified',
      typeof body.source_page === 'string' ? body.source_page : 'unspecified',
      typeof body.state === 'string' ? body.state : null,
      typeof body.message === 'string' ? body.message : null,
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

// Transact lifecycle extensions (W2-330): KYC capture, document
// uploads, scheduling. Gated by docs/COMPLIANCE_GATE.md.
async function loadCase(env: Env, caseId: string) {
  return env.DB.prepare('SELECT * FROM transact_cases WHERE id = ?').bind(caseId).first<{
    id: string
    contact_email: string
  }>()
}

// Self-declared only — no government identity API is whitelisted or
// integrated, so this never claims to "verify" anything (would be
// fabricating a legal/identity conclusion this build has no basis for).
app.post('/api/transact/cases/:id/kyc', async (c) => {
  const transactCase = await loadCase(c.env, c.req.param('id'))
  if (!transactCase) return c.json({ error: 'not_found' }, 404)
  const body = await c.req.json().catch(() => null)
  if (
    !body ||
    typeof body.full_name !== 'string' ||
    typeof body.document_type !== 'string' ||
    typeof body.document_ref_last4 !== 'string' ||
    body.document_ref_last4.length !== 4
  ) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO kyc_submissions (id, case_id, full_name, document_type, document_ref_last4) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, transactCase.id, body.full_name, body.document_type, body.document_ref_last4)
    .run()
  return c.json({ id, status: 'self_declared', indicative: true })
})

app.post('/api/transact/cases/:id/documents', async (c) => {
  if (!c.env.TRANSACT_DOCS) return c.json({ error: 'document_upload_not_configured' }, 503)
  const transactCase = await loadCase(c.env, c.req.param('id'))
  if (!transactCase) return c.json({ error: 'not_found' }, 404)
  const formData = await c.req.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || !(file instanceof File)) return c.json({ error: 'invalid_input' }, 400)
  const id = crypto.randomUUID()
  const key = `transact/${transactCase.id}/${id}-${file.name}`
  await c.env.TRANSACT_DOCS.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
  await c.env.DB.prepare(
    'INSERT INTO document_uploads (id, case_id, r2_key, filename, content_type, size_bytes) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, transactCase.id, key, file.name, file.type, file.size)
    .run()
  return c.json({ id, filename: file.name, size_bytes: file.size })
})

app.get('/api/transact/cases/:id/documents', async (c) => {
  const transactCase = await loadCase(c.env, c.req.param('id'))
  if (!transactCase) return c.json({ error: 'not_found' }, 404)
  const rows = await c.env.DB.prepare(
    'SELECT id, filename, content_type, size_bytes, created_at FROM document_uploads WHERE case_id = ? ORDER BY created_at DESC',
  )
    .bind(transactCase.id)
    .all()
  return c.json({ documents: rows.results })
})

app.post('/api/transact/cases/:id/schedule', async (c) => {
  const transactCase = await loadCase(c.env, c.req.param('id'))
  if (!transactCase) return c.json({ error: 'not_found' }, 404)
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.requested_date !== 'string') return c.json({ error: 'invalid_input' }, 400)
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO scheduled_slots (id, case_id, requested_date, requested_window) VALUES (?, ?, ?, ?)')
    .bind(id, transactCase.id, body.requested_date, typeof body.requested_window === 'string' ? body.requested_window : null)
    .run()
  const notification = await sendCaseNotification(
    c.env.RESEND_API_KEY,
    transactCase.contact_email,
    'Your Ferrum OS registration slot request',
    `We received your requested slot for ${body.requested_date}${body.requested_window ? ` (${body.requested_window})` : ''}. This is a request, not a confirmed booking — indicative only.`,
  )
  return c.json({ id, status: 'requested', notification_sent: notification.sent, dev_notification_preview: notification.devPreview })
})

app.get('/api/transact/cases/:id/schedule', async (c) => {
  const transactCase = await loadCase(c.env, c.req.param('id'))
  if (!transactCase) return c.json({ error: 'not_found' }, 404)
  const rows = await c.env.DB.prepare('SELECT * FROM scheduled_slots WHERE case_id = ? ORDER BY created_at DESC')
    .bind(transactCase.id)
    .all()
  return c.json({ slots: rows.results })
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

// Subscriptions (W2-329), gated by docs/COMPLIANCE_GATE.md. Test-mode
// only — see RazorpayProvider.createSubscription for why plans are
// created on demand rather than pre-provisioned.
app.post('/api/subscriptions', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.plan_id !== 'string') return c.json({ error: 'invalid_input' }, 400)
  const plan = await c.env.DB.prepare('SELECT * FROM subscription_plans WHERE id = ?').bind(body.plan_id).first<{
    id: string
    name: string
    price_paise: number
  }>()
  if (!plan) return c.json({ error: 'unknown_plan' }, 400)
  const provider = getPaymentProvider(c.env)
  const result = await provider.createSubscription({
    planName: plan.name,
    amountPaise: plan.price_paise,
    currency: 'INR',
    totalCount: 12,
  })
  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO subscriptions (id, user_id, plan_id, provider_subscription_id, mode, status) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, user.id, plan.id, result.providerSubscriptionId, result.mode, result.simulated ? 'active' : 'created')
    .run()
  return c.json({
    id,
    plan_id: plan.id,
    provider_subscription_id: result.providerSubscriptionId,
    mode: result.mode,
    simulated: result.simulated,
    status: result.simulated ? 'active' : 'created',
    indicative: true,
  })
})

app.get('/api/subscriptions/me', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const rows = await c.env.DB.prepare(
    `SELECT s.id, s.plan_id, s.status, s.mode, s.created_at, p.name as plan_name
     FROM subscriptions s JOIN subscription_plans p ON p.id = s.plan_id
     WHERE s.user_id = ? ORDER BY s.created_at DESC`,
  )
    .bind(user.id)
    .all()
  return c.json({ subscriptions: rows.results })
})

app.post('/api/subscriptions/:id/cancel', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const sub = await c.env.DB.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?')
    .bind(c.req.param('id'), user.id)
    .first<{ id: string; provider_subscription_id: string | null }>()
  if (!sub) return c.json({ error: 'not_found' }, 404)
  const provider = getPaymentProvider(c.env)
  await provider.cancelSubscription(sub.provider_subscription_id)
  await c.env.DB.prepare("UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?")
    .bind(sub.id)
    .run()
  return c.json({ ok: true })
})

// Password auth (W2-326), supersedes the stubbed W2-317 login. Sessions
// are HttpOnly/Secure cookies (see lib/auth/session.ts). Rate-limited
// endpoints are D1-backed sliding windows (lib/auth/rateLimit.ts), since
// Workers isolates carry no in-memory state between requests.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

app.post('/api/auth/signup', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || !EMAIL_RE.test(body.email) || typeof body.password !== 'string' || body.password.length < 8) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const email = body.email.toLowerCase()
  if (!(await checkRateLimit(c.env.DB, `signup:${email}`, 5, 60))) return c.json({ error: 'rate_limited' }, 429)
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'email_taken' }, 409)
  const { hash, salt, iterations } = await hashPassword(body.password)
  const userId = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, password_hash, password_salt, password_iterations) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(userId, typeof body.name === 'string' ? body.name : null, email, hash, salt, iterations)
    .run()
  const token = generateToken()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  await c.env.DB.prepare('INSERT INTO verification_tokens (id, user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, tokenHash, 'verify_email', expiresAt)
    .run()
  const emailResult = await sendVerificationEmail(c.env.RESEND_API_KEY, email, token)
  const sessionId = await createSession(c.env.DB, userId)
  c.header('Set-Cookie', setCookieHeader(sessionId))
  return c.json({ id: userId, email, email_verified: false, dev_verify_token: emailResult.devToken })
})

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const email = body.email.toLowerCase()
  if (!(await checkRateLimit(c.env.DB, `login:${email}`, 10, 15))) return c.json({ error: 'rate_limited' }, 429)
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<{
    id: string
    email: string
    password_hash: string
    password_salt: string
    password_iterations: number
    email_verified: number
  }>()
  if (!user || !(await verifyPassword(body.password, { hash: user.password_hash, salt: user.password_salt, iterations: user.password_iterations }))) {
    return c.json({ error: 'invalid_credentials' }, 401)
  }
  const sessionId = await createSession(c.env.DB, user.id)
  c.header('Set-Cookie', setCookieHeader(sessionId))
  return c.json({ id: user.id, email: user.email, email_verified: !!user.email_verified })
})

app.post('/api/auth/logout', async (c) => {
  const sessionId = parseSessionCookie(c.req.header('Cookie'))
  if (sessionId) await deleteSession(c.env.DB, sessionId)
  c.header('Set-Cookie', clearCookieHeader())
  return c.json({ ok: true })
})

app.get('/api/auth/session', async (c) => {
  const sessionId = parseSessionCookie(c.req.header('Cookie'))
  if (!sessionId) return c.json({ user: null })
  const user = await getSessionUser(c.env.DB, sessionId)
  return c.json({ user: user ? { id: user.id, email: user.email, email_verified: !!user.email_verified } : null })
})

app.post('/api/auth/verify', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.token !== 'string') return c.json({ error: 'invalid_input' }, 400)
  const tokenHash = await hashToken(body.token)
  const row = await c.env.DB.prepare(
    `SELECT id, user_id FROM verification_tokens WHERE token_hash = ? AND type = 'verify_email' AND used_at IS NULL AND expires_at > datetime('now')`,
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string }>()
  if (!row) return c.json({ error: 'invalid_or_expired_token' }, 400)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?').bind(row.user_id),
    c.env.DB.prepare("UPDATE verification_tokens SET used_at = datetime('now') WHERE id = ?").bind(row.id),
  ])
  return c.json({ ok: true })
})

app.post('/api/auth/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string') return c.json({ error: 'invalid_input' }, 400)
  const email = body.email.toLowerCase()
  if (!(await checkRateLimit(c.env.DB, `forgot:${email}`, 5, 60))) return c.json({ error: 'rate_limited' }, 429)
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>()
  // Always return 200 regardless of whether the email exists — an
  // account-enumeration guard, not an inconsistency.
  if (!user) return c.json({ ok: true })
  const token = generateToken()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  await c.env.DB.prepare('INSERT INTO verification_tokens (id, user_id, token_hash, type, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), user.id, tokenHash, 'reset_password', expiresAt)
    .run()
  const emailResult = await sendResetEmail(c.env.RESEND_API_KEY, email, token)
  return c.json({ ok: true, dev_reset_token: emailResult.devToken })
})

app.post('/api/auth/reset-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.token !== 'string' || typeof body.new_password !== 'string' || body.new_password.length < 8) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const tokenHash = await hashToken(body.token)
  const row = await c.env.DB.prepare(
    `SELECT id, user_id FROM verification_tokens WHERE token_hash = ? AND type = 'reset_password' AND used_at IS NULL AND expires_at > datetime('now')`,
  )
    .bind(tokenHash)
    .first<{ id: string; user_id: string }>()
  if (!row) return c.json({ error: 'invalid_or_expired_token' }, 400)
  const { hash, salt, iterations } = await hashPassword(body.new_password)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ? WHERE id = ?').bind(
      hash,
      salt,
      iterations,
      row.user_id,
    ),
    c.env.DB.prepare("UPDATE verification_tokens SET used_at = datetime('now') WHERE id = ?").bind(row.id),
  ])
  return c.json({ ok: true })
})

// Saved-artifact workspace (W2-327), tied to W2-326 auth. `data` is
// stored/returned as an opaque JSON blob — see migrations/0008_workspace.sql
// for why it isn't normalized per artifact type.
app.post('/api/workspace/artifacts', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.type !== 'string' || typeof body.title !== 'string' || body.data === undefined) {
    return c.json({ error: 'invalid_input' }, 400)
  }
  const id = crypto.randomUUID()
  await c.env.DB.prepare('INSERT INTO saved_artifacts (id, user_id, type, title, data) VALUES (?, ?, ?, ?, ?)')
    .bind(id, user.id, body.type, body.title, JSON.stringify(body.data))
    .run()
  return c.json({ id, type: body.type, title: body.title })
})

app.get('/api/workspace/artifacts', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const rows = await c.env.DB.prepare('SELECT id, type, title, created_at FROM saved_artifacts WHERE user_id = ? ORDER BY created_at DESC')
    .bind(user.id)
    .all()
  return c.json({ artifacts: rows.results })
})

async function loadOwnedArtifact(env: Env, userId: string, artifactId: string) {
  return env.DB.prepare('SELECT * FROM saved_artifacts WHERE id = ? AND user_id = ?').bind(artifactId, userId).first<{
    id: string
    user_id: string
    type: string
    title: string
    data: string
    created_at: string
  }>()
}

app.get('/api/workspace/artifacts/:id', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const artifact = await loadOwnedArtifact(c.env, user.id, c.req.param('id'))
  if (!artifact) return c.json({ error: 'not_found' }, 404)
  return c.json({ ...artifact, data: JSON.parse(artifact.data) })
})

app.delete('/api/workspace/artifacts/:id', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const artifact = await loadOwnedArtifact(c.env, user.id, c.req.param('id'))
  if (!artifact) return c.json({ error: 'not_found' }, 404)
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM artifact_shares WHERE artifact_id = ?').bind(artifact.id),
    c.env.DB.prepare('DELETE FROM saved_artifacts WHERE id = ?').bind(artifact.id),
  ])
  return c.json({ ok: true })
})

app.get('/api/workspace/artifacts/:id/export', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const artifact = await loadOwnedArtifact(c.env, user.id, c.req.param('id'))
  if (!artifact) return c.json({ error: 'not_found' }, 404)
  const payload = JSON.stringify({ ...artifact, data: JSON.parse(artifact.data) }, null, 2)
  return new Response(payload, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${artifact.id}.json"`,
    },
  })
})

app.post('/api/workspace/artifacts/:id/share', async (c) => {
  const user = await requireUser(c.env, c.req.header('Cookie'))
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const artifact = await loadOwnedArtifact(c.env, user.id, c.req.param('id'))
  if (!artifact) return c.json({ error: 'not_found' }, 404)
  const existing = await c.env.DB.prepare('SELECT share_token FROM artifact_shares WHERE artifact_id = ?')
    .bind(artifact.id)
    .first<{ share_token: string }>()
  if (existing) return c.json({ share_token: existing.share_token })
  const shareToken = generateToken()
  await c.env.DB.prepare('INSERT INTO artifact_shares (id, artifact_id, share_token) VALUES (?, ?, ?)')
    .bind(crypto.randomUUID(), artifact.id, shareToken)
    .run()
  return c.json({ share_token: shareToken })
})

// Public — no auth. A share token grants read access to exactly one
// artifact, nothing else about the owning user or their workspace.
app.get('/api/workspace/shared/:token', async (c) => {
  const share = await c.env.DB.prepare('SELECT artifact_id FROM artifact_shares WHERE share_token = ?')
    .bind(c.req.param('token'))
    .first<{ artifact_id: string }>()
  if (!share) return c.json({ error: 'not_found' }, 404)
  const artifact = await c.env.DB.prepare('SELECT type, title, data, created_at FROM saved_artifacts WHERE id = ?')
    .bind(share.artifact_id)
    .first<{ type: string; title: string; data: string; created_at: string }>()
  if (!artifact) return c.json({ error: 'not_found' }, 404)
  return c.json({ ...artifact, data: JSON.parse(artifact.data) })
})

// Minimal operator lead view (W2-328) — shared-secret gate, not a real
// admin-role system (that's a separate, larger task). 503 (not 401) when
// ADMIN_TOKEN is unset: this route is genuinely not configured yet, not
// a locked door someone might mistake for a working one.
app.get('/api/admin/leads', async (c) => {
  if (!c.env.ADMIN_TOKEN) return c.json({ error: 'admin_view_not_configured' }, 503)
  const token = c.req.query('token')
  if (token !== c.env.ADMIN_TOKEN) return c.json({ error: 'unauthorized' }, 401)
  const rows = await c.env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200').all()
  return c.json({ leads: rows.results })
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
