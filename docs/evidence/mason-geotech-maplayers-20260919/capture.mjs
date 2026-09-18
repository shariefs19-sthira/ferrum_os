// LOCAL STATIC-BUILD evidence only -- this serves apps/web/out/ (the exported
// production build) on localhost, headless, and is NOT a deployed-edge
// verification (RULE 25). It exists because this row is explicitly not
// landed or deployed yet ("Do not land or deploy"): the new
// GeotechnicalMapLayerLegend surface does not exist on any live edge to
// screenshot. Run from apps/web after `next build` has produced `out/`.
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, devices } from '../../../apps/web/node_modules/playwright/index.mjs'

const evidenceDir = dirname(fileURLToPath(import.meta.url))
const outDir = join(evidenceDir, '../../../apps/web/out')
const port = 48173

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.wasm': 'application/wasm' }

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    let path = decodeURIComponent(url.pathname)
    if (path === '/') path = '/index.html'
    const candidates = [path, `${path}.html`, `${path}/index.html`]
    for (const candidate of candidates) {
      try {
        const body = await readFile(join(outDir, candidate))
        res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] ?? 'application/octet-stream' })
        res.end(body)
        return
      } catch { /* try next candidate */ }
    }
    res.writeHead(404)
    res.end('not found')
  } catch (error) {
    res.writeHead(500)
    res.end(String(error))
  }
})

await new Promise((resolve) => server.listen(port, resolve))
await mkdir(evidenceDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = { capturedAt: new Date().toISOString(), source: 'LOCAL STATIC BUILD (apps/web/out) -- not a deployed edge', captures: [] }

async function capture({ name, mobile, prepare, evidence }) {
  const context = await browser.newContext(mobile ? { ...devices['iPhone 13'], colorScheme: 'light' } : { viewport: { width: 1366, height: 900 }, colorScheme: 'light' })
  const page = await context.newPage()
  // /api/region is a Worker-backed route a static file server structurally
  // cannot serve (RULE 25's own static-vs-edge distinction) -- it is fetched
  // site-wide, unrelated to the geotechnical map-layer legend this capture
  // is actually evidencing. Stubbed here only so the capture log stays free
  // of noise from a route this local static-build harness was never going
  // to be able to answer; not a claim that /api/region works, and not part
  // of what this evidence is verifying.
  await page.route('**/api/region', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
  const consoleErrors = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('response', (res) => { if (res.status() >= 400 && !res.url().includes('/api/region')) consoleErrors.push(`HTTP ${res.status()} for ${res.url()}`) })
  const response = await page.goto(`http://localhost:${port}/products/landintel`, { waitUntil: 'load', timeout: 30_000 })
  await prepare(page)
  await page.screenshot({ path: `${evidenceDir}/${name}.png`, fullPage: false })
  report.captures.push({ name, mobile: !!mobile, httpStatus: response?.status() ?? null, evidence: await evidence(page), consoleErrors })
  await context.close()
}

const text = async (page, selector) => (await page.locator(selector).innerText()).replace(/\s+/g, ' ').trim()

for (const mobile of [false, true]) {
  await capture({
    name: `landintel-geotech-maplayer-legend-${mobile ? 'mobile' : 'desktop'}`,
    mobile,
    prepare: async (page) => {
      await page.getByRole('tab', { name: 'Land' }).click()
      await page.locator('[data-geotechnical-map-layer-legend]').scrollIntoViewIfNeeded()
    },
    evidence: async (page) => ({
      legendHeading: await text(page, '#geotechnical-map-layer-heading'),
      declarativeNotMapDisclosure: await text(page, '[data-geotechnical-map-layer-disclosure]'),
      connectorStatus: await text(page, '[data-geotechnical-map-layer-connector-status]'),
      unknownGapCount: await text(page, '[data-map-layer-category="UNKNOWN_GAP"] [data-map-layer-count]'),
      authoritativeCoverageCount: await text(page, '[data-map-layer-category="AUTHORITATIVE_COVERAGE"] [data-map-layer-count]'),
      horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    }),
  })
}

await import('node:fs/promises').then((fs) => fs.writeFile(`${evidenceDir}/capture-report.json`, `${JSON.stringify(report, null, 2)}\n`, 'utf8'))
await browser.close()
server.close()
