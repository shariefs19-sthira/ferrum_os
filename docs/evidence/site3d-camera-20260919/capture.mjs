// MASON: God's Eye View camera controls — rendered + click evidence. Usage: node capture.mjs <baseUrl>
import { mkdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
const require = createRequire(new URL("../../../apps/web/package.json", import.meta.url))
const { chromium } = require("playwright")
const base = (process.argv[2] || "http://127.0.0.1:4391").replace(/\/$/, "")
const out = fileURLToPath(new URL("./", import.meta.url))
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] })
const results = []
for (const w of [320, 390, 768, 1024, 1440]) {
  const mobile = w < 768
  const page = await browser.newPage({ viewport: { width: w, height: mobile ? 760 : 900 }, hasTouch: mobile, isMobile: mobile })
  const r = { width: w }
  await page.goto(`${base}/products/landintel`, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForTimeout(6000)
  await page.getByRole("button", { name: "Got it" }).click().catch(() => {})
  const threeD = page.getByRole("button", { name: "3D context" })
  await threeD.scrollIntoViewIfNeeded()
  await threeD.click()
  const root = page.locator("[data-site-map-3d]")
  await root.waitFor({ timeout: 30000 })
  await page.waitForFunction(() => { const e = document.querySelector("[data-site-map-3d]"); return e && e.getAttribute("data-3d-status") !== "loading" }, null, { timeout: 40000 })
  r.status = await root.getAttribute("data-3d-status"); r.failure = await root.getAttribute("data-3d-failure")
  if (r.status === "ready") {
    await page.waitForTimeout(2500)
    const state = () => root.evaluate((e) => ({ mode: e.dataset.cameraMode, pitch: e.dataset.mapPitch, bearing: e.dataset.mapBearing, lat: e.dataset.mapCenterLat, lng: e.dataset.mapCenterLng, selLat: e.dataset.selectedLat, selLng: e.dataset.selectedLng, coverage: e.dataset.coverage, buildings: e.dataset.buildingCount }))
    r.before = await state()
    const canvas = await page.locator("[data-map-canvas]").boundingBox()
    r.canvas = canvas
    const geo = await page.evaluate(() => {
      const vis = (sel) => { const b = document.querySelector(sel)?.getBoundingClientRect(); return b && { x: b.x, y: b.y, w: b.width, h: b.height } }
      const c = document.querySelector("[data-map-canvas]").getBoundingClientRect(); const cx = c.x + c.width / 2, cy = c.y + c.height / 2
      const hit = document.elementFromPoint(cx, cy)
      const ctl = [...document.querySelectorAll("[data-site-view-controls] button")].map((b) => { const r = b.getBoundingClientRect(); return { label: b.getAttribute("aria-label"), w: Math.round(r.width), h: Math.round(r.height), containsCentre: r.left <= cx && r.right >= cx && r.top <= cy && r.bottom >= cy } })
      const attr = document.querySelector(".maplibregl-ctrl-attrib")?.getBoundingClientRect()
      const overlapAttr = attr && [...document.querySelectorAll("[data-site-view-controls], [data-site-map-3d-controls]")].some((g) => { const r = g.getBoundingClientRect(); return !(r.right < attr.left || r.left > attr.right || r.bottom < attr.top || r.top > attr.bottom) })
      return { ctl, centreHitIsMapUi: !!hit?.closest("[data-site-view-controls],[data-site-map-3d-controls]"), overlapAttr: !!overlapAttr, hOverflow: document.documentElement.scrollWidth > innerWidth, notes: document.querySelector("[data-site-map-3d-notes]")?.innerText.slice(0, 400), viewCtl: vis("[data-site-view-controls]") }
    })
    r.geometry = geo
    await page.screenshot({ path: `${out}${w}-3d-initial.png` })
    await page.getByRole("button", { name: /Switch to top-down view/ }).click(); await page.waitForTimeout(1200)
    r.afterTopDown = await state(); await page.screenshot({ path: `${out}${w}-3d-topdown.png` })
    await page.getByRole("button", { name: /Switch to oblique view/ }).click(); await page.waitForTimeout(1200)
    r.afterOblique = await state()
    // rotate away then reset north
    await page.getByRole("button", { name: "Rotate right" }).click(); await page.waitForTimeout(800)
    r.afterRotate = await state()
    await page.getByRole("button", { name: "Reset north" }).click(); await page.waitForTimeout(1200)
    r.afterResetNorth = await state(); await page.screenshot({ path: `${out}${w}-3d-reset-north.png` })
    r.selectedPointStable = r.afterResetNorth.selLat === r.before.selLat && r.afterResetNorth.selLng === r.before.selLng
  } else { await page.screenshot({ path: `${out}${w}-3d-${r.status}.png` }) }
  // 2D fallback regression
  await page.getByRole("button", { name: "2D plan" }).click(); await page.waitForTimeout(800)
  r.twoD = await page.evaluate(() => ({ leaflet: !!document.querySelector(".leaflet-container"), marker: !!document.querySelector(".leaflet-marker-icon"), hOverflow: document.documentElement.scrollWidth > innerWidth, threeDGone: !document.querySelector("[data-site-map-3d]") }))
  await page.screenshot({ path: `${out}${w}-2d.png` })
  results.push(r); await page.close()
}
await browser.close()
await writeFile(`${out}results.json`, JSON.stringify({ generatedAt: new Date().toISOString(), base, cspMode: "none (dev server, no _headers)", results }, null, 2))
console.log(JSON.stringify(results.map((r) => ({ w: r.width, s: r.status, f: r.failure, b: r.before?.mode, td: r.afterTopDown?.mode, ob: r.afterOblique?.mode, n: r.afterResetNorth?.bearing, stable: r.selectedPointStable, twoD: r.twoD?.leaflet })), null, 1))
