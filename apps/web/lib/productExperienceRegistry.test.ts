import { describe, expect, it } from 'vitest'
import { productExperienceList, productExperienceRegistry } from './productExperienceRegistry'
import { stageForProduct } from './homepageStages'

const ROADMAP_IDS = ['buildos', 'procurehub', 'communitybuild']
const LIVE_IDS = ['landintel', 'designstudio', 'structura', 'boq-pro', 'promarket', 'investflow', 'transact']

describe('productExperienceRegistry', () => {
  it('has exactly ten entries, one per CockpitProduct id, with no duplicates', () => {
    expect(productExperienceList).toHaveLength(10)
    const ids = productExperienceList.map((product) => product.id)
    expect(new Set(ids).size).toBe(10)
    expect(Object.keys(productExperienceRegistry)).toHaveLength(10)
  })

  it('sources `stage` from lib/homepageStages.ts stageForProduct rather than duplicating the mapping', () => {
    for (const product of productExperienceList) {
      expect(product.stage).toBe(stageForProduct[product.id])
    }
  })

  it.each(LIVE_IDS)('%s has a real live-cockpit tool, INDICATIVE evidence, and non-empty controls/outputCards', (id) => {
    const product = productExperienceRegistry[id as keyof typeof productExperienceRegistry]
    expect(product.tool.kind).toBe('live-cockpit')
    expect(product.evidenceState).toBe('INDICATIVE')
    expect(product.controls.length).toBeGreaterThan(0)
    expect(product.outputCards.length).toBeGreaterThan(0)
  })

  it.each(ROADMAP_IDS)('%s has a ROADMAP tool with a reason, ROADMAP evidence, and no invented controls/outputCards', (id) => {
    const product = productExperienceRegistry[id as keyof typeof productExperienceRegistry]
    expect(product.tool.kind).toBe('ROADMAP')
    expect(product.tool.kind === 'ROADMAP' && product.tool.reason.length).toBeGreaterThan(0)
    expect(product.evidenceState).toBe('ROADMAP')
    expect(product.controls).toEqual([])
    expect(product.outputCards).toEqual([])
  })

  it('every entry has a non-empty persona and lens grounded in that product, not a generic placeholder', () => {
    const seenPersonas = new Set<string>()
    for (const product of productExperienceList) {
      expect(product.persona.length).toBeGreaterThan(0)
      expect(product.lens.length).toBeGreaterThan(0)
      // Personas are per-product, not copy-pasted across all ten.
      expect(seenPersonas.has(product.persona)).toBe(false)
      seenPersonas.add(product.persona)
    }
  })

  it('every entry has a primaryCta pointing at its own product page', () => {
    for (const product of productExperienceList) {
      expect(product.primaryCta.href).toBe(`/products/${product.id}`)
      expect(product.primaryCta.label.length).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty, product-specific provenance disclosure', () => {
    const seen = new Set<string>()
    for (const product of productExperienceList) {
      expect(product.provenance.length).toBeGreaterThan(20)
      expect(seen.has(product.provenance)).toBe(false)
      seen.add(product.provenance)
    }
  })

  it('accent uses only relume-command or relume-steel — never relume-ink or relume-accent (reserved elsewhere)', () => {
    for (const product of productExperienceList) {
      expect(['relume-command', 'relume-steel']).toContain(product.accent)
    }
  })

  it('ROADMAP products use the relume-steel accent (the same token EvidenceStateBadge uses for ROADMAP)', () => {
    for (const id of ROADMAP_IDS) {
      expect(productExperienceRegistry[id as keyof typeof productExperienceRegistry].accent).toBe('relume-steel')
    }
  })

  it('Transact\'s provenance discloses test-mode specifically (case-flow token payment), not a generic claim', () => {
    expect(productExperienceRegistry.transact.provenance.toLowerCase()).toContain('test mode')
  })

  it('CommunityBuild is resolved to ROADMAP, not a live demo, matching its own product page\'s "not yet built" body text', () => {
    expect(productExperienceRegistry.communitybuild.evidenceState).toBe('ROADMAP')
    expect(productExperienceRegistry.communitybuild.tool.kind).toBe('ROADMAP')
  })

  it('defaultView is one of the real StudioView values', () => {
    const valid = new Set(['space', 'plan', 'front-elevation', 'side-elevation'])
    for (const product of productExperienceList) {
      expect(valid.has(product.defaultView)).toBe(true)
    }
  })
})
