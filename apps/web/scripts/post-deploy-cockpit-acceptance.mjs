import { chromium } from 'playwright'

const baseUrl = (process.argv[2] || process.env.FERRUM_ACCEPTANCE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const route = '/project-workspace/cockpit?project=preview&product=Design&workspaceView=camera-state&revision=7'

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

const browser = await launchBrowser()

try {
  for (const width of [320, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const browserErrors = []
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })

    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    await page.locator('[data-space-3d] canvas').waitFor({ state: 'visible' })

    const result = await page.evaluate(() => {
      const visible = (element) => {
        if (!element) return false
        if (typeof element.checkVisibility === 'function' && !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        const details = element.closest('details')
        if (details && !details.open && element !== details.querySelector(':scope > summary') && !element.matches('summary')) return false
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && element.getAttribute('aria-hidden') !== 'true'
      }
      const evidence = document.querySelector('[data-canvas-evidence]')
      const workspace = document.querySelector('[data-fullscreen-toggle]')
      const icon = document.querySelector('[data-compact-workspace-icon]')
      const label = document.querySelector('[data-workspace-action-label]')
      const directlyVisible = (element) => {
        if (!element) return false
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
      }
      const workspaceRect = workspace?.getBoundingClientRect()
      const controls = [...document.querySelectorAll('button,summary')].filter(visible)
      const evidenceText = evidence?.textContent?.trim().replace(/\s+/g, ' ') ?? ''

      const defaultOverlays = [...document.querySelectorAll('[data-mobile-sheet],[data-workflow-backdrop],[aria-label="SUTRA design assistant"],[aria-label="Workspace data extract"],[aria-label="Territorial context"]')].filter(visible)
      return {
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        defaultOverlays: defaultOverlays.map((element) => element.getAttribute('aria-label') || element.getAttribute('data-mobile-sheet') || element.tagName),
        evidenceText,
        evidenceFits: Boolean(evidence && evidence.scrollWidth <= evidence.clientWidth + 1),
        workspaceWidth: workspaceRect?.width ?? 0,
        workspaceHeight: workspaceRect?.height ?? 0,
        workspaceFits: Boolean(workspace && workspace.scrollWidth <= workspace.clientWidth + 1),
        workspaceAria: workspace?.getAttribute('aria-label') ?? '',
        compactIconVisible: directlyVisible(icon),
        fullLabelVisible: directlyVisible(label),
        sutraCount: controls.filter((element) => element.textContent?.trim() === 'SUTRA').length,
        extractCount: controls.filter((element) => element.getAttribute('aria-label') === 'Open extract').length,
      }
    })

    assert(!result.overflow, `${width}px: horizontal overflow detected`)
    assert(result.defaultOverlays.length === 0, `${width}px: default overlay(s) open: ${result.defaultOverlays.join(', ')}`)
    assert(result.evidenceText.endsWith('NOT A SURVEY'), `${width}px: evidence qualification does not end with NOT A SURVEY`)
    assert(result.evidenceFits, `${width}px: evidence qualification overflows horizontally`)
    assert(result.workspaceWidth >= 44 && result.workspaceHeight >= 44, `${width}px: workspace target is smaller than 44x44`)
    assert(result.workspaceFits && result.workspaceAria.length > 0, `${width}px: workspace control is clipped or unnamed`)
    assert(result.sutraCount === 1, `${width}px: expected one SUTRA action, found ${result.sutraCount}`)
    assert(result.extractCount === 1, `${width}px: expected one Extract action, found ${result.extractCount}`)
    if (width <= 430) {
      assert(result.compactIconVisible && !result.fullLabelVisible, `${width}px: compact workspace icon state is incorrect`)
    } else {
      assert(!result.compactIconVisible && result.fullLabelVisible, `${width}px: full workspace label is not visible`)
    }
    assert(browserErrors.length === 0, `${width}px: browser errors: ${browserErrors.join(' | ')}`)

    console.log(`PASS ${width}px ${JSON.stringify(result)}`)
    await page.close()
  }
} finally {
  await browser.close()
}
