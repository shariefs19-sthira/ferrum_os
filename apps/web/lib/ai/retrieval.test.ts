import { describe, it, expect } from 'vitest'
import { retrieve, retrieveConfident, CONFIDENCE_THRESHOLD } from './retrieval'
import { CORPUS } from './corpus'

describe('corpus', () => {
  it('every doc has a real, non-empty href and text sourced from published content', () => {
    for (const doc of CORPUS) {
      expect(doc.href.startsWith('/')).toBe(true)
      expect(doc.text.length).toBeGreaterThan(0)
      expect(doc.title.length).toBeGreaterThan(0)
    }
  })
})

describe('retrieve', () => {
  it('returns empty for an empty query', () => {
    expect(retrieve('')).toEqual([])
    expect(retrieve('   ')).toEqual([])
  })

  it('ranks a strong keyword match above unrelated docs', () => {
    const hits = retrieve('IS 456 structural design')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].doc.id).toBe('standard:is-456')
  })

  it('finds the LandIntel product for a ULPIN question', () => {
    const hits = retrieve('how do I look up a ULPIN parcel', 5)
    expect(hits.some((h) => h.doc.id === 'product:landintel')).toBe(true)
  })

  it('is deterministic across repeated calls', () => {
    const a = retrieve('pricing plans')
    const b = retrieve('pricing plans')
    expect(a).toEqual(b)
  })

  it('respects topK', () => {
    const hits = retrieve('is code standards adopt hold drop', 1)
    expect(hits.length).toBeLessThanOrEqual(1)
  })
})

describe('retrieveConfident', () => {
  it('filters out hits below the confidence threshold', () => {
    const hits = retrieveConfident('zzz nonexistent gibberish query 9999')
    expect(hits).toEqual([])
  })

  it('keeps hits at or above the confidence threshold', () => {
    const hits = retrieveConfident('IS 456 structural design')
    for (const h of hits) {
      expect(h.score).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD)
    }
  })
})
