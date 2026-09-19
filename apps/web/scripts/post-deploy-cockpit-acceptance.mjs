// Post-deploy cockpit acceptance (real clicks, headless, isolated Chromium).
//
//   node scripts/post-deploy-cockpit-acceptance.mjs [baseUrl] [--report=file.json]
//        [--evidence] [--evidence-dir=dir] [--products=Land,Design] [--widths=320,1440]
//
// One page load per product x width (Land/Design/Structure/Cost/Market/Procure x
// 320/390/768/1024/1366/1440). Per case: no overflow/page errors at every stage,
// toolbar below the app bar, model centre unobstructed, product tool (or truthful
// ROADMAP) opened by a real click, SUTRA opened with its input visible, and a real
// DXF download. The original Design 320/768 acceptance (camera-state route: evidence
// qualification, 44px workspace target, one SUTRA + one Extract action, no default
// overlay) runs inside the matching Design case, not in a second loop.
//
// Output: PASS/FAIL line per case, then one `REPORT {json}` line. Screenshots are
// written only for failing cases (max 12), or, with --evidence, a bounded set of
// one per product at the narrowest and widest widths (max 12). Exit 1 on any failure.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const flag = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const baseUrl = (args.find((arg) => !arg.startsWith('--')) || process.env.FERRUM_ACCEPTANCE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const list = (value, fallback) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : fallback)
const products = list(flag('products'), ['Land', 'Design', 'Structure', 'Cost', 'Market', 'Procure'])
const widths = list(flag('widths'), ['320', '390', '768', '1024', '1366', '1440']).map(Number)
const reportPath = flag('report') || process.env.FERRUM_ACCEPTANCE_REPORT
const evidenceAlways = args.includes('--evidence')
const evidenceDir = resolve(flag('evidence-dir') || fileURLToPath(new URL('../test-results/cockpit-acceptance/', import.meta.url)))
const MAX_SHOTS = 12
const legacyRoute = '/project-workspace/cockpit?project=preview&product=Design&workspaceView=camera-state&revision=7'
const legacyWidths = [320, 768]

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`Bundled Chromium unavailable (${error.message.split('\n')[0]}); using installed Chrome.`)
    return chromium.launch({ channel: 'chrome', headless: true })
  }
}

const rectOf = (locator) => locator.evaluate((element) => { const b = element.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, width: b.width, height: b.height } })
const short = (error) => String(error?.message ?? error).split('\n')[0].slice(0, 160)

