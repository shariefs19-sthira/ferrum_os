/**
 * Spatial map-layer contract for LandIntel's geotechnical evidence
 * (apps/web/lib/landintel/geotechnicalIntelligence.ts). Every regional
 * evidence item and every project investigation input resolves to exactly
 * one map-layer category, so a map can render "what kind of thing is this"
 * without inventing geometry the underlying evidence doesn't have.
 *
 * This module renders nothing itself and adds no new evidence source -- it
 * is a pure, additive projection of the already-landed evidence/connector
 * contracts onto five spatial categories.
 */

import type {
  CoordinateReference,
  GeotechnicalEvidence,
  ProjectGeotechnicalInput,
  SpatialCoverage,
} from './geotechnicalIntelligence'
import { isParcelAnalysisStale, type ParcelContext } from '../workspace/parcelContext'

export type MapLayerCategory =
  | 'AUTHORITATIVE_COVERAGE'
  | 'PROJECT_INVESTIGATION_POINT'
  | 'CONFLICT'
  | 'STALE_AREA'
  | 'UNKNOWN_GAP'

export type MapLayerGeometry =
  | { kind: 'REGIONAL'; coverage: SpatialCoverage }
  | { kind: 'PROJECT_POINT'; coordinates: CoordinateReference }

export type MapLayerDisclosure = {
  source: string
  licence: string
  observationDate: string | null
  publicationDate: string | null
  resolutionOrScale: string
  transformationMethod: string
  jurisdiction: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  evidenceMethod: 'OBSERVED' | 'INFERRED' | 'MODELLED' | 'PROFESSIONAL_INTERPRETATION'
}

export type GeotechnicalMapLayerFeature = {
  id: string
  evidenceId: string
  label: string
  category: MapLayerCategory
  geometry: MapLayerGeometry
  disclosure: MapLayerDisclosure
}

/**
 * One evidence item maps to exactly one category, most-severe first: a
 * CONFLICT or STALE status always wins the categorisation regardless of
 * scope, so a stale or disputed project point is never shown as if it were
 * still an authoritative regional layer.
 */
export function categorizeEvidence(item: GeotechnicalEvidence): MapLayerCategory {
  if (item.status === 'CONFLICT') return 'CONFLICT'
  if (item.status === 'STALE UPSTREAM DATA') return 'STALE_AREA'
  if (item.scope === 'PROJECT_INVESTIGATION') return 'PROJECT_INVESTIGATION_POINT'
  if (item.status === 'UNKNOWN' || item.coverage.kind === 'UNKNOWN') return 'UNKNOWN_GAP'
  return 'AUTHORITATIVE_COVERAGE'
}

function disclosureFromEvidence(item: GeotechnicalEvidence): MapLayerDisclosure {
  return {
    source: item.lineage?.sourceUri ?? item.lineage?.sourceId ?? 'Not connected',
    licence: 'See the government source registry entry for this topic before treating this as licensed for reuse.',
    observationDate: item.lineage?.observationDate ?? null,
    publicationDate: item.lineage?.publicationDate ?? null,
    resolutionOrScale: item.coverage.kind === 'UNKNOWN' ? 'UNKNOWN' : item.coverage.label,
    transformationMethod: item.lineage?.transformationSteps.length ? item.lineage.transformationSteps.join(' → ') : 'None recorded',
    jurisdiction: item.coverage.label,
    confidence: item.confidence,
    evidenceMethod: item.method,
  }
}

function disclosureFromProjectInput(input: ProjectGeotechnicalInput, coordinates: CoordinateReference): MapLayerDisclosure {
  return {
    source: input.responsibleParty || 'Responsible party not recorded',
    licence: 'Project-owned investigation data; not a public/redistributable source.',
    observationDate: input.issueDate,
    publicationDate: null,
    resolutionOrScale: 'Point-scale field/laboratory record',
    transformationMethod: `Revision ${input.sourceRevision || 'UNKNOWN'}`,
    jurisdiction: coordinates.horizontalCrs || 'UNKNOWN',
    confidence: coordinates.horizontalCrs ? 'HIGH' : 'UNKNOWN',
    evidenceMethod: 'OBSERVED',
  }
}

