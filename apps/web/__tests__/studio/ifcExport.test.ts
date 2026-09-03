import { describe, it, expect } from 'vitest'
import { exportMassingToIfc, countIfcGeometry, type MassingModel } from '../../lib/ifc-export'

describe('exportMassingToIfc — round-trip via web-ifc', () => {
  it('produces a valid, non-empty IFC4 file', () => {
    const model: MassingModel = { plot_width_m: 20, plot_depth_m: 30, floors: 2 }
    const bytes = exportMassingToIfc(model)
    expect(bytes.length).toBeGreaterThan(0)
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain('FILE_SCHEMA((\'IFC4\'))')
    expect(text.trim().startsWith('ISO-10303-21;')).toBe(true)
    expect(text.trim().endsWith('END-ISO-10303-21;')).toBe(true)
  })

  it('a 2-floor massing round-trips to exactly the expected element counts', async () => {
    const model: MassingModel = { plot_width_m: 20, plot_depth_m: 30, floors: 2 }
    const bytes = exportMassingToIfc(model)
    const counts = await countIfcGeometry(bytes)
    expect(counts).toEqual({ walls: 8, slabs: 2, spaces: 2, openings: 2 })
  })

  it('a single-floor massing round-trips to 4 walls, 1 slab, 1 space, 1 opening', async () => {
    const model: MassingModel = { plot_width_m: 10, plot_depth_m: 12, floors: 1 }
    const bytes = exportMassingToIfc(model)
    const counts = await countIfcGeometry(bytes)
    expect(counts).toEqual({ walls: 4, slabs: 1, spaces: 1, openings: 1 })
  })

  it('scales linearly with floor count (5 floors -> 20 walls, 5 each of slab/space/opening)', async () => {
    const model: MassingModel = { plot_width_m: 15, plot_depth_m: 15, floors: 5 }
    const bytes = exportMassingToIfc(model)
    const counts = await countIfcGeometry(bytes)
    expect(counts).toEqual({ walls: 20, slabs: 5, spaces: 5, openings: 5 })
  })

  it('non-integer floors round to the nearest whole storey (never fabricates a fractional floor)', async () => {
    const model: MassingModel = { plot_width_m: 10, plot_depth_m: 10, floors: 2.4 }
    const bytes = exportMassingToIfc(model)
    const counts = await countIfcGeometry(bytes)
    expect(counts).toEqual({ walls: 8, slabs: 2, spaces: 2, openings: 2 })
  })

  it('a degenerate zero-floor input still exports at least one storey (floors clamped to >= 1)', async () => {
    const model: MassingModel = { plot_width_m: 8, plot_depth_m: 8, floors: 0 }
    const bytes = exportMassingToIfc(model)
    const counts = await countIfcGeometry(bytes)
    expect(counts).toEqual({ walls: 4, slabs: 1, spaces: 1, openings: 1 })
  })
})
