import type { Threshold } from './types'

// Single place for questions + thresholds (reviewable). Thresholds are PROVISIONAL: validate on real cases before the model is live.
export const SUIT_THRESHOLD: Threshold = { high: 0.75, low: 0.3 } // Noul probability
export const BUDGET_THRESHOLD = { good: 4, poor: 2 } // Score level 1..5
export const RETURN_THRESHOLD = { good: 4, poor: 2 }
export const CONFIDENCE = { insufficient: 0.5, confirm: 0.9 } // docs.typesafe.ai/confidence: <0.5 route away, 0.5-0.9 confirm, >0.9 act
export const KEY_FACTS = ['area', 'land use', 'zone', 'current value', 'feasibility score', 'growth assumption'] as const
export const UNKNOWN_LIMIT = 3 // >= this many UNKNOWN key facts => insufficient information

export const SCORE_LEVELS = 5
// Headline score = round(100 x (w.suit*P + w.budget*(B-1)/(L-1) + w.ret*(R-1)/(L-1))); null when the verdict is insufficient-information.
export const SCORE_WEIGHTS = { suit: 0.4, budget: 0.3, ret: 0.3 }
export const BANDS = { strong: 70, moderate: 45 } // >= strong: strong; >= moderate: moderate; else weak
export const VERSIONS = { model: 'SAMPLE stub (jev-latest not called)', questionSet: 'qs-1', registry: '', thresholds: 'th-1 (provisional)' }
export const BUDGET_LEVELS = ['Far above the stated budget', 'Above budget', 'Near the edge of budget', 'Within budget', 'Comfortably within budget']
export const RETURN_LEVELS = ['Far below the target return', 'Below target', 'Near target', 'Meets target', 'Clearly exceeds target']

/** Body for POST https://api.typesafe.ai/v1/systemone (shape per docs.typesafe.ai/api.md). Not sent anywhere yet. */
export function buildSystemOneRequest(state: string) {
  return {
    model: 'jev-latest',
    state,
    questions: {
      suit: { type: 'noul', instructions: 'Given ONLY the facts in the state, does this parcel plausibly suit the stated intended use? Treat UNKNOWN as unknown; never assume.' },
      budget: { type: 'score', instructions: 'How well does the parcel current value fit the stated budget range? Use only figures in the state.', criteria: BUDGET_LEVELS },
      return: { type: 'score', instructions: 'How well does the indicative projection meet the stated target return over the holding period? Use only figures in the state.', criteria: RETURN_LEVELS },
      verdict: {
        type: 'choice',
        instructions: 'Given the facts and the stated requirement, what is the appropriate indicative next step? Choose insufficient-information if key facts are UNKNOWN.',
        criteria: {
          proceed: 'Facts fit the requirement and none of the key facts are UNKNOWN.',
          'proceed-with-conditions': 'Broadly fits, but one or more conditions must be verified first.',
          'do-not-proceed': 'A stated requirement is clearly not met.',
          'insufficient-information': 'Too many key facts are UNKNOWN to judge.',
        },
      },
    },
  }
}
