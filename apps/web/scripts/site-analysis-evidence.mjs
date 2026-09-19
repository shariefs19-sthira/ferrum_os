import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

// Rendered real-click acceptance for the LandIntel Site analysis workspace.
// Runs headless and isolated (AGENTS.md RULE 28). Every interaction is a real
// Playwright click/keyboard/typing event against the running app; nothing
// mutates state through evaluate() except read-only measurements.

const baseUrl = (process.argv[2] || process.env.SITE_ANALYSIS_URL || 'http://127.0.0.1:3117').replace(/\/$/, '')
const evidenceRoot = path.resolve('evidence', 'site-analysis')
const widths = [320, 390, 768, 1024, 1440]
const viewports = widths.map((width) => ({ width, height: width < 768 ? 900 : 1000 }))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`Bundled Chromium unavailable (${error.message.split('\n')[0]}); using installed Chrome.`)
    return chromium.launch({ channel: 'chrome', headless: true })
  }
}

async function dismissConsent(page) {
  const consent = page.getByRole('dialog', { name: 'Cookie consent' })
  const visible = await consent.waitFor({ state: 'visible', timeout: 2_000 }).then(() => true).catch(() => false)
  if (visible) {
    await consent.getByRole('button', { name: 'Got it' }).click()
    await consent.waitFor({ state: 'hidden' })
  }
}

/** Layout facts measured in the page. Read-only. */
function measureLayout(selector) {
  const root = document.querySelector(selector)
  const visible = (element) => {
    if (!element) return false
    const style = getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0
  }
  const clipped = root ? [...root.querySelectorAll('*')].filter(visible).filter((element) => {
    if (element.closest('svg') && element.tagName !== 'svg') return false
    const rect = element.getBoundingClientRect()
    return rect.right > innerWidth + 1 || rect.left < -1
  }).map((element) => `${element.tagName}.${String(element.className).slice(0, 40)}`) : ['root missing']
  const small = root ? [...root.querySelectorAll('button, input:not([type=hidden]), select, textarea, summary')].filter(visible).filter((element) => {
    if (element.tagName === 'SUMMARY') return false
    return element.getBoundingClientRect().height < 43.5
  }).map((element) => `${element.tagName}:${element.id || element.textContent.trim().slice(0, 24)}`) : []
  return {
    documentOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    rootOverflow: root ? Math.max(0, root.scrollWidth - root.clientWidth) : null,
    clipped,
    smallTargets: small,
  }
}

