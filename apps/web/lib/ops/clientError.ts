type BrowserErrorPayload = {
  name: string
  message: string
  route: string
  component_stack?: string
}

/**
 * Best-effort reporting for render failures. The report deliberately excludes
 * query strings, form state, cookies and the JavaScript stack. Those fields can
 * carry customer or authentication data and do not belong in edge logs.
 */
export async function reportClientRenderError(error: Error, componentStack?: string): Promise<void> {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return

  const payload: BrowserErrorPayload = {
    name: error.name || 'Error',
    message: error.message || 'Unspecified render error',
    route: window.location.pathname,
  }
  if (componentStack) payload.component_stack = componentStack

  try {
    await fetch('/api/ops/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // Reporting must never replace the original recovery UI with a second error.
  }
}

