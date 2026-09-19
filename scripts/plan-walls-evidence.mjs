// Renders the DesignStudio plan-wall editing slice from the static export (apps/web/out) in headless Chromium
// and records BEFORE / AFTER / UNDO screenshots of the 2D plan and the 3D wall model at 320/390/768/1366 using
// REAL pointer input (select tap, drag), plus measured checks (geometry revision, room width, downstream status,
// touch-target size, horizontal overflow, in-viewport controls).
// Usage: node scripts/plan-walls-evidence.mjs [--out docs/evidence/plan-walls-20260919]
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback }
const outDir = path.resolve(arg('out', 'docs/evidence/plan-walls-20260919'))
const root = path.resolve('apps', 'web', 'out')
const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.txt': 'text/plain', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const candidates = [path.join(root, pathname), path.join(root, `${pathname}.html`), path.join(root, pathname, 'index.html')]
  const file = candidates.find((c) => existsSync(c) && statSync(c).isFile())
  if (!file) { res.writeHead(404); res.end('not found'); return }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(4393, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:4393/project-workspace/cockpit?product=Design'

const viewports = [{ w: 320, h: 720 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1366, h: 800 }]
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })
await mkdir(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []

const measure = (page) => page.evaluate(() => {
  const svg = document.querySelector('[data-cockpit-canvas] svg[role="img"]')
  const room = svg?.querySelector('rect[fill="#DCE8EF"]')
  const strip = document.querySelector('[data-geometry-revision-strip]')
  return {
    revision: document.querySelector('[data-geometry-revision]')?.textContent ?? null,
    firstRoomWidthM: room ? Number(room.getAttribute('width')) : null,
    downstream: Object.fromEntries(Array.from(document.querySelectorAll('[data-downstream-status]')).map((el) => [el.getAttribute('data-downstream-status'), el.getAttribute('data-downstream-state')])),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    stripPresent: Boolean(strip),
    undoDisabled: document.querySelector('[data-plan-undo]')?.disabled ?? null,
    redoDisabled: document.querySelector('[data-plan-redo]')?.disabled ?? null,
  }
})

// Element-only capture of the WebGL canvas host + a pixel diff done in a scratch page (no image library needed).
const canvasBuffer = (page) => page.locator('[data-space-3d]').first().screenshot()
const diffPixels = async (a, b) => {
  const scratch = await browser.newPage()
  const result = await scratch.evaluate(async ([x, y]) => {
    const load = (b64) => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = 'data:image/png;base64,' + b64 })
    const [ia, ib] = await Promise.all([load(x), load(y)])
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height)
    const data = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data }
    const da = data(ia), db = data(ib)
    let changed = 0
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) changed += 1
    return { width: w, height: h, changedPixels: changed, changedPct: Number((changed / (w * h) * 100).toFixed(2)) }
  }, [a.toString('base64'), b.toString('base64')])
  await scratch.close()
  return result
}

const shot = async (page, name) => {
  const file = path.join(outDir, `${name}.png`)
  const buffer = await page.screenshot({ path: file })
  return createHash('sha256').update(buffer).digest('hex').slice(0, 16)
}

async function chooseTab(page, name) {
  await page.getByRole('tab', { name }).first().click()
  await sleep(900)
}

