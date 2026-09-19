'use client'

import { compassLabel, solarGeometryNote, type SunEvent } from '../../lib/landintel/siteSolar'
import { lengthLabel, offsetMetres, siteModules, topicById, type ClassifiedObservation, type SiteModuleId } from '../../lib/landintel/siteAnalysis'

export type DiagramLayer = 'sun' | SiteModuleId | 'labels'
export const diagramLayers: { id: DiagramLayer; label: string }[] = [
  { id: 'sun', label: 'Sun (computed)' },
  ...siteModules.map((module) => ({ id: module.id as DiagramLayer, label: module.short })),
  { id: 'labels', label: 'Labels' },
]
export const radiusOptions = [50, 100, 250, 500] as const

const SIZE = 400
const CENTER = SIZE / 2
const PLOT_RADIUS = 168
const ARROW_LENGTH = 40

const moduleGlyph: Record<SiteModuleId, string> = {
  climate: 'circle',
  physical: 'triangle',
  urban: 'square',
  infrastructure: 'diamond',
  cultural: 'hexagon',
}

function glyphPath(kind: string, r: number): string {
  switch (kind) {
    case 'triangle': return `M0 ${-r} L${r * 0.95} ${r * 0.8} L${-r * 0.95} ${r * 0.8} Z`
    case 'square': return `M${-r * 0.85} ${-r * 0.85} H${r * 0.85} V${r * 0.85} H${-r * 0.85} Z`
    case 'diamond': return `M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z`
    case 'hexagon': return `M${-r} 0 L${-r / 2} ${-r * 0.87} L${r / 2} ${-r * 0.87} L${r} 0 L${r / 2} ${r * 0.87} L${-r / 2} ${r * 0.87} Z`
    default: return `M${-r} 0 A${r} ${r} 0 1 0 ${r} 0 A${r} ${r} 0 1 0 ${-r} 0 Z`
  }
}

const polar = (bearingDeg: number, radius: number) => ({
  x: CENTER + radius * Math.sin((bearingDeg * Math.PI) / 180),
  y: CENTER - radius * Math.cos((bearingDeg * Math.PI) / 180),
})

function wedge(fromDeg: number, toDeg: number, radius: number): string {
  const start = polar(fromDeg, radius)
  const end = polar(toDeg, radius)
  const sweep = ((toDeg - fromDeg) % 360 + 360) % 360
  return `M${CENTER} ${CENTER} L${start.x.toFixed(1)} ${start.y.toFixed(1)} A${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)} Z`
}

export type PlottedRecord = { item: ClassifiedObservation; x: number; y: number; distanceM: number }

/** Partitions records into those drawn at diagram scale and those that cannot be, so nothing is silently dropped. */
export function plotRecords(anchor: { lat: number; lng: number } | null, radiusM: number, items: ClassifiedObservation[]): { plotted: PlottedRecord[]; offScale: ClassifiedObservation[]; noLocation: ClassifiedObservation[] } {
  const plotted: PlottedRecord[] = []
  const offScale: ClassifiedObservation[] = []
  const noLocation: ClassifiedObservation[] = []
  for (const item of items) {
    if (item.state === 'INVALID') continue
    if (!anchor || !item.record.location) { noLocation.push(item); continue }
    const { east, north } = offsetMetres(anchor, item.record.location)
    const distanceM = Math.hypot(east, north)
    if (distanceM > radiusM) { offScale.push(item); continue }
    const scale = PLOT_RADIUS / radiusM
    plotted.push({ item, x: CENTER + east * scale, y: CENTER - north * scale, distanceM })
  }
  return { plotted, offScale, noLocation }
}

