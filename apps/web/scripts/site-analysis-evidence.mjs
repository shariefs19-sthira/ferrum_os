import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

// Rendered real-click acceptance for the LandIntel Site analysis workspace.
// Runs headless and isolated (AGENTS.md RULE 28). Every interaction is a real
// Playwright click/keyboard/typing event against the running app; nothing
// mutates state through evaluate() except read-only measurements.

// Flags (all optional, after the base URL):
//   --labels-only          run only the label-collision matrix (36 viewport x radius cells); this is the
//                          quick re-check CRANE runs against the deployed edge.
//   --report-only          record every measurement and screenshot but do not throw on a violation, so a
//                          BEFORE build can be measured in full. The exit code is 1 if any violation exists.
//   --evidence-dir=<path>  write screenshots/JSON there instead of evidence/site-analysis.
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const flagValue = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
const baseUrl = (args.find((arg) => !arg.startsWith('--')) || process.env.SITE_ANALYSIS_URL || 'http://127.0.0.1:3117').replace(/\/$/, '')
const labelsOnly = flag('labels-only')
const reportOnly = flag('report-only')
const evidenceRoot = path.resolve(flagValue('evidence-dir') || path.join('evidence', 'site-analysis'))
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
    const gotIt = consent.getByRole('button', { name: 'Got it' })
    // A pointer click can be intercepted where the SUTRA launcher sits over the cookie bar (an older
    // stacking defect present in earlier builds); fall back to a real keyboard activation so the
    // measurement still reaches the diagram. Still a genuine user input event.
    const clicked = await gotIt.click({ timeout: 5_000 }).then(() => true).catch(() => false)
    if (!clicked) {
      await gotIt.focus()
      await page.keyboard.press('Enter')
    }
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
  for (const viewport of labelsOnly ? [] : viewports) {
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

    // Two records now share the map point: the grouped ×N count, the "Map point" label, the topic label and the
    // anchor crosshair must not overlap in rendered SVG bounding boxes (CRANE 1cbdb579: 12x11px at 320, 24x26px wider).
    await page.locator('[data-observation-count]').waitFor()
    const boxes = await page.evaluate(() => {
      const box = (element) => { const r = element.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom } }
      // The ×N badge is a diagram-level sibling of the marker <g> (placed by the label-collision solver),
      // so it carries the record id directly instead of being found via .closest().
      const recordId = document.querySelector('[data-observation-count]').getAttribute('data-observation-count-for')
      const group = document.querySelector(`g[data-observation-id="${recordId}"]`)
      const parts = {
        count: document.querySelector('[data-observation-count]'),
        mapPointLabel: document.querySelector('[data-site-anchor-label]'),
        // The topic label is rendered by the general label-collision solver as a diagram-level sibling
        // (not nested inside the marker's own <g>), so it's found by its data-diagram-label id.
        topicLabel: document.querySelector(`[data-diagram-label="module-${recordId}"]`),
        glyph: group.querySelector('path'),
        crosshair: document.querySelector('[data-site-anchor] path'),
      }
      return Object.fromEntries(Object.entries(parts).map(([name, element]) => [name, element ? box(element) : null]))
    })
    assert(Object.values(boxes).every(Boolean), `${label}: missing overlap-audit element ${JSON.stringify(boxes)}`)
    const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    const pairs = [['count', 'mapPointLabel'], ['count', 'topicLabel'], ['mapPointLabel', 'topicLabel'], ['mapPointLabel', 'glyph'], ['mapPointLabel', 'crosshair']]
    checks.groupedLabelOverlapPx = Object.fromEntries(pairs.map(([a, b]) => [`${a}/${b}`, Math.round(overlap(boxes[a], boxes[b]) * 10) / 10]))
    assert(Object.values(checks.groupedLabelOverlapPx).every((area) => area <= 1), `${label}: grouped-record label collision ${JSON.stringify(checks.groupedLabelOverlapPx)}`)
    const countHeight = boxes.count.bottom - boxes.count.top
    const labelHeight = boxes.mapPointLabel.bottom - boxes.mapPointLabel.top
    assert(countHeight >= 10.5 && labelHeight >= 10.5, `${label}: count ${countHeight}px / Map point label ${labelHeight}px render too small`)
    const svgRect = await page.locator('[data-site-diagram-svg]').boundingBox()
    assert(boxes.mapPointLabel.left >= svgRect.x && boxes.count.right <= svgRect.x + svgRect.width, `${label}: count or Map point label leaves the diagram`)
    await page.locator('[data-site-diagram-svg]').screenshot({ path: path.join(evidenceRoot, `${viewport.width}-diagram-grouped.png`), animations: 'disabled' })

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

