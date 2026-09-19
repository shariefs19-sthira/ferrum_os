/**
 * Parcel-centred site-view camera frame helpers (pure, dependency-free).
 *
 * Attribution: orbit-around-target frame model (target/heading/pitch/range, tilt
 * toggle, reset north, sampled camera move) is a pattern adapted from
 * bilawalsidhu/gods-eye-view @ 0d41b6be5490db1f10a171f238be75db4d4ec3b4
 * (MIT, (c) 2026 Bilawal Sidhu). The math is reimplemented for MapLibre
 * conventions (pitch 0 = top-down); no upstream source, Cesium call, data or
 * asset is copied, so no MIT notice text is reproduced here.
 *
 * Internal module: not wired to any UI yet. Wiring is a separate row.
 */

export type LngLat = readonly [lng: number, lat: number]

export interface SiteViewFrame {
  /** [lng, lat] of the orbit target (parcel centroid). */
  center: [number, number]
  /** Compass bearing in degrees, normalised to [0, 360). */
  bearingDeg: number
  /** MapLibre pitch in degrees: 0 = straight down, larger = more oblique. */
  pitchDeg: number
  /** Ground range from camera to target, metres. */
  rangeM: number
}

export interface FrameForParcelOptions {
  /** Approximate parcel extent (longest side) in metres. Default 100. */
  extentM?: number
  bearingDeg?: number
  pitchDeg?: number
}

export interface RangeReadout {
  m: number
  ft: number
  label: string
}

export const METRES_PER_FOOT = 0.3048
export const OBLIQUE_PITCH_DEG = 55
export const TOP_DOWN_PITCH_DEG = 0
export const MAX_PITCH_DEG = 85
export const MIN_RANGE_M = 50
export const MAX_RANGE_M = 100_000
/** Camera range as a multiple of parcel extent so the parcel fills the view. */
export const RANGE_PER_EXTENT = 2.5
const DEFAULT_EXTENT_M = 100

export class SiteViewCameraError extends RangeError {
  constructor(message: string) {
    super(message)
    this.name = 'SiteViewCameraError'
  }
}

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export function isValidCoordinate(c: unknown): c is LngLat {
  return (
    Array.isArray(c) &&
    c.length === 2 &&
    isFiniteNumber(c[0]) &&
    isFiniteNumber(c[1]) &&
    c[0] >= -180 &&
    c[0] <= 180 &&
    c[1] >= -90 &&
    c[1] <= 90
  )
}

function assertCoordinate(c: unknown, name: string): asserts c is LngLat {
  if (!isValidCoordinate(c)) {
    throw new SiteViewCameraError(`${name} must be a finite [lng, lat] with lng in [-180,180] and lat in [-90,90]`)
  }
}

function assertFinite(v: unknown, name: string): asserts v is number {
  if (!isFiniteNumber(v)) throw new SiteViewCameraError(`${name} must be a finite number`)
}

/** Normalise any finite angle to [0, 360). */
export function normalizeBearing(deg: number): number {
  assertFinite(deg, 'bearing')
  const r = ((deg % 360) + 360) % 360
  // A tiny negative input can round up to exactly 360.
  return r >= 360 ? 0 : r
}

const clampPitch = (deg: number): number => Math.min(MAX_PITCH_DEG, Math.max(TOP_DOWN_PITCH_DEG, deg))
const clampRange = (m: number): number => Math.min(MAX_RANGE_M, Math.max(MIN_RANGE_M, m))
const copyFrame = (f: SiteViewFrame): SiteViewFrame => ({ ...f, center: [f.center[0], f.center[1]] })

/** Validate a frame and return a normalised copy; throws SiteViewCameraError. */
export function normalizeFrame(frame: SiteViewFrame): SiteViewFrame {
  assertCoordinate(frame?.center, 'center')
  assertFinite(frame.bearingDeg, 'bearingDeg')
  assertFinite(frame.pitchDeg, 'pitchDeg')
  assertFinite(frame.rangeM, 'rangeM')
  if (frame.pitchDeg < TOP_DOWN_PITCH_DEG || frame.pitchDeg > MAX_PITCH_DEG) {
    throw new SiteViewCameraError(`pitchDeg must be in [${TOP_DOWN_PITCH_DEG}, ${MAX_PITCH_DEG}]`)
  }
  if (frame.rangeM <= 0) throw new SiteViewCameraError('rangeM must be > 0')
  return {
    center: [frame.center[0], frame.center[1]],
    bearingDeg: normalizeBearing(frame.bearingDeg),
    pitchDeg: frame.pitchDeg,
    rangeM: frame.rangeM,
  }
}

/** Oblique, north-up frame around a parcel centroid; range derived from extent. */
export function frameForParcel(centroid: LngLat, opts: FrameForParcelOptions = {}): SiteViewFrame {
  assertCoordinate(centroid, 'centroid')
  const extentM = opts.extentM ?? DEFAULT_EXTENT_M
  assertFinite(extentM, 'extentM')
  if (extentM <= 0) throw new SiteViewCameraError('extentM must be > 0')
  const pitch = opts.pitchDeg ?? OBLIQUE_PITCH_DEG
  assertFinite(pitch, 'pitchDeg')
  return {
    center: [centroid[0], centroid[1]],
    bearingDeg: normalizeBearing(opts.bearingDeg ?? 0),
    pitchDeg: clampPitch(pitch),
    rangeM: clampRange(extentM * RANGE_PER_EXTENT),
  }
}

