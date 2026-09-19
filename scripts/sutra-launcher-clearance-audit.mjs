// MASON: SUTRA launcher clearance audit. With the cookie bar visible and after
// dismissing it (real click), the closed launcher must not cover the cookie
// "Got it" control or any hero CTA (elementFromPoint at every control centre),
// must sit fully above the cookie bar, and must drop back to the base offset
// once the bar's --cookie-consent-h resets.
//   FERRUM_AUDIT_BASE_URL=http://127.0.0.1:4189 node scripts/sutra-launcher-clearance-audit.mjs [outDir]
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const baseUrl = (process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4189').replace(/\/$/, '')
const outDir = path.resolve(process.argv[2] ?? 'docs/evidence/sutra-launcher-clearance')
await mkdir(outDir, { recursive: true })
const viewports = [[320, 568], [375, 667], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1440, 900]]

const measure = () => {
  const L = document.querySelector('button[aria-label="Open SUTRA"]')
  const banner = document.querySelector('[data-cookie-consent]')
  if (!L) return { launcherMissing: true, dialogOpen: Boolean(document.querySelector('[role="dialog"][aria-label="SUTRA AI assistant"]:not([hidden])')), cookieVar: document.documentElement.style.getPropertyValue('--cookie-consent-h'), vh: innerHeight, hero: [], launcher: [0, 0, 0, 0], bannerTop: null, cookie: null }
  const lr = L.getBoundingClientRect()
  const hitOf = (el) => { const r = el.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t === el || el.contains(t) }
  const overlaps = (a, b) => a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom
  const btn = banner?.querySelector('button')
  const cookie = btn ? { hit: hitOf(btn), overlap: overlaps(lr, btn.getBoundingClientRect()) } : null
  const bannerTop = banner ? banner.getBoundingClientRect().top : null
  const hero = [...document.querySelectorAll('[data-project-first-hero] a, [data-project-first-hero] button')].map((el) => {
    const r = el.getBoundingClientRect()
    const visible = r.width > 0 && r.bottom > 0 && r.top < innerHeight
    const rg = document.createRange(); rg.selectNodeContents(el); const t = rg.getBoundingClientRect()
    // A CTA is "covered" when the launcher hits its centre or its label text; a mere edge overlap of empty button padding is reported separately as edge.
    return { name: (el.textContent || '').trim().slice(0, 24), visible, hit: hitOf(el), overlap: visible && (L.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)) || overlaps(lr, t)), edge: visible && overlaps(lr, r) }
  })
  return { launcher: [Math.round(lr.left), Math.round(lr.top), Math.round(lr.right), Math.round(lr.bottom)], vh: innerHeight, bannerTop, cookie, hero, cookieVar: document.documentElement.style.getPropertyValue('--cookie-consent-h') }
}

const results = []
const browser = await chromium.launch({ headless: true })
try {
  for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    await page.route('**/api/region', (r) => r.fulfill({ contentType: 'application/json', body: '{}' }))
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-cookie-consent]')
    await page.waitForTimeout(300)
    const tag = `${w}x${h}`
    const rec = (state, m, extra = []) => {
      const p = [...extra]
      if (m.launcherMissing) p.push('SUTRA launcher gone: the click meant for Got it opened SUTRA instead')
      if (m.cookie && (m.cookie.overlap || !m.cookie.hit)) p.push(`launcher covers Got it (overlap=${m.cookie.overlap} hit=${m.cookie.hit})`)
      if (m.bannerTop != null && m.launcher[3] > m.bannerTop + 0.5) p.push(`launcher bottom ${m.launcher[3]} below banner top ${m.bannerTop}`)
      m.hero.filter((r) => r.overlap).forEach((r) => p.push(`launcher covers hero CTA centre/label "${r.name}"`))
      results.push({ viewport: tag, state, pass: p.length === 0, problems: p, edges: m.hero.filter((r) => r.edge && !r.overlap).map((r) => r.name), launcher: m.launcher, bannerTop: m.bannerTop, cookieVar: m.cookieVar })
    }
    await page.evaluate(() => scrollTo(0, 0))
    rec('cookie-visible', await page.evaluate(measure))
    await page.screenshot({ path: path.join(outDir, `${tag}-cookie-visible.png`) })
    // Real mouse click at the Got it centre — must reach the button, not the launcher.
    const box = await page.locator('[data-cookie-consent] button').boundingBox()
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    const dismissed = await page.waitForSelector('[data-cookie-consent]', { state: 'detached', timeout: 1500 }).then(() => true, () => false)
    await page.waitForTimeout(200)
    const m2 = await page.evaluate(measure)
    rec('cookie-dismissed', m2, [
      ...(dismissed ? [] : ['real click on Got it did not dismiss the bar']),
      ...(m2.cookieVar === '' ? [] : [`--cookie-consent-h not reset: ${m2.cookieVar}`]),
      ...(m2.vh - m2.launcher[3] < 23.5 ? [`launcher bottom gap ${m2.vh - m2.launcher[3]} < 24 after dismiss`] : []),
    ])
    await page.screenshot({ path: path.join(outDir, `${tag}-cookie-dismissed.png`) })
    await ctx.close()
  }
} finally { await browser.close() }
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.viewport} ${r.state} launcher=${JSON.stringify(r.launcher)} bannerTop=${r.bannerTop} ${r.problems.join('; ')}${r.edges?.length ? ' [edge-only overlap of empty padding: ' + r.edges.join(', ') + ']' : ''}`)
await writeFile(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2))
const fails = results.filter((r) => !r.pass)
console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
