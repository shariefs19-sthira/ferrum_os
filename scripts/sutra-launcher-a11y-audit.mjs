// MASON: SUTRA launcher accessibility audit (RULE 41 touch targets, WCAG 2.1 AA 4.1.2 / 2.1.1 / 2.1.2 / 2.4.3).
// For each viewport (headless, isolated context, RULE 28) it checks the closed launcher
// with the cookie bar showing and after dismissing it:
//   - accessible name (aria-label) present, also when the visible label is sr-only on phones
//   - launcher and cookie "Got it" hit boxes are >= 44 x 44 CSS px
//   - keyboard: launcher and "Got it" are each reachable by Tab exactly once, the closed panel adds no tab stops,
//     Tab / Shift+Tab move focus off the launcher (no trap), Enter on the launcher opens the dialog,
//     Escape closes it and returns focus to the launcher
//   - a visible focus indicator is drawn on the keyboard-focused launcher
//   - "Got it" works by keyboard (Enter) and by real mouse click, and reveals nothing covering the page
//   - reload with consent already accepted: no banner, --cookie-consent-h unset, launcher back at the base offset
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4189 node scripts/sutra-launcher-a11y-audit.mjs [outDir]
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const baseUrl = (process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4189').replace(/\/$/, '')
const outDir = path.resolve(process.argv[2] ?? 'docs/evidence/sutra-launcher-a11y')
await mkdir(outDir, { recursive: true })
const viewports = [[320, 568], [320, 640], [375, 667], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1440, 900]]
const BASE_OFFSET = 24 // 1.5rem; env(safe-area-inset-bottom) is 0 in headless Chromium

const results = []
const check = (viewport, stage, name, pass, detail = '') => results.push({ viewport, stage, name, pass, detail })
const browser = await chromium.launch({ headless: true })

const describeActive = () => {
  const a = document.activeElement
  if (!a || a === document.body) return 'body'
  if (a.matches('button[aria-label="Open SUTRA"]')) return 'launcher'
  if (a.closest('[data-cookie-consent]')) return 'gotit'
  if (a.closest('[data-sutra]')) return 'sutra-panel'
  return `${a.tagName.toLowerCase()}${a.getAttribute('aria-label') ? `[${a.getAttribute('aria-label')}]` : ''}`
}

async function fresh(vw, vh) {
  const touch = vw < 500
  const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch })
  const page = await context.newPage()
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Open SUTRA' }).waitFor({ state: 'visible', timeout: 90000 })
  await page.getByRole('button', { name: 'Got it' }).waitFor({ state: 'visible', timeout: 15000 })
  await page.waitForTimeout(400)
  return { context, page }
}

