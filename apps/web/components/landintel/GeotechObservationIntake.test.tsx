import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GeotechObservationIntake, { currentObservationDate } from './GeotechObservationIntake'

describe('GeotechObservationIntake', () => {
  it('keeps the initial metadata-only record UNKNOWN and exposes every governed state', () => {
    const { container } = render(<GeotechObservationIntake />)
    expect(container.querySelector('[data-geotech-observation-intake]')?.textContent).toContain('Metadata only')
    expect(container.querySelector('[data-geotech-current-state]')?.textContent).toContain('UNKNOWN')
    for (const state of ['USER_PROVIDED', 'SOURCE_VERIFIED', 'INDICATIVE', 'UNKNOWN', 'STALE']) expect(screen.getAllByText(state).length).toBeGreaterThan(0)
    expect(screen.getByText(/does not upload or parse/i)).toBeTruthy()
    expect(screen.getByText(/bearing capacity/i)).toBeTruthy()
  })

  it('shows accessible validation errors and holds on invalid metadata', () => {
    const { container } = render(<GeotechObservationIntake />)
    fireEvent.click(screen.getByRole('button', { name: 'Validate metadata' }))
    expect(container.querySelector('[data-geotech-error-summary]')?.getAttribute('role')).toBe('alert')
    expect(screen.getByLabelText('Provider').getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText(/DesignStudio: HOLD/)).toBeTruthy()
    expect(screen.getByText(/Structura: HOLD/)).toBeTruthy()
    expect(screen.getByText(/BOQ: HOLD/)).toBeTruthy()
  })

  it('classifies complete unverified metadata as USER_PROVIDED without claiming release', () => {
    const { container } = render(<GeotechObservationIntake />)
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'Field lab' } })
    fireEvent.change(screen.getByLabelText('Provider role'), { target: { value: 'Testing laboratory' } })
    fireEvent.change(screen.getByLabelText('Field date'), { target: { value: '2026-09-01' } })
    fireEvent.change(screen.getByLabelText('Report or log reference'), { target: { value: 'BH-01' } })
    fireEvent.change(screen.getByLabelText('Source document SHA-256 checksum'), { target: { value: 'a'.repeat(64) } })
    fireEvent.click(screen.getByRole('button', { name: 'Validate metadata' }))
    expect(container.querySelector('[data-geotech-current-state]')?.textContent).toContain('USER_PROVIDED')
    expect(screen.getByText(/No automatic release is created/)).toBeTruthy()
  })

  it('reads the live UTC calendar date through an injectable clock at the day boundary', () => {
    expect(currentObservationDate(() => new Date('2026-09-19T23:59:59.999Z'))).toBe('2026-09-19')
    expect(currentObservationDate(() => new Date('2026-09-20T00:00:00.000Z'))).toBe('2026-09-20')
  })

  it('refreshes future-date validation after a form remains open across midnight', () => {
    let now = new Date('2026-09-19T23:59:59.999Z')
    const { container } = render(<GeotechObservationIntake clock={() => now} />)
    fireEvent.change(screen.getByLabelText('Provider'), { target: { value: 'Field lab' } })
    fireEvent.change(screen.getByLabelText('Provider role'), { target: { value: 'Testing laboratory' } })
    fireEvent.change(screen.getByLabelText('Field date'), { target: { value: '2026-09-20' } })
    fireEvent.change(screen.getByLabelText('Report or log reference'), { target: { value: 'BH-01' } })
    fireEvent.change(screen.getByLabelText('Source document SHA-256 checksum'), { target: { value: 'a'.repeat(64) } })
    fireEvent.click(screen.getByRole('button', { name: 'Validate metadata' }))
    expect(container.querySelector('[data-geotech-current-state]')?.textContent).toContain('UNKNOWN')
    expect(screen.getByText(/Field date cannot be in the future/i)).toBeTruthy()

    now = new Date('2026-09-20T00:00:00.000Z')
    fireEvent.click(screen.getByRole('button', { name: 'Validate metadata' }))
    expect(container.querySelector('[data-geotech-current-state]')?.textContent).toContain('USER_PROVIDED')
    expect(container.querySelector('[data-geotech-error-summary]')).toBeNull()
  })
})
