import { describe, expect, it } from 'vitest'
import type { EvidenceValue } from '../modelIntake'
import {
  approvedForMachineUnreachableReason,
  computeStaleImpact,
  evaluateIntakeState,
  type IntakeParserEvidence,
  type ReviewRecord,
} from './designIntakeStateEvaluator'

const observed = <T>(value: T): EvidenceValue<T> => ({ status: 'OBSERVED', value, note: 'from a real parser' })
const userProvided = <T>(value: T): EvidenceValue<T> => ({ status: 'USER PROVIDED', value, note: 'uploader declaration, unverified' })
const unknown = <T>(): EvidenceValue<T> => ({ status: 'UNKNOWN', value: null as unknown as T, note: 'not implemented' })

/** Exactly what apps/web/lib/ifcIntake.ts produces for a fresh parse today: units + origin OBSERVED, revision USER PROVIDED, CRS + datum still UNKNOWN. */
const currentIfcParserEvidence: IntakeParserEvidence = {
  units: observed('METRE'),
  origin: observed([0, 0, 0]),
  revision: userProvided('R3'),
  crs: unknown(),
  datum: unknown(),
}

const fullyObservedEvidence: IntakeParserEvidence = {
  units: observed('METRE'),
  origin: observed([0, 0, 0]),
  revision: observed('R3'),
  crs: observed('EPSG:32643'),
  datum: observed('WGS84'),
}

const completeReview: ReviewRecord = {
  reviewer: 'A. Reviewer',
  reviewedAt: '2026-09-20T00:00:00.000Z',
  evidence: ['Cross-checked CRS against survey control.'],
  verifiedFields: ['crs', 'datum'],
}

