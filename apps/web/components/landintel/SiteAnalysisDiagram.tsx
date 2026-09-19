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

// --- Label-collision solver -------------------------------------------------
// Every on-diagram text label (ring radius, sun-event, module/topic, the anchor
// "Map point" caption) is placed once, then nudged apart from every other label
// AND from fixed glyph/crosshair/compass obstacles until nothing overlaps.
// This replaces per-label hand-tuned offsets (which only ever fixed one
// collision at a time) with one general mechanism, per RULE: dedicated
// allotment, no floated overlays — the nudging stays inside the same SVG
// canvas, never covers other content, and a thin leader line is drawn back to
// the glyph whenever a label has moved far enough to look orphaned.
type LabelSpec = { id: string; x: number; y: number; text: string; fontSize: number; anchor: 'start' | 'middle' | 'end'; originX: number; originY: number }
type Box = { left: number; top: number; right: number; bottom: number }

/** Average glyph width for the diagram's sans-serif label font, as a fraction of font size — deliberately
 * generous (real character widths vary) plus a fixed pixel pad, so the solver keeps labels clear of each
 * other even where its width estimate undershoots the browser's actual rendered metrics. */
const CHAR_WIDTH_FACTOR = 0.62
const BOX_PAD = 2.5

function labelBox(label: { x: number; y: number; text: string; fontSize: number; anchor: 'start' | 'middle' | 'end' }): Box {
  const width = Math.max(label.text.length, 1) * label.fontSize * CHAR_WIDTH_FACTOR
  const height = label.fontSize * 1.15
  const left = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2
  const top = label.y - height * 0.82
  return { left: left - BOX_PAD, top: top - BOX_PAD, right: left + width + BOX_PAD, bottom: top + height + BOX_PAD }
}

function boxesOverlap(a: Box, b: Box): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

function clampToCanvas(label: LabelSpec) {
  const margin = 4
  for (let guard = 0; guard < 6; guard += 1) {
    const box = labelBox(label)
    if (box.left < margin) label.x += margin - box.left
    else if (box.right > SIZE - margin) label.x -= box.right - (SIZE - margin)
    if (box.top < margin) label.y += margin - box.top
    else if (box.bottom > SIZE - margin) label.y -= box.bottom - (SIZE - margin)
    const after = labelBox(label)
    if (after.left >= margin - 0.5 && after.right <= SIZE - margin + 0.5 && after.top >= margin - 0.5 && after.bottom <= SIZE - margin + 0.5) break
  }
}

/** Nudges every label away from fixed obstacles and from every other label until no pair of bounding boxes overlaps. */
export function resolveLabelCollisions(labels: LabelSpec[], obstacles: Box[]): LabelSpec[] {
  const placed = labels.map((label) => ({ ...label }))
  const STEP = 2.4
  for (let iteration = 0; iteration < 140; iteration += 1) {
    let moved = false
    for (let i = 0; i < placed.length; i += 1) {
      const label = placed[i]
      const box = labelBox(label)
      for (const obstacle of obstacles) {
        if (!boxesOverlap(box, obstacle)) continue
        const dx = (box.left + box.right) / 2 - (obstacle.left + obstacle.right) / 2
        const dy = (box.top + box.bottom) / 2 - (obstacle.top + obstacle.bottom) / 2
        const length = Math.hypot(dx, dy) || 1
        label.x += (dx / length) * STEP
        label.y += (dy / length) * STEP
        moved = true
      }
      for (let j = 0; j < placed.length; j += 1) {
        if (i === j) continue
        const other = labelBox(placed[j])
        if (!boxesOverlap(box, other)) continue
        const dx = (box.left + box.right) / 2 - (other.left + other.right) / 2
        const dy = (box.top + box.bottom) / 2 - (other.top + other.bottom) / 2
        const length = Math.hypot(dx, dy)
        const angle = (i * 47 + 23) * (Math.PI / 180)
        const ux = length < 0.01 ? Math.cos(angle) : dx / length
        const uy = length < 0.01 ? Math.sin(angle) : dy / length
        label.x += ux * STEP
        label.y += uy * STEP
        moved = true
      }
      clampToCanvas(label)
    }
    if (!moved) break
  }
  return placed
}

