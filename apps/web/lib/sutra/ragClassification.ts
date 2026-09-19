// SUTRA read-only knowledge access - data classification.
//
// Fragments carry an explicit classification assigned upstream at
// ingestion (by whatever process seeds the knowledge base / project
// store); this module never infers classification from content itself,
// so every decision here stays a deterministic policy check over
// declared metadata, not a heuristic content scan.

export type DataClassification = 'PUBLIC' | 'PROJECT_SENSITIVE' | 'PERSONAL' | 'RESTRICTED'

export const dataClassifications: readonly DataClassification[] = [
  'PUBLIC',
  'PROJECT_SENSITIVE',
  'PERSONAL',
  'RESTRICTED',
]

const CLASSIFICATION_RANK: Record<DataClassification, number> = {
  PUBLIC: 0,
  PROJECT_SENSITIVE: 1,
  PERSONAL: 2,
  RESTRICTED: 3,
}

export function classificationRank(classification: DataClassification): number {
  return CLASSIFICATION_RANK[classification]
}

/** True when `classification` is at least as sensitive as `floor`. */
export function meetsOrExceeds(classification: DataClassification, floor: DataClassification): boolean {
  return classificationRank(classification) >= classificationRank(floor)
}

export type RetrievalCitation = {
  sourceName: string
  sourceUri: string
  clauseOrLocator: string
}

export type KnowledgeFragment = {
  fragmentId: string
  sourceId: string
  classification: DataClassification
  /** null for global/PUBLIC fragments that belong to no single tenant. */
  tenantId: string | null
  /** null for fragments not scoped below the tenant level. */
  projectId: string | null
  content: string
  citation: RetrievalCitation
}

/** PROJECT_SENSITIVE, PERSONAL and RESTRICTED fragments only exist inside a tenant/project boundary. */
export function isTenantScoped(fragment: KnowledgeFragment): boolean {
  return fragment.classification !== 'PUBLIC'
}

/**
 * A tenant-scoped fragment is only visible from inside the tenant (and,
 * where set, the project) it belongs to. PUBLIC fragments are always
 * visible - they carry no tenant boundary to cross.
 */
export function isVisibleToTenant(
  fragment: KnowledgeFragment,
  tenantId: string | null,
  projectId: string | null,
): boolean {
  if (!isTenantScoped(fragment)) return true
  if (fragment.tenantId === null) return false
  if (fragment.tenantId !== tenantId) return false
  if (fragment.projectId !== null && fragment.projectId !== projectId) return false
  return true
}
