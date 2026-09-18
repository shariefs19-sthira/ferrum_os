import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker'

function createDb() {
  const statement = {
    bind: vi.fn(),
    first: vi.fn().mockResolvedValue({ count: 0 }),
    run: vi.fn().mockResolvedValue({ success: true }),
  }
  statement.bind.mockReturnValue(statement)
  return { prepare: vi.fn().mockReturnValue(statement) }
}

function createEnv(overrides = {}) {
  return {
    DB: createDb(),
    ASSETS: { fetch: vi.fn().mockResolvedValue(new Response('asset')) },
    ...overrides,
  }
}

describe('Worker observability integration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the accepted request ID and emits a structured completion event', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const response = await worker.request(
      'https://ferrum.test/api/health?email=private@example.com',
      { headers: { 'X-Request-ID': 'operator-trace-1234' } },
      createEnv(),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Request-ID')).toBe('operator-trace-1234')
    expect(JSON.parse(info.mock.calls[0][0])).toMatchObject({
      event: 'edge.request_completed',
      request_id: 'operator-trace-1234',
      route: '/api/health',
      method: 'GET',
      status: 200,
    })
    expect(info.mock.calls[0][0]).not.toContain('private@example.com')
  })

  it('accepts a bounded client error report and records no unapproved fields', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await worker.request(
      'https://ferrum.test/api/ops/client-errors',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' },
        body: JSON.stringify({
          name: 'TypeError',
          message: 'render failed',
          route: '/products/landintel?token=secret',
          cookie: 'must-not-survive',
        }),
      },
      createEnv(),
    )

    expect(response.status).toBe(202)
    const payload = await response.json()
    expect(payload.status).toBe('accepted')
    expect(response.headers.get('X-Request-ID')).toBe(payload.request_id)
    expect(error).toHaveBeenCalledTimes(1)
    expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({
      event: 'client.render_error',
      source: 'client',
      route: '/products/landintel',
      error_message: 'render failed',
    })
    expect(error.mock.calls[0][0]).not.toContain('must-not-survive')
    expect(info).toHaveBeenCalledTimes(1)
  })

  it('converts uncaught edge failures into a redacted response with a trace ID', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const env = createEnv({
      ASSETS: {
        fetch: vi.fn().mockRejectedValue(new Error('upstream secret detail')),
      },
    })

    const response = await worker.request('https://ferrum.test/unhandled', undefined, env)
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload.error).toBe('internal_error')
    expect(response.headers.get('X-Request-ID')).toBe(payload.request_id)
    expect(JSON.stringify(payload)).not.toContain('upstream secret detail')
    expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({
      event: 'edge.request_failed',
      status: 500,
      error_name: 'Error',
      error_message: 'upstream secret detail',
    })
  })
})
