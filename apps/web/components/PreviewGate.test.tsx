import { act } from 'react-dom/test-utils'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import PreviewGate from './PreviewGate'

describe('PreviewGate server hydration', () => {
  beforeAll(() => {
    ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('hydrates the direct-route markup without replacing its boundary', async () => {
    const host = document.createElement('div')
    host.innerHTML = renderToString(<PreviewGate />)
    document.body.append(host)
    const recoverable = vi.fn()

    let root!: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(host, <PreviewGate />, { onRecoverableError: recoverable })
    })

    expect(recoverable).not.toHaveBeenCalled()
    expect(host.querySelectorAll('input[type="email"], input[type="password"]')).toHaveLength(0)
    expect(host.querySelector('[data-preview-gate]')).not.toBeNull()

    await act(async () => root.unmount())
  })
})
