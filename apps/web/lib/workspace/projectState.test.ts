import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PROJECT_STATE_EVENT, PROJECT_STATE_KEY, readProjectState, writeProjectState } from './projectState'

const fallback = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 }

describe('shared project state', () => {
  beforeEach(() => window.localStorage.clear())

  it('writes one versioned state and emits the same revision', () => {
    const listener = vi.fn()
    window.addEventListener(PROJECT_STATE_EVENT, listener)
    const state = writeProjectState({ ...fallback, floors: 5 }, 'test:design')
    expect(state.revision).toBe(1)
    expect(readProjectState(fallback).parameters.floors).toBe(5)
    expect(JSON.parse(window.localStorage.getItem(PROJECT_STATE_KEY) ?? '{}').source).toBe('test:design')
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual(state)
    window.removeEventListener(PROJECT_STATE_EVENT, listener)
  })

  it('rejects malformed state and preserves deterministic fallback', () => {
    window.localStorage.setItem(PROJECT_STATE_KEY, '{"version":1,"parameters":{"floors":"many"}}')
    expect(readProjectState(fallback).parameters).toEqual(fallback)
  })
})
