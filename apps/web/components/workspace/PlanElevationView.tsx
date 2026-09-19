import type { StudioOpening, StudioPlan, StudioRoom, StudioView, StudioWall } from '../../lib/types'
import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { getFacadeOpenings, openingSegments } from '../../lib/workspace/openings'
import { getPlanWalls, wallCoordinateM, wallLengthM } from '../../lib/workspace/walls'

type PlanElevationViewProps = {
  plan: StudioPlan
  view: Exclude<StudioView, 'space'>
  activeFloor: number
  selectedOpeningId?: string
  onSelectOpening?: (openingId: string) => void
  fitAllocatedHeight?: boolean
  /** room/opening ids to highlight — e.g. the source elements behind a
   * selected BOQ line. Additive to selectedOpeningId, never replaces it. */
  highlightedElementIds?: string[]
  selectedWallId?: string
  onSelectWall?: (wallId: string) => void
  /** Live position (building frame, metres) while a movable wall is dragged. */
  onWallDrag?: (wallId: string, positionM: number) => void
  /** Drag finished; positionM is NaN when the gesture was cancelled. */
  onWallDragEnd?: (wallId: string, positionM: number) => void
  onWallNudge?: (wallId: string, deltaM: number) => void
}

function openingPlanRect(opening: StudioOpening, room: StudioRoom) {
  const thickness = 0.14
  if (opening.hostEdge === 'north') return { x: room.xM + opening.positionM, y: room.yM - thickness / 2, width: opening.widthM, height: thickness }
  if (opening.hostEdge === 'south') return { x: room.xM + opening.positionM, y: room.yM + room.depthM - thickness / 2, width: opening.widthM, height: thickness }
  if (opening.hostEdge === 'east') return { x: room.xM + room.widthM - thickness / 2, y: room.yM + opening.positionM, width: thickness, height: opening.widthM }
  return { x: room.xM - thickness / 2, y: room.yM + opening.positionM, width: thickness, height: opening.widthM }
}

/** Openings are drawn in plot metres, so a 1.5 m window on a phone-sized plan is a few CSS px.
 * A non-scaling, transparent stroke expands every edge in both dimensions to
 * a 44 CSS px pointer target without changing the model drawing. The visible
 * rect remains the keyboard-accessible control. */
const HIT_TARGET_PX = 44
function OpeningHitTarget({ x, y, width, height, onSelect }: { x: number; y: number; width: number; height: number; onSelect?: () => void }) {
  return <rect x={x} y={y} width={width} height={height} data-opening-hit-target fill="transparent" stroke="transparent" strokeWidth={HIT_TARGET_PX} vectorEffect="non-scaling-stroke" pointerEvents="all" aria-hidden="true" focusable="false" className="cursor-pointer" onClick={() => onSelect?.()} />
}

const WALL_DRAG_THRESHOLD_PX = 4
type WallHandlers = {
  onSelectWall?: (wallId: string) => void
  onWallDrag?: (wallId: string, positionM: number) => void
  onWallDragEnd?: (wallId: string, positionM: number) => void
  onWallNudge?: (wallId: string, deltaM: number) => void
}

function wallRect(wall: StudioWall) {
  const half = wall.thicknessM / 2
  return wall.orientation === 'horizontal'
    ? { x: Math.min(wall.x1, wall.x2), y: wall.y1 - half, width: Math.abs(wall.x2 - wall.x1), height: wall.thicknessM }
    : { x: wall.x1 - half, y: Math.min(wall.y1, wall.y2), width: wall.thicknessM, height: Math.abs(wall.y2 - wall.y1) }
}

/** Walls are drawn to scale (thickness in metres). A transparent, non-scaling
 * 44 CSS px stroke along the centre line is the pointer/touch target, so a
 * 0.115 m partition on a phone is still comfortably tappable and draggable. */
