import { describe, expect, it } from 'vitest'
import { evaluateIntakeTransition, PROFESSIONAL_TOOL_ADAPTERS, validateIntakeRecord, type ProfessionalToolIntake } from './professionalToolIntake'

const intake: ProfessionalToolIntake = {
  intakeId: 'intake-01',
  adapterId: 'revit-ifc',
  nativeFileName: 'coordination.ifc',
  nativeFileUri: 'workspace://project-7/native/coordination.ifc',
  nativeChecksum: `sha256:${'a'.repeat(64)}`,
  nativeRevision: 'P03',
  author: 'Architect A',
  sourceTool: 'REVIT',
  sourceToolVersion: 'declared-by-author',
  importedAt: '2026-09-19T12:00:00.000Z',
  units: 'metres',
  crs: 'EPSG:32643',
  horizontalDatum: 'WGS 84 / UTM zone 43N',
  verticalDatum: 'project datum declared by survey',
  bounds: { minX: 0, minY: 0, minZ: 0, maxX: 30, maxY: 20, maxZ: 12 },
  parsedEntityTypes: ['IfcWall', 'IfcSlab'],
  warnings: [],
  state: 'PREVIEWED',
  approvalRecordId: null,
  downstreamImpact: [{ product: 'BOQ Pro', artifactIds: ['boq-01'], effect: 'STALE' }],
}

describe('professional tool intake contract', () => {
  it('keeps every adapter non-live and identifies proprietary routes as gated', () => {
    expect(PROFESSIONAL_TOOL_ADAPTERS.every((adapter) => adapter.implementationState !== undefined)).toBe(true)
    expect(PROFESSIONAL_TOOL_ADAPTERS.filter((adapter) => ['REVIT', 'AUTOCAD', 'TEKLA', 'STAAD.PRO', 'ETABS'].includes(adapter.sourceTool)).every((adapter) => adapter.limitation.length > 20)).toBe(true)
    expect(PROFESSIONAL_TOOL_ADAPTERS.find((adapter) => adapter.sourceTool === 'AUTOCAD')?.implementationState).toBe('GATED PROPRIETARY CONNECTOR')
  })

  it('requires validation, engineering and issue evidence at their respective gates', () => {
    expect(evaluateIntakeTransition(intake, 'VALIDATED').allowed).toBe(false)
    expect(evaluateIntakeTransition(intake, 'VALIDATED', { validationReportId: 'VAL-1' }).allowed).toBe(true)
    expect(evaluateIntakeTransition({ ...intake, state: 'VALIDATED' }, 'ENGINEERING VERIFIED', { engineeringVerificationId: 'ENG-1' }).allowed).toBe(true)
    expect(evaluateIntakeTransition({ ...intake, state: 'ENGINEERING VERIFIED' }, 'APPROVED FOR ISSUE').allowed).toBe(false)
  })

  it('surfaces missing spatial metadata as UNKNOWN instead of accepting a render as validation', () => {
    expect(validateIntakeRecord(intake)).toEqual([])
    const warnings = validateIntakeRecord({ ...intake, units: null, crs: null, horizontalDatum: null, verticalDatum: null, bounds: null })
    expect(warnings).toEqual(['Units are UNKNOWN.', 'CRS is UNKNOWN.', 'Horizontal datum is UNKNOWN.', 'Vertical datum is UNKNOWN.', 'Model bounds are UNKNOWN.'])
  })
})
