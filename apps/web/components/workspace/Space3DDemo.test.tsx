import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Space3DDemo from './Space3DDemo'

function motionPreference(reduce: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: reduce, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
}

describe('Space3DDemo', () => {
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  it('advances its deterministic intent script without input', () => {
    vi.useFakeTimers()
    motionPreference(false)
    render(<Space3DDemo intervalMs={1000} />)
    expect(screen.getByText(/Add one floor/)).toBeTruthy()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText(/Increase setback to 3 m/)).toBeTruthy()
  })

  it('pauses when reduced motion is preferred', () => {
    vi.useFakeTimers()
    motionPreference(true)
    const { container } = render(<Space3DDemo intervalMs={1000} />)
    act(() => vi.advanceTimersByTime(3000))
    expect(container.querySelector('[data-demo-paused="true"]')).toBeTruthy()
    expect(screen.getByText(/Paused for reduced-motion preference/)).toBeTruthy()
  })
})