function WallMarker({ wall, selected, highlighted, positionM, svgRef, setback, handlers }: { wall: StudioWall; selected: boolean; highlighted?: boolean; positionM: number; svgRef: RefObject<SVGSVGElement>; setback: number; handlers: WallHandlers }) {
  const movable = wall.kind === 'interior' && Boolean(wall.partitionKey)
  const drag = useRef<{ startX: number; startY: number; dragging: boolean; last: number } | null>(null)
  const rect = wallRect(wall)
  const horizontal = wall.orientation === 'horizontal'
  const toPosition = (event: ReactPointerEvent<SVGElement>) => {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!svg || !matrix) return undefined
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY
    const local = point.matrixTransform(matrix.inverse())
    return (horizontal ? local.y : local.x) - setback
  }
  const onPointerDown = (event: ReactPointerEvent<SVGLineElement>) => {
    handlers.onSelectWall?.(wall.id)
    if (!movable) return
    drag.current = { startX: event.clientX, startY: event.clientY, dragging: false, last: positionM }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  const onPointerMove = (event: ReactPointerEvent<SVGLineElement>) => {
    const state = drag.current
    if (!state) return
    const travelled = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (!Number.isFinite(travelled) || (!state.dragging && travelled < WALL_DRAG_THRESHOLD_PX)) return
    state.dragging = true
    const position = toPosition(event)
    if (position === undefined) return
    state.last = position
    handlers.onWallDrag?.(wall.id, position)
  }
  const finish = (event: ReactPointerEvent<SVGLineElement>, commit: boolean) => {
    const state = drag.current
    drag.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (state?.dragging) handlers.onWallDragEnd?.(wall.id, commit ? state.last : Number.NaN)
  }
  const onKeyDown = (event: KeyboardEvent<SVGRectElement>) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handlers.onSelectWall?.(wall.id); return }
    if (!movable || !selected) return
    const forward = horizontal ? 'ArrowDown' : 'ArrowRight'
    const backward = horizontal ? 'ArrowUp' : 'ArrowLeft'
    if (event.key !== forward && event.key !== backward) return
    event.preventDefault()
    handlers.onWallNudge?.(wall.id, (event.key === forward ? 1 : -1) * (event.shiftKey ? 0.25 : 0.05))
  }
  const fill = wall.kind === 'exterior' ? '#0B1F3A' : '#52616B'
  const stroke = selected || highlighted ? '#D97706' : 'none'
  const label = 'Select ' + wall.kind + ' wall, ' + wallLengthM(wall).toFixed(2) + ' metres long' + (movable ? ', at ' + positionM.toFixed(2) + ' metres. Selected walls move with arrow keys' : '')
  return <g data-wall-id={wall.id} data-wall-kind={wall.kind}>
    <rect {...rect} role="button" tabIndex={0} data-wall-select={wall.id} aria-pressed={selected} aria-label={label} fill={fill} stroke={stroke} strokeWidth={selected || highlighted ? 0.14 : 0} className="cursor-pointer focus-visible:stroke-[#D97706] focus-visible:stroke-[0.2]" onKeyDown={onKeyDown} onClick={() => handlers.onSelectWall?.(wall.id)} />
    <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} data-wall-hit-target={movable ? 'movable' : 'fixed'} stroke="transparent" strokeWidth={HIT_TARGET_PX} strokeLinecap="butt" vectorEffect="non-scaling-stroke" pointerEvents="stroke" aria-hidden="true" focusable="false" className={movable ? (horizontal ? 'cursor-row-resize' : 'cursor-col-resize') : 'cursor-pointer'} style={movable ? { touchAction: 'none' } : undefined} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(event) => finish(event, true)} onPointerCancel={(event) => finish(event, false)} />
    {selected && movable && <text x={horizontal ? Math.min(wall.x1, wall.x2) + 0.4 : wall.x1 + 0.4} y={horizontal ? wall.y1 - 0.45 : Math.min(wall.y1, wall.y2) + 0.9} textAnchor="start" dominantBaseline="middle" fontSize="0.5" fontWeight="700" fill="#161616" stroke="#FFFFFF" strokeWidth="0.16" paintOrder="stroke" pointerEvents="none" data-wall-readout>{positionM.toFixed(2)} m</text>}
  </g>
}

