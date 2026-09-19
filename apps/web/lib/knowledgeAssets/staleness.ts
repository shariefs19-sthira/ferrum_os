import type { Citation, SourceRecord } from './types'
import { isSuperseded } from './citation'

export type Dependency = {
  id: string
  tenantId: string
  citations: Citation[]
  /** Ids of other dependencies this one is derived from. */
  dependsOn: string[]
}

export type DependencyState = 'FRESH' | 'STALE' | 'UNKNOWN'
export type DependencyStatus = { state: DependencyState; reasons: string[] }

/**
 * Direct + transitive staleness. STALE when a cited source was superseded or changed;
 * UNKNOWN when a cited source is missing; and inherits STALE/UNKNOWN from anything it
 * depends on. Pure; tolerates cycles.
 */
export function evaluateDependencies(deps: Dependency[], sources: SourceRecord[]): Record<string, DependencyStatus> {
  const out = new Map<string, DependencyStatus>()
  const rank = { FRESH: 0, UNKNOWN: 1, STALE: 2 } as const

  // Direct state from cited sources.
  for (const dep of deps) {
    const tenantSources = sources.filter((s) => s.tenantId === dep.tenantId)
    let state: DependencyState = 'FRESH'
    const reasons: string[] = []
    const bump = (s: DependencyState) => {
      if (rank[s] > rank[state]) state = s
    }
    for (const c of dep.citations) {
      const src = tenantSources.find((s) => s.id === c.sourceId)
      if (!src || c.tenantId !== dep.tenantId) {
        bump('UNKNOWN')
        reasons.push(`source ${c.sourceId} unavailable`)
      } else if (src.contentHash !== c.contentHash || src.edition !== c.edition) {
        bump('STALE')
        reasons.push(`source ${c.sourceId} changed since cited`)
      } else if (isSuperseded(src, tenantSources)) {
        bump('STALE')
        reasons.push(`source ${c.sourceId} edition ${src.edition} superseded`)
      }
    }
    out.set(dep.id, { state, reasons })
  }

  // Propagate to dependents until fixpoint (order-independent, cycle-safe).
  let changed = true
  while (changed) {
    changed = false
    for (const dep of deps) {
      const cur = out.get(dep.id)!
      for (const up of dep.dependsOn) {
        const upState = out.get(up)?.state ?? 'UNKNOWN'
        const reason = `upstream ${up} is ${upState}`
        if (rank[upState] > rank[cur.state]) {
          cur.state = upState
          changed = true
        }
        if (upState !== 'FRESH' && !cur.reasons.includes(reason)) {
          cur.reasons.push(reason)
          changed = true
        }
      }
    }
  }
  return Object.fromEntries(out)
}
