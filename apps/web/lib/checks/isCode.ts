// IS 456/800/1893/875 checker — parity task W2-268, expanded W2-337.
// Four well-established, textbook checks (not the full codes): IS 456
// Cl 26.5.1.1 minimum tension reinforcement for RC beams, IS 800 Cl 3.8
// slenderness ratio limit for compression members, IS 1893:2016 Part 1
// design horizontal seismic coefficient, and IS 875:2015 Part 3 design
// wind speed/pressure. One implementation, shared by the REST route and
// the MCP tool (AGENT_INTERFACE.md §0's one-capability-two-transports
// commitment).

export type IsCheckResult = {
  code: string
  checks: Array<{ rule: string; pass: boolean; note: string }>
}

export function runIsCheck(structureType: string, params: Record<string, number>): IsCheckResult {
  if (structureType === 'rc-beam') {
    const { b, d, fy, Ast } = params
    if (typeof b !== 'number' || typeof d !== 'number' || typeof fy !== 'number' || typeof Ast !== 'number') {
      return {
        code: 'IS 456',
        checks: [{ rule: 'Cl 26.5.1.1 minimum tension reinforcement', pass: false, note: 'Missing required params: b, d, fy, Ast (mm, mm, N/mm2, mm2)' }],
      }
    }
    const astMin = (0.85 * b * d) / fy
    const pass = Ast >= astMin
    return {
      code: 'IS 456',
      checks: [
        {
          rule: 'Cl 26.5.1.1 minimum tension reinforcement',
          pass,
          note: `Ast_min = 0.85 * b * d / fy = ${astMin.toFixed(1)} mm². Provided Ast = ${Ast} mm². ${pass ? 'Meets minimum.' : 'Below minimum — increase reinforcement.'}`,
        },
      ],
    }
  }

  if (structureType === 'steel-column') {
    const { K, L, r } = params
    if (typeof K !== 'number' || typeof L !== 'number' || typeof r !== 'number') {
      return {
        code: 'IS 800',
        checks: [{ rule: 'Cl 3.8 slenderness ratio limit', pass: false, note: 'Missing required params: K, L, r (unitless, mm, mm)' }],
      }
    }
    const slenderness = (K * L) / r
    const limit = 180
    const pass = slenderness <= limit
    return {
      code: 'IS 800',
      checks: [
        {
          rule: 'Cl 3.8 slenderness ratio limit',
          pass,
          note: `KL/r = ${slenderness.toFixed(1)} (limit ${limit} for members resisting loads other than wind/seismic). ${pass ? 'Within limit.' : 'Exceeds limit — reduce length or increase radius of gyration.'}`,
        },
      ],
    }
  }

  if (structureType === 'seismic-coefficient') {
    const { Z, I, R, T, soilType } = params
    if (
      typeof Z !== 'number' ||
      typeof I !== 'number' ||
      typeof R !== 'number' ||
      typeof T !== 'number' ||
      typeof soilType !== 'number'
    ) {
      return {
        code: 'IS 1893',
        checks: [
          {
            rule: 'Cl 6.4.2 design horizontal seismic coefficient',
            pass: false,
            note: 'Missing required params: Z (zone factor), I (importance factor), R (response reduction factor), T (natural period, sec), soilType (1=rock/hard, 2=medium, 3=soft)',
          },
        ],
      }
    }
    const saOverG = spectralAccelerationCoefficient(T, soilType)
    if (saOverG === null) {
      return {
        code: 'IS 1893',
        checks: [
          {
            rule: 'Cl 6.4.2 design horizontal seismic coefficient',
            pass: false,
            note: `soilType must be 1, 2, or 3. Got ${soilType}.`,
          },
        ],
      }
    }
    const Ah = (Z / 2) * (I / R) * saOverG
    return {
      code: 'IS 1893',
      checks: [
        {
          rule: 'Cl 6.4.2 design horizontal seismic coefficient',
          pass: true,
          note: `Sa/g = ${saOverG.toFixed(3)} (T=${T}s, soil type ${soilType}). Ah = (Z/2)(I/R)(Sa/g) = ${Ah.toFixed(4)}. This is a coefficient for base shear (VB = Ah × W), not a pass/fail limit — verify against your structure's seismic weight and R/I selection per Table 7/6.`,
        },
      ],
    }
  }

  if (structureType === 'wind-pressure') {
    const { Vb, k1, k2, k3 } = params
    const k4 = typeof params.k4 === 'number' ? params.k4 : 1.0
    if (typeof Vb !== 'number' || typeof k1 !== 'number' || typeof k2 !== 'number' || typeof k3 !== 'number') {
      return {
        code: 'IS 875 Part 3',
        checks: [
          {
            rule: 'Cl 6.3/7.2 design wind speed and pressure',
            pass: false,
            note: 'Missing required params: Vb (basic wind speed, m/s), k1 (risk coefficient), k2 (terrain/height factor), k3 (topography factor). k4 (importance factor for cyclonic region) defaults to 1.0 if omitted.',
          },
        ],
      }
    }
    const Vz = Vb * k1 * k2 * k3 * k4
    const pz = 0.6 * Vz * Vz
    return {
      code: 'IS 875 Part 3',
      checks: [
        {
          rule: 'Cl 6.3/7.2 design wind speed and pressure',
          pass: true,
          note: `Vz = Vb × k1 × k2 × k3 × k4 = ${Vz.toFixed(2)} m/s. pz = 0.6 × Vz² = ${pz.toFixed(1)} N/m². This is a computed design pressure, not a pass/fail limit — apply Cp coefficients per Cl 6.2/Table 4-24 for the actual structure before use.`,
        },
      ],
    }
  }

  return {
    code: structureType,
    checks: [
      {
        rule: 'unsupported',
        pass: false,
        note: `No check defined for structure_type "${structureType}". Supported: rc-beam, steel-column, seismic-coefficient, wind-pressure.`,
      },
    ],
  }
}

// IS 1893:2016 Table 3 (Fig. 2) average response acceleration
// coefficient Sa/g, piecewise by soil type and natural period T (sec).
function spectralAccelerationCoefficient(T: number, soilType: number): number | null {
  if (T < 0) return null
  if (soilType === 1) {
    // Type I — rock or hard soil
    if (T <= 0.1) return 1 + 15 * T
    if (T <= 0.4) return 2.5
    return 1.0 / T
  }
  if (soilType === 2) {
    // Type II — medium soil
    if (T <= 0.1) return 1 + 15 * T
    if (T <= 0.55) return 2.5
    return 1.36 / T
  }
  if (soilType === 3) {
    // Type III — soft soil
    if (T <= 0.1) return 1 + 15 * T
    if (T <= 0.67) return 2.5
    return 1.67 / T
  }
  return null
}
