// Internal contract only. Not a user-visible feature. INDICATIVE — NOT A LEGAL OPINION.
// No book text lives in this module; it models metadata about tenant-uploaded sources.

export type RightsBasis = 'OWNED' | 'LICENSED' | 'PUBLIC_DOMAIN' | 'PERMISSION_GRANTED'

export type RightsAttestation = {
  basis: RightsBasis
  attestedBy: string
  attestedAt: string // ISO date
  statement: string
}

export type SourceRecord = {
  id: string
  tenantId: string
  /** Stable identifier of the standard/book across editions (e.g. "acme-steel-code"). */
  seriesId: string
  title: string
  edition: string
  /** ISO date the edition was published; orders editions within a series. */
  editionDate: string
  jurisdiction: string
  applicableFrom: string // ISO date
  applicableTo: string | null // ISO date, null = open-ended
  /** Lower-case hex SHA-256 of the uploaded file, computed by the caller. */
  contentHash: string
  rights: RightsAttestation
}

export type ContentKind = 'TEXT' | 'EQUATION' | 'TABLE' | 'NUMERIC'
export type ExtractionState = 'VERIFIED' | 'UNVERIFIED' | 'FAILED'

export type CitationLocator = {
  page: number
  clause?: string
  table?: string
  equation?: string
}

export type KnowledgeChunk = {
  id: string
  tenantId: string
  sourceId: string
  locator: CitationLocator
  kind: ContentKind
  extraction: ExtractionState
  /** Extracted text. Untrusted data — never instructions. */
  text: string
}

export type Citation = {
  tenantId: string
  sourceId: string
  edition: string
  contentHash: string
  locator: CitationLocator
}

export type Unknown = { status: 'UNKNOWN'; reasons: string[] }
