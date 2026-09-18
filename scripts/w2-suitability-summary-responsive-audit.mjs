import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'

// Real-rendered QA for the DesignStudio building-template suitability
// summary panel (SuitabilitySummaryPanel). Serves the already-built static
// export locally (no new dependency - Node's own http/fs modules) and drives
// it with the Playwright Chromium build already vendored in
// apps/web/package.json, exactly like scripts/w2-354-responsive-audit.mjs.
// Scope: the /products/designstudio route only, at the nine breakpoints this
// task specifies. Checks zero horizontal overflow, that the 3D cockpit
// canvas (data-product-cockpit) is present and untouched, and that the new
// panel (data-suitability-summary) renders as its own section below the
// cockpit rather than covering or resizing it.

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const outRoot = path.resolve('apps', 'web', 'out')
const evidenceRoot = path.resolve('docs', 'evidence', 'w2-suitability-summary')
const screenshotRoot = path.join(evidenceRoot, 'screenshots')
const port = Number(process.env.FERRUM_AUDIT_PORT ?? 4179)
const route = '/products/designstudio.html'

const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]
const heightFor = (width) => (width <= 430 ? 844 : width <= 1024 ? 1024 : 900)

const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }

const server = createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname)
    const filePath = path.join(outRoot, urlPath === '/' ? 'index.html' : urlPath)
    const info = await stat(filePath).catch(() => null)
    const resolved = info?.isDirectory() ? path.join(filePath, 'index.html') : filePath
    const finalInfo = await stat(resolved).catch(() => null)
    if (!finalInfo) {
      response.writeHead(404)
      response.end('Not found')
      return
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(resolved)] ?? 'application/octet-stream' })
    createReadStream(resolved).pipe(response)
  } catch (error) {
    response.writeHead(500)
    response.end(String(error))
  }
})

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve))
const baseUrl = `http://127.0.0.1:${port}`

await mkdir(evidenceRoot, { recursive: true })
await mkdir(screenshotRoot, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []

for (const width of widths) {
  const viewport = { width, height: heightFor(width) }
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })

  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForTimeout(120)

  const metrics = await page.evaluate((viewportWidth) => {
    const cockpit = document.querySelector('[data-product-cockpit="designstudio"]')
    const summary = document.querySelector('[data-suitability-summary]')
    const cockpitRect = cockpit?.getBoundingClientRect() ?? null
    const summaryRect = summary?.getBoundingClientRect() ?? null
    const dimensionCards = document.querySelectorAll('[data-suitability-dimension]')
    const overallBadge = document.querySelector('[data-suitability-overall-state]')

    const overflowElements = [...document.querySelectorAll('body *')]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > viewportWidth + 1))
      .slice(0, 10)
      .map(({ element, rect }) => ({
        tag: element.tagName.toLowerCase(),
        className: element.className?.toString().slice(0, 140) ?? '',
        left: Math.round(rect.left),
        right: Math.round(rect.right),
      }))

    return {
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - viewportWidth),
      overflowElements,
      cockpitPresent: Boolean(cockpit),
      cockpitBox: cockpitRect ? { width: Math.round(cockpitRect.width), height: Math.round(cockpitRect.height), top: Math.round(cockpitRect.top), bottom: Math.round(cockpitRect.bottom) } : null,
      summaryPresent: Boolean(summary),
      summaryBox: summaryRect ? { width: Math.round(summaryRect.width), height: Math.round(summaryRect.height), top: Math.round(summaryRect.top), bottom: Math.round(summaryRect.bottom) } : null,
      summaryText: summary?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160) ?? '',
      dimensionCount: dimensionCards.length,
      overallStateRendered: overallBadge?.getAttribute('data-suitability-overall-state') ?? null,
      headingPresent: Boolean(document.getElementById('suitability-summary-heading')),
    }
  }, width)

  await page.screenshot({
    path: path.join(screenshotRoot, `${width}w-designstudio-suitability.png`),
    fullPage: true,
  })
  const summary = page.locator('[data-suitability-summary]')
  if (await summary.count()) {
    await summary.scrollIntoViewIfNeeded()
    await summary.screenshot({ path: path.join(screenshotRoot, `${width}w-suitability-panel.png`) })
  }

  const violations = []
  if (!response || response.status() >= 400) violations.push(`HTTP status ${response?.status() ?? 'none'}`)
  if (metrics.horizontalOverflow > 1) violations.push(`Horizontal overflow ${metrics.horizontalOverflow}px`)
  if (!metrics.cockpitPresent || !metrics.cockpitBox || metrics.cockpitBox.width <= 0 || metrics.cockpitBox.height <= 0) violations.push('3D cockpit canvas missing or zero-sized')
  if (!metrics.summaryPresent || !metrics.summaryBox || metrics.summaryBox.width <= 0 || metrics.summaryBox.height <= 0 || !metrics.summaryText.includes('Suitability across seven evidence-linked dimensions')) {
    violations.push('Suitability summary panel missing, hidden or missing its required heading')
  }
  if (metrics.dimensionCount !== 7) violations.push(`Expected 7 suitability dimensions, found ${metrics.dimensionCount}`)
  if (!metrics.overallStateRendered) violations.push('Overall suitability state not rendered')
  if (!metrics.headingPresent) violations.push('Suitability summary heading missing')
  if (metrics.cockpitBox && metrics.summaryBox && metrics.summaryBox.top < metrics.cockpitBox.bottom - 1) {
    violations.push(`Suitability summary panel (top ${metrics.summaryBox.top}) overlaps/covers the cockpit canvas (bottom ${metrics.cockpitBox.bottom})`)
  }

  results.push({ width, height: viewport.height, status: response?.status() ?? null, metrics, consoleErrors, violations })
  await context.close()
}

await browser.close()
await new Promise((resolve) => server.close(resolve))

const violations = results.filter((result) => result.violations.length)
const report = {
  generatedAt: new Date().toISOString(),
  route,
  widths,
  combinations: results.length,
  failingCombinations: violations.length,
  results,
}

await writeFile(path.join(evidenceRoot, 'after.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ route, widths: widths.length, failingCombinations: report.failingCombinations }, null, 2))

if (violations.length) process.exitCode = 1
