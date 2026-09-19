import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SutraWorkflowStatus from './SutraWorkflowStatus'

describe('SutraWorkflowStatus', () => {
  it('keeps the workflow bounded, fail-closed, and explicitly stoppable', () => {
    render(<SutraWorkflowStatus />)
    expect(screen.getByText(/Server-only retrieval remains fail-closed/i)).toBeTruthy()
    expect(screen.getByText(/UNKNOWN — no source citation/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Prepare bounded review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Begin review' }))
    fireEvent.click(screen.getByRole('button', { name: 'Advance review' }))
    expect(screen.getByText(/Needs you:/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Stop workflow' }))
    expect(screen.getByText(/Stopped by human/i)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Human approve release' })).toBeNull()
  })
})
