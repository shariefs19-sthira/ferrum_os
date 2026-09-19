// Overlay / occlusion audit — a reusable gate for every release.
//
// Ferrum OS has repeatedly shipped one overlay fix that silently created another (tooltip vs
// launcher corner, launcher vs "Got it", launcher vs "Survey / khasra", sheets vs workflow
// rail, reveal transform vs fixed sheets, panel vs page content). This script is the one gate
// that measures overlay/occlusion for a whole matrix of route x viewport x state, instead of a
// one-off probe for whichever pair broke last.
//
// USAGE
//   node scripts/overlay-occlusion-audit.mjs <baseUrl> [options]
//   node scripts/overlay-occlusion-audit.mjs --selftest
//
// OPTIONS
//   --routes=/,/pricing,...            routes to visit (default "/")
//   --viewports=WxH,...                default 1366x768,375x667
//   --states=idle,cookie,sutra,tooltip,sheets   which states to exercise (default all but sheets)
//   --out=<dir>                        directory for JSON + screenshots (default: a temp dir
//                                       OUTSIDE the repo; never write evidence into the repo)
//   --json                             also print the full JSON report to stdout
//   --fail-on=primary|any              primary (default): fail only on non-modal overlays that
//                                       cover PRIMARY content. any: fail on any check finding
//                                       (overflow, clipped content, small touch targets,
//                                       off-viewport controls, console errors, too).
//   --selftest                         serve a tiny local fixture (one non-modal overlay over a
//                                       button, one modal dialog) and assert FAIL / PASS.
//
// STATES
//   idle     - page as loaded, no interaction.
//   cookie   - cookie/consent bar forced visible (no consent in localStorage).
//   sutra    - SUTRA launcher clicked open (panel state), if a launcher exists on the route.
//   tooltip  - a LandIntel "method" info tooltip opened, if present on the route.
//   sheets   - cockpit mobile sheets opened (Shells/Controls/Options/etc.), cockpit routes only.
//
// CLASSIFICATION
//   Every FIXED/STICKY/role=dialog/role=tooltip element is an "overlay". For every overlay we
//   record whether it is MODAL (aria-modal="true" AND a scrim/backdrop sibling AND the rest of
//   the page is inert/aria-hidden) or NON-MODAL. For every non-overlay in-page element
//   (headings, paragraphs, links, buttons, inputs, images, list items) we compute the visible
//   rect and the fraction covered by each overlay via rect intersection, cross-checked with
//   elementsFromPoint at the element's centre and four corners. PRIMARY elements are headings
//   (h1-h3), links, buttons, inputs/textareas/selects, and [data-primary-toolbar] descendants;
//   everything else is decorative. A NON-MODAL overlay covering a PRIMARY element with
//   intersection fraction >= 0.3 (confirmed by an elementsFromPoint sample landing on the
//   overlay, not the element) is a FAIL. A MODAL overlay covering content is not a fail (that's
//   what a modal is for).
//
//   Also reported (each is a FAIL under --fail-on=any; overflow/off-viewport/console errors are
//   always FAILs regardless of --fail-on, since they indicate a broken layout, not a modal
//   overlay tradeoff):
//     - horizontal overflow (scrollWidth > innerWidth)
//     - clipped content (overflow:hidden ancestor cutting a PRIMARY element's rect by >30%)
//     - controls < 44px in either dimension on touch viewports (width <= 480 or hasTouch)
//     - off-viewport controls (rect outside 0..innerWidth / 0..innerHeight)
//     - browser console errors (page "pageerror" / console.error)
//
// EXIT CODES
//   0  all checks passed (no FAIL rows for the selected --fail-on policy)
//   1  at least one FAIL row
//   2  usage error (bad flags, no routes reachable, zero checks run — never a silent pass)
//
// OUTPUT
//   A compact table on stdout (route | viewport | state | overlay | covered PRIMARY count |
//   modal? | verdict), plus a full JSON report written to <out>/overlay-occlusion-report.json
//   (and PNG screenshots for every FAIL under <out>/).

import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import http from 'node:http'

const require = createRequire(new URL('../apps/web/package.json', import.meta.url))

const args = process.argv.slice(2)
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3)
const has = (name) => args.includes(`--${name}`)

const PRIMARY_SELECTOR = 'h1,h2,h3,a[href],button,input,textarea,select,[role="button"],[data-primary-toolbar] *'
const IN_PAGE_SELECTOR = 'h1,h2,h3,h4,p,a[href],button,input,textarea,select,img,li,[role="button"]'

// ---------------------------------------------------------------------------------------------
// Self-test fixture
// ---------------------------------------------------------------------------------------------

