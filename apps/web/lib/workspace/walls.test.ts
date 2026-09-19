import { describe, expect, it } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { planFingerprint } from './boqLineage'
import {
  attachOpeningsToWalls, defaultPartitions, deriveWalls, EXTERIOR_WALL_THICKNESS_M, getPlanWalls, INTERIOR_WALL_THICKNESS_M,
  MIN_ROOM_DIMENSION_M, moveWall, resetWall, planWallSolids, wallSolidsDigest, resolvePartitions, unattachedOpenings, wallLengthM,
} from './walls'

const base = { plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 2 }
const plan = () => generateStudioPlan(base)

describe('canonical walls', () => {
  it('derives 4 exterior + 4 interior walls per floor with thickness and height', () => {
    const walls = plan().walls!
    expect(walls).toHaveLength(16)
    for (const floor of [1, 2]) {
      const onFloor = walls.filter((wall) => wall.floor === floor)
      expect(onFloor.filter((wall) => wall.kind === 'exterior').map((wall) => wall.id).sort()).toEqual([`f${floor}-ext-east`, `f${floor}-ext-north`, `f${floor}-ext-south`, `f${floor}-ext-west`])
      expect(onFloor.filter((wall) => wall.kind === 'interior').map((wall) => wall.partitionKey).sort()).toEqual(['int-h0', 'int-v0', 'int-v1', 'int-v2'])
    }
    for (const wall of walls) {
      expect(wall.thicknessM).toBe(wall.kind === 'exterior' ? EXTERIOR_WALL_THICKNESS_M : INTERIOR_WALL_THICKNESS_M)
      expect(wall.heightM).toBe(3)
    }
  })

  it('exterior walls close the building perimeter exactly', () => {
    const p = plan()
    const perimeter = p.walls!.filter((wall) => wall.floor === 1 && wall.kind === 'exterior').reduce((sum, wall) => sum + wallLengthM(wall), 0)
    expect(perimeter).toBeCloseTo(2 * (p.buildingWidthM + p.buildingDepthM), 6)
  })

  it('attaches every generated opening to a host wall on its own floor', () => {
    const p = plan()
    const hosts = attachOpeningsToWalls(p)
    expect(unattachedOpenings(p)).toEqual([])
    for (const opening of p.openings!) {
      const wall = p.walls!.find((candidate) => candidate.id === hosts[opening.id])!
      expect(wall.floor).toBe(opening.floor)
    }
  })

  it('derives walls for a plan saved before the wall model (no plan.walls)', () => {
    const { walls: _walls, ...legacy } = plan()
    expect(getPlanWalls(legacy)).toEqual(plan().walls)
  })
})

describe('moving an interior wall', () => {
  it('snaps to 5 cm steps from the generated position, is pure, and reshapes the rooms on both sides on every floor', () => {
    const p = plan()
    const input = {}
    const result = moveWall(input, 'int-v0', p.buildingWidthM * 0.62 + 1.03, p.buildingWidthM, p.buildingDepthM)
    expect(input).toEqual({})
    expect(result.changed).toBe(true)
    const stepsFromDefault = (result.positionM - p.buildingWidthM * 0.62) / 0.05
    expect(Math.abs(stepsFromDefault - Math.round(stepsFromDefault))).toBeLessThan(1e-6)
    const moved = generateStudioPlan({ ...base, wallOffsets: result.offsets })
    for (const floor of [1, 2]) {
      const [left, right] = moved.rooms.filter((room) => room.floor === floor).slice(0, 2)
      expect(left.widthM).toBeCloseTo(result.positionM, 6)
      expect(right.xM).toBeCloseTo(result.positionM, 6)
      expect(left.widthM + right.widthM).toBeCloseTo(p.buildingWidthM, 6)
    }
    expect(moved.walls!.find((wall) => wall.id === 'f1-int-v0')!.x1).toBeCloseTo(result.positionM, 6)
  })

  it('keeps ids stable and every opening attached after a move', () => {
    const p = plan()
    const moved = generateStudioPlan({ ...base, wallOffsets: moveWall({}, 'int-h0', 9, p.buildingWidthM, p.buildingDepthM).offsets })
    expect(moved.walls!.map((wall) => wall.id)).toEqual(p.walls!.map((wall) => wall.id))
    expect(unattachedOpenings(moved)).toEqual([])
  })

  it('clamps at the minimum room dimension and reports it', () => {
    const p = plan()
    const result = moveWall({}, 'int-v0', 0.2, p.buildingWidthM, p.buildingDepthM)
    expect(result.clamped).toBe(true)
    expect(result.positionM).toBeCloseTo(Math.min(MIN_ROOM_DIMENSION_M, p.buildingWidthM / 3), 6)
    const moved = generateStudioPlan({ ...base, wallOffsets: result.offsets })
    expect(Math.min(...moved.rooms.map((room) => Math.min(room.widthM, room.depthM)))).toBeGreaterThanOrEqual(MIN_ROOM_DIMENSION_M - 1e-6)
  })

  it('never lets the two rear walls cross', () => {
    const { rearX1, rearX2 } = resolvePartitions(16, 26, { 'int-v1': 8, 'int-v2': -8 })
    expect(rearX2 - rearX1).toBeGreaterThanOrEqual(MIN_ROOM_DIMENSION_M - 1e-6)
  })

  it('a move back to the generated position (or reset) drops the offset, and unknown or non-finite input is rejected', () => {
    const p = plan()
    const start = defaultPartitions(p.buildingWidthM, p.buildingDepthM).frontX
    const moved = moveWall({}, 'int-v0', start + 1, p.buildingWidthM, p.buildingDepthM)
    expect(Object.keys(moved.offsets)).toEqual(['int-v0'])
    expect(resetWall(moved.offsets, 'int-v0')).toEqual({})
    expect(resetWall({}, 'int-v0')).toEqual({})
    const back = moveWall(moved.offsets, 'int-v0', start, p.buildingWidthM, p.buildingDepthM)
    expect(back.offsets).toEqual({})
    expect(moveWall({}, 'ext-north', 3, 10, 10).changed).toBe(false)
    expect(moveWall({}, 'int-v0', Number.NaN, 10, 10).changed).toBe(false)
  })

  it('default offsets reproduce the pre-wall room layout', () => {
    const p = generateStudioPlan({ ...base, wallOffsets: {} })
    expect(p.rooms[0].widthM).toBeCloseTo(p.buildingWidthM * 0.62, 9)
    expect(p.rooms[3].widthM).toBeCloseTo(p.buildingWidthM * 0.28, 9)
    expect(p.rooms[0].depthM).toBeCloseTo(p.buildingDepthM * 0.55, 9)
  })
})

