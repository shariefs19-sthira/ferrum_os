// Renders the LandIntel 2D/3D site map from the static export (apps/web/out) in headless Chromium and records
// screenshots + measured checks at 320/390/768/1024/1440. Live OpenFreeMap tiles are fetched over the network.
// Usage: node scripts/site3d-evidence.mjs [--out docs/evidence/site3d-live-20260919b] [--csp none|current|proposed]
import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback }
const outDir = path.resolve(arg('out', 'docs/evidence/site3d-live-20260919b'))
const cspMode = arg('csp', 'none')
const root = path.resolve('apps', 'web', 'out')
const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.txt': 'text/plain', '.woff2': 'font/woff2' }
const headersFile = await readFile(path.join(root, '_headers'), 'utf8')
const currentCsp = /Content-Security-Policy: (.+)/.exec(headersFile)?.[1]?.replace(/; report-uri \/csp-report/, '')
// What the deployed CSP would additionally need for OpenFreeMap tiles/styles/sprites/glyphs (fetched via connect-src; blobs for workers/images).
const proposedCsp = currentCsp?.replace("connect-src 'self'", "connect-src 'self' https://tiles.openfreemap.org").replace("img-src 'self' data:", "img-src 'self' data: blob:")
const csp = cspMode === 'current' ? currentCsp : cspMode === 'proposed' ? proposedCsp : null

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const candidates = [path.join(root, pathname), path.join(root, `${pathname}.html`), path.join(root, pathname, 'index.html')]
  const file = candidates.find((c) => existsSync(c) && statSync(c).isFile())
  if (!file) { res.writeHead(404); res.end('not found'); return }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', ...(csp ? { 'content-security-policy': csp } : {}) })
  createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(4391, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:4391/products/landintel'

const viewports = [{ w: 320, h: 640 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1024, h: 768 }, { w: 1440, h: 900 }]
// Both are real, user-entered coordinates: MG Road Bengaluru (densely mapped) and open sea in the Bay of Bengal (no buildings).
const covered = { lat: '12.97567', lng: '77.60733', name: 'covered (MG Road, Bengaluru)' }
const openSea = { lat: '12.5', lng: '82.5', name: 'no-building (Bay of Bengal, open sea)' }
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })
await mkdir(outDir, { recursive: true })
const results = []

async function open(viewport, { blockTiles = false, noWebgl2 = false } = {}) {
  const context = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h }, deviceScaleFactor: 1, hasTouch: viewport.w < 1024 })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('response', (r) => { if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.url().slice(0, 140)}`) })
  page.on('response', (r) => { if (r.status() >= 400) consoleErrors.push(`HTTP ${r.status()} ${r.url().slice(0, 140)}`) })
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)) })
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`.slice(0, 300)))
  // Offline stubs: address/reverse geocoding must not depend on Nominatim availability.
  await page.route('https://nominatim.openstreetmap.org/**', (route) => route.fulfill({ json: { display_name: 'Evidence stub location', lat: '12.97567', lon: '77.60733' } }))
  if (blockTiles) await page.route('https://tiles.openfreemap.org/**', (route) => route.abort())
  if (noWebgl2) await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (kind, ...rest) { return kind === 'webgl2' ? null : original.call(this, kind, ...rest) } })
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-parcel-map-stage]').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000 }).catch(() => {}) // dismiss the site cookie banner so it cannot occlude the map in evidence
  return { context, page, consoleErrors }
}

async function setCoordinates(page, point) {
  const explorer = page.locator('[data-land-detect]').first()
  await explorer.getByRole('button', { name: 'Coordinates', exact: true }).click()
  await explorer.getByLabel('Latitude', { exact: true }).fill(point.lat); await explorer.getByLabel('Longitude', { exact: true }).fill(point.lng)
  await explorer.getByRole('button', { name: 'Set coordinates' }).click()
  await page.locator('[data-ulpin-record-card]').waitFor({ timeout: 10000 })
}

