export const professionalVocabulary = {
  setback: ['margin', 'margins', 'build line', 'building line'],
  far: ['fsi', 'plot ratio', 'floor space index'],
  approval: ['sanction', 'plan approval', 'permit'],
  structure: ['limit state', 'span', 'spans', 'load', 'loads'],
  mep: ['fixture', 'fixtures', 'connected load', 'services'],
  noc: ['no objection certificate', 'occupancy certificate', 'oc'],
  irr: ['internal rate of return'],
  ticket: ['investment amount', 'capital ticket'],
} as const

export type CanonicalTerm = keyof typeof professionalVocabulary

export function normalizeProfessionalTerms(input: string) {
  let normalized = input.toLowerCase()
  const entries = Object.entries(professionalVocabulary).flatMap(([canonical,synonyms])=>synonyms.map(synonym=>({canonical,synonym}))).sort((a,b)=>b.synonym.length-a.synonym.length)
  for (const {canonical,synonym} of entries) normalized = normalized.replace(new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'g'), canonical)
  return normalized
}

export function termsIn(input: string): CanonicalTerm[] {
  const normalized = normalizeProfessionalTerms(input)
  return (Object.keys(professionalVocabulary) as CanonicalTerm[]).filter(term=>new RegExp(`\\b${term}\\b`).test(normalized))
}
