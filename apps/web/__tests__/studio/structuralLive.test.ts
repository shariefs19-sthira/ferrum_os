import { describe, it, expect } from 'vitest'
import { checkStructuralLive, type BeamElement, type ColumnElement } from '../../lib/studio/structuralLive'

describe('checkStructuralLive — beam span/depth (IS 456 Cl 23.2.1)', () => {
  it('passes a simply-supported beam within the basic span/depth ratio', () => {
    // span/depth = 4000 / 400 = 10, limit 20 for a simple support
    const beam: BeamElement = { id: 'b1', kind: 'beam', span_m: 4, depth_mm: 400, width_mm: 250, udl_kn_per_m: 10, support: 'simple' }
    const result = checkStructuralLive([beam])
    expect(result.indicative).toBe(true)
    expect(result.results[0].checks[0].pass).toBe(true)
    expect(result.results[0].checks[1].pass).toBe(true)
  })

  it('fails a simply-supported beam that exceeds the basic span/depth ratio', () => {
    // span/depth = 10000 / 300 = 33.3, limit 20
    const beam: BeamElement = { id: 'b2', kind: 'beam', span_m: 10, depth_mm: 300, width_mm: 250, udl_kn_per_m: 10, support: 'simple' }
    const result = checkStructuralLive([beam])
    expect(result.results[0].checks[0].pass).toBe(false)
    expect(result.results[0].checks[0].note).toContain('Exceeds limit')
  })

  it('uses the higher continuous-support ratio limit (26 vs 20)', () => {
    // span/depth = 22, fails as simple (limit 20) but passes as continuous (limit 26)
    const simple: BeamElement = { id: 'b3', kind: 'beam', span_m: 8.8, depth_mm: 400, width_mm: 250, udl_kn_per_m: 8, support: 'simple' }
    const continuous: BeamElement = { ...simple, id: 'b4', support: 'continuous' }
    const results = checkStructuralLive([simple, continuous]).results
    expect(results[0].checks[0].pass).toBe(false)
    expect(results[1].checks[0].pass).toBe(true)
  })
})

describe('checkStructuralLive — column slenderness (IS 800 Cl 3.8) and axial stress (IS 456 Cl 39.1)', () => {
  it('passes a short, lightly-loaded column on both checks', () => {
    // r = sqrt((300^2+300^2)/12) ≈ 122.47mm, KL/r = 3000/122.47 ≈ 24.5, limit 180
    // area = 90000mm², stress = 200000/90000 ≈ 2.22 N/mm², allowable 5 N/mm² (0.25 * fck 20)
    const column: ColumnElement = { id: 'c1', kind: 'column', axial_load_kn: 200, width_mm: 300, depth_mm: 300, k_factor: 1, height_mm: 3000 }
    const result = checkStructuralLive([column])
    expect(result.results[0].checks[0].pass).toBe(true) // slenderness
    expect(result.results[0].checks[1].pass).toBe(true) // axial stress
  })

  it('fails slenderness for a very tall, slender column while axial stress still passes', () => {
    // same section/load as the passing case, height raised to 30m: KL/r ≈ 245 > 180
    const column: ColumnElement = { id: 'c2', kind: 'column', axial_load_kn: 200, width_mm: 300, depth_mm: 300, k_factor: 1, height_mm: 30000 }
    const result = checkStructuralLive([column])
    expect(result.results[0].checks[0].pass).toBe(false) // slenderness
    expect(result.results[0].checks[1].pass).toBe(true) // axial stress unaffected by height
  })

  it('fails axial stress for an overloaded column while slenderness still passes', () => {
    // same section/height as the passing case, load raised to 1000kN: stress ≈ 11.1 N/mm² > 5 N/mm²
    const column: ColumnElement = { id: 'c3', kind: 'column', axial_load_kn: 1000, width_mm: 300, depth_mm: 300, k_factor: 1, height_mm: 3000 }
    const result = checkStructuralLive([column])
    expect(result.results[0].checks[0].pass).toBe(true) // slenderness unaffected by load
    expect(result.results[0].checks[1].pass).toBe(false) // axial stress
  })
})

describe('checkStructuralLive — mixed massing', () => {
  it('handles a mix of beams and columns, indicative flag always true', () => {
    const beam: BeamElement = { id: 'b5', kind: 'beam', span_m: 4, depth_mm: 400, width_mm: 250, udl_kn_per_m: 10, support: 'simple' }
    const column: ColumnElement = { id: 'c4', kind: 'column', axial_load_kn: 200, width_mm: 300, depth_mm: 300, k_factor: 1, height_mm: 3000 }
    const result = checkStructuralLive([beam, column])
    expect(result.indicative).toBe(true)
    expect(result.results).toHaveLength(2)
    expect(result.results[0].kind).toBe('beam')
    expect(result.results[1].kind).toBe('column')
  })

  it('returns quickly for a large massing set (pure arithmetic, well under 100ms)', () => {
    const elements: BeamElement[] = Array.from({ length: 500 }, (_, i) => ({
      id: `b${i}`,
      kind: 'beam' as const,
      span_m: 4 + (i % 5),
      depth_mm: 400,
      width_mm: 250,
      udl_kn_per_m: 10,
      support: i % 2 === 0 ? ('simple' as const) : ('continuous' as const),
    }))
    const start = performance.now()
    const result = checkStructuralLive(elements)
    const elapsed = performance.now() - start
    expect(result.results).toHaveLength(500)
    expect(elapsed).toBeLessThan(100)
  })
})
