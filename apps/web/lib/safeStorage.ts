/**
 * Storage that never throws (RULE 44: browser storage may be unavailable or
 * throw at any time; no storage access may crash rendering).
 *
 * Chrome "block all cookies and site data" makes the `window.localStorage`
 * GETTER itself throw a SecurityError, so even `typeof window.localStorage`
 * can throw; quota / private-mode failures throw from `setItem`. Every access
 * here is wrapped, and values that could not be persisted are kept in a small
 * in-memory map so the feature keeps working for the current page session
 * (no persistence across reloads is the honest degradation).
 *
 * Reads: a value held in memory (because it could not be persisted) wins over
 * storage, since it is the most recent write. A key removed while storage was
 * refusing the removal is held as a `null` tombstone.
 */

export type StorageKind = 'local' | 'session'

const memory: Record<StorageKind, Map<string, string | null>> = {
  local: new Map(),
  session: new Map(),
}

function resolve(kind: StorageKind): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function get(kind: StorageKind, key: string): string | null {
  const held = memory[kind]
  if (held.has(key)) return held.get(key) ?? null
  try {
    return resolve(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

/** Returns true when the value reached real storage, false when it only lives in memory for this session. */
function set(kind: StorageKind, key: string, value: string): boolean {
  try {
    const storage = resolve(kind)
    if (storage) {
      storage.setItem(key, value)
      memory[kind].delete(key)
      return true
    }
  } catch {
    /* fall through to the in-memory copy */
  }
  memory[kind].set(key, value)
  return false
}

/** Returns true when the key is gone from real storage, false when only the in-memory tombstone hides it. */
function remove(kind: StorageKind, key: string): boolean {
  try {
    const storage = resolve(kind)
    if (storage) {
      storage.removeItem(key)
      memory[kind].delete(key)
      return true
    }
  } catch {
    /* fall through to the tombstone */
  }
  memory[kind].set(key, null)
  return false
}

export const safeGet = (key: string): string | null => get('local', key)
export const safeSet = (key: string, value: string): boolean => set('local', key, value)
export const safeRemove = (key: string): boolean => remove('local', key)

export const safeSessionGet = (key: string): string | null => get('session', key)
export const safeSessionSet = (key: string, value: string): boolean => set('session', key, value)
export const safeSessionRemove = (key: string): boolean => remove('session', key)

/** JSON read: returns `fallback` for missing, unreadable or unparsable values. */
export function safeGetJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Test hook: forget every in-memory fallback value. */
export function resetSafeStorageMemory(): void {
  memory.local.clear()
  memory.session.clear()
}