async function runCase(browser, product, width) {
  const legacy = product === 'Design' && legacyWidths.includes(width)
  const record = { product, width, ok: true, failures: [], tool: null, sutra: null, dxf: null }
  const fail = (check, detail) => { record.ok = false; record.failures.push(`${check}: ${detail}`) }
  const check = (check_, condition, detail) => { if (!condition) fail(check_, detail) }
  const context = await browser.newContext({ viewport: { width, height: width >= 1024 ? 800 : 900 }, acceptDownloads: true })
  await context.addInitScript(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch { /* storage blocked */ } })
  const page = await context.newPage()
  const browserErrors = []
  page.on('pageerror', (error) => browserErrors.push(`pageerror ${error.message}`))
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(`console ${message.text()}`) })
  const overflow = async (stage) => {
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
    check(`overflow@${stage}`, !wide, 'horizontal page overflow')
  }
  const step = async (name, body) => { try { await body() } catch (error) { fail(name, short(error)) } }

  try {
    await page.goto(`${baseUrl}${legacy ? legacyRoute : `/project-workspace/cockpit?product=${product}`}`, { waitUntil: 'networkidle', timeout: 120000 })
    await page.locator('[data-space-3d] canvas').first().waitFor({ state: 'visible', timeout: 60000 })
    await page.waitForTimeout(400)

    await step('layout', async () => {
      await overflow('load')
      const appBar = await rectOf(page.locator('header[aria-label="Workspace app bar"]'))
      const bars = [['model-views', '[role=tablist][aria-label="Model views"]'], ['task-toolbar', '[data-mobile-cockpit-toolbar]']]
      for (const [name, selector] of bars) {
        const bar = await rectOf(page.locator(selector).first())
        check(`toolbar-below-appbar(${name})`, bar.top >= appBar.bottom - 0.5, `top ${Math.round(bar.top)} < app bar bottom ${Math.round(appBar.bottom)}`)
      }
      const centre = await page.locator('[data-space-3d]').first().evaluate((host) => {
        host.scrollIntoView({ block: 'nearest' })
        const b = host.getBoundingClientRect()
        const x = b.left + b.width / 2
        const y = Math.min(Math.max(b.top + b.height / 2, 0), innerHeight - 1)
        const hit = document.elementFromPoint(x, y)
        return { ok: Boolean(hit && host.contains(hit)), by: hit ? `${hit.tagName.toLowerCase()}[${(hit.getAttribute('aria-label') || String(hit.className)).slice(0, 50)}]` : 'null', w: b.width, h: b.height }
      })
      check('model-centre', centre.ok && centre.w > 100 && centre.h > 100, `obstructed by ${centre.by} (model ${Math.round(centre.w)}x${Math.round(centre.h)})`)
    })

    if (legacy) {
      await step('legacy-design', async () => {
        const result = await page.evaluate(() => {
          const visible = (element) => {
            if (!element) return false
            if (typeof element.checkVisibility === 'function' && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
            const rect = element.getBoundingClientRect()
            const style = getComputedStyle(element)
            const details = element.closest('details')
            if (details && !details.open && element !== details.querySelector(':scope > summary') && !element.matches('summary')) return false
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && element.getAttribute('aria-hidden') !== 'true'
          }
          const directlyVisible = (element) => {
            if (!element) return false
            const rect = element.getBoundingClientRect()
            const style = getComputedStyle(element)
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
          }
          const evidence = document.querySelector('[data-canvas-evidence]')
          const workspace = document.querySelector('[data-fullscreen-toggle]')
          const workspaceRect = workspace?.getBoundingClientRect()
          const controls = [...document.querySelectorAll('button,summary')].filter(visible)
          const overlays = [...document.querySelectorAll('[data-mobile-sheet],[data-workflow-backdrop],[aria-label="SUTRA design assistant"],[aria-label="Workspace data extract"],[aria-label="Territorial context"]')].filter(visible)
          return {
            defaultOverlays: overlays.map((element) => element.getAttribute('aria-label') || element.getAttribute('data-mobile-sheet') || element.tagName),
            evidenceText: evidence?.textContent?.trim().replace(/\s+/g, ' ') ?? '',
            evidenceFits: Boolean(evidence && evidence.scrollWidth <= evidence.clientWidth + 1),
            workspaceWidth: workspaceRect?.width ?? 0,
            workspaceHeight: workspaceRect?.height ?? 0,
            workspaceFits: Boolean(workspace && workspace.scrollWidth <= workspace.clientWidth + 1),
            workspaceAria: workspace?.getAttribute('aria-label') ?? '',
            compactIconVisible: directlyVisible(document.querySelector('[data-compact-workspace-icon]')),
            fullLabelVisible: directlyVisible(document.querySelector('[data-workspace-action-label]')),
            sutraCount: controls.filter((element) => element.textContent?.trim() === 'SUTRA').length,
            extractCount: controls.filter((element) => element.getAttribute('aria-label') === 'Open extract').length,
          }
        })
        check('legacy:default-overlays', result.defaultOverlays.length === 0, `default overlay(s) open: ${result.defaultOverlays.join(', ')}`)
        check('legacy:evidence-text', result.evidenceText.endsWith('NOT A SURVEY'), 'evidence qualification does not end with NOT A SURVEY')
        check('legacy:evidence-fits', result.evidenceFits, 'evidence qualification overflows horizontally')
        check('legacy:workspace-target', result.workspaceWidth >= 44 && result.workspaceHeight >= 44, 'workspace target is smaller than 44x44')
        check('legacy:workspace-clipped', result.workspaceFits && result.workspaceAria.length > 0, 'workspace control is clipped or unnamed')
        check('legacy:one-sutra', result.sutraCount === 1, `expected one SUTRA action, found ${result.sutraCount}`)
        check('legacy:one-extract', result.extractCount === 1, `expected one Extract action, found ${result.extractCount}`)
        if (width <= 430) check('legacy:compact-icon', result.compactIconVisible && !result.fullLabelVisible, 'compact workspace icon state is incorrect')
        else check('legacy:full-label', !result.compactIconVisible && result.fullLabelVisible, 'full workspace label is not visible')
      })
    }

    // Product tool: docked at xl, opened from the toolbar below it. Design has none.
    await step('product-tool', async () => {
      const surface = page.locator('[data-product-tool-surface]')
      if (product === 'Design') {
        check('design-no-tool-surface', (await surface.count()) === 0, 'Design must not mount a product tool surface')
        const shells = page.getByRole('button', { name: 'Shells', exact: true })
        await shells.click({ timeout: 5000 })
        check('design-active-tool', (await shells.getAttribute('aria-expanded')) === 'true', 'Shells control did not open')
        await page.locator('[data-mobile-sheet="shells"]').first().waitFor({ state: 'visible', timeout: 5000 })
        record.tool = { state: 'SHELLS' }
        // Modal sheet: the scrim covers the trigger, so close via the sheet's own control.
        await page.locator('[data-mobile-sheet="shells"]').getByRole('button', { name: 'Close library' }).click({ timeout: 5000 })
        await page.locator('[data-mobile-sheet="shells"]').waitFor({ state: 'hidden', timeout: 5000 })
        return
      }
      const trigger = page.locator('[data-product-tool-trigger]')
      if (await trigger.isVisible()) {
        await trigger.click({ timeout: 5000 })
        check('tool-trigger-expanded', (await trigger.getAttribute('aria-expanded')) === 'true', 'toolbar trigger did not open the tool pane')
      }
      await surface.waitFor({ state: 'visible', timeout: 10000 })
      const info = await page.evaluate(() => {
        const pane = document.querySelector('[data-product-tool-surface]')
        const model = document.querySelector('[data-space-3d]').getBoundingClientRect()
        const p = pane.getBoundingClientRect()
        return {
          product: pane.getAttribute('data-product-tool-surface'),
          state: pane.getAttribute('data-tool-state'),
          title: pane.querySelector('[data-active-tool]')?.textContent?.trim() ?? '',
          liveBody: Boolean(pane.querySelector('[data-live-tool]')),
          roadmapText: /ROADMAP/.test(pane.textContent ?? ''),
          liveActions: pane.querySelectorAll('[data-live-tool] button, [data-live-tool] input').length,
          overlapsModel: p.left < model.right && p.right > model.left && p.top < model.bottom && p.bottom > model.top,
        }
      })
      record.tool = { state: info.state, title: info.title }
      check('tool-state', info.state === 'LIVE' || info.state === 'ROADMAP', `unknown tool state ${info.state}`)
      if (info.state === 'LIVE') check('tool-live', info.liveBody && info.title.length > 0 && info.title !== 'No live tool yet', `LIVE state without a mounted tool (title "${info.title}")`)
      else check('tool-roadmap', !info.liveBody && info.liveActions === 0 && info.title === 'No live tool yet' && info.roadmapText, 'ROADMAP state is not truthful (live body/actions present or ROADMAP text missing)')
      check('tool-not-over-model', !info.overlapsModel, 'tool pane overlaps the model')
      await overflow('tool-open')
      if (await trigger.isVisible()) {
        await trigger.click({ timeout: 5000 })
        await surface.waitFor({ state: 'hidden', timeout: 5000 })
      }
    })

    // SUTRA: docked and already open from lg; a sheet opened by the app-bar button below.
    await step('sutra', async () => {
      const input = page.locator('#sutra-command')
      if (!(await input.isVisible())) await page.locator('header[aria-label="Workspace app bar"]').getByRole('button', { name: 'SUTRA', exact: true }).click({ timeout: 5000 })
      await input.waitFor({ state: 'visible', timeout: 10000 })
      const box = await input.evaluate((element) => {
        const b = element.getBoundingClientRect()
        const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
        return { inside: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, hit: Boolean(hit && (hit === element || element.contains(hit))), w: b.width, h: b.height }
      })
      record.sutra = { input: box.inside && box.hit }
      check('sutra-input', box.inside && box.hit && box.w > 40 && box.h >= 40, `input not usable in viewport (inside=${box.inside} hit=${box.hit} ${Math.round(box.w)}x${Math.round(box.h)})`)
      await overflow('sutra-open')
      if (width < 1024) {
        const closer = page.locator('[data-sutra-region] [aria-label="Close SUTRA"]:visible, [data-sutra-region] [aria-label="Minimize SUTRA"]:visible').first()
        await closer.click({ timeout: 5000 })
        await page.locator('[data-sutra-region]').waitFor({ state: 'hidden', timeout: 5000 })
      }
    })

    await step('dxf', async () => {
      const button = page.locator('[data-export-dxf]')
      await button.scrollIntoViewIfNeeded()
      const [download] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), button.click({ timeout: 5000 })])
      const path = await download.path()
      const body = path ? await readFile(path, 'utf8') : ''
      record.dxf = { name: download.suggestedFilename(), bytes: body.length }
      check('dxf-name', /\.dxf$/i.test(download.suggestedFilename()), `unexpected filename ${download.suggestedFilename()}`)
      check('dxf-content', body.length > 200 && /SECTION/.test(body) && /EOF/.test(body), `download is not a DXF (${body.length} bytes)`)
      await overflow('after-export')
    })
  } catch (error) {
    fail('load', short(error))
  }

  check('browser-errors', browserErrors.length === 0, browserErrors.slice(0, 3).map((message) => message.slice(0, 120)).join(' | '))
  return { record, page, context }
}

