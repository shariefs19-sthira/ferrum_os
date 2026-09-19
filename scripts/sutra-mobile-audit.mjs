// RIVET: SUTRA full-screen mobile audit. Drives the real app in Chromium at
// phone / tablet / desktop sizes with a long conversation and records
// geometry + accessibility assertions and screenshots.
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4188 node scripts/sutra-mobile-audit.mjs
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const baseUrl = process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4188'
const outDir = path.resolve('docs', 'evidence', 'sutra-mobile-fullscreen')
await mkdir(outDir, { recursive: true })

const viewports = [
  { name: 'phone-320', width: 320, height: 640, phone: true },
  { name: 'phone-375', width: 375, height: 667, phone: true },
  { name: 'phone-390', width: 390, height: 844, phone: true },
  { name: 'phone-430', width: 430, height: 932, phone: true },
  { name: 'tablet-768', width: 768, height: 1024, phone: false },
  { name: 'desktop-1366', width: 1366, height: 768, phone: false },
]
const questions = [
  'how often are the adopt hold drop stances reviewed',
  'what does LandIntel do for a parcel buyer and what evidence does it show',
  'explain the BOQ workflow from measured quantities to procurement holds and cost impact',
  'zzzz gibberish nonsense 999 with a deliberately extremely long unbroken token supercalifragilisticexpialidocious_supercalifragilisticexpialidocious_supercalifragilisticexpialidocious',
  'how often are the adopt hold drop stances reviewed',
  'what does LandIntel do for a parcel buyer and what evidence does it show',
  'explain the BOQ workflow from measured quantities to procurement holds and cost impact',
  'how often are the adopt hold drop stances reviewed',
]

const results = []
const check = (viewport, surface, name, pass, detail = '') => results.push({ viewport, surface, name, pass, detail })

