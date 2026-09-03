import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const { chromium } = require('playwright')

const baseUrl = process.env.FERRUM_AUDIT_BASE_URL ?? 'http://127.0.0.1:4177'
const staticExport = process.env.FERRUM_AUDIT_STATIC === '1'
const appRoot = path.resolve('apps', 'web', 'app')
const evidenceRoot = path.resolve('docs', 'evidence', 'w2-354')
const screenshotRoot = path.join(evidenceRoot, 'screenshots')

const allViewports = [
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-landscape-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'phone-landscape-844', width: 844, height: 390 },
]
const viewportFilter = process.env.FERRUM_AUDIT_VIEWPORT
const viewports = viewportFilter ? allViewports.filter(({ name }) => name === viewportFilter) : allViewports

async function collectPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectPageFiles(entryPath)
    return entry.name === 'page.tsx' || entry.name === 'page.ts' ? [entryPath] : []
  }))
  return nested.flat()
}

function routeFromPage(file) {
  const relative = path.relative(appRoot, path.dirname(file)).replaceAll('\\', '/')
  if (!relative) return '/'
  const segments = relative.split('/').filter((segment) => !/^\(.+\)$/.test(segment))
  if (segments.some((segment) => segment.startsWith('[') || segment.startsWith('_'))) return null
  return `/${segments.join('/')}`
}

function routeSlug(route) {
  return route === '/' ? 'home' : route.slice(1).replaceAll('/', '--')
}

const pageFiles = await collectPageFiles(appRoot)
const allRoutes = [...new Set(pageFiles.map(routeFromPage).filter(Boolean))].sort()
const routeFilter = process.env.FERRUM_AUDIT_ROUTE
const routes = routeFilter ? allRoutes.filter((route) => route === routeFilter) : allRoutes
const productRoutes = routes.filter((route) => /^\/products\/[^/]+$/.test(route))

