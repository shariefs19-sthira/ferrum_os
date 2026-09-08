import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SutraPanel from './SutraPanel'

describe('SutraPanel idle demo', () => {
  it('never sends demo intents into real project state', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    act(() => vi.advanceTimersByTime(60_000))
    expect(onEvent).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('round-trips a guided chip through tool-call and state-delta events', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.click(screen.getByRole('button', { name: 'Residential' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'TOOL_CALL', tool: 'workspace.command', arguments: { command: 'set use residential' }, source: 'chip' })
    expect(onEvent).toHaveBeenCalledWith({ type: 'STATE_DELTA', path: 'guided.selection', value: { stage: 'use', label: 'Residential' } })
    vi.unstubAllGlobals()
  })

  it('preserves typed intent as structured text and tool-call events', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.change(screen.getByLabelText('Ask SUTRA'), { target: { value: 'add one floor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'TEXT_MESSAGE', role: 'user', text: 'add one floor', source: 'text' })
    expect(onEvent).toHaveBeenCalledWith({ type: 'TOOL_CALL', tool: 'workspace.command', arguments: { command: 'add one floor' }, source: 'text' })
    vi.unstubAllGlobals()
  })
})
