import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MoreDrawer from './MoreDrawer'

describe('MoreDrawer', () => {
  it('renders nothing while closed', () => {
    render(<MoreDrawer open={false} onMoreAction={vi.fn()} onMoreOpenChange={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('sits above the workflow rail (z-[90]) and is capped to the viewport so Close stays reachable in short landscape', () => {
    render(<MoreDrawer open onMoreAction={vi.fn()} onMoreOpenChange={vi.fn()} />)
    const dialog = screen.getByRole('dialog', { name: 'More workspace options' })
    const overlay = dialog.parentElement as HTMLElement
    // Old classes were `z-50` (under the rail) and no max-height/overflow (Close at y=-90 at 667x375).
    expect(overlay.className).toContain('z-[95]')
    expect(overlay.className).not.toMatch(/(^|\s)z-50(\s|$)/)
    expect(dialog.className).toContain('max-h-[100dvh]')
    expect(dialog.className).toContain('overflow-y-auto')
  })

  it('closes from its own Close button, the scrim and Escape', () => {
    const onMoreOpenChange = vi.fn()
    render(<MoreDrawer open onMoreAction={vi.fn()} onMoreOpenChange={onMoreOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close more options' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onMoreOpenChange).toHaveBeenCalledTimes(3)
    expect(onMoreOpenChange).toHaveBeenCalledWith(false)
  })

  it('runs an action and closes', () => {
    const onMoreAction = vi.fn()
    const onMoreOpenChange = vi.fn()
    render(<MoreDrawer open onMoreAction={onMoreAction} onMoreOpenChange={onMoreOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Workspace help/ }))
    expect(onMoreAction).toHaveBeenCalledWith('help')
    expect(onMoreOpenChange).toHaveBeenCalledWith(false)
  })
})
