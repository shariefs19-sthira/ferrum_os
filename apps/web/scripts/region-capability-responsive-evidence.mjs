import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const baseUrl = (process.argv[2] || process.env.FERRUM_ACCEPTANCE_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]
const outputDirectory = fileURLToPath(new URL("../test-results/region-capability-responsive/", import.meta.url))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`Bundled Chromium unavailable (${error.message.split("\n")[0]}); using installed Chrome.`)
    return chromium.launch({ channel: "chrome", headless: true })
  }
}

await mkdir(outputDirectory, { recursive: true })
const browser = await launchBrowser()
const results = []

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const browserErrors = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })

    // `/api/region` is an edge route and is unavailable on the local static
    // evidence host. Its neutral response only prevents an unrelated 404; it
    // never supplies a project record, dataset coverage, or regulatory proof.
    await page.route("**/api/region", (route) => route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ country: null }),
    }))

    await page.goto(baseUrl, { waitUntil: "networkidle" })
    const panel = page.locator("[data-regional-availability]")
    await panel.scrollIntoViewIfNeeded()
    await panel.waitFor({ state: "visible" })
    const cookieDismiss = page.getByRole("button", { name: "Got it" })
    if (await cookieDismiss.isVisible().catch(() => false)) await cookieDismiss.click()
    await page.getByLabel("Country code").fill("IN")

    const result = await page.evaluate(() => {
      const panel = document.querySelector("[data-regional-availability]")
      const cards = [...document.querySelectorAll("[data-regional-availability] article")]
      const statusLabels = cards.map((card) => card.querySelector("span")?.textContent?.trim())
      const panelRect = panel?.getBoundingClientRect()
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        panelVisible: Boolean(panelRect && panelRect.width > 0 && panelRect.height > 0),
        panelFits: Boolean(panel && panel.scrollWidth <= panel.clientWidth + 1),
        nonblankCards: cards.filter((card) => card.textContent?.trim()).length,
        statusLabels,
        availableCards: statusLabels.filter((status) => status === "AVAILABLE").length,
      }
    })

    assert(!result.overflow, `${width}px: horizontal overflow detected`)
    assert(result.panelVisible && result.panelFits, `${width}px: regional panel is blank, hidden, or overflows`)
    assert(result.nonblankCards === 5, `${width}px: expected five nonblank capability cards`)
    assert(result.availableCards === 0, `${width}px: user-declared IN must not produce an AVAILABLE capability card`)
    assert(browserErrors.length === 0, `${width}px: browser errors: ${browserErrors.join(" | ")}`)

    await panel.screenshot({ path: resolve(outputDirectory, `region-capability-${width}.png`) })
    results.push({ width, ...result, browserErrors })
    console.log(`PASS ${width}px ${JSON.stringify(result)}`)
    await page.close()
  }

  await writeFile(
    resolve(outputDirectory, "report.json"),
    JSON.stringify({ baseUrl, countryInput: "IN", generatedAt: new Date().toISOString(), results }, null, 2) + "\n",
    "utf8",
  )
} finally {
  await browser.close()
}
