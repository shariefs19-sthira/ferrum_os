import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

// CLAUDE-20260918-RESOURCE-RESEARCH-CASES-LIVE. A case-insensitive
// public-source scan: no visible "Case Studies" label or unsupported
// Ferrum-customer-use copy anywhere in the app source, except inside the
// explicit withdrawn-page notices / compatibility routes / their own
// metadata comments that this task created specifically to explain the
// rename -- those are named in ALLOWLIST below and nowhere else.

const ROOT = path.join(__dirname, '..', '..', '..') // apps/web
const SCAN_DIRS = ['app', 'components', 'lib']

const ALLOWLIST = new Set(
  [
    'lib/resources/registry.ts', // comment only, referencing the withdrawn route
    'lib/resources/registry.test.ts', // this test's own sibling asserts absence elsewhere
    'app/resources/_components/LegacyNotice.tsx', // the withdrawal notice itself
    'app/resources/case-studies/page.tsx',
    'app/resources/case-studies/layout.tsx',
    'app/resources/is-code-guides/page.tsx',
    'app/resources/research-cases/page.tsx', // explains the taxonomy change once
    'app/resources/__tests__/taxonomy.test.ts', // this file
  ].map((p) => p.replace(/\//g, path.sep)),
)

function walk(dir: string, files: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\.(tsx?|jsx?)$/.test(entry.name)) files.push(full)
  }
  return files
}

const SOURCE_FILES = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)))

// "case stud(y|ies)" as the product-taxonomy label, not incidental prose use
// of "case study" elsewhere in the site (e.g. a knowledge-base article
// citing an unrelated academic case study).
const TAXONOMY_PATTERN = /\bcase studies\b|\bis code guides\b/i

const CLAIM_PATTERNS = [
  /ahead of schedule/i,
  /cost savings/i,
  /critical acclaim/i,
  /real-world examples and success stories/i,
  /how .*ferrum os has transformed/i,
  /the developer achieved/i,
  // Withdrawn /resources/reports metrics (48-page benchmark, 12 cities,
  // 140 developers + 90 contractors, 38 active projects) -- regression
  // guard against those specific invented figures reappearing anywhere.
  /48-page/i,
  /12 indian cities/i,
  /140 indian developers/i,
  /90 contractors/i,
  /38 active projects/i,
]

describe('public resources sweep — taxonomy', () => {
  it('no source file outside the compatibility allowlist mentions "Case Studies" or "IS Code Guides"', () => {
    const offenders: string[] = []
    for (const file of SOURCE_FILES) {
      const rel = path.relative(ROOT, file)
      if (ALLOWLIST.has(rel)) continue
      const text = fs.readFileSync(file, 'utf8')
      if (TAXONOMY_PATTERN.test(text)) offenders.push(rel)
    }
    expect(offenders).toEqual([])
  })
})

describe('public resources sweep — claim boundary', () => {
  it('no source file makes an unsupported customer-outcome or delivery claim', () => {
    const offenders: string[] = []
    for (const file of SOURCE_FILES) {
      const text = fs.readFileSync(file, 'utf8')
      for (const pattern of CLAIM_PATTERNS) {
        if (pattern.test(text)) offenders.push(`${path.relative(ROOT, file)} :: ${pattern}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
