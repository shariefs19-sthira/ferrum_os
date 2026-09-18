import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ModelIntakePanel from './ModelIntakePanel'

describe('model intake and controlled release panel', () => {
  it('shows the inspection workflow without claiming a model was parsed', () => {
    render(<ModelIntakePanel />)
    expect(screen.getByText('NO MODEL INGESTED')).toBeTruthy()
    expect(screen.getAllByText('Roadmap')).toHaveLength(8)
    expect(screen.getAllByText('UNKNOWN')).toHaveLength(10)
    expect(screen.getByText('Combined project model')).toBeTruthy()
    expect(screen.getByText('Hierarchy & visibility')).toBeTruthy()
    expect(screen.getByText('Plan, 3D & cross-section views')).toBeTruthy()
    expect(screen.getByText('Measurements & coordinate readout')).toBeTruthy()
    expect(screen.getByText('Revision overlays')).toBeTruthy()
    expect(screen.getByText('Design-versus-survey comparison')).toBeTruthy()
  })

  it('separates preview, validation and machine approval', () => {
    render(<ModelIntakePanel />)
    expect(screen.getByText('PREVIEWED')).toBeTruthy()
    expect(screen.getByText('VALIDATED')).toBeTruthy()
    expect(screen.getByText('APPROVED FOR MACHINE')).toBeTruthy()
    expect(screen.getByText('BLOCKED · 0 / 6 checks passed')).toBeTruthy()
    expect(screen.getByText(/PREVIEW DOES NOT MEAN VALIDATED OR APPROVED FOR MACHINE/)).toBeTruthy()
    expect(screen.getByText('Affected downstream consumers')).toBeTruthy()
  })
})

