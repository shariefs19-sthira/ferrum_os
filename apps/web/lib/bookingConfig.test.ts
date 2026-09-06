import { describe, expect, it } from 'vitest'
import { resolveHealthyBookingUrl } from './bookingConfig'

describe('resolveHealthyBookingUrl', () => {
  it('returns an HTTPS booking URL only when its health check is green', () => {
    expect(resolveHealthyBookingUrl({
      booking: { url: 'https://cal.com/ferrum/consult', healthCheck: { status: 'green' } },
    })).toBe('https://cal.com/ferrum/consult')
  })

  it.each([
    [{ booking: { healthCheck: { status: 'green' } } }],
    [{ booking: { url: 'https://cal.com/ferrum/consult', healthCheck: { status: 'red' } } }],
    [{ booking: { url: 'javascript:alert(1)', healthCheck: { status: 'green' } } }],
  ])('rejects absent, unhealthy, or unsafe configuration', (config) => {
    expect(resolveHealthyBookingUrl(config)).toBeNull()
  })
})
