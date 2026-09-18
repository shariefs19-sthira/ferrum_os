import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MapComposerGate from './MapComposerGate'

describe('LandIntel Map Composer quality gate', () => {
  it('shows every required check and keeps export blocked', () => {
    render(<MapComposerGate />)
    expect(screen.getByLabelText('Map export status').textContent).toContain('BLOCKED · 0 / 11 checks passed')
    expect(screen.getAllByText('Required')).toHaveLength(11)
    expect(screen.getByText('Purpose & analysis subject')).toBeTruthy()
    expect(screen.getByText('Verified project boundary')).toBeTruthy()
    expect(screen.getByText('Geometry-derived scale & units')).toBeTruthy()
    expect(screen.getByText('Correct north orientation')).toBeTruthy()
    expect(screen.getByText('CRS / EPSG identification')).toBeTruthy()
    expect(screen.getByText('Sources & observation dates')).toBeTruthy()
    expect(screen.getByText('Active-layer legend')).toBeTruthy()
    expect(screen.getByText('Location inset when required')).toBeTruthy()
    expect(screen.getByText('Collision-checked labels')).toBeTruthy()
    expect(screen.getByText('Confidence & UNKNOWN treatment')).toBeTruthy()
    expect(screen.getByText('INDICATIVE qualification')).toBeTruthy()
    expect(screen.getByText(/export generation and quality-gate execution are not built yet/)).toBeTruthy()
  })
})
