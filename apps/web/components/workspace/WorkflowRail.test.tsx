import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import WorkflowRail from './WorkflowRail'

describe('WorkflowRail', () => {
  it('presents seven outcome stages and keeps secondary products behind disclosure', () => {
    render(<WorkflowRail activeProduct="Land" onProductChange={vi.fn()} />)
    const stages = screen.getAllByRole('list', { name: 'Project stages' })[0]
    expect(within(stages).getAllByRole('button')).toHaveLength(7)
    expect(screen.getAllByText('Quantities & cost').length).toBeGreaterThan(0)
    expect(screen.getAllByText('More workflows').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Community funding').length).toBeGreaterThan(0)
  })

  it('maps workflow selection onto the existing product callback', () => {
    const onProductChange = vi.fn()
    render(<WorkflowRail activeProduct="Land" onProductChange={onProductChange} />)
    fireEvent.click(screen.getAllByRole('button', { name: /Engineering\. Issue/i })[0])
    expect(onProductChange).toHaveBeenCalledWith('Structure')
  })

  it('shows stale upstream data only when supplied by project state', () => {
    render(<WorkflowRail activeProduct="Cost" staleProducts={['Cost']} onProductChange={vi.fn()} />)
    expect(screen.getAllByLabelText('Evidence status: STALE UPSTREAM DATA').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Quantities & cost\. Stale/i }).length).toBeGreaterThan(0)
  })

  it('keeps the same lifecycle and specialist destinations in the mobile disclosure', () => {
    render(<WorkflowRail activeProduct="Land" onProductChange={vi.fn()} />)
    expect(screen.getByLabelText('2 ready, 0 stale, 5 issues')).toBeTruthy()
    for (const label of ['Site', 'Design', 'Engineering', 'Quantities & cost', 'Procurement', 'Delivery', 'Evidence & approvals']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
    for (const label of ['Market signals', 'Investment analysis', 'Community funding']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    }
  })
})