describe('design intake-state evaluator — reconciled with the real IFC intake path', () => {
  it('flags an unrecognized format instead of guessing a state', () => {
    const result = evaluateIntakeState({ formatId: 'not-a-format', detectedWarnings: [] })
    expect(result.formatRecognized).toBe(false)
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.blockedReasons[0]).toContain('not in the design-import compatibility registry')
  })

  describe('current IFC capability (web-ifc 0.0.77, apps/web/lib/ifcIntake.ts)', () => {
    it('reaches only VALIDATION REQUIRED from a real fresh parse with no review — matching ifcIntake.ts exactly', () => {
      const result = evaluateIntakeState({ formatId: 'ifc', parserEvidence: currentIfcParserEvidence, detectedWarnings: [] })
      expect(result.achievedState).toBe('VALIDATION REQUIRED')
      expect(result.automatedCeiling).toBe('VALIDATION REQUIRED')
      expect(result.missingRequirements.map((m) => m.field)).toEqual(expect.arrayContaining(['crs', 'datum']))
    })

    it('stays at PREVIEWED before any parse has happened (no parserEvidence supplied)', () => {
      const result = evaluateIntakeState({ formatId: 'ifc', detectedWarnings: [] })
      expect(result.achievedState).toBe('PREVIEWED')
    })

    it('reaches VALIDATED only with full OBSERVED/reviewer-verified fields, no blocking warnings, and a complete review', () => {
      const result = evaluateIntakeState({
        formatId: 'ifc',
        parserEvidence: fullyObservedEvidence,
        detectedWarnings: [],
        review: completeReview,
      })
      expect(result.achievedState).toBe('VALIDATED')
      expect(result.missingRequirements).toEqual([])
    })

    it('still requires the reviewer to have verified CRS/datum specifically — parser-UNKNOWN fields left off verifiedFields keep it at VALIDATION REQUIRED', () => {
      // currentIfcParserEvidence leaves revision USER PROVIDED (not OBSERVED), and
      // completeReview.verifiedFields only names crs/datum, not revision — so this
      // reproduces today's ifcIntake.ts output plus a partial review, and must not
      // silently validate the un-reviewed revision field.
      const result = evaluateIntakeState({
        formatId: 'ifc',
        parserEvidence: currentIfcParserEvidence,
        detectedWarnings: [],
        review: completeReview,
      })
      expect(result.achievedState).toBe('VALIDATION REQUIRED')
      expect(result.missingRequirements.map((m) => m.field)).toEqual(['revision'])
    })

    it('never returns APPROVED FOR MACHINE, even with a full review and fully-observed evidence', () => {
      const result = evaluateIntakeState({ formatId: 'ifc', parserEvidence: fullyObservedEvidence, detectedWarnings: [], review: completeReview })
      expect(result.achievedState).not.toBe('APPROVED FOR MACHINE')
      expect(['PREVIEWED', 'VALIDATION REQUIRED', 'VALIDATED']).toContain(result.achievedState)
    })

    it('exports a stated, testable reason machine approval is never computed here', () => {
      expect(approvedForMachineUnreachableReason).toContain('APPROVED FOR MACHINE is not computed by this evaluator')
      expect(approvedForMachineUnreachableReason.length).toBeGreaterThan(0)
    })
  })

  describe('forged / caller-supplied metadata cannot manufacture VALIDATED', () => {
    it('does not reach VALIDATED from USER PROVIDED declarations alone, however complete, with no review', () => {
      const allUserProvided: IntakeParserEvidence = {
        units: userProvided('METRE'),
        crs: userProvided('EPSG:32643'),
        datum: userProvided('WGS84'),
        origin: userProvided([0, 0, 0]),
        revision: userProvided('R3'),
      }
      const result = evaluateIntakeState({ formatId: 'ifc', parserEvidence: allUserProvided, detectedWarnings: [] })
      expect(result.achievedState).toBe('VALIDATION REQUIRED')
      expect(result.missingRequirements.length).toBeGreaterThan(0)
    })

    it('does not reach VALIDATED from a fully-observed file plus an empty warnings list when no review is attached', () => {
      const result = evaluateIntakeState({ formatId: 'ifc', parserEvidence: fullyObservedEvidence, detectedWarnings: [] })
      expect(result.achievedState).toBe('VALIDATION REQUIRED')
      expect(result.blockedReasons.some((r) => r.includes('human ReviewRecord'))).toBe(true)
    })

    it('rejects an incomplete review record (no evidence entries) rather than treating its presence as enough', () => {
      const hollowReview: ReviewRecord = { reviewer: 'A. Reviewer', reviewedAt: '2026-09-20T00:00:00.000Z', evidence: [], verifiedFields: ['crs', 'datum'] }
      const result = evaluateIntakeState({ formatId: 'ifc', parserEvidence: fullyObservedEvidence, detectedWarnings: [], review: hollowReview })
      expect(result.achievedState).toBe('VALIDATION REQUIRED')
      expect(result.blockedReasons.some((r) => r.includes('incomplete'))).toBe(true)
    })

    it('ignores a forged OBSERVED claim for a format with no implemented parser — the registry, not caller input, decides the ceiling', () => {
      const forgedEvidence: IntakeParserEvidence = {
        units: observed('METRE'),
        crs: observed('EPSG:32643'),
        datum: observed('WGS84'),
        origin: observed([0, 0, 0]),
        revision: observed('R3'),
      }
      const result = evaluateIntakeState({ formatId: 'dxf', parserEvidence: forgedEvidence, detectedWarnings: [], review: completeReview })
      expect(result.achievedState).toBe('PREVIEWED')
      expect(result.blockedReasons[0]).toContain('no implemented parser')
    })
  })

  describe('unsupported formats remain truthfully capped at PREVIEWED', () => {
    it.each(['dxf', 'dwg', 'rvt', 'dgn', 'landxml', 'gbxml', 'bcf', 'saf', 'step', 'stl', 'obj', 'gltf', 'csv', 'pdf'])(
      '%s never exceeds PREVIEWED, even with a full review and no warnings',
      (formatId) => {
        const result = evaluateIntakeState({ formatId, detectedWarnings: [], review: completeReview })
        expect(result.achievedState).toBe('PREVIEWED')
        expect(result.formatCeiling).toBe('PREVIEWED')
        expect(result.automatedCeiling).toBe('PREVIEWED')
      }
    )

    it('stays at PREVIEWED for a reference-only format (RVT) no matter what is supplied', () => {
      const result = evaluateIntakeState({ formatId: 'rvt', detectedWarnings: [] })
      expect(result.achievedState).toBe('PREVIEWED')
    })

    it('stays at PREVIEWED for a metadata-only format (DWG) since geometry was never actually parsed', () => {
      const result = evaluateIntakeState({ formatId: 'dwg', detectedWarnings: [] })
      expect(result.achievedState).toBe('PREVIEWED')
    })
  })

  it('blocks VALIDATED on a blocking geometry warning even with full evidence and a complete review', () => {
    const result = evaluateIntakeState({
      formatId: 'ifc',
      parserEvidence: fullyObservedEvidence,
      detectedWarnings: ['DEGENERATE_GEOMETRY'],
      review: completeReview,
    })
    expect(result.achievedState).toBe('VALIDATION REQUIRED')
    expect(result.blockingWarnings).toEqual(['DEGENERATE_GEOMETRY'])
  })

  it('does not let an advisory warning block VALIDATED', () => {
    const result = evaluateIntakeState({
      formatId: 'ifc',
      parserEvidence: fullyObservedEvidence,
      detectedWarnings: ['NON_ORIGIN_ALIGNED'],
      review: completeReview,
    })
    expect(result.achievedState).toBe('VALIDATED')
    expect(result.advisoryWarnings).toEqual(['NON_ORIGIN_ALIGNED'])
  })

  it('routes a warning not applicable to the format into unsupportedWarnings rather than silently dropping it', () => {
    const result = evaluateIntakeState({
      formatId: 'ifc',
      parserEvidence: fullyObservedEvidence,
      detectedWarnings: ['NON_MANIFOLD_MESH'],
      review: completeReview,
    })
    expect(result.unsupportedWarnings).toEqual(['NON_MANIFOLD_MESH'])
  })

  it('a format with no implemented parser never even inspects supplied warnings — it is capped at PREVIEWED before that point', () => {
    const result = evaluateIntakeState({ formatId: 'csv', detectedWarnings: ['NON_MANIFOLD_MESH'] })
    expect(result.achievedState).toBe('PREVIEWED')
    expect(result.unsupportedWarnings).toEqual([])
    expect(result.blockingWarnings).toEqual([])
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
