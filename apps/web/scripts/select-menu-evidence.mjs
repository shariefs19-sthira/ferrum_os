// RIVET: mobile/desktop acceptance for the Project Workspace tool Select menu.
// Usage: node scripts/select-menu-evidence.mjs [baseUrl]
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "")
const widths = [320, 360, 375, 390, 430, 1024, 1440]
const out = fileURLToPath(new URL("../test-results/select-menu/", import.meta.url))
await mkdir(out, { recursive: true })

async function launch() {
  try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) }
}
const browser = await launch()
const failures = []
try {
  for (const width of widths) {
    const mobile = width < 1024
    const page = await browser.newPage({ viewport: { width, height: mobile ? 700 : 900 }, hasTouch: mobile, isMobile: mobile })
    await page.goto(`${baseUrl}/project-workspace/cockpit`, { waitUntil: "load" })
    await page.waitForSelector("[data-cockpit-region]")
    if (!mobile) {
      console.log(`${width}: desktop uses rail buttons (no menu)`)
      await page.screenshot({ path: `${out}${width}-desktop.png` })
      await page.close()
      continue
    }
    const trigger = page.locator("[data-mobile-workspace-tools] [aria-haspopup=listbox]")
    await trigger.tap()
    const listbox = page.getByRole("listbox", { name: "Workspace tools" })
    await listbox.waitFor()
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${out}${width}-open.png` })
    const report = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight
      const lb = document.getElementById("tools-ruler-listbox")
      const r = lb.getBoundingClientRect()
      const opts = [...lb.querySelectorAll("[role=option]")].map((o) => {
        const b = o.getBoundingClientRect()
        const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
        return { label: o.textContent, inView: b.left >= 0 && b.right <= vw && b.top >= 0 && b.bottom <= vh, h: b.height, topmost: !!hit && (o === hit || o.contains(hit)) }
      })
      return { box: [r.left, r.top, r.right, r.bottom].map(Math.round), vw, vh, opts, scrolls: lb.scrollHeight > lb.clientHeight }
    })
    const bad = report.opts.filter((o) => !o.inView || !o.topmost || o.h < 44)
    if (bad.length || report.scrolls) failures.push({ width, report })
    console.log(width, JSON.stringify(report))
    await page.getByRole("option", { name: "Measure" }).tap()
    await page.waitForTimeout(400)
    const stillOpen = await listbox.count()
    await page.screenshot({ path: `${out}${width}-after-select.png` })
    if (stillOpen) failures.push({ width, msg: "listbox still open after select" })
    await page.close()
  }
} finally { await browser.close() }
if (failures.length) { console.error("FAIL", JSON.stringify(failures, null, 1)); process.exit(1) }
console.log("PASS; screenshots in", out)
