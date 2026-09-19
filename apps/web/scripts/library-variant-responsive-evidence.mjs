import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

// Local rendered QA for the DesignStudio library-variant lineage panel.
// Usage: node scripts/library-variant-responsive-evidence.mjs [baseUrl]
// baseUrl must serve the static export (apps/web/out) at /products/designstudio.
const baseUrl = (process.argv[2] || process.env.FERRUM_ACCEPTANCE_URL || "http://127.0.0.1:3000").replace(/\/$/, "")
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]
const outputDirectory = fileURLToPath(new URL("../test-results/library-variant-responsive/", import.meta.url))

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
    // Edge-only endpoints do not exist on the static host; neutral stubs only
    // stop unrelated 404s and supply no project, coverage or regulatory data.
    await page.route("**/api/region", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ country: null }) }))

    await page.goto(`${baseUrl}/products/designstudio`, { waitUntil: "networkidle" })
    const cockpit = page.locator("[data-product-cockpit='designstudio']")
    await cockpit.waitFor({ state: "visible" })
    const cookieDismiss = page.getByRole("button", { name: "Got it" })
    if (await cookieDismiss.isVisible().catch(() => false)) await cookieDismiss.click()

    const panel = page.locator("[data-library-variant-lineage]")
    // Bring the cockpit canvas into view first (Playwright scrolls
    // synchronously, unlike smooth CSS scrolling) so the hit-test below
    // reflects what a visitor actually sees painted over the building.
    await cockpit.locator("canvas").first().scrollIntoViewIfNeeded()
    const canvasHit = await page.evaluate(() => {
      const cv = document.querySelector("[data-product-cockpit='designstudio'] canvas")
      const r = cv.getBoundingClientRect()
      const panel = document.querySelector("[data-library-variant-lineage]")
      const stack = document.elementsFromPoint(
        Math.min(Math.max(r.left + r.width / 2, 0), window.innerWidth - 1),
        Math.min(Math.max(r.top + r.height / 2, 0), window.innerHeight - 1),
      )
      return { onScreen: r.top >= 0 && r.bottom > 0 && r.top < window.innerHeight, topIsCanvas: stack[0] === cv, insidePanel: stack.some((el) => panel.contains(el)) }
    })
    await panel.scrollIntoViewIfNeeded()
    await panel.waitFor({ state: "visible" })

    const result = await page.evaluate(() => {
      const root = document.documentElement
      const panel = document.querySelector("[data-library-variant-lineage]")
      const cockpit = document.querySelector("[data-product-cockpit='designstudio']")
      const panelRect = panel.getBoundingClientRect()
      const cockpitRect = cockpit.getBoundingClientRect()
      const canvas = cockpit.querySelector("canvas")
      const canvasRect = canvas?.getBoundingClientRect()

      const stateAttrs = {
        validation: [...document.querySelectorAll("[data-validation-step]")].map((el) => `${el.dataset.validationStep}:${el.dataset.validationReached}`),
        gate: document.querySelector("[data-library-variant-gate]")?.dataset.libraryVariantGate,
        consent: document.querySelector("[data-library-variant-consent]")?.dataset.libraryVariantConsent,
      }
      const wide = [...panel.querySelectorAll("*")].filter((el) => el.getBoundingClientRect().right > panelRect.right + 1).length

      return {
        pageOverflow: root.scrollWidth > root.clientWidth,
        panelFits: panel.scrollWidth <= panel.clientWidth + 1,
        childrenOutsidePanel: wide,
        panelVisible: panelRect.width > 0 && panelRect.height > 0,
        panelOverlapsCockpit: !(panelRect.bottom <= cockpitRect.top || panelRect.top >= cockpitRect.bottom),
        canvasPresent: Boolean(canvasRect && canvasRect.width > 0 && canvasRect.height > 0),
        deltaCount: document.querySelectorAll("[data-library-variant-delta]").length,
        sampleNote: /SAMPLE INTENT - INDICATIVE/.test(panel.textContent || ""),
        stateAttrs,
      }
    })

    result.canvasHit = canvasHit
    assert(!result.pageOverflow,`${width}px: horizontal page overflow`)
    assert(result.panelVisible && result.panelFits, `${width}px: panel hidden or overflows`)
    assert(result.childrenOutsidePanel === 0, `${width}px: ${result.childrenOutsidePanel} panel descendants overflow the panel`)
    assert(!result.panelOverlapsCockpit, `${width}px: panel overlaps the cockpit region`)
    assert(result.canvasPresent, `${width}px: cockpit canvas missing or zero-size`)
    assert(result.canvasHit.onScreen && result.canvasHit.topIsCanvas && !result.canvasHit.insidePanel, `${width}px: cockpit canvas centre obstructed ${JSON.stringify(result.canvasHit)}`)
    assert(result.deltaCount > 0, `${width}px: no parameter deltas rendered`)
    assert(result.sampleNote, `${width}px: INDICATIVE sample note missing`)
    assert(result.stateAttrs.gate === "held" && result.stateAttrs.consent === "NOT_GRANTED", `${width}px: gate/consent state wrong`)
    assert(result.stateAttrs.validation.join() === "GENERATED:true,GEOMETRY_CHECKED:false,ENGINEERING_VERIFIED:false,APPROVED_FOR_ISSUE:false", `${width}px: validation stages wrong`)
    assert(browserErrors.length === 0, `${width}px: browser errors: ${browserErrors.join(" | ")}`)

    await panel.screenshot({ path: resolve(outputDirectory, `library-variant-${width}.png`) })
    results.push({ width, ...result, browserErrors })
    console.log(`PASS ${width}px ${JSON.stringify({ ...result, stateAttrs: undefined })}`)
    await page.close()
  }

  await writeFile(
    resolve(outputDirectory, "report.json"),
    JSON.stringify({ baseUrl, route: "/products/designstudio", generatedAt: new Date().toISOString(), results }, null, 2) + "\n",
    "utf8",
  )
} finally {
  await browser.close()
}
