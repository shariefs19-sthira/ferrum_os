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
  BIS_HOMEPAGE_PATTERN,
  GLOSSARY_TERM_COUNT,
  FAQ_COUNT,
} from './registry'

// Internal fleet seat/agent codenames that must never appear in
// public-facing metadata or schema (see AGENTS.md RULE 1/2's roster).
// Checked generically wherever public copy is scanned below, not just on
// the one "CLAUDE" instance this release-correction pass was opened for.
const INTERNAL_SEAT_NAMES = ['CLAUDE', 'SCRIBE', 'CRANE', 'ATLAS', 'MASON', 'RIVET', 'FERRITE', 'PI', 'ASTRA', 'CODEX-SENTINEL', 'Qoder-CN']

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
  it('every displayed standard has an exact code+edition, a publisher, and an exact official source URL (never the bare BIS homepage)', () => {
    for (const standard of STANDARDS) {
      expect(standard.publisher.length, standard.code).toBeGreaterThan(0)
      expect(standard.sourceUrl, standard.code).toMatch(/^https:\/\//)
      expect(BIS_HOMEPAGE_PATTERN.test(standard.sourceUrl), `${standard.code} source must be an exact standard-details/preview link, not the bare BIS homepage: ${standard.sourceUrl}`).toBe(false)
      expect(
        standard.sourceUrl,
        `${standard.code} source must resolve to an official BIS standard-details page or BIS preview PDF`,
      ).toMatch(/^https:\/\/(?:standards\.bis\.gov\.in\/website\/standard-details\?encryptedId=|www\.services\.bis\.gov\.in\/tmp\/SR[^/]+\.pdf$)/i)
      // Exact edition required: code must end in ":<year>" (e.g. "IS 456:2000",
      // "IS 875 (Part 3):2015") -- a bare series label with no edition/part
      // (the old "IS 1200" / "IS 875") is not an exact citation.
      expect(standard.code, `${standard.code} must carry an exact edition year`).toMatch(/:\d{4}$/)
      expect(standard.editionNote.length, standard.code).toBeGreaterThan(0)
      expect(standard.stanceIsFerrumJudgment, standard.code).toBe(true)
    }
  })

  it('IS 875 is published as an exact Part 3 wind-loads entry, explicitly "other than earthquake", and never claims seismic coverage', () => {
    const is875 = STANDARDS.find((s) => s.code.startsWith('IS 875'))
    expect(is875, 'IS 875 should be published as an exact Part 3 (wind loads) entry').toBeTruthy()
    expect(is875!.code).toBe('IS 875 (Part 3):2015')
    const haystack = [is875!.code, is875!.use, is875!.note, is875!.editionNote].join(' \n ')
    // Positive requirement: the entry must explicitly say it's wind loads
    // other than earthquake -- this is the boundary statement the release
    // review asked for, so its presence is required, not just tolerated.
    expect(haystack, 'IS 875 entry must explicitly say "other than earthquake"').toMatch(/other than earthquake/i)
    // Negative requirement: IS 875 must never be described as covering
    // "seismic" loading -- that's IS 1893, a separate, unpublished standard.
    expect(haystack, 'IS 875 entry must never claim seismic coverage').not.toMatch(/seismic/i)
    // And no OTHER standard's text smuggles seismic scope into IS 875's entry either.
    for (const standard of STANDARDS) {
      if (standard.code.startsWith('IS 875')) continue
      const text = [standard.use, standard.note].join(' ')
      expect(text, standard.code).not.toMatch(/IS 875.*seismic|seismic.*IS 875/i)
    }
  })

  it('CESMM4 and IS 1200 are excluded from the published Standards Navigator (no exact verified official source)', () => {
    for (const excludedCode of ['CESMM4', 'IS 1200']) {
      expect(STANDARDS.some((s) => s.code === excludedCode || s.code.startsWith(`${excludedCode}:`)), excludedCode).toBe(false)
    }
  })

  it('Standards Navigator metadata (title/description/OG) advertises only the actually-published, sourced standards -- never an excluded one', async () => {
    const { metadata } = await import('../../app/resources/standards-navigator/layout')
    const fields = [metadata.title, metadata.description, metadata.openGraph?.title, metadata.openGraph?.description]
      .map((f) => (typeof f === 'string' ? f : JSON.stringify(f)))
      .join(' \n ')

    // Every excluded standard must not be advertised, checked generically so
    // this keeps working if the exclusion list grows.
    for (const excluded of ['CESMM4', 'IS 1200']) {
      expect(STANDARDS.some((s) => s.code === excluded), `${excluded} should stay out of STANDARDS for this test to be meaningful`).toBe(false)
      // Word-boundary match: "IS 1200" must not appear even as a substring of
      // "IS 12005" etc, and must not false-negative against "IS 1200 vs..."
      expect(fields, `metadata must not advertise excluded standard ${excluded}`).not.toMatch(new RegExp(`\\b${excluded.replace(/\s+/g, '\\s+')}\\b`))
    }

    // Positively, every standard actually published IS named in the metadata.
    for (const code of STANDARDS_COVERED) {
      expect(fields, `metadata should name published standard ${code}`).toContain(code)
    }
  })

  it('STANDARDS_COVERED has no duplicate codes', () => {
    expect(new Set(STANDARDS_COVERED).size).toBe(STANDARDS_COVERED.length)
  })
})

