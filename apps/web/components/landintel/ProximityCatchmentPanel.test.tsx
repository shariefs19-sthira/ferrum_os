import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProximityCatchmentPanel from './ProximityCatchmentPanel'

describe('LandIntel proximity catchment', () => {
  it('shows a dual-unit straight-line radius while keeping all POI categories UNKNOWN', () => {
    render(<ProximityCatchmentPanel />)

    expect(screen.getByText(/2\.00 km \(1\.24 mi\) · straight-line radius/)).toBeTruthy()
    expect(screen.getAllByText('UNKNOWN')).toHaveLength(5)
    expect(screen.getByText(/NOT A TRAVEL-TIME ANALYSIS/)).toBeTruthy()
    expect(screen.queryByText(/minutes/)).toBeNull()
  })

  it('keeps kilometre and mile inputs synchronized through one radius', () => {
    render(<ProximityCatchmentPanel />)

    fireEvent.change(screen.getByLabelText('Kilometres'), { target: { value: '5' } })
    expect(screen.getByText(/5\.00 km \(3\.11 mi\) · straight-line radius/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Miles' }))
    expect(screen.getByText(/3\.11 mi \(5\.00 km\) · straight-line radius/)).toBeTruthy()
  })
})
