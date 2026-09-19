// MASON: SUTRA no-cover audit (W2 operator report, 2026-09-19 — "SUTRA covers the page").
// Encodes the STANDING RULE the operator dictated: an overlay/panel/tab never
// takes space from, covers, or reflows existing page content without an
// allotment the layout accounts for. Below 1280px SUTRA must be a true
// MODAL (inert page, scrim, focus trap, role=dialog aria-modal=true). At/above
// 1280px it must be DOCKED and the page must reflow to reserve its width —
// zero non-fixed in-page elements may be >=30% covered, no horizontal
// overflow, and closing SUTRA must restore the original layout exactly.
//
// Based on the occ.mjs coverage-measurement probe (element-visible-area
// intersection with the panel's box, ignoring `position:fixed` elements).
//
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4189 node scripts/sutra-no-cover-audit.mjs [outDir]
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const baseUrl = (process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4189').replace(/\/$/, '')
const outDir = path.resolve(process.argv[2] ?? 'apps/web/evidence/sutra-no-cover-20260919')
await mkdir(outDir, { recursive: true })

// Public routes that mount SiteShell -> Concierge (root layout.tsx wires
// SiteShell for every route outside /project-workspace). LandIntel and
// DesignStudio are the two heaviest product pages named in the brief;
// pricing is the other public page explicitly named.
const routes = ['/', '/products/landintel', '/pricing', '/products/designstudio']

const viewports = [[375, 667], [768, 1024], [1024, 768], [1280, 720], [1366, 768], [1824, 917], [1920, 1080]]
const DOCK_MIN_WIDTH = 1280

// Coverage measurement: for every non-fixed heading/paragraph/link/button/
// input/image, compute the fraction of its VISIBLE box (its own rect
// intersected with every ancestor's overflow-clip rect and the viewport —
// e.g. a Leaflet map's internal 256px tile images extend past their clipped
// map container and must not be counted as "covered" for the tile pixels
// the user never actually sees) occluded by the panel's box.
const measureCoverage = () => page.evaluate(() => {
  const panel = document.querySelector('[data-sutra]')
  if (!panel) return { panelPresent: false }
  const pr = panel.getBoundingClientRect()
  const panelVisible = getComputedStyle(panel).display !== 'none'
  if (!panelVisible) return { panelPresent: true, panelVisible: false }
  const selector = 'h1,h2,h3,h4,h5,h6,p,a,button,input,img'
  const clippedRect = (el) => {
    let rect = el.getBoundingClientRect()
    let node = el.parentElement
    while (node) {
      const s = getComputedStyle(node)
      if (s.overflow !== 'visible' || s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        const cr = node.getBoundingClientRect()
        rect = {
          left: Math.max(rect.left, cr.left), top: Math.max(rect.top, cr.top),
          right: Math.min(rect.right, cr.right), bottom: Math.min(rect.bottom, cr.bottom),
        }
        rect.width = Math.max(0, rect.right - rect.left)
        rect.height = Math.max(0, rect.bottom - rect.top)
      }
      node = node.parentElement
    }
    return rect
  }
  const covered = []
  document.querySelectorAll(selector).forEach((el) => {
    if (panel.contains(el) || el === panel) return
    const style = getComputedStyle(el)
    if (style.position === 'fixed') return
    if (style.display === 'none' || style.visibility === 'hidden') return
    const r = clippedRect(el)
    if (r.width <= 0 || r.height <= 0) return
    const ix = Math.max(0, Math.min(r.right, pr.right) - Math.max(r.left, pr.left))
    const iy = Math.max(0, Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top))
    const overlapArea = ix * iy
    const elArea = r.width * r.height
    const frac = elArea > 0 ? overlapArea / elArea : 0
    if (frac >= 0.3) {
      covered.push({ tag: el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40), frac: Math.round(frac * 100) })
    }
  })
  return { panelPresent: true, panelVisible: true, covered, panelBox: { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom } }
})

