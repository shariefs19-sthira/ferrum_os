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

// Bounding-box occlusion: the Minimize control's rect must not intersect the
// visible rect of ANY readable text (Range client rects of every text node in
// the SUTRA surface, clipped by clipping ancestors) at ANY scroll position.
// The scrollers are swept in 24px steps (outer scroller x inner log top/bottom)
// so the check cannot pass just because the text happened to be scrolled away.
// A hit test at the button centre cannot catch text running under its edge.
async function checkOcclusion(page, vp, surface, mode, rootSelector, scrollers) {
  const o = await page.evaluate(([sel, scrollerSels]) => {
    const root = document.querySelector(sel)
    const btn = root?.querySelector('[data-sutra-minimize]')
    if (!root || !btn) return { ok: false, error: 'root or Minimize missing', positions: 0, overlaps: [] }
    const els = scrollerSels.map((q) => document.querySelector(q)).filter(Boolean)
    const measure = () => {
      const b = btn.getBoundingClientRect()
      const hits = []
      let texts = 0
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim() || btn.contains(node)) continue
        const el = node.parentElement
        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('.sr-only,[hidden]')) continue
        const range = document.createRange(); range.selectNodeContents(node)
        for (const q of range.getClientRects()) {
          if (q.width < 1 || q.height < 1) continue
          let l = q.left, t = q.top, r = q.right, bt = q.bottom
          for (let n = el; n && n !== document.body; n = n.parentElement) {
            const s2 = getComputedStyle(n)
            if (s2.overflowX !== 'visible' || s2.overflowY !== 'visible') { const c = n.getBoundingClientRect(); l = Math.max(l, c.left); t = Math.max(t, c.top); r = Math.min(r, c.right); bt = Math.min(bt, c.bottom) }
            // A fixed box escapes every ancestor's overflow clip (it is clipped only by the viewport), so stop here.
            if (s2.position === 'fixed') break
          }
          if (r <= l || bt <= t) continue
          texts++
          const ix = Math.min(r, b.right) - Math.max(l, b.left), iy = Math.min(bt, b.bottom) - Math.max(t, b.top)
          if (ix > 0.5 && iy > 0.5) hits.push({ text: node.textContent.trim().slice(0, 40), rect: [l, t, r, bt].map(Math.round) })
        }
      }
      return { hits, texts, minimize: [b.left, b.top, b.right, b.bottom].map(Math.round) }
    }
    const max = (el) => Math.max(0, el.scrollHeight - el.clientHeight)
    const overlaps = []
    let positions = 0, minTexts = Infinity, minimize = null
    const outer = els[0], inner = els[1]
    const outerSteps = outer ? [...new Set([0, ...Array.from({ length: Math.floor(max(outer) / 24) }, (_, i) => (i + 1) * 24), max(outer)])] : [0]
    for (const y of outerSteps) {
      if (outer) outer.scrollTop = y
      for (const innerTop of inner ? [true, false] : [true]) {
        if (inner) inner.scrollTop = innerTop ? 0 : max(inner)
        const m = measure()
        positions++; minTexts = Math.min(minTexts, m.texts); minimize = m.minimize
        for (const h of m.hits) overlaps.push({ outerScroll: y, innerTop, ...h })
      }
    }
    for (const el of els) el.scrollTop = 0
    return { ok: overlaps.length === 0 && minTexts > 0, positions, minTexts, minimize, overlaps: overlaps.slice(0, 5) }
  }, [rootSelector, scrollers])
  check(vp, surface, `Minimize bbox never intersects readable text across scroll positions (${mode})`, o.ok, JSON.stringify(o))
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
    await checkOcclusion(page, name, W, mode, '[data-sutra-region]', ['[data-sutra-panel]', '[data-sutra-messages]'])
    // Evidence frame: the state a user is in when deciding - confirmation scrolled into view.
    await page.locator('[data-sutra-pending-confirm]').evaluate((el) => el.scrollIntoView({ block: 'nearest' }))
    await page.waitForTimeout(100)
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
    await checkOcclusion(page, name, H, mode, '[data-sutra]', ['[data-sutra-chrome]', '[data-sutra-messages]'])
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
