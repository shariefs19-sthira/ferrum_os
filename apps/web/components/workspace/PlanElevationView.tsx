import type { StudioPlan, StudioView } from '../../lib/types'

type PlanElevationViewProps = {
  plan: StudioPlan
  view: Exclude<StudioView, 'space'>
  activeFloor: number
}
export default function PlanElevationView({ plan, view, activeFloor }: PlanElevationViewProps) {
  if (view === 'plan') {
    const rooms = plan.rooms.filter((room) => room.floor === activeFloor)
    return (
      <svg viewBox={`0 0 ${plan.plotWidthM} ${plan.plotDepthM}`} className="h-full min-h-[24rem] w-full" role="img" aria-label={`Floor ${activeFloor} generated room plan`}>
        <rect width={plan.plotWidthM} height={plan.plotDepthM} fill="#F2F4F5" stroke="#52616B" strokeWidth="0.15" />
        <g transform={`translate(${plan.setbackM} ${plan.setbackM})`}>
          {rooms.map((room) => (
            <g key={room.id}>
              <rect x={room.xM} y={room.yM} width={room.widthM} height={room.depthM} fill={room.color} stroke="#0B1F3A" strokeWidth="0.12" />
              <text x={room.xM + room.widthM / 2} y={room.yM + room.depthM / 2} textAnchor="middle" dominantBaseline="middle" fill="#0B1F3A" fontSize="0.55">
                {room.name.replace(`Floor ${activeFloor} `, '')}
              </text>
            </g>
          ))}
        </g>
      </svg>
    )
  }

  const elevation = plan.elevations.find((candidate) => candidate.id === (view === 'front-elevation' ? 'north' : 'east'))!
  const padding = Math.max(1, elevation.widthM * 0.08)
  return (
    <svg viewBox={`${-padding} -1 ${elevation.widthM + padding * 2} ${elevation.heightM + 2}`} className="h-full min-h-[24rem] w-full" role="img" aria-label={`${elevation.name}, ${plan.floors} floors`}>
      <rect x="0" y="0" width={elevation.widthM} height={elevation.heightM} fill="#DCE8EF" stroke="#0B1F3A" strokeWidth="0.12" />
      {elevation.floorLinesM.map((height) => <line key={height} x1="0" x2={elevation.widthM} y1={height} y2={height} stroke="#52616B" strokeWidth="0.08" />)}
      {Array.from({ length: plan.floors }, (_, floor) => (
        <g key={floor}>
          <rect x={elevation.widthM * 0.12} y={floor * plan.floorHeightM + plan.floorHeightM * 0.25} width={elevation.widthM * 0.22} height={plan.floorHeightM * 0.42} fill="#B8D0DD" stroke="#0B1F3A" strokeWidth="0.06" />
          <rect x={elevation.widthM * 0.66} y={floor * plan.floorHeightM + plan.floorHeightM * 0.25} width={elevation.widthM * 0.22} height={plan.floorHeightM * 0.42} fill="#B8D0DD" stroke="#0B1F3A" strokeWidth="0.06" />
        </g>
      ))}
      <line x1={-padding} x2={elevation.widthM + padding} y1={elevation.heightM} y2={elevation.heightM} stroke="#138808" strokeWidth="0.12" />
    </svg>
  )
}
