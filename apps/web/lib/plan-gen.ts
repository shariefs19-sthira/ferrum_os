import type { StudioPlan, StudioRoom } from './types'

type PlanInput = {
  plotWidthM: number
  plotDepthM: number
  setbackM: number
  floors: number
  floorHeightM?: number
}
const roomColors = ['#DCE8EF', '#F4DFC4', '#DCEBDD', '#E8E3F0', '#F2E9CF']

function room(
  floor: number,
  index: number,
  name: string,
  xM: number,
  yM: number,
  widthM: number,
  depthM: number,
): StudioRoom {
  return {
    id: `f${floor}-r${index}`,
    name,
    floor,
    xM,
    yM,
    widthM,
    depthM,
    areaSqm: widthM * depthM,
    color: roomColors[index % roomColors.length],
  }
}

export function generateStudioPlan(input: PlanInput): StudioPlan {
  const plotWidthM = Math.max(6, input.plotWidthM)
  const plotDepthM = Math.max(8, input.plotDepthM)
  const maximumSetback = Math.max(0, Math.min(plotWidthM, plotDepthM) / 2 - 2)
  const setbackM = Math.max(0, Math.min(input.setbackM, maximumSetback))
  const buildingWidthM = plotWidthM - setbackM * 2
  const buildingDepthM = plotDepthM - setbackM * 2
  const floors = Math.max(1, Math.round(input.floors))
  const floorHeightM = input.floorHeightM ?? 3
  const rooms: StudioRoom[] = []

  for (let floor = 1; floor <= floors; floor += 1) {
    const frontDepth = buildingDepthM * 0.55
    const rearDepth = buildingDepthM - frontDepth
    const frontLeftWidth = buildingWidthM * 0.62
    const frontRightWidth = buildingWidthM - frontLeftWidth
    const rearLeftWidth = buildingWidthM * 0.36
    const rearMiddleWidth = buildingWidthM * 0.28
    const rearRightWidth = buildingWidthM - rearLeftWidth - rearMiddleWidth
    const prefix = floor === 1 ? '' : `Floor ${floor} `

    rooms.push(
      room(floor, 0, `${prefix}${floor === 1 ? 'Living / dining' : 'Family room'}`, 0, 0, frontLeftWidth, frontDepth),
      room(floor, 1, `${prefix}Bedroom`, frontLeftWidth, 0, frontRightWidth, frontDepth),
      room(floor, 2, `${prefix}${floor === 1 ? 'Kitchen' : 'Bedroom'}`, 0, frontDepth, rearLeftWidth, rearDepth),
      room(floor, 3, `${prefix}Stair / circulation`, rearLeftWidth, frontDepth, rearMiddleWidth, rearDepth),
      room(floor, 4, `${prefix}${floor === 1 ? 'Utility / bath' : 'Bath / storage'}`, rearLeftWidth + rearMiddleWidth, frontDepth, rearRightWidth, rearDepth),
    )
  }

  const heightM = floors * floorHeightM
  const floorLinesM = Array.from({ length: Math.max(0, floors - 1) }, (_, index) => (index + 1) * floorHeightM)

  return {
    schema: 'ferrum-plan-v1',
    plotWidthM,
    plotDepthM,
    setbackM,
    buildingWidthM,
    buildingDepthM,
    floors,
    floorHeightM,
    rooms,
    elevations: [
      { id: 'north', name: 'North elevation', widthM: buildingWidthM, heightM, floorLinesM },
      { id: 'east', name: 'East elevation', widthM: buildingDepthM, heightM, floorLinesM },
    ],
    generatedBy: 'deterministic-layout-v1',
  }
}
