import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WalkthroughControl, { type WalkthroughView } from './WalkthroughControl'

const view = (over: Partial<WalkthroughView> = {}): WalkthroughView => ({ status: 'idle', progress: 0, elapsedS: 0, durationS: 24, stepped: false, ...over })
const handlers = () => ({ onPlay: vi.fn(), onPause: vi.fn(), onRestart: vi.fn(), onExport: vi.fn(), onToggleRecording: vi.fn() })

describe('WalkthroughControl', () => {
  it('plays, restarts and exports from real buttons', () => {
    const h = handlers()
    render(<WalkthroughControl view={view()} recordingSupported recording="off" exportNote="" {...h} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play walkthrough' }))
    fireEvent.click(screen.getByRole('button', { name: /Restart walkthrough/ }))
    fireEvent.click(screen.getByRole('button', { name: /Export walkthrough manifest/ }))
    expect(h.onPlay).toHaveBeenCalledOnce()
    expect(h.onRestart).toHaveBeenCalledOnce()
    expect(h.onExport).toHaveBeenCalledOnce()
  })

  it('turns the primary button into Pause while playing and Replay when finished', () => {
    const h = handlers()
    const { rerender } = render(<WalkthroughControl view={view({ status: 'playing', progress: 0.5, elapsedS: 12 })} recordingSupported recording="off" exportNote="" {...h} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pause walkthrough' }))
    expect(h.onPause).toHaveBeenCalledOnce()
    rerender(<WalkthroughControl view={view({ status: 'ended', progress: 1, elapsedS: 24 })} recordingSupported recording="off" exportNote="" {...h} />)
    expect(screen.getByRole('button', { name: 'Replay walkthrough' })).toBeTruthy()
  })

  it('hides recording and says so when the browser cannot capture video, keeping export', () => {
    render(<WalkthroughControl view={view()} recordingSupported={false} recording="off" exportNote="" {...handlers()} />)
    expect(screen.queryByRole('button', { name: /record the walkthrough/i })).toBeNull()
    expect(screen.getByText(/Video recording is not available/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Export walkthrough manifest/ })).toBeTruthy()
  })

  it('reports reduced-motion stepping and exposes recording as a pressed toggle', () => {
    render(<WalkthroughControl view={view({ stepped: true })} recordingSupported recording="armed" exportNote="" {...handlers()} />)
    expect(screen.getByText(/Reduced motion: stepped viewpoints/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /record the walkthrough/i }).getAttribute('aria-pressed')).toBe('true')
  })
})
