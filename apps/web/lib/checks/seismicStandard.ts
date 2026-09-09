/** Governing seismic factors; withdrawn editions never feed live checks. */
export const SEISMIC_STANDARD = {
  governingEdition: 'IS 1893 (Part 1):2016',
  zoneFactors: { II: 0.1, III: 0.16, IV: 0.24, V: 0.36 },
  sourceUrl: 'https://standards.bis.gov.in/website/standard-details',
  checkedAt: '2026-09-09',
  withdrawnEdition: {
    edition: 'IS 1893 (Part 1):2025',
    withdrawnOn: '2026-03-05',
    operative: false,
  },
} as const

export function isGoverningZoneFactor(value: number): boolean {
  return Object.values(SEISMIC_STANDARD.zoneFactors).some((factor) => factor === value)
}
