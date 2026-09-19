// MASON W2 sutra-input-short-viewport-20260919: proves the DEFECT (#sutra-command
// pushed outside the reachable viewport at short desktop heights, e.g. 1024x700
// with the cookie bar shown) and its fix.
//
// Cause (measured, see apps/web/evidence/sutra-input-short-viewport-20260919/):
// SutraPanel's stacked sections (header + guided-question section + the
// minimum-height message log + the composer) add up to more vertical space
// than the docked SUTRA region has at short desktop viewports. Pre-fix, the
// panel (`[data-sutra-panel]`, an <aside>) only carried `overflow-y-auto` for
// `max-md:` widths -- at `md`+ (desktop-docked SUTRA) it had no scroll
// container of its own, so the overflow was silently clipped by the ancestor
// `overflow-hidden` on `[data-sutra-region]`, pushing `#sutra-command` below
// the visible, unreachable-by-scroll area. The fix (apps/web/components/
// workspace/SutraPanel.tsx) makes the aside a scroll container at every
// width, so the composer/input stays reachable by an internal scroll and the
// 3D model region never has to move or be resized to reveal it.
//
//   pnpm --filter ./apps/web build && node scripts/sutra-input-short-viewport-audit.mjs [outDir]
//
// Exit code is nonzero if any check fails. Screenshots + a JSON report land in
// apps/web/evidence/sutra-input-short-viewport-20260919/.
import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const outRoot = path.resolve(process.argv[2] ?? path.join('apps', 'web', 'out'))
const evidenceDir = path.resolve('apps', 'web', 'evidence', 'sutra-input-short-viewport-20260919')
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
const check = (label, pass, detail = '') => { results.push({ label, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'} ${label} ${detail}`) }

const VIEWPORTS = [
  { w: 1024, h: 700 }, { w: 1024, h: 640 },
  { w: 1280, h: 650 }, { w: 1280, h: 600 },
  { w: 1366, h: 600 }, { w: 1440, h: 650 },
]
const PRODUCTS = ['Land', 'Structure']
const MIN_MODEL_PX = 180
const MIN_TARGET_PX = 44

const visibleModelRows = page => page.evaluate(() => {
  const canvas = document.querySelector('[data-cockpit-canvas]')
  if (!canvas) return 0
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
  return rows
})

const browser = await chromium.launch({ headless: true })

for (const product of PRODUCTS) {
  for (const cookieShown of [true, false]) {
    for (const vp of VIEWPORTS) {
      const label = `${product} ${vp.w}x${vp.h} cookie=${cookieShown ? 'shown' : 'dismissed'}`
      const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: 'reduce', deviceScaleFactor: 1 })
      if (!cookieShown) await context.addInitScript(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch { /* storage blocked */ } })
      const page = await context.newPage()
      await page.goto(`${base}/project-workspace/cockpit/?product=${product}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('[data-sutra-region]')
      await page.waitForTimeout(300)

      const input = page.locator('#sutra-command')

      // Read geometry BEFORE any scroll attempt -- this is what the real
      // defect looked like: `#sutra-command` partially or fully below the
      // viewport with nothing having scrolled yet. Only if that fails do we
      // try `scrollIntoViewIfNeeded` and re-check, because the acceptance
      // explicitly allows "reachable via an internal panel scroll" as a
      // passing outcome, not just "already fully visible on load".
      const readGeometry = () => page.evaluate(() => {
        const input = document.querySelector('#sutra-command')
        const send = document.querySelector('#sutra-command')?.closest('form')?.querySelector('button[type="submit"]')
        const r = el => el ? el.getBoundingClientRect() : null
        const ib = r(input), sb = r(send)
        const hitCenter = (b) => { if (!b) return null; const el = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return el ? (el === document.querySelector('#sutra-command') || (document.querySelector('#sutra-command')?.contains(el) ?? false) || (document.querySelector('#sutra-command')?.closest('form')?.contains(el) ?? false)) : false }
        return {
          inputBox: ib && { top: ib.top, bottom: ib.bottom, left: ib.left, right: ib.right, width: ib.width, height: ib.height },
          sendBox: sb && { top: sb.top, bottom: sb.bottom, width: sb.width, height: sb.height },
          inputHit: hitCenter(ib),
          sendHit: hitCenter(sb),
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          innerH: window.innerHeight,
        }
      })

      let geometry = await readGeometry()
      const insideViewport = g => !!g.inputBox && g.inputBox.top >= -0.5 && g.inputBox.bottom <= g.innerH + 0.5 && g.inputBox.left >= -0.5 && g.inputBox.right <= g.innerW + 0.5

      let reachable = insideViewport(geometry) && geometry.inputHit
      let viaScroll = false
      if (!reachable) {
        // Give the panel a chance to reveal the input via a REAL user
        // gesture -- a mouse wheel scroll over the panel -- not
        // `Locator.scrollIntoViewIfNeeded()`/`Element.scrollIntoView()`,
        // which can force `scrollTop` on an `overflow: hidden` ancestor
        // that a real user's wheel/touch/scrollbar can never move (that's
        // exactly the pre-fix defect: no scrollbar, wheel does nothing,
        // input unreachable). Acceptance explicitly allows "reachable via
        // an internal panel scroll", so this simulates that path honestly.
        const before = geometry.inputBox
        const panelBox = await page.locator('[data-sutra-panel]').boundingBox()
        if (panelBox) {
          await page.mouse.move(panelBox.x + panelBox.width / 2, panelBox.y + panelBox.height / 2)
          for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 200)
          await page.waitForTimeout(150)
        }
        geometry = await readGeometry()
        reachable = insideViewport(geometry) && geometry.inputHit
        viaScroll = reachable && JSON.stringify(before) !== JSON.stringify(geometry.inputBox)
      }
      check(`${label}: #sutra-command reachable inside viewport${viaScroll ? ' (via internal scroll)' : ''}`, reachable, JSON.stringify(geometry.inputBox))
      check(`${label}: #sutra-command >= 44px tall`, !!geometry.inputBox && geometry.inputBox.height >= MIN_TARGET_PX, `h=${geometry.inputBox?.height}`)
      check(`${label}: Send control >= 44px tall`, !!geometry.sendBox && geometry.sendBox.height >= MIN_TARGET_PX, `h=${geometry.sendBox?.height}`)
      check(`${label}: no page horizontal scroll`, geometry.scrollW <= geometry.innerW + 1, `scrollW=${geometry.scrollW} innerW=${geometry.innerW}`)

      // Focus + type + send, and confirm the page itself did not scroll (only the panel, if anything, may have).
      const pageScrollBefore = await page.evaluate(() => window.scrollY)
      await input.focus()
      const focused = await page.evaluate(() => document.activeElement?.id === 'sutra-command')
      check(`${label}: #sutra-command is focusable`, focused)
      await input.fill('set floors 2')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(150)
      const pageScrollAfter = await page.evaluate(() => window.scrollY)
      check(`${label}: sending a command did not scroll the page`, pageScrollBefore === pageScrollAfter, `${pageScrollBefore} -> ${pageScrollAfter}`)
      const pendingVisible = await page.locator('[data-sutra-pending-confirm]').isVisible().catch(() => false)
      check(`${label}: command reached SUTRA (pending confirm shown, RULE 50 -- text intent, not a direct mutation)`, pendingVisible)
      if (pendingVisible) await page.getByRole('button', { name: 'Cancel' }).click().catch(() => {})

      const rows = await visibleModelRows(page)
      check(`${label}: model region still >= ${MIN_MODEL_PX}px visible`, rows >= MIN_MODEL_PX, `visible=${rows}px`)

      await page.screenshot({ path: path.join(evidenceDir, `${product}-${vp.w}x${vp.h}-${cookieShown ? 'cookie-shown' : 'cookie-dismissed'}.png`) })
      await context.close()
    }
  }
}

await browser.close()
server.close()

const failed = results.filter(r => !r.pass)
await writeFile(path.join(evidenceDir, 'report.json'), JSON.stringify({ outRoot, total: results.length, failed: failed.length, results }, null, 2))
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Evidence: ${evidenceDir}`)
if (failed.length) {
  console.log(`FAILED (${failed.length}):`)
  for (const f of failed) console.log(` - ${f.label} ${f.detail}`)
  process.exit(1)
}
