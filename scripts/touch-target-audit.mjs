// MASON-touch-targets: touch-target floor audit (RULE 41(1): "Touch targets are >=44px on touch devices").
//
// Measures EVERY interactive element (a, button, input, select, textarea, summary, [role="button"]) on a
// set of routes x viewports of a static export (or a live base URL) with headless, isolated Chromium
// (RULE 28: never a visible window, never the operator's profile). Each control whose border box is
// narrower OR shorter than 44 CSS px is reported with its selector path, text, region, and rect.
// Touch viewports are emulated with hasTouch/isMobile so `(pointer: coarse)` is true, exactly as on a
// phone or tablet; mouse viewports (1024x768, 1366x768, 1920x1080) keep desktop density and are
// reported but do not gate unless --floor-all is given. The mobile menu is opened wherever its button
// is visible and measured again (state "menu-open"), because the menu panel is part of the header.
//
// THIRD-PARTY ATTRIBUTION IS EXCLUDED. Map libraries render required licence attribution (Leaflet /
// OpenStreetMap "(c) OpenStreetMap contributors", MapLibre, Mapbox) as small links by convention and
// licence; they are not primary controls and must never be enlarged. They are counted in the
// "excluded" column and never reported as failures. The exact exclusion selector is
//   .leaflet-control-attribution a, .maplibregl-ctrl-attrib a, .maplibregl-ctrl-attrib-button, .mapboxgl-ctrl-attrib a
// Other gates (scripts/overlay-occlusion-audit.mjs, any release gate) should exclude the same set from
// their primary-control sets so this never shows up as a permanent false failure.
//
// --only=<scope>  GATE ONE SCOPE, REPORT THE REST.
//   <scope> is a CSS selector list. A control is "in scope" when it matches, or sits inside, an element
//   matching the selector (Element.closest). Only in-scope controls can fail the run (exit 1); every
//   other under-44 control is still measured and listed under "out of scope" (with its region, so it can
//   be queued for whichever seat owns it) but does not affect the exit code. This lets one writer prove
//   its own files clean while the rest of the site is still being fixed by others.
//   Presets:  site-chrome  ->  header.sticky.top-0, footer.bg-relume-surface
//             (the SiteHeader.tsx root and the Footer.tsx root; NOT the newsletter <footer>, which is a
//              different component; the open mobile-menu panel is inside the header, so it is in scope)
//             map-composer ->  [data-map-composer-gate]   (components/landintel/MapComposerGate.tsx)
//             lease        ->  site-chrome + map-composer  (everything this branch owns)
//   Without --only, everything is in scope (whole-site gate).
//
//   pnpm --filter ./apps/web build
//   node scripts/touch-target-audit.mjs [--out apps/web/out | --base https://host] [--label after]
//        [--evidence <dir>] [--routes /,/pricing] [--viewports 375x667,1366x768] [--only=site-chrome]
//        [--floor-all] [--shots] [--compare <before.json>] [--verbose]
//
// Exit code: 0 = no in-scope control under 44px on any gated viewport; 1 = at least one; 2 = script error.
// Output: console summary + <evidence>/touch-target-audit-<label>.json (+ header/footer jpegs with --shots).
import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const FLOOR = 44
const CONTROL_SELECTOR = 'a, button, input, select, textarea, summary, [role="button"]'
const ATTRIBUTION_EXCLUDE_SELECTOR = [
  '.leaflet-control-attribution a',
  '.maplibregl-ctrl-attrib a',
  '.maplibregl-ctrl-attrib-button',
  '.mapboxgl-ctrl-attrib a',
].join(', ')
const SCOPE_PRESETS = {
  'site-chrome': 'header.sticky.top-0, footer.bg-relume-surface',
  'map-composer': '[data-map-composer-gate]',
  lease: 'header.sticky.top-0, footer.bg-relume-surface, [data-map-composer-gate]',
}
const DEFAULT_ROUTES = ['/', '/pricing', '/products/landintel', '/products/designstudio', '/about', '/resources']
const VIEWPORTS = [
  { id: '320x568', width: 320, height: 568, touch: true },
  { id: '375x667', width: 375, height: 667, touch: true },
  { id: '414x896', width: 414, height: 896, touch: true },
  { id: '667x375L', width: 667, height: 375, touch: true },
  { id: '768x1024', width: 768, height: 1024, touch: true },
  { id: '1024x768t', width: 1024, height: 768, touch: true }, // tablet landscape, coarse pointer
  { id: '1024x768', width: 1024, height: 768, touch: false },
  { id: '1366x768', width: 1366, height: 768, touch: false },
  { id: '1920x1080', width: 1920, height: 1080, touch: false },
]
const TOP_SHOT_VIEWPORTS = new Set(['375x667', '1366x768'])

