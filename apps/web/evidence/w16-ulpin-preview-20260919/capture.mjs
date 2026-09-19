// W-16 evidence: serves apps/web/out statically, headless isolated Chromium, no interaction first.
// Run from apps/web:  node evidence/w16-ulpin-preview-20260919/capture.mjs
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const root = path.resolve('out'), outDir = path.resolve('evidence/w16-ulpin-preview-20260919')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain' }
const EDGE = 'https://ferrumos-preview.shariefsatyala.workers.dev' // read-only GET proxy for /api/* (live seeded ULPIN record, /api/region)
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/')) { try { const r = await fetch(EDGE + req.url); res.writeHead(r.status, { 'content-type': r.headers.get('content-type') ?? 'application/json' }); return res.end(Buffer.from(await r.arrayBuffer())) } catch { res.writeHead(502); return res.end('proxy') } }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index'
  const candidates = [path.join(root, p), path.join(root, p + '.html'), path.join(root, p, 'index.html')]
  const file = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile())
  if (!file) { res.writeHead(404); return res.end('not found') }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' }); fs.createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true })
const report = {}
for (const [name, width, height, touch] of [['1366x768', 1366, 768, false], ['375x812', 375, 812, true]]) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 })
  const page = await context.newPage(); const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) }); page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${base}/products/landintel`, { waitUntil: 'networkidle' })
  const ctxBefore = await page.evaluate(() => window.localStorage.getItem('ferrum-parcel-context-v1'))
  const pre = await page.evaluate(() => {
    const card = document.querySelector('[data-ulpin-record-card]'); window.__card = card
    const find = document.querySelector('[data-find-parcel-toolbar]'), forecast = document.querySelector('[data-landintel-forecast-row]')
    const units = Object.fromEntries([...card.querySelectorAll('[data-area-unit]')].map((e) => [e.getAttribute('data-area-unit'), e.querySelector('dd').textContent]))
    const first = document.querySelector('[data-landintel-working-row]')
    return { cardPresent: !!card, chip: card.querySelector('[data-record-status]').textContent, text: card.innerText.replace(/\s+/g, ' '), units, findTop: Math.round(find.getBoundingClientRect().top + scrollY), forecastTop: Math.round(forecast.getBoundingClientRect().top + scrollY), forecastPresent: !!forecast.querySelector('section, div'), overflowX: document.documentElement.scrollWidth > innerWidth, workingRowTop: Math.round(first.getBoundingClientRect().top + scrollY), cardTop: Math.round(card.getBoundingClientRect().top + scrollY) }
  })
  // No interaction yet. Scroll only (toolbar just below the sticky header) and shoot; then centre the record card and shoot again.
  await page.evaluate(() => { const t = document.querySelector('[data-find-parcel-toolbar]'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 92) })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(outDir, `landintel-preview-${name}.png`) })
  await page.evaluate(() => { const c = document.querySelector('[data-ulpin-record-card]'); const r = c.getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - Math.max(96, (innerHeight - r.height) / 2)) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(outDir, `landintel-preview-card-${name}.png`) })
  const targetsBox = null
  const sample = page.getByRole('button', { name: 'KA-BLR-0001-2024' })
  const targets = await page.evaluate(() => [...document.querySelectorAll('[data-find-parcel-toolbar] button')].map((b) => Math.round(b.getBoundingClientRect().height)))
  const initialFirstViewport = await page.evaluate(() => { const t = document.querySelector('[data-find-parcel-toolbar]').getBoundingClientRect(); return { findParcelTopInViewportAfterScroll: Math.round(t.top) } })
  await sample.click(); await page.getByRole('button', { name: 'Lookup seeded record' }).click()
  await page.waitForFunction(() => document.querySelector('[data-record-status]')?.textContent === 'INDICATIVE LOOKUP', null, { timeout: 15000 }).catch(() => {})
  const post = await page.evaluate(() => { const card = document.querySelector('[data-ulpin-record-card]'); return { same: card === window.__card, chip: card.querySelector('[data-record-status]').textContent, text: card.innerText.replace(/\s+/g, ' '), units: Object.fromEntries([...card.querySelectorAll('[data-area-unit]')].map((e) => [e.getAttribute('data-area-unit'), e.querySelector('dd').textContent])) } })
  await page.evaluate(() => { const c = document.querySelector('[data-ulpin-record-card]'); const r = c.getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - Math.max(96, (innerHeight - r.height) / 2)) })
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(outDir, `landintel-after-lookup-card-${name}.png`) })
  const ctxAfter = await page.evaluate(() => window.localStorage.getItem('ferrum-parcel-context-v1'))
  report[name] = { parcelContextBeforeLookup: ctxBefore, parcelContextAfterLookup: ctxAfter && JSON.parse(ctxAfter).ulpin, pre, post, minToolbarButtonHeight: Math.min(...targets), consoleErrors: errors }
  await context.close()
}
await browser.close(); server.close()
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
