import type { Citation, KnowledgeChunk, SourceRecord, Unknown } from './types'

export type ResolvedCitation = { status: 'RESOLVED'; source: SourceRecord; chunk: KnowledgeChunk }

/** The newest same-tenant edition of the source's series that is newer than it, if any. */
export function newerEdition(source: SourceRecord, sources: SourceRecord[]): SourceRecord | null {
  const newer = sources
    .filter((s) => s.tenantId === source.tenantId && s.seriesId === source.seriesId && s.editionDate > source.editionDate)
    .sort((a, b) => (a.editionDate < b.editionDate ? 1 : -1))
  return newer[0] ?? null
}

export const isSuperseded = (source: SourceRecord, sources: SourceRecord[]): boolean =>
  newerEdition(source, sources) !== null

/** Why the source's rights attestation is unusable on `today` (ISO date), or null when in force. */
export function rightsProblem(source: SourceRecord, today: string): string | null {
  if (source.rights.revokedAt) return 'rights revoked'
  if (source.rights.expiresAt && today > source.rights.expiresAt) return 'rights expired'
  return null
}

export const todayIso = (): string => new Date().toISOString().slice(0, 10)

export function makeCitation(source: SourceRecord, chunk: KnowledgeChunk): Citation {
  return {
    tenantId: source.tenantId,
    sourceId: source.id,
    edition: source.edition,
    contentHash: source.contentHash,
    locator: chunk.locator,
  }
}

const sameLocator = (a: Citation['locator'], b: Citation['locator']) =>
  a.page === b.page && a.clause === b.clause && a.table === b.table && a.equation === b.equation

/**
 * Resolves a citation against the caller's tenant only. Edition- and hash-specific:
 * a citation to a replaced file or edition does not silently resolve to the new one.
 */
export function resolveCitation(
  citation: Citation,
  tenantId: string,
  sources: SourceRecord[],
  chunks: KnowledgeChunk[],
  today: string = todayIso(),
): ResolvedCitation | Unknown {
  if (citation.tenantId !== tenantId) return { status: 'UNKNOWN', reasons: ['citation belongs to a different tenant'] }
  const source = sources.find((s) => s.tenantId === tenantId && s.id === citation.sourceId)
  if (!source) return { status: 'UNKNOWN', reasons: ['source not found'] }
  const rp = rightsProblem(source, today)
  if (rp) return { status: 'UNKNOWN', reasons: [rp] }
  if (source.edition !== citation.edition) return { status: 'UNKNOWN', reasons: ['edition mismatch'] }
  if (source.contentHash !== citation.contentHash) return { status: 'UNKNOWN', reasons: ['content hash mismatch'] }
  const chunk = chunks.find(
    (c) => c.tenantId === tenantId && c.sourceId === source.id && sameLocator(c.locator, citation.locator),
  )
  if (!chunk) return { status: 'UNKNOWN', reasons: ['locator does not resolve to extracted content'] }
  return { status: 'RESOLVED', source, chunk }
}