// --- Label-collision acceptance matrix --------------------------------------
// Reproduces the exact scenario from the site-label defect report — a wind record and a second (site
// climate) record both at the map point (they stack into one grouped x2 marker), plus a shadow record about
// 26 m away (12.97640, 77.58990) — and asserts ZERO overlap between any two text labels, between a label and
// any marker glyph or the crosshair, at every required viewport and every radius. Every pair's overlap is
// measured (px, from getBoundingClientRect) and written to label-overlap-report.json. Read-only measurement;
// evaluate() never mutates state.
const matrixViewports = [
  { width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 844 },
  { width: 414, height: 896 }, { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 },
]
const matrixRadii = [50, 100, 250, 500]
const MIN_LABEL_PX = 9.5

function measureDiagramOverlaps() {
  const svg = document.querySelector('[data-site-diagram-svg]')
  const svgRect = svg.getBoundingClientRect()
  const box = (r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom })
  const texts = [...svg.querySelectorAll('text')]
    .map((node) => ({ kind: 'text', name: node.textContent, rect: box(node.getBoundingClientRect()), fontPx: Number.parseFloat(node.getAttribute('font-size') || getComputedStyle(node).fontSize) * (svgRect.width / 400) }))
    .filter((entry) => entry.rect.right > entry.rect.left)
  // Glyph paths: every marker glyph plus the crosshair. (The N compass arrow and legend icons are not in scope.)
  const glyphs = [...svg.querySelectorAll('g[data-observation-id] path, [data-site-anchor] path')]
    .map((node, index) => ({ kind: 'glyph', name: node.closest('[data-site-anchor]') ? 'crosshair' : `marker-${index}`, rect: box(node.getBoundingClientRect()) }))
  const items = [...texts, ...glyphs]
  const overlapPx = (a, b) => ({
    width: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)),
    height: Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
  })
  const pairs = []
  // Two markers may legitimately coincide (a record plotted exactly at the map point sits on the crosshair):
  // glyph-vs-glyph is out of scope. Every pair involving at least one text label is measured.
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].kind === 'glyph' && items[j].kind === 'glyph') continue
      const { width, height } = overlapPx(items[i].rect, items[j].rect)
      pairs.push({ a: `${items[i].kind}:${items[i].name}`, b: `${items[j].kind}:${items[j].name}`, overlapWidthPx: Math.round(width * 10) / 10, overlapHeightPx: Math.round(height * 10) / 10, overlapAreaPx2: Math.round(width * height * 10) / 10 })
    }
  }
  const compassN = texts.find((entry) => entry.name === 'N')
  const compassCropped = !compassN || compassN.rect.left < svgRect.left - 0.5 || compassN.rect.right > svgRect.right + 0.5 || compassN.rect.top < svgRect.top - 0.5
  const clipped = texts.filter((entry) => entry.rect.left < svgRect.left - 0.5 || entry.rect.right > svgRect.right + 0.5 || entry.rect.top < svgRect.top - 0.5 || entry.rect.bottom > svgRect.bottom + 0.5).map((entry) => entry.name)
  return {
    pairs,
    overlapping: pairs.filter((pair) => pair.overlapAreaPx2 > 1),
    worstOverlapAreaPx2: pairs.reduce((worst, pair) => Math.max(worst, pair.overlapAreaPx2), 0),
    compassCropped,
    clipped,
    minRenderedLabelHeightPx: Math.round(Math.min(...texts.map((entry) => entry.rect.bottom - entry.rect.top).filter((h) => h > 0)) * 10) / 10,
    minFontSizePx: Math.round(Math.min(...texts.map((entry) => entry.fontPx)) * 10) / 10,
    labelCount: texts.length,
    svgWidthPx: Math.round(svgRect.width * 10) / 10,
  }
}