function OpeningMarker({ opening, room, selected, highlighted, onSelect }: { opening: StudioOpening; room: StudioRoom; selected: boolean; highlighted?: boolean; onSelect?: () => void }) {
  const rect = openingPlanRect(opening, room)
  const symbols = openingSegments(opening, room).slice(1)
  const select = () => onSelect?.()
  const keySelect = (event: KeyboardEvent<SVGRectElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select() } }
  const stroke = selected ? '#161616' : highlighted ? '#D97706' : '#52616B'
  return <g data-opening-configuration={opening.configuration}><rect {...rect} role="button" tabIndex={0} data-opening-id={opening.id} data-opening-kind={opening.kind} data-boq-highlighted={highlighted || undefined} aria-label={`Select ${opening.kind}, ${opening.widthM.toFixed(2)} metre wide`} aria-pressed={selected} fill={opening.kind === 'door' ? '#FFFFFF' : '#B8D0DD'} stroke={stroke} strokeWidth={selected || highlighted ? 0.2 : 0.16} className="cursor-pointer focus-visible:stroke-[#D97706] focus-visible:stroke-[0.32]" onClick={select} onKeyDown={keySelect} /><OpeningHitTarget {...rect} onSelect={select} />{symbols.map((segment, index) => <line key={index} x1={segment.x1} y1={segment.y1} x2={segment.x2} y2={segment.y2} stroke="#0B1F3A" strokeWidth="0.08" pointerEvents="none" />)}</g>
}