const launcherFacts = (page) => page.evaluate((BASE) => {
  const L = document.querySelector('button[aria-label="Open SUTRA"]')
  if (!L) return null
  const r = L.getBoundingClientRect()
  return {
    ariaLabel: L.getAttribute('aria-label'), text: L.textContent.trim(), w: r.width, h: r.height,
    fromBottom: innerHeight - r.bottom, fromRight: innerWidth - r.right,
    cookieVar: document.documentElement.style.getPropertyValue('--cookie-consent-h'),
    bannerPresent: Boolean(document.querySelector('[data-cookie-consent]')),
    closedPanelTabStops: [...document.querySelectorAll('[data-sutra] button, [data-sutra] input, [data-sutra] select, [data-sutra] a, [data-sutra] [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed' && getComputedStyle(el).display !== 'none').length,
  }
}, BASE_OFFSET)

for (const [vw, vh] of viewports) {
  const name = `${vw}x${vh}`

  // ---- A. cookie bar showing: name, size, tab order, no trap -------------------------------------------------
  {
    const { context, page } = await fresh(vw, vh)
    const f = await launcherFacts(page)
    check(name, 'cookie-visible', 'launcher has an accessible name (aria-label "Open SUTRA")', f?.ariaLabel === 'Open SUTRA', JSON.stringify({ label: f?.ariaLabel, visibleText: f?.text }))
    const named = await page.getByRole('button', { name: 'Open SUTRA', exact: true }).count()
    check(name, 'cookie-visible', 'role=button with name "Open SUTRA" resolves exactly once in the a11y tree', named === 1, `${named}`)
    check(name, 'cookie-visible', 'launcher hit box >= 44 x 44', f.w >= 44 && f.h >= 44, `${Math.round(f.w)}x${Math.round(f.h)}`)
    const gb = await page.getByRole('button', { name: 'Got it' }).boundingBox()
    check(name, 'cookie-visible', '"Got it" hit box >= 44 x 44', gb.width >= 44 && gb.height >= 44, `${Math.round(gb.width)}x${Math.round(gb.height)}`)
    check(name, 'cookie-visible', 'closed panel contributes no tab stops', f.closedPanelTabStops === 0, `${f.closedPanelTabStops}`)

    // Walk the real tab order from the top of the document.
    await page.evaluate(() => { document.activeElement instanceof HTMLElement && document.activeElement.blur(); window.scrollTo(0, 0) })
    const order = []
    for (let i = 0; i < 400; i++) {
      await page.keyboard.press('Tab')
      const who = await page.evaluate(describeActive)
      order.push(who)
      if (who === 'body' && i > 5) break // focus left the document (browser chrome)
    }
    const li = order.indexOf('launcher'), gi = order.indexOf('gotit')
    check(name, 'cookie-visible', 'launcher reachable by Tab exactly once', order.filter((x) => x === 'launcher').length === 1, `position ${li} of ${order.length}`)
    check(name, 'cookie-visible', '"Got it" reachable by Tab exactly once', order.filter((x) => x === 'gotit').length === 1, `position ${gi} of ${order.length}`)
    check(name, 'cookie-visible', 'tab order: launcher then "Got it" (DOM order, no positive tabindex)', li >= 0 && gi > li, `launcher@${li} gotit@${gi}`)
    check(name, 'cookie-visible', 'no focus trap: Tab order terminates, never inside closed panel', !order.includes('sutra-panel') && order.length < 400, order.slice(-4).join(' > '))

    // From the launcher, Tab leaves it and Shift+Tab returns to something else.
    await page.getByRole('button', { name: 'Open SUTRA' }).focus()
    const focusedRing = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) } })
    await page.keyboard.press('Tab')
    const afterTab = await page.evaluate(describeActive)
    await page.keyboard.press('Shift+Tab')
    const backOnLauncher = await page.evaluate(describeActive)
    await page.keyboard.press('Shift+Tab')
    const afterShiftTab = await page.evaluate(describeActive)
    check(name, 'cookie-visible', 'Tab moves focus off the launcher', afterTab !== 'launcher', afterTab)
    check(name, 'cookie-visible', 'Shift+Tab returns to the launcher then moves off it', backOnLauncher === 'launcher' && afterShiftTab !== 'launcher', `${backOnLauncher} > ${afterShiftTab}`)

    // Visible focus indicator (focus() from script does not always match :focus-visible, so use the keyboard).
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
    for (let i = 0; i < 400; i++) { await page.keyboard.press('Tab'); if ((await page.evaluate(describeActive)) === 'launcher') break }
    const ring = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) } })
    check(name, 'cookie-visible', 'keyboard-focused launcher draws a visible outline (>= 2px)', ring.style !== 'none' && ring.width >= 2, JSON.stringify(ring))

    // Open with the keyboard, Escape returns focus to the launcher.
    await page.keyboard.press('Enter')
    await page.getByRole('dialog', { name: 'SUTRA AI assistant' }).waitFor({ state: 'visible', timeout: 5000 })
    const focusIn = await page.evaluate(describeActive)
    check(name, 'keyboard-open', 'Enter on launcher opens the dialog and moves focus into it', focusIn === 'sutra-panel', focusIn)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Open SUTRA' }).waitFor({ state: 'visible' })
    const back = await page.evaluate(describeActive)
    check(name, 'keyboard-open', 'Escape closes the dialog and returns focus to the launcher', back === 'launcher', back)
    await page.screenshot({ path: path.join(outDir, `${name}-1-cookie-visible.png`) })
    await context.close()
  }

  // ---- B. "Got it" by keyboard, then reload with consent already accepted --------------------------------------
  {
    const { context, page } = await fresh(vw, vh)
    const before = await launcherFacts(page)
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
    let reached = false
    for (let i = 0; i < 400; i++) { await page.keyboard.press('Tab'); if ((await page.evaluate(describeActive)) === 'gotit') { reached = true; break } }
    check(name, 'gotit-keyboard', '"Got it" focusable by Tab', reached)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(400)
    const after = await launcherFacts(page)
    check(name, 'gotit-keyboard', 'Enter on "Got it" dismisses the bar and clears --cookie-consent-h', !after.bannerPresent && after.cookieVar === '', JSON.stringify({ banner: after.bannerPresent, cookieVar: after.cookieVar }))
    check(name, 'gotit-keyboard', 'launcher drops from the cookie offset to the base offset', before.fromBottom > after.fromBottom && Math.abs(after.fromBottom - BASE_OFFSET) <= 1, `${Math.round(before.fromBottom)}px -> ${Math.round(after.fromBottom)}px`)
    const focusAfter = await page.evaluate(describeActive)
    check(name, 'gotit-keyboard', 'focus is not sent into a hidden/closed panel after dismissal', focusAfter !== 'sutra-panel', `activeElement after dismissal: ${focusAfter}`)
    await page.screenshot({ path: path.join(outDir, `${name}-2-after-gotit.png`) })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Open SUTRA' }).waitFor({ state: 'visible', timeout: 90000 })
    await page.waitForTimeout(1500) // banner (if any) mounts after hydration
    const rel = await launcherFacts(page)
    check(name, 'reload-dismissed', 'no banner after reload with consent accepted', !rel.bannerPresent)
    check(name, 'reload-dismissed', '--cookie-consent-h is unset', rel.cookieVar === '', JSON.stringify(rel.cookieVar))
    check(name, 'reload-dismissed', 'launcher sits at the base offset from the bottom', Math.abs(rel.fromBottom - BASE_OFFSET) <= 1, `${rel.fromBottom}px`)
    check(name, 'reload-dismissed', 'launcher still >= 44 x 44 and named', rel.w >= 44 && rel.h >= 44 && rel.ariaLabel === 'Open SUTRA', `${Math.round(rel.w)}x${Math.round(rel.h)}`)
    await page.screenshot({ path: path.join(outDir, `${name}-3-reload-dismissed.png`) })
    await context.close()
  }

  // ---- C. "Got it" by real pointer click with the launcher present --------------------------------------------------
  {
    const { context, page } = await fresh(vw, vh)
    await page.getByRole('button', { name: 'Got it' }).click({ timeout: 5000 })
    await page.waitForTimeout(400)
    const after = await launcherFacts(page)
    check(name, 'gotit-click', 'real click on "Got it" dismisses the bar (launcher does not intercept)', !after.bannerPresent && after.cookieVar === '')
    await context.close()
  }
}
await browser.close()
await writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.viewport} ${r.stage} - ${r.name}${r.pass ? '' : ` (${r.detail})`}`)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