/** How far (px, diagram units) a label moved from its natural position before it earns a leader line back to its glyph. */
const LEADER_THRESHOLD = 9

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
  const groupList = Array.from(groups.values())

  // Fixed obstacles every label must clear: the crosshair, the N compass, each glyph, and any ×N stack badge.
  const obstacles: Box[] = [{ left: SIZE - 44, top: 0, right: SIZE - 8, bottom: 58 }]
  if (anchor) obstacles.push({ left: CENTER - 16, top: CENTER - 16, right: CENTER + 16, bottom: CENTER + 16 })
  for (const group of groupList) {
    const first = group[0]
    obstacles.push({ left: first.x - 14, top: first.y - 14, right: first.x + 14, bottom: first.y + 14 })
  }

  const sunLabelEntries = layers.has('sun') && sun && june && december
    ? ([[june, 'Jun'], [december, 'Dec']] as const).flatMap(([event, name]) => [
        event.sunriseAzimuthDeg !== null && { key: `${name}-rise`, bearing: event.sunriseAzimuthDeg, text: `${name} rise` },
        event.sunsetAzimuthDeg !== null && { key: `${name}-set`, bearing: event.sunsetAzimuthDeg, text: `${name} set` },
      ]).filter((entry): entry is { key: string; bearing: number; text: string } => !!entry)
    : []

  const baseLabels: LabelSpec[] = []
  if (showLabels) {
    baseLabels.push({ id: 'ring-half', x: CENTER + 4, y: CENTER - PLOT_RADIUS / 2 - 4, text: lengthLabel(radiusM / 2), fontSize: 16, anchor: 'start', originX: CENTER + 4, originY: CENTER - PLOT_RADIUS / 2 - 4 })
    baseLabels.push({ id: 'ring-full', x: CENTER + 4, y: CENTER - PLOT_RADIUS - 4, text: lengthLabel(radiusM), fontSize: 16, anchor: 'start', originX: CENTER + 4, originY: CENTER - PLOT_RADIUS - 4 })
    for (const entry of sunLabelEntries) {
      const point = polar(entry.bearing, PLOT_RADIUS - 30)
      baseLabels.push({ id: `sun-${entry.key}`, x: point.x, y: point.y, text: entry.text, fontSize: 16, anchor: 'middle', originX: point.x, originY: point.y })
    }
    for (const group of groupList) {
      const first = group[0]
      const topic = topicById(first.item.record.topic)
      baseLabels.push({ id: `module-${first.item.record.id}`, x: first.x, y: first.y + 28, text: topic?.label ?? first.item.record.topic, fontSize: 16, anchor: 'middle', originX: first.x, originY: first.y })
    }
    if (anchor) baseLabels.push({ id: 'anchor', x: CENTER - 18, y: CENTER - 10, text: 'Map point', fontSize: 16, anchor: 'end', originX: CENTER, originY: CENTER })
  }

  // The ×N stack badge is a data fact (how many records share this point), not a toggleable "Labels" layer
  // element, so it always joins the solver; the rest only when the Labels layer is on. Its seed is whichever
  // corner of its own glyph is least crowded by OTHER markers, the compass and the other labels' starting
  // spots (upper-right first), so it stays visibly attached to the stack it counts instead of drifting off
  // toward a neighbouring marker.
  const badgeLabels: LabelSpec[] = []
  for (const group of groupList) {
    if (group.length <= 1) continue
    const first = group[0]
    const text = `×${group.length}`
    const rivals: Box[] = [
      { left: SIZE - 44, top: 0, right: SIZE - 8, bottom: 58 },
      ...groupList.filter((other) => other !== group).map((other) => ({ left: other[0].x - 14, top: other[0].y - 14, right: other[0].x + 14, bottom: other[0].y + 14 })),
      ...baseLabels.filter((label) => label.id !== `module-${first.item.record.id}` && label.id !== 'anchor').map(labelBox),
    ]
    const seeds = ([[13, -9, 'start'], [13, 19, 'start'], [-13, -9, 'end'], [-13, 19, 'end']] as const).map(([dx, dy, anchorSide]) => {
      const seed: LabelSpec = { id: `badge-${first.item.record.id}`, x: first.x + dx, y: first.y + dy, text, fontSize: 15, anchor: anchorSide, originX: first.x, originY: first.y }
      const box = labelBox(seed)
      const crowding = rivals.reduce((sum, rival) => sum + Math.max(0, Math.min(box.right, rival.right) - Math.max(box.left, rival.left)) * Math.max(0, Math.min(box.bottom, rival.bottom) - Math.max(box.top, rival.top)), 0)
      return { seed, crowding }
    })
    badgeLabels.push(seeds.reduce((best, candidate) => (candidate.crowding < best.crowding ? candidate : best)).seed)
  }
  const rawLabels: LabelSpec[] = [...badgeLabels, ...baseLabels]
  const placedLabels = resolveLabelCollisions(rawLabels, obstacles)
  const labelById = new Map(placedLabels.map((label) => [label.id, label]))
  const leaderLine = (label: LabelSpec | undefined, key: string) => {
    if (!label) return null
    const moved = Math.hypot(label.x - label.originX, label.y - label.originY)
    if (moved <= LEADER_THRESHOLD) return null
    return <line key={`leader-${key}`} x1={label.originX} y1={label.originY} x2={label.x} y2={label.y - label.fontSize * 0.35} className="stroke-relume-muted" strokeWidth="1.25" strokeDasharray="3 2" data-label-leader={key} />
  }
  const labelText = (label: LabelSpec | undefined, key: string, extraClassName = 'fill-relume-ink') => {
    if (!label) return null
    return <text key={key} x={label.x} y={label.y} fontSize={label.fontSize} textAnchor={label.anchor} className={extraClassName} paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3" data-diagram-label={key}>{label.text}</text>
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
          {leaderLine(labelById.get('ring-half'), 'ring-half')}
          {leaderLine(labelById.get('ring-full'), 'ring-full')}
          {labelText(labelById.get('ring-half'), 'ring-half', 'fill-relume-muted')}
          {labelText(labelById.get('ring-full'), 'ring-full', 'fill-relume-muted')}
        </>}

        {/* y=38 (not 30): the "N" glyph's ascent reaches ~14.4 above its baseline (y=-19 locally), which at
            y=30 pushed its top to about -3px — outside the 0..400 viewBox, where SVG's default
            overflow:hidden silently cropped it. 38 keeps the full glyph inside the canvas at every viewport. */}
        <g aria-hidden="true" transform={`translate(${SIZE - 28} 38)`}>
          <path d="M0 14 L0 -14 M0 -14 L-6 -4 M0 -14 L6 -4" className="stroke-relume-command" strokeWidth="2" fill="none" />
          <text x="0" y="-19" textAnchor="middle" fontSize="18" fontWeight="700" className="fill-relume-command">N</text>
        </g>

        {layers.has('sun') && sun && june && december && (
          <g data-site-sun-layer>
            {june.sunriseAzimuthDeg !== null && december.sunriseAzimuthDeg !== null && <path d={wedge(june.sunriseAzimuthDeg, december.sunriseAzimuthDeg, PLOT_RADIUS)} fill="url(#site-sun-band)" data-sun-sweep="sunrise" />}
            {june.sunsetAzimuthDeg !== null && december.sunsetAzimuthDeg !== null && <path d={wedge(december.sunsetAzimuthDeg, june.sunsetAzimuthDeg, PLOT_RADIUS)} fill="url(#site-sun-band)" data-sun-sweep="sunset" />}
            {sunLabelEntries.map((entry) => {
              const from = polar(entry.bearing, 30)
              const to = polar(entry.bearing, PLOT_RADIUS - 6)
              const label = labelById.get(`sun-${entry.key}`)
              return <g key={entry.key} data-sun-arrow={entry.key}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-relume-muted" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#site-arrow-sun)" />
                {showLabels && leaderLine(label, `sun-${entry.key}`)}
                {showLabels && labelText(label, `sun-${entry.key}`)}
              </g>
            })}
          </g>
        )}

        {groupList.map((group) => {
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
            </g>
          </g>
        })}

        {groupList.filter((group) => group.length > 1).map((group) => {
          const record = group[0].item.record
          const key = `badge-${record.id}`
          const badge = labelById.get(key)
          if (!badge) return null
          return <text key={key} x={badge.x} y={badge.y} fontSize={badge.fontSize} fontWeight="700" textAnchor={badge.anchor} className="fill-relume-ink" data-observation-count data-observation-count-for={record.id}>×{group.length}</text>
        })}

        {showLabels && groupList.map((group) => {
          const record = group[0].item.record
          const key = `module-${record.id}`
          return leaderLine(labelById.get(key), key)
        })}
        {showLabels && groupList.map((group) => {
          const record = group[0].item.record
          const key = `module-${record.id}`
          return labelText(labelById.get(key), key)
        })}

        {anchor && <g data-site-anchor transform={`translate(${CENTER} ${CENTER})`}>
          <title>Map point — context only, not a surveyed boundary</title>
          <circle r="5" className="fill-relume-ink" />
          <path d="M-14 0 H14 M0 -14 V14" className="stroke-relume-ink" strokeWidth="1.5" />
        </g>}
        {showLabels && leaderLine(labelById.get('anchor'), 'anchor')}
        {showLabels && labelById.get('anchor') && (() => {
          const label = labelById.get('anchor')!
          return <text x={label.x} y={label.y} fontSize={label.fontSize} textAnchor={label.anchor} className="fill-relume-ink" paintOrder="stroke" stroke="#FFFFFF" strokeWidth="3" data-site-anchor-label>{label.text}</text>
        })()}
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
