import type { StudioOpening, StudioPlan, StudioRoom, StudioView } from '../../lib/types'
import type { KeyboardEvent } from 'react'
import { getFacadeOpenings, openingSegments } from '../../lib/workspace/openings'

type PlanElevationViewProps = {
  plan: StudioPlan
  view: Exclude<StudioView, 'space'>
  activeFloor: number
  selectedOpeningId?: string
  onSelectOpening?: (openingId: string) => void
}

function openingPlanRect(opening: StudioOpening, room: StudioRoom) {
  const thickness = 0.14
  if (opening.hostEdge === 'north') return { x: room.xM + opening.positionM, y: room.yM - thickness / 2, width: opening.widthM, height: thickness }
  if (opening.hostEdge === 'south') return { x: room.xM + opening.positionM, y: room.yM + room.depthM - thickness / 2, width: opening.widthM, height: thickness }
  if (opening.hostEdge === 'east') return { x: room.xM + room.widthM - thickness / 2, y: room.yM + opening.positionM, width: thickness, height: opening.widthM }
  return { x: room.xM - thickness / 2, y: room.yM + opening.positionM, width: thickness, height: opening.widthM }
}

function OpeningMarker({ opening, room, selected, onSelect }: { opening: StudioOpening; room: StudioRoom; selected: boolean; onSelect?: () => void }) {
  const rect = openingPlanRect(opening, room)
  const symbols = openingSegments(opening, room).slice(1)
  const select = () => onSelect?.()
  const keySelect = (event: KeyboardEvent<SVGRectElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select() } }
  return <g data-opening-configuration={opening.configuration}><rect {...rect} role="button" tabIndex={0} data-opening-id={opening.id} data-opening-kind={opening.kind} aria-label={`Select ${opening.kind}, ${opening.widthM.toFixed(2)} metre wide`} aria-pressed={selected} fill={opening.kind === 'door' ? '#FFFFFF' : '#B8D0DD'} stroke={selected ? '#161616' : '#52616B'} strokeWidth={selected ? 0.2 : 0.16} className="cursor-pointer focus-visible:stroke-[#D97706] focus-visible:stroke-[0.32]" onClick={select} onKeyDown={keySelect} />{symbols.map((segment, index) => <line key={index} x1={segment.x1} y1={segment.y1} x2={segment.x2} y2={segment.y2} stroke="#0B1F3A" strokeWidth="0.08" pointerEvents="none" />)}</g>
}

export default function PlanElevationView({ plan, view, activeFloor, selectedOpeningId, onSelectOpening }: PlanElevationViewProps) {
  const openings = plan.openings ?? []
  if (view === 'plan') {
    const rooms = plan.rooms.filter((room) => room.floor === activeFloor)
    return <svg viewBox={`0 0 ${plan.plotWidthM} ${plan.plotDepthM}`} className="h-full min-h-[24rem] w-full" role="img" aria-label={`Floor ${activeFloor} generated room plan`}><rect width={plan.plotWidthM} height={plan.plotDepthM} fill="#F2F4F5" stroke="#52616B" strokeWidth="0.15" /><g transform={`translate(${plan.setbackM} ${plan.setbackM})`}>{rooms.map((room) => <g key={room.id}><rect x={room.xM} y={room.yM} width={room.widthM} height={room.depthM} fill={room.color} stroke="#0B1F3A" strokeWidth="0.12" /><text x={room.xM + room.widthM / 2} y={room.yM + room.depthM / 2} textAnchor="middle" dominantBaseline="middle" fill="#0B1F3A" fontSize="0.55">{room.name.replace(`Floor ${activeFloor} `, '')}</text></g>)}{openings.filter((opening) => opening.floor === activeFloor).map((opening) => { const room = rooms.find((candidate) => candidate.id === opening.roomId); return room ? <OpeningMarker key={opening.id} opening={opening} room={room} selected={opening.id === selectedOpeningId} onSelect={() => onSelectOpening?.(opening.id)} /> : null })}</g></svg>
  }

  const elevationId = view === 'front-elevation' ? 'north' : 'east'
  const elevation = plan.elevations.find((candidate) => candidate.id === elevationId)!
  const padding = Math.max(1, elevation.widthM * 0.08)
  const elevationOpenings = getFacadeOpenings(plan, elevationId === 'north' ? 'front' : 'side').filter(({ opening }) => opening.floor === activeFloor)
  return <svg viewBox={`${-padding} -1 ${elevation.widthM + padding * 2} ${elevation.heightM + 2}`} className="h-full min-h-[24rem] w-full" role="img" aria-label={`${elevation.name}, ${plan.floors} floors`}><rect x="0" y="0" width={elevation.widthM} height={elevation.heightM} fill="#DCE8EF" stroke="#0B1F3A" strokeWidth="0.12" />{elevation.floorLinesM.map((height) => <line key={height} x1="0" x2={elevation.widthM} y1={height} y2={height} stroke="#52616B" strokeWidth="0.08" />)}{elevationOpenings.map(({ opening, room }) => { const x = elevationId === 'north' ? room.xM + opening.positionM : room.yM + opening.positionM; const y = elevation.heightM - ((opening.floor - 1) * plan.floorHeightM + opening.sillM + opening.heightM); const selected = opening.id === selectedOpeningId; const symbol = opening.configuration === 'double-swing' ? <><line x1={x} y1={y + opening.heightM} x2={x + opening.widthM / 2} y2={y} /><line x1={x + opening.widthM} y1={y + opening.heightM} x2={x + opening.widthM / 2} y2={y} /></> : opening.configuration === 'sliding' ? <line x1={x + opening.widthM / 2} y1={y} x2={x + opening.widthM / 2} y2={y + opening.heightM} /> : opening.configuration === 'fixed' ? <line x1={x} y1={y + opening.heightM / 2} x2={x + opening.widthM} y2={y + opening.heightM / 2} /> : <line x1={x} y1={y + opening.heightM} x2={x + opening.widthM} y2={y} />; return <g key={opening.id} data-opening-configuration={opening.configuration}><rect x={x} y={y} width={opening.widthM} height={opening.heightM} role="button" tabIndex={0} data-opening-id={opening.id} data-opening-kind={opening.kind} aria-label={`Select ${opening.kind} in ${elevation.name}`} aria-pressed={selected} fill={opening.kind === 'door' ? '#FFFFFF' : '#B8D0DD'} stroke={selected ? '#161616' : '#0B1F3A'} strokeWidth={selected ? 0.12 : 0.08} className="cursor-pointer focus-visible:stroke-[#D97706] focus-visible:stroke-[0.2]" onClick={() => onSelectOpening?.(opening.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelectOpening?.(opening.id) } }} /><g stroke="#0B1F3A" strokeWidth="0.06" pointerEvents="none">{symbol}</g></g> })}<line x1={-padding} x2={elevation.widthM + padding} y1={elevation.heightM} y2={elevation.heightM} stroke="#138808" strokeWidth="0.12" /></svg>
}