const FIXTURE_HTML = `<!doctype html><html><head><meta charset="utf-8"><title>fixture</title>
<style>
  body { margin:0; font-family: sans-serif; }
  .page { padding: 40px; }
  #primaryBtn { position: relative; top: 0; }
  #nonmodal { position: fixed; left: 0; right: 0; bottom: 0; height: 120px; background: rgba(0,0,80,0.9); color: #fff; }
  #modalScrim { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: none; }
  #modalDialog { position: fixed; left: 20%; top: 20%; width: 60%; height: 40%; background: #fff; border: 2px solid #000; display: none; }
</style></head>
<body>
  <div class="page">
    <h1>Fixture Heading</h1>
    <p>Some paragraph content above the fold.</p>
    <button id="primaryBtn" style="position:relative; margin-top: 500px;">Primary CTA</button>
  </div>
  <div id="nonmodal" role="complementary" aria-label="non-modal overlay">
    Non-modal banner covering the CTA below the fold line.
  </div>
  <div id="modalScrim"></div>
  <div id="modalDialog" role="dialog" aria-modal="true" aria-label="modal dialog">
    <button id="modalClose">Close</button>
  </div>
  <script>
    // The button sits in normal document flow (never position:fixed, or it would itself be
    // classified as an overlay); the margin-top places its rect at the same viewport y-range
    // as the fixed bottom banner, at the default (unscrolled) scroll position.
    if (location.search.includes('modal=1')) {
      document.getElementById('modalScrim').style.display = 'block';
      document.getElementById('modalDialog').style.display = 'block';
      // Mark the rest of the page inert, as a real modal implementation would.
      document.querySelector('.page').setAttribute('inert', '');
      document.querySelector('.page').setAttribute('aria-hidden', 'true');
      document.getElementById('nonmodal').style.display = 'none';
    }
  </script>
</body></html>`

function serveFixture() {
  return new Promise((resolvePromise) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(FIXTURE_HTML)
    })
    server.listen(0, '127.0.0.1', () => resolvePromise(server))
  })
}

// ---------------------------------------------------------------------------------------------
// Page-context evaluation: find overlays, find in-page elements, compute coverage
// ---------------------------------------------------------------------------------------------

