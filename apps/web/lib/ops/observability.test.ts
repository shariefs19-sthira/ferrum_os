import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRequestId, normalizeClientError, normalizeError, redactRoute, writeOpsEvent } from './observability'

describe('edge observability contract', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts only bounded safe correlation IDs', () => {
    expect(createRequestId('trace-12345678')).toBe('trace-12345678')
    expect(createRequestId('short')).not.toBe('short')
    expect(createRequestId('unsafe header\nvalue')).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('removes query strings and sensitive path identifiers', () => {
    expect(redactRoute('/api/workspace/shared/secret-token-value-123456789?email=user@example.com')).toBe(
      '/api/workspace/shared/:token',
    )
    expect(redactRoute('/api/transact/cases/9af8bb1c-63fe-4eef-ae30-342a16f52834')).toBe(
      '/api/transact/cases/:id',
    )
    expect(redactRoute('/api/ulpin/12345678901234')).toBe('/api/ulpin/:id')
  })

  it('bounds client reports and excludes unapproved fields', () => {
    const report = normalizeClientError({
      name: 'TypeError',
      message: `render failed\n${'x'.repeat(500)}`,
      route: '/products/landintel?token=secret',
      component_stack: `at ParcelMap\n${'y'.repeat(1500)}`,
      cookie: 'must-not-survive',
    })

    expect(report).toEqual({
      name: 'TypeError',
      message: expect.stringMatching(/^render failed /),
      route: '/products/landintel',
      component_stack: expect.stringMatching(/^at ParcelMap /),
    })
    expect(report?.message.length).toBeLessThanOrEqual(320)
    expect(report?.component_stack?.length).toBeLessThanOrEqual(1200)
    expect(JSON.stringify(report)).not.toContain('must-not-survive')
  })

  it('serializes structured events at the matching severity', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const completed = writeOpsEvent({
      level: 'info',
      event: 'edge.request_completed',
      source: 'edge',
      request_id: 'trace-12345678',
      route: '/api/health',
      method: 'GET',
      status: 200,
      duration_ms: 4,
    })
    const failed = writeOpsEvent({
      level: 'error',
      event: 'edge.request_failed',
      source: 'edge',
      request_id: 'trace-87654321',
      ...normalizeError(new TypeError('database failed\nwith detail')),
    })

    expect(completed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(failed.error_name).toBe('TypeError')
    expect(failed.error_message).toBe('database failed with detail')
    expect(info).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(1)
    expect(JSON.parse(info.mock.calls[0][0] as string)).toMatchObject({ event: 'edge.request_completed', status: 200 })
  })
})
