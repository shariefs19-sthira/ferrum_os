import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SutraPanel from './SutraPanel'

describe('SutraPanel idle demo', () => {
  it('uses the shared product feature registry for in-workspace explanations', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    render(<SutraPanel onEvent={vi.fn()} activeProduct="buildos" />)
    fireEvent.change(screen.getByLabelText('Ask SUTRA'), { target: { value: 'Explain governed cross-functional closure' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByText(/design revision to affected quantity, procurement hold, cost impact/i)).toBeTruthy()
    expect(screen.getByText(/roadmap contract/i)).toBeTruthy()
    vi.unstubAllGlobals()
  })

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

  it('round-trips a guided chip through state-delta immediately, and tool-call only after SUTRA confirmation', () => {
    // CODEX-SENTINEL-20260918-1708-sutra-command-cockpit-output: "set use
    // residential" is a project-state change, so it must NOT reach onEvent
    // as a TOOL_CALL until the operator explicitly confirms it. The guided
    // flow's own STATE_DELTA bookkeeping (which question was answered) is
    // navigation, not a project mutation, so it still fires immediately.
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.click(screen.getByRole('button', { name: 'Residential' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'STATE_DELTA', path: 'guided.selection', value: { stage: 'use', label: 'Residential' } })
    expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'TOOL_CALL' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'TOOL_CALL', tool: 'workspace.command', arguments: { command: 'set use residential' }, source: 'chip' })
    vi.unstubAllGlobals()
  })

  it('preserves typed intent as structured text immediately, but gates the tool-call behind confirmation for a project-state command', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.change(screen.getByLabelText('Ask SUTRA'), { target: { value: 'add one floor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onEvent).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'TEXT_MESSAGE' }))
    expect(screen.getByRole('alert').textContent).toMatch(/add one floor/)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'TEXT_MESSAGE', role: 'user', text: 'add one floor', source: 'text' })
    expect(onEvent).toHaveBeenCalledWith({ type: 'TOOL_CALL', tool: 'workspace.command', arguments: { command: 'add one floor' }, source: 'text' })
    vi.unstubAllGlobals()
  })

  it('view-only change (BOQ extract) applies directly through SUTRA with no confirmation step', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.change(screen.getByLabelText('Ask SUTRA'), { target: { value: 'show BOQ extract' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'TOOL_CALL', tool: 'workspace.command', arguments: { command: 'show BOQ extract' }, source: 'text' })
    expect(screen.queryByRole('alert')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('project-state change requires explicit SUTRA confirmation before it reaches the project (cancel discards it)', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    fireEvent.change(screen.getByLabelText('Ask SUTRA'), { target: { value: 'set setback 3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(onEvent).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onEvent).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('receives cockpit selection context (an output selected on the canvas reaches SUTRA)', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const { dispatchCockpitSelection } = await import('../../lib/sutra/selectionContext')
    const onEvent = vi.fn()
    render(<SutraPanel onEvent={onEvent} />)
    dispatchCockpitSelection({ targetType: 'opening', targetId: 'room-1-door', label: 'Door room-1-door', detail: 'Floor 1 · Living Room' })
    expect(await screen.findByText(/Door room-1-door/)).toBeTruthy()
    expect(screen.getByText(/Floor 1 · Living Room/)).toBeTruthy()
    vi.unstubAllGlobals()
  })
})