const results = []
await mkdir(evidenceRoot, { recursive: true })
const browser = await launchBrowser()

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const consoleErrors = []
    const pageErrors = []
    const httpErrors = []
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`) })
    const label = `${viewport.width}px`
    const checks = {}

    const response = await page.goto(`${baseUrl}/products/landintel`, { waitUntil: 'domcontentloaded' })
    assert(response && response.status() < 400, `${label}: HTTP ${response?.status() ?? 'none'}`)
    await dismissConsent(page)
    await page.waitForSelector('[data-parcel-map-stage]', { state: 'visible' })
    consoleErrors.length = 0
    pageErrors.length = 0
    httpErrors.length = 0

    // 1. Resolve a real map point through the page's own Coordinates control.
    await page.locator('[data-find-parcel-toolbar]').getByRole('button', { name: 'Coordinates', exact: true }).click()
    await page.getByLabel('Latitude', { exact: true }).first().fill('12.9762')
    await page.getByLabel('Longitude', { exact: true }).first().fill('77.5896')
    await page.getByRole('button', { name: 'Set coordinates' }).click()
    await page.locator('[data-selected-point]').filter({ hasText: '12.97620' }).waitFor()

    // Page-absolute boxes, so scrolling between measurements cannot masquerade as a layout change.
    const absBox = (selector) => page.evaluate((sel) => {
      const rect = document.querySelector(sel).getBoundingClientRect()
      return { x: Math.round(rect.left + scrollX), y: Math.round(rect.top + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) }
    }, selector)
    const mapBefore = await absBox('[data-parcel-map-stage]')

    // 2. Open the Site analysis theme.
    await page.getByRole('tab', { name: 'Site analysis' }).click()
    const workspace = page.locator('[data-site-analysis]')
    await workspace.waitFor({ state: 'visible' })
    await page.locator('[data-site-diagram-svg]').waitFor({ state: 'visible' })
    checks.anchorText = (await page.locator('[data-site-anchor-text]').textContent()).trim()
    assert(/12\.97620, 77\.58960 — map point, context only/.test(checks.anchorText), `${label}: anchor text ${checks.anchorText}`)

    // 3. Map/cockpit unobstructed: the workspace sits below the map stage, the map box is unchanged, and
    //    nothing from the workspace covers the map at its centre in 2D or (when WebGL2 exists) 3D.
    const mapAfter = await absBox('[data-parcel-map-stage]')
    const workspaceBox = await absBox('[data-site-analysis]')
    assert(JSON.stringify(mapBefore) === JSON.stringify(mapAfter), `${label}: map stage box changed ${JSON.stringify(mapBefore)} -> ${JSON.stringify(mapAfter)}`)
    assert(workspaceBox.y >= mapAfter.y + mapAfter.height - 1, `${label}: site analysis overlaps the map stage`)
    const coverage = async (view) => page.evaluate(() => {
      const stage = document.querySelector('[data-parcel-map-stage]')
      stage.scrollIntoView({ block: 'center', behavior: 'instant' })
      const rect = stage.getBoundingClientRect()
      const probe = [[0.5, 0.5], [0.25, 0.6], [0.75, 0.6]].map(([fx, fy]) => {
        const element = document.elementFromPoint(rect.left + rect.width * fx, rect.top + Math.min(rect.height * fy, innerHeight - 40))
        return { inWorkspace: !!element?.closest('[data-site-analysis]'), tag: element?.tagName ?? null }
      })
      return probe
    }).then((probe) => ({ view, probe }))
    checks.mapCoverage2d = await coverage('2d')
    assert(checks.mapCoverage2d.probe.every((item) => !item.inWorkspace), `${label}: workspace covers the 2D map`)
    const threeD = page.locator('[data-map-view-option="3d"]')
    if (await threeD.isEnabled()) {
      await threeD.click()
      await page.waitForTimeout(800)
      checks.mapCoverage3d = await coverage('3d')
      assert(checks.mapCoverage3d.probe.every((item) => !item.inWorkspace), `${label}: workspace covers the 3D map`)
      await page.locator('[data-map-view-option="2d"]').click()
    } else {
      checks.mapCoverage3d = 'WebGL2 unavailable in this headless browser; 3D not exercised (2D covered)'
    }

    // 4. Five modules by real click; every topic must read GAP before any evidence exists.
    const moduleIds = ['climate', 'physical', 'urban', 'infrastructure', 'cultural']
    checks.modules = []
    for (const id of moduleIds) {
      await page.locator(`[data-site-module="${id}"]`).click()
      const slots = await page.locator('[data-topic-slot]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-topic-state')))
      assert(slots.length > 0 && slots.every((state) => state === 'GAP'), `${label}: ${id} topics not all GAP: ${slots}`)
      const automation = (await page.locator('[data-module-automation]').textContent()).trim()
      checks.modules.push({ id, topics: slots.length, automation })
    }
    assert(/sun geometry only, COMPUTED/.test(checks.modules[0].automation), `${label}: climate automation claim`)
    assert(checks.modules.slice(1).every((item) => /Automated: nothing/.test(item.automation)), `${label}: non-climate modules claim automation`)

    // 5. Diagram: computed sun layer present and toggles work by real click.
    await page.locator('[data-site-module="climate"]').click()
    await page.locator('[data-site-sun-layer]').waitFor()
    const svgBox = await page.locator('[data-site-diagram-svg]').boundingBox()
    assert(svgBox.width >= Math.min(viewport.width - 80, 400) && svgBox.x >= 0 && svgBox.x + svgBox.width <= viewport.width + 1, `${label}: diagram box ${JSON.stringify(svgBox)}`)
    // Legibility: the rendered height of the smallest in-diagram label must stay readable at this width.
    checks.diagramLabelPx = await page.evaluate(() => Math.min(...[...document.querySelectorAll('[data-site-diagram-svg] text')].map((node) => node.getBoundingClientRect().height).filter((height) => height > 0)))
    assert(checks.diagramLabelPx >= 10.5, `${label}: smallest diagram label renders ${checks.diagramLabelPx}px tall`)
    const sunToggle = page.locator('[data-diagram-toggle="sun"]')
    await sunToggle.click()
    assert((await page.locator('[data-site-sun-layer]').count()) === 0, `${label}: sun layer still drawn after toggle off`)
    await sunToggle.click()
    assert((await page.locator('[data-site-sun-layer]').count()) === 1, `${label}: sun layer missing after toggle on`)
    await page.locator('#site-diagram-radius').selectOption('250')

    // 6. Structured capture: an observed record, an inferred record, and a rejected conclusion.
    const fillObservation = async (basis, note) => {
      await page.locator('#site-topic').selectOption('wind')
      await page.locator('#site-basis').selectOption(basis)
      await page.locator('#site-observed-on').fill('2026-09-18')
      await page.locator('#site-observer').fill('Evidence observer')
      await page.locator('#site-source-ref').fill('Field sheet FS-12')
      await page.locator('[data-site-use-map-point]').click()
      await page.locator('#site-bearing').fill('225')
      await page.locator('#site-note').fill(note)
      await page.locator('[data-site-add-observation]').click()
    }
    await fillObservation('OBSERVED', 'Bearing capacity is fine and no heritage here.')
    await page.locator('[data-site-error-summary]').waitFor()
    checks.rejectedConclusion = (await page.locator('[data-site-error-summary]').textContent()).trim().slice(0, 140)
    assert((await page.locator('[data-observation-row]').count()) === 0, `${label}: a conclusion note was accepted`)
    await page.locator('#site-note').fill('Steady breeze during the visit.')
    await page.locator('[data-site-add-observation]').click()
    await page.locator('[data-observation-row]').first().waitFor()
    assert((await page.locator('[data-topic-slot="wind"]').getAttribute('data-topic-state')) === 'OBSERVED', `${label}: wind not OBSERVED`)
    const observedId = await page.locator('[data-observation-row]').first().getAttribute('data-observation-row')
    await page.locator(`[data-observation-id="${observedId}"]`).waitFor({ state: 'visible' })
    await page.locator(`[data-observation-arrow="${observedId}"]`).waitFor()
    const markerInside = await page.evaluate((id) => {
      const marker = document.querySelector(`[data-observation-id="${id}"]`).getBoundingClientRect()
      const svg = document.querySelector('[data-site-diagram-svg]').getBoundingClientRect()
      return marker.left >= svg.left - 1 && marker.right <= svg.right + 1 && marker.top >= svg.top - 1 && marker.bottom <= svg.bottom + 1
    }, observedId)
    assert(markerInside, `${label}: marker outside the diagram`)
    await page.locator('[data-diagram-toggle="climate"]').click()
    assert((await page.locator(`[data-observation-id="${observedId}"]`).count()) === 0, `${label}: marker still drawn with Climate layer off`)
    await page.locator('[data-diagram-toggle="climate"]').click()

    await fillObservation('INFERRED', 'Wind probably stronger at the north edge.')
    await page.waitForFunction(() => document.querySelectorAll('[data-observation-row]').length === 2)
    assert((await page.locator('[data-count="qualified"]').textContent()) === '1', `${label}: inferred record was promoted to qualified`)
    assert((await page.locator('[data-count="held-back"]').textContent()) === '1', `${label}: inferred record not held back`)
    assert((await page.locator('[data-topic-slot="wind"]').getAttribute('data-topic-state')) === 'OBSERVED', `${label}: slot state changed by inferred record`)

    // Another module, to prove the shared record path works outside Climate.
    await page.locator('[data-site-module="urban"]').click()
    await page.locator('#site-topic').selectOption('statutory-envelope')
    await page.locator('#site-basis').selectOption('OBSERVED')
    await page.locator('#site-observed-on').fill('2026-09-18')
    await page.locator('#site-observer').fill('Evidence observer')
    await page.locator('#site-source-ref').fill('Sanction drawing SD-7')
    await page.locator('#site-note').fill('Setback table read from the cited drawing.')
    await page.locator('[data-site-add-observation]').click()
    checks.documentTopicAsObserved = (await page.locator('[data-site-error-summary]').textContent()).trim().slice(0, 140)
    assert(/cannot be OBSERVED on site/.test(checks.documentTopicAsObserved), `${label}: document topic accepted as OBSERVED`)
    await page.locator('#site-basis').selectOption('USER_PROVIDED')
    await page.locator('[data-site-add-observation]').click()
    await page.locator('[data-topic-slot="statutory-envelope"][data-topic-state="USER_PROVIDED"]').waitFor()

    // 7. No false promotion anywhere in the workspace.
    const promotion = await page.evaluate(() => {
      const root = document.querySelector('[data-site-analysis]')
      return { verifiedWord: /\bVERIFIED\b/.test(root.textContent), states: [...root.querySelectorAll('[data-observation-state]')].map((node) => node.getAttribute('data-observation-state')), gates: [...root.querySelectorAll('[data-gate]')].map((node) => node.textContent.includes('OPEN')) }
    })
    assert(!promotion.verifiedWord, `${label}: the word VERIFIED appears in the workspace`)
    assert(promotion.gates.length === 4 && promotion.gates.every(Boolean), `${label}: a professional gate is not OPEN`)
    checks.promotion = promotion

    // 8. Review, then handoff; then a change marks it STALE.
    await page.locator('[data-site-mark-reviewed]').scrollIntoViewIfNeeded()
    await page.locator('[data-site-mark-reviewed]').click()
    await page.locator('#site-reviewer-error').waitFor()
    assert(await page.locator('[data-site-send-handoff]').isDisabled(), `${label}: handoff enabled before review`)
    await page.locator('#site-reviewer').fill('Evidence reviewer')
    await page.locator('[data-site-mark-reviewed]').click()
    await page.locator('[data-review-status]').filter({ hasText: 'Reviewed by Evidence reviewer' }).waitFor()
    await page.locator('[data-site-send-handoff]').click()
    await page.locator('[data-handoff-status="CURRENT"]').waitFor()
    await page.screenshot({ path: path.join(evidenceRoot, `${viewport.width}-handoff-current.png`), animations: 'disabled' })

    // 9. Geometry and interaction audits on the populated workspace.
    await page.locator('[data-site-module="climate"]').click()
    const layout = await page.evaluate(measureLayout, '[data-site-analysis]')
    assert(layout.documentOverflow === 0, `${label}: document horizontal overflow ${layout.documentOverflow}px`)
    assert(layout.rootOverflow === 0, `${label}: workspace horizontal overflow ${layout.rootOverflow}px`)
    assert(layout.clipped.length === 0, `${label}: clipped elements ${layout.clipped.join(', ')}`)
    assert(layout.smallTargets.length === 0, `${label}: targets under 44px ${layout.smallTargets.join(', ')}`)
    checks.layout = layout

    // Hit-test every visible control after centring it: nothing (sticky header, consent, widgets) may sit on top.
    const controls = await page.locator('[data-site-analysis] button:visible, [data-site-analysis] input:visible, [data-site-analysis] select:visible, [data-site-analysis] textarea:visible').count()
    const covered = []
    for (let index = 0; index < controls; index += 1) {
      const control = page.locator('[data-site-analysis] button:visible, [data-site-analysis] input:visible, [data-site-analysis] select:visible, [data-site-analysis] textarea:visible').nth(index)
      await control.evaluate((node) => node.scrollIntoView({ block: 'center', behavior: 'instant' }))
      const hit = await control.evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        return top === node || node.contains(top) || !!top?.closest('label') ? null : `${node.tagName}#${node.id || node.textContent.trim().slice(0, 24)} covered by ${top?.tagName}.${String(top?.className).slice(0, 40)}`
      })
      if (hit) covered.push(hit)
    }
    assert(covered.length === 0, `${label}: covered controls ${covered.join(' | ')}`)
    checks.controlsHitTested = controls

    // 10. Keyboard: Tab through the whole workspace must advance and leave it (no trap); Shift+Tab must leave backwards.
    const firstToggle = page.locator('[data-diagram-toggle="sun"]')
    await firstToggle.focus()
    const seen = []
    let left = false
    let consecutive = 0
    for (let step = 0; step < 400; step += 1) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => ({ dateInput: document.activeElement?.tagName === 'INPUT' && document.activeElement.type === 'date', inside: !!document.activeElement?.closest('[data-site-analysis]'), id: (() => { const parts = []; for (let node = document.activeElement; node && node !== document.body; node = node.parentElement) parts.push(`${node.tagName}${[...node.parentElement.children].indexOf(node)}`); return parts.join('/') })() }))
      if (!info.inside) { left = true; break }
      // A native date input legitimately holds focus across its day/month/year segments (at most three Tab presses).
      const same = seen.length > 0 && seen[seen.length - 1] === info.id
      consecutive = same ? consecutive + 1 : 0
      if (same && !(info.dateInput && consecutive <= 3)) {
        throw new Error(`${label}: keyboard focus did not advance at ${info.id}`)
      }
      seen.push(info.id)
    }
    assert(left, `${label}: keyboard focus never left the workspace in 400 Tab presses (trap)`)
    await firstToggle.focus()
    await page.keyboard.press('Shift+Tab')
    const backOut = await page.evaluate(() => document.activeElement?.getAttribute('data-diagram-toggle') !== 'sun')
    assert(backOut, `${label}: Shift+Tab did not move focus off the first control`)
    checks.keyboard = { tabStopsInside: seen.length, leftForward: left, shiftTabMovedBack: backOut }

    // 11. Change the evidence after the handoff: STALE in LandIntel, then STALE in DesignStudio.
    await page.locator('[data-site-module="urban"]').click()
    await page.locator('#site-topic').selectOption('adjacent-buildings')
    await page.locator('#site-basis').selectOption('OBSERVED')
    await page.locator('#site-observed-on').fill('2026-09-18')
    await page.locator('#site-observer').fill('Evidence observer')
    await page.locator('#site-source-ref').fill('Field sheet FS-13')
    await page.locator('[data-site-use-map-point]').click()
    await page.locator('#site-note').fill('Two-storey neighbour on the east side.')
    await page.locator('[data-site-add-observation]').click()
    await page.locator('[data-handoff-status="STALE"]').waitFor()
    checks.staleAfterChange = (await page.locator('[data-site-handoff-state]').textContent()).trim()
    assert(/^STALE/.test(checks.staleAfterChange), `${label}: handoff not STALE after change`)
    await workspace.screenshot({ path: path.join(evidenceRoot, `${viewport.width}-workspace-stale.png`), animations: 'disabled' })

    const design = await context.newPage()
    const designErrors = []
    design.on('pageerror', (error) => designErrors.push(error.message))
    await design.goto(`${baseUrl}/products/designstudio`, { waitUntil: 'domcontentloaded' })
    await dismissConsent(design)
    const panel = design.locator('[data-site-analysis-context]')
    await panel.waitFor({ state: 'attached' })
    await panel.scrollIntoViewIfNeeded()
    await design.locator('[data-site-context-stale]').waitFor()
    checks.designStudioStale = (await design.locator('[data-site-context-stale]').textContent()).trim().slice(0, 160)
    assert((await design.locator('[data-site-analysis-context] button').count()) === 0, `${label}: DesignStudio panel has a state-changing control`)
    assert(!/Steady breeze/.test(await panel.textContent()), `${label}: DesignStudio shows stale records`)
    const designLayout = await design.evaluate(measureLayout, '[data-site-analysis-context]')
    assert(designLayout.documentOverflow === 0 && designLayout.rootOverflow === 0, `${label}: DesignStudio panel overflow ${JSON.stringify(designLayout)}`)
    await panel.screenshot({ path: path.join(evidenceRoot, `${viewport.width}-designstudio-stale.png`), animations: 'disabled' })
    assert(designErrors.length === 0, `${label}: DesignStudio page errors ${designErrors.join(' | ')}`)
    await design.close()

    assert(pageErrors.length === 0, `${label}: page errors: ${pageErrors.join(' | ')}`)
    results.push({ viewport, httpStatus: response.status(), ...checks, consoleErrors, pageErrors, httpErrors })
    await context.close()
  }
} finally {
  await browser.close()
}

const report = { generatedAt: new Date().toISOString(), baseUrl, widths, results }
await writeFile(path.join(evidenceRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ viewports: results.length, summary: results.map((item) => ({ width: item.viewport.width, consoleErrors: item.consoleErrors.length, httpErrors: item.httpErrors.length, controlsHitTested: item.controlsHitTested, keyboard: item.keyboard, staleAfterChange: item.staleAfterChange })) }, null, 2))
