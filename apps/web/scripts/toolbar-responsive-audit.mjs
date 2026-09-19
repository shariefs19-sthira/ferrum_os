// F4 rendered audit: model-view toolbar actions must be fully visible (wrapped, not clipped),
// >=44px, and really clickable at 320-1440; product tool pane never overlaps the model;
// the 1024/1366 rail Select/Measure/Compare stay topmost with SUTRA open and closed.
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:3111").replace(/\/$/, "")
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440]
const products = ["Design", "Land", "Structure", "Cost", "Market", "Procure"]
const out = fileURLToPath(new URL("../evidence/toolbar-f4-20260919/", import.meta.url))
const assert = (ok, msg) => { if (!ok) throw new Error(msg) }
const launch = async () => { try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) } }

async function open(browser, width, product) {
  const page = await browser.newPage({ viewport: { width, height: width >= 1024 ? 768 : width >= 768 ? 1024 : 800 } })
  page.on("pageerror", (e) => { page.__errors = [...(page.__errors || []), e.message] })
  await page.goto(`${baseUrl}/project-workspace/cockpit?product=${product}`, { waitUntil: "load", timeout: 120000 })
  await page.evaluate(() => window.localStorage.setItem("ferrum-cookie-consent", "accepted"))
  await page.reload({ waitUntil: "load", timeout: 120000 })
  await page.locator("[data-cockpit-canvas]").first().waitFor({ timeout: 120000 })
  await page.waitForTimeout(600)
  return page
}

const visibleCanvasH = (page) => page.locator("[data-cockpit-canvas]").evaluate((el) => { const b = el.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(b.bottom, innerHeight) - Math.max(b.top, 0))) })

