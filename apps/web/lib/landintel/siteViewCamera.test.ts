import { describe, expect, it } from 'vitest'
import {
  MAX_RANGE_M,
  METRES_PER_FOOT,
  MIN_RANGE_M,
  OBLIQUE_PITCH_DEG,
  SiteViewCameraError,
  TOP_DOWN_PITCH_DEG,
  createFlyIn,
  easeInOutCubic,
  feetToMetres,
  flyInStartFrame,
  frameForParcel,
  isValidCoordinate,
  normalizeBearing,
  rangeReadout,
  resetNorth,
  sampleFlyIn,
  toMapLibreCamera,
  toggleTilt,
  type SiteViewFrame,
} from './siteViewCamera'

const parcel = frameForParcel([77.5946, 12.9716], { extentM: 200, bearingDeg: 350 })

describe('frameForParcel', () => {
  it('centres on the parcel, oblique, range from extent', () => {
    expect(parcel.center).toEqual([77.5946, 12.9716])
    expect(parcel.pitchDeg).toBe(OBLIQUE_PITCH_DEG)
    expect(parcel.rangeM).toBe(500)
    expect(parcel.bearingDeg).toBe(350)
  })
  it('clamps range and defaults to north-up', () => {
    expect(frameForParcel([0, 0], { extentM: 1 }).rangeM).toBe(MIN_RANGE_M)
    expect(frameForParcel([0, 0], { extentM: 1e9 }).rangeM).toBe(MAX_RANGE_M)
    expect(frameForParcel([0, 0]).bearingDeg).toBe(0)
  })
  it('does not alias the input centroid', () => {
    const c: [number, number] = [10, 20]
    const f = frameForParcel(c)
    c[0] = 99
    expect(f.center[0]).toBe(10)
  })
})

describe('input validation', () => {
  it.each([[[NaN, 0]], [[0, Infinity]], [[181, 0]], [[0, -90.5]], [[1]], [null], [['1', '2']]])(
    'rejects invalid coordinate %j',
    (c) => {
      expect(isValidCoordinate(c)).toBe(false)
      expect(() => frameForParcel(c as never)).toThrow(SiteViewCameraError)
    },
  )
  it('accepts boundary coordinates', () => {
    expect(isValidCoordinate([-180, -90])).toBe(true)
    expect(isValidCoordinate([180, 90])).toBe(true)
  })
  it('rejects bad extent, pitch, range, progress and duration', () => {
    expect(() => frameForParcel([0, 0], { extentM: 0 })).toThrow(SiteViewCameraError)
    expect(() => frameForParcel([0, 0], { extentM: NaN })).toThrow(SiteViewCameraError)
    expect(() => frameForParcel([0, 0], { bearingDeg: NaN })).toThrow(SiteViewCameraError)
    expect(() => toggleTilt({ ...parcel, pitchDeg: 120 })).toThrow(SiteViewCameraError)
    expect(() => toggleTilt({ ...parcel, rangeM: 0 })).toThrow(SiteViewCameraError)
    expect(() => sampleFlyIn(parcel, parcel, NaN)).toThrow(SiteViewCameraError)
    expect(() => createFlyIn(parcel, parcel, 0)).toThrow(SiteViewCameraError)
    expect(() => rangeReadout(-1)).toThrow(SiteViewCameraError)
    expect(() => rangeReadout(NaN)).toThrow(SiteViewCameraError)
  })
})

describe('bearing', () => {
  it.each([
    [0, 0],
    [360, 0],
    [-1, 359],
    [-360, 0],
    [721, 1],
    [359.5, 359.5],
  ])('normalizes %d to %d', (input, out) => {
    expect(normalizeBearing(input)).toBe(out)
  })
  it('never returns 360 for tiny negatives', () => {
    expect(normalizeBearing(-1e-20)).toBeLessThan(360)
  })
  it('resetNorth zeroes bearing and keeps the rest', () => {
    const r = resetNorth(parcel)
    expect(r).toEqual({ ...parcel, bearingDeg: 0 })
    expect(resetNorth(r)).toEqual(r)
  })
})

describe('tilt', () => {
  it('toggles oblique <-> top-down and is an involution on presets', () => {
    const top = toggleTilt(parcel)
    expect(top.pitchDeg).toBe(TOP_DOWN_PITCH_DEG)
    expect(toggleTilt(top)).toEqual(parcel)
  })
  it('snaps intermediate pitches to the nearer-opposite preset', () => {
    expect(toggleTilt({ ...parcel, pitchDeg: 10 }).pitchDeg).toBe(OBLIQUE_PITCH_DEG)
    expect(toggleTilt({ ...parcel, pitchDeg: 70 }).pitchDeg).toBe(TOP_DOWN_PITCH_DEG)
  })
})

