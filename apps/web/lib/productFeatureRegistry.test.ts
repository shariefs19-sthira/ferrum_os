import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PRODUCT_FEATURE_DOCS } from './ai/corpus'
import { answerProductKnowledge } from './ai/productKnowledge'
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

  it('grounds SUTRA terrain explanations in the LandIntel registry', () => {
    const answer = answerProductKnowledge('Explain LiDAR terrain intelligence in LandIntel')
    expect(answer?.source).toBe('retrieval')
    expect(answer?.text).toContain('Governed terrain intelligence')
    expect(answer?.text).toContain('INDICATIVE until validated against a project survey')
    expect(answer?.citations).toEqual([{ title: 'LandIntel: Governed terrain intelligence', href: '/products/landintel' }])
  })

  it('grounds model preview and controlled-release explanations in the shared registry', () => {
    const preview = answerProductKnowledge('Explain model preview on ingestion in DesignStudio')
    const release = answerProductKnowledge('Explain approved for machine in BuildOS')
    expect(preview?.text).toContain('Model preview on ingestion')
    expect(preview?.text).toContain('PREVIEWED only')
    expect(release?.text).toContain('APPROVED FOR MACHINE')
    expect(release?.text).toContain('revision-specific')
  })

  it('keeps every product page on the shared registry', () => {
    for (const productId of Object.keys(productFeatureRegistry)) {
      const source = fs.readFileSync(path.join(process.cwd(), 'app', 'products', productId, 'page.tsx'), 'utf8')
      expect(source).toContain('productFeatureRegistry')
      expect(source).not.toContain('const featureItems = [')
    }
  })
})
