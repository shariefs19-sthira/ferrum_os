import type { StudioPlan } from '../types'

/**
 * Versioned, deterministic camera path for the DesignStudio walkthrough.
 * Pure data + pure sampling: no three.js, no DOM, no clock. The same plan and
 * framing always yield the same keyframes, the same samples and the same hash,
 * so an exported manifest can be re-verified from the model alone.
 *
 * The path is VISUAL only. It moves a virtual camera around the authored
 * massing; it adds no geometry and asserts nothing about the site.
 */
export const CAMERA_PATH_SCHEMA = 'ferrum.camera-path/1' as const
export const WALKTHROUGH_MANIFEST_SCHEMA = 'ferrum.walkthrough-manifest/1' as const

export type Vec3 = [number, number, number]
export type CameraKeyframe = { t: number; position: Vec3; target: Vec3 }
export type CameraPath = {
  schema: typeof CAMERA_PATH_SCHEMA
  kind: 'orbit-dolly'
  durationS: number
  /** The last keyframe equals the first, so the path is a closed loop; playback still ends once. */
  closed: true
  /** Portrait framing pull-back the path was generated for (see Space3D fit()). */
  framingDistance: number
  keyframes: CameraKeyframe[]
}
export type CameraSample = { position: Vec3; target: Vec3 }

const KEYFRAME_COUNT = 8
const DURATION_S = 24
const MIN_CAMERA_Y = 1.6

// 4-decimal rounding keeps the canonical JSON (and so the hash) free of
// floating-point noise from Math.sin/cos across engines.
const r4 = (value: number) => Math.round(value * 1e4) / 1e4
const round3 = (v: Vec3): Vec3 => [r4(v[0]), r4(v[1]), r4(v[2])]

/**
 * Builds the path from the same framing maths Space3D.fit() uses, so keyframe 0
 * is exactly the default view (no jump on Play) and the last keyframe returns
 * to it (Restart and loop are seamless).
 */
export function generateCameraPath(plan: Pick<StudioPlan, 'plotWidthM' | 'plotDepthM' | 'floors' | 'floorHeightM'>, framingDistance = 1): CameraPath {
  const height = Math.max(3, plan.floors * plan.floorHeightM)
  const radius = Math.max(plan.plotWidthM, plan.plotDepthM, height)
  const target: Vec3 = [0, height * 0.42, 0]
  const startX = radius * 0.92 * framingDistance
  const startY = radius * 0.72 * framingDistance
  const startZ = radius * 1.08 * framingDistance
  const orbitRadius = Math.hypot(startX, startZ)
  const startAngle = Math.atan2(startZ, startX)
  const keyframes: CameraKeyframe[] = []
  for (let i = 0; i <= KEYFRAME_COUNT; i += 1) {
    const f = i / KEYFRAME_COUNT
    // One full turn, with a gentle dolly-in and rise at the half-way point.
    const swell = Math.sin(f * Math.PI)
    const ring = orbitRadius * (1 - 0.14 * swell)
    const angle = startAngle - f * Math.PI * 2
    const y = Math.max(MIN_CAMERA_Y, startY * (1 - 0.22 * swell))
    const closing = i === KEYFRAME_COUNT
    keyframes.push({
      t: r4(f * DURATION_S),
      position: closing ? round3([startX, startY, startZ]) : round3([ring * Math.cos(angle), y, ring * Math.sin(angle)]),
      target: round3(target),
    })
  }
  return { schema: CAMERA_PATH_SCHEMA, kind: 'orbit-dolly', durationS: DURATION_S, closed: true, framingDistance: r4(framingDistance), keyframes }
}

const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// Uniform Catmull-Rom through four control points; passes through p1 at t=0
// and p2 at t=1, so every keyframe is hit exactly.
function catmull(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t
  const t3 = t2 * t
  const axis = (i: 0 | 1 | 2) => 0.5 * ((2 * p1[i]) + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)
  return [axis(0), axis(1), axis(2)]
}

