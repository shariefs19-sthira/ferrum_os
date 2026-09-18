import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRODUCT_FEATURE_DOCS } from './ai/corpus'
import { productFeatureList, productFeatureRegistry } from './productFeatureRegistry'

describe('product feature registry', () => {
  it('covers every product with unique, explained features', () => {
    expect(Object.keys(productFeatureRegistry)).toHaveLength(10)
    for (const features of Object.values(productFeatureRegistry)) {
      expect(features.length).toBeGreaterThan(0)
      expect(new Set(features.map((feature) => feature.id)).size).toBe(features.length)
      for (const feature of features) {
        expect(feature.title.length).toBeGreaterThan(2)
        expect(feature.body.length).toBeGreaterThan(20)
      }
    }
  })

  it('automatically exposes every registered feature to SUTRA', () => {
    expect(PRODUCT_FEATURE_DOCS).toHaveLength(productFeatureList.length)
    expect(new Set(PRODUCT_FEATURE_DOCS.map((doc) => doc.id)).size).toBe(productFeatureList.length)
  })

  it('keeps every product page on the shared registry', () => {
    for (const productId of Object.keys(productFeatureRegistry)) {
      const source = fs.readFileSync(path.join(process.cwd(), 'app', 'products', productId, 'page.tsx'), 'utf8')
      expect(source).toContain('productFeatureRegistry')
      expect(source).not.toContain('const featureItems = [')
    }
  })
})
