// Renders the DesignStudio camera-path walkthrough from the static export (apps/web/out) in headless Chromium
// (isolated context, RULE 28) and records screenshots + measured checks at 320/390/768/1024/1440 using REAL clicks/keys.
// Usage: node scripts/walkthrough-evidence.mjs [--out docs/evidence/walkthrough-20260919] [--route /products/designstudio]
import { createReadStream, existsSync, statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : fallback }
const outDir = path.resolve(arg('out', 'docs/evidence/walkthrough-20260919'))
const route = arg('route', '/products/designstudio')
const root = path.resolve('apps', 'web', 'out')
const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.wasm': 'application/wasm', '.txt': 'text/plain', '.woff2': 'font/woff2' }

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const candidates = [path.join(root, pathname), path.join(root, `${pathname}.html`), path.join(root, pathname, 'index.html')]
  const file = candidates.find((c) => existsSync(c) && statSync(c).isFile())
  if (!file) { res.writeHead(404); res.end('not found'); return }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(4392, '127.0.0.1', resolve))
const base = `http://127.0.0.1:4392${route}`

const viewports = [{ w: 320, h: 640 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1024, h: 768 }, { w: 1440, h: 900 }]
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })
await mkdir(outDir, { recursive: true })
const results = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function open(viewport, { reducedMotion = false } = {}) {
  const context = await browser.newContext({ viewport: { width: viewport.w, height: viewport.h }, deviceScaleFactor: 1, hasTouch: viewport.w < 1024, acceptDownloads: true, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 200)}`))
  page.on('console', (m) => { if (m.type() === 'error' && !/tiles\.openfreemap|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)) })
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-walkthrough]').first().waitFor({ state: 'attached', timeout: 60000 })
  // Frame the model just under the sticky header so screenshots show canvas + controls together.
  await page.locator('[data-space-3d]').first().evaluate((el) => { window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 90) })
  await sleep(1500)
  return { context, page, errors }
}

const rectOf = (page, selector) => page.locator(selector).first().evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, b: r.bottom, r: r.right } })
const camera = (page) => page.locator('[data-space-3d]').first().getAttribute('data-camera-state')
const statusText = (page) => page.locator('[data-walkthrough-status]').first().innerText()
const overlaps = (a, b) => a.x < b.r && b.x < a.r && a.y < b.b && b.y < a.b

for (const vp of viewports) {
  const { context, page, errors } = await open(vp)
  const r = { viewport: `${vp.w}x${vp.h}`, checks: {} }
  const c = r.checks
  const host = await rectOf(page, '[data-space-3d]')
  const bar = await rectOf(page, '[data-walkthrough]')
  c.controlOutsideModel = !overlaps(host, bar)
  c.modelSize = { w: Math.round(host.w), h: Math.round(host.h) }
  c.noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
  const btn = await rectOf(page, '[data-walkthrough-toggle]')
  c.touchTargetsMin44 = await page.locator('[data-walkthrough] button').evaluateAll((els) => els.every((el) => { const b = el.getBoundingClientRect(); return b.height >= 43.5 && b.width >= 43.5 }))
  c.controlFullyInViewportWidth = bar.x >= -0.5 && bar.r <= vp.w + 0.5
  await page.screenshot({ path: path.join(outDir, `${vp.w}-1-idle.png`) })

  // Real click: Play.
  const before = await camera(page)
  await page.locator('[data-walkthrough-toggle]').click()
  await sleep(2500)
  const playing = await camera(page)
  c.playChangesCamera = before !== playing
  c.statusWhilePlaying = await statusText(page)
  c.toggleLabelWhilePlaying = await page.locator('[data-walkthrough-toggle]').innerText()
  await page.screenshot({ path: path.join(outDir, `${vp.w}-2-playing.png`) })

  // Real click: Pause -> camera holds still.
  await page.locator('[data-walkthrough-toggle]').click()
  await sleep(300)
  const paused1 = await camera(page)
  await sleep(1200)
  const paused2 = await camera(page)
  c.pauseHoldsCamera = paused1 === paused2
  c.statusWhilePaused = await statusText(page)

  // Real click: Restart -> back at start pose then moving.
  await page.locator('[data-walkthrough-restart]').click()
  await sleep(200)
  c.restartPlaying = /Playing/.test(await statusText(page))
  const startPose = JSON.parse(await camera(page)).position
  const initialPose = JSON.parse(before).position
  c.restartNearDefaultPose = startPose.every((v, i) => Math.abs(v - initialPose[i]) < Math.max(1, Math.abs(initialPose[i]) * 0.05))
  await page.locator('[data-walkthrough-toggle]').click() // pause again

  // Keyboard: Tab focus reaches the buttons, Enter/Space operate them, P on the canvas toggles.
  await page.locator('[data-walkthrough-toggle]').focus()
  const focusVisible = await page.evaluate(() => { const el = document.activeElement; const cs = el ? getComputedStyle(el) : null; return { tag: el?.tagName, attr: el?.getAttribute('data-walkthrough-toggle') !== null, outline: cs?.outlineStyle } })
  c.keyboardFocusOnToggle = focusVisible.attr
  await page.keyboard.press('Enter')
  await sleep(600)
  c.keyboardEnterPlays = /Playing/.test(await statusText(page))
  await page.keyboard.press('Space')
  await sleep(300)
  c.keyboardSpacePauses = /Paused/.test(await statusText(page))
  await page.keyboard.press('Tab')
  c.tabMovesToRestart = await page.evaluate(() => document.activeElement?.hasAttribute('data-walkthrough-restart'))
  await page.locator('[data-space-3d] canvas').focus()
  await page.keyboard.press('p')
  await sleep(500)
  c.canvasPKeyPlays = /Playing/.test(await statusText(page))
  await page.keyboard.press('p')
  await sleep(300)
  c.canvasPKeyPauses = /Paused/.test(await statusText(page))

  // Manifest export (real click -> real download).
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.locator('[data-walkthrough-export]').click()])
  const file = path.join(outDir, `${vp.w}-manifest.json`)
  await download.saveAs(file)
  const manifest = JSON.parse(await readFile(file, 'utf8'))
  c.manifest = {
    label: manifest.label, schema: manifest.schema, modelRevision: manifest.modelRevision, pathHash: manifest.pathHash,
    renderer: manifest.rendererVersion, motion: manifest.motion, recording: manifest.recording, paidServices: manifest.provenance?.visualLayer?.paidServices,
    sourceBlock: Boolean(manifest.provenance?.sourceData), visualBlock: Boolean(manifest.provenance?.visualLayer), contextLabel: manifest.provenance?.contextLabel,
  }
  c.manifestComplete = manifest.label === 'INDICATIVE — NOT A SURVEY' && /^sha256:/.test(manifest.modelRevision) && /^sha256:/.test(manifest.pathHash) && Boolean(manifest.rendererVersion?.three) && Boolean(manifest.provenance?.sourceData) && Boolean(manifest.provenance?.visualLayer)
  c.note = await page.locator('[data-walkthrough-note]').innerText()
  await page.screenshot({ path: path.join(outDir, `${vp.w}-3-after-export.png`) })
  c.consoleErrors = errors
  results.push(r)
  await context.close()
}

// Reduced motion: stepped viewpoints, no continuous interpolation.
{
  const { context, page } = await open({ w: 390, h: 844 }, { reducedMotion: true })
  const r = { viewport: '390x844 prefers-reduced-motion', checks: {} }
  await page.locator('[data-walkthrough-toggle]').click()
  const poses = []
  for (let i = 0; i < 14; i += 1) { poses.push(await camera(page)); await sleep(500) }
  const distinct = new Set(poses.map((p) => JSON.stringify(JSON.parse(p).position))).size
  r.checks.distinctPosesIn7s = distinct
  r.checks.steppedNoteShown = /Reduced motion: stepped viewpoints/.test(await page.locator('[data-walkthrough-note]').innerText())
  r.checks.steppedNotContinuous = distinct <= 4
  await page.screenshot({ path: path.join(outDir, '390-reduced-motion.png') })
  results.push(r)
  await context.close()
}

// Optional local recording at desktop (full 24 s walk).
{
  const { context, page } = await open({ w: 1440, h: 900 })
  const r = { viewport: '1440x900 recording', checks: {} }
  const supported = await page.locator('[data-walkthrough-record]').count()
  r.checks.recordButtonShown = supported > 0
  if (supported) {
    await page.locator('[data-walkthrough-record]').click()
    r.checks.armedPressed = (await page.locator('[data-walkthrough-record]').getAttribute('aria-pressed')) === 'true'
    const dl = page.waitForEvent('download', { timeout: 60000 }).catch(() => null)
    await page.locator('[data-walkthrough-toggle]').click()
    await sleep(3000)
    r.checks.recordingLabel = await page.locator('[data-walkthrough-record]').innerText()
    await page.locator('[data-walkthrough-toggle]').click() // pause finalises the clip (short clip keeps the run bounded)
    const download = await dl
    if (download) { const f = path.join(outDir, '1440-recording.webm'); await download.saveAs(f); r.checks.recordingFile = { name: download.suggestedFilename(), bytes: statSync(f).size } }
    else r.checks.recordingFile = null
    r.checks.noteAfter = await page.locator('[data-walkthrough-note]').innerText()
  }
  results.push(r)
  await context.close()
}

await browser.close()
server.close()
await writeFile(path.join(outDir, 'results.json'), JSON.stringify({ route, generated: new Date().toISOString(), results }, null, 2))
console.log(JSON.stringify(results, null, 1))
