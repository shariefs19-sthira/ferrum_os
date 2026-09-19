import type { RightsBasis, SourceRecord } from './types'

const BASES: RightsBasis[] = ['OWNED', 'LICENSED', 'PUBLIC_DOMAIN', 'PERMISSION_GRANTED']
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SHA256 = /^[0-9a-f]{64}$/

const isDate = (v: unknown): v is string =>
  typeof v === 'string' && ISO_DATE.test(v) && !Number.isNaN(Date.parse(v))
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

export type SourceValidation =
  | { ok: true; record: SourceRecord }
  | { ok: false; errors: string[] }

/** Validates untrusted input into a SourceRecord. Rejects rather than defaulting. */
export function validateSourceRecord(input: unknown): SourceValidation {
  const errors: string[] = []
  const r = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  for (const key of ['id', 'tenantId', 'seriesId', 'title', 'edition', 'jurisdiction'] as const) {
    if (!nonEmpty(r[key])) errors.push(`${key} is required`)
  }
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
    if (!isDate(rights.attestedAt)) errors.push('rights.attestedAt must be an ISO date')
    if (!nonEmpty(rights.statement)) errors.push('rights.statement is required')
  }
  if (errors.length) return { ok: false, errors }
  return { ok: true, record: input as SourceRecord }
}
