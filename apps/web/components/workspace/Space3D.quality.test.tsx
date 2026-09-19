import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateStudioPlan } from '../../lib/plan-gen'
import { designStudioRenderStack } from '../../lib/designstudio/renderStack'
import Space3D, { resolveRenderQuality } from './Space3D'

const base = { choice: 'auto' as const, demoMode: false, mobile: false, softwareRenderer: false, urlProfile: null, fullscreenHigh: false, fellBack: false }

describe('resolveRenderQuality', () => {
  it('defaults phones to reduced and capable desktops to full', () => {
    expect(resolveRenderQuality({ ...base, mobile: true })).toEqual({ lowPower: true, reason: 'mobile-default' })
    expect(resolveRenderQuality(base)).toEqual({ lowPower: false, reason: 'device-default' })
    expect(resolveRenderQuality({ ...base, softwareRenderer: true })).toEqual({ lowPower: true, reason: 'software-renderer' })
  })

  it('lets a capable mobile device explicitly choose high, and any device choose reduced', () => {
    expect(resolveRenderQuality({ ...base, mobile: true, choice: 'high' })).toEqual({ lowPower: false, reason: 'user-high' })
    expect(resolveRenderQuality({ ...base, choice: 'reduced' })).toEqual({ lowPower: true, reason: 'user-reduced' })
  })

  it('honours the link and fullscreen overrides only while the user has not chosen', () => {
    expect(resolveRenderQuality({ ...base, mobile: true, urlProfile: 'full' })).toEqual({ lowPower: false, reason: 'url-full' })
    expect(resolveRenderQuality({ ...base, urlProfile: 'reduced' })).toEqual({ lowPower: true, reason: 'url-reduced' })
    expect(resolveRenderQuality({ ...base, mobile: true, fullscreenHigh: true })).toEqual({ lowPower: false, reason: 'fullscreen-high' })
    expect(resolveRenderQuality({ ...base, urlProfile: 'full', choice: 'reduced' }).lowPower).toBe(true)
  })

  it('always lets the demo and a measured low-fps fallback win, even over an explicit High', () => {
    expect(resolveRenderQuality({ ...base, choice: 'high', demoMode: true })).toEqual({ lowPower: true, reason: 'demo' })
    expect(resolveRenderQuality({ ...base, choice: 'high', fellBack: true })).toEqual({ lowPower: true, reason: 'auto-fallback' })
  })
})

describe('Space3D render status', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })
  const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })

  it('offers no quality control and claims no engine when WebGL2 is unavailable', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { container } = render(<Space3D plan={plan} />)
    const evidence = container.querySelector('[data-canvas-evidence]') as HTMLElement
    expect(container.querySelector('[data-render-quality-control]')).toBeNull()
    expect(evidence.textContent).toMatch(/Diagram/)
    expect(evidence.textContent).not.toMatch(/PBR|V-Ray/i)
  })

  it('states the V-Ray licensing boundary from the render stack, never a V-Ray claim', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { container } = render(<Space3D plan={plan} />)
    const evidence = container.querySelector('[data-canvas-evidence]') as HTMLElement
    expect(designStudioRenderStack.find((item) => item.id === 'vray-plugin')?.status).toBe('PLUGIN ONLY')
    expect(evidence.title).toMatch(/Three\.js/)
    expect(evidence.title).toMatch(/V-Ray export plugin.*plugin only.*does not run in this view/i)
    expect(evidence.textContent).not.toMatch(/V-Ray/i)
  })
})
