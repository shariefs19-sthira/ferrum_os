import type { StudioPlan, StudioRoom } from './types'
import { createDefaultOpenings } from './workspace/openings'
import { deriveWalls, resolvePartitions, type WallOffsets } from './workspace/walls'

type PlanInput = {
  plotWidthM: number
  plotDepthM: number
  setbackM: number
  floors: number
  floorHeightM?: number
  maxHeightM?: number
  /** Per-partition offsets (metres) from the generated default, keyed `int-h0`/`int-v0`… */
  wallOffsets?: WallOffsets
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
  const floorHeightM = input.floorHeightM ?? 3
  const heightFloorCap = Number.isFinite(input.maxHeightM)
    ? Math.max(1, Math.floor((input.maxHeightM as number) / floorHeightM))
    : Number.MAX_SAFE_INTEGER
  const floors = Math.max(1, Math.min(Math.round(input.floors), heightFloorCap))
  const rooms: StudioRoom[] = []
  const partitions = resolvePartitions(buildingWidthM, buildingDepthM, input.wallOffsets)

  for (let floor = 1; floor <= floors; floor += 1) {
    const frontDepth = partitions.splitY
    const rearDepth = buildingDepthM - frontDepth
    const frontLeftWidth = partitions.frontX
    const frontRightWidth = buildingWidthM - frontLeftWidth
    const rearLeftWidth = partitions.rearX1
    const rearMiddleWidth = partitions.rearX2 - partitions.rearX1
    const rearRightWidth = buildingWidthM - partitions.rearX2
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
    openings: createDefaultOpenings(rooms, floorHeightM),
    walls: deriveWalls(rooms, floorHeightM, buildingWidthM, buildingDepthM),
    elevations: [
      { id: 'north', name: 'North elevation', widthM: buildingWidthM, heightM, floorLinesM },
      { id: 'east', name: 'East elevation', widthM: buildingDepthM, heightM, floorLinesM },
    ],
    generatedBy: 'deterministic-layout-v1',
  }
}
