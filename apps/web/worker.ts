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
import { D1LandRecordsProvider } from './lib/providers/LandRecordsProvider'
import { D1RatesProvider } from './lib/providers/RatesProvider'
import { SvgGeometryExporter } from './lib/providers/GeometryExporter'
import { buildMcpServer, createMcpTransport } from './lib/mcp/server'
import { openApiSpec } from './lib/openapi/spec'
import { renderOpenApiHtml } from './lib/openapi/render'

export type Env = {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/api/ulpin/:id', async (c) => {
  const provider = new D1LandRecordsProvider(c.env.DB)
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
app.post('/api/is-check', (c) => c.json({ error: 'not_implemented', tool: 'is-check' }, 501))

app.post('/api/boq-estimate', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.items)) return c.json({ error: 'invalid_input' }, 400)
  const region = typeof body.region === 'string' ? body.region : 'Bengaluru'
  const provider = new D1RatesProvider(c.env.DB)
  const lineItems = []
  let total = 0
  for (const item of body.items) {
    const rateRow = await provider.getRate(item.category, region)
    const rate = rateRow?.rate ?? 0
    const amount = rate * (item.quantity ?? 0)
    total += amount
    lineItems.push({ category: item.category, quantity: item.quantity, unit: rateRow?.unit ?? item.unit, rate, amount })
  }
  return c.json({ line_items: lineItems, total, indicative: true })
})

app.get('/api/rates/compare', async (c) => {
  const category = c.req.query('category')
  const region = c.req.query('region')
  if (!category) return c.json({ error: 'invalid_input' }, 400)
  const provider = new D1RatesProvider(c.env.DB)
  const rates = await provider.compare(category, region)
  return c.json({ category, region: region ?? null, rates, indicative: true })
})

app.post('/api/irr-npv', (c) => c.json({ error: 'not_implemented', tool: 'irr-npv' }, 501))
app.get('/api/cde-status/:project_id', (c) => c.json({ error: 'not_implemented', tool: 'cde-status' }, 501))

// Lead capture — the one write path (AGENT_INTERFACE.md §5). Not one
// of W2-277's three named seams (LandRecordsProvider/RatesProvider/
// GeometryExporter); stays stubbed until the MCP server task decides
// its final validation shape.
app.post('/api/leads', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
    return c.json({ error: 'invalid_lead' }, 400)
  }
  return c.json({ error: 'not_implemented', tool: 'leads' }, 501)
})

// MCP server — stateless (no sessionIdGenerator, per AGENT_INTERFACE.md
// §5's "no workspace/account auth at launch"). A fresh McpServer +
// transport per request keeps this correct under Workers' per-request
// isolate model — there is no long-lived process to hold session state
// in even if we wanted it.
app.all('/mcp', async (c) => {
  const server = buildMcpServer(c.env.DB)
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
