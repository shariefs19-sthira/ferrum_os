import { projectLandValue } from '../../analysis/investForecast'
import { BANDS, BUDGET_THRESHOLD, KEY_FACTS, SCORE_WEIGHTS, VERSIONS, RETURN_THRESHOLD, SCORE_LEVELS, SUIT_THRESHOLD, UNKNOWN_LIMIT } from './questions'
import { REGISTRY_VERSION } from './registry'
import type { Band, Citation, FitFacts, FitRequirement, FitResult, Verdict } from './types'

export const SAMPLE_LABEL = 'SAMPLE - not analysed by the model'
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
const r1 = (x: number) => Math.round(x * 10) / 10
const cr = (x: number) => `INR ${x.toFixed(2)} crore`
const USE_WORDS: Record<string, string[]> = { residential: ['resid'], commercial: ['commerc', 'retail', 'office'], agricultural: ['agri', 'farm'], industrial: ['industr'], mixed: ['mixed', 'resid', 'commerc'], hold: [''] }

/** Deterministic SAMPLE stand-in for jev. Same input gives same output. The FitResult shape is the contract the real Worker route must return. */
export function analyseSample(f: FitFacts, r: FitRequirement, used: FitResult['requirementUsed'] = []): FitResult {
  const facts: Record<(typeof KEY_FACTS)[number], unknown> = { area: f.areaSqm, 'land use': f.landUse, zone: f.zone, 'current value': f.askingValueCr, 'feasibility score': f.feasibilityScore, 'growth assumption': f.growthPct }
  const unknowns = KEY_FACTS.filter((k) => facts[k] === null)
  const known = 1 - unknowns.length / KEY_FACTS.length
  const projection = f.askingValueCr !== null && f.askingValueCr > 0 && f.growthPct !== null && r.holdYears !== null
    ? (() => { const p = projectLandValue(f.askingValueCr, f.growthPct, r.holdYears); return { years: r.holdYears, growthPct: f.growthPct, futureValueCr: p.futureValue, gainCr: p.gain } })()
    : null

  // Noul: use suitability
  let p = 0.5
  const cited: Citation[] = [{ label: 'Land use', value: f.landUse ?? 'UNKNOWN' }, { label: 'Intended use', value: r.intendedUse ?? 'UNKNOWN' }]
  let why = 'Land use or intended use is UNKNOWN, so suitability stays near even odds.'
  if (f.landUse && r.intendedUse) {
    const ok = (USE_WORDS[r.intendedUse] ?? ['']).some((w) => f.landUse!.toLowerCase().includes(w))
    p = ok ? 0.86 : 0.14
    why = ok ? `Recorded land use "${f.landUse}" is consistent with the stated ${r.intendedUse} use.` : `Recorded land use "${f.landUse}" does not match the stated ${r.intendedUse} use.`
  }
  if (r.preferredZone.trim() && f.zone) {
    const m = f.zone.toLowerCase().includes(r.preferredZone.trim().toLowerCase())
    p = clamp(p + (m ? 0.05 : -0.2), 0.02, 0.98)
    cited.push({ label: 'Zone', value: f.zone })
    why += m ? ' Zone matches the preference.' : ' Zone differs from the preference.'
  }
  if (r.minAreaSqm !== null && f.areaSqm !== null) {
    const ok = f.areaSqm >= r.minAreaSqm
    if (!ok) { p = clamp(p - 0.25, 0.02, 0.98); why += ' Area is below the stated minimum.' }
    cited.push({ label: 'Area', value: `${f.areaSqm} m2 vs minimum ${r.minAreaSqm} m2` })
  }
  const suitConf = clamp(0.35 + known * 0.6, 0, 0.97)

  // Score: budget fit, levels 1..5
  let budget = 3
  let budgetWhy = 'Current value or budget is UNKNOWN; no budget judgment is made.'
  const bCited: Citation[] = [{ label: 'Current value', value: f.askingValueCr === null ? 'UNKNOWN' : cr(f.askingValueCr) }, { label: 'Budget', value: r.budgetMaxCr === null ? 'UNKNOWN' : `${r.budgetMinCr ?? 0} to ${r.budgetMaxCr} crore` }]
  if (f.askingValueCr !== null && r.budgetMaxCr !== null) {
    const val = f.askingValueCr, max = r.budgetMaxCr
    budget = val > max * 1.25 ? 1 : val > max * 1.05 ? 2 : val > max ? 2.5 : val <= max * 0.85 ? 5 : 4
    budgetWhy = `${cr(val)} against a ceiling of ${cr(max)}.`
  }
  // Score: return fit, levels 1..5
  let ret = 3
  let retWhy = 'No projection is available (value, growth assumption or holding period UNKNOWN).'
  const rCited: Citation[] = [{ label: 'Growth assumption', value: f.growthPct === null ? 'UNKNOWN' : `${f.growthPct}%/yr` }, { label: 'Target return', value: r.targetReturnPct === null ? 'UNKNOWN' : `${r.targetReturnPct}%/yr` }]
  if (projection && r.targetReturnPct !== null) {
    ret = clamp(3 + (projection.growthPct - r.targetReturnPct) / 2, 1, SCORE_LEVELS)
    retWhy = `Assumed growth ${projection.growthPct}%/yr vs target ${r.targetReturnPct}%/yr over ${projection.years} years (projected ${cr(projection.futureValueCr)}, gain ${cr(projection.gainCr)}). Growth is a user assumption, not a forecast.`
  }

  // Choice
  const verifiedFail = r.requireVerifiedRecord && f.provenance?.status !== 'VERIFIED'
  let choice: Verdict
  if (unknowns.length >= UNKNOWN_LIMIT) choice = 'insufficient-information'
  else if (p < SUIT_THRESHOLD.low || budget <= BUDGET_THRESHOLD.poor - 1) choice = 'do-not-proceed'
  else if (p >= SUIT_THRESHOLD.high && budget >= BUDGET_THRESHOLD.good && ret >= RETURN_THRESHOLD.good && !verifiedFail && unknowns.length === 0) choice = 'proceed'
  else choice = 'proceed-with-conditions'
  const verdictConf = choice === 'insufficient-information' ? clamp(0.9 - known * 0.6, 0.5, 0.9) : clamp(0.4 + known * 0.55, 0, 0.95)
  const others = (1 - verdictConf) / 3
  const probabilities: Record<Verdict, number> = { proceed: others, 'proceed-with-conditions': others, 'do-not-proceed': others, 'insufficient-information': others }
  probabilities[choice] = verdictConf
  const conds = [...unknowns.map((u) => `${u} is UNKNOWN`), ...(verifiedFail ? ['record is not VERIFIED'] : []), ...(ret < RETURN_THRESHOLD.good ? ['return is below target'] : []), ...(budget < BUDGET_THRESHOLD.good ? ['budget headroom is thin'] : [])]
  const vWhy = choice === 'insufficient-information' ? `${unknowns.length} of ${KEY_FACTS.length} key facts are UNKNOWN (${unknowns.join(', ')}); no recommendation is made.`
    : choice === 'proceed' ? 'Suitability, budget and return all clear their thresholds and no key fact is UNKNOWN.'
    : choice === 'do-not-proceed' ? 'A stated requirement (use suitability or budget) is clearly not met.'
    : `Broadly fits, but verify first: ${conds.join('; ') || 'confirm suitability'}.`

  const w = SCORE_WEIGHTS
  const pcts = { suitPct: Math.round(p * 100), budgetPct: Math.round(((r1(budget) - 1) / (SCORE_LEVELS - 1)) * 100), returnPct: Math.round(((r1(ret) - 1) / (SCORE_LEVELS - 1)) * 100) }
  const score = choice === 'insufficient-information' ? null : Math.round(w.suit * pcts.suitPct + w.budget * pcts.budgetPct + w.ret * pcts.returnPct)
  const band: Band | null = score === null ? null : score >= BANDS.strong ? 'strong' : score >= BANDS.moderate ? 'moderate' : 'weak'
  const breakdown = score === null ? null : { ...pcts, weights: { suit: w.suit, budget: w.budget, ret: w.ret }, formula: `${w.suit} x ${pcts.suitPct} + ${w.budget} x ${pcts.budgetPct} + ${w.ret} x ${pcts.returnPct} = ${score}` }

  return {
    score, band, breakdown, versions: { ...VERSIONS, registry: REGISTRY_VERSION }, requirementUsed: used,
    source: 'SAMPLE', unknowns: [...unknowns],
    suit: { kind: 'noul', id: 'suit', question: 'Does this parcel plausibly suit the stated use?', probability: p, confidence: suitConf, why, cited },
    budget: { kind: 'score', id: 'budget', question: 'How well does the value fit the budget?', score: r1(budget), levels: SCORE_LEVELS, confidence: f.askingValueCr === null ? 0.3 : suitConf, why: budgetWhy, cited: bCited },
    ret: { kind: 'score', id: 'return', question: 'How well does the projection meet the target return?', score: r1(ret), levels: SCORE_LEVELS, confidence: projection ? clamp(suitConf - 0.1, 0.2, 0.9) : 0.3, why: retWhy, cited: rCited },
    verdict: { kind: 'choice', id: 'verdict', question: 'Indicative next step', choice, probabilities, confidence: verdictConf, why: vWhy, cited: [{ label: 'UNKNOWN key facts', value: `${unknowns.length} of ${KEY_FACTS.length}` }, { label: 'Provenance', value: f.provenance?.status ?? 'UNKNOWN' }] },
    feasibilityScore: f.feasibilityScore, projection,
  }
}
