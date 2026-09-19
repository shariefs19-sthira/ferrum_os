// MASON-storage: blocked / throwing browser-storage audit (RULE 44 principle:
// "browser storage may be unavailable or throw at any time; no storage access
// may crash rendering; features degrade to in-memory/session-less behaviour").
//
// Serves a static export (default apps/web/out) on an ephemeral 127.0.0.1 port
// and drives headless, isolated Chromium (RULE 28: never the operator's browser)
// with these storage variants injected via addInitScript BEFORE page load:
//   A  window.localStorage / window.sessionStorage getters throw SecurityError
//      (Chrome "block all cookies and site data")
//   B  Storage.prototype.setItem throws QuotaExceededError, getItem returns null
//   C  setItem throws only for key "ferrum-cookie-consent" (all else works)
//   N  control: normal storage (proves the audit itself passes on a healthy
//      browser and that "Got it" persists consent exactly as before)
// on /, /products/landintel, /project-workspace/cockpit?product=Land at
// 375x667 and 1366x768. Asserts per combination:
//   1. no "Application error" / "This page hit a snag" text
//   2. an h1 or the cockpit shell ([data-workspace-grid] / [data-cockpit-region]) renders
//   3. no uncaught pageerror during load
//   4. the cookie bar shows when storage is unavailable, "Got it" dismisses it
//      for the page session (in-memory), stays dismissed, and does not throw
//
//   pnpm --filter ./apps/web build
//   node scripts/storage-blocked-audit.mjs [--out apps/web/out] [--label after] [--evidence <dir>]
// Exit code 1 when any assertion fails. Results JSON + jpeg screenshots are
// written to the evidence directory.
import { createServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback
}
const outRoot = path.resolve(arg('out', path.join('apps', 'web', 'out')))
const label = arg('label', 'after')
const evidenceDir = path.resolve(arg('evidence', path.join('apps', 'web', 'evidence', 'safe-storage-20260919')))
await mkdir(evidenceDir, { recursive: true })

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.txt': 'text/plain', '.webp': 'image/webp', '.ico': 'image/x-icon' }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x')
    let file = path.join(outRoot, decodeURIComponent(url.pathname).replace(/\/+$/, ''))
    let info = await stat(file).catch(() => null)
    if (info?.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file).catch(() => null) }
    if (!info) { const alt = file + '.html'; if (await stat(alt).catch(() => null)) file = alt; else { res.writeHead(404); res.end('nf'); return } }
    res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' })
    res.end(await readFile(file))
  } catch (error) { res.writeHead(500); res.end(String(error)) }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

const variants = [
  {
    id: 'A-security-error',
    blocked: true,
    script: () => {
      for (const name of ['localStorage', 'sessionStorage']) {
        Object.defineProperty(window, name, { configurable: true, get() { throw new DOMException('denied', 'SecurityError') } })
      }
    },
  },
  {
    id: 'B-quota',
    blocked: true,
    script: () => {
      Storage.prototype.setItem = function () { throw new DOMException('quota', 'QuotaExceededError') }
      Storage.prototype.getItem = function () { return null }
    },
  },
  {
    id: 'C-consent-key-only',
    blocked: true,
    script: () => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key === 'ferrum-cookie-consent') throw new DOMException('quota', 'QuotaExceededError')
        return original.call(this, key, value)
      }
    },
  },
  { id: 'N-control-normal', blocked: false, script: () => {} },
]
const routes = [
  { id: 'home', path: '/' },
  { id: 'landintel', path: '/products/landintel' },
  { id: 'cockpit', path: '/project-workspace/cockpit?product=Land' },
]
const viewports = [
  { id: '375x667', width: 375, height: 667, touch: true },
  { id: '1366x768', width: 1366, height: 768, touch: false },
]

const results = []
const record = (key, name, pass, detail = '') => {
  results.push({ key, name, pass, detail })
  if (!pass) console.log(`FAIL ${key} :: ${name} ${detail}`)
}

const browser = await chromium.launch({ headless: true })
for (const variant of variants) {
  for (const route of routes) {
    for (const vp of viewports) {
      const key = `${variant.id} ${route.id} ${vp.id}`
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.touch, hasTouch: vp.touch, reducedMotion: 'reduce' })
      // Keep the run hermetic: only the local static server is reachable.
      await context.route(url => !url.href.startsWith(base) && !url.href.startsWith('data:') && !url.href.startsWith('blob:'), r => r.abort())
      await context.addInitScript(variant.script)
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', error => pageErrors.push(String(error && error.message ? error.message : error)))
      try {
        await page.goto(`${base}${route.path}`, { waitUntil: 'load' })
        await page.waitForTimeout(1800)
        const text = await page.evaluate(() => document.body?.innerText ?? '')
        const crashed = /Application error|This page hit a snag/i.test(text)
        record(key, 'no crash text (Application error / This page hit a snag)', !crashed, crashed ? text.slice(0, 120).replace(/\s+/g, ' ') : '')
        const shell = await page.evaluate(() => ({
          h1: document.querySelectorAll('h1').length,
          grid: document.querySelectorAll('[data-workspace-grid]').length,
          region: document.querySelectorAll('[data-cockpit-region]').length,
        }))
        record(key, 'h1 or cockpit shell renders', shell.h1 > 0 || shell.grid > 0 || shell.region > 0, JSON.stringify(shell))
        record(key, 'no uncaught pageerror on load', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))

        const bar = page.getByRole('dialog', { name: 'Cookie consent' })
        const barVisible = await bar.count().then(n => n > 0)
        if (variant.blocked) record(key, 'cookie bar shown when storage is unavailable', barVisible)
        if (barVisible) {
          const errorsBefore = pageErrors.length
          await page.getByRole('button', { name: 'Got it' }).click()
          await page.waitForTimeout(500)
          const gone = await bar.count().then(n => n === 0)
          record(key, '"Got it" dismisses the bar for the session', gone)
          record(key, '"Got it" does not throw', pageErrors.length === errorsBefore, pageErrors.slice(errorsBefore).join(' | '))
          const stored = await page.evaluate(() => { try { return window.localStorage.getItem('ferrum-cookie-consent') } catch { return 'UNREADABLE' } })
          if (!variant.blocked) record(key, 'control: consent persisted as "accepted"', stored === 'accepted', String(stored))
        } else if (!variant.blocked) {
          record(key, 'control: cookie bar shown on first visit', false)
        }
        if (variant.id.startsWith('A') || variant.id.startsWith('B')) {
          await page.screenshot({ path: path.join(evidenceDir, `${label}-${variant.id}-${route.id}-${vp.id}.jpg`), type: 'jpeg', quality: 55 })
        }
      } catch (error) {
        record(key, 'navigation/interaction completed', false, String(error).slice(0, 200))
      } finally {
        await context.close()
      }
    }
  }
}
await browser.close()
server.close()

const failed = results.filter(r => !r.pass)
const summary = { label, out: outRoot, at: new Date().toISOString(), total: results.length, passed: results.length - failed.length, failed: failed.length }
await writeFile(path.join(evidenceDir, `${label}-results.json`), JSON.stringify({ summary, results }, null, 2))
console.log(`storage-blocked-audit [${label}] total=${summary.total} passed=${summary.passed} failed=${summary.failed}`)
process.exit(failed.length ? 1 : 0)