/** Oblique <-> top-down. Pitch nearer top-down goes oblique; otherwise top-down. */
export function toggleTilt(frame: SiteViewFrame): SiteViewFrame {
  const f = normalizeFrame(frame)
  const midpoint = (OBLIQUE_PITCH_DEG + TOP_DOWN_PITCH_DEG) / 2
  return { ...f, pitchDeg: f.pitchDeg < midpoint ? OBLIQUE_PITCH_DEG : TOP_DOWN_PITCH_DEG }
}

export function resetNorth(frame: SiteViewFrame): SiteViewFrame {
  return { ...normalizeFrame(frame), bearingDeg: 0 }
}

/** Cubic in-out easing on [0,1]; monotonic, exact at 0, 0.5 and 1. */
export function easeInOutCubic(t: number): number {
  assertFinite(t, 'progress')
  const p = Math.min(1, Math.max(0, t))
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
}

/** Signed shortest angular delta from a to b, in (-180, 180]. */
function shortestDelta(a: number, b: number): number {
  const d = normalizeBearing(b - a)
  return d > 180 ? d - 360 : d
}

/**
 * Frame at `progress` (clamped to [0,1]) of a fly-in. Bearing and longitude
 * take the shortest arc; range interpolates geometrically. progress 0 / 1
 * return exact copies of from / to.
 */
export function sampleFlyIn(from: SiteViewFrame, to: SiteViewFrame, progress: number): SiteViewFrame {
  const a = normalizeFrame(from)
  const b = normalizeFrame(to)
  assertFinite(progress, 'progress')
  const p = Math.min(1, Math.max(0, progress))
  if (p === 0) return a
  if (p === 1) return b
  const e = easeInOutCubic(p)
  let lng = a.center[0] + shortestDelta(a.center[0], b.center[0]) * e
  if (lng > 180) lng -= 360
  if (lng < -180) lng += 360
  return {
    center: [lng, a.center[1] + (b.center[1] - a.center[1]) * e],
    bearingDeg: normalizeBearing(a.bearingDeg + shortestDelta(a.bearingDeg, b.bearingDeg) * e),
    pitchDeg: a.pitchDeg + (b.pitchDeg - a.pitchDeg) * e,
    rangeM: a.rangeM * Math.pow(b.rangeM / a.rangeM, e),
  }
}

/** Standard fly-in start: same target, top-down, farther out. */
export function flyInStartFrame(target: SiteViewFrame, rangeMultiplier = 4): SiteViewFrame {
  const t = normalizeFrame(target)
  assertFinite(rangeMultiplier, 'rangeMultiplier')
  if (rangeMultiplier < 1) throw new SiteViewCameraError('rangeMultiplier must be >= 1')
  return { ...t, pitchDeg: TOP_DOWN_PITCH_DEG, rangeM: clampRange(t.rangeM * rangeMultiplier) }
}

export interface FlyInController {
  readonly durationMs: number
  /** Frame at elapsed time; after cancel() it stays frozen at the cancel point. */
  sampleAt(elapsedMs: number): SiteViewFrame
  /** Freeze at the frame reached by elapsedMs (e.g. on user input). Idempotent. */
  cancel(elapsedMs: number): SiteViewFrame
  readonly cancelled: boolean
  /** True once elapsed >= duration or cancelled. */
  isDone(elapsedMs: number): boolean
}

/** Deterministic, cancellable fly-in driven by caller-supplied elapsed time. */
export function createFlyIn(from: SiteViewFrame, to: SiteViewFrame, durationMs: number): FlyInController {
  assertFinite(durationMs, 'durationMs')
  if (durationMs <= 0) throw new SiteViewCameraError('durationMs must be > 0')
  const a = normalizeFrame(from)
  const b = normalizeFrame(to)
  let frozen: SiteViewFrame | null = null
  const at = (ms: number): SiteViewFrame => {
    assertFinite(ms, 'elapsedMs')
    return sampleFlyIn(a, b, ms / durationMs)
  }
  return {
    durationMs,
    sampleAt: (ms) => (frozen ? copyFrame(frozen) : at(ms)),
    cancel(ms) {
      if (!frozen) frozen = at(ms)
      return copyFrame(frozen)
    },
    get cancelled() {
      return frozen !== null
    },
    isDone: (ms) => frozen !== null || ms >= durationMs,
  }
}

export function metresToFeet(m: number): number {
  assertFinite(m, 'metres')
  return m / METRES_PER_FOOT
}

export function feetToMetres(ft: number): number {
  assertFinite(ft, 'feet')
  return ft * METRES_PER_FOOT
}

const round1 = (v: number): number => Math.round(v * 10) / 10

/** Dual-unit range readout (RULE 30): exact 0.3048 m/ft, rounded to 0.1. */
export function rangeReadout(rangeM: number): RangeReadout {
  assertFinite(rangeM, 'rangeM')
  if (rangeM < 0) throw new SiteViewCameraError('rangeM must be >= 0')
  const m = round1(rangeM)
  const ft = round1(metresToFeet(rangeM))
  const fmt = (v: number): string => v.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return { m, ft, label: `${fmt(m)} m / ${fmt(ft)} ft` }
}

/** Shape MapLibre easeTo/jumpTo accept, minus zoom (which needs viewport size). */
export function toMapLibreCamera(frame: SiteViewFrame): { center: [number, number]; bearing: number; pitch: number } {
  const f = normalizeFrame(frame)
  return { center: f.center, bearing: f.bearingDeg, pitch: f.pitchDeg }
}
