// OpenAPI 3.x spec for the /api/* routes, per docs/AGENT_INTERFACE.md
// §2/§5/§8: generated from the same tool inventory the MCP server
// (W2-274) registers, so REST and MCP never drift apart. Typed against
// `openapi-types` for authoring correctness; served as-is at
// /docs/api for machine consumption, and via a lightweight HTML
// rendering for humans (worker.ts content-negotiates on Accept).

import type { OpenAPIV3 } from 'openapi-types'

const indicativeNote = 'Every field in this response is INDICATIVE sample data, not a live feed.'

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Ferrum OS API',
    version: '1.0.0',
    description:
      'India-first construction & investment platform — land feasibility, AI design, structural checks, BOQ estimation, rate comparison, IRR/NPV modeling, CDE status. See docs/AGENT_INTERFACE.md for the full agent-interface spec; every read route here has an identical MCP tool at /mcp.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } } },
      },
    },
    '/api/ulpin/{id}': {
      get: {
        summary: 'ULPIN parcel lookup (indicative)',
        description: `${indicativeNote} Same tool as MCP \`ulpin-demo\`.`,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Parcel found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ulpin: { type: 'string' },
                    state: { type: 'string' },
                    district: { type: 'string' },
                    area_sqm: { type: 'number' },
                    land_use: { type: 'string' },
                    indicative: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/testfit': {
      post: {
        summary: 'Test-fit massing (SVG)',
        description: 'Same tool as MCP `testfit`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['plot_width_m', 'plot_depth_m', 'floors'],
                properties: {
                  plot_width_m: { type: 'number' },
                  plot_depth_m: { type: 'number' },
                  floors: { type: 'number' },
                  setback_m: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Massing generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    testfit_id: { type: 'string' },
                    svg: { type: 'string' },
                    floor_area_sqm: { type: 'number' },
                    coverage_pct: { type: 'number' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/plan-gen': {
      post: {
        summary: 'Plan + DXF export',
        description: 'Not implemented at launch — DXF export is client-side (see docs/AGENT_INTERFACE.md §3, W2-278). Server-side export is a post-launch rail pending R2.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['testfit_id'], properties: { testfit_id: { type: 'string' } } } } },
        },
        responses: { '501': { description: 'Not implemented' } },
      },
    },
    '/api/is-check': {
      post: {
        summary: 'IS-code compliance check',
        description: 'Same tool as MCP `is-check`. Rule table not yet populated — returns an empty checks array, never a fabricated result.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['structure_type', 'params'],
                properties: { structure_type: { type: 'string' }, params: { type: 'object', additionalProperties: { type: 'number' } } },
              },
            },
          },
        },
        responses: { '501': { description: 'Not implemented' } },
      },
    },
    '/api/boq-estimate': {
      post: {
        summary: 'BOQ estimate (indicative)',
        description: `${indicativeNote} Same tool as MCP \`boq-estimate\`.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  region: { type: 'string' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['category', 'quantity', 'unit'],
                      properties: { category: { type: 'string' }, quantity: { type: 'number' }, unit: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Estimate computed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    line_items: { type: 'array', items: { type: 'object' } },
                    total: { type: 'number' },
                    indicative: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/rates/compare': {
      get: {
        summary: 'Rate comparison (indicative)',
        description: `${indicativeNote} Same tool as MCP \`rate-compare\`.`,
        parameters: [
          { name: 'category', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'region', in: 'query', required: false, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Rates found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { category: { type: 'string' }, region: { type: 'string', nullable: true }, rates: { type: 'array', items: { type: 'object' } }, indicative: { type: 'boolean' } },
                },
              },
            },
          },
          '400': { description: 'Invalid input' },
        },
      },
    },
    '/api/irr-npv': {
      post: {
        summary: 'IRR/NPV modeling',
        description: `${indicativeNote} Same tool as MCP \`irr-npv\`. Not yet wired on the REST route — see MCP for the live implementation.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cash_flows', 'discount_rate'],
                properties: { cash_flows: { type: 'array', items: { type: 'number' } }, discount_rate: { type: 'number' } },
              },
            },
          },
        },
        responses: { '501': { description: 'Not implemented on REST yet — available via MCP' } },
      },
    },
    '/api/cde-status/{project_id}': {
      get: {
        summary: 'CDE status read (indicative mock)',
        description: `${indicativeNote} Same tool as MCP \`cde-status\`. Not yet wired on the REST route — see MCP for the live implementation.`,
        parameters: [{ name: 'project_id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '501': { description: 'Not implemented on REST yet — available via MCP' } },
      },
    },
    '/api/leads': {
      post: {
        summary: 'Lead capture (write)',
        description: 'The only write route in the interface. Deliberately has no MCP tool (docs/AGENT_INTERFACE.md §5) — lead capture is a human-CTA-context conversion action, not a general agent capability.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['name', 'email'], properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, product: { type: 'string' }, source_page: { type: 'string' } } },
            },
          },
        },
        responses: { '501': { description: 'Not implemented yet' }, '400': { description: 'Invalid lead' } },
      },
    },
  },
}
