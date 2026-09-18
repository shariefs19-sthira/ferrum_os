"use client"

import { useMemo, useState } from "react"
import { buildEnvironmentalContext, type EnvironmentalLayer, type LayerConfidence, type LodLevel } from "../../lib/designstudio/environmentalContext"
import { createGooglePhotorealistic3DTilesAdapter } from "../../lib/tileSources/googlePhotorealistic3DTilesAdapter"
import { contextAnalysisEngines, contextTwinSources } from "../../lib/designstudio/contextTwinSources"
import { jurisdictionPacks } from "../../lib/designstudio/jurisdictionPacks"
import { useParcelContext } from "../../lib/workspace/parcelContext"
import { sampleSiteContext } from "../../lib/workspace/sampleSiteContext"

const confidenceLabels: Record<LayerConfidence, string> = {
  VERIFIED: "SOURCE VERIFIED",
  "AUTHOR-CONTROLLED": "AUTHOR CONTROLLED",
  INDICATIVE: "INDICATIVE",
  "SAMPLE-FIXTURE": "SAMPLE FIXTURE",
  UNKNOWN: "UNKNOWN",
  UNAVAILABLE: "UNAVAILABLE",
}

function LayerCard({ layer, expanded, onToggle }: { layer: EnvironmentalLayer; expanded: boolean; onToggle: () => void }) {
  const detailId = `${layer.id}-details`
  return (
    <li className="rounded-relume border border-relume-border bg-relume-surface p-4" data-environment-layer={layer.kind}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-relume-ink">{layer.label}</p>
          <p className="mt-1 text-xs leading-5 text-relume-muted">{layer.note}</p>
        </div>
        <span className="rounded-full border border-relume-border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-relume-ink">
          {confidenceLabels[layer.provenance.confidence]}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
        className="mt-3 min-h-11 rounded-full border border-relume-border px-4 text-xs font-semibold text-relume-ink hover:bg-relume-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-relume-ink"
      >
        {expanded ? "Hide provenance" : "View provenance"}
      </button>
      {expanded && (
        <dl id={detailId} className="mt-3 grid gap-3 border-t border-relume-border pt-3 text-xs sm:grid-cols-2">
          {[
            ["CRS", layer.provenance.crs],
            ["Units", layer.provenance.units],
            ["Horizontal datum", layer.provenance.horizontalDatum],
            ["Vertical datum", layer.provenance.verticalDatum],
            ["Source date", layer.provenance.sourceDate],
            ["Licence", layer.provenance.licence],
            ["Coverage", layer.provenance.coverage],
            ["Resolution", layer.provenance.resolution],
            ["Attribution", layer.provenance.attribution],
            ["Completeness", layer.provenance.completeness],
          ].map(([term, value]) => (
            <div key={term}>
              <dt className="font-semibold uppercase tracking-[0.1em] text-relume-muted">{term}</dt>
              <dd className="mt-1 break-words leading-5 text-relume-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  )
}

export default function EnvironmentalContextPanel() {
  const parcel = useParcelContext()
  const [lod, setLod] = useState<LodLevel>("standard")
  const [expandedLayer, setExpandedLayer] = useState<string | null>("layer-cadastral-boundary")
  const context = useMemo(() => buildEnvironmentalContext({
    parcel,
    sampleFallbackOrigin: sampleSiteContext.center,
    osmSampleCentre: sampleSiteContext.center,
    osm: {
      sourceDate: sampleSiteContext.source.queriedAt,
      license: sampleSiteContext.source.license,
      attribution: sampleSiteContext.tile.attribution,
      isLiveFetch: false,
    },
    lodLevel: lod,
  }), [parcel, lod])
  const googleTiles = useMemo(() => createGooglePhotorealistic3DTilesAdapter({}), [])
  const activeLod = context.lodProfiles.find((profile) => profile.id === lod) ?? context.lodProfiles[1]

  return (
    <section className="rounded-relume border border-relume-border bg-relume-surface-secondary p-5 sm:p-6" aria-labelledby="environment-context-heading" data-environmental-context>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.42fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-relume-muted">DesignStudio · environmental context</p>
          <h2 id="environment-context-heading" className="mt-2 text-2xl font-semibold tracking-relume-tight text-relume-ink">Keep context visible without turning it into design evidence</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-relume-ink">Each source remains a separate layer with its own coordinate system, date, licence, confidence and known gaps. Context layers cannot supply dimensions, setbacks, levels or structural decisions.</p>
        </div>
        <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-relume-muted">Project Context</p>
          <p className="mt-2 text-sm font-semibold text-relume-ink">{parcel ? `${parcel.district}, ${parcel.state}` : "No parcel selected"}</p>
          <p className="mt-1 text-xs leading-5 text-relume-muted">{context.origin.note}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <ul className="grid gap-3" aria-label="Environmental context layers">
          {context.layers.map((layer) => (
            <LayerCard key={layer.id} layer={layer} expanded={expandedLayer === layer.id} onToggle={() => setExpandedLayer((current) => current === layer.id ? null : layer.id)} />
          ))}
        </ul>

        <aside className="space-y-4" aria-label="Environmental context controls and diagnostics">
          <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
            <label htmlFor="environment-lod" className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Scene detail</label>
            <select id="environment-lod" value={lod} onChange={(event) => setLod(event.target.value as LodLevel)} className="mt-2 min-h-11 w-full rounded-relume border border-relume-border bg-white px-3 text-sm text-relume-ink">
              {context.lodProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
            </select>
            <p className="mt-2 text-xs leading-5 text-relume-muted" role="status" aria-live="polite">{activeLod.description}</p>
          </div>

          <div className="rounded-relume border border-relume-border bg-relume-surface p-4" data-google-tiles-status={googleTiles.provenance.status}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Google Photorealistic 3D Tiles</p>
            <p className="mt-2 text-sm font-semibold text-relume-ink">GATED UNAVAILABLE</p>
            <p className="mt-2 text-xs leading-5 text-relume-muted">{googleTiles.provenance.note}</p>
          </div>

          <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Cross-source alignment</p>
            {context.crossSourceOffsets.length === 0 ? (
              <p className="mt-2 text-xs leading-5 text-relume-muted">No selected parcel is available for an offset check. The OSM geometry remains a fixed Bengaluru sample fixture.</p>
            ) : context.crossSourceOffsets.map((diagnostic) => (
              <p key={`${diagnostic.fromLayer}-${diagnostic.toLayer}`} className="mt-2 text-xs leading-5 text-relume-muted">{diagnostic.note}</p>
            ))}
          </div>

          <div className="rounded-relume border border-relume-border bg-relume-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Export controls</p>
            <ul className="mt-2 space-y-2 text-xs leading-5 text-relume-muted">
              {context.exportConstraints.map((constraint) => <li key={constraint}>• {constraint}</li>)}
            </ul>
          </div>
        </aside>
      </div>

      <p className="mt-5 border-t border-relume-border pt-4 text-xs font-semibold leading-5 text-relume-ink">INDICATIVE — CONTEXT ONLY. Survey/cadastral geometry, terrain analytics and provider permissions must be independently verified before measurable use.</p>

      <div className="mt-5 grid gap-5 border-t border-relume-border pt-5 xl:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Context twin source priority</p>
          <ul className="mt-3 space-y-3">
            {contextTwinSources.map((source) => (
              <li key={source.id} className="rounded-relume border border-relume-border bg-relume-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-relume-ink">{source.label}</p>
                  <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-relume-muted">{source.authority}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-relume-ink">{source.supplies}</p>
                <p className="mt-1 text-xs leading-5 text-relume-muted">{source.limitation}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">Evidence-linked design analysis</p>
          <ul className="mt-3 space-y-3">
            {contextAnalysisEngines.map((engine) => (
              <li key={engine.id} className="rounded-relume border border-relume-border bg-relume-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-relume-ink">{engine.label}</p>
                  <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-relume-muted">{engine.decisionState}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-relume-muted">{engine.purpose}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold leading-5 text-relume-ink">SUTRA may compare and explain window, shading and massing options. Every recommendation remains a proposal until the controlling geometry, local rules and required professional review are complete.</p>
        </div>
      </div>

      <div className="mt-5 border-t border-relume-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-relume-muted">International jurisdiction architecture</p>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-relume-ink">Ferrum uses one worldwide project kernel and independently versioned country, state and city rule packs. India is the first deep pack, not the product boundary.</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jurisdictionPacks.map((pack) => (
            <li key={pack.id} className="rounded-relume border border-relume-border bg-relume-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-relume-ink">{pack.label}</p>
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-relume-muted">{pack.status}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-relume-muted">{pack.scope}</p>
              <p className="mt-2 text-xs leading-5 text-relume-ink">{pack.rule}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
