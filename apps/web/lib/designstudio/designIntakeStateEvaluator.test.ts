import { describe, expect, it } from 'vitest'
import {
  computeStaleImpact,
  evaluateIntakeState,
  type IntakeMetadataPresence,
} from './designIntakeStateEvaluator'

const fullMetadata: IntakeMetadataPresence = {
  hasUnits: true,
  hasCRS: true,
  hasDatum: true,
  hasOrigin: true,
  hasRevisionId: true,
}

const noMetadata: IntakeMetadataPresence = {
  hasUnits: false,
  hasCRS: false,
  hasDatum: false,
  hasOrigin: false,
  hasRevisionId: false,
}

describe('design intake-state evaluator', () => {
  it('flags an unrecognized format instead of guessing a state', () => {
    const result = evaluateIntakeState({ formatId: 'not-a-format', metadata: noMetadata, detectedWarnings: [] })
    expect(result.formatRecognized).toBe(false)
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.blockedReasons[0]).toContain('not in the design-import compatibility registry')
  })

  it('reaches VALIDATED for IFC when every required field is present and no blocking warnings exist', () => {
    const result = evaluateIntakeState({ formatId: 'ifc', metadata: fullMetadata, detectedWarnings: [] })
    expect(result.achievedState).toBe('VALIDATED')
    expect(result.missingRequirements).toEqual([])
    expect(result.blockingWarnings).toEqual([])
  })

  it('caps every format at VALIDATED — APPROVED_FOR_MACHINE is unreachable fleet-wide today', () => {
    for (const formatId of ['ifc', 'dxf', 'landxml', 'gbxml', 'step', 'stl', 'obj', 'gltf', 'csv']) {
      const result = evaluateIntakeState({ formatId, metadata: fullMetadata, detectedWarnings: [] })
      expect(result.achievedState).not.toBe('APPROVED_FOR_MACHINE')
      expect(result.formatCeiling).toBe('VALIDATED')
      expect(result.blockedReasons.some((r) => r.includes('no verified native geometry parser'))).toBe(true)
    }
  })

  it('stays at PREVIEWED for a reference-only format (RVT) no matter what metadata is supplied', () => {
    const result = evaluateIntakeState({ formatId: 'rvt', metadata: fullMetadata, detectedWarnings: [] })
    expect(result.formatCeiling).toBe('PREVIEWED')
    expect(result.achievedState).toBe('PREVIEWED')
  })

  it('stays at PREVIEWED for a metadata-only format (DWG) since geometry cannot be validated', () => {
    const result = evaluateIntakeState({ formatId: 'dwg', metadata: fullMetadata, detectedWarnings: [] })
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.blockedReasons.some((r) => r.includes('DWG'))).toBe(false) // reason cites the format label, not the id
  })

  it('blocks VALIDATED on missing required metadata and names the specific field', () => {
    const result = evaluateIntakeState({ formatId: 'ifc', metadata: noMetadata, detectedWarnings: [] })
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.missingRequirements.map((m) => m.field)).toEqual(
      expect.arrayContaining(['hasUnits', 'hasCRS', 'hasDatum', 'hasOrigin', 'hasRevisionId'])
    )
  })

  it('blocks VALIDATED on a blocking geometry warning even when all metadata is present', () => {
    const result = evaluateIntakeState({ formatId: 'stl', metadata: fullMetadata, detectedWarnings: ['NON_MANIFOLD_MESH'] })
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.blockingWarnings).toEqual(['NON_MANIFOLD_MESH'])
  })

  it('does not let an advisory warning block VALIDATED', () => {
    const result = evaluateIntakeState({ formatId: 'stl', metadata: fullMetadata, detectedWarnings: ['DUPLICATE_VERTICES'] })
    expect(result.achievedState).toBe('VALIDATED')
    expect(result.advisoryWarnings).toEqual(['DUPLICATE_VERTICES'])
  })

  it('routes a warning not applicable to the format into unsupportedWarnings rather than silently dropping it', () => {
    const result = evaluateIntakeState({ formatId: 'csv', metadata: fullMetadata, detectedWarnings: ['NON_MANIFOLD_MESH'] })
    expect(result.unsupportedWarnings).toEqual(['NON_MANIFOLD_MESH'])
    expect(result.blockingWarnings).toEqual([])
  })

  it('does not require CRS/datum for a mesh format that structurally cannot carry them', () => {
    const result = evaluateIntakeState({
      formatId: 'obj',
      metadata: { hasUnits: true, hasCRS: false, hasDatum: false, hasOrigin: true, hasRevisionId: false },
      detectedWarnings: [],
    })
    expect(result.achievedState).toBe('VALIDATED')
  })
})

describe('downstream stale-impact rules', () => {
  it('marks every downstream consumer of a format stale on a revision bump', () => {
    const result = computeStaleImpact('ifc', 'REVISION_BUMP')
    expect(result.staleArtifacts).toEqual(
      expect.arrayContaining(['STRUCTURAL_MODEL', 'CLASH_REPORT', 'BOQ_TAKEOFF', 'COST_ESTIMATE', 'COMPLIANCE_CHECK', 'RENDER_CACHE'])
    )
    expect(result.reason).toContain('IFC')
  })

  it('produces no stale artifacts for a format with no registered downstream consumers', () => {
    const result = computeStaleImpact('rvt', 'FILE_REPLACED')
    expect(result.staleArtifacts).toEqual([])
    expect(result.reason).toContain('no registered downstream consumers')
  })

  it('flags an unrecognized format rather than guessing a downstream impact', () => {
    const result = computeStaleImpact('not-a-format', 'APPROVAL_DOWNGRADE')
    expect(result.staleArtifacts).toEqual([])
    expect(result.reason).toContain('not in the design-import compatibility registry')
  })

  it('cascades a new blocking warning to every downstream consumer, same as any other change kind', () => {
    const result = computeStaleImpact('csv', 'NEW_BLOCKING_WARNING')
    expect(result.staleArtifacts).toEqual(expect.arrayContaining(['BOQ_TAKEOFF', 'COST_ESTIMATE', 'CONSTRUCTION_SCHEDULE']))
  })
})