// ---------- args ----------
const argv = process.argv.slice(2)
const flag = name => argv.some(a => a === `--${name}` || a.startsWith(`--${name}=`))
const arg = (name, fallback) => {
  const eq = argv.find(a => a.startsWith(`--${name}=`))
  if (eq) return eq.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}
const outRoot = path.resolve(arg('out', path.join('apps', 'web', 'out')))
const liveBase = arg('base', '')
const label = arg('label', 'after')
const evidenceDir = path.resolve(arg('evidence', path.join('apps', 'web', 'evidence', 'touch-targets-20260919')))
const routes = arg('routes', DEFAULT_ROUTES.join(',')).split(',').map(s => s.trim()).filter(Boolean)
const vpFilter = arg('viewports', '')
const viewports = vpFilter ? VIEWPORTS.filter(v => vpFilter.split(',').map(s => s.trim()).includes(v.id)) : VIEWPORTS
const onlyRaw = arg('only', '')
const onlySelector = onlyRaw ? (SCOPE_PRESETS[onlyRaw] ?? onlyRaw) : ''
const floorAll = flag('floor-all')
const shots = flag('shots')
const verbose = flag('verbose')
const comparePath = arg('compare', '')
if (!viewports.length) { console.error('no viewports selected'); process.exit(2) }

await mkdir(evidenceDir, { recursive: true })
const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

// ---------- static server (Cloudflare-Pages-style clean URLs) ----------
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain', '.webp': 'image/webp', '.ico': 'image/x-icon' }
let server = null
let base = liveBase.replace(/\/+$/, '')
if (!base) {
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x')
      const p = decodeURIComponent(url.pathname).replace(/\/+$/, '')
      // Cloudflare-Pages clean URLs: /x -> /x (file) | /x.html | /x/index.html. A route with sub-routes has BOTH
      // x.html and an x/ directory, so a directory hit must fall through to x.html.
      let file = null
      for (const candidate of [p, `${p}.html`, path.join(p, 'index.html')]) {
        const full = path.join(outRoot, candidate)
        const info = await stat(full).catch(() => null)
        if (info?.isFile()) { file = full; break }
      }
      if (!file) { res.writeHead(404); res.end('nf'); return }
      res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
      res.end(await readFile(file))
    } catch (error) { res.writeHead(500); res.end(String(error)) }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
}

