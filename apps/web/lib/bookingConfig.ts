import fleetConfig from '../../../docs/FLEET_SEATS.json'

export type BookingConfiguration = {
  booking?: {
    url?: unknown
    healthCheck?: {
      status?: unknown
    }
  }
}

export function resolveHealthyBookingUrl(config: BookingConfiguration): string | null {
  const url = config.booking?.url
  const healthStatus = config.booking?.healthCheck?.status
  if (typeof url !== 'string' || healthStatus !== 'green') return null

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

export const healthyBookingUrl = resolveHealthyBookingUrl(fleetConfig as unknown as BookingConfiguration)
