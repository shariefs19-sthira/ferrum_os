import { createServer } from "node:http"
import { createReadStream } from "node:fs"
import { mkdir, stat, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"

// Usage (repo root, after `pnpm --filter ./apps/web build`): node docs/evidence/mason-region-touch-target-20260919/capture.mjs
const require = createRequire(pathToFileURL(path.resolve("apps", "web", "package.json")))
const { chromium } = require("playwright")

const outRoot = path.resolve("apps", "web", "out")
const evidenceDir = path.resolve("docs", "evidence", "mason-region-touch-target-20260919")
const port = Number(process.env.FERRUM_AUDIT_PORT ?? 4183)
const widths = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920]
const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2" }

const server = createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname)
    if (urlPath === "/api/region") {
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ country: null }))
      return
    }
    const filePath = path.join(outRoot, urlPath === "/" ? "index.html" : urlPath)
    const info = await stat(filePath).catch(() => null)
    const resolved = info?.isDirectory() ? path.join(filePath, "index.html") : filePath
    if (!(await stat(resolved).catch(() => null))) {
      response.writeHead(404)
      response.end("Not found")
      return
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(resolved)] ?? "application/octet-stream" })
    createReadStream(resolved).pipe(response)
  } catch (error) {
    response.writeHead(500)
    response.end(String(error))
  }
})
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve))

async function launch() {
  try {
    return await chromium.launch({ headless: true })
  } catch {
    return chromium.launch({ channel: "chrome", headless: true })
  }
}

await mkdir(path.join(evidenceDir, "screenshots"), { recursive: true })
const browser = await launch()
const results = []
let failures = 0

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: width <= 430 ? 844 : 900 } })
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()) })
    page.on("response", (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`) })

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" })
    const cookie = page.getByRole("button", { name: "Got it" })
    if (await cookie.isVisible().catch(() => false)) await cookie.click()
    const panel = page.locator("[data-regional-availability]")
    await panel.scrollIntoViewIfNeeded()
    await panel.waitFor({ state: "visible" })
    await page.getByLabel("Country code").fill("IN")

    const toggles = page.locator("[data-regional-evidence-toggle]")
    const count = await toggles.count()
    const targets = []
    const keyboard = []
    for (let i = 0; i < count; i++) {
      const toggle = toggles.nth(i)
      await toggle.scrollIntoViewIfNeeded()
      const box = await toggle.boundingBox()
      const details = toggle.locator("xpath=..")

      // Real keyboard path: focus, check ring, Enter opens, Enter closes, Space opens, Space closes.
      await page.keyboard.press("Shift") // establish keyboard modality so :focus-visible applies
      await toggle.focus()
      const focus = await toggle.evaluate((el) => {
        const style = getComputedStyle(el)
        return { focused: document.activeElement === el, outlineStyle: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), outlineColor: style.outlineColor }
      })
      const initial = await details.evaluate((el) => el.open)
      await page.keyboard.press("Enter")
      const afterEnter = await details.evaluate((el) => el.open)
      await page.keyboard.press("Enter")
      const afterEnterClose = await details.evaluate((el) => el.open)
      await page.keyboard.press("Space")
      const afterSpace = await details.evaluate((el) => el.open)
      if (i === 0) await panel.screenshot({ path: path.join(evidenceDir, "screenshots", `region-focus-open-${width}.png`) })
      await page.keyboard.press("Space")
      const afterSpaceClose = await details.evaluate((el) => el.open)

      targets.push({
        index: i,
        x: Math.round(box.x * 100) / 100,
        y: Math.round(box.y * 100) / 100,
        width: Math.round(box.width * 100) / 100,
        height: Math.round(box.height * 100) / 100,
        focus,
        keyboard: { initial, afterEnter, afterEnterClose, afterSpace, afterSpaceClose },
      })
      keyboard.push(!initial && afterEnter && !afterEnterClose && afterSpace && !afterSpaceClose)
    }

    const page_ = await page.evaluate(() => {
      const panelEl = document.querySelector("[data-regional-availability]")
      const rect = panelEl?.getBoundingClientRect()
      const cards = [...document.querySelectorAll("[data-regional-availability] article")]
      const statuses = cards.map((card) => card.querySelector("span")?.textContent?.trim())
      const overflowing = [...document.querySelectorAll("[data-regional-availability] *")].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > document.documentElement.clientWidth + 1) }).length
      const cockpit = document.querySelector("[data-product-cockpit]")
      return {
        docOverflowPx: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        panelOverflowingElements: overflowing,
        panelSize: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null,
        nonblankCards: cards.filter((card) => card.textContent?.trim()).length,
        statuses,
        cockpitPresent: Boolean(cockpit),
        userDeclaredCopy: cards.some((card) => /user-declared/i.test(card.textContent ?? "")),
      }
    })
    const shot = await panel.screenshot({ path: path.join(evidenceDir, "screenshots", `region-panel-${width}.png`) })

    const violations = []
    if (count !== 5) violations.push(`expected 5 summary controls, found ${count}`)
    for (const t of targets) {
      if (t.height < 44) violations.push(`control ${t.index} height ${t.height}px < 44`)
      if (t.width < 44) violations.push(`control ${t.index} width ${t.width}px < 44`)
      if (!t.focus.focused || t.focus.outlineStyle === "none" || t.focus.outlineWidth < 2) violations.push(`control ${t.index} no visible focus ring`)
    }
    if (!keyboard.every(Boolean)) violations.push("Enter/Space activation did not toggle every control")
    if (page_.docOverflowPx > 0 || page_.panelOverflowingElements > 0) violations.push(`horizontal overflow doc=${page_.docOverflowPx}px panelElements=${page_.panelOverflowingElements}`)
    if (page_.nonblankCards !== 5 || shot.byteLength < 20_000) violations.push("panel blank or incomplete")
    if (page_.statuses.includes("AVAILABLE")) violations.push("USER_DECLARED IN produced an AVAILABLE card")
    if (errors.length) violations.push(`errors: ${errors.join(" | ")}`)
    if (violations.length) failures++

    results.push({ width, targets, page: page_, screenshotBytes: shot.byteLength, errors, violations })
    console.log(`${violations.length ? "FAIL" : "PASS"} ${width}px min-height=${Math.min(...targets.map((t) => t.height))} ${violations.join("; ")}`)
    await page.close()
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}

await writeFile(path.join(evidenceDir, "capture-report.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), route: "/", countryInput: "IN", widths, failingWidths: failures, results }, null, 2)}\n`)
if (failures) process.exitCode = 1
