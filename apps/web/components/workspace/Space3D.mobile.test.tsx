import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateStudioPlan } from '../../lib/plan-gen'
import Space3D from './Space3D'

describe('Space3D mobile evidence boundary', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('keeps the complete qualification visible instead of truncating its terminal warning', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
    const { container } = render(<Space3D plan={plan} />)
    const evidence = container.querySelector('[data-canvas-evidence]') as HTMLElement

    expect(evidence.textContent?.trim()).toMatch(/INDICATIVE.*NOT A SURVEY$/)
    expect(evidence.className).toContain('whitespace-normal')
    expect(evidence.className).toContain('break-words')
    expect(evidence.className).not.toContain('truncate')
  })
})
