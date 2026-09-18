import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, devices } from '../../../apps/web/node_modules/playwright/index.mjs'

const baseUrl = 'https://ferrumos-preview.shariefsatyala.workers.dev'
const evidenceDir = dirname(fileURLToPath(import.meta.url))
await mkdir(evidenceDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const report = {
  capturedAt: new Date().toISOString(),
  baseUrl,
  expectedRelease: {
    sha: 'ac5b220c22e9e49d0321df6f0d40cc18509c0891',
    cloudflareVersion: 'cb1db4b8-e31c-4128-b134-d3e35b32816e',
  },
  captures: [],
}

async function capture({ name, path, mobile = false, prepare, evidence, screenshotTarget }) {
  const context = await browser.newContext(mobile
    ? { ...devices['iPhone 13'], colorScheme: 'light' }
    : { viewport: { width: 1366, height: 900 }, colorScheme: 'light' })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 60_000 })
  if (!response?.ok()) throw new Error(`${name}: navigation returned ${response?.status() ?? 'no response'}`)
  const cookieButton = page.getByRole('button', { name: 'Got it', exact: true })
  if (!path.startsWith('/project-workspace/cockpit') && await cookieButton.isVisible().catch(() => false)) await cookieButton.click()
  await prepare(page)
  const filename = `${name}.png`
  if (screenshotTarget) await page.locator(screenshotTarget).screenshot({ path: `${evidenceDir}/${filename}` })
  else await page.screenshot({ path: `${evidenceDir}/${filename}`, fullPage: false })
  report.captures.push({
    name,
    path,
    mobile,
    viewport: page.viewportSize(),
    httpStatus: response.status(),
    title: await page.title(),
    evidence: await evidence(page),
    consoleErrors,
    pageErrors,
    screenshot: filename,
  })
  await context.close()
}

const text = async (page, selector) => (await page.locator(selector).innerText()).replace(/\s+/g, ' ').trim()

for (const mobile of [false, true]) {
  await capture({
    name: `boq-model-linked-${mobile ? 'mobile' : 'desktop'}`,
    path: '/boq-pro',
    mobile,
    prepare: async (page) => {
      await page.getByRole('tab', { name: 'Model-linked take-off' }).click()
      await page.locator('[data-boq-traceability-panel]').waitFor()
      await page.locator('[data-boq-line-id]').first().click()
      await page.locator('[data-boq-traceability-panel]').scrollIntoViewIfNeeded()
    },
    evidence: async (page) => ({
      heading: await text(page, '[data-boq-traceability-panel]'),
      selectedLine: await text(page, '[data-selected-line-detail]'),
      checkerStatus: await page.locator('[data-checker-status]').getAttribute('data-checker-status'),
    }),
  })
}

await capture({
  name: 'landintel-environment-desktop',
  path: '/products/landintel',
  prepare: async (page) => {
    await page.getByRole('tab', { name: 'Environment' }).click()
    await page.locator('[data-evidence-theme-panel="environment"]').scrollIntoViewIfNeeded()
  },
  evidence: async (page) => ({
    activeTheme: await text(page, '[data-evidence-theme-panel="environment"]'),
    terrainStatus: await text(page, '[aria-label="Terrain dataset status"]'),
  }),
})

await capture({
  name: 'landintel-terrain-desktop',
  path: '/products/landintel',
  screenshotTarget: '[data-terrain-intelligence-panel]',
  prepare: async (page) => {
    await page.getByRole('tab', { name: 'Land' }).click()
    await page.locator('[data-terrain-intelligence-panel]').scrollIntoViewIfNeeded()
  },
  evidence: async (page) => ({
    panel: await text(page, '[data-terrain-intelligence-panel]'),
    terrainStatus: await text(page, '[aria-label="Terrain dataset status"]'),
  }),
})

await capture({
  name: 'landintel-access-mobile',
  path: '/products/landintel',
  mobile: true,
  prepare: async (page) => {
    await page.getByRole('tab', { name: 'Access' }).click()
    await page.locator('[data-evidence-theme-panel="access"]').scrollIntoViewIfNeeded()
  },
  evidence: async (page) => ({ activeTheme: await text(page, '[data-evidence-theme-panel="access"]') }),
})

for (const mobile of [false, true]) {
  await capture({
    name: `designstudio-environment-${mobile ? 'mobile' : 'desktop'}`,
    path: '/products/designstudio',
    mobile,
    screenshotTarget: '[data-environmental-context]',
    prepare: async (page) => {
      await page.locator('[data-environmental-context]').waitFor()
      await page.locator('[data-environmental-context]').scrollIntoViewIfNeeded()
    },
    evidence: async (page) => ({ panel: await text(page, '[data-environmental-context]') }),
  })
}

for (const mobile of [false, true]) {
  await capture({
    name: `cockpit-ifc-export-${mobile ? 'mobile' : 'desktop'}`,
    path: '/project-workspace/cockpit?project=preview',
    mobile,
    prepare: async (page) => {
      if (mobile) await page.getByRole('button', { name: 'SUTRA', exact: true }).click()
      await page.locator('[data-export-ifc]').waitFor()
      await page.locator('[data-export-ifc]').scrollIntoViewIfNeeded()
      if (!mobile) {
        const downloadPromise = page.waitForEvent('download')
        await page.locator('[data-export-ifc]').click()
        const download = await downloadPromise
        await download.saveAs(`${evidenceDir}/ferrum-plan.ifc`)
        await page.getByText(/IFC4 exported with/).waitFor()
      }
    },
    evidence: async (page) => ({
      status: await text(page, '[data-export-bar] [aria-live="polite"]'),
      exportButton: await text(page, '[data-export-ifc]'),
      interaction: mobile
        ? 'NOT VERIFIED: mobile tool rail overlaps the export control and intercepted the real pointer click during this evidence run.'
        : 'VERIFIED: a real pointer click produced the IFC4 export status.',
    }),
  })
}

await writeFile(`${evidenceDir}/capture-report.json`, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
await browser.close()
