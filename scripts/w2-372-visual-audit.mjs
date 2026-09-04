import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const phase = process.env.FERRUM_EVIDENCE_PHASE
if (!['before', 'after'].includes(phase)) throw new Error('FERRUM_EVIDENCE_PHASE must be before or after')

const baseUrl = process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4179'
const appRoot = path.resolve('apps', 'web', 'app')
const evidenceRoot = path.resolve('docs', 'evidence', 'w2-372')
const screenshotRoot = path.join(evidenceRoot, phase)
const viewports = [
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'mobile-375', width: 375, height: 812 },
]

async function collectPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectPageFiles(entryPath)
    return entry.name === 'page.tsx' || entry.name === 'page.ts' ? [entryPath] : []
  }))
  return nested.flat()
}

function routeFromPage(file) {
  const relative = path.relative(appRoot, path.dirname(file)).replaceAll('\\', '/')
  if (!relative) return '/'
  const segments = relative.split('/').filter((segment) => !/^\(.+\)$/.test(segment))
  if (segments.some((segment) => segment.startsWith('_') || segment.startsWith('['))) return null
  return `/${segments.join('/')}`
}

function slug(route) {
  return route === '/' ? 'home' : route.slice(1).replaceAll('/', '--')
}

const routes = [...new Set((await collectPageFiles(appRoot)).map(routeFromPage).filter(Boolean))].sort()
await mkdir(screenshotRoot, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []
let completed = 0

for (const viewport of viewports) {
  const viewportRoot = path.join(screenshotRoot, viewport.name)
  await mkdir(viewportRoot, { recursive: true })
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
  await context.addInitScript(() => {
    localStorage.setItem('ferrum-cookie-consent', 'accepted')
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    })
  })
  await context.route('**/api/auth/session', (request) => request.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ user: null }),
  }))
  const page = await context.newPage()

  for (const route of routes) {
    const consoleErrors = []
    const pageErrors = []
    const onConsole = (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) }
    const onPageError = (error) => pageErrors.push(error.message)
    page.on('console', onConsole)
    page.on('pageerror', onPageError)

    const response = await page.goto(`${baseUrl}${route === '/' ? '/' : `${route}.html`}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await page.waitForTimeout(100)
    const metrics = await page.evaluate((width) => {
      const bodyText = document.body.innerText
      const chipMatches = bodyText.match(/\b(?:INDICATIVE|ROADMAP|TEST MODE)\b/gi) ?? []
      return {
        documentWidth: document.documentElement.scrollWidth,
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - width),
        honestyLabels: chipMatches.map((label) => label.toUpperCase()),
        dynamicGraphics: document.querySelectorAll('[data-dynamic-graphic]').length,
        revealTargets: document.querySelectorAll('[data-reveal]').length,
      }
    }, viewport.width)

    await page.screenshot({
      path: path.join(viewportRoot, `${slug(route)}.png`),
      fullPage: false,
      animations: 'disabled',
    })

    results.push({
      route,
      viewport,
      status: response?.status() ?? null,
      consoleErrors,
      pageErrors,
      ...metrics,
    })
    page.off('console', onConsole)
    page.off('pageerror', onPageError)
    completed += 1
    if (completed % 25 === 0 || completed === routes.length * viewports.length) {
      console.log(`${phase}: ${completed}/${routes.length * viewports.length}`)
    }
  }

  await context.close()
}

await browser.close()

const report = {
  phase,
  generatedAt: new Date().toISOString(),
  routes: routes.length,
  viewports,
  combinations: results.length,
  failingStatuses: results.filter((result) => result.status === null || result.status >= 400).length,
  overflowFailures: results.filter((result) => result.horizontalOverflow > 1).length,
  consoleErrorCount: results.reduce((total, result) => total + result.consoleErrors.length, 0),
  pageErrorCount: results.reduce((total, result) => total + result.pageErrors.length, 0),
  honestyLabelCount: results.reduce((total, result) => total + result.honestyLabels.length, 0),
  results,
}

await writeFile(path.join(evidenceRoot, `${phase}.json`), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({
  routes: report.routes,
  combinations: report.combinations,
  failingStatuses: report.failingStatuses,
  overflowFailures: report.overflowFailures,
  consoleErrorCount: report.consoleErrorCount,
  pageErrorCount: report.pageErrorCount,
  honestyLabelCount: report.honestyLabelCount,
}, null, 2))

if (report.failingStatuses || report.overflowFailures || report.consoleErrorCount || report.pageErrorCount) process.exitCode = 1
