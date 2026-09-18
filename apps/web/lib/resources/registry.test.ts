import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  RESOURCE_CATEGORIES,
  RESEARCH_CASES,
  BLOG_SLUGS,
  CHECKLIST_SLUGS,
  LEGACY_CASE_STUDY_SLUGS,
  STANDARDS,
  STANDARDS_COVERED,
  GLOSSARY_TERM_COUNT,
  FAQ_COUNT,
} from './registry'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. These tests exist because
// the packet requires counts/link coverage to be *derived from repository
// content, never padded or guessed* -- so every count here is cross-checked
// against the real route tree on disk, not just against itself.

const APP_RESOURCES = path.join(__dirname, '..', '..', 'app', 'resources')

function dirSlugs(dir: string, exclude: string[] = []) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !exclude.includes(e.name))
    .map((e) => e.name)
    .sort()
}

describe('resources registry — taxonomy', () => {
  it('the six hub categories are exactly Blog, Research Cases, Standards Navigator, Checklists, Glossary, FAQ', () => {
    expect(RESOURCE_CATEGORIES.map((c) => c.name)).toEqual([
      'Blog',
      'Research Cases',
      'Standards Navigator',
      'Checklists',
      'Glossary',
      'FAQ',
    ])
  })

  it('no category is named "Case Studies" or "IS Code Guides"', () => {
    for (const category of RESOURCE_CATEGORIES) {
      expect(category.name).not.toMatch(/case stud/i)
      expect(category.name).not.toMatch(/is code guides/i)
    }
  })
})

describe('resources registry — counts/link coverage', () => {
  it('BLOG_SLUGS matches the real blog directory tree (excluding _template)', () => {
    const onDisk = dirSlugs(path.join(APP_RESOURCES, 'blog'))
    expect([...BLOG_SLUGS].sort()).toEqual(onDisk)
  })

  it('CHECKLIST_SLUGS matches the real checklists directory tree', () => {
    const onDisk = dirSlugs(path.join(APP_RESOURCES, 'checklists'))
    expect([...CHECKLIST_SLUGS].sort()).toEqual(onDisk)
  })

  it('RESEARCH_CASES matches the real research-cases directory tree', () => {
    const onDisk = dirSlugs(path.join(APP_RESOURCES, 'research-cases'))
    expect(RESEARCH_CASES.map((c) => c.slug).sort()).toEqual(onDisk)
  })

  it('LEGACY_CASE_STUDY_SLUGS matches the real (withdrawn) case-studies directory tree', () => {
    const onDisk = dirSlugs(path.join(APP_RESOURCES, 'case-studies'))
    expect([...LEGACY_CASE_STUDY_SLUGS].sort()).toEqual(onDisk)
  })

  it('every hub category href resolves to a real page.tsx on disk', () => {
    for (const category of RESOURCE_CATEGORIES) {
      const routeDir = category.href.replace('/resources', '').replace(/^\//, '')
      const pagePath = path.join(APP_RESOURCES, routeDir, 'page.tsx')
      expect(fs.existsSync(pagePath), `${category.href} -> ${pagePath}`).toBe(true)
    }
  })

  it('every hub category count equals the length of its own source list', () => {
    const byKey = Object.fromEntries(RESOURCE_CATEGORIES.map((c) => [c.key, c.count]))
    expect(byKey['blog']).toBe(BLOG_SLUGS.length)
    expect(byKey['research-cases']).toBe(RESEARCH_CASES.length)
    expect(byKey['standards-navigator']).toBe(STANDARDS_COVERED.length)
    expect(byKey['checklists']).toBe(CHECKLIST_SLUGS.length)
    expect(byKey['glossary']).toBe(GLOSSARY_TERM_COUNT)
    expect(byKey['faq']).toBe(FAQ_COUNT)
  })

  it('every research case has a real page.tsx and layout.tsx under its slug', () => {
    for (const item of RESEARCH_CASES) {
      const dir = path.join(APP_RESOURCES, 'research-cases', item.slug)
      expect(fs.existsSync(path.join(dir, 'page.tsx')), item.slug).toBe(true)
      expect(fs.existsSync(path.join(dir, 'layout.tsx')), item.slug).toBe(true)
    }
  })

  it('every legacy case-study slug has a real page.tsx and layout.tsx under its slug', () => {
    for (const slug of LEGACY_CASE_STUDY_SLUGS) {
      const dir = path.join(APP_RESOURCES, 'case-studies', slug)
      expect(fs.existsSync(path.join(dir, 'page.tsx')), slug).toBe(true)
      expect(fs.existsSync(path.join(dir, 'layout.tsx')), slug).toBe(true)
    }
  })
})

describe('resources registry — claim boundary (research cases)', () => {
  const bannedPhrases = [
    /our customer/i,
    /client says/i,
    /completed .* ahead of schedule/i,
    /cost savings/i,
    /critical acclaim/i,
    /ferrum (os )?(delivered|implemented|built|completed) (the|this) project/i,
  ]

  it('no research case summary or metadata field makes a customer-use or outcome claim', () => {
    for (const item of RESEARCH_CASES) {
      const haystack = [item.title, item.summary, item.analysisBoundary, item.evidenceStatus, item.publicationNote].join(' \n ')
      for (const pattern of bannedPhrases) {
        expect(haystack, `${item.slug} matched ${pattern}`).not.toMatch(pattern)
      }
    }
  })

  it('every research case names a primary source with a URL, publisher, jurisdiction, and evidence status', () => {
    for (const item of RESEARCH_CASES) {
      expect(item.source.url, item.slug).toMatch(/^https:\/\//)
      expect(item.source.label.length, item.slug).toBeGreaterThan(0)
      expect(item.source.publisher.length, item.slug).toBeGreaterThan(0)
      expect(item.jurisdiction.length, item.slug).toBeGreaterThan(0)
      expect(item.analysisBoundary.length, item.slug).toBeGreaterThan(0)
      expect(item.evidenceStatus.length, item.slug).toBeGreaterThan(0)
    }
  })

  it('every research case source URL is distinct (no two cases share one primary source)', () => {
    const urls = RESEARCH_CASES.map((c) => c.source.url)
    expect(new Set(urls).size).toBe(urls.length)
  })
})

describe('resources registry — claim boundary (standards navigator)', () => {
  it('every displayed standard has a publisher and either a verified source URL or an explicit reason it has none', () => {
    for (const standard of STANDARDS) {
      expect(standard.publisher.length, standard.code).toBeGreaterThan(0)
      if (standard.sourceUrl === null) {
        expect(standard.sourceLabel.length, `${standard.code} must explain its missing source`).toBeGreaterThan(0)
      } else {
        expect(standard.sourceUrl, standard.code).toMatch(/^https:\/\//)
      }
      expect(standard.editionNote.length, standard.code).toBeGreaterThan(0)
      expect(standard.stanceIsFerrumJudgment, standard.code).toBe(true)
    }
  })

  it('CESMM4 is excluded from the published Standards Navigator (no verified official source)', () => {
    expect(STANDARDS.some((s) => s.code === 'CESMM4')).toBe(false)
  })

  it('STANDARDS_COVERED has no duplicate codes', () => {
    expect(new Set(STANDARDS_COVERED).size).toBe(STANDARDS_COVERED.length)
  })
})