/** Measured layout/occlusion/parity facts for the map stage in the current state. */
async function measure(page, expected) {
  return page.evaluate((exp) => {
    const stage = document.querySelector('[data-parcel-map-stage]')
    const canvas = stage.querySelector('[data-map-canvas]')
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }
    const cr = canvas.getBoundingClientRect(); const cx = cr.x + cr.width / 2, cy = cr.y + cr.height / 2
    const top = document.elementFromPoint(cx, cy)
    const closestUi = top?.closest('[data-map-overlay],[data-site-map-3d-controls],[data-map-view-toolbar],[data-ulpin-record-card]')
    const controls = [...stage.querySelectorAll('button, a[href]')].filter((el) => el.closest('[data-site-map-3d-notes]') === null || el.tagName === 'A')
    const buttons = [...stage.querySelectorAll('button')].map((el) => { const r = el.getBoundingClientRect(); const mid = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), inViewport: r.y >= 0 && r.bottom <= innerHeight, reachable: mid === el || el.contains(mid) } })
    // The view toggle sits above the map; when the map is scroll-centred the sticky site header can cover it. Re-test those after scrolling them to viewport centre (what a user does), then restore the scroll.
    const before = { x: scrollX, y: scrollY }
    const toolbarButtons = [...stage.querySelectorAll('[data-map-view-toolbar] button')]
    const toggleReachableAfterScroll = toolbarButtons.map((el) => { el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect(); const mid = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return mid === el || el.contains(mid) }).every(Boolean)
    scrollTo({ left: before.x, top: before.y, behavior: 'instant' })
    for (const b of buttons) if (b.inViewport && !b.reachable && ['2D plan', '3D context'].includes(b.label)) { b.coveredByStickyHeaderUntilScrolled = true; b.reachable = toggleReachableAfterScroll }
    const card = stage.querySelector('[data-ulpin-record-card]'); const cardRect = card ? rect(card) : null
    const overlapsCenter = cardRect ? cx >= cardRect.x && cx <= cardRect.x + cardRect.w && cy >= cardRect.y && cy <= cardRect.y + cardRect.h : false
    const marker = stage.querySelector('[data-site-map-3d-marker]'); const mr = marker?.getBoundingClientRect()
    const root3d = stage.querySelector('[data-site-map-3d]')
    const a = (name) => root3d?.getAttribute(name)
    const leaflet = stage.querySelector('.leaflet-marker-icon'); const lr = leaflet?.getBoundingClientRect()
    return {
      viewport: { w: innerWidth, h: innerHeight }, horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      selectedPointText: stage.querySelector('[data-selected-point]')?.textContent?.trim(), expected: exp,
      canvas: rect(canvas), mapCentre: { x: Math.round(cx), y: Math.round(cy) },
      topElementAtCentre: top ? `${top.tagName.toLowerCase()}${top.className && typeof top.className === 'string' ? '.' + top.className.split(' ')[0] : ''}` : null,
      centreObscuredByUi: Boolean(closestUi), cardOverlapsCentre: overlapsCenter, cardRect,
      cardPlacement: card ? getComputedStyle(card).position : null,
      buttons, smallestButton: buttons.reduce((m, b) => Math.min(m, b.w, b.h), 999), allButtonsReachable: buttons.filter((b) => b.inViewport).every((b) => b.reachable),
      threeD: root3d ? { status: a('data-3d-status'), failure: a('data-3d-failure'), coverage: a('data-coverage'), buildings: Number(a('data-building-count')), assumedHeight: Number(a('data-assumed-height-count')), recordedHeight: Number(a('data-recorded-height-count')), zoom: Number(a('data-map-zoom')), pitch: Number(a('data-map-pitch')), bearing: Number(a('data-map-bearing')), centre: { lat: Number(a('data-map-center-lat')), lng: Number(a('data-map-center-lng')) }, selected: { lat: Number(a('data-selected-lat')), lng: Number(a('data-selected-lng')) },
        markerTipOffsetPx: mr ? { dx: Math.round((mr.x + mr.width / 2) - cx), dy: Math.round(mr.bottom - cy) } : null, marker: mr ? { w: Math.round(mr.width), h: Math.round(mr.height) } : null,
        notes: root3d.querySelector('[data-site-map-3d-notes]')?.innerText, attributionVisible: Boolean(root3d.querySelector('[data-site-map-3d-attribution] a')) } : null,
      twoD: leaflet ? { markerVisible: lr.width > 0, canvasLat: canvas.getAttribute('data-map-lat'), canvasLng: canvas.getAttribute('data-map-lng') } : null,
      viewNotice: stage.querySelector('[data-map-view-notice]')?.textContent?.trim(),
      view3dDisabled: stage.querySelector('[data-map-view-option="3d"]')?.disabled,
    }
  }, expected)
}

async function shoot(page, name) {
  await page.locator('[data-parcel-map-stage]').first().scrollIntoViewIfNeeded()
  await page.locator('[data-map-canvas]').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(400)
  // The sticky site header is hidden only while capturing the full-stage shot; all measurements run with it visible.
  await page.evaluate(() => document.querySelectorAll('header').forEach((h) => { h.dataset.prevVis = h.style.visibility; h.style.visibility = 'hidden' }))
  await page.locator('[data-parcel-map-stage]').first().screenshot({ path: path.join(outDir, `${name}.png`) })
  await page.evaluate(() => document.querySelectorAll('header').forEach((h) => { h.style.visibility = h.dataset.prevVis ?? '' }))
}
const waitCoverage = (page) => page.waitForFunction(() => { const c = document.querySelector('[data-site-map-3d]')?.getAttribute('data-coverage'); return c === 'covered' || c === 'none' || c === 'failed' || (!document.querySelector('[data-site-map-3d]') && /Showing the 2D plan/.test(document.querySelector('[data-map-view-notice]')?.textContent ?? '')) }, null, { timeout: 90000 })

