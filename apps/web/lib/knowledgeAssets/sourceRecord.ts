import type { RightsBasis, SourceRecord } from './types'

const BASES: RightsBasis[] = ['OWNED', 'LICENSED', 'PUBLIC_DOMAIN', 'PERMISSION_GRANTED']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SHA256 = /^[0-9a-f]{64}$/

export const MAX_ID_LEN = 128
export const MAX_TITLE_LEN = 300
export const MAX_STATEMENT_LEN = 2000

/** Strict calendar date: the string must round-trip through UTC (rejects 2026-02-31). */
export function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}
const isDate = isIsoDate
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const within = (v: unknown, max: number) => typeof v === 'string' && v.length <= max

export type SourceValidation =
  | { ok: true; record: SourceRecord }
  | { ok: false; errors: string[] }

/**
 * Validates untrusted input into a SourceRecord. Rejects rather than defaulting.
 * tenantId comes from the authenticated caller, never from the payload: a payload
 * tenantId that is present and different is rejected. Only allow-listed fields are copied.
 */
export function validateSourceRecord(input: unknown, tenantId: string): SourceValidation {
  const errors: string[] = []
  const r = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  if (!nonEmpty(tenantId)) errors.push('authenticated tenantId is required')
  else if (r.tenantId !== undefined && r.tenantId !== tenantId) {
    errors.push('tenantId does not match authenticated tenant')
  }
  for (const key of ['id', 'seriesId', 'edition', 'jurisdiction'] as const) {
    if (!nonEmpty(r[key])) errors.push(`${key} is required`)
    else if (!within(r[key], MAX_ID_LEN)) errors.push(`${key} exceeds ${MAX_ID_LEN} characters`)
  }
  if (!nonEmpty(r.title)) errors.push('title is required')
  else if (!within(r.title, MAX_TITLE_LEN)) errors.push(`title exceeds ${MAX_TITLE_LEN} characters`)
  if (!isDate(r.editionDate)) errors.push('editionDate must be an ISO date (YYYY-MM-DD)')
  if (!isDate(r.applicableFrom)) errors.push('applicableFrom must be an ISO date (YYYY-MM-DD)')
  if (r.applicableTo !== null && !isDate(r.applicableTo)) errors.push('applicableTo must be an ISO date or null')
  if (isDate(r.applicableFrom) && isDate(r.applicableTo) && r.applicableTo < r.applicableFrom) {
    errors.push('applicableTo precedes applicableFrom')
  }
  if (typeof r.contentHash !== 'string' || !SHA256.test(r.contentHash)) {
    errors.push('contentHash must be a lower-case hex SHA-256')
  }
  const rights = (r.rights && typeof r.rights === 'object' ? r.rights : null) as Record<string, unknown> | null
  if (!rights) {
    errors.push('rights attestation is required')
  } else {
    if (!BASES.includes(rights.basis as RightsBasis)) errors.push('rights.basis is invalid')
    if (!nonEmpty(rights.attestedBy)) errors.push('rights.attestedBy is required')
    else if (!within(rights.attestedBy, MAX_ID_LEN)) errors.push(`rights.attestedBy exceeds ${MAX_ID_LEN} characters`)
    if (!isDate(rights.attestedAt)) errors.push('rights.attestedAt must be an ISO date')
    if (!nonEmpty(rights.statement)) errors.push('rights.statement is required')
    else if (!within(rights.statement, MAX_STATEMENT_LEN)) {
      errors.push(`rights.statement exceeds ${MAX_STATEMENT_LEN} characters`)
    }
    for (const k of ['expiresAt', 'revokedAt'] as const) {
      if (rights[k] != null && !isDate(rights[k])) errors.push(`rights.${k} must be an ISO date or null`)
    }
  }
  if (errors.length || !rights) return { ok: false, errors }
  const record: SourceRecord = {
    id: r.id as string,
    tenantId,
    seriesId: r.seriesId as string,
    title: r.title as string,
    edition: r.edition as string,
    editionDate: r.editionDate as string,
    jurisdiction: r.jurisdiction as string,
    applicableFrom: r.applicableFrom as string,
    applicableTo: r.applicableTo as string | null,
    contentHash: r.contentHash as string,
    rights: {
      basis: rights.basis as RightsBasis,
      attestedBy: rights.attestedBy as string,
      attestedAt: rights.attestedAt as string,
      statement: rights.statement as string,
      expiresAt: (rights.expiresAt as string | null | undefined) ?? null,
      revokedAt: (rights.revokedAt as string | null | undefined) ?? null,
    },
  }
  return { ok: true, record }
}