const overlapReport = []
const violations = []
const check = (condition, message) => {
  if (condition) return
  violations.push(message)
  if (!reportOnly) throw new Error(message)
}
const matrixBrowser = await launchBrowser()
try {
  for (const viewport of matrixViewports) {
    const context = await matrixBrowser.newContext({ viewport })
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
    const label = `matrix ${viewport.width}x${viewport.height}`

    const response = await page.goto(`${baseUrl}/products/landintel`, { waitUntil: 'domcontentloaded' })
    assert(response && response.status() < 400, `${label}: HTTP ${response?.status() ?? 'none'}`)
    await dismissConsent(page)
    await page.waitForSelector('[data-parcel-map-stage]', { state: 'visible' })
    consoleErrors.length = 0

    await page.locator('[data-find-parcel-toolbar]').getByRole('button', { name: 'Coordinates', exact: true }).click()
    await page.getByLabel('Latitude', { exact: true }).first().fill('12.9762')
    await page.getByLabel('Longitude', { exact: true }).first().fill('77.5896')
    await page.getByRole('button', { name: 'Set coordinates' }).click()
    await page.locator('[data-selected-point]').filter({ hasText: '12.97620' }).waitFor()
    await page.getByRole('tab', { name: 'Site analysis' }).click()
    await page.locator('[data-site-diagram-svg]').waitFor({ state: 'visible' })

    const addRecord = async (topic, source) => {
      await page.locator('#site-topic').selectOption(topic)
      await page.locator('#site-basis').selectOption('OBSERVED')
      await page.locator('#site-observed-on').fill('2026-09-18')
      await page.locator('#site-observer').fill('Evidence observer')
      await page.locator('#site-source-ref').fill('Field sheet FS-12')
      if (source === 'map-point') {
        await page.locator('[data-site-use-map-point]').click()
      } else {
        await page.locator('#site-lat').fill(String(source.lat))
        await page.locator('#site-lng').fill(String(source.lng))
      }
      await page.locator('#site-note').fill(`Evidence record — ${topic}.`)
      await page.locator('[data-site-add-observation]').click()
    }
    await addRecord('wind', 'map-point')
    await page.locator('[data-observation-row]').first().waitFor()
    await addRecord('site-climate', 'map-point')
    await page.waitForFunction(() => document.querySelectorAll('[data-observation-row]').length === 2)
    await addRecord('shadow', { lat: 12.9764, lng: 77.5899 })
    await page.waitForFunction(() => document.querySelectorAll('[data-observation-row]').length === 3)

    for (const radiusM of matrixRadii) {
      await page.locator('#site-diagram-radius').selectOption(String(radiusM))
      await page.locator('[data-site-diagram-svg] [data-observation-id]').first().waitFor()
      const measurement = await page.evaluate(measureDiagramOverlaps)
      const cell = `${label} r${radiusM}m`
      check(measurement.overlapping.length === 0, `${cell}: label overlaps ${JSON.stringify(measurement.overlapping)}`)
      check(!measurement.compassCropped, `${cell}: compass N cropped`)
      check(measurement.clipped.length === 0, `${cell}: labels clipped at SVG edge ${measurement.clipped.join(', ')}`)
      check(measurement.minRenderedLabelHeightPx >= MIN_LABEL_PX, `${cell}: smallest label renders ${measurement.minRenderedLabelHeightPx}px tall, below ${MIN_LABEL_PX}px`)
      overlapReport.push({ viewport, radiusM, ...measurement })
      await page.locator('[data-site-diagram-svg]').screenshot({ path: path.join(evidenceRoot, `overlap-${viewport.width}x${viewport.height}-r${radiusM}.png`), animations: 'disabled' })
    }
    check(consoleErrors.length === 0, `${label}: console errors ${consoleErrors.join(' | ')}`)
    await context.close()
  }
} finally {
  await matrixBrowser.close()
}
await writeFile(path.join(evidenceRoot, 'label-overlap-report.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, matrixViewports, matrixRadii, violations, overlapReport }, null, 2)}\n`)
const matrixSummary = {
  labelOverlapMatrix: overlapReport.length,
  cellsWithOverlap: overlapReport.filter((entry) => entry.overlapping.length > 0).length,
  pairsOverlapping: overlapReport.reduce((sum, entry) => sum + entry.overlapping.length, 0),
  worstOverlapAreaPx2: overlapReport.reduce((worst, entry) => Math.max(worst, entry.worstOverlapAreaPx2), 0),
  minRenderedLabelHeightPx: Math.min(...overlapReport.map((entry) => entry.minRenderedLabelHeightPx)),
  minFontSizePx: Math.min(...overlapReport.map((entry) => entry.minFontSizePx)),
  compassCroppedCells: overlapReport.filter((entry) => entry.compassCropped).length,
  clippedCells: overlapReport.filter((entry) => entry.clipped.length > 0).length,
  violations: violations.length,
}
console.log(JSON.stringify(matrixSummary, null, 2))
if (labelsOnly) process.exit(violations.length > 0 ? 1 : 0)
if (violations.length > 0) process.exitCode = 1

const report = { generatedAt: new Date().toISOString(), baseUrl, widths, results }
await writeFile(path.join(evidenceRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ viewports: results.length, summary: results.map((item) => ({ width: item.viewport.width, consoleErrors: item.consoleErrors.length, httpErrors: item.httpErrors.length, controlsHitTested: item.controlsHitTested, keyboard: item.keyboard, staleAfterChange: item.staleAfterChange })) }, null, 2))
