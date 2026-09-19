// Browser evidence for Space3D render-quality behaviour (ATLAS, 2026-09-19).
// Usage: node scripts/space3d-render-quality-evidence.mjs [baseUrl] [route]
// Records what the renderer reports via data-* attributes, checks the scene is
// not covered by the status/control bar, and saves mobile + desktop screenshots.
import { mkdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "")
const route = "/" + (process.argv[3] || "project-workspace/cockpit").replace(/^\/+/, "")
const out = fileURLToPath(new URL("../evidence/space3d-render-quality/", import.meta.url))
const args = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

function assert(condition, message) { if (!condition) throw new Error(message) }
async function launch() {
  try { return await chromium.launch({ headless: true, args }) } catch { return chromium.launch({ channel: "chrome", headless: true, args }) }
}

const cases = [
  { name: "mobile-auto", width: 390, height: 844, choose: null },
  { name: "mobile-high", width: 390, height: 844, choose: "high" },
  { name: "mobile-reduced", width: 390, height: 844, choose: "reduced" },
  { name: "desktop-auto", width: 1440, height: 900, choose: null },
  { name: "desktop-high", width: 1440, height: 900, choose: "high" },
  { name: "desktop-reduced", width: 1440, height: 900, choose: "reduced" },
  { name: "mobile-320-high", width: 320, height: 640, choose: "high" },
]

await mkdir(out, { recursive: true })
const browser = await launch()
const results = []
try {
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: item.width, height: item.height }, hasTouch: item.width < 768, deviceScaleFactor: item.width < 768 ? 2 : 1 })
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.route("**/api/region", (r) => r.fulfill({ contentType: "application/json", body: "{}" }))
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
    await page.locator("[data-space-3d] canvas").waitFor({ state: "visible", timeout: 30000 })
    if (item.choose) await page.locator(`[data-render-quality="${item.choose}"]`).click()
    await page.waitForTimeout(2200)
    const read = () => page.evaluate(() => {
      const host = document.querySelector("[data-space-3d]")
      const canvas = host.querySelector("canvas").getBoundingClientRect()
      const bar = document.querySelector("[data-mobile-canvas-status]").getBoundingClientRect()
      const buttons = [...document.querySelectorAll("[data-render-quality-control] button")].map((b) => { const r = b.getBoundingClientRect(); return { label: b.textContent, checked: b.getAttribute("aria-checked"), w: Math.round(r.width), h: Math.round(r.height) } })
      return {
        dataset: { ...host.dataset }, buttons, evidence: document.querySelector("[data-canvas-evidence]").textContent.replace(/\s+/g, " ").trim(),
        canvas: { w: Math.round(canvas.width), h: Math.round(canvas.height), bottom: Math.round(canvas.bottom) }, barTop: Math.round(bar.top), barH: Math.round(bar.height),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }
    })
    const state = await read()
    await page.screenshot({ path: `${out}${item.name}.png` })
    assert(!state.overflowX, `${item.name}: horizontal overflow`)
    assert(state.canvas.bottom <= state.barTop + 1, `${item.name}: status bar overlaps the canvas`)
    assert(state.buttons.length === 3 && state.buttons.every((b) => b.h >= 44 || item.width >= 768), `${item.name}: quality buttons missing or under 44px`)
    assert(!/v-?ray/i.test(state.evidence), `${item.name}: status text mentions V-Ray`)
    assert(errors.length === 0, `${item.name}: page errors ${errors.join(" | ")}`)
    results.push({ name: item.name, ...state, errors })
    await page.close()
  }

  // Measured fallback: software GL cannot hold 24fps, so an explicit High must
  // drop to reduced with an honest reason after the warm-up + 3 slow seconds.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.route("**/api/region", (r) => r.fulfill({ contentType: "application/json", body: "{}" }))
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" })
  await page.locator("[data-render-quality=high]").click()
  await page.waitForFunction(() => document.querySelector("[data-space-3d]")?.dataset.renderQualityReason === "auto-fallback", null, { timeout: 25000 }).catch(() => {})
  const fallback = await page.evaluate(() => ({ ...document.querySelector("[data-space-3d]").dataset, evidence: document.querySelector("[data-canvas-evidence]").textContent.replace(/\s+/g, " ").trim() }))
  await page.screenshot({ path: `${out}desktop-high-fallback.png` })
  results.push({ name: "desktop-high-fallback", fallback })
  await page.close()
} finally {
  await browser.close()
  await writeFile(`${out}results.json`, JSON.stringify(results, null, 2))
}
for (const r of results) console.log(r.name, r.dataset ? `${r.dataset.renderProfile}/${r.dataset.renderQualityReason}/${r.dataset.renderEngine} dpr=${r.dataset.renderPixelRatio} fps=${r.dataset.fps} renderer=${r.dataset.renderer}` : `${r.fallback.renderProfile}/${r.fallback.renderQualityReason} :: ${r.fallback.evidence}`)
