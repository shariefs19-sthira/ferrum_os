'use client'

import {
  createUnknownGeotechnicalScreening,
  governmentGeotechnicalSources,
  type GeotechnicalAssessment,
  type ProjectGeotechnicalInput,
} from '../../lib/landintel/geotechnicalIntelligence'
import {
  buildGeotechnicalMapLayers,
  mapLayerCategoryOrder,
  mapLayerLegend,
  summarizeMapLayers,
  withLiveStaleness,
  type MapLayerCategory,
} from '../../lib/landintel/geotechnicalMapLayers'
import { useParcelContext } from '../../lib/workspace/parcelContext'

const CATEGORY_BADGE: Record<MapLayerCategory, string> = {
  AUTHORITATIVE_COVERAGE: 'border-relume-command bg-relume-command text-white',
  PROJECT_INVESTIGATION_POINT: 'border-relume-command bg-white text-relume-command',
  CONFLICT: 'border-relume-ink bg-relume-ink text-white',
  STALE_AREA: 'border-relume-border bg-relume-surface-secondary text-relume-ink',
  UNKNOWN_GAP: 'border-relume-border bg-white text-relume-muted',
}

/**
 * Spatial legend for LandIntel's geotechnical evidence map-layer contract
 * (lib/landintel/geotechnicalMapLayers.ts). Isolated from the cockpit/map
 * rendering surfaces (no ParcelMap/Leaflet, WorkspaceCockpit or mobile
 * dependency) -- it summarizes the five spatial categories and the
 * declarative connector registry as data, so any future map renderer
 * (cockpit-owned) can consume the same categorisation without this
 * component needing to own the map itself.
 */
export default function GeotechnicalMapLayerLegend({
  assessment = createUnknownGeotechnicalScreening(),
  projectInputs = [],
}: {
  assessment?: GeotechnicalAssessment
  projectInputs?: ProjectGeotechnicalInput[]
}) {
  const parcel = useParcelContext()
  const rawFeatures = buildGeotechnicalMapLayers(assessment.evidence, projectInputs)
  const features = withLiveStaleness(rawFeatures, parcel)
  const summary = summarizeMapLayers(features)
  const declarativeCount = governmentGeotechnicalSources.filter((source) => source.connectorState === 'DECLARATIVE ONLY').length

  return (
    <section
      className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface"
      aria-labelledby="geotechnical-map-layer-heading"
      data-geotechnical-map-layer-legend
    >
      <div className="border-b border-relume-border p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · geotechnical map layers</p>
        <h2 id="geotechnical-map-layer-heading" className="mt-3 text-xl font-semibold tracking-relume-tight text-relume-ink">
          Every spatial feature carries one honest category
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-relume-ink">
          Authoritative mapped coverage, project investigation points, conflicts, stale areas and UNKNOWN gaps are kept spatially distinct -- a regional screening layer is never rendered as if it were a real borehole point, and a stale or disputed feature is never silently merged back into a clean result.
        </p>
        <p className="mt-2 text-xs text-relume-muted" data-geotechnical-map-layer-connector-status>
          {declarativeCount} of {governmentGeotechnicalSources.length} government source connectors are DECLARATIVE ONLY -- none is wired to live credentials or an endpoint in this build.
        </p>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5" aria-label="Geotechnical map-layer categories">
        {mapLayerCategoryOrder.map((category) => (
          <article key={category} className="rounded-relume border border-relume-border bg-relume-surface-secondary p-4" data-map-layer-category={category}>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${CATEGORY_BADGE[category]}`}>{mapLayerLegend[category].label}</span>
            <p className="mt-3 text-2xl font-semibold text-relume-ink" data-map-layer-count={category}>{summary[category]}</p>
            <p className="mt-2 text-[11px] leading-4 text-relume-muted">{mapLayerLegend[category].description}</p>
          </article>
        ))}
      </div>

      <p className="border-t border-relume-border px-5 py-4 text-xs leading-5 text-relume-muted sm:px-6">
        <strong className="text-relume-ink">Category counts reflect the evidence and project inputs actually loaded above.</strong> Reconnecting to a different site recomputes every count and reclassifies anything generated for the previous site as Stale until it is recomputed.
      </p>
    </section>
  )
}
