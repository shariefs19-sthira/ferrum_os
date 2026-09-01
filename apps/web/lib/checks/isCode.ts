// IS 456/800 checker — parity task W2-268. Two well-established,
// textbook checks (not the full code, just the two the "IS 456/800
// checker" task names): IS 456 Cl 26.5.1.1 minimum tension
// reinforcement for RC beams, and IS 800 Cl 3.8 slenderness ratio
// limit for compression members. One implementation, shared by the
// REST route and the MCP tool (AGENT_INTERFACE.md §0's one-capability-
// two-transports commitment).

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

  return {
    code: structureType,
    checks: [{ rule: 'unsupported', pass: false, note: `No check defined for structure_type "${structureType}". Supported: rc-beam, steel-column.` }],
  }
}
