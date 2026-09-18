import { describe, expect, it } from 'vitest'
import {
  effectiveArtifactStatus,
  evaluateFreezeTransition,
  measureDeliverableCoverage,
  type DerivedArtifact,
  type EffectiveDerivedArtifact,
} from './canonicalProjectModel'

const artifact: DerivedArtifact = {
  artifactId: 'boq-01',
  product: 'BOQ Pro',
  artifactType: 'MEASURED_BOQ',
  sourceModelRevisionId: 'PM-003',
  sourceModelChecksum: `sha256:${'a'.repeat(64)}`,
  createdAt: '2026-09-19T10:00:00.000Z',
  owner: 'quantity-surveyor@example.test',
  status: 'SOURCE-VERIFIED',
  assumptions: ['Rates excluded.'],
  evidence: [],
}

describe('canonical project model graph', () => {
  it('derives staleness from both source revision and checksum', () => {
    expect(effectiveArtifactStatus(artifact, { revisionId: 'PM-003', checksum: artifact.sourceModelChecksum }).effectiveStatus).toBe('SOURCE-VERIFIED')
    const stale = effectiveArtifactStatus(artifact, { revisionId: 'PM-004', checksum: `sha256:${'b'.repeat(64)}` })
    expect(stale.effectiveStatus).toBe('STALE UPSTREAM DATA')
    expect(stale.staleReason).toContain('PM-004')
  })

  it('requires sequential, evidenced release gates', () => {
    expect(evaluateFreezeTransition('CONCEPT FROZEN', 'ENGINEERING VERIFIED').allowed).toBe(false)
    expect(evaluateFreezeTransition('COORDINATION FROZEN', 'ENGINEERING VERIFIED').allowed).toBe(false)
    expect(evaluateFreezeTransition('COORDINATION FROZEN', 'ENGINEERING VERIFIED', { structuralVerificationId: 'STR-88' }).allowed).toBe(true)
    expect(evaluateFreezeTransition('APPROVED FOR ISSUE', 'FABRICATION/CONSTRUCTION RELEASED', { releaseAuthorizationId: 'REL-09' }).allowed).toBe(true)
    expect(evaluateFreezeTransition('APPROVED FOR ISSUE', 'COORDINATION FROZEN').reasons).toContain('A released revision is immutable; create a successor revision instead of moving it backwards.')
  })

  it('measures required, current and coordinated coverage without rewarding duplicate output', () => {
    const current = effectiveArtifactStatus(artifact, { revisionId: 'PM-003', checksum: artifact.sourceModelChecksum })
    const duplicate = { ...current, artifactType: 'MEASURED_BOQ_COPY' }
    const stale: EffectiveDerivedArtifact = { ...current, artifactId: 'fea-01', product: 'Structura/FEA', effectiveStatus: 'STALE UPSTREAM DATA', staleReason: 'revision changed' }
    const result = measureDeliverableCoverage({
      requiredArtifactIds: ['boq-01', 'fea-01', 'issue-sheet-01'],
      coordinatedArtifactIds: ['boq-01', 'boq-01', 'fea-01'],
      artifacts: [current, duplicate, stale],
    })
    expect(result).toMatchObject({ required: 3, current: 1, sourceVerified: 1, coordinated: 1, stale: 1, unknown: 1 })
    expect(result.currentCoveragePercent).toBe(33.33)
  })
})