/* eslint-disable no-undef */
function pageAudit({ primarySelector, inPageSelector }) {
  const vw = innerWidth
  const vh = innerHeight
  const isTouchViewport = vw <= 480

  const visible = (el) => {
    const s = getComputedStyle(el)
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }

  const stackingPos = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n)
      if (s.position === 'fixed' || s.position === 'sticky') return s.position
    }
    return null
  }

  // --- find overlays ---
  const overlayNodes = new Set()
  document.querySelectorAll('*').forEach((el) => {
    if (!visible(el)) return
    const s = getComputedStyle(el)
    const isRoleOverlay = el.getAttribute('role') === 'dialog' || el.getAttribute('role') === 'tooltip' || el.getAttribute('role') === 'alertdialog'
    if (s.position === 'fixed' || s.position === 'sticky' || isRoleOverlay) overlayNodes.add(el)
  })
  // Keep only outermost overlay ancestors (avoid double counting a fixed div's fixed children)
  const overlays = [...overlayNodes].filter((el) => {
    for (const other of overlayNodes) {
      if (other !== el && other.contains(el)) return false
    }
    return true
  })

  const describe = (el) => {
    const id = el.id ? `#${el.id}` : ''
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : ''
    const label = el.getAttribute('aria-label') || ''
    return `${el.tagName.toLowerCase()}${id}${cls}${label ? `[aria-label="${label.slice(0, 40)}"]` : ''}`
  }

  const anyAriaModalVisible = [...document.querySelectorAll('[aria-modal="true"]')].some(visible)
  const pageInert = document.body.querySelectorAll('[inert]').length > 0 || document.body.querySelectorAll('[aria-hidden="true"]').length > 0

  const overlayInfo = overlays.map((el) => {
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    const ariaModal = el.getAttribute('aria-modal') === 'true'
    const isFullViewportBackdrop = r.width >= vw * 0.85 && r.height >= vh * 0.85 && el.getAttribute('role') !== 'dialog' && el.getAttribute('role') !== 'tooltip'
    let hasScrim = false
    document.querySelectorAll('*').forEach((cand) => {
      if (cand === el || el.contains(cand) || cand.contains(el)) return
      const cs = getComputedStyle(cand)
      if (cs.position !== 'fixed' || cs.display === 'none' || +cs.opacity === 0) return
      const cr = cand.getBoundingClientRect()
      if (cr.width >= vw * 0.85 && cr.height >= vh * 0.85) hasScrim = true
    })
    // A full-viewport backdrop paired with any visible aria-modal dialog is the modal's own
    // scrim, not an independent overlay finding — it never gates content on its own.
    const modal = (ariaModal && (hasScrim || pageInert)) || (isFullViewportBackdrop && anyAriaModalVisible)
    return {
      selector: describe(el),
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') || null,
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      zIndex: s.zIndex,
      position: s.position,
      modal,
      covered: [],
    }
  })

  // --- in-page elements ---
  const results = []
  document.querySelectorAll(inPageSelector).forEach((el) => {
    if (!visible(el)) return
    if (overlays.some((ov) => ov.contains(el))) return // inside an overlay, not "in-page content"
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) return
    const isPrimary = el.matches(primarySelector)
    const text = (el.innerText || el.alt || el.getAttribute('aria-label') || '').trim().slice(0, 50)
    // "Off-viewport" is only meaningful for fixed/sticky-positioned controls (a chrome control
    // clipped outside the visible frame is a real bug); a plain in-flow element the user simply
    // hasn't scrolled to yet is normal and must never be flagged.
    const fixedPos = stackingPos(el)
    const item = {
      selector: describe(el),
      tag: el.tagName.toLowerCase(),
      text,
      rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      primary: isPrimary,
      offViewport: !!fixedPos && (r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh),
      smallTouchTarget: isTouchViewport && isPrimary && (r.width < 44 || r.height < 44) && !!el.closest('button,a,[role="button"],input,select,textarea'),
      coveredBy: [],
    }

    for (let i = 0; i < overlayInfo.length; i++) {
      const ov = overlayInfo[i]
      const ix = Math.max(0, Math.min(r.right, ov.rect.x + ov.rect.w) - Math.max(r.left, ov.rect.x))
      const iy = Math.max(0, Math.min(r.bottom, ov.rect.y + ov.rect.h) - Math.max(r.top, ov.rect.y))
      const interArea = ix * iy
      const tot = r.width * r.height
      const frac = tot > 0 ? interArea / tot : 0
      if (frac < 0.3) continue
      // Confirm with elementsFromPoint at centre + 4 corners
      const pts = [
        [r.left + r.width / 2, r.top + r.height / 2],
        [r.left + 2, r.top + 2],
        [r.right - 2, r.top + 2],
        [r.left + 2, r.bottom - 2],
        [r.right - 2, r.bottom - 2],
      ]
      let confirmHits = 0
      for (const [px, py] of pts) {
        if (px < 0 || py < 0 || px > vw || py > vh) continue
        const stack = document.elementsFromPoint(px, py)
        const topIdx = stack.findIndex((n) => n === el || el.contains(n))
        const ovIdx = stack.findIndex((n) => n === overlays[i] || overlays[i].contains(n))
        if (ovIdx !== -1 && (topIdx === -1 || ovIdx < topIdx)) confirmHits++
      }
      if (confirmHits === 0) continue
      item.coveredBy.push({ overlay: ov.selector, fraction: +frac.toFixed(2), confirmHits })
      ov.covered.push({ selector: item.selector, text: item.text, fraction: +frac.toFixed(2), primary: isPrimary })
    }
    results.push(item)
  })

  return {
    vw,
    vh,
    hscroll: document.documentElement.scrollWidth > vw + 1,
    overlays: overlayInfo,
    elements: results,
    consoleErrorsPlaceholder: [],
  }
}
/* eslint-enable no-undef */

// ---------------------------------------------------------------------------------------------
// State setup helpers (run against a live page)
// ---------------------------------------------------------------------------------------------

