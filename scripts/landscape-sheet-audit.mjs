// Cockpit sheet-control occlusion audit (RULE 13/41/44 generalisation).
//
//   node scripts/landscape-sheet-audit.mjs <baseUrl> [--products=Land,Design] [--viewports=667x375,320x568]
//        [--cookie=accepted|shown|both] [--report=file.json] [--shots-dir=dir] [--shots=all|fail|none]
//        [--known-open=more-drawer@667x375t,more-drawer@320x568t] [--no-webgl]
//
// --no-webgl launches Chromium with the 3D APIs disabled (the cockpit's own reduced-mode
// profile) and waits for the task toolbar instead of the canvas: same chrome and sheets, far
// less CPU on a shared machine. Default is the WebGL-capable profile.
//
// --known-open lists sheetId@viewport pairs (viewport may be *) whose failures are recorded as
// KNOWN-OPEN and do not fail the run - for defects tracked outside this audit's fix lease. The
// default is strict: with no --known-open every failure fails the run.
//
// Principle: a sheet/dialog's own close (or primary) control must never be hit-occluded by
// fixed chrome (workflow rail, app bar, cookie bar, SUTRA launcher, another sheet) at any
// RULE 41 viewport. For every sheet the cockpit can open, at every viewport, this opens the
// sheet with a real tap/click, samples five points across the control with
// document.elementFromPoint, requires the control to lie fully inside the viewport, then
// closes the sheet with a real tap/click (Playwright's own actionability hit-target check is a
// second, independent obstruction detector) and asserts the sheet is gone.
//
// Sheets: shells, controls, tool (in-flow product pane), options + evidence (only where a
// trigger exists), territory, extract panel, SUTRA sheet, workflow menu, and the workflow
// menu reached while the Shells sheet is open. A sheet whose trigger is absent for a
// product/viewport is reported as N/A, never as a pass. Exit 1 on any failure, and on a run
// that checked zero controls (RULE 21).
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(new URL('../apps/web/package.json', import.meta.url))
const { chromium } = require('playwright')

const args = process.argv.slice(2)
const flag = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const baseUrl = (args.find((arg) => !arg.startsWith('--')) || process.env.FERRUM_AUDIT_URL || 'http://127.0.0.1:4177').replace(/\/$/, '')
const knownProducts = ['Land', 'Design', 'Structure', 'Cost', 'Market', 'Procure']
const products = (flag('products') ? flag('products').split(',').map((item) => item.trim()) : knownProducts)
const defaultViewports = ['667x375t', '320x568t', '375x667t', '414x896t', '768x1024t', '1024x768', '1366x768']
// Suffix "t" = touch (isMobile + hasTouch, taps); no suffix = mouse.
const viewports = (flag('viewports') ? flag('viewports').split(',') : defaultViewports).map((spec) => {
  const match = /^(\d+)x(\d+)(t?)$/.exec(spec.trim())
  if (!match) { console.error(`Invalid viewport "${spec}" (use WxH or WxHt)`); process.exit(2) }
  return { width: Number(match[1]), height: Number(match[2]), touch: match[3] === 't', label: spec.trim() }
})
const cookieMode = flag('cookie') || 'accepted'
const cookieVariants = cookieMode === 'both' ? ['accepted', 'shown'] : [cookieMode]
if (products.some((product) => !knownProducts.includes(product)) || !['accepted', 'shown', 'both'].includes(cookieMode)) {
  console.error(`Invalid --products/--cookie. Products: ${knownProducts.join(',')}; cookie: accepted|shown|both.`)
  process.exit(2)
}
const knownOpen = (flag('known-open') ? flag('known-open').split(',') : []).map((entry) => { const [sheet, viewport = '*'] = entry.trim().split('@'); return { sheet, viewport } })
const isKnownOpen = (failure, viewportLabel) => { const sheetId = failure.split(':')[0]; return knownOpen.some((entry) => entry.sheet === sheetId && (entry.viewport === '*' || entry.viewport === viewportLabel)) }
const noWebgl = args.includes('--no-webgl')
const reportPath = flag('report')
const shotsDir = flag('shots-dir') ? resolve(flag('shots-dir')) : null
const shotsMode = flag('shots') || (shotsDir ? 'fail' : 'none')

