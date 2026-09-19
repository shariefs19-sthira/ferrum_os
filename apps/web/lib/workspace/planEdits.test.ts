import { describe, expect, it } from 'vitest'
import { canRedo, canUndo, commitEdit, emptyPlanEdits, HISTORY_LIMIT, initHistory, redo, replaceHistory, undo } from './planEdits'

const withWall = (key: string, value: number) => ({ ...emptyPlanEdits(), wallOffsets: { [key]: value } })

describe('plan edit history', () => {
  it('undoes and redoes a wall move exactly', () => {
    let history = initHistory()
    history = commitEdit(history, withWall('int-v0', 1))
    history = commitEdit(history, withWall('int-v0', 2))
    expect(history.present.wallOffsets['int-v0']).toBe(2)
    history = undo(history)
    expect(history.present.wallOffsets['int-v0']).toBe(1)
    history = undo(history)
    expect(history.present).toEqual(emptyPlanEdits())
    expect(canUndo(history)).toBe(false)
    history = redo(redo(history))
    expect(history.present.wallOffsets['int-v0']).toBe(2)
    expect(canRedo(history)).toBe(false)
  })

  it('a new edit after undo clears redo', () => {
    let history = commitEdit(initHistory(), withWall('int-h0', 1))
    history = undo(history)
    history = commitEdit(history, withWall('int-h0', 3))
    expect(canRedo(history)).toBe(false)
  })

  it('ignores no-op commits and covers opening edits too', () => {
    const start = commitEdit(initHistory(), withWall('int-h0', 1))
    expect(commitEdit(start, withWall('int-h0', 1))).toBe(start)
    const next = commitEdit(start, { ...start.present, openingEdits: { 'f1-r0-door': { widthM: 1 } } })
    expect(undo(next).present.openingEdits).toEqual({})
  })

  it('caps history and drops it when state is replaced from outside', () => {
    let history = initHistory()
    for (let i = 1; i <= HISTORY_LIMIT + 10; i += 1) history = commitEdit(history, withWall('int-v1', i))
    expect(history.past).toHaveLength(HISTORY_LIMIT)
    expect(canUndo(replaceHistory(withWall('int-v1', 1)))).toBe(false)
    expect(undo(initHistory())).toEqual(initHistory())
  })
})
