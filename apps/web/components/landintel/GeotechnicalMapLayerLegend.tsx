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
import { useParcelContext, type ParcelContext } from '../../lib/workspace/parcelContext'

const CATEGORY_BADGE: Record<MapLayerCategory, string> = {
  AUTHORITATIVE_COVERAGE: 'border-relume-command bg-relume-command text-white',
  PROJECT_INVESTIGATION_POINT: 'border-relume-command bg-white text-relume-command',
  CONFLICT: 'border-relume-ink bg-relume-ink text-white',
  STALE_AREA: 'border-relume-border bg-relume-surface-secondary text-relume-ink',
  UNKNOWN_GAP: 'border-relume-border bg-white text-relume-muted',
}

/**
 * Declarative category legend for LandIntel's geotechnical evidence
 * map-layer contract (lib/landintel/geotechnicalMapLayers.ts). This
 * component does NOT render map geometry, a map canvas, or any spatial
 * drawing -- it lists the five categories a future map renderer (cockpit-
 * owned) would use to place features, and shows how many currently-loaded
 * items fall into each. Isolated from the cockpit/map rendering surfaces
 * (no ParcelMap/Leaflet, WorkspaceCockpit or mobile dependency).
 *
 * `generatedFor` is the parcel context the supplied `assessment`/
 * `projectInputs` were actually produced against -- distinct from
 * whatever the LIVE active site is. It must be passed explicitly by the
 * caller (e.g. captured at analysis time) rather than defaulted from
 * `useParcelContext()`, or a parcel swap could never be detected: comparing
 * the live context against itself is never stale by construction. The
 * component still subscribes to the live context (`useParcelContext`)
 * purely to re-render when the active site changes; that subscribed value
 * is never used as the staleness comparison target.
 */
export default function GeotechnicalMapLayerLegend({
  assessment = createUnknownGeotechnicalScreening(),
  projectInputs = [],
  generatedFor = null,
}: {
  assessment?: GeotechnicalAssessment
  projectInputs?: ProjectGeotechnicalInput[]
  generatedFor?: ParcelContext | null
}) {
  useParcelContext() // re-render on live site changes only; see generatedFor note above.
  const rawFeatures = buildGeotechnicalMapLayers(assessment.evidence, projectInputs)
  const features = withLiveStaleness(rawFeatures, generatedFor)
  const summary = summarizeMapLayers(features)
  const declarativeCount = governmentGeotechnicalSources.filter((source) => source.connectorState === 'DECLARATIVE ONLY').length

  return (
    <section
      className="overflow-hidden rounded-relume border border-relume-border bg-relume-surface"
      aria-labelledby="geotechnical-map-layer-heading"
      data-geotechnical-map-layer-legend
    >
      <div className="border-b border-relume-border p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">LandIntel · geotechnical map-layer categories</p>
        <h2 id="geotechnical-map-layer-heading" className="mt-3 text-xl font-semibold tracking-relume-tight text-relume-ink">
          Every item is categorised, not drawn
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-relume-ink" data-geotechnical-map-layer-disclosure>
          This is a declarative categorisation, not a rendered map: no map canvas or geometry is drawn on this page. Every evidence item and project-investigation input is classified as authoritative mapped coverage, a project investigation point, a conflict, a stale area, or an UNKNOWN gap, so that a map surface built later can place it correctly -- a regional screening item is never classified as if it were a real borehole point, and a stale or disputed item is never silently reclassified back to clean.
        </p>
        <p className="mt-2 text-xs text-relume-muted" data-geotechnical-map-layer-connector-status>
          {declarativeCount} of {governmentGeotechnicalSources.length} government source connectors are DECLARATIVE ONLY -- none is wired to live credentials or an endpoint in this build.
        </p>
        <p className="mt-2 text-xs text-relume-muted" data-geotechnical-map-layer-authority-boundary>
          “Authoritative mapped coverage” is reserved for SOURCE-VERIFIED regional evidence with known coverage. INDICATIVE, INFERRED and regional USER-PROVIDED evidence remains non-authoritative; its source status and provenance are retained for a future map renderer.
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
