import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SutraPanel from './SutraPanel'

describe('SutraPanel idle demo', () => {
  it('never sends demo intents into real project state', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onSubmit = vi.fn()
    render(<SutraPanel onSubmit={onSubmit} />)
    act(() => vi.advanceTimersByTime(60_000))
    expect(onSubmit).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
