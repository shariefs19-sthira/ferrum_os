import { describe, it, expect } from 'vitest'
import { answerWithGrounding } from './concierge'
import { FALLBACK_MESSAGE } from '../concierge/intents'

describe('answerWithGrounding', () => {
  it('prefers the deterministic route match and includes a navigation href', () => {
    const answer = answerWithGrounding('pricing')
    expect(answer.source).toBe('deterministic')
    expect(answer.navigateHref).toBe('/pricing')
    expect(answer.citations[0].href).toBe('/pricing')
  })

  it('falls through to a grounded retrieval answer with citations when no deterministic route matches', () => {
    const answer = answerWithGrounding('how often are the adopt hold drop stances reviewed')
    expect(answer.source).toBe('retrieval')
    expect(answer.citations.length).toBeGreaterThan(0)
    expect(answer.navigateHref).toBeUndefined()
    for (const c of answer.citations) {
      expect(c.href.startsWith('/')).toBe(true)
    }
  })

  it('never invents an answer -- falls back honestly when nothing is confidently retrievable', () => {
    const answer = answerWithGrounding('asdkjhqwlkejhasdlkjhasdlkjhasd')
    expect(answer.source).toBe('fallback')
    expect(answer.text).toBe(FALLBACK_MESSAGE)
    expect(answer.citations).toEqual([])
  })
})