/**
 * Projects regional evidence and project-investigation inputs onto the five
 * map-layer categories. Every project input with real coordinates becomes
 * its own PROJECT_INVESTIGATION_POINT feature, kept spatially distinct from
 * the regional evidence it sits inside -- a screening polygon is never
 * conflated with a real borehole point.
 */
export function buildGeotechnicalMapLayers(
  evidence: GeotechnicalEvidence[],
  projectInputs: ProjectGeotechnicalInput[] = [],
): GeotechnicalMapLayerFeature[] {
  const evidenceFeatures: GeotechnicalMapLayerFeature[] = evidence.map((item) => ({
    id: `evidence-${item.id}`,
    evidenceId: item.id,
    label: item.label,
    category: categorizeEvidence(item),
    geometry: { kind: 'REGIONAL', coverage: item.coverage },
    disclosure: disclosureFromEvidence(item),
  }))

  const investigationFeatures: GeotechnicalMapLayerFeature[] = projectInputs
    .filter((input): input is ProjectGeotechnicalInput & { coordinates: CoordinateReference } => input.coordinates !== null)
    .map((input) => ({
      id: `investigation-${input.id}`,
      evidenceId: input.id,
      label: input.title,
      category: 'PROJECT_INVESTIGATION_POINT',
      geometry: { kind: 'PROJECT_POINT', coordinates: input.coordinates },
      disclosure: disclosureFromProjectInput(input, input.coordinates),
    }))

  return [...evidenceFeatures, ...investigationFeatures]
}

/**
 * Reclassifies every non-CONFLICT feature to STALE_AREA once the site it was
 * generated for is no longer the active LandIntel site (downstream
 * invalidation on a boundary/context change). CONFLICT is left alone --
 * a disputed feature stays visibly disputed rather than being downgraded to
 * merely stale. Pass `generatedFor: null` when the caller doesn't know which
 * site produced these features; no reclassification happens in that case.
 */
export function withLiveStaleness(
  features: GeotechnicalMapLayerFeature[],
  generatedFor: ParcelContext | null,
): GeotechnicalMapLayerFeature[] {
  if (!generatedFor || !isParcelAnalysisStale(generatedFor)) return features
  return features.map((feature) => (feature.category === 'CONFLICT' ? feature : { ...feature, category: 'STALE_AREA' as const }))
}

export const mapLayerLegend: Record<MapLayerCategory, { label: string; description: string }> = {
  AUTHORITATIVE_COVERAGE: { label: 'Authoritative mapped coverage', description: 'A declared government/authority source at regional-screening scope. Never a project-investigation result.' },
  PROJECT_INVESTIGATION_POINT: { label: 'Project investigation point', description: 'A user-provided borehole, CPT/SPT or laboratory point tied to this project, kept USER-PROVIDED until independently verified.' },
  CONFLICT: { label: 'Conflict', description: 'Two or more evidence items disagree at this location; suitability is BLOCKED until resolved.' },
  STALE_AREA: { label: 'Stale', description: 'Upstream data is stale, or the active site has changed since this was generated; recompute before relying on it.' },
  UNKNOWN_GAP: { label: 'UNKNOWN gap', description: 'No source-qualified evidence is connected for this topic or area.' },
}

export const mapLayerCategoryOrder: MapLayerCategory[] = [
  'CONFLICT',
  'STALE_AREA',
  'PROJECT_INVESTIGATION_POINT',
  'AUTHORITATIVE_COVERAGE',
  'UNKNOWN_GAP',
]

export function summarizeMapLayers(features: GeotechnicalMapLayerFeature[]): Record<MapLayerCategory, number> {
  const summary: Record<MapLayerCategory, number> = {
    AUTHORITATIVE_COVERAGE: 0,
    PROJECT_INVESTIGATION_POINT: 0,
    CONFLICT: 0,
    STALE_AREA: 0,
    UNKNOWN_GAP: 0,
  }
  for (const feature of features) summary[feature.category] += 1
  return summary
}