export default function PlanElevationView({ plan, view, activeFloor, selectedOpeningId, onSelectOpening, fitAllocatedHeight = false, highlightedElementIds = [], selectedWallId, onSelectWall, onWallDrag, onWallDragEnd, onWallNudge }: PlanElevationViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wallHandlers: WallHandlers = { onSelectWall, onWallDrag, onWallDragEnd, onWallNudge }
  const openings = plan.openings ?? []
  const isHighlighted = (id: string) => highlightedElementIds.includes(id)
  if (view === 'plan') {
    const rooms = plan.rooms.filter((room) => room.floor === activeFloor)
    return <svg ref={svgRef} viewBox={`0 0 ${plan.plotWidthM} ${plan.plotDepthM}`} className={`h-full w-full max-h-[75dvh] ${fitAllocatedHeight ? 'min-h-0' : 'min-h-[24rem]'}`} role="img" aria-label={`Floor ${activeFloor} generated room plan`}><rect width={plan.plotWidthM} height={plan.plotDepthM} fill="#F2F4F5" stroke="#52616B" strokeWidth="0.15" /><g transform={`translate(${plan.setbackM} ${plan.setbackM})`}>{rooms.map((room) => { const highlighted = isHighlighted(room.id); return <g key={room.id}><rect x={room.xM} y={room.yM} width={room.widthM} height={room.depthM} fill={room.color} stroke={highlighted ? '#D97706' : '#0B1F3A'} strokeWidth={highlighted ? 0.3 : 0.12} data-boq-highlighted={highlighted || undefined} /><text x={room.xM + room.widthM / 2} y={room.yM + room.depthM / 2} textAnchor="middle" dominantBaseline="middle" fill="#0B1F3A" fontSize="0.55">{room.name.replace(`Floor ${activeFloor} `, '')}</text></g> })}{getPlanWalls(plan).filter((wall) => wall.floor === activeFloor).map((wall) => <WallMarker key={wall.id} wall={wall} selected={wall.id === selectedWallId} highlighted={wall.roomIds.some(isHighlighted)} positionM={wallCoordinateM(wall)} svgRef={svgRef} setback={plan.setbackM} handlers={wallHandlers} />)}{openings.filter((opening) => opening.floor === activeFloor).map((opening) => { const room = rooms.find((candidate) => candidate.id === opening.roomId); return room ? <OpeningMarker key={opening.id} opening={opening} room={room} selected={opening.id === selectedOpeningId} highlighted={isHighlighted(opening.id)} onSelect={() => onSelectOpening?.(opening.id)} /> : null })}</g></svg>
  }

  const elevationId = view === 'front-elevation' ? 'north' : 'east'
  const elevation = plan.elevations.find((candidate) => candidate.id === elevationId)!
  const padding = Math.max(1, elevation.widthM * 0.08)
  const elevationOpenings = getFacadeOpenings(plan, elevationId === 'north' ? 'front' : 'side').filter(({ opening }) => opening.floor === activeFloor)
  return <svg viewBox={`${-padding} -1 ${elevation.widthM + padding * 2} ${elevation.heightM + 2}`} className={`h-full w-full ${fitAllocatedHeight ? 'min-h-0' : 'min-h-[24rem]'}`} role="img" aria-label={`${elevation.name}, ${plan.floors} floors`}><rect x="0" y="0" width={elevation.widthM} height={elevation.heightM} fill="#DCE8EF" stroke="#0B1F3A" strokeWidth="0.12" />{elevation.floorLinesM.map((height) => <line key={height} x1="0" x2={elevation.widthM} y1={height} y2={height} stroke="#52616B" strokeWidth="0.08" />)}{elevationOpenings.map(({ opening, room }) => { const x = elevationId === 'north' ? room.xM + opening.positionM : room.yM + opening.positionM; const y = elevation.heightM - ((opening.floor - 1) * plan.floorHeightM + opening.sillM + opening.heightM); const selected = opening.id === selectedOpeningId; const highlighted = isHighlighted(opening.id); const symbol = opening.configuration === 'double-swing' ? <><line x1={x} y1={y + opening.heightM} x2={x + opening.widthM / 2} y2={y} /><line x1={x + opening.widthM} y1={y + opening.heightM} x2={x + opening.widthM / 2} y2={y} /></> : opening.configuration === 'sliding' ? <line x1={x + opening.widthM / 2} y1={y} x2={x + opening.widthM / 2} y2={y + opening.heightM} /> : opening.configuration === 'fixed' ? <line x1={x} y1={y + opening.heightM / 2} x2={x + opening.widthM} y2={y + opening.heightM / 2} /> : <line x1={x} y1={y + opening.heightM} x2={x + opening.widthM} y2={y} />; return <g key={opening.id} data-opening-configuration={opening.configuration}><rect x={x} y={y} width={opening.widthM} height={opening.heightM} role="button" tabIndex={0} data-opening-id={opening.id} data-opening-kind={opening.kind} data-boq-highlighted={highlighted || undefined} aria-label={`Select ${opening.kind} in ${elevation.name}`} aria-pressed={selected} fill={opening.kind === 'door' ? '#FFFFFF' : '#B8D0DD'} stroke={selected ? '#161616' : highlighted ? '#D97706' : '#0B1F3A'} strokeWidth={selected || highlighted ? 0.14 : 0.08} className="cursor-pointer focus-visible:stroke-[#D97706] focus-visible:stroke-[0.2]" onClick={() => onSelectOpening?.(opening.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectOpening?.(opening.id) } }} /><OpeningHitTarget x={x} y={y} width={opening.widthM} height={opening.heightM} onSelect={() => onSelectOpening?.(opening.id)} /><g stroke="#0B1F3A" strokeWidth="0.06" pointerEvents="none">{symbol}</g></g> })}<line x1={-padding} x2={elevation.widthM + padding} y1={elevation.heightM} y2={elevation.heightM} stroke="#138808" strokeWidth="0.12" /></svg>
}