const browser = await chromium.launch({ headless: true })

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.phone,
    hasTouch: vp.phone,
  })
  const page = await context.newPage()

  // ---- Homepage / product-page floating SUTRA (components/Concierge.tsx) ----
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  const launcher = page.getByRole('button', { name: 'Open SUTRA' })
  await launcher.waitFor({ state: 'visible', timeout: 60000 })
  await page.screenshot({ path: path.join(outDir, `${vp.name}-home-launcher.png`) })
  const dialog = page.getByRole('dialog', { name: 'SUTRA AI assistant' })
  // The cookie banner (fixed, z-50, bottom) sits over the launcher until dismissed.
  await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000 }).catch(() => undefined)
  // Dev builds hydrate late: retry the click until React has attached handlers.
  for (let attempt = 0; attempt < 20 && !(await dialog.isVisible()); attempt++) {
    await launcher.click().catch(() => undefined)
    await page.waitForTimeout(750)
  }
  await dialog.waitFor({ state: 'visible', timeout: 5000 })
  for (const question of questions) {
    await page.getByRole('textbox', { name: 'Message' }).fill(question)
    await page.getByRole('button', { name: 'Send', exact: true }).click()
  }
  await page.waitForTimeout(500)

  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('[data-sutra]')
    const log = document.querySelector('[data-sutra-messages]')
    const input = document.querySelector('input[aria-label="Message"]')
    const box = (el) => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height } }
    return {
      panel: box(panel), log: box(log), input: box(input),
      inputFont: parseFloat(getComputedStyle(input).fontSize),
      logScrolls: log.scrollHeight > log.clientHeight,
      logAtBottom: Math.abs(log.scrollHeight - log.clientHeight - log.scrollTop) < 4,
      bodyOverflow: document.body.style.overflow,
      hScroll: document.documentElement.scrollWidth > window.innerWidth,
      fullscreenAttr: panel.getAttribute('data-sutra-fullscreen'),
      viewport: { w: window.innerWidth, h: window.innerHeight },
    }
  })
  const S = 'home-concierge'
  if (vp.phone) {
    check(vp.name, S, 'panel fills viewport', Math.abs(geometry.panel.width - vp.width) < 1 && Math.abs(geometry.panel.height - geometry.viewport.h) < 1 && geometry.panel.top === 0, JSON.stringify(geometry.panel))
    check(vp.name, S, 'body scroll locked', geometry.bodyOverflow === 'hidden')
    check(vp.name, S, 'input font >=16px (no iOS zoom)', geometry.inputFont >= 16, String(geometry.inputFont))
    const chromeToggle = page.getByRole('button', { name: /Model & connections/ })
    check(vp.name, S, 'secondary chrome collapsed by default', (await chromeToggle.getAttribute('aria-expanded')) === 'false')
    const chromeH = geometry.log.top
    check(vp.name, S, 'message region gets >=45% of viewport', geometry.log.height >= vp.height * 0.45, `${Math.round(geometry.log.height)} of ${vp.height}`)
    void chromeH
  } else {
    check(vp.name, S, 'floating panel (not fullscreen)', geometry.fullscreenAttr === 'false' && geometry.panel.width < vp.width)
    check(vp.name, S, 'body scroll not locked', geometry.bodyOverflow !== 'hidden')
  }
  check(vp.name, S, 'long conversation scrolls inside message region', geometry.logScrolls)
  check(vp.name, S, 'latest message in view', geometry.logAtBottom)
  check(vp.name, S, 'composer inside viewport', geometry.input.bottom <= geometry.viewport.h + 1 && geometry.input.top >= 0, JSON.stringify(geometry.input))
  check(vp.name, S, 'no horizontal page overflow', !geometry.hScroll)
  const logNoOverflowX = await page.evaluate(() => { const l = document.querySelector('[data-sutra-messages]'); return l.scrollWidth <= l.clientWidth + 1 })
  check(vp.name, S, 'long token wraps (no horizontal scroll in log)', logNoOverflowX)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-home-open-long.png`) })

  // Scroll to the top of history and prove background does not move.
  const scrollBefore = await page.evaluate(() => window.scrollY)
  await page.evaluate(() => { document.querySelector('[data-sutra-messages]').scrollTop = 0 })
  await page.mouse.wheel(0, 400).catch(() => undefined)
  const scrollAfter = await page.evaluate(() => window.scrollY)
  check(vp.name, S, 'background page does not scroll while open', scrollBefore === scrollAfter)
  await page.screenshot({ path: path.join(outDir, `${vp.name}-home-history-top.png`) })

  // Expand secondary chrome.
  const chromeToggle = page.getByRole('button', { name: /Model & connections/ })
  // Phones start collapsed, tablet/desktop start expanded: the click must flip it.
  const chromeStart = await chromeToggle.getAttribute('aria-expanded')
  await chromeToggle.click()
  check(vp.name, S, 'chrome toggle flips aria-expanded', (await chromeToggle.getAttribute('aria-expanded')) === (chromeStart === 'true' ? 'false' : 'true'))
  if (chromeStart === 'false') await page.screenshot({ path: path.join(outDir, `${vp.name}-home-chrome-expanded.png`) })
  await chromeToggle.click()

  // Keyboard: Tab stays trapped inside the dialog.
  await page.keyboard.press('Tab')
  let trapped = true
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-sutra]'))))) { trapped = false; break }
  }
  check(vp.name, S, 'Tab focus trapped inside dialog', trapped)

  // Minimize -> persistent launcher, focus restored, conversation kept.
  await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
  await launcher.waitFor({ state: 'visible' })
  check(vp.name, S, 'minimize returns to labelled launcher', (await launcher.innerText()).includes('SUTRA'))
  check(vp.name, S, 'focus restored to launcher', await page.evaluate(() => document.activeElement?.getAttribute('data-sutra-launcher') !== null))
  check(vp.name, S, 'body scroll restored', (await page.evaluate(() => document.body.style.overflow)) === '')
  const launcherBox = await launcher.boundingBox()
  check(vp.name, S, 'launcher within viewport, >=44px tall', launcherBox.x >= 0 && launcherBox.x + launcherBox.width <= vp.width && launcherBox.y + launcherBox.height <= vp.height && launcherBox.height >= 44, JSON.stringify(launcherBox))
  await page.screenshot({ path: path.join(outDir, `${vp.name}-home-minimized.png`) })
  await launcher.click()
  check(vp.name, S, 'conversation preserved after reopen', (await page.locator('[data-sutra-messages] >> text=Sources').count()) > 0)
  await page.keyboard.press('Escape')
  check(vp.name, S, 'Escape minimizes', await launcher.isVisible())

  // ---- Project Workspace SUTRA ----
  const response = await page.goto(`${baseUrl}/project-workspace/cockpit`, { waitUntil: 'domcontentloaded' })
  const W = 'workspace'
  if (response && response.ok()) {
    const toggle = page.locator('header[aria-label="Workspace app bar"] button', { hasText: 'SUTRA' })
    await toggle.waitFor({ state: 'visible', timeout: 60000 }).catch(() => undefined)
    if (vp.width >= 1024) {
      const region = page.locator('[data-sutra-region]')
      await region.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined)
      const docked = await region.evaluate((el) => getComputedStyle(el).position).catch(() => 'missing')
      check(vp.name, W, 'desktop stays docked (static column)', docked === 'static', docked)
      await page.screenshot({ path: path.join(outDir, `${vp.name}-workspace-desktop-docked.png`) })
    } else if (await toggle.isVisible()) {
      const region = page.locator('[data-sutra-region]')
      for (let attempt = 0; attempt < 20 && !(await region.isVisible()); attempt++) {
        if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click().catch(() => undefined)
        await page.waitForTimeout(750)
      }
      await region.waitFor({ state: 'visible', timeout: 5000 })
      const gw = await region.evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height, h: window.innerHeight, w: window.innerWidth, lock: document.body.style.overflow } })
      if (vp.phone) {
        check(vp.name, W, 'sheet fills viewport', Math.abs(gw.width - gw.w) < 1 && Math.abs(gw.height - gw.h) < 1 && gw.top === 0, JSON.stringify(gw))
        check(vp.name, W, 'body scroll locked', gw.lock === 'hidden')
        const guided = page.getByRole('button', { name: /Choose instead|Describe it instead/ })
        check(vp.name, W, 'guided questionnaire collapsed by default', (await guided.getAttribute('aria-expanded')) === 'false')
      } else {
        check(vp.name, W, 'tablet keeps side sheet', gw.width < gw.w, JSON.stringify(gw))
      }
      for (const command of ['show BOQ extract', 'add one floor', 'set setback 3', 'export DXF', 'add one floor', 'show BOQ extract']) {
        await page.locator('#sutra-command').fill(command)
        await page.getByRole('button', { name: 'Send', exact: true }).click()
      }
      await page.screenshot({ path: path.join(outDir, `${vp.name}-workspace-open.png`) })
      if (vp.phone) {
        const guided = page.getByRole('button', { name: /Choose instead|Describe it instead/ })
        await guided.click()
        await page.screenshot({ path: path.join(outDir, `${vp.name}-workspace-guided-expanded.png`) })
        await guided.click()
        let trapped = true
        for (let i = 0; i < 30; i++) {
          await page.keyboard.press('Tab')
          if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-sutra-region]'))))) { trapped = false; break }
        }
        check(vp.name, W, 'Tab focus trapped inside sheet', trapped)
        await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
        await page.waitForTimeout(200)
        check(vp.name, W, 'minimize returns focus to header SUTRA launcher', await toggle.evaluate((el) => el === document.activeElement))
        check(vp.name, W, 'launcher still visible after minimize', await toggle.isVisible())
        check(vp.name, W, 'body scroll restored', (await page.evaluate(() => document.body.style.overflow)) === '')
        await page.screenshot({ path: path.join(outDir, `${vp.name}-workspace-minimized.png`) })
      }
    }
  } else {
    check(vp.name, W, 'workspace route reachable', false, `status ${response?.status()}`)
  }
  await context.close()
}

await browser.close()
await writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.viewport} ${r.surface} — ${r.name}${r.pass ? '' : ` (${r.detail})`}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
