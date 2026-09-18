import { beforeEach, describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { appendBoqRevision, readBoqRevisionHistory, readOrInitializeBoqRevisionHistory, setLatestCheckerStatus, BOQ_REVISION_HISTORY_KEY } from './boqRevisionHistory'

const plan3Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
const plan4Floors = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 4 })

beforeEach(() => {
  window.localStorage.removeItem(BOQ_REVISION_HISTORY_KEY)
})

describe('boq revision history persistence', () => {
  it('starts empty and appends the first revision on first read', () => {
    expect(readBoqRevisionHistory()).toEqual([])
    const { history, latest } = appendBoqRevision(plan3Floors)
    expect(history).toHaveLength(1)
    expect(latest.revisionId).toBe(1)
    expect(readBoqRevisionHistory()).toHaveLength(1)
  })

  it('preserves the previous revision when a new one is appended for changed geometry', () => {
    appendBoqRevision(plan3Floors)
    const { history, latest } = appendBoqRevision(plan4Floors)
    expect(history).toHaveLength(2)
    expect(latest.revisionId).toBe(2)
    expect(history[0].revisionId).toBe(1)
    expect(history[0].fingerprint).not.toBe(latest.fingerprint)
  })

  it('does not duplicate a revision when geometry is unchanged', () => {
    appendBoqRevision(plan3Floors)
    const { history } = appendBoqRevision(generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 }))
    expect(history).toHaveLength(1)
  })

  it('records a checker-status change on the latest revision without touching earlier ones', () => {
    appendBoqRevision(plan3Floors)
    appendBoqRevision(plan4Floors)
    const updated = setLatestCheckerStatus('CHECKED')
    expect(updated[0].checkerStatus).toBe('DRAFT')
    expect(updated[1].checkerStatus).toBe('CHECKED')
  })

  it('preserves a held revision when upstream geometry changes until recalculation is explicitly requested', () => {
    appendBoqRevision(plan3Floors)
    const held = readOrInitializeBoqRevisionHistory(plan4Floors)
    expect(held).toHaveLength(1)
    expect(held[0].fingerprint).not.toBe(appendBoqRevision(plan4Floors).latest.fingerprint)
    expect(readBoqRevisionHistory()).toHaveLength(2)
  })
})