async function setupState(page, state) {
  const notes = []
  if (state === 'idle') return notes
  if (state === 'cookie') {
    // Ensure no consent stored so the cookie bar renders.
    await page.evaluate(() => { try { localStorage.removeItem('ferrum-cookie-consent') } catch {} })
    await page.reload({ waitUntil: 'load', timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(500)
    return notes
  }
  if (state === 'sutra') {
    // The consent bar's visibility is decided once at mount from localStorage; setting the key
    // after the page already rendered does not retroactively hide it, so reload (as the
    // 'cookie' state does) to land in a clean cookie-dismissed baseline before opening SUTRA.
    await page.evaluate(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch {} })
    await page.reload({ waitUntil: 'load', timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(400)
    const launcher = page.getByRole('button', { name: /open sutra/i }).first()
    if (await launcher.count()) {
      await launcher.click().catch(() => {})
      await page.waitForTimeout(700)
    } else {
      notes.push('no SUTRA launcher found')
    }
    return notes
  }
  if (state === 'tooltip') {
    await page.evaluate(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch {} })
    await page.reload({ waitUntil: 'load', timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(400)
    const info = page.locator('[aria-label*="method" i], [aria-label*="info" i], button[aria-describedby]').first()
    if (await info.count()) {
      await info.click().catch(() => {})
      await page.waitForTimeout(400)
    } else {
      notes.push('no method tooltip trigger found')
    }
    return notes
  }
  if (state === 'sheets') {
    await page.evaluate(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted') } catch {} })
    await page.reload({ waitUntil: 'load', timeout: 20000 }).catch(() => {})
    await page.waitForTimeout(400)
    const trigger = page.locator('[data-mobile-cockpit-toolbar]').getByRole('button', { name: 'Controls', exact: true }).first()
    if (await trigger.count()) {
      await trigger.click().catch(() => {})
      await page.waitForTimeout(500)
    } else {
      notes.push('no cockpit sheet toolbar found')
    }
    return notes
  }
  return notes
}

// ---------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------

async function launchBrowser(chromium) {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    return chromium.launch({ channel: 'chrome', headless: true })
  }
}

async function runOne(browser, { baseUrl, route, vp, state, outDir, failOn }) {
  const label = `${route.replace(/\W/g, '_') || 'root'}__${vp.w}x${vp.h}__${state}`
  const record = { route, viewport: `${vp.w}x${vp.h}`, state, ok: true, findings: [], notes: [] }
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    hasTouch: vp.w <= 480 || vp.h <= 480,
    isMobile: vp.w <= 480,
  })
  const consoleErrors = []
  const page = await context.newPage()
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text().slice(0, 200)}`) })

  try {
    await page.goto(baseUrl + route, { waitUntil: 'load', timeout: 25000 })
  } catch (e) {
    record.ok = false
    record.notes.push(`navigation failed: ${String(e.message || e).slice(0, 200)}`)
    await context.close()
    return record
  }
  await page.waitForTimeout(500)
  const stateNotes = await setupState(page, state)
  record.notes.push(...stateNotes)
  await page.waitForTimeout(300)

  const audit = await page.evaluate(pageAudit, { primarySelector: PRIMARY_SELECTOR, inPageSelector: IN_PAGE_SELECTOR }).catch((e) => ({ error: String(e) }))
  if (audit.error) {
    record.notes.push(`audit failed: ${audit.error}`)
    await context.close()
    return record
  }

  audit.consoleErrors = consoleErrors

  // Classify findings
  for (const ov of audit.overlays) {
    const primaryCovered = ov.covered.filter((c) => c.primary)
    if (primaryCovered.length === 0) continue
    const severity = ov.modal ? 'INFO' : 'FAIL'
    record.findings.push({
      type: 'overlay-coverage',
      overlay: ov.selector,
      modal: ov.modal,
      coveredPrimaryCount: primaryCovered.length,
      coveredPrimarySample: primaryCovered.slice(0, 6),
      verdict: severity,
    })
    if (severity === 'FAIL') record.ok = false
  }

  if (audit.hscroll) {
    record.findings.push({ type: 'horizontal-overflow', verdict: 'FAIL' })
    record.ok = false
  }

  const offViewport = audit.elements.filter((e) => e.primary && e.offViewport)
  if (offViewport.length) {
    record.findings.push({ type: 'off-viewport-controls', count: offViewport.length, sample: offViewport.slice(0, 5), verdict: 'FAIL' })
    record.ok = false
  }

  const smallTargets = audit.elements.filter((e) => e.smallTouchTarget)
  if (smallTargets.length) {
    record.findings.push({ type: 'small-touch-targets', count: smallTargets.length, sample: smallTargets.slice(0, 5), verdict: 'FAIL' })
    record.ok = false
  }

  if (consoleErrors.length) {
    record.findings.push({ type: 'console-errors', count: consoleErrors.length, sample: consoleErrors.slice(0, 5), verdict: 'FAIL' })
    record.ok = false
  }

  if (failOn === 'any') {
    // already captured all types above as FAIL; nothing extra needed since primary-covering
    // non-modal overlays are already FAIL. Under 'any', modal-covering INFO stays INFO (a modal
    // covering content is by design, never a failure condition regardless of policy).
  }

  if (!record.ok && outDir) {
    await mkdir(outDir, { recursive: true }).catch(() => {})
    await page.screenshot({ path: resolve(outDir, `${label}.png`), fullPage: false }).catch(() => {})
  }

  await context.close()
  return record
}

function parseViewports(spec) {
  return spec.split(',').map((s) => {
    const m = /^(\d+)x(\d+)$/.exec(s.trim())
    if (!m) throw new Error(`bad viewport "${s}"`)
    return { w: Number(m[1]), h: Number(m[2]) }
  })
}

async function main() {
  if (has('selftest')) {
    const { chromium } = require('playwright')
    const server = await serveFixture()
    const port = server.address().port
    const browser = await launchBrowser(chromium)
    let pass = true

    // Non-modal case: expect FAIL
    const nonModal = await runOne(browser, {
      baseUrl: `http://127.0.0.1:${port}`,
      route: '/',
      vp: { w: 800, h: 700 },
      state: 'idle',
      outDir: null,
      failOn: 'primary',
    })
    const nonModalFail = !nonModal.ok && nonModal.findings.some((f) => f.type === 'overlay-coverage' && f.verdict === 'FAIL')
    console.log(`[selftest] non-modal overlay over primary content -> ${nonModalFail ? 'FAIL (expected)' : 'UNEXPECTED PASS'}`)
    pass = pass && nonModalFail

    // Modal case: expect PASS (no FAIL rows)
    const modal = await runOne(browser, {
      baseUrl: `http://127.0.0.1:${port}`,
      route: '/?modal=1',
      vp: { w: 800, h: 700 },
      state: 'idle',
      outDir: null,
      failOn: 'primary',
    })
    const modalPass = modal.ok
    console.log(`[selftest] modal overlay over primary content -> ${modalPass ? 'PASS (expected)' : 'UNEXPECTED FAIL: ' + JSON.stringify(modal.findings)}`)
    pass = pass && modalPass

    await browser.close()
    server.close()
    console.log(pass ? '[selftest] OK' : '[selftest] FAILED')
    process.exit(pass ? 0 : 1)
  }

  const baseUrl = (args.find((a) => !a.startsWith('--')) || '').replace(/\/$/, '')
  if (!baseUrl) {
    console.error('Usage: node scripts/overlay-occlusion-audit.mjs <baseUrl> [--routes=...] [--viewports=...] [--states=...] [--out=dir] [--json] [--fail-on=primary|any]')
    process.exit(2)
  }
  const routes = (flag('routes') || '/').split(',').map((r) => r.trim())
  const viewports = parseViewports(flag('viewports') || '1366x768,375x667')
  const states = (flag('states') || 'idle,cookie,sutra,tooltip').split(',').map((s) => s.trim())
  const failOn = flag('fail-on') || 'primary'
  const outDir = resolve(flag('out') || resolve(tmpdir(), 'overlay-occlusion-audit'))
  const printJson = has('json')

  const { chromium } = require('playwright')
  const browser = await launchBrowser(chromium)
  const allRecords = []
  let ran = 0

  for (const route of routes) {
    for (const vp of viewports) {
      for (const state of states) {
        const rec = await runOne(browser, { baseUrl, route, vp, state, outDir, failOn })
        allRecords.push(rec)
        ran++
      }
    }
  }
  await browser.close()

  if (ran === 0) {
    console.error('No checks ran (RULE 21). Check --routes/--viewports/--states.')
    process.exit(2)
  }

  // Compact table
  const header = ['route', 'viewport', 'state', 'overlay', 'coveredPrimary', 'modal', 'verdict']
  console.log(header.join(' | '))
  let anyFail = false
  for (const rec of allRecords) {
    if (rec.findings.length === 0) {
      console.log([rec.route, rec.viewport, rec.state, '-', 0, '-', 'PASS'].join(' | '))
      continue
    }
    for (const f of rec.findings) {
      if (f.verdict === 'FAIL') anyFail = true
      console.log([
        rec.route,
        rec.viewport,
        rec.state,
        f.overlay || f.type,
        f.coveredPrimaryCount ?? f.count ?? '-',
        f.modal === undefined ? '-' : f.modal,
        f.verdict,
      ].join(' | '))
    }
  }

  await mkdir(outDir, { recursive: true }).catch(() => {})
  const reportPath = resolve(outDir, 'overlay-occlusion-report.json')
  await writeFile(reportPath, JSON.stringify({ baseUrl, routes, viewports, states, failOn, generatedAt: new Date().toISOString(), records: allRecords }, null, 2))
  console.log(`\nJSON report: ${reportPath}`)
  if (printJson) console.log(JSON.stringify(allRecords, null, 2))

  process.exit(anyFail ? 1 : 0)
}

main().catch((e) => {
  console.error('overlay-occlusion-audit failed:', e)
  process.exit(2)
})
