import { describe, expect, it, vi } from 'vitest'
import { generateStudioPlan } from '../plan-gen'
import { CAMERA_PATH_SCHEMA, cameraPathWaypoints, canonicalJson, describeManifest, generateCameraPath, hashCanonical, sampleCameraPath } from './cameraPath'

const plan = generateStudioPlan({ plotWidthM: 20, plotDepthM: 30, setbackM: 2, floors: 3 })
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const r4 = (v: number) => Math.round(v * 1e4) / 1e4

describe('camera path generation', () => {
  it('is versioned and byte-identical for identical input', () => {
    const a = generateCameraPath(plan)
    expect(a.schema).toBe(CAMERA_PATH_SCHEMA)
    expect(canonicalJson(a)).toBe(canonicalJson(generateCameraPath(plan)))
  })

  it('starts and ends at the default fit() pose so Play/Restart never jump', () => {
    const height = Math.max(3, plan.floors * plan.floorHeightM)
    const radius = Math.max(plan.plotWidthM, plan.plotDepthM, height)
    const path = generateCameraPath(plan)
    const first = path.keyframes[0]
    const last = path.keyframes[path.keyframes.length - 1]
    expect(dist(first.position, [radius * 0.92, radius * 0.72, radius * 1.08])).toBeLessThan(1e-3)
    expect(dist(first.position, last.position)).toBeLessThan(1e-9)
    expect(first.target).toEqual([0, r4(height * 0.42), 0])
  })

  it('scales with the authored geometry and the portrait framing pull-back', () => {
    const small = generateCameraPath(plan)
    const tall = generateCameraPath({ ...plan, floors: 20 })
    const portrait = generateCameraPath(plan, 1.6)
    expect(tall.keyframes[0].position[1]).toBeGreaterThan(small.keyframes[0].position[1])
    expect(portrait.keyframes[0].position[0]).toBeGreaterThan(small.keyframes[0].position[0])
  })

  it('keeps the camera above ground and orbiting a fixed target', () => {
    const path = generateCameraPath(plan)
    for (let t = 0; t <= path.durationS; t += 0.5) {
      const s = sampleCameraPath(path, t)
      expect(s.position[1]).toBeGreaterThan(1)
      expect(s.target).toEqual(path.keyframes[0].target)
    }
  })
})

describe('camera path sampling', () => {
  const path = generateCameraPath(plan)
  it('is pure and hits every keyframe exactly', () => {
    for (const k of path.keyframes) expect(dist(sampleCameraPath(path, k.t).position, k.position)).toBeLessThan(1e-3)
    expect(sampleCameraPath(path, 7.3)).toEqual(sampleCameraPath(path, 7.3))
  })
  it('clamps out-of-range and non-finite time', () => {
    expect(sampleCameraPath(path, -5).position).toEqual(sampleCameraPath(path, 0).position)
    expect(sampleCameraPath(path, 1e9).position).toEqual(sampleCameraPath(path, path.durationS).position)
    expect(sampleCameraPath(path, Number.NaN).position).toEqual(sampleCameraPath(path, 0).position)
  })
  it('moves continuously (no per-step teleport)', () => {
    let prev = sampleCameraPath(path, 0).position
    for (let t = 0.1; t <= path.durationS; t += 0.1) {
      const cur = sampleCameraPath(path, t).position
      expect(dist(prev, cur)).toBeLessThan(2.5)
      prev = cur
    }
  })
  it('offers discrete waypoints for reduced motion without the duplicate closing frame', () => {
    expect(cameraPathWaypoints(path)).toHaveLength(path.keyframes.length - 1)
  })
})

describe('hashing and manifest', () => {
  it('canonicalises key order', async () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] })).toBe('{"a":[2,{"c":2,"d":1}],"b":1}')
    expect(await hashCanonical({ a: 1, b: 2 })).toBe(await hashCanonical({ b: 2, a: 1 }))
  })
  it('falls back to a labelled non-SHA hash without SubtleCrypto', async () => {
    vi.stubGlobal('crypto', {})
    try { expect(await hashCanonical({ a: 1 })).toMatch(/^fnv1a-2x32:[0-9a-f]{16}$/) } finally { vi.unstubAllGlobals() }
  })
  const base = () => ({
    plan, path: generateCameraPath(plan), rendererVersion: { three: '0.185.1', profile: 'full', engine: 'three-webgl-pbr' },
    contextLabel: 'SAMPLE LOCATION Bengaluru, Karnataka',
    siteContext: { source: { name: 'OpenStreetMap via Overpass API', queriedAt: '2026-09-05T04:35:36Z', license: 'ODbL' }, attribution: '© OpenStreetMap contributors' },
    motion: 'continuous' as const, recording: { requested: false, supported: true, result: 'not-requested' as const }, generatedAt: '2026-09-19T00:00:00.000Z',
  })
  it('carries revision, path hash, renderer, provenance and the indicative label', async () => {
    const m = await describeManifest(base())
    expect(m.label).toBe('INDICATIVE — NOT A SURVEY')
    expect(m.modelRevision).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(m.pathHash).toMatch(/^sha256:[0-9a-f]{64}$/)
    expect(m.rendererVersion.three).toBe('0.185.1')
    expect(m.provenance.sourceData.siteContext.license).toBe('ODbL')
    expect(m.provenance.visualLayer.paidServices).toBe(false)
    expect(m.provenance.sourceData).not.toHaveProperty('path')
  })
  it('changes revision with the model and pathHash with the path, independent of timestamp', async () => {
    const a = await describeManifest(base())
    const b = await describeManifest({ ...base(), generatedAt: '2030-01-01T00:00:00.000Z' })
    const c = await describeManifest({ ...base(), plan: { ...plan, floors: 4 }, path: generateCameraPath({ ...plan, floors: 4 }) })
    expect(b.modelRevision).toBe(a.modelRevision)
    expect(b.pathHash).toBe(a.pathHash)
    expect(c.modelRevision).not.toBe(a.modelRevision)
    expect(c.pathHash).not.toBe(a.pathHash)
  })
})
