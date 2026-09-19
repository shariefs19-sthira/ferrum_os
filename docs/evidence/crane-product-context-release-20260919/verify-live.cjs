const path = require('path')
const fs = require('fs')
const { chromium } = require('D:/ferrum_os_recovered/.claude/worktrees/crane-release-product-context-20260919/apps/web/node_modules/playwright')
const BASE = 'https://ferrumos-preview.shariefsatyala.workers.dev'
const OUT = 'D:/ferrum_os_recovered/.claude/worktrees/crane-release-product-context-20260919/tmp-live-evidence'
fs.mkdirSync(OUT, { recursive: true })
const widths = [320, 390, 768, 1024, 1366, 1440]
const products = ['Land', 'Design', 'Structure', 'Cost', 'Market', 'Procure']
const results = []
const fails = []
const check = (ok, tag, msg) => { if (!ok) { fails.push(`${tag}: ${msg}`) } return ok }

;(async () => {
  let browser
  try { browser = await chromium.launch({ headless: true }) } catch { browser = await chromium.launch({ channel: 'chrome', headless: true }) }
  for (const w of widths) {
    for (const product of products) {
      const tag = `${product}@${w}`
      const ctx = await browser.newContext({ viewport: { width: w, height: w >= 1024 ? 768 : w >= 768 ? 1024 : 800 }, acceptDownloads: true })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', e => errors.push(e.message))
      await page.goto(`${BASE}/project-workspace/cockpit?product=${product}`, { waitUntil: 'load', timeout: 90000 })
      await page.evaluate(() => window.localStorage.setItem('ferrum-cookie-consent', 'accepted'))
      await page.reload({ waitUntil: 'load', timeout: 90000 })
      await page.locator('[data-cockpit-canvas]').first().waitFor({ timeout: 90000 })
      await page.waitForTimeout(1200)
      const r = { tag }
      // header vs toolbar
      r.geo = await page.evaluate(() => {
        const hdrEl = document.querySelector('header[aria-label="Workspace app bar"]'); const hb = hdrEl ? hdrEl.getBoundingClientRect().bottom : -1
        const bar = document.querySelector('[role=tablist][aria-label="Model views"]')
        const bb = bar ? bar.getBoundingClientRect() : null
        const c = document.querySelector('[data-cockpit-canvas]').getBoundingClientRect()
        const cx = Math.min(Math.max(c.left + c.width / 2, 0), innerWidth - 1), cy = Math.min(Math.max(c.top + Math.min(c.height, innerHeight - c.top) / 2, 0), innerHeight - 1)
        const hit = document.elementFromPoint(cx, cy)
        return { fixedHeaderBottom: Math.round(hb), toolbarTop: bb ? Math.round(bb.top) : null, toolbarBottom: bb ? Math.round(bb.bottom) : null, canvasVisibleH: Math.round(Math.max(0, Math.min(c.bottom, innerHeight) - Math.max(c.top, 0))), canvasCenterHitInsideCanvas: !!(hit && document.querySelector('[data-cockpit-canvas]').contains(hit)), hitTag: hit ? (hit.tagName + (hit.getAttribute('data-sutra') !== null ? '[sutra]' : '')) : null, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }
      })
      check(r.geo.fixedHeaderBottom > 0, tag, 'app bar not found'); check(r.geo.toolbarTop !== null, tag, 'Model views toolbar missing')
      check(r.geo.toolbarTop === null || r.geo.toolbarTop >= r.geo.fixedHeaderBottom - 0.5, tag, `toolbar top ${r.geo.toolbarTop} < fixed header bottom ${r.geo.fixedHeaderBottom}`)
      check(r.geo.canvasVisibleH >= 120, tag, `canvas visible ${r.geo.canvasVisibleH}px`)
      check(r.geo.canvasCenterHitInsideCanvas, tag, `canvas centre obstructed by ${r.geo.hitTag}`)
      check(!r.geo.overflow, tag, 'horizontal overflow')
      // product-specific tool
      const trig = page.locator('[data-product-tool-trigger]')
      const surf = page.locator('[data-product-tool-surface]')
      r.tool = { triggerCount: await trig.count(), triggerText: (await trig.count()) ? (await trig.first().innerText()).trim() : null, triggerState: (await trig.count()) ? await trig.first().getAttribute('data-product-tool-trigger') : null, surfaceCount: await surf.count() }
      if (r.tool.surfaceCount) { r.tool.surfaceText = (await surf.first().innerText()).replace(/\s+/g, ' ').slice(0, 160) }
      if (product === 'Design') check(r.tool.triggerCount === 0 && r.tool.surfaceCount === 0, tag, 'Design must show no product tool')
      else check(r.tool.triggerCount + r.tool.surfaceCount > 0, tag, 'product tool/ROADMAP entry missing')
      // open tool on small widths through real click and re-check model unobstructed after close
      if (w < 1280 && r.tool.triggerCount) {
        await trig.first().click(); await page.waitForTimeout(400)
        const ov = await page.evaluate(() => { const c = document.querySelector('[data-cockpit-canvas]').getBoundingClientRect(); const t = document.querySelector('[data-product-tool-surface]'); if (!t || getComputedStyle(t).display === 'none') return { overlap: 0, shown: false }; const b = t.getBoundingClientRect(); return { shown: true, overlap: Math.round(Math.max(0, Math.min(c.right, b.right) - Math.max(c.left, b.left)) * Math.max(0, Math.min(c.bottom, b.bottom) - Math.max(c.top, b.top))) } })
        r.toolOpen = ov
        check(ov.overlap === 0, tag, `tool pane overlaps model ${ov.overlap}px`)
        await page.screenshot({ path: `${OUT}/${product.toLowerCase()}-${w}-tool-open.png` })
        await trig.first().click().catch(() => {}); await page.waitForTimeout(200)
      }
      // Export (real click, download)
      const dxf = page.locator('[data-export-dxf]').first()
      if (await dxf.count()) {
        await dxf.scrollIntoViewIfNeeded().catch(() => {})
        try { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }), dxf.click({ timeout: 8000 })]); r.exportDxf = dl.suggestedFilename() } catch (e) { r.exportDxf = 'FAIL ' + e.message.split('\n')[0] }
        check(/\.dxf$/i.test(r.exportDxf || ''), tag, `DXF export: ${r.exportDxf}`)
      } else check(false, tag, 'Export DXF button absent')
      await page.evaluate(() => window.scrollTo(0, 0))
      // SUTRA opens by real click
      const launcher = page.locator('header[aria-label="Workspace app bar"] button', { hasText: /^SUTRA$/ }).first()
      const panel = page.locator('[aria-label="SUTRA design assistant"]').first()
      try { r.sutraInitiallyOpen = await panel.isVisible(); await launcher.click({ timeout: 8000 }); await page.waitForTimeout(500); if (!(await panel.isVisible())) { await launcher.click({ timeout: 8000 }); await page.waitForTimeout(500) } await panel.waitFor({ state: 'visible', timeout: 8000 }); r.sutra = 'opened'; r.sutraInput = await page.locator('#sutra-command').first().isVisible().catch(() => false) } catch (e) { r.sutra = 'FAIL ' + e.message.split(String.fromCharCode(10))[0] }
      check(r.sutra === 'opened', tag, `SUTRA: ${r.sutra}`)
      await page.screenshot({ path: `${OUT}/${product.toLowerCase()}-${w}-sutra-open.png` })
      check(errors.length === 0, tag, `page errors ${errors.join('|')}`)
      r.errors = errors.length
      results.push(r)
      console.log(JSON.stringify(r))
      await ctx.close()
    }
  }
  await browser.close()
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, results, fails }, null, 2))
  console.log(fails.length ? `FAILS (${fails.length}):\n` + fails.join('\n') : `ALL PASS (${results.length} product×width checks)`)
  process.exit(fails.length ? 1 : 0)
})()