// ---------- in-page measurement ----------
const measureInPage = ({ controlSel, excludeSel, onlySel, floor }) => {
  const r1 = v => Math.round(v * 10) / 10
  const short = el => {
    const parts = []
    let node = el
    for (let depth = 0; node && node.nodeType === 1 && node !== document.body && depth < 4; depth += 1, node = node.parentElement) {
      let part = node.tagName.toLowerCase()
      if (node.id) part += `#${node.id}`
      else {
        const cls = (typeof node.className === 'string' ? node.className : '').split(/\s+/).filter(Boolean).slice(0, 2)
        if (cls.length) part += `.${cls.join('.')}`
      }
      parts.unshift(part)
    }
    return parts.join(' > ')
  }
  const controls = []
  let excluded = 0
  let total = 0
  for (const el of document.querySelectorAll(controlSel)) {
    if (el.matches(excludeSel)) { excluded += 1; continue }
    if (el.tagName === 'INPUT' && el.type === 'hidden') continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const rect = el.getBoundingClientRect()
    if ((rect.width === 0 && rect.height === 0) || (rect.width <= 1 && rect.height <= 1)) continue // hidden / sr-only
    total += 1
    const w = Math.round(rect.width * 100) / 100
    const h = Math.round(rect.height * 100) / 100
    if (w >= floor && h >= floor) continue
    const region = el.closest('header,footer,nav,main,aside,dialog,[role="dialog"],.leaflet-container,form')
    const regionCls = region && typeof region.className === 'string' ? region.className.split(/\s+/).filter(Boolean).slice(0, 2) : []
    controls.push({
      selector: short(el),
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || undefined,
      text: (el.getAttribute('aria-label') || el.innerText || el.value || el.placeholder || el.title || el.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      href: el.getAttribute('href') || undefined,
      region: region ? `${region.tagName.toLowerCase()}${region.id ? `#${region.id}` : ''}${regionCls.length ? `.${regionCls.join('.')}` : ''}` : 'body',
      inScope: onlySel ? Boolean(el.closest(onlySel)) : true,
      rect: { x: r1(rect.x), y: r1(rect.y + window.scrollY), w: r1(rect.width), h: r1(rect.height) },
    })
  }
  // layout metrics (header / footer preservation proof)
  const header = document.querySelector('header.sticky')
  const footer = document.querySelector('footer.bg-relume-surface')
  const hb = header?.getBoundingClientRect()
  const fb = footer?.getBoundingClientRect()
  const navTops = header ? [...header.querySelectorAll('nav a')].filter(a => a.getBoundingClientRect().width > 0).map(a => Math.round(a.getBoundingClientRect().top)) : []
  const logo = header?.querySelector('a[href="/"]')?.getBoundingClientRect()
  const layout = {
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    headerHeight: hb ? r1(hb.height) : null,
    headerLogoRect: logo ? { x: r1(logo.x), y: r1(logo.y), w: r1(logo.width), h: r1(logo.height) } : null,
    navRows: new Set(navTops).size,
    footerHeight: fb ? r1(fb.height) : null,
    footerTop: fb ? r1(fb.top + window.scrollY) : null,
    footerColumns: footer ? [...footer.querySelectorAll('h3')].map(h => { const b = h.getBoundingClientRect(); return { heading: h.textContent.trim(), x: r1(b.x), y: r1(b.y - fb.top) } }) : [],
    footerLinkPitches: footer ? [...footer.querySelectorAll('ul')].map(ul => { const ys = [...ul.querySelectorAll('a')].map(a => a.getBoundingClientRect().top); return ys.length > 1 ? r1((ys[ys.length - 1] - ys[0]) / (ys.length - 1)) : 0 }) : [],
  }
  return { controls, excluded, total, layout }
}

// ---------- run ----------
const results = []
const consoleIssues = []
const browser = await chromium.launch({ headless: true })
try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.touch,
      hasTouch: vp.touch,
      reducedMotion: 'reduce',
    })
    const origin = new URL(base).origin
    // Hermetic: only the audited origin (and data:/blob:) is reachable.
    await context.route(url => !url.href.startsWith(origin) && !url.href.startsWith('data:') && !url.href.startsWith('blob:'), r => r.abort())
    for (const route of routes) {
      const page = await context.newPage()
      page.on('pageerror', e => consoleIssues.push({ route, viewport: vp.id, kind: 'pageerror', text: String(e && e.message ? e.message : e).slice(0, 200) }))
      page.on('console', m => {
        if (m.type() === 'error' && !/Failed to load resource|net::ERR|ERR_FAILED|ERR_ABORTED/.test(m.text())) consoleIssues.push({ route, viewport: vp.id, kind: 'console.error', text: m.text().slice(0, 200) })
      })
      try {
        await page.goto(`${base}${route}`, { waitUntil: 'load' })
        await page.waitForTimeout(900)
        // Trigger lazy mounts (maps, below-the-fold sections), then return to the top.
        await page.evaluate(async () => {
          const step = Math.max(300, Math.floor(window.innerHeight * 0.8))
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)) }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(400)
        const args = { controlSel: CONTROL_SELECTOR, excludeSel: ATTRIBUTION_EXCLUDE_SELECTOR, onlySel: onlySelector, floor: FLOOR }
        const states = [{ state: 'closed', data: await page.evaluate(measureInPage, args) }]
        if (shots && route === routes[0]) {
          if (TOP_SHOT_VIEWPORTS.has(vp.id)) await page.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-top.jpg`), type: 'jpeg', quality: 72 })
          for (const [name, sel] of [['header', 'header.sticky'], ['footer', 'footer.bg-relume-surface']]) {
            const loc = page.locator(sel).first()
            if (await loc.count()) await loc.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-${name}.jpg`), type: 'jpeg', quality: 72 })
          }
        }
        const menuButton = page.locator('button[aria-controls="mobile-menu-panel"]')
        if (await menuButton.count() && await menuButton.first().isVisible()) {
          await menuButton.first().click()
          await page.waitForTimeout(250)
          states.push({ state: 'menu-open', data: await page.evaluate(measureInPage, args) })
          if (shots && route === routes[0] && TOP_SHOT_VIEWPORTS.has(vp.id)) await page.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-menu-open.jpg`), type: 'jpeg', quality: 72 })
        }
        // Map Composer acknowledgement checkboxes: default (both disabled) / forced-enabled + checked / keyboard focus.
        // Evidence only, taken AFTER measurement, so the forced state never leaks into the counts.
        if (shots && TOP_SHOT_VIEWPORTS.has(vp.id) && await page.locator('[data-map-composer-gate] input[type="checkbox"]').count()) {
          const row = page.locator('[data-map-composer-gate] div:has(> label input[type="checkbox"])').first()
          const boxes = page.locator('[data-map-composer-gate] input[type="checkbox"]')
          await row.scrollIntoViewIfNeeded()
          await row.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-composer-checkboxes-default.jpg`), type: 'jpeg', quality: 80 })
          await page.evaluate(() => document.querySelectorAll('[data-map-composer-gate] input[type="checkbox"]').forEach(i => i.removeAttribute('disabled')))
          await boxes.first().click({ force: true })
          await row.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-composer-checkboxes-enabled-checked.jpg`), type: 'jpeg', quality: 80 })
          await page.keyboard.press('Tab')
          await row.screenshot({ path: path.join(evidenceDir, `${label}-${vp.id}-composer-checkboxes-keyboard-focus.jpg`), type: 'jpeg', quality: 80 })
        }
        for (const { state, data } of states) {
          const gated = vp.touch || floorAll
          const under = data.controls
          results.push({
            route, viewport: vp.id, touch: vp.touch, gated, state,
            total: data.total, excludedAttribution: data.excluded,
            underInScope: under.filter(c => c.inScope).length,
            underOutOfScope: under.filter(c => !c.inScope).length,
            controls: under,
            layout: data.layout,
          })
        }
      } catch (error) {
        results.push({ route, viewport: vp.id, touch: vp.touch, gated: false, state: 'error', error: String(error && error.message ? error.message : error), controls: [] })
        console.error(`ERROR ${route} ${vp.id}: ${error && error.message ? error.message : error}`)
      } finally {
        await page.close()
      }
    }
    await context.close()
  }
} finally {
  await browser.close()
  if (server) server.close()
}

// ---------- report ----------
const pad = (v, n) => String(v).padEnd(n)
console.log(`\ntouch-target audit  floor=${FLOOR}px  label=${label}  base=${base}${onlySelector ? `\nscope (gated): ${onlySelector}` : '\nscope: whole page (no --only)'}`)
console.log(`attribution excluded: ${ATTRIBUTION_EXCLUDE_SELECTOR}\n`)
console.log(`${pad('route', 26)}${pad('viewport', 11)}${pad('state', 10)}${pad('gate', 6)}${pad('controls', 9)}${pad('under44 IN', 11)}${pad('under44 OUT', 12)}excluded-attribution`)
for (const r of results) {
  if (r.state === 'error') { console.log(`${pad(r.route, 26)}${pad(r.viewport, 11)}ERROR ${r.error}`); continue }
  console.log(`${pad(r.route, 26)}${pad(r.viewport, 11)}${pad(r.state, 10)}${pad(r.gated ? 'yes' : 'info', 6)}${pad(r.total, 9)}${pad(r.underInScope, 11)}${pad(r.underOutOfScope, 12)}${r.excludedAttribution}`)
}

const failing = results.filter(r => r.gated && r.underInScope > 0)
const errors = results.filter(r => r.state === 'error')
const key = c => `${c.region} | ${c.selector} | ${c.text}`
const collect = (rows, inScope) => {
  const m = new Map()
  for (const r of rows) for (const c of r.controls) {
    if (c.inScope !== inScope) continue
    const k = key(c)
    const e = m.get(k) ?? { ...c, seen: new Set() }
    e.seen.add(`${r.route}@${r.viewport}${r.state === 'menu-open' ? '(menu)' : ''}`)
    m.set(k, e)
  }
  return [...m.values()]
}
if (failing.length) {
  console.log(`\nFAIL: ${failing.length} gated route/viewport/state combination(s) have in-scope controls under ${FLOOR}px`)
  for (const e of collect(failing, true).slice(0, verbose ? 500 : 40)) console.log(`  IN   ${e.region} :: "${e.text}" ${e.tag}${e.href ? ` href=${e.href}` : ''} ${e.rect.w}x${e.rect.h}  [${e.selector}]  x${e.seen.size}`)
}
const outOfScope = collect(results.filter(r => r.gated), false)
if (onlySelector && outOfScope.length) {
  console.log(`\nOUT OF SCOPE (reported, not gating): ${outOfScope.length} distinct control(s) under ${FLOOR}px on gated viewports`)
  for (const e of outOfScope.slice(0, verbose ? 500 : 60)) console.log(`  OUT  ${e.region} :: "${e.text}" ${e.tag}${e.href ? ` href=${e.href}` : ''} ${e.rect.w}x${e.rect.h}  [${e.selector}]  x${e.seen.size}`)
}
if (consoleIssues.length) {
  console.log(`\nconsole/page errors (excluding blocked third-party network noise): ${consoleIssues.length}`)
  for (const c of consoleIssues.slice(0, 10)) console.log(`  ${c.route} ${c.viewport} ${c.kind}: ${c.text}`)
}
const overflow = results.filter(r => r.layout?.horizontalOverflow)
if (overflow.length) console.log(`\nHORIZONTAL OVERFLOW on ${overflow.length} combination(s): ${overflow.map(r => `${r.route}@${r.viewport}`).join(', ')}`)

// ---------- optional layout comparison against a previous run ----------
let layoutCompare = null
if (comparePath) {
  const before = JSON.parse(await readFile(path.resolve(comparePath), 'utf8'))
  const idx = new Map(before.results.filter(r => r.state === 'closed').map(r => [`${r.route}|${r.viewport}`, r.layout]))
  layoutCompare = []
  console.log(`\nlayout comparison vs ${comparePath} (closed state):`)
  console.log(`${pad('route', 26)}${pad('viewport', 11)}${pad('header h', 14)}${pad('nav rows', 10)}${pad('footer h', 18)}${pad('col x same', 11)}${pad('col y same', 11)}overflow`)
  for (const r of results.filter(x => x.state === 'closed')) {
    const b = idx.get(`${r.route}|${r.viewport}`)
    if (!b) continue
    const a = r.layout
    const sameX = JSON.stringify(a.footerColumns.map(c => c.x)) === JSON.stringify(b.footerColumns.map(c => c.x))
    const sameY = JSON.stringify(a.footerColumns.map(c => c.y)) === JSON.stringify(b.footerColumns.map(c => c.y))
    const row = { route: r.route, viewport: r.viewport, touch: r.touch, headerHeight: [b.headerHeight, a.headerHeight], navRows: [b.navRows, a.navRows], footerHeight: [b.footerHeight, a.footerHeight], columnXSame: sameX, columnYSame: sameY, overflow: a.horizontalOverflow }
    layoutCompare.push(row)
    console.log(`${pad(r.route, 26)}${pad(r.viewport, 11)}${pad(`${b.headerHeight}->${a.headerHeight}`, 14)}${pad(`${b.navRows}->${a.navRows}`, 10)}${pad(`${b.footerHeight}->${a.footerHeight}`, 18)}${pad(sameX, 11)}${pad(sameY, 11)}${a.horizontalOverflow}`)
  }
}

const jsonPath = path.join(evidenceDir, `touch-target-audit-${label}.json`)
await writeFile(jsonPath, JSON.stringify({
  generatedAt: new Date().toISOString(), floor: FLOOR, base, label, scope: onlySelector || null,
  attributionExcludeSelector: ATTRIBUTION_EXCLUDE_SELECTOR, routes, viewports: viewports.map(v => v.id),
  gatedViewports: viewports.filter(v => v.touch || floorAll).map(v => v.id),
  failingCombinations: failing.length, results, consoleIssues, layoutCompare,
}, null, 2))
console.log(`\nresults: ${jsonPath}`)
if (errors.length) { console.log(`RESULT: ERROR (${errors.length} route/viewport run(s) failed to load)`); process.exit(2) }
if (failing.length) { console.log(`RESULT: FAIL (${failing.length} combination(s))`); process.exit(1) }
console.log(`RESULT: PASS (no ${onlySelector ? 'in-scope ' : ''}control under ${FLOOR}px on ${floorAll ? 'any' : 'touch'} viewports)`)
