// MASON: workspace panel layout evidence (first workspace-shell slice).
// Serves apps/web/out (static export) and drives /project-workspace/cockpit in
// Chromium at 320/390/768/1024/1366/1440, recording geometry + keyboard/pointer
// assertions and screenshots. The final section ("SUTRA max keeps a usable model")
// covers 1280x720 / 1366x768 / 1440x900 / 1920x1080 for Land and Structure.
//   pnpm --filter ./apps/web build && node scripts/workspace-panel-layout-audit.mjs
// Set PANEL_AUDIT_EVIDENCE_DIR to write screenshots + results.json elsewhere.
import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const outRoot = path.resolve('apps', 'web', 'out')
const evidenceDir = process.env.PANEL_AUDIT_EVIDENCE_DIR ? path.resolve(process.env.PANEL_AUDIT_EVIDENCE_DIR) : path.resolve('apps', 'web', 'evidence', 'workspace-panel-layout-20260919')
await mkdir(evidenceDir, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain' }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    let file = path.join(outRoot, decodeURIComponent(url.pathname).replace(/\/+$/, ''))
    let info = await stat(file).catch(() => null)
    if (info?.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file).catch(() => null) }
    if (!info) { const alt = file + '.html'; if (await stat(alt).catch(() => null)) file = alt; else { res.writeHead(404); res.end('nf'); return } }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  } catch (error) { res.writeHead(500); res.end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

const results = []
const check = (viewport, name, pass, detail = '') => { results.push({ viewport, name, pass, detail }); if (!pass) console.log(`FAIL ${viewport} ${name} ${detail}`) }

const viewports = [
  // reading: expected Reading availability (fixed from the CRANE b718d05b findings, not derived from the code under test)
  { name: '320x568', width: 320, height: 568, compact: true, touch: true, reading: false },
  { name: '320x640', width: 320, height: 640, compact: true, touch: true, reading: false },
  { name: '390x844', width: 390, height: 844, compact: true, touch: true, reading: true },
  { name: '667x375', width: 667, height: 375, compact: true, touch: true, reading: false },
  { name: '768x1024', width: 768, height: 1024, compact: true, touch: true, reading: true },
  { name: '1024', width: 1024, height: 768, compact: false },
  { name: '1366', width: 1366, height: 768, compact: false },
  { name: '1440', width: 1440, height: 900, compact: false },
]

const browser = await chromium.launch({ headless: true })
const url = `${base}/project-workspace/cockpit/?product=Design`
const shot = async (page, name) => { await page.waitForTimeout(150); return page.screenshot({ path: path.join(evidenceDir, `${name}.png`) }) }
const overflow = page => page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, bodyScroll: document.body.scrollWidth }))
const small = (page, selector) => page.evaluate(sel => [...document.querySelectorAll(sel)].map(el => { const r = el.getBoundingClientRect(); return { label: el.getAttribute('aria-label') ?? el.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) } }).filter(b => b.w < 44 || b.h < 44), selector)
const val = (page, label) => page.getByRole('separator', { name: label }).getAttribute('aria-valuenow').then(Number)
const MIN_MODEL_PX = 180
// Real visible model pixels: sample the canvas rect (clipped to the viewport) with elementFromPoint, so a sheet,
// cookie bar or any overlay covering the canvas is subtracted. Returns visible rows (height) at >=50% of sampled columns.
const visibleModel = page => page.evaluate(() => {
  const canvas = document.querySelector('[data-cockpit-canvas]')
  if (!canvas) return { rows: 0, canvasTop: 0, canvasBottom: 0 }
  const rect = canvas.getBoundingClientRect()
  const x0 = Math.max(rect.left, 0), x1 = Math.min(rect.right, innerWidth)
  const y0 = Math.max(rect.top, 0), y1 = Math.min(rect.bottom, innerHeight)
  let rows = 0
  for (let y = Math.ceil(y0) + 1; y < y1; y += 2) {
    let hit = 0
    const samples = 8
    for (let i = 0; i < samples; i++) { const x = x0 + ((i + 0.5) / samples) * (x1 - x0); const el = document.elementFromPoint(x, y); if (el && canvas.contains(el)) hit++ }
    if (hit / samples >= 0.5) rows += 2
  }
  return { rows, canvasTop: Math.round(rect.top), canvasBottom: Math.round(rect.bottom) }
})
const mainWidth = page => page.evaluate(() => Math.round(document.querySelector('[data-cockpit-region]').getBoundingClientRect().width))

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: Boolean(vp.touch), hasTouch: Boolean(vp.touch), reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-workspace-grid]')
  await page.evaluate(() => localStorage.removeItem('ferrum:workspace-panel-layout:v1:Design'))
  await page.reload({ waitUntil: 'networkidle' })

  if (!vp.compact) {
    await page.waitForSelector('[data-sutra-region]')
    await shot(page, `${vp.name}-01-default-docked`)
    let o = await overflow(page)
    check(vp.name, 'no horizontal overflow (default)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
    const w0 = await val(page, 'Resize SUTRA')
    // keyboard
    await page.getByRole('separator', { name: 'Resize SUTRA' }).focus()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('Shift+ArrowLeft')
    const w1 = await val(page, 'Resize SUTRA')
    check(vp.name, 'keyboard grows SUTRA (ArrowLeft, Shift+ArrowLeft)', w1 > w0, `${w0} -> ${w1}`)
    await page.keyboard.press('End')
    const wMax = await val(page, 'Resize SUTRA')
    const canvasAtMax = await mainWidth(page)
    check(vp.name, 'End clamps so model column stays >= 360', canvasAtMax >= 360, `sutra ${wMax}, model column ${canvasAtMax}`)
    await shot(page, `${vp.name}-02-keyboard-max`)
    await page.keyboard.press('Home')
    check(vp.name, 'Home clamps to 320', (await val(page, 'Resize SUTRA')) === 320)
    await page.keyboard.press('Enter')
    check(vp.name, 'Enter resets to automatic width', (await val(page, 'Resize SUTRA')) === w0)
    // pointer drag
    const box = await page.getByRole('separator', { name: 'Resize SUTRA' }).boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x - 150, box.y + box.height / 2, { steps: 6 })
    await page.mouse.move(box.x - 5000, box.y + box.height / 2, { steps: 4 })
    await page.mouse.up()
    const dragged = await val(page, 'Resize SUTRA')
    check(vp.name, 'pointer drag to far edge clamps at max, model stays visible', dragged >= w0 && (await mainWidth(page)) >= 360, `dragged ${dragged}, model ${await mainWidth(page)}`)
    await shot(page, `${vp.name}-03-drag-clamped`)
    // side
    await page.getByRole('button', { name: 'Move SUTRA to the left' }).click()
    const side = await page.evaluate(() => document.querySelector('[data-sutra-region]').dataset.sutraSide)
    const regionLeft = await page.evaluate(() => Math.round(document.querySelector('[data-sutra-region]').getBoundingClientRect().left))
    check(vp.name, 'SUTRA moves to the left', side === 'left' && regionLeft <= 1, `left=${regionLeft}`)
    await shot(page, `${vp.name}-04-left-docked`)
    // collapse / restore
    await page.getByRole('button', { name: 'Collapse SUTRA' }).click()
    const focusedRestore = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    check(vp.name, 'collapse moves focus to Restore', focusedRestore === 'Restore SUTRA', String(focusedRestore))
    const strip = await page.evaluate(() => Math.round(document.querySelector('[data-sutra-region]').getBoundingClientRect().width))
    check(vp.name, 'collapsed strip is 44px', strip === 44, String(strip))
    await shot(page, `${vp.name}-05-collapsed`)
    // persistence across reload
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-sutra-region]')
    const restored = await page.evaluate(() => ({ side: document.querySelector('[data-sutra-region]').dataset.sutraSide, mode: document.querySelector('[data-sutra-region]').dataset.sutraMode }))
    check(vp.name, 'side + collapsed state persist across reload', restored.side === 'left' && restored.mode === 'collapsed', JSON.stringify(restored))
    await page.getByRole('button', { name: 'Restore SUTRA' }).click()
    check(vp.name, 'restore returns focus to Collapse', (await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))) === 'Collapse SUTRA')
    // rail
    const rail = page.getByRole('separator', { name: 'Resize tool rail' })
    await rail.focus()
    await page.keyboard.press('Shift+ArrowRight')
    const railW = await val(page, 'Resize tool rail')
    check(vp.name, 'tool rail widens by keyboard', railW === 176, String(railW))
    await page.waitForFunction(w => Math.round(document.querySelector('[data-desktop-workspace-tools]').getBoundingClientRect().width) === w, railW, { timeout: 3000 }).catch(() => undefined)
    const railBox = await page.evaluate(() => Math.round(document.querySelector('[data-desktop-workspace-tools]').getBoundingClientRect().width))
    check(vp.name, 'rail column matches value', Math.abs(railBox - railW) <= 1, `${railBox} vs ${railW}`)
    await shot(page, `${vp.name}-06-rail-wide`)
    o = await overflow(page)
    check(vp.name, 'no horizontal overflow (customised)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
    const tiny = await small(page, '[data-sutra-dock-bar] button, [data-sutra-restore]')
    check(vp.name, 'dock controls are >= 44px', tiny.length === 0, JSON.stringify(tiny))
    const trans = await page.evaluate(() => getComputedStyle(document.querySelector('[data-workspace-grid]')).transitionDuration)
    check(vp.name, 'reduced motion removes the grid transition', trans.split(',').every(t => parseFloat(t) < 0.001), trans)
    await page.getByRole('button', { name: 'Reset workspace layout' }).click()
    check(vp.name, 'reset returns to right/default', (await page.evaluate(() => document.querySelector('[data-sutra-region]').dataset.sutraSide)) === 'right' && (await val(page, 'Resize SUTRA')) === w0 && (await val(page, 'Resize tool rail')) === 112)
    await shot(page, `${vp.name}-07-reset`)
  } else {
    await page.getByRole('button', { name: 'SUTRA', exact: true }).click()
    await page.waitForSelector('[data-sutra-region]')
    await shot(page, `${vp.name}-01-full-default`)
    let o = await overflow(page)
    check(vp.name, 'no horizontal overflow (full)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
    const info = await page.evaluate(() => { const r = document.querySelector('[data-sutra-region]').getBoundingClientRect(); return { mode: document.querySelector('[data-sutra-region]').dataset.sutraMode, w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight } })
    check(vp.name, 'opens full-screen', info.mode === 'full' && info.w === info.vw && info.h === info.vh, JSON.stringify(info))
    const tiny = await small(page, '[data-sutra-dock-bar] button')
    check(vp.name, 'preset controls are >= 44px', tiny.length === 0, JSON.stringify(tiny))
    // keyboard: focus lands in the dialog, Tab stays inside
    const seen = []
    for (let i = 0; i < 8; i++) { seen.push(await page.evaluate(() => document.activeElement?.closest('[data-sutra-region]') ? 'in' : 'OUT')); await page.keyboard.press('Tab') }
    check(vp.name, 'Tab stays inside the full-screen dialog', !seen.includes('OUT'), seen.join(','))
    const cookie = await page.evaluate(() => { const c = document.querySelector('[data-cookie-consent]'); if (!c) return null; const r = c.getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height) } })
    check(vp.name, 'cookie bar is shown during the audit', cookie !== null && cookie.h > 0, JSON.stringify(cookie))
    const readingBtn = page.getByRole('button', { name: /Reading/ })
    const disabled = (await readingBtn.getAttribute('aria-disabled')) === 'true'
    check(vp.name, `Reading is ${vp.reading ? 'offered' : 'disabled'} (expected)`, disabled === !vp.reading, `aria-disabled=${disabled}`)
    const fullMin = await page.evaluate(() => ({ full: Boolean(document.querySelector('[data-sutra-preset="full"]:not([aria-disabled="true"])')), min: Boolean(document.querySelector('[data-sutra-minimize]:not([aria-disabled="true"])')) }))
    check(vp.name, 'Full + Minimize always remain', fullMin.full && fullMin.min, JSON.stringify(fullMin))
    await readingBtn.click({ force: disabled })
    await page.waitForTimeout(200)
    await shot(page, `${vp.name}-02-reading${vp.reading ? '' : '-disabled'}`)
    const rd = await page.evaluate(() => { const region = document.querySelector('[data-sutra-region]'); const r = region.getBoundingClientRect(); const canvas = document.querySelector('[data-cockpit-region]').getBoundingClientRect(); return { mode: region.dataset.sutraMode, top: Math.round(r.top), h: Math.round(r.height), vh: innerHeight, bottom: Math.round(r.bottom), modal: region.getAttribute('aria-modal'), canvasTop: Math.round(canvas.top), focusInside: region.contains(document.activeElement) } })
    if (vp.reading) {
      check(vp.name, 'Reading is a non-modal bottom sheet, <= 45% high, focus stays inside', rd.mode === 'reading' && rd.modal === null && rd.h <= Math.round(rd.vh * 0.45) + 1 && rd.bottom === rd.vh && rd.top > rd.canvasTop && rd.focusInside, JSON.stringify(rd))
      const m = await visibleModel(page)
      check(vp.name, `>= ${MIN_MODEL_PX}px of model canvas actually visible above the Reading sheet (cookie bar shown)`, m.rows >= MIN_MODEL_PX, `visible ${m.rows}px of canvas ${m.canvasTop}-${m.canvasBottom}, sheet top ${rd.top}`)
      const reach = await page.evaluate(() => { const c = document.querySelector('[data-cockpit-canvas]').getBoundingClientRect(); const y = Math.min(c.top + 40, document.querySelector('[data-sutra-region]').getBoundingClientRect().top - 4); const el = document.elementFromPoint(c.left + c.width / 2, y); return Boolean(el && el.closest('[data-cockpit-canvas]')) })
      check(vp.name, 'model area above the sheet is hit-testable (non-modal)', reach)
      o = await overflow(page)
      check(vp.name, 'no horizontal overflow (reading)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
      if (vp.name === '390x844') {
        // rotate/shrink so Reading no longer fits: it must fall back to Full, never cover the model
        await page.setViewportSize({ width: 390, height: 420 })
        await page.waitForFunction(() => document.querySelector('[data-sutra-region]')?.dataset.sutraMode === 'full', null, { timeout: 3000 }).catch(() => undefined)
        const fb = await page.evaluate(() => document.querySelector('[data-sutra-region]')?.dataset.sutraMode)
        check(vp.name, 'shrinking the viewport drops Reading back to Full', fb === 'full', String(fb))
        await shot(page, `${vp.name}-02b-reading-fell-back`)
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.waitForTimeout(200)
      }
    } else {
      check(vp.name, 'clicking disabled Reading keeps SUTRA full-screen and modal (model never covered)', rd.mode === 'full' && rd.modal === 'true', JSON.stringify(rd))
      // truthfulness of the disable: at the preferred 45% sheet the model would fall short of the minimum
      const would = await page.evaluate(() => { const c = document.querySelector('[data-cockpit-canvas]').getBoundingClientRect(); const sheetTop = innerHeight - Math.round(innerHeight * 0.45); return Math.round(Math.min(c.bottom, sheetTop) - Math.max(c.top, 0)) })
      check(vp.name, `a 45% sheet would leave < ${MIN_MODEL_PX}px of model (Reading correctly withheld)`, would < MIN_MODEL_PX || innerHeight * 0.45 < 200, `would leave ${would}px`)
    }
    await page.locator('[data-sutra-preset="full"]').click()
    await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
    const gone = await page.evaluate(() => ({ region: Boolean(document.querySelector('[data-sutra-region]')), focus: document.activeElement?.textContent?.trim() }))
    check(vp.name, 'minimize closes SUTRA and returns focus to the header toggle', !gone.region && gone.focus === 'SUTRA', JSON.stringify(gone))
    await shot(page, `${vp.name}-03-minimized`)
    o = await overflow(page)
    check(vp.name, 'no horizontal overflow (minimized)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
  }
  await context.close()
}