await mkdir(out, { recursive: true })
const browser = await launch()
const report = []
try {
  for (const width of widths) {
    for (const product of products) {
      const page = await open(browser, width, product)
      const tag = `${product}@${width}`
      const bar = page.locator('[role=tablist][aria-label="Model views"]')
      const info = await bar.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const items = [...el.querySelectorAll("button, label")].filter((n) => n.getBoundingClientRect().width > 0)
        return {
          height: r.height, clipped: el.scrollWidth > el.clientWidth + 1, vw: innerWidth,
          items: items.map((n) => { const b = n.getBoundingClientRect(); return { name: (n.getAttribute("aria-label") || n.textContent || n.tagName).trim().slice(0, 30), l: b.left, r: b.right, w: b.width, h: b.height } }),
        }
      })
      assert(!info.clipped, `${tag}: toolbar horizontally clipped`)
      for (const i of info.items) {
        assert(i.l >= -0.5 && i.r <= info.vw + 0.5, `${tag}: "${i.name}" outside viewport (${Math.round(i.l)}-${Math.round(i.r)} of ${info.vw})`)
        assert(i.h >= 43.5 && i.w >= 43.5, `${tag}: "${i.name}" target ${Math.round(i.w)}x${Math.round(i.h)} < 44`)
      }
      // real clicks: every model view tab, fullscreen (enter + exit), copy link
      const tabs = bar.locator("[role=tab]")
      const n = await tabs.count()
      for (let k = 0; k < n; k++) { await tabs.nth(k).click(); assert((await tabs.nth(k).getAttribute("aria-selected")) === "true", `${tag}: tab ${k} not selected after click`) }
      const canvasH = await visibleCanvasH(page)
      assert(canvasH >= 120, `${tag}: building view not visible (${canvasH}px)`)
      const fs = bar.locator("[data-fullscreen-toggle]")
      if (await fs.count()) {
        const before = await fs.getAttribute("aria-pressed")
        await fs.click(); await page.waitForTimeout(250); assert((await fs.getAttribute("aria-pressed")) !== before, `${tag}: fullscreen click had no effect`)
        await fs.click(); await page.waitForTimeout(250); assert((await fs.getAttribute("aria-pressed")) === before, `${tag}: fullscreen did not toggle back`)
      }
      await bar.locator("[data-view-permalink]").click()
      await page.waitForTimeout(150)
      assert(!(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)), `${tag}: page horizontal overflow`)
      // product tool: below lg open via trigger; the pane must not overlap the model
      const trig = page.locator("[data-product-tool-trigger]")
      let overlap = 0
      if (width < 1280 && (await trig.count())) await trig.click()
      if (await page.locator("[data-product-tool-surface]").count()) {
        await page.waitForTimeout(200)
        overlap = await page.evaluate(() => {
          const c = document.querySelector("[data-cockpit-canvas]").getBoundingClientRect(); const t = document.querySelector("[data-product-tool-surface]")
          if (getComputedStyle(t).display === "none") return 0
          const b = t.getBoundingClientRect()
          return Math.round(Math.max(0, Math.min(c.right, b.right) - Math.max(c.left, b.left)) * Math.max(0, Math.min(c.bottom, b.bottom) - Math.max(c.top, b.top)))
        })
        assert(overlap === 0, `${tag}: tool pane overlaps model by ${overlap}px`)
        const cH = await visibleCanvasH(page)
        assert(cH >= 120, `${tag}: model hidden by open tool (${cH}px)`)
        const bad = await page.locator("[data-product-tool-surface] :is(button,input,select,textarea,summary)").evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => { e.scrollIntoView({ block: "center" }); const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return t && (t === e || e.contains(t) || t.contains(e)) ? null : e.outerHTML.slice(0, 80) }).filter(Boolean))
        assert(bad.length === 0, `${tag}: blocked tool controls ${bad.join(" | ")}`)
      }
      await page.evaluate(() => document.querySelectorAll("*").forEach((e) => { if (e.scrollTop) e.scrollTop = 0 }))
      await page.screenshot({ path: resolve(out, `${product.toLowerCase()}-${width}.png`) })
      assert(!(page.__errors || []).length, `${tag}: page errors ${(page.__errors || []).join(" | ")}`)
      report.push({ tag, toolbarH: Math.round(info.height), items: info.items.length, canvasVisibleH: canvasH, toolOverlapPx: overlap })
      console.log(`PASS ${tag} toolbarH=${Math.round(info.height)} items=${info.items.length} canvasH=${canvasH} overlap=${overlap}`)
      await page.close()
    }
  }
  // rail Select/Measure/Compare topmost, SUTRA closed and open, at 1024/1366
  for (const width of [1024, 1366]) {
    for (const sutra of ["closed", "open"]) {
      const page = await open(browser, width, "Land")
      if (sutra === "open") { await page.evaluate(() => window.dispatchEvent(new CustomEvent("ferrum:open-sutra"))); await page.waitForTimeout(500) }
      const res = await page.evaluate(() => ["Select", "Measure", "Compare"].map((label) => {
        const el = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === label && b.getBoundingClientRect().width > 0)
        if (!el) return { label, found: false, top: false }
        const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
        return { label, found: true, top: Boolean(t && (t === el || el.contains(t) || t.contains(el))) }
      }))
      for (const r of res) assert(r.found && r.top, `rail ${r.label}@${width} sutra ${sutra}: found=${r.found} topmost=${r.top}`)
      for (const label of ["Select", "Measure", "Compare"]) await page.locator("button:visible", { hasText: new RegExp(`^${label}$`) }).first().click({ timeout: 4000 })
      await page.screenshot({ path: resolve(out, `rail-${width}-${sutra}.png`) })
      report.push({ rail: width, sutra, controls: res })
      console.log(`PASS rail@${width} sutra=${sutra} ${res.map((r) => `${r.label}:${r.top}`).join(" ")}`)
      await page.close()
    }
  }
  await writeFile(resolve(out, "report.json"), JSON.stringify({ baseUrl, results: report }, null, 2))
  console.log(`ALL PASS (${report.length} checks)`)
} finally { await browser.close() }
