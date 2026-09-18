export type OpsEventLevel = 'info' | 'error'

export type OpsEvent = {
  timestamp: string
  level: OpsEventLevel
  event: 'edge.request_completed' | 'edge.request_failed' | 'client.render_error'
  source: 'edge' | 'client'
  request_id: string
  route?: string
  method?: string
  status?: number
  duration_ms?: number
  error_name?: string
  error_message?: string
  component_stack?: string
}

export type ClientErrorReport = {
  name: string
  message: string
  route: string
  component_stack?: string
}

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/

function compactText(value: string, maxLength: number): string {
  return value.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, maxLength)
}

/**
 * Preserve a caller's correlation ID only when it is bounded and safe to
 * reflect in a response header. Otherwise create an edge-owned identifier.
 */
export function createRequestId(incoming: string | null | undefined): string {
  if (incoming && REQUEST_ID_PATTERN.test(incoming)) return incoming
  return crypto.randomUUID()
}

/**
 * Remove query strings and identifiers from routes before logging. Tokens,
 * parcel IDs, project IDs and case IDs must not become observability data.
 */
export function redactRoute(value: string): string {
  let pathname = '/'
  try {
    pathname = new URL(value, 'https://ferrum.invalid').pathname
  } catch {
    return '/invalid-route'
  }

  const segments = pathname.split('/').map((segment, index, all) => {
    if (!segment) return segment
    const previous = all[index - 1]
    if (previous === 'shared') return ':token'
    if (previous === 'ulpin') return ':id'
    if (
      (previous === 'artifacts' || previous === 'projects' || previous === 'cases' || previous === 'subscriptions') &&
      segment !== 'export' &&
      segment !== 'share'
    ) {
      return ':id'
    }
    if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) || /^[A-Za-z0-9_-]{24,}$/.test(segment)) {
      return ':id'
    }
    return compactText(segment, 64)
  })

  return segments.join('/').slice(0, 240) || '/'
}

export function normalizeError(error: unknown): Pick<OpsEvent, 'error_name' | 'error_message'> {
  if (error instanceof Error) {
    return {
      error_name: compactText(error.name || 'Error', 80),
      error_message: compactText(error.message || 'Unspecified error', 320),
    }
  }
  return { error_name: 'UnknownError', error_message: 'Non-Error value thrown' }
}

export function normalizeClientError(value: unknown): ClientErrorReport | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (typeof input.message !== 'string' || typeof input.route !== 'string') return null

  const message = compactText(input.message, 320)
  if (!message) return null

  const report: ClientErrorReport = {
    name: typeof input.name === 'string' ? compactText(input.name, 80) || 'Error' : 'Error',
    message,
    route: redactRoute(input.route),
  }
  if (typeof input.component_stack === 'string') {
    const componentStack = compactText(input.component_stack, 1200)
    if (componentStack) report.component_stack = componentStack
  }
  return report
}

export function writeOpsEvent(event: Omit<OpsEvent, 'timestamp'>): OpsEvent {
  const entry: OpsEvent = { timestamp: new Date().toISOString(), ...event }
  const serialized = JSON.stringify(entry)
  if (entry.level === 'error') {
    console.error(serialized)
  } else {
    console.info(serialized)
  }
  return entry
}

