// Ferrum OS Worker — thin edge layer per docs/AGENT_INTERFACE.md and
// docs/LAUNCH_ARCHITECTURE.md. Serves the static site (ASSETS binding)
// plus /api/*, /mcp, /docs/api, /.well-known/agent.json.
//
// W2-276 scope: scaffold only — route shape, D1 binding, health check.
// Provider seams (W2-277), the MCP server (W2-274), and the OpenAPI
// spec (W2-275) fill in the /api/* handlers in later tasks; each route
// below is a typed stub until then.

import { Hono } from 'hono'

export type Env = {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Env }>()

app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Read-tool routes from docs/AGENT_INTERFACE.md §2/§3 — stubbed until
// W2-277 (provider seams) and W2-274 (MCP server) wire real logic.
app.get('/api/ulpin/:id', (c) => c.json({ error: 'not_implemented', tool: 'ulpin-demo' }, 501))
app.post('/api/testfit', (c) => c.json({ error: 'not_implemented', tool: 'testfit' }, 501))
app.post('/api/plan-gen', (c) => c.json({ error: 'not_implemented', tool: 'plan-gen' }, 501))
app.post('/api/is-check', (c) => c.json({ error: 'not_implemented', tool: 'is-check' }, 501))
app.post('/api/boq-estimate', (c) => c.json({ error: 'not_implemented', tool: 'boq-estimate' }, 501))
app.get('/api/rates/compare', (c) => c.json({ error: 'not_implemented', tool: 'rate-compare' }, 501))
app.post('/api/irr-npv', (c) => c.json({ error: 'not_implemented', tool: 'irr-npv' }, 501))
app.get('/api/cde-status/:project_id', (c) => c.json({ error: 'not_implemented', tool: 'cde-status' }, 501))

// Lead capture — the one write path (AGENT_INTERFACE.md §5). Real
// validation + D1 insert lands with W2-277; scaffold just proves the
// binding is wired.
app.post('/api/leads', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.email !== 'string' || typeof body.name !== 'string') {
    return c.json({ error: 'invalid_lead' }, 400)
  }
  return c.json({ error: 'not_implemented', tool: 'leads' }, 501)
})

// MCP server mount point — real tool registration lands with W2-274.
app.all('/mcp', (c) => c.json({ error: 'not_implemented', surface: 'mcp' }, 501))

// OpenAPI spec — real spec lands with W2-275.
app.get('/docs/api', (c) => c.json({ error: 'not_implemented', surface: 'openapi' }, 501))

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