// Keep the canvas + inspector region in view without scrolling the page body away from the model.
const frame = (page) => page.locator('[role="tablist"][aria-label="Model views"]').first().evaluate((el) => { el.scrollIntoView({ block: 'start' }) }).then(() => sleep(250))
const layout = (page) => page.evaluate(() => {
  const rect = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } }
  const canvas = document.querySelector('[data-cockpit-canvas]')
  const inspector = document.querySelector('[data-wall-inspector]')
  const c = canvas?.getBoundingClientRect()
  const i = inspector?.getBoundingClientRect()
  const overlapArea = c && i ? Math.max(0, Math.min(c.right, i.right) - Math.max(c.left, i.left)) * Math.max(0, Math.min(c.bottom, i.bottom) - Math.max(c.top, i.top)) : 0
  return { canvas: rect(canvas), inspector: rect(inspector), canvasInspectorOverlapPx2: Math.round(overlapArea) }
})

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, hasTouch: vp.w < 1024 })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`))
  page.on('console', (m) => { if (m.type() === 'error' && !/tiles\.openfreemap|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)) })
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-geometry-revision]').first().waitFor({ state: 'attached', timeout: 60000 })
  await sleep(2500)
  await page.getByRole('button', { name: 'Got it' }).first().click({ timeout: 3000 }).catch(() => undefined)
  await sleep(300)
  const r = { viewport: `${vp.w}x${vp.h}`, checks: {}, shots: {} }
  const c = r.checks

  // ---- BEFORE ----------------------------------------------------------------
  await chooseTab(page, /3D space/)
  await page.locator('[data-wall-model-toggle]').first().click()
  await sleep(1800)
  c.before3d = { ...(await measure(page)), planModel: await page.locator('[data-space-3d]').first().getAttribute('data-plan-model'), wallCount: await page.locator('[data-space-3d]').first().getAttribute('data-wall-count'), geometryRevision3d: await page.locator('[data-space-3d]').first().getAttribute('data-geometry-revision') }
  await frame(page)
  r.shots.before3d = await shot(page, `${vp.w}-1-before-3d`)
  const canvasBefore = await canvasBuffer(page)
  c.before3d.digest = await page.locator('[data-space-3d]').first().getAttribute('data-plan-model-digest')

  await chooseTab(page, 'Plan')
  await frame(page)
  c.before2d = { ...(await measure(page)), layout: await layout(page) }
  r.shots.before2d = await shot(page, `${vp.w}-2-before-2d`)

  // ---- SELECT (real tap/click on the interior partition) + DRAG ------------------
  const hit = page.locator('[data-wall-id="f1-int-v0"] [data-wall-hit-target]').first()
  const box = await hit.boundingBox()
  const cx = box.x + box.width / 2
  // Probe the part of the wall that is actually inside the viewport (a tall phone plan runs below the fold).
  const probeY = box.y + Math.min(box.height / 4, Math.max(8, (vp.h - box.y) / 2))
  // Touch-target proof: whatever is topmost at the wall centre is the 44px hit line, and its rendered stroke box is >= 44px wide.
  c.hitTarget = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y)
    return { tag: el?.tagName ?? null, isWallHit: el?.hasAttribute('data-wall-hit-target') ?? false, wallId: el?.parentElement?.getAttribute('data-wall-id') ?? null }
  }, { x: cx, y: probeY })
  const nearby = await page.evaluate(({ x, y }) => { const el = document.elementFromPoint(x + 20, y); return { isWallHit: el?.hasAttribute('data-wall-hit-target') ?? false } }, { x: cx, y: probeY })
  c.hitTargetReachesPlus20px = nearby.isWallHit

  const dragDistance = Math.max(24, Math.min(80, vp.w * 0.18))
  await page.mouse.move(cx, probeY)
  await page.mouse.down()
  await page.mouse.move(cx + dragDistance / 2, probeY, { steps: 6 })
  await page.mouse.move(cx + dragDistance, probeY, { steps: 6 })
  await sleep(150)
  c.midDrag = await measure(page)
  await page.mouse.up()
  await sleep(700)
  await page.locator('[data-wall-inspector]').first().waitFor({ state: 'visible', timeout: 5000 })
  await frame(page)
  c.after2d = { ...(await measure(page)), layout: await layout(page) }
  c.after2d.inspectorText = (await page.locator('[data-wall-inspector]').first().innerText()).replace(/\s+/g, ' ').slice(0, 260)
  r.shots.after2d = await shot(page, `${vp.w}-3-after-2d`)
  await page.locator('[data-wall-inspector]').first().evaluate((el) => { el.scrollIntoView({ block: 'end' }) })
  await sleep(300)
  r.shots.after2dInspector = await shot(page, `${vp.w}-3b-after-2d-inspector`)
  await frame(page)

  // inspector controls: touch size + inside viewport
  c.inspectorControls = await page.evaluate(() => Array.from(document.querySelectorAll('[data-wall-inspector] button, [data-wall-inspector] input, [data-plan-history] button, [data-record-outputs]')).map((el) => { const b = el.getBoundingClientRect(); return { label: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('data-wall-position-input') || '').trim().slice(0, 30), w: Math.round(b.width), h: Math.round(b.height), insideX: b.left >= -0.5 && b.right <= window.innerWidth + 0.5 } }))
  c.minControlPx = Math.min(...c.inspectorControls.map((k) => Math.min(k.w, k.h)))
  c.allControlsInsideViewportX = c.inspectorControls.every((k) => k.insideX)

  // ---- AFTER 3D ---------------------------------------------------------------
  await chooseTab(page, /3D space/)
  await sleep(1500)
  c.after3d = { ...(await measure(page)), planModel: await page.locator('[data-space-3d]').first().getAttribute('data-plan-model'), geometryRevision3d: await page.locator('[data-space-3d]').first().getAttribute('data-geometry-revision') }
  await frame(page)
  r.shots.after3d = await shot(page, `${vp.w}-4-after-3d`)
  const canvasAfter = await canvasBuffer(page)
  c.after3d.digest = await page.locator('[data-space-3d]').first().getAttribute('data-plan-model-digest')
  c.canvasDiffBeforeAfter = await diffPixels(canvasBefore, canvasAfter)

  // ---- UNDO -------------------------------------------------------------------
  await chooseTab(page, 'Plan')
  await frame(page)
  await page.locator('[data-plan-undo]').first().click()
  await sleep(700)
  c.undo2d = await measure(page)
  r.shots.undo2d = await shot(page, `${vp.w}-5-undo-2d`)
  await chooseTab(page, /3D space/)
  await sleep(1500)
  c.undo3d = { ...(await measure(page)), geometryRevision3d: await page.locator('[data-space-3d]').first().getAttribute('data-geometry-revision') }
  await frame(page)
  r.shots.undo3d = await shot(page, `${vp.w}-6-undo-3d`)
  const canvasUndo = await canvasBuffer(page)
  c.undo3d.digest = await page.locator('[data-space-3d]').first().getAttribute('data-plan-model-digest')
  c.canvasDiffBeforeUndo = await diffPixels(canvasBefore, canvasUndo)

  // ---- assertions -------------------------------------------------------------
  c.verdict = {
    wallMovedInPlan: Math.abs(c.after2d.firstRoomWidthM - c.before2d.firstRoomWidthM) > 0.04,
    revisionChanged: c.after2d.revision !== c.before2d.revision,
    downstreamBecameStale: c.after2d.downstream.BOQ === 'STALE UPSTREAM DATA' && c.after2d.downstream.STRUCTURAL === 'STALE UPSTREAM DATA',
    downstreamWasCurrentBefore: c.before2d.downstream.BOQ === 'CURRENT' && c.before2d.downstream.STRUCTURAL === 'CURRENT',
    threeDMatchesRevision: c.after3d.geometryRevision3d === c.after2d.revision && c.before3d.geometryRevision3d === c.before2d.revision,
    threeDWallModelOn: c.after3d.planModel === 'on',
    threeDDigestChanged: Boolean(c.before3d.digest) && c.after3d.digest !== c.before3d.digest,
    threeDDigestRestoredAfterUndo: c.undo3d.digest === c.before3d.digest,
    threeDCanvasPixelsChanged: c.canvasDiffBeforeAfter.changedPixels > 50,
    threeDCanvasRestoredAfterUndo: c.canvasDiffBeforeUndo.changedPct < 0.5,
    undoRestoredWidth: Math.abs(c.undo2d.firstRoomWidthM - c.before2d.firstRoomWidthM) < 0.001,
    undoRestoredRevision: c.undo2d.revision === c.before2d.revision && c.undo3d.geometryRevision3d === c.before2d.revision,
    downstreamCurrentAfterUndo: c.undo2d.downstream.BOQ === 'CURRENT' && c.undo2d.downstream.STRUCTURAL === 'CURRENT',
    hitTargetIsWallHit: c.hitTarget.isWallHit && c.hitTargetReachesPlus20px,
    controlsAtLeast44px: c.minControlPx >= 44,
    controlsInsideViewport: c.allControlsInsideViewportX,
    canvasNotCoveredByInspector: c.after2d.layout.canvasInspectorOverlapPx2 === 0,
    planCanvasAtLeast200pxTall: c.after2d.layout.canvas.h >= 200,
    noHorizontalOverflow: [c.before2d, c.after2d, c.after3d, c.undo2d].every((m) => m.overflowX <= 0),
    noConsoleErrors: errors.length === 0,
  }
  r.errors = errors
  r.pass = Object.values(c.verdict).every(Boolean)
  results.push(r)
  console.log(vp.w, r.pass ? 'PASS' : 'FAIL', JSON.stringify(Object.entries(c.verdict).filter(([, v]) => !v).map(([k]) => k)))
  await context.close()
}

await writeFile(path.join(outDir, 'results.json'), JSON.stringify({ generatedAt: new Date().toISOString(), route: '/project-workspace/cockpit?product=Design', results }, null, 2))
await browser.close()
server.close()
process.exit(results.every((r) => r.pass) ? 0 : 1)
