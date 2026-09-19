// MASON: SUTRA open-panel height / reading-space audit (components/Concierge.tsx).
// Drives the real homepage in Chromium at phone/tablet/desktop sizes, with the
// cookie bar visible and dismissed, and asserts panel + composer bounds, message
// reading area, no horizontal overflow and no covered controls. Screenshots go
// to docs/evidence/sutra-panel-height by default.
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4189 node scripts/sutra-panel-height-audit.mjs [outDir]
// 2026-09-19: accepts an optional outDir arg (was hard-coded) so a writer
// under a different lease can run it against a scratch/evidence dir instead
// of overwriting the committed docs/evidence/sutra-panel-height images.
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const baseUrl = process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4189'
const outDir = path.resolve(process.argv[2] ?? path.join('docs', 'evidence', 'sutra-panel-height'))
await mkdir(outDir, { recursive: true })

const viewports = [
  { name: '320x640', width: 320, height: 640, phone: true },
  { name: '375x667', width: 375, height: 667, phone: true },
  { name: '390x844', width: 390, height: 844, phone: true, keyboard: 320 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x480-short', width: 1280, height: 480 },
]
// Every question must be answered IN PLACE. A query that matches a deterministic catalog route
// (for example "what does LandIntel do for a parcel buyer") makes SUTRA call router.push() to that
// product page 400 ms later. With a real edge that is a soft navigation and the panel survives, but
// a static file server that cannot serve the RSC payload (`*.txt?_rsc=`) forces Next's full-page
// fallback, which reloads the page and closes the panel mid-audit (this produced the 320x640
// "Model & connections" timeout). Route-matching wording is therefore deliberately avoided here,
// and the run asserts the home route is unchanged (see 'conversation stays on the home route').
const questions = [
  'how often are the adopt hold drop stances reviewed',
  'how does the site analysis explain slope and flood exposure for a plot',
  'explain the BOQ workflow from measured quantities to procurement holds and cost impact',
  'zzzz gibberish supercalifragilisticexpialidocious_supercalifragilisticexpialidocious_supercalifragilisticexpialidocious',
  'how often are the adopt hold drop stances reviewed',
  'how does the site analysis explain slope and flood exposure for a plot',
]

const results = []
const check = (viewport, stage, name, pass, detail = '') => results.push({ viewport, stage, name, pass, detail })
const browser = await chromium.launch({ headless: true })

const measure = (page) => page.evaluate(() => {
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
  const panel = document.querySelector('[data-sutra]')
  const log = document.querySelector('[data-sutra-messages]')
  const input = document.querySelector('input[aria-label="Message"]')
  const send = [...document.querySelectorAll('[data-sutra] button')].find((b) => b.textContent.trim() === 'Send')
  const header = document.querySelector('header')
  const cookieH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cookie-consent-h')) || 0
  const reachable = (el) => { const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return Boolean(hit && el.contains(hit)) }
  return {
    vw: window.innerWidth, vh: window.visualViewport?.height ?? window.innerHeight,
    panel: box(panel), log: box(log), input: box(input), send: box(send), header: box(header), cookieH,
    sendReachable: send ? reachable(send) : false, inputReachable: input ? reachable(input) : false,
    headerReachable: header ? reachable(header.querySelector('a')) : false,
    logScrolls: log.scrollHeight > log.clientHeight,
    logAtBottom: Math.abs(log.scrollHeight - log.clientHeight - log.scrollTop) < 4,
    logOverflowX: log.scrollWidth > log.clientWidth + 1,
    hScroll: document.documentElement.scrollWidth > window.innerWidth,
    chromeExpanded: document.querySelector('[data-sutra-chrome] > button')?.getAttribute('aria-expanded'),
  }
})

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: !!vp.phone, hasTouch: !!vp.phone })
  const page = await context.newPage()
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  const launcher = page.getByRole('button', { name: 'Open SUTRA' })
  await launcher.waitFor({ state: 'visible', timeout: 90000 })
  const dialog = page.getByRole('dialog', { name: 'SUTRA AI assistant' })
  const gotIt = page.getByRole('button', { name: 'Got it' })
  // The banner appears only after hydration, so wait for it rather than sampling immediately.
  const cookieVisible = await gotIt.waitFor({ state: 'visible', timeout: 15000 }).then(() => true, () => false)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-1-initial.png`) })
  check(vp.name, 'initial', 'launcher visible and inside viewport', await launcher.boundingBox().then((b) => !!b && b.x >= 0 && b.x + b.width <= vp.width && b.y + b.height <= vp.height))

  // Open with the cookie bar still visible when it is shown.
  for (let i = 0; i < 20 && !(await dialog.isVisible()); i++) { await launcher.click({ timeout: 2000 }).catch(() => undefined); await page.waitForTimeout(750) }
  await dialog.waitFor({ state: 'visible', timeout: 5000 })
  await page.waitForTimeout(300)
  const S = cookieVisible ? 'open+cookie' : 'open'
  let g = await measure(page)
  const cookieTop = g.vh - g.cookieH
  // 2026-09-19 (no-cover fix): SUTRA docks (reserved page width, header/cookie
  // bar stay visible) only at >=1280 now — below that it is a deliberate
  // full-viewport MODAL (operator direction: page behind dimmed + inert), so
  // 768x1024 and 1024x768 move from the old "docked" assertions below to the
  // same full-screen assertion phones already used. `compact` replaces the
  // narrower `vp.phone` (device-emulation) flag for this branch only.
  const compact = vp.width < 1280
  if (!compact) {
    check(vp.name, S, 'panel bottom above cookie/bottom edge', g.panel.bottom <= cookieTop + 0.5, `bottom ${g.panel.bottom} cookieTop ${cookieTop}`)
    check(vp.name, S, 'panel starts below site header (nav stays visible)', vp.height < 520 || g.panel.top >= g.header.bottom - 0.5, `panel.top ${g.panel.top} header.bottom ${g.header.bottom}`)
    check(vp.name, S, 'panel inside viewport horizontally', g.panel.right <= g.vw && g.panel.left >= 0)
    check(vp.name, S, 'reading width >= 24rem (or viewport-3rem)', g.panel.width >= Math.min(384, g.vw - 48) - 1, `${g.panel.width}`)
    const usable = cookieTop - (vp.height < 520 ? 8 : g.header.bottom)
    check(vp.name, S, 'panel fills available height', g.panel.height >= usable - 40, `${Math.round(g.panel.height)} of ${Math.round(usable)}`)
    if (vp.height >= 700) check(vp.name, S, 'panel >= 60% of viewport height', g.panel.height >= vp.height * 0.6 - g.cookieH, `${Math.round(g.panel.height)} of ${vp.height}`)
  } else {
    check(vp.name, S, 'sub-1280 panel is full-screen modal', Math.abs(g.panel.width - g.vw) < 1 && Math.abs(g.panel.height - g.vh) < 1 && g.panel.top === 0, JSON.stringify(g.panel))
  }
  check(vp.name, S, 'secondary chrome collapsed by default', g.chromeExpanded === 'false')
  check(vp.name, S, 'message area >= 40% of viewport', g.log.height >= vp.height * 0.4 - (vp.height < 520 ? 60 : 0) - g.cookieH, `${Math.round(g.log.height)} of ${vp.height}`)
  check(vp.name, S, 'composer + send inside viewport, unclipped', g.input.bottom <= g.vh + 0.5 && g.send.bottom <= g.vh + 0.5 && g.input.top >= 0 && g.send.right <= g.vw, JSON.stringify({ i: g.input, s: g.send }))
  check(vp.name, S, 'composer + send not covered', g.inputReachable && g.sendReachable)
  if (!compact) check(vp.name, S, 'site header not covered', g.headerReachable)
  check(vp.name, S, 'no horizontal page overflow', !g.hScroll)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-2-open.png`) })

  if (cookieVisible) {
    await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
    for (let i = 0; i < 20 && (await gotIt.isVisible().catch(() => false)); i++) { await gotIt.click({ timeout: 2000 }).catch(() => undefined); await page.waitForTimeout(600) }
    await launcher.click()
    await dialog.waitFor({ state: 'visible' })
    await page.waitForTimeout(200)
  }

  for (const q of questions) {
    await page.getByRole('textbox', { name: 'Message' }).fill(q)
    await page.getByRole('button', { name: 'Send', exact: true }).click()
  }
  // Outlast SUTRA's 400 ms delayed router.push so an accidental route match is caught here, not as a later timeout.
  await page.waitForTimeout(900)
  check(vp.name, 'conversation', 'conversation stays on the home route (no SUTRA navigation)', new URL(page.url()).pathname === '/', page.url())
  g = await measure(page)
  check(vp.name, 'conversation', 'long conversation scrolls inside message region', g.logScrolls)
  check(vp.name, 'conversation', 'latest message in view', g.logAtBottom)
  check(vp.name, 'conversation', 'long token wraps (no log x-overflow)', !g.logOverflowX)
  check(vp.name, 'conversation', 'composer inside viewport, no page overflow', g.input.bottom <= g.vh + 0.5 && !g.hScroll)
  if (!compact) check(vp.name, 'conversation', 'panel bottom margin = 1.5rem + cookie bar height (if still shown)', Math.abs(g.vh - g.panel.bottom - 24 - g.cookieH) <= 2, `${g.vh - g.panel.bottom}`)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-3-conversation.png`) })

  // Secondary chrome expanded must still leave the composer visible and some reading room.
  const toggle = page.getByRole('button', { name: /Model & connections/ })
  await toggle.click()
  g = await measure(page)
  check(vp.name, 'chrome-open', 'expanded chrome capped; composer visible; reading room kept', g.input.bottom <= g.vh + 0.5 && g.log.height > 0, `log ${Math.round(g.log.height)}`)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-4-chrome-expanded.png`) })
  await toggle.click()

  if (vp.keyboard) {
    // Approximate the on-screen keyboard by shrinking the viewport while the input is focused.
    await page.getByRole('textbox', { name: 'Message' }).focus()
    await page.setViewportSize({ width: vp.width, height: vp.keyboard })
    await page.waitForTimeout(400)
    g = await measure(page)
    check(vp.name, 'keyboard', 'panel shrinks to visible viewport', g.panel.bottom <= g.vh + 1 && g.panel.top >= 0, JSON.stringify(g.panel))
    check(vp.name, 'keyboard', 'composer and send visible above keyboard', g.input.bottom <= g.vh + 1 && g.send.bottom <= g.vh + 1 && g.sendReachable, JSON.stringify({ i: g.input, vh: g.vh }))
    check(vp.name, 'keyboard', 'message region keeps reading room', g.log.height >= 80, `${Math.round(g.log.height)}`)
    await page.screenshot({ path: path.join(outDir, `${vp.name}-5-keyboard.png`) })
    await page.setViewportSize({ width: vp.width, height: vp.height })
  }

  // Focus trap, minimize, state kept.
  await page.keyboard.press('Tab')
  let trapped = true
  for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-sutra]'))))) { trapped = false; break } }
  check(vp.name, 'focus', 'Tab focus trapped inside dialog', trapped)
  await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
  await launcher.waitFor({ state: 'visible' })
  check(vp.name, 'minimized', 'focus restored to launcher', await page.evaluate(() => document.activeElement?.hasAttribute('data-sutra-launcher')))
  check(vp.name, 'minimized', 'panel hidden', !(await dialog.isVisible()))
  await page.screenshot({ path: path.join(outDir, `${vp.name}-6-minimized.png`) })
  await launcher.click()
  check(vp.name, 'reopen', 'conversation preserved', (await page.locator('[data-sutra-messages] >> text=Sources').count()) > 0)
  await context.close()
}
await browser.close()
await writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.viewport} ${r.stage} — ${r.name}${r.pass ? '' : ` (${r.detail})`}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
