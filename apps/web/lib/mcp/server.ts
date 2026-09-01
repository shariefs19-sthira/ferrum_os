// MCP server per docs/AGENT_INTERFACE.md §2/§3/§4. Runs on the Web
// Standards transport (WebStandardStreamableHTTPServerTransport) so it
// works directly in the Workers fetch handler — no Node http shim.
// Stateless (no sessionIdGenerator): every request is a fresh
// initialize+call round-trip, matching the "no workspace/account auth
// at launch" posture from §5.
//
// Registers the eight read tools from §2 (rate-compare included, per
// v2's reasoning for giving ProMarket a real tool rather than staying
// REST-only). Each handler delegates to the same seams
// (LandRecordsProvider/RatesProvider/GeometryExporter) the REST routes
// in worker.ts use — one implementation, two transports, exactly as
// §0 commits to.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { LiveLandRecordsProvider } from '../providers/LiveLandRecordsProvider'
import { LiveMarketRatesProvider } from '../providers/LiveMarketRatesProvider'
import { SvgGeometryExporter } from '../providers/GeometryExporter'
import { runIsCheck } from '../checks/isCode'
import { estimateIrr } from '../finance/irrNpv'
import { D1GovtReferenceRatesProvider } from '../providers/GovtReferenceRatesProvider'
import { computeFerrumRate, type Role } from '../rateEngine/ferrumRateEngine'

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] }
}

export function buildMcpServer(db: D1Database, ogdApiKey?: string): McpServer {
  const server = new McpServer({ name: 'ferrum-os', version: '1.0.0' })

  server.registerTool(
    'ulpin-demo',
    {
      title: 'ULPIN parcel lookup',
      description: 'Indicative parcel lookup by ULPIN.',
      inputSchema: { ulpin: z.string() },
    },
    async ({ ulpin }) => {
      const provider = new LiveLandRecordsProvider(db, ogdApiKey)
      const parcel = await provider.lookup(ulpin)
      if (!parcel) return textResult({ error: 'not_found' })
      return textResult({ ...parcel, indicative: true })
    },
  )

  server.registerTool(
    'testfit',
    {
      title: 'Test-fit massing',
      description: 'Generate SVG massing for a plot.',
      inputSchema: {
        plot_width_m: z.number(),
        plot_depth_m: z.number(),
        floors: z.number(),
        setback_m: z.number().optional(),
      },
    },
    async (input) => {
      const exporter = new SvgGeometryExporter()
      return textResult(exporter.testfit(input))
    },
  )

  server.registerTool(
    'boq-estimate',
    {
      title: 'BOQ estimate',
      description: 'Indicative bill-of-quantities estimate. Set mode="ferrum" for the weighted-band Mode 1 engine (govt + market + user-supplied rate).',
      inputSchema: {
        region: z.string().optional(),
        mode: z.enum(['market', 'ferrum']).optional(),
        role: z.enum(['buyer', 'seller', 'contractor']).optional(),
        weights: z.object({ govt: z.number(), market: z.number(), user: z.number() }).optional(),
        items: z.array(z.object({ category: z.string(), quantity: z.number(), unit: z.string(), user_rate: z.number().optional() })),
      },
    },
    async ({ region, mode, role, weights, items }) => {
      const effectiveRegion = region ?? 'Bengaluru'
      const useFerrum = mode === 'ferrum'
      const effectiveRole: Role = role ?? 'contractor'
      const ratesProvider = new LiveMarketRatesProvider(db, ogdApiKey)
      const govtProvider = new D1GovtReferenceRatesProvider(db)
      const lineItems = []
      let total = 0
      for (const item of items) {
        if (useFerrum) {
          const govtRow = await govtProvider.getRate(item.category, effectiveRegion)
          const marketRow = await ratesProvider.getRate(item.category, effectiveRegion)
          const userRate = item.user_rate ?? marketRow?.rate ?? 0
          const ferrum = computeFerrumRate(govtRow?.rate ?? 0, marketRow?.rate ?? 0, userRate, effectiveRole, weights)
          const amount = ferrum.role_output.value * item.quantity
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
          const rateRow = await ratesProvider.getRate(item.category, effectiveRegion)
          const rate = rateRow?.rate ?? 0
          const amount = rate * item.quantity
          total += amount
          lineItems.push({ category: item.category, quantity: item.quantity, unit: rateRow?.unit ?? item.unit, rate, amount })
        }
      }
      return textResult({ line_items: lineItems, total, indicative: true })
    },
  )

  server.registerTool(
    'rate-compare',
    {
      title: 'Rate comparison',
      description: 'Indicative material/labor rate comparison.',
      inputSchema: { category: z.string(), region: z.string().optional() },
    },
    async ({ category, region }) => {
      const provider = new LiveMarketRatesProvider(db, ogdApiKey)
      const rates = await provider.compare(category, region)
      return textResult({ category, region: region ?? null, rates, indicative: true })
    },
  )

  server.registerTool(
    'is-check',
    {
      title: 'IS-code compliance check',
      description: 'Check structural params against IS 456/875/800.',
      inputSchema: { structure_type: z.string(), params: z.record(z.string(), z.number()) },
    },
    async ({ structure_type, params }) => {
      return textResult(runIsCheck(structure_type, params))
    },
  )

  server.registerTool(
    'plan-gen',
    {
      title: 'Plan + DXF export',
      description: 'Export a test-fit result as DXF.',
      inputSchema: { testfit_id: z.string() },
    },
    async () => {
      // DXF generation is client-side (W2-278, LAUNCH_ARCHITECTURE.md
      // "exports stay client-side") — an agent calling this tool over
      // MCP has no browser to generate the blob in, so this needs a
      // server-side export path R2 doesn't exist for yet. Returns a
      // typed not-implemented result rather than a fabricated URL.
      return textResult({ error: 'not_implemented', reason: 'server-side DXF export pending R2' })
    },
  )

  server.registerTool(
    'irr-npv',
    {
      title: 'IRR/NPV modeling',
      description: 'Investment return modeling from cash flows.',
      inputSchema: { cash_flows: z.array(z.number()), discount_rate: z.number() },
    },
    async ({ cash_flows, discount_rate }) => {
      const npv = cash_flows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + discount_rate, i), 0)
      const irr = estimateIrr(cash_flows)
      return textResult({ irr, npv: Math.round(npv * 100) / 100, indicative: true })
    },
  )

  server.registerTool(
    'cde-status',
    {
      title: 'CDE status read',
      description: 'Indicative common-data-environment project status.',
      inputSchema: { project_id: z.string() },
    },
    async ({ project_id }) => {
      // Indicative mock dataset per W2-272 (CDE dashboard mock parity
      // task) — no real project-state D1 table exists yet.
      return textResult({
        project_id,
        phase: 'Design Development',
        open_items: 4,
        last_updated: new Date().toISOString(),
        indicative: true,
      })
    },
  )

  return server
}

export function createMcpTransport(): WebStandardStreamableHTTPServerTransport {
  return new WebStandardStreamableHTTPServerTransport({})
}
