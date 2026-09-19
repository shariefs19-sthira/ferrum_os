// MASON: 3D external-tile disclosure — rendered evidence. Usage: node capture.mjs <baseUrl>
import { writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
const require = createRequire(new URL("../../../apps/web/package.json", import.meta.url))
const { chromium } = require("playwright")
const base = (process.argv[2] || "http://127.0.0.1:4392").replace(/\/$/, "")
const out = fileURLToPath(new URL("./", import.meta.url))
const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] })
const results = []
for (const w of [320, 390, 768, 1440]) {
  const mobile = w < 768
  const page = await browser.newPage({ viewport: { width: w, height: mobile ? 760 : 900 }, hasTouch: mobile, isMobile: mobile })
  const providerUrls = []
  page.on("request", (rq) => { if (/openfreemap/.test(rq.url())) providerUrls.push({ url: rq.url(), referer: rq.headers()["referer"] ?? null }) })
  await page.goto(`${base}/products/landintel`, { waitUntil: "domcontentloaded", timeout: 60000 })
  await page.waitForTimeout(6000)
  await page.getByRole("button", { name: "Got it" }).click().catch(() => {})
  const threeD = page.getByRole("button", { name: "3D context" })
  await threeD.scrollIntoViewIfNeeded(); await threeD.click()
  const root = page.locator("[data-site-map-3d]"); await root.waitFor({ timeout: 30000 })
  await page.waitForFunction(() => document.querySelector("[data-site-map-3d]")?.getAttribute("data-3d-status") !== "loading", null, { timeout: 40000 })
  await page.waitForTimeout(2500)
  const r = { width: w, status: await root.getAttribute("data-3d-status") }
  r.geometry = await page.evaluate(() => {
    const n = document.querySelector("[data-site-map-3d-privacy]"); const nb = n?.getBoundingClientRect()
    const shell = document.querySelector("[data-parcel-map-shell]").getBoundingClientRect()
    const mk = document.querySelector("[data-site-map-3d-marker]")?.getBoundingClientRect()
    const hit = (a, b) => a && b && !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom)
    return { text: n?.textContent, lines: nb && Math.round(nb.height / parseFloat(getComputedStyle(n).lineHeight)), overlapsMap: hit(nb, shell), overlapsMarker: hit(nb, mk), hOverflow: document.documentElement.scrollWidth > innerWidth, clippedX: nb && (nb.left < 0 || nb.right > innerWidth) }
  })
  r.providerRequests = providerUrls.length; r.providerUrlsWithQuery = providerUrls.filter((u) => /[?#]/.test(u.url)).length
  r.providerRefererValues = [...new Set(providerUrls.map((u) => u.referer))]
  await page.locator("[data-site-map-3d]").screenshot({ path: `${out}${w}-3d-notice.png` })
  results.push(r); await page.close()
}
await browser.close()
await writeFile(`${out}results.json`, JSON.stringify({ generatedAt: new Date().toISOString(), base, results }, null, 2))
console.log(JSON.stringify(results.map((r) => ({ w: r.width, s: r.status, ...r.geometry, reqs: r.providerRequests, q: r.providerUrlsWithQuery, ref: r.providerRefererValues })), null, 1))