await mkdir(screenshotRoot, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []
let completed = 0

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport })
  await context.addInitScript(() => {
    const connection = { saveData: true, effectiveType: '4g' }
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection })
  })
  const page = await context.newPage()

  for (const route of routes) {
    const consoleErrors = []
    const pageErrors = []
    const onConsole = (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    }
    const onPageError = (error) => pageErrors.push(error.message)
    page.on('console', onConsole)
    page.on('pageerror', onPageError)

    let status = null
    let metrics = null
    let navigationError = null
    try {
      const routePath = staticExport && route !== '/' ? `${route}.html` : route
      const response = await page.goto(`${baseUrl}${routePath}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      status = response?.status() ?? null
      await page.waitForTimeout(80)

      metrics = await page.evaluate(({ width, mobile }) => {
        const visible = (element) => {
          const style = getComputedStyle(element)
          const rect = element.getBoundingClientRect()
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0
        }
        const descriptor = (element) => {
          const text = (element.getAttribute('aria-label') || element.textContent || element.getAttribute('name') || element.tagName)
            .trim()
            .replace(/\s+/g, ' ')
            .slice(0, 72)
          return `${element.tagName.toLowerCase()}:${text}`
        }
        const hasHorizontalScrollAncestor = (element) => {
          let current = element.parentElement
          while (current && current !== document.body) {
            const style = getComputedStyle(current)
            if (/(auto|scroll)/.test(style.overflowX) && current.scrollWidth > current.clientWidth) return true
            current = current.parentElement
          }
          return false
        }

        const critical = [...document.querySelectorAll('button,input:not([type="hidden"]),select,textarea,[role="button"],header a,main img,main svg,main canvas')]
          .filter(visible)
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ element, rect }) => !hasHorizontalScrollAncestor(element) && (rect.left < -1 || rect.right > width + 1))
          .map(({ element, rect }) => ({ target: descriptor(element), left: Math.round(rect.left), right: Math.round(rect.right) }))

        const targetSelector = 'button,input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]),select,textarea,[role="button"],a.inline-flex,a[class*="min-h-11"]'
        const undersizedTargets = mobile
          ? [...document.querySelectorAll(targetSelector)]
              .filter(visible)
              .filter((element) => !element.classList.contains('after:absolute'))
              .map((element) => ({ element, rect: element.getBoundingClientRect() }))
              .filter(({ rect }) => rect.width < 44 || rect.height < 44)
              .map(({ element, rect }) => ({ target: descriptor(element), width: Math.round(rect.width), height: Math.round(rect.height) }))
          : []

        const tableFailures = [...document.querySelectorAll('table')]
          .filter(visible)
          .filter((table) => table.scrollWidth > width && !hasHorizontalScrollAncestor(table))
          .map(descriptor)

        const tinyText = [...document.querySelectorAll('main p,main li,main td,main th,main label')]
          .filter(visible)
          .filter((element) => Number.parseFloat(getComputedStyle(element).fontSize) < 10)
          .map(descriptor)

        const footer = document.querySelector('footer')
        const footerRect = footer?.getBoundingClientRect()
        const footerClipped = Boolean(footerRect && (footerRect.left < -1 || footerRect.right > width + 1))
        const overflowElements = [...document.querySelectorAll('body *')]
          .filter(visible)
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.left < -1 || rect.right > width + 1)
          .slice(0, 12)
          .map(({ element, rect }) => ({ target: descriptor(element), className: element.className?.toString().slice(0, 120) ?? '', left: Math.round(rect.left), right: Math.round(rect.right) }))

        return {
          viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? null,
          documentWidth: document.documentElement.scrollWidth,
          horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - width),
          criticalClipping: critical,
          undersizedTargets,
          tableFailures,
          tinyText,
          footerClipped,
          overflowElements,
          mainControls: [...document.querySelectorAll('main button,main input:not([type="hidden"]),main select,main textarea')].filter(visible).length,
        }
      }, { width: viewport.width, mobile: viewport.width < 1024 })

      let navigation = { expected: viewport.width < 1024 ? 'mobile' : 'desktop', functional: false, panelLinks: 0 }
      if (viewport.width < 1024) {
        const menuButton = page.getByRole('button', { name: 'Open menu' })
        if (await menuButton.isVisible().catch(() => false)) {
          await menuButton.click()
          const panel = page.locator('#mobile-menu-panel')
          navigation.panelLinks = await panel.locator('a[href]').count()
          const panelBox = await panel.boundingBox()
          navigation.functional = Boolean(
            await panel.isVisible().catch(() => false)
            && panelBox
            && panelBox.x >= -1
            && panelBox.x + panelBox.width <= viewport.width + 1
            && navigation.panelLinks > 0
          )
          await page.keyboard.press('Escape')
          navigation.closesOnEscape = !(await panel.isVisible().catch(() => false))
          navigation.focusReturns = await menuButton.evaluate((button) => document.activeElement === button)
        }
      } else {
        const primaryNav = page.getByRole('navigation', { name: 'Primary' })
        const menuButton = page.getByRole('button', { name: 'Open menu' })
        navigation.functional = await primaryNav.isVisible().catch(() => false) && !(await menuButton.isVisible().catch(() => false))
        navigation.panelLinks = await primaryNav.locator('a[href]').count().catch(() => 0)
      }

      const shouldScreenshot = route === '/' || (viewport.name === 'phone-375' && productRoutes.includes(route))
      if (shouldScreenshot) {
        await page.screenshot({
          path: path.join(screenshotRoot, `${viewport.name}--${routeSlug(route)}.png`),
          fullPage: false,
          animations: 'disabled',
        })
      }

      const violations = []
      if (status === null || status >= 400) violations.push(`HTTP status ${status}`)
      if (!metrics.viewportMeta) violations.push('Missing viewport meta')
      if (metrics.horizontalOverflow > 1) violations.push(`Horizontal overflow ${metrics.horizontalOverflow}px`)
      if (metrics.criticalClipping.length) violations.push(`${metrics.criticalClipping.length} clipped critical element(s)`)
      if (metrics.undersizedTargets.length) violations.push(`${metrics.undersizedTargets.length} undersized touch target(s)`)
      if (metrics.tableFailures.length) violations.push(`${metrics.tableFailures.length} uncontained table(s)`)
      if (metrics.tinyText.length) violations.push(`${metrics.tinyText.length} text node(s) below 10px`)
      if (metrics.footerClipped) violations.push('Footer clipped')
      if (!navigation.functional) violations.push(`${navigation.expected} navigation not functional`)
      if (navigation.closesOnEscape === false) violations.push('Mobile navigation does not close on Escape')
      if (navigation.focusReturns === false) violations.push('Mobile navigation does not return focus')
      // Page/console errors are retained in evidence. They are not responsive
      // violations: static export cannot service Worker-owned /api routes.

      results.push({ route, viewport, status, navigation, metrics, consoleErrors, pageErrors, violations })
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error)
      results.push({ route, viewport, status, navigationError, consoleErrors, pageErrors, violations: [navigationError] })
    } finally {
      page.off('console', onConsole)
      page.off('pageerror', onPageError)
    }

    completed += 1
    if (completed % 20 === 0 || completed === routes.length * viewports.length) {
      console.log(`Audited ${completed}/${routes.length * viewports.length}`)
    }
  }

  await context.close()
}

await browser.close()

const violations = results.filter((result) => result.violations.length)
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routes: routes.length,
  viewports,
  combinations: results.length,
  violationCount: violations.reduce((total, result) => total + result.violations.length, 0),
  failingCombinations: violations.length,
  consoleErrorCount: results.reduce((total, result) => total + result.consoleErrors.length, 0),
  results,
}

await writeFile(path.join(evidenceRoot, 'after.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({
  routes: report.routes,
  viewports: report.viewports.length,
  combinations: report.combinations,
  failingCombinations: report.failingCombinations,
  violationCount: report.violationCount,
  consoleErrorCount: report.consoleErrorCount,
}, null, 2))

if (violations.length) process.exitCode = 1