for (const viewport of viewports) {
  for (const point of [covered, openSea]) {
    const tag = `${point === covered ? 'covered' : 'nobuild'}-${viewport.w}`
    const { context, page, consoleErrors } = await open(viewport)
    const expected = { lat: Number(point.lat), lng: Number(point.lng) }
    await setCoordinates(page, point)
    await shoot(page, `${tag}-2d`)
    const twoD = await measure(page, expected)
    await page.locator('[data-map-view-option="3d"]').click()
    await waitCoverage(page)
    if (!(await page.locator('[data-site-map-3d]').count())) { const notice = await page.locator('[data-map-view-notice]').innerText(); await shoot(page, `${tag}-3d-fell-back-to-2d`); results.push({ scenario: point.name, viewport: viewport.w, fellBackTo2d: true, notice, consoleErrors }); console.log(tag, 'FELL BACK TO 2D:', notice); await context.close(); continue }
    await page.waitForTimeout(1500) // let extrusions/labels finish painting for the screenshot
    await page.locator('[data-map-canvas]').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const threeD = await measure(page, expected)
    await shoot(page, `${tag}-3d`)
    await page.screenshot({ path: path.join(outDir, `${tag}-3d-viewport.png`) })
    await page.screenshot({ path: path.join(outDir, `${tag}-3d-viewport.png`) })
    // Rotate + tilt + recenter: the selected point must remain the camera centre and the marker must stay on it.
    await page.getByRole('button', { name: 'Rotate right' }).click(); await page.getByRole('button', { name: 'Tilt up' }).click(); await page.waitForTimeout(600)
    await page.getByRole('button', { name: 'Recenter on selected location' }).click(); await page.waitForTimeout(800); await waitCoverage(page); await page.locator('[data-map-canvas]').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await waitCoverage(page); await page.locator('[data-map-canvas]').first().evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const afterControls = await measure(page, expected)
    await page.locator('[data-map-view-option="2d"]').click(); await page.waitForTimeout(800)
    const backTo2d = await measure(page, expected)
    results.push({ scenario: point.name, viewport: viewport.w, twoD, threeD, afterControls, backTo2d, consoleErrors })
    console.log(tag, JSON.stringify({ status: threeD.threeD?.status, coverage: threeD.threeD?.coverage, buildings: threeD.threeD?.buildings, assumed: threeD.threeD?.assumedHeight, tip: threeD.threeD?.markerTipOffsetPx, centreObscured: threeD.centreObscuredByUi, overflow: threeD.horizontalOverflow }))
    await context.close()
  }
}

// Tile failure -> visible fallback to the 2D plan; WebGL2 missing -> 3D disabled with a visible reason.
for (const viewport of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
  const blocked = await open(viewport, { blockTiles: true })
  await setCoordinates(blocked.page, covered); await blocked.page.locator('[data-map-view-option="3d"]').click()
  await blocked.page.waitForFunction(() => document.querySelector('[data-map-view-option="2d"]')?.getAttribute('aria-pressed') === 'true' && document.querySelector('[data-map-view-notice]')?.textContent, null, { timeout: 60000 })
  await shoot(blocked.page, `unavailable-tiles-blocked-${viewport.w}`)
  results.push({ scenario: 'unavailable (OpenFreeMap tiles blocked)', viewport: viewport.w, after: await measure(blocked.page, { lat: 12.97567, lng: 77.60733 }), consoleErrors: blocked.consoleErrors })
  await blocked.context.close()
  const nogl = await open(viewport, { noWebgl2: true })
  await setCoordinates(nogl.page, covered); await nogl.page.waitForTimeout(500)
  await shoot(nogl.page, `unavailable-no-webgl2-${viewport.w}`)
  results.push({ scenario: 'unavailable (WebGL2 missing)', viewport: viewport.w, after: await measure(nogl.page, { lat: 12.97567, lng: 77.60733 }), consoleErrors: nogl.consoleErrors })
  await nogl.context.close()
}

await writeFile(path.join(outDir, `results${cspMode === 'none' ? '' : `-csp-${cspMode}`}.json`), JSON.stringify({ generatedAt: new Date().toISOString(), cspMode, base, results }, null, 2))
await browser.close(); server.close()
