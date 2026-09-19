import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resetSafeStorageMemory,
  safeGet,
  safeGetJson,
  safeRemove,
  safeSessionGet,
  safeSessionRemove,
  safeSessionSet,
  safeSet,
} from './safeStorage'

const securityError = () => new DOMException('denied', 'SecurityError')
const quotaError = () => new DOMException('quota', 'QuotaExceededError')

/** Chrome "block all cookies and site data": the window.localStorage GETTER throws. */
function blockStorage(name: 'localStorage' | 'sessionStorage') {
  const original = Object.getOwnPropertyDescriptor(window, name)
  Object.defineProperty(window, name, { configurable: true, get() { throw securityError() } })
  return () => { if (original) Object.defineProperty(window, name, original) }
}

describe('safeStorage with healthy storage', () => {
  beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); resetSafeStorageMemory() })

  it('reads and writes the same keys and string values as raw localStorage', () => {
    expect(safeSet('k', 'v')).toBe(true)
    expect(window.localStorage.getItem('k')).toBe('v')
    window.localStorage.setItem('existing', '{"a":1}')
    expect(safeGet('existing')).toBe('{"a":1}')
    expect(safeGet('missing')).toBeNull()
  })

  it('removes from real storage', () => {
    window.localStorage.setItem('k', 'v')
    expect(safeRemove('k')).toBe(true)
    expect(window.localStorage.getItem('k')).toBeNull()
    expect(safeGet('k')).toBeNull()
  })

  it('has an independent session variant backed by sessionStorage', () => {
    expect(safeSessionSet('s', '1')).toBe(true)
    expect(window.sessionStorage.getItem('s')).toBe('1')
    expect(window.localStorage.getItem('s')).toBeNull()
    expect(safeSessionGet('s')).toBe('1')
    expect(safeSessionRemove('s')).toBe(true)
    expect(safeSessionGet('s')).toBeNull()
  })
})

describe('safeStorage when window.localStorage throws SecurityError (blocked site data)', () => {
  let restore: () => void
  beforeEach(() => { resetSafeStorageMemory(); restore = blockStorage('localStorage') })
  afterEach(() => { restore(); resetSafeStorageMemory() })

  it('never throws and reads null', () => {
    expect(() => safeGet('k')).not.toThrow()
    expect(safeGet('k')).toBeNull()
  })

  it('reports false from set/remove but keeps the value in memory for the session', () => {
    expect(safeSet('k', 'v')).toBe(false)
    expect(safeGet('k')).toBe('v')
    expect(safeRemove('k')).toBe(false)
    expect(safeGet('k')).toBeNull()
  })
})

describe('safeStorage when sessionStorage getter throws', () => {
  it('session variant degrades to memory without throwing', () => {
    resetSafeStorageMemory()
    const restore = blockStorage('sessionStorage')
    try {
      expect(safeSessionSet('s', '1')).toBe(false)
      expect(safeSessionGet('s')).toBe('1')
      expect(safeSessionRemove('s')).toBe(false)
      expect(safeSessionGet('s')).toBeNull()
    } finally { restore(); resetSafeStorageMemory() }
  })
})

describe('safeStorage when setItem throws QuotaExceededError', () => {
  beforeEach(() => { window.localStorage.clear(); resetSafeStorageMemory() })
  afterEach(() => { vi.restoreAllMocks(); resetSafeStorageMemory() })

  it('returns false, does not throw, and the latest write wins over the older stored value', () => {
    window.localStorage.setItem('k', 'old')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw quotaError() })
    expect(() => safeSet('k', 'new')).not.toThrow()
    expect(safeSet('k', 'new')).toBe(false)
    expect(safeGet('k')).toBe('new')
  })

  it('goes back to real storage once writes succeed again and drops the memory copy', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw quotaError() })
    safeSet('k', 'mem')
    spy.mockRestore()
    expect(safeSet('k', 'real')).toBe(true)
    expect(window.localStorage.getItem('k')).toBe('real')
    expect(safeGet('k')).toBe('real')
  })

  it('a throwing getItem reads as null', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw securityError() })
    expect(safeGet('k')).toBeNull()
  })

  it('a throwing removeItem is hidden by an in-memory tombstone', () => {
    window.localStorage.setItem('k', 'v')
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw securityError() })
    expect(safeRemove('k')).toBe(false)
    expect(safeGet('k')).toBeNull()
  })
})

describe('safeGetJson', () => {
  beforeEach(() => { window.localStorage.clear(); resetSafeStorageMemory() })

  it('parses stored JSON', () => {
    window.localStorage.setItem('j', '{"a":1}')
    expect(safeGetJson('j', { a: 0 })).toEqual({ a: 1 })
  })

  it('returns the fallback for garbage JSON and missing keys', () => {
    window.localStorage.setItem('j', '{not json')
    expect(safeGetJson('j', 'fb')).toBe('fb')
    expect(safeGetJson('absent', 'fb')).toBe('fb')
  })

  it('returns the fallback when storage is blocked', () => {
    const restore = blockStorage('localStorage')
    try { expect(safeGetJson('j', 7)).toBe(7) } finally { restore() }
  })
})