/** Pure sample at elapsed seconds; clamps to [0, durationS] (no wrap, caller decides looping). */
export function sampleCameraPath(path: CameraPath, elapsedS: number): CameraSample {
  const { keyframes } = path
  const t = Math.min(Math.max(Number.isFinite(elapsedS) ? elapsedS : 0, 0), path.durationS)
  let seg = keyframes.length - 2
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (t <= keyframes[i + 1].t) { seg = i; break }
  }
  const k1 = keyframes[seg]
  const k2 = keyframes[seg + 1]
  // The path is a closed loop: wrap neighbours so the join is C1-smooth.
  const last = keyframes.length - 1
  const k0 = keyframes[seg === 0 ? last - 1 : seg - 1]
  const k3 = keyframes[seg + 2 > last ? 1 : seg + 2]
  const span = k2.t - k1.t
  const local = span > 0 ? (t - k1.t) / span : 0
  return { position: catmull(k0.position, k1.position, k2.position, k3.position, local), target: lerp3(k1.target, k2.target, local) }
}

/** Reduced-motion stepping: the discrete viewpoints (excluding the duplicate closing keyframe). */
export function cameraPathWaypoints(path: CameraPath): CameraSample[] {
  return path.keyframes.slice(0, -1).map((k) => ({ position: [...k.position] as Vec3, target: [...k.target] as Vec3 }))
}

/** Stable JSON: sorted keys, no whitespace. Numbers are expected pre-rounded. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

// Two independent 32-bit FNV-1a lanes (different seeds), used only as a labelled
// fallback where SubtleCrypto is missing (insecure contexts). The label is part
// of the value, so it is never passed off as SHA-256.
function fnvFallback(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let a = 0x811c9dc5
  let b = 0x01000193
  for (let i = 0; i < bytes.length; i += 1) {
    a = Math.imul(a ^ bytes[i], 0x01000193) >>> 0
    b = Math.imul(b ^ bytes[i], 0x85ebca6b) >>> 0
  }
  return `fnv1a-2x32:${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`
}

export async function hashCanonical(value: unknown): Promise<string> {
  const text = canonicalJson(value)
  const subtle = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto.subtle : undefined
  if (!subtle) return fnvFallback(text)
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text))
  return `sha256:${Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export type WalkthroughShellRef = { id: string; name: string; provenance: { basis: string; status: string; source: string; sourceUrl: string; reviewedAt: string } }
export type WalkthroughManifestInput = {
  plan: StudioPlan
  shell?: WalkthroughShellRef
  path: CameraPath
  rendererVersion: { three: string; profile: string; engine: string }
  contextLabel: string
  siteContext: { source: { name: string; queriedAt: string; license: string }; attribution: string }
  motion: 'continuous' | 'stepped-reduced-motion'
  recording: { requested: boolean; supported: boolean; result: 'not-requested' | 'pending' | 'recorded' | 'unsupported' | 'failed' }
  generatedAt: string
}

export type WalkthroughManifest = Awaited<ReturnType<typeof describeManifest>>

/**
 * Exportable manifest. `modelRevision` hashes exactly the authored inputs the
 * viewport draws (plan + shell id); `pathHash` hashes the path. Source data
 * (OSM context, shell catalogue provenance) and visual claims (camera path,
 * renderer) sit in separate blocks so neither can be mistaken for the other.
 * The only wall-clock field is `generatedAt`, deliberately outside both hashes.
 */
export async function describeManifest(input: WalkthroughManifestInput) {
  const { plan, shell, path } = input
  const modelRevision = await hashCanonical({ plan, shellId: shell?.id ?? 'default-massing' })
  const pathHash = await hashCanonical(path)
  return {
    schema: WALKTHROUGH_MANIFEST_SCHEMA,
    label: 'INDICATIVE — NOT A SURVEY',
    generatedAt: input.generatedAt,
    modelRevision,
    pathHash,
    pathSchema: path.schema,
    pathDurationS: path.durationS,
    rendererVersion: { name: 'three.js', ...input.rendererVersion },
    motion: input.motion,
    recording: input.recording,
    provenance: {
      sourceData: {
        note: 'Source data shown for context only; the walkthrough neither surveys nor verifies it.',
        siteContext: { ...input.siteContext.source, attribution: input.siteContext.attribution },
        shell: shell ? { id: shell.id, name: shell.name, ...shell.provenance } : null,
      },
      visualLayer: {
        note: 'Camera path and rendering are visual only and derived deterministically from the authored plan.',
        generator: 'ferrum.camera-path orbit-dolly',
        basis: 'authored massing (plan + catalogue shell)',
        paidServices: false,
      },
      contextLabel: input.contextLabel,
    },
    model: { plotWidthM: plan.plotWidthM, plotDepthM: plan.plotDepthM, buildingWidthM: plan.buildingWidthM, buildingDepthM: plan.buildingDepthM, floors: plan.floors, floorHeightM: plan.floorHeightM },
    path,
  }
}
