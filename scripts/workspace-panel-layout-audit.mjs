// MASON: workspace panel layout evidence (first workspace-shell slice).
// Serves apps/web/out (static export) and drives /project-workspace/cockpit in
// Chromium at 320/390/768/1024/1366/1440, recording geometry + keyboard/pointer
// assertions and screenshots.
//   pnpm --filter ./apps/web build && node scripts/workspace-panel-layout-audit.mjs
import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const outRoot = path.resolve('apps', 'web', 'out')
const evidenceDir = path.resolve('apps', 'web', 'evidence', 'workspace-panel-layout-20260919')
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
  { name: '320', width: 320, height: 640, compact: true, touch: true },
  { name: '390', width: 390, height: 844, compact: true, touch: true },
  { name: '768', width: 768, height: 1024, compact: true, touch: true },
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
    await page.getByRole('button', { name: /Reading/ }).click()
    await shot(page, `${vp.name}-02-reading`)
    await page.waitForFunction(() => { const r = document.querySelector('[data-sutra-region]'); return r?.dataset.sutraMode === 'reading' && r.getBoundingClientRect().height < innerHeight * 0.5 }, null, { timeout: 3000 }).catch(() => undefined)
    const rd = await page.evaluate(() => { const r = document.querySelector('[data-sutra-region]').getBoundingClientRect(); const canvas = document.querySelector('[data-cockpit-region]').getBoundingClientRect(); return { top: Math.round(r.top), h: Math.round(r.height), vh: innerHeight, bottom: Math.round(r.bottom), modal: document.querySelector('[data-sutra-region]').getAttribute('aria-modal'), canvasTop: Math.round(canvas.top) } })
    check(vp.name, 'reading size is a bottom sheet leaving the model area above it', rd.modal === null && rd.h < rd.vh * 0.5 && rd.bottom === rd.vh && rd.top > rd.canvasTop, JSON.stringify(rd))
    o = await overflow(page)
    check(vp.name, 'no horizontal overflow (reading)', o.scrollWidth <= o.innerWidth, JSON.stringify(o))
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

await browser.close()
server.close()
const failed = results.filter(r => !r.pass)
await writeFile(path.join(evidenceDir, 'results.json'), JSON.stringify({ base: 'static export, local', total: results.length, failed: failed.length, results }, null, 2))
console.log(`${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
