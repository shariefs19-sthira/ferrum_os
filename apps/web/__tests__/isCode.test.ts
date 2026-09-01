import { describe, it, expect } from 'vitest'
import { runIsCheck } from '../lib/checks/isCode'

describe('runIsCheck — rc-beam (IS 456 Cl 26.5.1.1)', () => {
  it('passes when Ast meets the minimum', () => {
    // Ast_min = 0.85 * 300 * 500 / 415 = 307.2 mm²
    const result = runIsCheck('rc-beam', { b: 300, d: 500, fy: 415, Ast: 600 })
    expect(result.code).toBe('IS 456')
    expect(result.checks[0].pass).toBe(true)
  })

  it('fails when Ast is below the minimum', () => {
    const result = runIsCheck('rc-beam', { b: 300, d: 500, fy: 415, Ast: 100 })
    expect(result.checks[0].pass).toBe(false)
  })

  it('rejects missing params', () => {
    const result = runIsCheck('rc-beam', { b: 300 })
    expect(result.checks[0].pass).toBe(false)
    expect(result.checks[0].note).toContain('Missing required params')
  })
})

describe('runIsCheck — steel-column (IS 800 Cl 3.8)', () => {
  it('passes within the slenderness limit', () => {
    // KL/r = 1 * 3000 / 50 = 60, well under 180
    const result = runIsCheck('steel-column', { K: 1, L: 3000, r: 50 })
    expect(result.code).toBe('IS 800')
    expect(result.checks[0].pass).toBe(true)
  })

  it('fails when slenderness exceeds 180', () => {
    // KL/r = 1 * 10000 / 40 = 250
    const result = runIsCheck('steel-column', { K: 1, L: 10000, r: 40 })
    expect(result.checks[0].pass).toBe(false)
  })
})

describe('runIsCheck — seismic-coefficient (IS 1893:2016 Cl 6.4.2)', () => {
  it('computes Ah for Zone V, medium soil, T=0.5s (worked example)', () => {
    // Sa/g at T=0.5 for Type II (medium) soil: 0.1 < T <= 0.55 -> Sa/g = 2.5
    // Ah = (Z/2)(I/R)(Sa/g) = (0.36/2)(1.5/5)(2.5) = 0.18 * 0.3 * 2.5 = 0.135
    const result = runIsCheck('seismic-coefficient', { Z: 0.36, I: 1.5, R: 5, T: 0.5, soilType: 2 })
    expect(result.code).toBe('IS 1893')
    expect(result.checks[0].pass).toBe(true)
    expect(result.checks[0].note).toContain('0.1350')
  })

  it('computes Ah for Zone III, rock soil, T=1.0s (long-period branch)', () => {
    // Sa/g at T=1.0 for Type I (rock): T > 0.4 -> Sa/g = 1/T = 1.0
    // Ah = (0.16/2)(1.0/3)(1.0) = 0.08 * 0.3333... = 0.02667
    const result = runIsCheck('seismic-coefficient', { Z: 0.16, I: 1.0, R: 3, T: 1.0, soilType: 1 })
    expect(result.checks[0].pass).toBe(true)
    expect(result.checks[0].note).toContain('0.0267')
  })

  it('rejects an invalid soil type', () => {
    const result = runIsCheck('seismic-coefficient', { Z: 0.36, I: 1.5, R: 5, T: 0.5, soilType: 9 })
    expect(result.checks[0].pass).toBe(false)
  })

  it('rejects missing params', () => {
    const result = runIsCheck('seismic-coefficient', { Z: 0.36 })
    expect(result.checks[0].pass).toBe(false)
  })
})

describe('runIsCheck — wind-pressure (IS 875:2015 Part 3 Cl 6.3/7.2)', () => {
  it('computes design wind speed and pressure with unity factors', () => {
    // Vz = 50 * 1 * 1 * 1 * 1 = 50 m/s; pz = 0.6 * 50^2 = 1500 N/m^2
    const result = runIsCheck('wind-pressure', { Vb: 50, k1: 1, k2: 1, k3: 1 })
    expect(result.code).toBe('IS 875 Part 3')
    expect(result.checks[0].pass).toBe(true)
    expect(result.checks[0].note).toContain('50.00 m/s')
    expect(result.checks[0].note).toContain('1500.0 N/m²')
  })

  it('applies a supplied k4 (cyclonic importance factor)', () => {
    // Vz = 44 * 1.07 * 0.98 * 1.0 * 1.15
    const result = runIsCheck('wind-pressure', { Vb: 44, k1: 1.07, k2: 0.98, k3: 1.0, k4: 1.15 })
    const expectedVz = 44 * 1.07 * 0.98 * 1.0 * 1.15
    const expectedPz = 0.6 * expectedVz * expectedVz
    expect(result.checks[0].note).toContain(expectedVz.toFixed(2))
    expect(result.checks[0].note).toContain(expectedPz.toFixed(1))
  })

  it('rejects missing params', () => {
    const result = runIsCheck('wind-pressure', { Vb: 50 })
    expect(result.checks[0].pass).toBe(false)
  })
})

describe('runIsCheck — unsupported structure type', () => {
  it('returns a typed unsupported result, never a fabricated check', () => {
    const result = runIsCheck('space-elevator', {})
    expect(result.checks[0].rule).toBe('unsupported')
    expect(result.checks[0].pass).toBe(false)
    expect(result.checks[0].note).toContain('rc-beam, steel-column, seismic-coefficient, wind-pressure')
  })
})
