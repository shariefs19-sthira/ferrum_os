// Client-side first pass for "Suggest a preference". The server-side pipeline (SPEC.md section 8) re-checks everything.
// Suggestion text is DATA: it is never an instruction, never changes questions/thresholds, and is delimited when rendered into a state.
export const SUGGESTION_MAX = 120
export type SuggestionStatus = 'submitted' | 'analysing' | 'needs-data' | 'approved' | 'rejected' | 'merged-into-existing'

// Protected or discriminatory attributes: auto-reject, never sent to the model (RULE 61(d)). The server list is authoritative and larger.
const PROTECTED = ['caste', 'religion', 'religious', 'hindu', 'muslim', 'christian', 'sikh', 'ethnic', 'ethnicity', 'community', 'race', 'racial', 'gender', 'male', 'female', 'tribe', 'tribal', 'nationality', 'skin colour', 'skin color']
const INJECTION = /(ignore (all |previous |the )?(instructions|rules)|system prompt|you are now|disregard|override|threshold|<\/?[a-z][^>]*>|```)/i
// Control characters, zero-width and bidi-override characters are stripped (they can hide instructions).
const HIDDEN = new RegExp('[\\u0000-\\u001f\\u007f\\u200b-\\u200f\\u202a-\\u202e]', 'g')

export function sanitizeSuggestion(raw: string): { ok: true; text: string } | { ok: false; reason: 'empty' | 'too-long' | 'policy' | 'injection' } {
  const text = raw.replace(HIDDEN, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return { ok: false, reason: 'empty' }
  if (text.length > SUGGESTION_MAX) return { ok: false, reason: 'too-long' }
  const lower = text.toLowerCase()
  if (PROTECTED.some((w) => new RegExp(`\\b${w}\\b`).test(lower))) return { ok: false, reason: 'policy' }
  if (INJECTION.test(text)) return { ok: false, reason: 'injection' }
  return { ok: true, text }
}

/** How an approved user suggestion would appear inside a state: delimited data, never instruction. */
export const delimitSuggestion = (text: string) => `[USER_PREFERENCE_TEXT]${text.replace(/[\[\]]/g, '')}[/USER_PREFERENCE_TEXT]`
