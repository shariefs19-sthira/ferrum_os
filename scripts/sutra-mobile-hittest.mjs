// RIVET: SUTRA phone rendered hit tests. For each phone width, with the guided
// questionnaire / chrome expanded and a pending confirmation open, at full
// height and at a reduced "keyboard open" visual viewport, every action
// (Minimize, Confirm, Cancel, composer input, Send) must be reachable by
// scrolling AND actually be the element hit at its centre point (not covered),
// inside the visible viewport. Keyboard is emulated by shrinking the viewport
// (window.visualViewport resize), which is what the sheets track.
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4188 node scripts/sutra-mobile-hittest.mjs
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
  { width: 320, height: 640 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 },
]
const results = []
const check = (viewport, surface, name, pass, detail = '') => results.push({ viewport, surface, name, pass, detail })

// Scroll the target into view, then require that the topmost element at its
// centre is the target (or a descendant) and that it lies inside the viewport.
async function hit(page, locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'nearest' }))
  await page.waitForTimeout(50)
  return locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const vv = window.visualViewport
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const top = document.elementFromPoint(cx, cy)
    // scrollIntoView can move overflow:hidden containers a user cannot scroll by touch/wheel; that must not count as reachable.
    let hiddenScrolled = false
    for (let n = el.parentElement; n; n = n.parentElement) if (n.scrollTop > 0 && getComputedStyle(n).overflowY === 'hidden' && n !== document.documentElement && n !== document.body) hiddenScrolled = true
    const inside = r.top >= vv.offsetTop - 1 && r.bottom <= vv.offsetTop + vv.height + 1 && r.left >= -1 && r.right <= vv.width + 1
    return { ok: !hiddenScrolled && Boolean(top && (top === el || el.contains(top))) && inside && r.height >= 40, rect: [r.left, r.top, r.right, r.bottom].map(Math.round), hiddenScrolled, vv: [Math.round(vv.offsetTop), Math.round(vv.height)], top: top ? `${top.tagName}.${String(top.className).slice(0, 40)}` : null }
  })
}

const browser = await chromium.launch({ headless: true })
for (const vp of viewports) {
  const name = `phone-${vp.width}`
  const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await context.newPage()

  // ---- Workspace SUTRA: guided expanded + pending confirmation ----
  await page.goto(`${baseUrl}/project-workspace/cockpit`, { waitUntil: 'domcontentloaded' })
  const toggle = page.locator('header[aria-label="Workspace app bar"] button', { hasText: 'SUTRA' })
  await toggle.waitFor({ state: 'visible', timeout: 90000 })
  const region = page.locator('[data-sutra-region]')
  for (let i = 0; i < 20 && !(await region.isVisible()); i++) {
    if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click().catch(() => undefined)
    await page.waitForTimeout(750)
  }
  const guided = page.getByRole('button', { name: /Choose instead|Describe it instead/ })
  if ((await guided.getAttribute('aria-expanded')) !== 'true') await guided.click()
  await page.locator('#sutra-command').fill('add one floor')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await page.locator('[data-sutra-pending-confirm]').waitFor({ state: 'visible' })
  const W = 'workspace guided+pending'
  for (const mode of ['full height', 'keyboard open']) {
    await page.setViewportSize(mode === 'keyboard open' ? { width: vp.width, height: Math.round(vp.height * 0.45) } : vp)
    await page.waitForTimeout(250)
    const targets = [
      ['Minimize', page.getByRole('button', { name: 'Minimize SUTRA' })],
      ['Confirm', page.getByRole('button', { name: 'Confirm', exact: true })],
      ['Cancel', page.getByRole('button', { name: 'Cancel', exact: true })],
      ['composer input', page.locator('#sutra-command')],
      ['Send', page.getByRole('button', { name: 'Send', exact: true })],
    ]
    for (const [label, locator] of targets) {
      const r = await hit(page, locator)
      check(name, W, `${label} hit-testable (${mode})`, r.ok, JSON.stringify(r))
    }
    await page.screenshot({ path: path.join(outDir, `${name}-workspace-guided-pending${mode === 'keyboard open' ? '-keyboard' : ''}.png`) })
  }
  await page.setViewportSize(vp)
  await page.waitForTimeout(150)
  // Confirm still works from the scrolled pane.
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  check(name, W, 'Confirm click resolves pending', (await page.locator('[data-sutra-pending-confirm]').count()) === 0)

  // ---- Home Concierge: chrome expanded + composer ----
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  const launcher = page.getByRole('button', { name: 'Open SUTRA' })
  await launcher.waitFor({ state: 'visible', timeout: 90000 })
  await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000 }).catch(() => undefined)
  const dialog = page.getByRole('dialog', { name: 'SUTRA AI assistant' })
  for (let i = 0; i < 20 && !(await dialog.isVisible()); i++) { await launcher.click().catch(() => undefined); await page.waitForTimeout(750) }
  const chrome = page.getByRole('button', { name: /Model & connections/ })
  if ((await chrome.getAttribute('aria-expanded')) !== 'true') await chrome.click()
  const H = 'home chrome expanded'
  for (const mode of ['full height', 'keyboard open']) {
    await page.setViewportSize(mode === 'keyboard open' ? { width: vp.width, height: Math.round(vp.height * 0.45) } : vp)
    await page.waitForTimeout(250)
    for (const [label, locator] of [
      ['Minimize', page.getByRole('button', { name: 'Minimize SUTRA' })],
      ['composer input', page.getByRole('textbox', { name: 'Message' })],
      ['Send', page.getByRole('button', { name: 'Send', exact: true })],
    ]) {
      const r = await hit(page, locator)
      check(name, H, `${label} hit-testable (${mode})`, r.ok, JSON.stringify(r))
    }
    const msgH = await page.evaluate(() => document.querySelector('[data-sutra-messages]')?.getBoundingClientRect().height ?? 0)
    check(name, H, `conversation log keeps usable height (${mode})`, msgH >= 48, String(Math.round(msgH)))
    await page.screenshot({ path: path.join(outDir, `${name}-home-chrome-${mode === 'keyboard open' ? 'keyboard' : 'full'}.png`) })
  }
  await context.close()
}
await browser.close()
await writeFile(path.join(outDir, 'hittest-results.json'), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.viewport} ${r.surface} — ${r.name}${r.pass ? '' : ` (${r.detail})`}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
