// Release-blocker audit: after opening the in-flow product tool, the mobile task toolbar
// (tool trigger + Controls) must sit below the fixed app bar and be really clickable.
// Real Playwright clicks (which fail on obstruction) plus elementFromPoint hit-tests.
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || "http://127.0.0.1:4177").replace(/\/$/, "")
const widths = [320, 390, 768, 1024, 1366, 1440]
const products = ["Design", "Land", "Structure", "Cost", "Market", "Procure"]
const assert = (ok, msg) => { if (!ok) throw new Error(msg) }
const launch = async () => { try { return await chromium.launch({ headless: true }) } catch { return chromium.launch({ channel: "chrome", headless: true }) } }

const hit = (el) => { const b = el.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return Boolean(t && (t === el || el.contains(t))) }
const appBarBottom = () => document.querySelector("[data-workspace-fullscreen] > header")?.getBoundingClientRect().bottom ?? 0

async function open(browser, width, product) {
  const page = await browser.newPage({ viewport: { width, height: width >= 1024 ? 768 : width >= 768 ? 1024 : 640 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(`${baseUrl}/project-workspace/cockpit?product=${product}`, { waitUntil: "load", timeout: 120000 })
  await page.evaluate(() => window.localStorage.setItem("ferrum-cookie-consent", "accepted"))
  await page.reload({ waitUntil: "load", timeout: 120000 })
  await page.locator("[data-cockpit-canvas]").first().waitFor({ timeout: 120000 })
  await page.waitForTimeout(600)
  return { page, errors }
}

const browser = await launch()
try {
  for (const width of widths) for (const product of products) {
    const tag = `${product}@${width}`
    const { page, errors } = await open(browser, width, product)
    const trigger = page.locator("[data-product-tool-trigger]")
    const stacked = width < 1280 && (await trigger.count()) > 0 && (await trigger.isVisible())
    if (stacked) await trigger.click()
    await page.waitForTimeout(500) // past any focus/scroll settling
    const buttons = page.locator("[data-mobile-cockpit-toolbar] button")
    const n = await buttons.count()
    const barBottom = await page.evaluate(appBarBottom)
    let checked = 0
    for (let i = 0; i < n; i++) {
      const b = buttons.nth(i)
      if (!(await b.isVisible())) continue
      const r = await b.evaluate((el) => { const bb = el.getBoundingClientRect(); const t = document.elementFromPoint(bb.left + bb.width / 2, bb.top + bb.height / 2); return { top: bb.top, ok: Boolean(t && (t === el || el.contains(t))) } })
      assert(r.top >= barBottom - 0.5, `${tag}: toolbar button #${i} top ${r.top} beneath app bar bottom ${barBottom}`)
      assert(r.ok, `${tag}: toolbar button #${i} hit-test blocked`)
      checked++
    }
    if (stacked) {
      assert(checked >= 1, `${tag}: no toolbar buttons checked`)
      await page.locator("[data-product-tool-trigger]").click({ timeout: 3000 }) // real click: closes
      assert((await page.locator("[data-product-tool-trigger]").getAttribute("aria-expanded")) === "false", `${tag}: trigger click did not toggle`)
      await page.locator("[data-product-tool-trigger]").click({ timeout: 3000 }) // reopen
      const ctl = page.locator("[data-mobile-cockpit-toolbar] button", { hasText: "Controls" })
      if ((await ctl.count()) && (await ctl.first().isVisible())) {
        await ctl.first().click({ timeout: 3000 })
        assert((await ctl.first().getAttribute("aria-expanded")) === "true", `${tag}: Controls click did not open`)
        await page.keyboard.press("Escape") // modal sheet covers its trigger by design; Escape closes it
      }
    }
    assert(errors.length === 0, `${tag}: page errors ${errors.join(" | ")}`)
    // SUTRA open state (below desktop SUTRA breakpoint it occludes the canvas; tool must close, nothing blocked)
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("ferrum:open-sutra")))
    await page.waitForTimeout(500)
    const bad = await page.evaluate(`(() => { const hit = ${hit.toString()}; return [...document.querySelectorAll("[data-mobile-cockpit-toolbar] button")].filter((el) => el.getBoundingClientRect().width > 0 && !hit(el)).length })()`)
    assert(bad === 0, `${tag}: SUTRA open, ${bad} toolbar buttons blocked`)
    console.log(`PASS ${tag} stacked=${stacked} toolbarButtons=${checked} appBarBottom=${barBottom}`)
    await page.close()
  }
} finally { await browser.close() }