const started = Date.now()
const browser = await launchBrowser()
const cases = []
let shots = 0
try {
  await mkdir(evidenceDir, { recursive: true })
  for (const product of products) {
    for (const width of widths) {
      const { record, page, context } = await runCase(browser, product, width)
      const bounded = evidenceAlways && (width === Math.min(...widths) || width === Math.max(...widths))
      if ((!record.ok || bounded) && shots < MAX_SHOTS) {
        const file = `${product}-${width}${record.ok ? '' : '-FAIL'}.png`
        try { await page.screenshot({ path: resolve(evidenceDir, file) }); record.shot = file; shots += 1 } catch (error) { record.shot = `unavailable: ${short(error)}` }
      }
      await context.close()
      cases.push(record)
      console.log(`${record.ok ? 'PASS' : 'FAIL'} ${product}@${width} tool=${record.tool?.state ?? '-'} sutraInput=${record.sutra?.input ?? '-'} dxf=${record.dxf?.bytes ?? '-'}${record.ok ? '' : ` :: ${record.failures.join(' ; ')}`}`)
    }
  }
} finally {
  await browser.close()
}

const failed = cases.filter((entry) => !entry.ok)
const report = {
  baseUrl,
  at: new Date(started).toISOString(),
  ms: Date.now() - started,
  matrix: { products, widths },
  totals: { cases: cases.length, passed: cases.length - failed.length, failed: failed.length },
  cases: cases.map(({ product, width, ok, tool, sutra, dxf, failures, shot }) => ({ product, width, ok, tool: tool?.state ?? null, toolTitle: tool?.title ?? null, sutraInput: sutra?.input ?? null, dxfBytes: dxf?.bytes ?? null, ...(failures.length ? { failures } : {}), ...(shot ? { shot } : {}) })),
}
if (reportPath) {
  await mkdir(dirname(resolve(reportPath)), { recursive: true })
  await writeFile(resolve(reportPath), `${JSON.stringify(report)}\n`)
}
console.log(`REPORT ${JSON.stringify(report)}`)
process.exit(failed.length === 0 && cases.length > 0 ? 0 : 1)