describe('3D solids match the wall model', () => {
  it('wall solid volume equals wall volume minus the hosted opening voids', () => {
    const p = generateStudioPlan({ ...base, floors: 1 })
    const solids = planWallSolids(p).filter((solid) => solid.part === 'wall')
    const volume = solids.reduce((sum, solid) => sum + solid.sx * solid.sy * solid.sz, 0)
    const hosts = attachOpeningsToWalls(p)
    const wallVolume = p.walls!.reduce((sum, wall) => sum + wallLengthM(wall) * wall.thicknessM * wall.heightM, 0)
    const voids = p.openings!.reduce((sum, opening) => {
      const wall = p.walls!.find((candidate) => candidate.id === hosts[opening.id])!
      return sum + opening.widthM * Math.min(opening.heightM, wall.heightM - opening.sillM) * wall.thicknessM
    }, 0)
    expect(volume).toBeCloseTo(wallVolume - voids, 4)
  })

  it('places one glazing pane per window and none for doors', () => {
    const p = generateStudioPlan({ ...base, floors: 1 })
    const panes = planWallSolids(p).filter((solid) => solid.part === 'glass')
    expect(panes).toHaveLength(p.openings!.filter((opening) => opening.kind === 'window').length)
  })

  it('publishes a digest that changes with a wall move and is identical for identical geometry', () => {
    const digest = (offsets: Record<string, number>) => wallSolidsDigest(planWallSolids(generateStudioPlan({ ...base, floors: 1, wallOffsets: offsets })))
    expect(digest({})).toBe(digest({}))
    expect(digest({ 'int-v0': 1 })).not.toBe(digest({}))
    expect(digest({ 'int-v0': 1 })).toBe(digest({ 'int-v0': 1 }))
  })

  it('follows a wall move: solids change with geometry', () => {
    const before = planWallSolids(generateStudioPlan({ ...base, floors: 1 }))
    const moved = planWallSolids(generateStudioPlan({ ...base, floors: 1, wallOffsets: { 'int-v0': 2 } }))
    expect(JSON.stringify(moved)).not.toBe(JSON.stringify(before))
  })
})

describe('geometry revision fingerprint', () => {
  it('changes when an interior wall moves', () => {
    expect(planFingerprint(generateStudioPlan({ ...base, wallOffsets: { 'int-v0': 1 } }))).not.toBe(planFingerprint(plan()))
  })

  it('is unchanged by cosmetic edits (room colour, labels)', () => {
    const p = plan()
    const cosmetic = { ...p, rooms: p.rooms.map((room) => ({ ...room, color: '#000000', name: `${room.name} renamed` })), elevations: p.elevations.map((e) => ({ ...e, name: 'Renamed' })) }
    expect(planFingerprint(cosmetic)).toBe(planFingerprint(p))
  })

  it('ignores default walls (stable for stored BOQ revisions) but tracks a customised thickness or height', () => {
    const p = plan()
    const { walls: _drop, ...legacy } = p
    expect(planFingerprint(legacy)).toBe(planFingerprint(p))
    const thicker = { ...p, walls: p.walls!.map((wall) => wall.id === 'f1-int-v0' ? { ...wall, thicknessM: 0.23 } : wall) }
    expect(planFingerprint(thicker)).not.toBe(planFingerprint(p))
    const taller = { ...p, walls: p.walls!.map((wall) => wall.id === 'f1-ext-north' ? { ...wall, heightM: 3.3 } : wall) }
    expect(planFingerprint(taller)).not.toBe(planFingerprint(p))
  })

  it('deriveWalls is deterministic', () => {
    const p = plan()
    expect(deriveWalls(p.rooms, p.floorHeightM, p.buildingWidthM, p.buildingDepthM)).toEqual(deriveWalls(p.rooms, p.floorHeightM, p.buildingWidthM, p.buildingDepthM))
  })
})