export default function SiteAnalysisDiagram({ anchor, items, sun, radiusM, layers }: {
  anchor: { lat: number; lng: number } | null
  items: ClassifiedObservation[]
  sun: SunEvent[] | null
  radiusM: number
  layers: Set<DiagramLayer>
}) {
  const { plotted, offScale, noLocation } = plotRecords(anchor, radiusM, items)
  const visible = plotted.filter((entry) => layers.has(entry.item.record.module))
  const showLabels = layers.has('labels')
  const june = sun?.find((event) => event.id === 'june-solstice')
  const december = sun?.find((event) => event.id === 'december-solstice')
  const groups = new Map<string, PlottedRecord[]>()
  for (const entry of visible) {
    const key = `${Math.round(entry.x)}:${Math.round(entry.y)}`
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }

  return (
    <figure className="min-w-0" data-site-analysis-diagram aria-labelledby="site-diagram-caption">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-labelledby="site-diagram-title site-diagram-desc" className="mx-auto block h-auto w-full max-w-[34rem] rounded-relume border border-relume-border bg-relume-surface-secondary" data-site-diagram-svg>
        <title id="site-diagram-title">Site analysis diagram, north up</title>
        <desc id="site-diagram-desc">
          {anchor ? `Centred on the map point (context only, not a surveyed boundary). ${visible.length} recorded observation${visible.length === 1 ? '' : 's'} drawn within ${lengthLabel(radiusM)}; ${offScale.length} beyond the radius and ${noLocation.length} without a location are listed below the diagram.` : 'No map point is resolved, so nothing can be drawn. Resolve a site above.'}
        </desc>
        <defs>
          <radialGradient id="site-sun-band" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF9933" stopOpacity="0" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0.42" />
          </radialGradient>
          <marker id="site-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" className="fill-relume-command" /></marker>
          <marker id="site-arrow-sun" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" className="fill-relume-muted" /></marker>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={PLOT_RADIUS} className="fill-relume-surface stroke-relume-steel-soft" strokeWidth="1" />
        <circle cx={CENTER} cy={CENTER} r={PLOT_RADIUS / 2} className="fill-none stroke-relume-steel-soft" strokeWidth="1" strokeDasharray="4 4" />
        {showLabels && <>
          <text x={CENTER + 4} y={CENTER - PLOT_RADIUS / 2 - 4} fontSize="16" className="fill-relume-muted">{lengthLabel(radiusM / 2)}</text>
          <text x={CENTER + 4} y={CENTER - PLOT_RADIUS - 4} fontSize="16" className="fill-relume-muted">{lengthLabel(radiusM)}</text>
        </>}

        <g aria-hidden="true" transform={`translate(${SIZE - 28} 30)`}>
          <path d="M0 14 L0 -14 M0 -14 L-6 -4 M0 -14 L6 -4" className="stroke-relume-command" strokeWidth="2" fill="none" />
          <text x="0" y="-19" textAnchor="middle" fontSize="18" fontWeight="700" className="fill-relume-command">N</text>
        </g>

        {layers.has('sun') && sun && june && december && (
          <g data-site-sun-layer>
            {june.sunriseAzimuthDeg !== null && december.sunriseAzimuthDeg !== null && <path d={wedge(june.sunriseAzimuthDeg, december.sunriseAzimuthDeg, PLOT_RADIUS)} fill="url(#site-sun-band)" data-sun-sweep="sunrise" />}
            {june.sunsetAzimuthDeg !== null && december.sunsetAzimuthDeg !== null && <path d={wedge(december.sunsetAzimuthDeg, june.sunsetAzimuthDeg, PLOT_RADIUS)} fill="url(#site-sun-band)" data-sun-sweep="sunset" />}
            {([[june, 'Jun'], [december, 'Dec']] as const).flatMap(([event, name]) => [
              event.sunriseAzimuthDeg !== null && { key: `${name}-rise`, bearing: event.sunriseAzimuthDeg, text: `${name} rise` },
              event.sunsetAzimuthDeg !== null && { key: `${name}-set`, bearing: event.sunsetAzimuthDeg, text: `${name} set` },
            ]).filter((entry): entry is { key: string; bearing: number; text: string } => !!entry).map((entry) => {
              const from = polar(entry.bearing, 30)
              const to = polar(entry.bearing, PLOT_RADIUS - 6)
              const label = polar(entry.bearing, PLOT_RADIUS - 30)
              return <g key={entry.key} data-sun-arrow={entry.key}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-relume-muted" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#site-arrow-sun)" />
                {showLabels && <text x={label.x} y={label.y} fontSize="16" textAnchor="middle" className="fill-relume-ink" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">{entry.text}</text>}
              </g>
            })}
          </g>
        )}

        {Array.from(groups.values()).map((group) => {
          const first = group[0]
          const record = first.item.record
          const glyph = moduleGlyph[record.module]
          const state = first.item.state
          const observed = state === 'OBSERVED'
          const inferred = state === 'INFERRED'
          const stale = state === 'STALE'
          const topic = topicById(record.topic)
          const label = `${topic?.label ?? record.topic}: ${state.replace('_', ' ').toLowerCase()}, ${first.item.confidence.toLowerCase()} confidence, observed ${record.observedOn} by ${record.observer}${group.length > 1 ? ` (+${group.length - 1} more at this point)` : ''}`
          return <g key={record.id} data-observation-id={record.id} data-observation-module={record.module} data-observation-state={state} opacity={stale ? 0.45 : 1}>
            {group.filter((entry) => entry.item.record.bearingDeg !== null).map((entry) => {
              const bearing = entry.item.record.bearingDeg as number
              const incoming = /comes from/.test(topicById(entry.item.record.topic)?.bearingMeaning ?? '')
              const far = { x: entry.x + ARROW_LENGTH * Math.sin((bearing * Math.PI) / 180), y: entry.y - ARROW_LENGTH * Math.cos((bearing * Math.PI) / 180) }
              return <line key={entry.item.record.id} x1={incoming ? far.x : entry.x} y1={incoming ? far.y : entry.y} x2={incoming ? entry.x : far.x} y2={incoming ? entry.y : far.y} className="stroke-relume-command" strokeWidth="2" markerEnd="url(#site-arrow)" data-observation-arrow={entry.item.record.id} />
            })}
            <g transform={`translate(${first.x.toFixed(1)} ${first.y.toFixed(1)})`}>
              <title>{label}</title>
              <path d={glyphPath(glyph, 12)} className={`stroke-relume-command ${observed ? 'fill-relume-command' : 'fill-relume-surface'}`} strokeWidth="2" strokeDasharray={inferred ? '3 2' : undefined} />
              {state === 'USER_PROVIDED' && <circle r="3" className="fill-relume-command" />}
              {stale && <line x1="-12" y1="12" x2="12" y2="-12" className="stroke-relume-danger" strokeWidth="2" />}
              {group.length > 1 && <text x="13" y="-9" fontSize="15" fontWeight="700" className="fill-relume-ink">×{group.length}</text>}
              {showLabels && <text x="0" y="28" textAnchor="middle" fontSize="16" className="fill-relume-ink" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">{topic?.label ?? record.topic}</text>}
            </g>
          </g>
        })}

        {anchor && <g transform={`translate(${CENTER} ${CENTER})`} data-site-anchor>
          <title>Map point — context only, not a surveyed boundary</title>
          <circle r="5" className="fill-relume-ink" />
          <path d="M-14 0 H14 M0 -14 V14" className="stroke-relume-ink" strokeWidth="1.5" />
          {showLabels && <text x="10" y="-10" fontSize="16" className="fill-relume-ink" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3">Map point</text>}
        </g>}
        {!anchor && <text x={CENTER} y={CENTER} textAnchor="middle" fontSize="17" className="fill-relume-muted">UNKNOWN — no map point resolved</text>}
      </svg>

      <figcaption id="site-diagram-caption" className="mt-3 space-y-2 text-xs leading-5 text-relume-muted">
        <p>North up. Centre is the resolved map point — <strong className="text-relume-ink">context only, not a surveyed boundary</strong>; no plot outline, contour, shadow or wind field is drawn because none is connected. Scale radius {lengthLabel(radiusM)}.</p>
        {sun && june && december && layers.has('sun') && <p data-sun-caption>
          <strong className="text-relume-ink">Computed sun geometry:</strong>{' '}
          {june.sunriseAzimuthDeg !== null && december.sunriseAzimuthDeg !== null ? `sunrise ${Math.round(june.sunriseAzimuthDeg)}° ${compassLabel(june.sunriseAzimuthDeg)} (June) to ${Math.round(december.sunriseAzimuthDeg)}° ${compassLabel(december.sunriseAzimuthDeg)} (December); sunset ${Math.round(june.sunsetAzimuthDeg ?? 0)}° to ${Math.round(december.sunsetAzimuthDeg ?? 0)}°; ` : 'no daily sunrise/sunset at this latitude on a solstice; '}
          noon sun {june.noonBearing === 'N' ? 'north' : june.noonBearing === 'S' ? 'south' : 'overhead'} of overhead in June at {Math.round(june.noonAltitudeDeg)}°, {december.noonBearing === 'N' ? 'north' : december.noonBearing === 'S' ? 'south' : 'overhead'} in December at {Math.round(december.noonAltitudeDeg)}°. {solarGeometryNote}
        </p>}
        {offScale.length > 0 && <p data-off-scale>{offScale.length} record{offScale.length === 1 ? '' : 's'} lie beyond {lengthLabel(radiusM)} and are not drawn; widen the radius to see {offScale.length === 1 ? 'it' : 'them'}.</p>}
        {noLocation.length > 0 && <p data-no-location>{noLocation.length} record{noLocation.length === 1 ? ' has' : 's have'} no location (document evidence or no map point) and {noLocation.length === 1 ? 'is' : 'are'} listed, not drawn.</p>}
      </figcaption>

      <div className="mt-3 grid gap-3 rounded-relume border border-relume-border bg-relume-surface p-3 text-xs leading-5 text-relume-ink sm:grid-cols-2" data-site-diagram-legend aria-label="Diagram legend">
        <div>
          <p className="font-semibold uppercase tracking-[0.12em] text-relume-muted">Module shape</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
            {siteModules.map((module) => <li key={module.id} className="flex items-center gap-2"><svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true"><path d={glyphPath(moduleGlyph[module.id], 9)} className="fill-relume-surface stroke-relume-command" strokeWidth="2" /></svg>{module.short}</li>)}
          </ul>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.12em] text-relume-muted">Evidence basis</p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center gap-2"><svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="8" className="fill-relume-command stroke-relume-command" strokeWidth="2" /></svg>Observed (filled)</li>
            <li className="flex items-center gap-2"><svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="8" className="fill-relume-surface stroke-relume-command" strokeWidth="2" /><circle r="3" className="fill-relume-command" /></svg>User-provided (dot)</li>
            <li className="flex items-center gap-2"><svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="8" className="fill-relume-surface stroke-relume-command" strokeWidth="2" strokeDasharray="3 2" /></svg>Inferred (dashed)</li>
            <li className="flex items-center gap-2"><svg width="18" height="18" viewBox="-12 -12 24 24" aria-hidden="true"><circle r="8" className="fill-relume-surface stroke-relume-command" strokeWidth="2" opacity="0.45" /><line x1="-8" y1="8" x2="8" y2="-8" className="stroke-relume-danger" strokeWidth="2" /></svg>Stale (struck, faded)</li>
          </ul>
        </div>
        <p className="sm:col-span-2"><strong>Arrows:</strong> a solid arrow is a recorded bearing (clockwise from true north) in the sense stated on that record — wind arrows point <em>toward</em> the marker from where the wind comes; all others point the way the record says. Dashed grey arrows and the orange band are <em>computed</em> sun geometry, not observations.</p>
      </div>
    </figure>
  )
}
