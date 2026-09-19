// Live-edge check of the cookie consent bar (fresh context = consent not yet accepted).
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { writeFile } from 'node:fs/promises'
const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const base = 'https://ferrumos-preview.shariefsatyala.workers.dev'
const out = path.resolve('docs/evidence/crane-cookie-release-20260919')
const widths = [[320, 640], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1440, 900]]
const routes = [['cockpit', '/project-workspace/cockpit?product=Land'], ['home', '/']]
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })
const results = []
for (const [name, route] of routes) for (const [w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 1024 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)))
  const resp = await page.goto(base + route, { waitUntil: 'load' })
  await page.waitForSelector('[data-cookie-consent]', { timeout: 15000 })
  await page.waitForTimeout(2500)
  const m = await page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom), l: Math.round(b.left), r: Math.round(b.right) } }
    const banner = document.querySelector('[data-cookie-consent]')
    const bb = r(banner)
    const vis = (el) => { const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
    const clipped = (e, x, y) => { for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p); if (/(auto|scroll|hidden|clip)/.test(o.overflowY + o.overflowX)) { const b = p.getBoundingClientRect(); if (x < b.left || x > b.right || y < b.top || y > b.bottom) return true } } return false }
    const covered = (e) => { const b = e.getBoundingClientRect(); const x = Math.min(Math.max(b.left + b.width / 2, 0), innerWidth - 1); const y = Math.min(Math.max(b.top + b.height / 2, 0), innerHeight - 1); if (b.top >= innerHeight || b.bottom <= 0) return false; if (clipped(e, x, y)) return false; const top = document.elementFromPoint(x, y); return !!top && banner.contains(top) }
    const overlaps = (a, e) => covered(e)
    const buttons = [...document.querySelectorAll('button,a[href],[role=button]')].filter((e) => !banner.contains(e) && vis(e))
    const hit = buttons.filter((e) => overlaps(r(e), e)).map((e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 40))
    const named = (re) => buttons.filter((e) => re.test((e.getAttribute('aria-label') || '') + ' ' + (e.textContent || ''))).map((e) => ({ label: (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 30), ...r(e), overlapsBanner: overlaps(r(e), e) }))
    const canvas = document.querySelector('canvas'); const shell = document.querySelector('[data-workspace-fullscreen]')
    const got = banner.querySelector('button'); const gb = got && r(got)
    return {
      banner: bb, bannerText: banner.textContent.trim().slice(0, 90), gotItBtn: gb && { ...gb, h: gb.b - gb.t },
      cssVar: getComputedStyle(document.documentElement).getPropertyValue('--cookie-consent-h'),
      innerH: innerHeight, scrollOverflowX: document.documentElement.scrollWidth - innerWidth,
      bodyPadBottom: getComputedStyle(document.body).paddingBottom,
      shell: shell && { ...r(shell), aboveBanner: r(shell).b <= bb.t + 1 },
      canvas: canvas && { ...r(canvas), overlapsBanner: overlaps(r(canvas), canvas) },
      exportButtons: named(/export/i), sutra: named(/sutra/i), model: named(/model/i).slice(0, 4),
      overlappingControls: hit,
    }
  })
  await page.screenshot({ path: path.join(out, `${name}-${w}x${h}.png`) })
  const bad = m.overlappingControls.length || m.scrollOverflowX > 0 || m.exportButtons.some((e) => e.overlapsBanner) || m.sutra.some((e) => e.overlapsBanner) || (m.shell && !m.shell.aboveBanner) || (m.canvas && m.canvas.overlapsBanner)
  results.push({ name, w, h, status: resp.status(), errors, pass: !bad, ...m })
  console.log(name, w, 'status', resp.status(), 'PASS', !bad, 'banner', JSON.stringify(m.banner), 'ovX', m.scrollOverflowX, 'overlap', JSON.stringify(m.overlappingControls), 'exp', m.exportButtons.length, 'sutra', m.sutra.length, 'var', m.cssVar.trim(), 'gotH', m.gotItBtn?.h, 'err', errors.length)
  await ctx.close()
}
await writeFile(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
await browser.close()