describe('resources registry — public schema (no internal seat names, truthful dates)', () => {
  const RESEARCH_CASES_DIR = path.join(APP_RESOURCES, 'research-cases')

  it('no research-case layout.tsx (public Article schema) names an internal seat/agent instead of a public identity', () => {
    for (const item of RESEARCH_CASES) {
      const layoutPath = path.join(RESEARCH_CASES_DIR, item.slug, 'layout.tsx')
      const text = fs.readFileSync(layoutPath, 'utf8')
      const authorMatch = text.match(/authorSeat="([^"]*)"/)
      expect(authorMatch, `${item.slug} layout.tsx should set authorSeat`).toBeTruthy()
      const authorValue = authorMatch![1]
      for (const seat of INTERNAL_SEAT_NAMES) {
        expect(authorValue, `${item.slug} authorSeat must not be an internal seat name`).not.toBe(seat)
      }
      expect(authorValue.length).toBeGreaterThan(0)
    }
  })

  it('no research-case layout.tsx asserts a datePublished (none of this content is confirmed live yet)', () => {
    for (const item of RESEARCH_CASES) {
      const layoutPath = path.join(RESEARCH_CASES_DIR, item.slug, 'layout.tsx')
      const text = fs.readFileSync(layoutPath, 'utf8')
      expect(text, `${item.slug} layout.tsx must not hardcode datePublished before this content is actually live`).not.toMatch(/datePublished=/)
    }
  })
})

describe('resources registry — canonicals', () => {
  function readCanonical(text: string) {
    const m = text.match(/alternates:\s*\{\s*canonical:\s*['"`]([^'"`]+)['"`]/)
    return m ? m[1] : null
  }

  it('the research-cases index sets an explicit self-canonical', () => {
    const text = fs.readFileSync(path.join(APP_RESOURCES, 'research-cases', 'layout.tsx'), 'utf8')
    expect(readCanonical(text)).toBe('/resources/research-cases')
  })

  it('every research-case leaf sets an explicit self-canonical to its own URL', () => {
    for (const item of RESEARCH_CASES) {
      const text = fs.readFileSync(path.join(APP_RESOURCES, 'research-cases', item.slug, 'layout.tsx'), 'utf8')
      const raw = readCanonical(text)
      expect(raw, `${item.slug}: no alternates.canonical found`).toBeTruthy()
      // The layout source has canonical as a template literal
      // (`/resources/research-cases/${item.slug}`), so the raw regex match
      // still contains the literal "${item.slug}" text -- resolve it against
      // this item's actual slug before comparing.
      const resolved = raw!.replace('${item.slug}', item.slug)
      expect(resolved, item.slug).toBe(`/resources/research-cases/${item.slug}`)
    }
  })

  it('standards-navigator sets an explicit self-canonical', () => {
    const text = fs.readFileSync(path.join(APP_RESOURCES, 'standards-navigator', 'layout.tsx'), 'utf8')
    expect(readCanonical(text)).toBe('/resources/standards-navigator')
  })

  it('legacy routes (case-studies, is-code-guides, reports) stay noindex with canonical pointing at their replacement', () => {
    const legacy = [
      { file: path.join(APP_RESOURCES, 'case-studies', 'layout.tsx'), canonical: '/resources/research-cases' },
      { file: path.join(APP_RESOURCES, 'is-code-guides', 'page.tsx'), canonical: '/resources/standards-navigator' },
      { file: path.join(APP_RESOURCES, 'reports', 'page.tsx'), canonical: '/resources/research-cases' },
    ]
    for (const { file, canonical } of legacy) {
      const text = fs.readFileSync(file, 'utf8')
      expect(text, file).toMatch(/index:\s*false/)
      expect(readCanonical(text), file).toBe(canonical)
    }
  })
})

describe('resources registry — reports withdrawal + sitemap discovery', () => {
  const REPORTS_TEXT = fs.readFileSync(path.join(APP_RESOURCES, 'reports', 'page.tsx'), 'utf8')

  it('reports/page.tsx no longer states any invented survey/benchmark metric', () => {
    // Regression guard for the withdrawn 48-page/12-city/140+90/38-project
    // claims: no bare "<number> page(s)/cities/developers/contractors/
    // projects" style metric anywhere on the withdrawn page.
    expect(REPORTS_TEXT).not.toMatch(/\d+[\s-]*(page|cities|city|developer|contractor|project)s?\b/i)
  })

  it('reports/page.tsx is noindex', () => {
    expect(REPORTS_TEXT).toMatch(/index:\s*false/)
  })

  it('sitemap excludes withdrawn/legacy routes (reports, case-studies, is-code-guides) and includes the new canonical routes', async () => {
    const { default: sitemap } = await import('../../app/sitemap')
    const urls = sitemap().map((entry) => entry.url)

    for (const withdrawn of ['/resources/reports', '/resources/case-studies', '/resources/is-code-guides']) {
      expect(urls.some((u) => u.includes(withdrawn)), withdrawn).toBe(false)
    }
    expect(urls.some((u) => u.endsWith('/resources/research-cases'))).toBe(true)
    expect(urls.some((u) => u.endsWith('/resources/standards-navigator'))).toBe(true)
    for (const item of RESEARCH_CASES) {
      expect(urls.some((u) => u.endsWith(`/resources/research-cases/${item.slug}`)), item.slug).toBe(true)
    }
  })
})
