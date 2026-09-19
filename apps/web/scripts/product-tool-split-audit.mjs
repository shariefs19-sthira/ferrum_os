// Rendered multi-width audit: with a product tool open, the building canvas must
// stay visible (split layout, no fixed overlay) and nothing may block a click.
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || process.env.FERRUM_ACCEPTANCE_URL || "http://127.0.0.1:3111").replace(/\/$/, "")
const viewports = [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }]
const products = ["Design", "Land", "Structure", "Cost", "Market", "Procure"]
const roadmapProducts = new Set(["Procure"]) // ProcureHub: no live tool, truthful ROADMAP surface
const out = fileURLToPath(new URL("../evidence/product-tool-split/", import.meta.url))
const assert = (ok, msg) => { if (!ok) throw new Error(msg) }

async function launch() {
  try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) }
}

// Runs in the page. Returns geometry + blocked-target findings.
function measure() {
  const canvas = document.querySelector("[data-cockpit-canvas]")
  const tool = document.querySelector("[data-product-tool-surface]")
  const r = (el) => { const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, width: b.width, height: b.height } }
  const cr = canvas ? r(canvas) : null
  const visibleH = cr ? Math.max(0, Math.min(cr.bottom, innerHeight) - Math.max(cr.top, 0)) : 0
  const visibleW = cr ? Math.max(0, Math.min(cr.right, innerWidth) - Math.max(cr.left, 0)) : 0
  const hit = (el) => { const b = el.getBoundingClientRect(); const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return Boolean(top && (top === el || el.contains(top) || top.contains(el))) }
  const inViewport = (el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth }
  const sel = "button, input, select, textarea, [role=slider], a[href]"
  const scope = document.querySelector("[data-workspace-cockpit]") || document
  const blocked = [...scope.querySelectorAll(sel)].filter((el) => inViewport(el) && !el.closest("[data-product-tool-surface]") && getComputedStyle(el).visibility !== "hidden" && !hit(el)).map((el) => el.outerHTML.slice(0, 90))
  let fixedAncestor = false
  for (let n = tool; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === "fixed" && !n.hasAttribute("data-workspace-fullscreen")) fixedAncestor = true
  const tr = tool && getComputedStyle(tool).display !== "none" ? r(tool) : null
  const overlap = cr && tr ? Math.max(0, Math.min(cr.right, tr.right) - Math.max(cr.left, tr.left)) * Math.max(0, Math.min(cr.bottom, tr.bottom) - Math.max(cr.top, tr.top)) : 0
  return {
    canvas: cr, tool: tr, visibleCanvas: { w: Math.round(visibleW), h: Math.round(visibleH) }, overlapPx: Math.round(overlap), fixedAncestor,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    toolScrollable: tool ? tool.scrollHeight > tool.clientHeight + 1 : false, blocked,
    scrimPresent: Boolean(document.querySelector("[data-mobile-sheet-scrim]")),
  }
}

// Every actionable control inside the tool pane, once scrolled into view, must
// be the topmost element at its own centre (no export bar / slider overlap).
async function toolTargets(page) {
  const handles = await page.locator("[data-product-tool-surface] :is(button, input, select, textarea, [role=slider], summary)").elementHandles()
  const bad = []
  let checked = 0
  for (const h of handles) {
    if (!(await h.isVisible())) continue
    await h.scrollIntoViewIfNeeded()
    const ok = await h.evaluate((el) => { const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return Boolean(t && (t === el || el.contains(t) || t.contains(el))) })
    checked += 1
    if (!ok) bad.push(await h.evaluate((el) => el.outerHTML.slice(0, 90)))
  }
  return { checked, bad }
}

// Consent banner is unrelated to the cockpit; pre-accept it so it cannot sit in the measurement.
async function dismissCookies(page) {
  await page.evaluate(() => window.localStorage.setItem("ferrum-cookie-consent", "accepted"))
  await page.reload({ waitUntil: "networkidle" })
}

