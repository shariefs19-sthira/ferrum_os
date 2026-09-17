// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { recordFeedback, getFeedback, clearFeedback } from './feedback'

describe('feedback', () => {
  beforeEach(() => {
    clearFeedback()
  })

  it('records a useful entry and reads it back', () => {
    recordFeedback({
      query: 'pricing',
      answerText: "Here's Pricing -- taking you there now.",
      answerSource: 'deterministic',
      useful: true,
    })
    const all = getFeedback()
    expect(all.length).toBe(1)
    expect(all[0].useful).toBe(true)
    expect(all[0].id).toBeTruthy()
    expect(all[0].timestamp).toBeTruthy()
  })

  it('records a not-useful entry with an optional correction', () => {
    recordFeedback({
      query: 'foo',
      answerText: 'bar',
      answerSource: 'fallback',
      useful: false,
      correction: 'I meant the stamp duty estimator',
    })
    const all = getFeedback()
    expect(all[0].useful).toBe(false)
    expect(all[0].correction).toBe('I meant the stamp duty estimator')
  })

  it('never stores anything resembling a credential or identifier field', () => {
    const entry = recordFeedback({
      query: 'test',
      answerText: 'test',
      answerSource: 'retrieval',
      useful: true,
    })
    const keys = Object.keys(entry)
    for (const forbidden of ['email', 'password', 'token', 'userId', 'ip', 'phone']) {
      expect(keys).not.toContain(forbidden)
    }
  })

  it('clearFeedback empties the log', () => {
    recordFeedback({ query: 'a', answerText: 'b', answerSource: 'fallback', useful: true })
    clearFeedback()
    expect(getFeedback()).toEqual([])
  })
})
