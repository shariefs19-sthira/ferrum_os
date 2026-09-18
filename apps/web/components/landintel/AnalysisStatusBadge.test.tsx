import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AsyncAnalysisStatus, StaleBadge } from './AnalysisStatusBadge'

describe('LandIntel analysis status badges', () => {
  it('announces the explicit asynchronous lifecycle', () => {
    const { rerender } = render(<AsyncAnalysisStatus status="QUEUED" />)
    expect(screen.getByRole('status', { name: 'Deeper analysis: Queued' })).toBeTruthy()
    rerender(<AsyncAnalysisStatus status="RUNNING" />)
    expect(screen.getByRole('status', { name: 'Deeper analysis: Running' })).toBeTruthy()
    rerender(<AsyncAnalysisStatus status="COMPLETE" />)
    expect(screen.getByRole('status', { name: 'Deeper analysis: Completed' })).toBeTruthy()
    rerender(<AsyncAnalysisStatus status="FAILED" />)
    expect(screen.getByRole('status', { name: 'Deeper analysis: Failed' })).toBeTruthy()
  })

  it('renders STALE only when an output must be recomputed', () => {
    const { rerender } = render(<StaleBadge stale={false} />)
    expect(screen.queryByRole('status')).toBeNull()
    rerender(<StaleBadge stale />)
    expect(screen.getByRole('status', { name: /Stale: the active site has changed/ })).toBeTruthy()
  })
})
