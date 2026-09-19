import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')
const baseUrl = process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:3017'
const evidenceRoot = path.resolve('docs', 'evidence', 'mason-sutra-orchestration-20260919')
const viewports = [320, 375, 390, 430, 768, 1024, 1366, 1440, 1920].map((width) => ({ width, height: width < 768 ? 844 : 960 }))

await mkdir(evidenceRoot, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  const response = await page.goto(`${baseUrl}/project-workspace`, { waitUntil: 'networkidle', timeout: 30_000 })
  const sutraToggle = page.getByRole('button', { name: 'SUTRA', exact: true })
  if (await sutraToggle.isVisible() && await sutraToggle.getAttribute('aria-expanded') !== 'true') await sutraToggle.click()
  const panel = page.locator('[data-sutra-workflow-status]')
  await panel.waitFor({ state: 'visible', timeout: 10_000 })
  await panel.screenshot({ path: path.join(evidenceRoot, `sutra-workflow-${viewport.width}.png`), animations: 'disabled' })
  const evidence = await page.evaluate(() => ({
    horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    sutraPanels: document.querySelectorAll('[data-sutra-panel]').length,
    workflowPanels: document.querySelectorAll('[data-sutra-workflow-status]').length,
    extractControlTexts: [...document.querySelectorAll('button')].filter((button) => /open extract/i.test(button.textContent ?? '') && button.getClientRects().length > 0 && getComputedStyle(button).visibility !== 'hidden').map((button) => button.textContent?.trim()),
    visibleWorkflow: Boolean(document.querySelector('[data-sutra-workflow-status]')),
  }))
  results.push({ viewport, status: response?.status() ?? null, evidence, consoleErrors, pageErrors })
  await context.close()
}

await browser.close()
const failures = results.flatMap((result) => {
  const problems = []
  if (result.status !== 200) problems.push(`HTTP ${result.status}`)
  if (result.evidence.horizontalOverflow > 1) problems.push(`horizontal overflow ${result.evidence.horizontalOverflow}px`)
  if (result.evidence.sutraPanels !== 1 || result.evidence.workflowPanels !== 1) problems.push('SUTRA surface count is not one')
  if (result.evidence.extractControlTexts.length !== 1) problems.push('Extract control count is not one')
  if (!result.evidence.visibleWorkflow) problems.push('workflow panel is not visible')
  if (result.consoleErrors.length || result.pageErrors.length) problems.push('browser errors present')
  return problems.map((problem) => ({ width: result.viewport.width, problem }))
})
await writeFile(path.join(evidenceRoot, 'capture-report.json'), `${JSON.stringify({ status: 'NOT LIVE — localhost development evidence only', baseUrl, results, failures }, null, 2)}\n`)
console.log(JSON.stringify({ viewportCount: results.length, failureCount: failures.length, failures }, null, 2))
if (failures.length) process.exitCode = 1