const short = (error) => String(error?.message ?? error).split('\n')[0].slice(0, 200)

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true, ...(noWebgl ? { args: ['--disable-3d-apis', '--disable-gpu'] } : {}) })
  } catch (error) {
    console.warn(`Bundled Chromium unavailable (${short(error)}); using installed Chrome.`)
    return chromium.launch({ channel: 'chrome', headless: true, ...(noWebgl ? { args: ['--disable-3d-apis', '--disable-gpu'] } : {}) })
  }
}

// Five-point hit test run in the page. `self` means the topmost element at the point is the
// control or one of its descendants. Returns the occluder description for the first miss.
function probe(element) {
  const describe = (node) => (node ? `${node.tagName.toLowerCase()}${node.getAttribute('data-workflow-rail') !== null ? '[data-workflow-rail]' : ''}[${(node.getAttribute('aria-label') || node.getAttribute('data-mobile-sheet') || String(node.className)).toString().slice(0, 60)}]` : 'null')
  const rect = element.getBoundingClientRect()
  const inViewport = rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 0.5 && rect.bottom <= innerHeight + 0.5
  const fractions = [[0.5, 0.5], [0.2, 0.5], [0.8, 0.5], [0.5, 0.2], [0.5, 0.8]]
  const misses = []
  for (const [fx, fy] of fractions) {
    const x = Math.min(Math.max(rect.left + rect.width * fx, 0), innerWidth - 1)
    const y = Math.min(Math.max(rect.top + rect.height * fy, 0), innerHeight - 1)
    const hit = document.elementFromPoint(x, y)
    if (!(hit && (hit === element || element.contains(hit)))) misses.push(`(${Math.round(x)},${Math.round(y)}) -> ${describe(hit)}`)
  }
  return { rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)], inViewport, misses, vw: innerWidth, vh: innerHeight }
}

// Sheet table. `trigger` returns a Locator or null; `root` a CSS selector for the opened
// surface; `control` a function (page) -> Locator for the control that must be tappable.
// `scroll: true` marks an in-flow (non-fixed) pane that a user scrolls to.
const toolbarButton = (name) => (page) => page.locator('[data-mobile-cockpit-toolbar]').getByRole('button', { name, exact: true })
const sheets = [
  { id: 'shells', trigger: toolbarButton('Shells'), root: '[data-mobile-sheet="shells"]', control: (page) => page.locator('[data-mobile-sheet="shells"]').getByRole('button', { name: 'Close library' }) },
  { id: 'controls', trigger: toolbarButton('Controls'), root: '[data-mobile-sheet="controls"]', control: (page) => page.locator('[data-mobile-sheet="controls"]').getByRole('button', { name: /^Close/ }).first() },
  { id: 'tool', trigger: (page) => page.locator('[data-product-tool-trigger]'), root: '[data-mobile-sheet="tool"]', scroll: true, control: (page) => page.locator('[data-mobile-sheet="tool"]').getByRole('button', { name: 'Close', exact: true }) },
  { id: 'options', trigger: toolbarButton('Options'), root: '[data-mobile-sheet="options"]', control: (page) => page.locator('[data-mobile-sheet="options"]').getByRole('button', { name: 'Close', exact: true }) },
  { id: 'evidence', trigger: toolbarButton('Evidence'), root: '[data-mobile-sheet="extract"]', control: (page) => page.locator('[data-mobile-sheet="extract"]').getByRole('button', { name: 'Close evidence' }) },
  { id: 'territory', trigger: (page) => page.locator('header[aria-label="Workspace app bar"]').getByRole('button', { name: 'Territory', exact: true }), root: '[aria-label="Territorial context"]', control: (page) => page.locator('[aria-label="Territorial context"]').getByRole('button', { name: 'Close', exact: true }) },
  { id: 'extract-panel', trigger: (page) => page.locator('[data-mobile-workspace-tools]').getByRole('button', { name: /^(Open extract|Hide extract)$/ }), root: '[aria-label="Workspace data extract"]', control: (page) => page.locator('[aria-label="Workspace data extract"]').getByRole('button', { name: 'Close extract' }) },
  { id: 'more-drawer', trigger: (page) => page.locator('[data-mobile-workspace-tools]').getByRole('button', { name: 'More', exact: true }), root: '[aria-label="More workspace options"]', control: (page) => page.locator('[aria-label="More workspace options"]').getByRole('button', { name: 'Close', exact: true }) },
  { id: 'sutra', trigger: (page) => page.locator('header[aria-label="Workspace app bar"]').getByRole('button', { name: 'SUTRA', exact: true }), root: '[data-sutra-region]', skipIfRootVisible: true, control: (page) => page.locator('[data-sutra-region] [aria-label="Minimize SUTRA"]:visible, [data-sutra-region] [aria-label="Close SUTRA"]:visible').first() },
]