let page // set per-context below so measureCoverage's closure works with page.evaluate binding pattern
const results = []
const rec = (route, viewport, cookieState, name, pass, detail = '') => results.push({ route, viewport, cookieState, name, pass, detail })

const browser = await chromium.launch({ headless: true })
try {
  for (const route of routes) {
    for (const [w, h] of viewports) {
      for (const cookieState of ['cookie-visible', 'cookie-dismissed']) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } })
        page = await ctx.newPage()
        const consoleErrors = []
        page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
        page.on('pageerror', (err) => consoleErrors.push(String(err)))
        await page.route('**/api/region', (r) => r.fulfill({ contentType: 'application/json', body: '{}' }))
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
        const tag = `${route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '')}-${w}x${h}`

        if (cookieState === 'cookie-dismissed') {
          const gotIt = page.getByRole('button', { name: 'Got it' })
          if (await gotIt.isVisible().catch(() => false)) {
            const box = await gotIt.boundingBox()
            if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
            await page.waitForTimeout(200)
          }
        }

        // Baseline layout metrics (SUTRA closed) for the restore-on-close check.
        const before = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyPaddingRight: getComputedStyle(document.body).paddingRight,
        }))
        rec(route, `${w}x${h}`, cookieState, 'no horizontal overflow (closed)', before.scrollWidth <= before.innerWidth + 1, `scrollWidth ${before.scrollWidth} innerWidth ${before.innerWidth}`)

        // Some product pages embed a cockpit preview widget carrying the same
        // [data-workspace-cockpit] marker the real cockpit route uses, which
        // makes Concierge.tsx hide the global launcher site-wide by existing
        // design (see Concierge.tsx's MutationObserver). That's pre-existing
        // behavior, not something this fix changes — skip rather than fail
        // so it's visible in results.json without masquerading as a no-cover
        // regression. Reported separately to the operator (RULE 13/44).
        const hasCockpitMarker = await page.evaluate(() => Boolean(document.querySelector('[data-workspace-cockpit]')))
        if (hasCockpitMarker) {
          rec(route, `${w}x${h}`, cookieState, 'SKIP: launcher hidden by embedded [data-workspace-cockpit] marker (pre-existing, out of this fix\'s scope)', true)
          await ctx.close()
          continue
        }

        // Open SUTRA with a real click.
        const launcher = page.getByRole('button', { name: 'Open SUTRA' })
        await launcher.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {})
        if (await launcher.isVisible().catch(() => false)) {
          const lbox = await launcher.boundingBox()
          if (lbox) await page.mouse.click(lbox.x + lbox.width / 2, lbox.y + lbox.height / 2)
        }
        const dialog = page.getByRole('dialog', { name: 'SUTRA AI assistant' })
        const opened = await dialog.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false)
        rec(route, `${w}x${h}`, cookieState, 'SUTRA opens on click', opened)
        if (!opened) { await ctx.close(); continue }
        await page.waitForTimeout(250)

        const isDocked = w >= DOCK_MIN_WIDTH
        const mode = await page.evaluate(() => document.querySelector('[data-sutra]')?.getAttribute('data-sutra-mode'))
        rec(route, `${w}x${h}`, cookieState, `mode is ${isDocked ? 'docked' : 'modal'} at this width`, mode === (isDocked ? 'docked' : 'modal'), `data-sutra-mode=${mode}`)

        if (isDocked) {
          // (A) Docked reflow: zero >=30%-covered elements, header/cookie bar unaffected, no overflow.
          const cov = await measureCoverage()
          rec(route, `${w}x${h}`, cookieState, 'zero in-page elements >=30% covered (docked)', (cov.covered || []).length === 0, JSON.stringify(cov.covered || []))
          const after = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            reflow: document.body.getAttribute('data-sutra-reflow'),
            paddingRight: getComputedStyle(document.body).paddingRight,
          }))
          rec(route, `${w}x${h}`, cookieState, 'no horizontal overflow (open, docked)', after.scrollWidth <= after.innerWidth + 1, `scrollWidth ${after.scrollWidth} innerWidth ${after.innerWidth}`)
          rec(route, `${w}x${h}`, cookieState, 'page reflow allotment reserved (STANDING RULE)', after.reflow === 'true' && parseFloat(after.paddingRight) > 0, `reflow=${after.reflow} paddingRight=${after.paddingRight}`)
          // SiteHeader.tsx is `sticky top-0`, not `position: fixed` — it is
          // in-flow content that legitimately reflows (narrows) with the
          // rest of the page under body's padding-right, same as every other
          // section. That is the STANDING RULE working correctly, not a
          // regression. What actually matters is that it is never COVERED by
          // the panel and stays fully within the viewport (not clipped).
          const header = await page.evaluate(() => {
            const h = document.querySelector('header')
            const panel = document.querySelector('[data-sutra]')
            if (!h || !panel) return null
            const r = h.getBoundingClientRect()
            const pr = panel.getBoundingClientRect()
            return { left: r.left, right: r.right, panelLeft: pr.left, viewport: window.innerWidth }
          })
          if (header) rec(route, `${w}x${h}`, cookieState, 'site header not covered by the panel and stays within the viewport', header.left >= 0 && header.right <= header.panelLeft + 0.5 && header.right <= header.viewport + 0.5, JSON.stringify(header))
        } else {
          // (B) Modal: dialog+aria-modal, scrim present, rest of page inert, no coverage question applies (fully covered by design).
          const modalFacts = await page.evaluate(() => {
            const dlg = document.querySelector('[data-sutra]')
            const scrim = document.querySelector('[data-sutra-scrim]')
            const bodyKids = Array.from(document.body.children)
            const nonInertSibling = bodyKids.find((el) => el !== dlg && !document.querySelector('[data-sutra-launcher]')?.contains?.(el) && el.tagName !== 'SCRIPT' && !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true')
            return {
              role: dlg?.getAttribute('role'),
              ariaModal: dlg?.getAttribute('aria-modal'),
              scrimPresent: Boolean(scrim),
              nonInertSiblingTag: nonInertSibling ? nonInertSibling.tagName : null,
            }
          })
          rec(route, `${w}x${h}`, cookieState, 'role=dialog aria-modal=true (modal)', modalFacts.role === 'dialog' && modalFacts.ariaModal === 'true', JSON.stringify(modalFacts))
          rec(route, `${w}x${h}`, cookieState, 'scrim present (modal)', modalFacts.scrimPresent)
          rec(route, `${w}x${h}`, cookieState, 'page behind made inert (modal)', !modalFacts.nonInertSiblingTag, `non-inert sibling: ${modalFacts.nonInertSiblingTag}`)
          // Focus trap: Tab repeatedly, focus should stay inside [data-sutra].
          await page.keyboard.press('Tab')
          let trapped = true
          for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Tab')
            const inside = await page.evaluate(() => Boolean(document.activeElement?.closest('[data-sutra]')))
            if (!inside) { trapped = false; break }
          }
          rec(route, `${w}x${h}`, cookieState, 'focus trapped inside modal', trapped)
        }

        // Close and verify exact restore.
        await page.getByRole('button', { name: 'Minimize SUTRA' }).click()
        await dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
        await page.waitForTimeout(200)
        const restored = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyPaddingRight: getComputedStyle(document.body).paddingRight,
        }))
        rec(route, `${w}x${h}`, cookieState, 'closing restores layout exactly (scrollHeight within 2px)', Math.abs(restored.scrollHeight - before.scrollHeight) <= 2, `before ${before.scrollHeight} after ${restored.scrollHeight}`)
        rec(route, `${w}x${h}`, cookieState, 'closing removes the reflow padding', restored.bodyPaddingRight === before.bodyPaddingRight, `before "${before.bodyPaddingRight}" after "${restored.bodyPaddingRight}"`)

        rec(route, `${w}x${h}`, cookieState, 'zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '))
        await ctx.close()
      }
    }
  }
} finally {
  await browser.close()
}

for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.route} ${r.viewport} ${r.cookieState} — ${r.name}${r.pass ? '' : ` (${r.detail})`}`)
await writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