describe('easing', () => {
  it('is exact at endpoints and midpoint and clamps outside', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(0.5)).toBe(0.5)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(-3)).toBe(0)
    expect(easeInOutCubic(9)).toBe(1)
  })
  it('is monotonic non-decreasing', () => {
    let prev = -1
    for (let i = 0; i <= 1000; i++) {
      const v = easeInOutCubic(i / 1000)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
})

describe('sampleFlyIn', () => {
  const from = flyInStartFrame(parcel)
  it('returns exactly from at 0 and to at 1 (and clamps)', () => {
    expect(sampleFlyIn(from, parcel, 0)).toEqual(from)
    expect(sampleFlyIn(from, parcel, 1)).toEqual(parcel)
    expect(sampleFlyIn(from, parcel, -5)).toEqual(from)
    expect(sampleFlyIn(from, parcel, 5)).toEqual(parcel)
  })
  it('is deterministic', () => {
    expect(sampleFlyIn(from, parcel, 0.37)).toEqual(sampleFlyIn(from, parcel, 0.37))
  })
  it('descends monotonically in range and pitch', () => {
    let range = Infinity
    let pitch = -1
    for (let i = 0; i <= 100; i++) {
      const s = sampleFlyIn(from, parcel, i / 100)
      expect(s.rangeM).toBeLessThanOrEqual(range)
      expect(s.pitchDeg).toBeGreaterThanOrEqual(pitch)
      range = s.rangeM
      pitch = s.pitchDeg
    }
  })
  it('takes the shortest bearing arc across north', () => {
    const a: SiteViewFrame = { ...parcel, bearingDeg: 350 }
    const b: SiteViewFrame = { ...parcel, bearingDeg: 10 }
    const mid = sampleFlyIn(a, b, 0.5).bearingDeg
    expect(Math.min(mid, 360 - mid)).toBeCloseTo(0, 9)
    for (let i = 1; i < 100; i++) {
      const s = sampleFlyIn(a, b, i / 100).bearingDeg
      expect(s >= 350 || s <= 10).toBe(true)
    }
    const back = sampleFlyIn(b, a, 0.25).bearingDeg
    expect(back >= 350 || back <= 10).toBe(true)
  })
  it('takes the shortest longitude arc across the antimeridian', () => {
    const a = frameForParcel([179, 10])
    const b = frameForParcel([-179, 10])
    const mid = sampleFlyIn(a, b, 0.5).center[0]
    expect(Math.abs(Math.abs(mid) - 180)).toBeLessThan(1e-9)
    for (let i = 1; i < 100; i++) {
      expect(Math.abs(sampleFlyIn(a, b, i / 100).center[0])).toBeGreaterThanOrEqual(179)
    }
  })
  it('does not mutate inputs', () => {
    const snapshot = JSON.stringify(from)
    sampleFlyIn(from, parcel, 0.4)
    expect(JSON.stringify(from)).toBe(snapshot)
  })
})

describe('flyInStartFrame', () => {
  it('keeps the target, goes top-down and farther', () => {
    const s = flyInStartFrame(parcel, 4)
    expect(s.center).toEqual(parcel.center)
    expect(s.pitchDeg).toBe(TOP_DOWN_PITCH_DEG)
    expect(s.rangeM).toBe(parcel.rangeM * 4)
    expect(() => flyInStartFrame(parcel, 0.5)).toThrow(SiteViewCameraError)
  })
})

describe('createFlyIn (cancellable)', () => {
  const from = flyInStartFrame(parcel)
  it('follows sampleFlyIn and ends on target', () => {
    const fly = createFlyIn(from, parcel, 2000)
    expect(fly.sampleAt(0)).toEqual(from)
    expect(fly.sampleAt(1000)).toEqual(sampleFlyIn(from, parcel, 0.5))
    expect(fly.sampleAt(2000)).toEqual(parcel)
    expect(fly.sampleAt(9999)).toEqual(parcel)
    expect(fly.isDone(1999)).toBe(false)
    expect(fly.isDone(2000)).toBe(true)
  })
  it('freezes at the cancel point and stays frozen', () => {
    const fly = createFlyIn(from, parcel, 2000)
    const at = fly.cancel(600)
    expect(at).toEqual(sampleFlyIn(from, parcel, 0.3))
    expect(fly.cancelled).toBe(true)
    expect(fly.sampleAt(2000)).toEqual(at)
    expect(fly.cancel(1500)).toEqual(at)
    expect(fly.isDone(0)).toBe(true)
  })
  it('does not leak mutable state through returned frames', () => {
    const fly = createFlyIn(from, parcel, 1000)
    fly.cancel(500).center[0] = 0
    expect(fly.sampleAt(0).center[0]).not.toBe(0)
  })
})

describe('rangeReadout', () => {
  it('uses exact 0.3048 m/ft', () => {
    expect(METRES_PER_FOOT).toBe(0.3048)
    expect(rangeReadout(304.8)).toEqual({ m: 304.8, ft: 1000, label: '304.8 m / 1,000 ft' })
    expect(rangeReadout(0)).toEqual({ m: 0, ft: 0, label: '0 m / 0 ft' })
  })
  it('round-trips within rounding precision', () => {
    for (const m of [1, 12.34, 500, 12_345.6, MAX_RANGE_M]) {
      const r = rangeReadout(m)
      expect(Math.abs(feetToMetres(r.ft) - m)).toBeLessThanOrEqual(0.05 * METRES_PER_FOOT + 0.05 + 1e-9)
      expect(Math.abs(r.m - m)).toBeLessThanOrEqual(0.05 + 1e-9)
    }
  })
  it('shows both units for the parcel frame', () => {
    expect(rangeReadout(parcel.rangeM).label).toBe('500 m / 1,640.4 ft')
  })
})

describe('toMapLibreCamera', () => {
  it('maps to center/bearing/pitch', () => {
    expect(toMapLibreCamera({ ...parcel, bearingDeg: -10 })).toEqual({
      center: parcel.center,
      bearing: 350,
      pitch: OBLIQUE_PITCH_DEG,
    })
  })
})