async function runCase(browser, product, viewport, cookie) {
  const record = { product, viewport: viewport.label, cookie, ok: true, failures: [], knownOpen: [], checked: [], notApplicable: [] }
  const fail = (check, detail) => { record.ok = false; record.failures.push(`${check}: ${detail}`) }
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.touch, hasTouch: viewport.touch })
  if (cookie === 'accepted') await context.addInitScript(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch { /* storage blocked */ } })
  const page = await context.newPage()
  const browserErrors = []
  page.on('pageerror', (error) => browserErrors.push(`pageerror ${error.message}`))
  const press = (locator, timeout = 5000) => (viewport.touch ? locator.tap({ timeout }) : locator.click({ timeout }))
  let dirty = false
  const load = async () => {
    await page.goto(`${baseUrl}/project-workspace/cockpit?product=${product}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.locator(noWebgl ? '[data-mobile-cockpit-toolbar]' : '[data-space-3d] canvas').first().waitFor({ state: 'visible', timeout: 60000 })
    await page.waitForTimeout(600)
  }
  const shot = async (name) => {
    if (!shotsDir) return
    await mkdir(shotsDir, { recursive: true })
    await page.screenshot({ path: resolve(shotsDir, `${product}-${viewport.label}-${cookie}-${name}.png`) })
  }

  // Hit-test one control; on a miss, take a screenshot before anything is closed.
  const testControl = async (id, control, { scroll = false } = {}) => {
    const target = control.first()
    if ((await control.count()) === 0) { fail(id, 'control not found in the opened surface'); return false }
    if (scroll) await target.evaluate((element) => element.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(150)
    const result = await target.evaluate(probe)
    const detail = `control@[${result.rect.join(',')}] viewport ${result.vw}x${result.vh}`
    if (!result.inViewport) fail(`${id}:in-viewport`, `${detail} is outside the viewport`)
    if (result.misses.length > 0) fail(`${id}:hit-test`, `${detail} occluded at ${result.misses.slice(0, 2).join('; ')}`)
    if (!result.inViewport || result.misses.length > 0) { await shot(`${id}-OCCLUDED`); return false }
    return true
  }

  try {
    await load()
    for (const sheet of sheets) {
      if (dirty) { await load(); dirty = false }
      const before = record.failures.length
      try {
        const trigger = sheet.trigger(page)
        const present = (await trigger.count()) > 0 && (await trigger.first().isVisible())
        if (!present) { record.notApplicable.push(sheet.id); continue }
        if (sheet.skipIfRootVisible && (await page.locator(sheet.root).first().isVisible().catch(() => false))) { record.notApplicable.push(`${sheet.id}(docked)`); continue }
        await press(trigger.first())
        await page.locator(sheet.root).first().waitFor({ state: 'visible', timeout: 5000 })
        await page.waitForTimeout(250)
        const control = sheet.control(page)
        const ok = await testControl(sheet.id, control, { scroll: sheet.scroll })
        record.checked.push(sheet.id)
        // Real tap/click on the control. Playwright refuses an obstructed target, which
        // independently confirms the elementFromPoint verdict.
        try {
          await press(control.first(), ok ? 5000 : 1500)
          await page.locator(sheet.root).first().waitFor({ state: 'hidden', timeout: 5000 })
        } catch (error) {
          if (ok) fail(`${sheet.id}:close-tap`, short(error))
          else fail(`${sheet.id}:close-tap`, `real tap failed - ${short(error)}`)
        }
      } catch (error) {
        fail(`${sheet.id}:open`, short(error))
      }
      if (record.failures.length > before) dirty = true
    }

    // Workflow menu: the summary that opens it, its first item, and re-tapping the summary to close.
    if (dirty) { await load(); dirty = false }
    {
      const before = record.failures.length
      try {
        const summary = page.locator('[data-workflow-rail] details:visible > summary').first()
        await summary.waitFor({ state: 'visible', timeout: 5000 })
        record.checked.push('workflow-menu')
        if (await testControl('workflow-menu:summary', summary)) {
          await press(summary)
          await page.locator('[data-workflow-rail] details[open]').first().waitFor({ state: 'attached', timeout: 5000 })
          await page.waitForTimeout(250)
          const item = page.locator('[data-workflow-rail] details[open] button').first()
          await testControl('workflow-menu:first-item', item)
          await press(summary)
          await page.waitForFunction(() => document.querySelectorAll('[data-workflow-rail] details[open]').length === 0, null, { timeout: 5000 })
        }
      } catch (error) { fail('workflow-menu', short(error)) }
      if (record.failures.length > before) dirty = true
    }

    // Design only: with the Shells sheet open, the rail's own menu must still be reachable
    // and render above the sheet (the rail must not be hidden by, or hide, the sheet).
    if (product === 'Design') {
      if (dirty) { await load(); dirty = false }
      const before = record.failures.length
      try {
        await press(toolbarButton('Shells')(page).first())
        await page.locator('[data-mobile-sheet="shells"]').first().waitFor({ state: 'visible', timeout: 5000 })
        await page.waitForTimeout(250)
        const summary = page.locator('[data-workflow-rail] details:visible > summary').first()
        record.checked.push('workflow-menu-over-shells')
        if (await testControl('workflow-menu-over-shells:summary', summary)) {
          await press(summary)
          await page.locator('[data-workflow-rail] details[open]').first().waitFor({ state: 'attached', timeout: 5000 })
          await page.waitForTimeout(250)
          await testControl('workflow-menu-over-shells:first-item', page.locator('[data-workflow-rail] details[open] button').first())
          await press(summary)
          await page.waitForFunction(() => document.querySelectorAll('[data-workflow-rail] details[open]').length === 0, null, { timeout: 5000 })
        }
        try {
          await press(page.locator('[data-mobile-sheet="shells"]').getByRole('button', { name: 'Close library' }))
          await page.locator('[data-mobile-sheet="shells"]').waitFor({ state: 'hidden', timeout: 5000 })
        } catch (error) { fail('workflow-menu-over-shells:close-library-tap', short(error)) }
      } catch (error) { fail('workflow-menu-over-shells', short(error)) }
      if (record.failures.length > before) dirty = true
    }
  } catch (error) {
    fail('load', short(error))
  }
  if (browserErrors.length > 0) fail('browser-errors', browserErrors.slice(0, 2).join(' | ').slice(0, 200))
  if (shotsMode === 'all') await shot('final').catch(() => undefined)
  await context.close()
  // Split tracked out-of-lease failures from real ones (only when --known-open names them).
  const tracked = record.failures.filter((failure) => isKnownOpen(failure, viewport.label))
  record.knownOpen = tracked
  record.failures = record.failures.filter((failure) => !tracked.includes(failure))
  record.ok = record.failures.length === 0
  return record
}

const started = Date.now()
const browser = await launchBrowser()
const cases = []
try {
  for (const cookie of cookieVariants) {
    for (const viewport of viewports) {
      for (const product of products) {
        const record = await runCase(browser, product, viewport, cookie)
        cases.push(record)
        console.log(`${record.ok ? 'PASS' : 'FAIL'} ${product}@${viewport.label} cookie=${cookie} checked=[${record.checked.join(',')}] n/a=[${record.notApplicable.join(',')}]${record.ok ? '' : ` :: ${record.failures.join(' ; ')}`}${record.knownOpen.length ? ` || KNOWN-OPEN: ${record.knownOpen.join(' ; ')}` : ''}`)
      }
    }
  }
} finally {
  await browser.close()
}

const failed = cases.filter((entry) => !entry.ok)
const controlsChecked = cases.reduce((sum, entry) => sum + entry.checked.length, 0)
const report = {
  baseUrl,
  at: new Date(started).toISOString(),
  ms: Date.now() - started,
  matrix: { products, viewports: viewports.map((entry) => entry.label), cookie: cookieVariants },
  totals: { cases: cases.length, passed: cases.length - failed.length, failed: failed.length, knownOpenFailures: cases.reduce((sum, entry) => sum + entry.knownOpen.length, 0), controlsChecked },
  cases,
}
if (reportPath) {
  await mkdir(dirname(resolve(reportPath)), { recursive: true })
  await writeFile(resolve(reportPath), `${JSON.stringify(report, null, 1)}\n`)
}
console.log(`SUMMARY cases=${report.totals.cases} passed=${report.totals.passed} failed=${report.totals.failed} knownOpenFailures=${report.totals.knownOpenFailures} controlsChecked=${controlsChecked}`)
process.exit(failed.length === 0 && controlsChecked > 0 ? 0 : 1)
