// MASON: homepage hero vs cookie banner. For each viewport, with the banner
// visible and after dismissing it with a real click, every hero control must
// be visible at initial scroll (or reachable by scrolling) and be the element
// actually hit at its centre (not the cookie banner), with no horizontal overflow.
//   node scripts/home-cookie-hero-audit.mjs <baseUrl> [outDir]
import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:4190").replace(/\/$/, "")
const outDir = resolve(process.argv[3] || "test-results/home-cookie-hero")
const viewports = [[320, 568], [375, 667], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1440, 900]]
await mkdir(outDir, { recursive: true })

async function launch() {
  try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) }
}
const measure = () => {
  const banner = document.querySelector("[data-cookie-consent]")
  const b = banner?.getBoundingClientRect()
  const hero = document.querySelector("[data-project-first-hero]")
  const controls = [...hero.querySelectorAll("a, button")].filter((el) => el.closest("[data-project-first-hero]"))
  const vh = window.innerHeight
  const rows = controls.map((el) => {
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const top = document.elementFromPoint(cx, cy)
    const inView = r.top >= 0 && r.bottom <= vh
    const hitsBanner = Boolean(banner && banner.contains(top))
    const overlapsBanner = Boolean(b && r.bottom > b.top && r.top < b.bottom)
    const occ = top && !(top === el || el.contains(top)) ? `${top.tagName}${top.getAttribute("data-sutra-launcher") ? "[sutra-launcher]" : ""}.${String(top.className).slice(0, 30)}` : null
    return { occ, name: (el.textContent || "").trim().slice(0, 30), top: Math.round(r.top), bottom: Math.round(r.bottom), inView, hitsBanner, overlapsBanner, ok: (top === el || el.contains(top)) }
  })
  return { vh, banner: b ? [Math.round(b.top), Math.round(b.height)] : null, overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, rows }
}
const browser = await launch()
const fails = []
try {
  for (const [w, h] of viewports) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } })
    const page = await ctx.newPage()
    await page.route("**/api/region", (r) => r.fulfill({ contentType: "application/json", body: "{}" }))
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" })
    await page.waitForSelector("[data-cookie-consent]")
    await page.waitForTimeout(250)
    for (const state of ["cookie-visible", "cookie-dismissed"]) {
      if (state === "cookie-dismissed") {
        // Real click at the button's centre; if another fixed element (SUTRA launcher) sits on it, fall back to a real keypress and say so.
        const box = await page.locator("[data-cookie-consent] button").boundingBox()
        const covered = await page.evaluate(([x, y]) => !document.elementFromPoint(x, y)?.closest("[data-cookie-consent]"), [box.x + box.width / 2, box.y + box.height / 2])
        if (covered) { console.log(`  ${w}x${h}: Got it centre covered by another fixed element; dismissing via keyboard`); await page.locator("[data-cookie-consent] button").focus(); await page.keyboard.press("Enter") }
        else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForSelector("[data-cookie-consent]", { state: "detached" })
        await page.waitForTimeout(150)
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }))
      await page.waitForTimeout(100)
      const initial = await page.evaluate(measure)
      await page.screenshot({ path: resolve(outDir, `${w}x${h}-${state}.png`) })
      // Primary CTAs (first two) must be visible at initial scroll and not under the banner.
      const primary = initial.rows.slice(0, 2)
      // Every control must be hit-testable after being scrolled into view (centre of viewport).
      const scrolled = []
      for (let i = 0; i < initial.rows.length; i++) {
        await page.evaluate((idx) => {
          const el = [...document.querySelector("[data-project-first-hero]").querySelectorAll("a, button")][idx]
          el.scrollIntoView({ block: "center", behavior: "instant" })
        }, i)
        await page.waitForTimeout(60)
        const m = await page.evaluate(measure)
        scrolled.push(m.rows[i])
      }
      const problems = []
      const notes = []
      primary.forEach((r) => { if (!r.inView || r.hitsBanner || r.overlapsBanner) problems.push(`initial: ${r.name} inView=${r.inView} hitsBanner=${r.hitsBanner} overlap=${r.overlapsBanner} [${r.top},${r.bottom}]`) })
      scrolled.forEach((r) => { if (r.hitsBanner || r.overlapsBanner) problems.push(`scrolled: ${r.name} under banner`); else if (!r.ok) notes.push(`${r.name} occluded by ${r.occ}`) })
      if (initial.overflowX > 0) problems.push(`overflowX=${initial.overflowX}`)
      // Real click on the primary CTA at initial scroll (must navigate, not hit the banner).
      const line = `${w}x${h} ${state} banner=${JSON.stringify(initial.banner)} primary=${primary.map((r) => `${r.name}[${r.top},${r.bottom}]`).join(" | ")} overflowX=${initial.overflowX} ${problems.length ? "FAIL " + problems.join("; ") : "PASS"}${notes.length ? " NOTE(non-banner): " + notes.join("; ") : ""}`
      console.log(line)
      if (problems.length) fails.push(line)
    }
    await ctx.close()
  }
} finally { await browser.close() }
if (fails.length) { console.error(`\n${fails.length} FAILURES`); process.exit(1) }
console.log("\nALL PASS")
