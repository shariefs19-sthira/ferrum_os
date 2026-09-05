import {describe,expect,it} from 'vitest'
import {normalizeProfessionalTerms,termsIn} from './vocabulary'
describe('professional vocabulary',()=>{
  it('normalizes built-environment equivalents',()=>expect(normalizeProfessionalTerms('Keep building line margins at 3m and FSI 1.5')).toBe('keep setback setback at 3m and far 1.5'))
  it('normalizes approval, structural, MEP and finance language',()=>expect(termsIn('Sanction with NOC; check spans, connected load and internal rate of return for the investment amount')).toEqual(['approval','structure','mep','noc','irr','ticket']))
})