await mkdir(out, { recursive: true })
const browser = await launch()
const report = []
try {
  for (const vp of viewports) {
    const desktop = vp.width >= 1280
    for (const product of products) {
      const page = await browser.newPage({ viewport: vp })
      const errors = []
      page.on("pageerror", (e) => errors.push(e.message))
      await page.goto(`${baseUrl}/project-workspace/cockpit?product=${product}`, { waitUntil: "networkidle" })
      await dismissCookies(page)
      const hasTool = (await page.locator("[data-product-tool-surface]").count()) > 0
      if (!desktop && hasTool) {
        await page.locator("[data-product-tool-trigger]").click()
        await page.locator('[data-product-tool-surface][data-mobile-sheet="tool"]').waitFor()
      }
      await page.waitForTimeout(250)
      const m = await page.evaluate(measure)
      const tt = hasTool ? await toolTargets(page) : { checked: 0, bad: [] }
      await page.evaluate(() => { const t = document.querySelector("[data-product-tool-surface]"); if (t) t.scrollTop = 0 })
      const tag = `${product}@${vp.width}`
      assert(m.canvas && m.visibleCanvas.h >= 120 && m.visibleCanvas.w >= Math.min(vp.width, 300) - 1, `${tag}: building canvas not visible (${JSON.stringify(m.visibleCanvas)})`)
      assert(m.overlapPx === 0, `${tag}: tool pane overlaps canvas by ${m.overlapPx}px`)
      assert(!m.fixedAncestor && !m.scrimPresent, `${tag}: tool pane is fixed/overlaid or a scrim is present`)
      assert(!m.hOverflow, `${tag}: horizontal overflow`)
      assert(m.blocked.length === 0, `${tag}: blocked canvas targets ${m.blocked.join(" | ")}`)
      assert(tt.bad.length === 0, `${tag}: blocked tool targets ${tt.bad.join(" | ")}`)
      assert(errors.length === 0, `${tag}: page errors ${errors.join(" | ")}`)
      if (hasTool) {
        const state = await page.locator("[data-product-tool-surface]").getAttribute("data-tool-state")
        assert(roadmapProducts.has(product) ? state === "ROADMAP" : state === "LIVE", `${tag}: unexpected tool state ${state}`)
        if (roadmapProducts.has(product)) assert((await page.locator("[data-product-tool-surface] [data-roadmap-state]").count()) === 1, `${tag}: ROADMAP statement missing`)
      } else assert(product === "Design", `${tag}: tool surface missing`)
      await page.screenshot({ path: resolve(out, `${product.toLowerCase()}-${vp.width}.png`) })
      report.push({ product, ...vp, hasTool, ...m, toolTargetsChecked: tt.checked })
      console.log(`PASS ${tag} canvasVisible=${m.visibleCanvas.w}x${m.visibleCanvas.h} toolH=${m.tool ? Math.round(m.tool.height) : "-"} toolScroll=${m.toolScrollable} targets=${tt.checked}`)
      await page.close()
    }
    // Product switching closes the prior panel (below lg, where the pane is toggled).
    if (!desktop) {
      const page = await browser.newPage({ viewport: vp })
      await page.goto(`${baseUrl}/project-workspace/cockpit?product=Land`, { waitUntil: "networkidle" })
      await dismissCookies(page)
      await page.locator("[data-product-tool-trigger]").click()
      await page.locator('[data-mobile-sheet="tool"]').waitFor()
      await page.locator("[data-mobile-workflow] summary").click()
      await page.locator("[data-mobile-workflow] button", { hasText: "Engineering" }).first().click()
      await page.waitForTimeout(300)
      const after = await page.evaluate(() => ({ open: Boolean(document.querySelector('[data-mobile-sheet="tool"]')), product: document.querySelector("[data-product-tool-surface]")?.getAttribute("data-product-tool-surface"), expanded: document.querySelector("[data-product-tool-trigger]")?.getAttribute("aria-expanded") }))
      assert(!after.open && after.expanded === "false" && after.product === "structura", `${vp.width}: switching product did not close prior panel ${JSON.stringify(after)}`)
      console.log(`PASS switch@${vp.width} ${JSON.stringify(after)}`)
      report.push({ switching: vp.width, ...after })
      await page.close()
    }
  }
  await writeFile(resolve(out, "report.json"), JSON.stringify({ baseUrl, results: report }, null, 2))
  console.log(`ALL PASS (${report.length} checks)`)
} finally { await browser.close() }
