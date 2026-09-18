import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ModelIntakeReport } from '../../lib/modelIntake'
import ModelIntakePanel from './ModelIntakePanel'

const report: ModelIntakeReport = {
  reportVersion: '1.0', state: 'VALIDATION REQUIRED',
  file: {
    name: 'coordination.ifc', sizeBytes: 1200, mediaType: 'application/x-step', sha256: 'abc123',
    revision: { status: 'USER PROVIDED', value: 'P03' }, source: { status: 'USER PROVIDED', value: 'Design team' },
    responsibleParty: { status: 'USER PROVIDED', value: 'Model manager' },
  },
  parser: { engine: 'web-ifc', engineVersion: '0.0.77', schema: { status: 'OBSERVED', value: 'IFC4' }, parsedAt: '2026-09-19T00:00:00Z' },
  spatialReference: {
    units: { status: 'OBSERVED', value: 'METRE' }, crs: { status: 'UNKNOWN', value: null },
    verticalDatum: { status: 'UNKNOWN', value: null }, origin: { status: 'OBSERVED', value: [0, 0, 0] },
    bounds: { status: 'UNKNOWN', value: null },
  },
  parsedObjectTypes: [{ type: 'IFCWALL', count: 12 }], unsupportedEntities: { status: 'NOT EVALUATED', value: null },
  geometryWarnings: ['Geometry not evaluated.'],
  previousRevisionComparison: { status: 'AWAITING PREVIOUS REVISION', previousRevision: null, note: 'Prior checksum required.' },
  approval: { state: 'VALIDATION REQUIRED', reviewer: null, reviewedAt: null, evidence: [] },
  downstreamConsumers: [{ product: 'Structura', state: 'BLOCKED', reason: 'Validation required.' }],
}

vi.mock('../../lib/ifcIntake', () => ({ inspectIfcFile: vi.fn(async () => report) }))

describe('OpenBIM model intake', () => {
  it('starts truthfully with no ingestion claim and all release states visible', () => {
    render(<ModelIntakePanel />)
    expect(screen.getByText('NO MODEL INGESTED')).toBeTruthy()
    expect(screen.getByText('IFC · AVAILABLE')).toBeTruthy()
    expect(screen.getByText('DXF · ROADMAP')).toBeTruthy()
    for (const state of ['UPLOADED', 'PREVIEWED', 'VALIDATION REQUIRED', 'VALIDATED', 'APPROVED FOR MACHINE', 'REJECTED']) {
      expect(screen.getByText(state)).toBeTruthy()
    }
    expect(screen.getByText('BLOCKED · 0 / 6')).toBeTruthy()
    expect(screen.getByText(/PARSE OR RENDER DOES NOT MEAN GEOGRAPHICALLY/)).toBeTruthy()
  })

  it('creates a report while keeping validation and consumers blocked', async () => {
    render(<ModelIntakePanel />)
    fireEvent.change(screen.getByLabelText('IFC file'), { target: { files: [new File(['ifc'], 'coordination.ifc')] } })
    fireEvent.change(screen.getByLabelText('Revision'), { target: { value: 'P03' } })
    fireEvent.change(screen.getByLabelText('Source organization'), { target: { value: 'Design team' } })
    fireEvent.change(screen.getByLabelText('Responsible party'), { target: { value: 'Model manager' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create intake report' }))
    await waitFor(() => expect(screen.getByText('abc123')).toBeTruthy())
    expect(screen.getByText('IFCWALL')).toBeTruthy()
    expect(screen.getByText('Structura')).toBeTruthy()
    expect(screen.getAllByText('BLOCKED').length).toBeGreaterThan(0)
    expect(screen.getByText(/Unsupported entities · NOT EVALUATED/)).toBeTruthy()
    expect(screen.getByText(/Approval state · NO REVIEWER/)).toBeTruthy()
    expect(screen.getByText(/Previous revision · AWAITING PREVIOUS REVISION/)).toBeTruthy()
  })
})
