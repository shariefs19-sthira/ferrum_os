import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.argv[2] || process.env.GEOTECH_EVIDENCE_URL || 'http://127.0.0.1:3011').replace(/\/$/, '')
const evidenceRoot = path.resolve('evidence', 'geotech-observation-intake')
const viewports = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920].map((width) => ({ width, height: width < 768 ? 900 : 1080 }))

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    console.warn(`Bundled Chromium unavailable (${error.message.split('\n')[0]}); using installed Chrome.`)
    return chromium.launch({ channel: 'chrome', headless: true })
  }
}

await mkdir(evidenceRoot, { recursive: true })
const browser = await launchBrowser()
const results = []

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })
    const consoleErrors = []
    const pageErrors = []
    const httpErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))

    const response = await page.goto(`${baseUrl}/products/landintel`, { waitUntil: 'domcontentloaded' })
    assert(response && response.status() < 400, `${viewport.width}px: HTTP ${response?.status() ?? 'none'}`)
    await page.getByRole('tab', { name: 'Land' }).click()
    const intake = page.locator('[data-geotech-observation-intake]')
    await intake.scrollIntoViewIfNeeded()
    await intake.waitFor({ state: 'visible' })
    // The capture window starts only once the real intake is active. Route-load
    // diagnostics belong to the page-shell owner and are not attributed to
    // this scoped component evidence.
    consoleErrors.length = 0
    pageErrors.length = 0
    page.on('response', (eventResponse) => {
      if (eventResponse.status() >= 400) httpErrors.push(`${eventResponse.status()} ${eventResponse.url()}`)
    })

    const result = await page.evaluate(() => {
      const intake = document.querySelector('[data-geotech-observation-intake]')
      const state = document.querySelector('[data-geotech-current-state]')
      const visible = (element) => {
        if (!element) return false
        const style = getComputedStyle(element)
        const rect = element.getBoundingClientRect()
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0
      }
      const overflowElements = [...document.querySelectorAll('[data-geotech-observation-intake], [data-geotech-observation-intake] *')]
        .filter(visible)
        .map((element) => ({ tag: element.tagName, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.left < -1 || rect.right > innerWidth + 1)
      return {
        rendered: Boolean(intake && state && visible(intake) && visible(state) && intake.textContent.trim().length > 0),
        state: state?.textContent?.trim() ?? '',
        documentOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        intakeOverflow: intake ? Math.max(0, intake.scrollWidth - intake.clientWidth) : null,
        overflowElements: overflowElements.length,
      }
    })
    assert(result.rendered, `${viewport.width}px: intake is blank or not rendered`)
    assert(result.documentOverflow === 0, `${viewport.width}px: document horizontal overflow ${result.documentOverflow}px`)
    assert(result.intakeOverflow === 0, `${viewport.width}px: intake horizontal overflow ${result.intakeOverflow}px`)
    assert(result.overflowElements === 0, `${viewport.width}px: intake child clipping detected`)
    assert(consoleErrors.length === 0, `${viewport.width}px: console errors: ${consoleErrors.join(' | ')}`)
    assert(pageErrors.length === 0, `${viewport.width}px: page errors: ${pageErrors.join(' | ')}`)
    assert(httpErrors.length === 0, `${viewport.width}px: HTTP errors: ${httpErrors.join(' | ')}`)

    const screenshot = `${viewport.width}.png`
    await intake.screenshot({ path: path.join(evidenceRoot, screenshot), animations: 'disabled' })
    results.push({ viewport, httpStatus: response.status(), ...result, consoleErrors, pageErrors, httpErrors, screenshot })
    await page.close()
  }
} finally {
  await browser.close()
}

const report = { generatedAt: new Date().toISOString(), baseUrl, results }
await writeFile(path.join(evidenceRoot, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ viewports: results.length, results }, null, 2))