// ---- Product matrix (CRANE c1165e3a): Reading must be judged on the layout Reading actually produces.
// Entering Reading un-hides task-button rows above the canvas (Land: +44px), so availability measured in Full can be
// stale. For every product/viewport: if Reading is offered and entered, the model pixels REALLY visible after the
// layout settles must be >= 180px, the composer must be reachable, and the mode must stay put (no flicker/loop).
// Withheld/fallen-back is a valid outcome only when the settled Reading layout could not keep 180px.
const productMatrix = [
  { label: 'Land', query: '' },
  { label: 'Structure', query: '?product=Structure' },
  { label: 'Cost', query: '?product=Cost' },
  { label: 'Market', query: '?product=Market' },
]
const matrixViewports = [
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 },
  { name: '320x568', width: 320, height: 568 },
  { name: '667x375', width: 667, height: 375 },
]
const matrix = []
for (const product of productMatrix) {
  for (const vp of matrixViewports) {
    const tag = `${product.label}@${vp.name}`
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(`${base}/project-workspace/cockpit/${product.query}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-workspace-grid]')
    await page.getByRole('button', { name: 'SUTRA', exact: true }).click()
    await page.waitForSelector('[data-sutra-region]')
    await page.waitForTimeout(300)
    const readingBtn = page.getByRole('button', { name: /Reading/ })
    const offered = (await readingBtn.getAttribute('aria-disabled')) !== 'true'
    let record = { tag, offeredInFull: offered }
    if (offered) {
      await readingBtn.click()
      const modes = []
      for (let i = 0; i < 8; i++) { await page.waitForTimeout(100); modes.push(await page.evaluate(() => document.querySelector('[data-sutra-region]')?.dataset.sutraMode)) }
      const settled = modes.at(-1)
      const stable = modes.slice(2).every(m => m === settled)
      check(tag, 'mode is stable after Reading settles (no flicker / loop)', stable, modes.join(','))
      if (settled === 'reading') {
        const m = await visibleModel(page)
        const sheet = await page.evaluate(() => { const r = document.querySelector('[data-sutra-region]').getBoundingClientRect(); return { top: Math.round(r.top), height: Math.round(r.height), bottom: Math.round(r.bottom), vh: innerHeight } })
        check(tag, `actual visible model >= ${MIN_MODEL_PX}px after Reading settled (sampled, cookie bar shown)`, m.rows >= MIN_MODEL_PX, `visible ${m.rows}px canvas ${m.canvasTop}-${m.canvasBottom} sheet ${JSON.stringify(sheet)}`)
        const attr = await page.evaluate(() => Number(document.querySelector('[data-sutra-region]').dataset.sutraModelVisible))
        check(tag, 'data-sutra-model-visible agrees with sampled pixels (+-4px)', Math.abs(attr - m.rows) <= 4, `attr ${attr} vs sampled ${m.rows}`)
        const composer = await page.evaluate(() => {
          const input = document.querySelector('[data-sutra-region] #sutra-command')
          if (!input) return null
          input.scrollIntoView({ block: 'nearest' })
          const r = input.getBoundingClientRect()
          const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height), inViewport: r.top >= 0 && r.bottom <= innerHeight, hit: Boolean(el && (el === input || input.contains(el) || el.closest('form')?.contains(input))) }
        })
        check(tag, 'composer reachable in Reading (in viewport, hit-testable)', Boolean(composer?.inViewport && composer.hit && composer.height >= 36), JSON.stringify(composer))
        await page.locator('#sutra-command').focus()
        await page.keyboard.type('hi')
        check(tag, 'composer accepts typing in Reading', (await page.locator('#sutra-command').inputValue()) === 'hi')
        record = { ...record, settled, visible: m.rows, sheet, composer }
        await shot(page, `matrix-${product.label}-${vp.name}-reading`)
      } else {
        // Fell back: legitimate only if the Reading layout truly could not keep 180px, i.e. Reading is now withheld.
        const nowDisabled = (await readingBtn.getAttribute('aria-disabled')) === 'true'
        check(tag, 'fallback to Full leaves Reading disabled (not re-offered)', settled === 'full' && nowDisabled, `${settled} disabled=${nowDisabled}`)
        record = { ...record, settled }
        await shot(page, `matrix-${product.label}-${vp.name}-fellback`)
      }
    } else {
      await shot(page, `matrix-${product.label}-${vp.name}-withheld`)
    }
    matrix.push(record)
    await context.close()
  }
}
// 320 / landscape must be withheld or fall back; never a covered model (Land default).
for (const tag of ['Land@320x568', 'Land@667x375']) {
  const r = matrix.find(x => x.tag === tag)
  check(tag, '320 / landscape Reading withheld or safely fallen back', !r.offeredInFull || r.settled === 'full', JSON.stringify(r))
}
console.log(JSON.stringify(matrix.map(({ tag, offeredInFull, settled, visible }) => ({ tag, offeredInFull, settled, visible }))))

// ---- SUTRA max keeps a usable model (edge audit defect, 2026-09-19).
// At >= xl (1280) the cockpit's inner tool grid reserves a 352-416px tool column regardless of the docked canvas column,
// so a SUTRA dragged (or End-keyed) to its maximum used to leave a ~100px model. The maximum SUTRA width must now leave
// the real MODEL canvas (`[data-cockpit-canvas]`, not just its column) >= 360px wide and >= 180px visibly tall, through
// the End key, a pointer drag and a persisted (oversized) layout, and aria-valuemax must be the width SUTRA really reaches.
const MIN_MODEL_W = 360
const modelBox = page => page.evaluate(() => { const r = document.querySelector('[data-cockpit-canvas]').getBoundingClientRect(); const s = document.querySelector('[data-sutra-region]').getBoundingClientRect(); return { canvasW: Math.round(r.width), sutraW: Math.round(s.width) } })
const sutraProducts = [{ label: 'Land', query: '' }, { label: 'Structure', query: '?product=Structure' }]
const sutraViewports = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 },
]
const sutraMaxRecords = []
for (const product of sutraProducts) {
  for (const vp of sutraViewports) {
    const tag = `${product.label}@${vp.name} SUTRA-max`
    const key = `ferrum:workspace-panel-layout:v1:${product.label}`
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(`${base}/project-workspace/cockpit/${product.query}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-sutra-region]')
    await page.evaluate(k => localStorage.removeItem(k), key)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-sutra-region]')
    await page.waitForSelector('[data-cockpit-canvas]')
    await page.waitForTimeout(500)
    const sep = page.getByRole('separator', { name: 'Resize SUTRA' })
    const measure = async () => {
      await page.waitForTimeout(350)
      const valueNow = Number(await sep.getAttribute('aria-valuenow'))
      const valueMax = Number(await sep.getAttribute('aria-valuemax'))
      return { valueNow, valueMax, ...(await modelBox(page)), rows: (await visibleModel(page)).rows }
    }
    const assertMax = (via, m) => {
      const t = `${tag} via ${via}`
      check(t, 'SUTRA reaches aria-valuemax and its rendered width equals it', m.valueNow === m.valueMax && Math.abs(m.sutraW - m.valueMax) <= 1, JSON.stringify(m))
      check(t, `model canvas >= ${MIN_MODEL_W}px wide`, m.canvasW >= MIN_MODEL_W, `canvas ${m.canvasW}px, sutra ${m.valueNow}`)
      check(t, `visible model >= ${MIN_MODEL_PX}px tall`, m.rows >= MIN_MODEL_PX, `visible ${m.rows}px, sutra ${m.valueNow}`)
      // Tight, not needlessly small: when the absolute 720 cap is not what binds, the model sits within 8px of its floor.
      if (m.valueMax < 720) check(t, `aria-valuemax is the achievable maximum (model within 8px of ${MIN_MODEL_W}px, not over-reserved)`, m.canvasW - MIN_MODEL_W <= 8, `canvas ${m.canvasW}px, valuemax ${m.valueMax}`)
    }
    // End key
    await sep.focus()
    await page.keyboard.press('End')
    const viaEnd = await measure()
    assertMax('End key', viaEnd)
    await shot(page, `sutra-max-${product.label}-${vp.name}-end-key`)
    // pointer drag far past the edge
    await page.keyboard.press('Home')
    await page.waitForTimeout(350)
    const box = await sep.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x - 150, box.y + box.height / 2, { steps: 6 })
    await page.mouse.move(box.x - 5000, box.y + box.height / 2, { steps: 4 })
    await page.mouse.up()
    const viaDrag = await measure()
    assertMax('pointer drag', viaDrag)
    await shot(page, `sutra-max-${product.label}-${vp.name}-drag`)
    // A layout saved earlier at the old 720 maximum must be clamped on load, and the saved preference must survive.
    await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, sutraWidth: 720, sutraSide: 'right', sutraCollapsed: false, railWidth: 112 })), key)
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[data-sutra-region]')
    await page.waitForTimeout(500)
    const persisted = await measure()
    const pt = `${tag} via persisted 720px layout`
    check(pt, 'clamped on load to aria-valuemax', persisted.valueNow === persisted.valueMax, JSON.stringify(persisted))
    check(pt, `model >= ${MIN_MODEL_W}px wide and >= ${MIN_MODEL_PX}px tall after load`, persisted.canvasW >= MIN_MODEL_W && persisted.rows >= MIN_MODEL_PX, JSON.stringify(persisted))
    const stored = await page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? 'null')?.sutraWidth, key)
    check(pt, 'stored preference is not rewritten by clamping (still 720)', stored === 720, `stored ${stored}`)
    sutraMaxRecords.push({ tag, valueMax: viaEnd.valueMax, viaEnd, viaDrag, persisted })
    await context.close()
  }
}
console.log(JSON.stringify(sutraMaxRecords.map(r => ({ tag: r.tag, valueMax: r.valueMax, endCanvasW: r.viaEnd.canvasW, endRows: r.viaEnd.rows, dragCanvasW: r.viaDrag.canvasW, dragRows: r.viaDrag.rows }))))

await browser.close()
server.close()
const failed = results.filter(r => !r.pass)
await writeFile(path.join(evidenceDir, 'results.json'), JSON.stringify({ base: 'static export, local', total: results.length, failed: failed.length, matrix, sutraMaxRecords, results }, null, 2))
console.log(`${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
