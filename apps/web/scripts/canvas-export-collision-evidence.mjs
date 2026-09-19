// MASON: rendered hit-test for F1 (Space3D frame painting over the Export DXF/IFC bar).
// Usage: node scripts/canvas-export-collision-evidence.mjs [baseUrl]
// Exits non-zero on any failure; missing elements are failures, never passes.
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "")
const out = fileURLToPath(new URL("../test-results/canvas-export-collision/", import.meta.url))
await mkdir(out, { recursive: true })
const cases = []
for (const width of [320, 390]) for (const height of [568, 664, 800]) cases.push({ width, height, mobile: true })
for (const [width, height] of [[768, 1024], [1024, 768], [1366, 768]]) for (const sutra of [false, true]) cases.push({ width, height, mobile: false, sutra })

async function launch() {
  try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) }
}
const browser = await launch()
const failures = []
try {
  for (const c of cases) {
    const label = `${c.width}x${c.height}${c.sutra === undefined ? "" : c.sutra ? "-sutra-open" : "-sutra-closed"}`
    const ctx = await browser.newContext({ viewport: { width: c.width, height: c.height }, isMobile: c.mobile, hasTouch: c.mobile })
    await ctx.addInitScript(() => localStorage.setItem("ferrum-cookie-consent", "accepted"))
    const page = await ctx.newPage()
    await page.goto(`${baseUrl}/project-workspace`, { waitUntil: "load" })
    await page.waitForSelector("[data-export-dxf]")
    await page.waitForSelector("[data-space-3d] canvas")
    if (c.sutra) {
      await page.evaluate(() => window.dispatchEvent(new CustomEvent("ferrum:open-sutra")))
      await page.getByRole("button", { name: /open sutra/i }).first().click({ timeout: 1500 }).catch(() => {})
      await page.waitForSelector("[data-sutra-panel]", { state: "visible", timeout: 3000 }).catch(() => {})
    }
    await page.waitForTimeout(800)
    const r = await page.evaluate(() => {
      const R = (e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom), right: Math.round(b.right) } }
      const hit = (sel) => {
        const e = document.querySelector(sel)
        if (!e) return { missing: true }
        e.scrollIntoView({ block: "nearest" })
        const b = e.getBoundingClientRect()
        const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
        const ok = !!t && (t === e || e.contains(t))
        return { rect: R(e), inViewport: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth, ok, by: ok ? undefined : (t ? `${t.tagName.toLowerCase()}[${(t.getAttribute("aria-label") || String(t.className)).slice(0, 60)}]` : "null") }
      }
      const bar = document.querySelector("[data-export-bar]")
      const canvas = document.querySelector("[data-space-3d] canvas")
      const wrap = document.querySelector("[data-cockpit-canvas]")
      const host = document.querySelector("[data-space-3d]")
      // The model may sit inside a scrolling cockpit body; only its visible (clipped) part counts.
      let clipBottom = innerHeight
      for (let n = canvas && canvas.parentElement; n && n !== document.body; n = n.parentElement) {
        const o = getComputedStyle(n).overflowY
        if (o !== "visible") clipBottom = Math.min(clipBottom, n.getBoundingClientRect().bottom)
      }
      const model = canvas ? R(canvas) : null
      if (model) { model.bottom = Math.min(model.bottom, Math.round(clipBottom)); model.h = model.bottom - model.y }
      const barR = bar ? R(bar) : null
      const cb = canvas ? canvas.getBoundingClientRect() : null
      const cx = cb ? Math.min(Math.max(cb.x + cb.width / 2, 0), innerWidth - 1) : 0
      const cy = cb ? Math.min(cb.y + (model.h) / 2, innerHeight - 1) : 0
      const top = cb ? document.elementFromPoint(cx, cy) : null
      return {
        dxf: hit("[data-export-dxf]"), ifc: hit("[data-export-ifc]"), model, bar: barR,
        wrap: wrap ? R(wrap) : null, host: host ? R(host) : null,
        modelHitOk: !!top && (top === canvas || host.contains(top) || (top.closest && !!top.closest("[data-space-3d-frame]"))),
        modelHitBy: top ? `${top.tagName.toLowerCase()}[${(top.getAttribute("aria-label") || String(top.className)).slice(0, 60)}]` : "null",
        docScrollX: document.documentElement.scrollWidth > innerWidth,
      }
    })
    await page.screenshot({ path: `${out}${label}.png` })
    const problems = []
    for (const k of ["dxf", "ifc"]) {
      const h = r[k]
      if (h.missing) problems.push(`${k} missing`)
      else { if (!h.ok) problems.push(`${k} covered by ${h.by}`); if (!h.inViewport) problems.push(`${k} outside viewport`) }
    }
    if (!r.model || !r.bar || !r.wrap) problems.push("model/bar/wrapper missing")
    else {
      if (r.model.bottom > r.bar.y + 1) problems.push(`visible model bottom ${r.model.bottom} overlaps bar top ${r.bar.y}`)
      if (r.model.bottom > r.wrap.bottom + 1) problems.push(`model overflows canvas wrapper (${r.model.bottom}>${r.wrap.bottom})`)
      if (r.model.h < 100 || r.model.w < 200) problems.push(`model too small ${r.model.w}x${r.model.h}`)
      if (!r.modelHitOk) problems.push(`model centre hit by ${r.modelHitBy}`)
    }
    if (r.docScrollX) problems.push("horizontal document scroll")
    console.log(`${label}: ${problems.length ? "FAIL " + problems.join("; ") : "PASS"} model=${JSON.stringify(r.model)} bar=${JSON.stringify(r.bar)}`)
    if (problems.length) failures.push(`${label}: ${problems.join("; ")}`)
    await ctx.close()
  }
} finally { await browser.close() }
if (failures.length) { console.error(`\n${failures.length} FAIL`); process.exit(1) }
console.log(`\nALL ${cases.length} PASS`)
