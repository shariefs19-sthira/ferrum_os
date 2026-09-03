import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(new URL('../apps/web/package.json', import.meta.url))
const { chromium } = require('playwright')

const phase = process.argv[2]
if (!['before', 'after'].includes(phase)) {
  throw new Error('Usage: node scripts/w2-375-typography-audit.mjs <before|after> [baseUrl]')
}

const baseUrl = (process.argv[3] || 'http://127.0.0.1:4175').replace(/\/$/, '')
const appRoot = path.resolve('apps', 'web', 'app')
const evidenceRoot = path.resolve('docs', 'evidence', 'w2-375', phase)
const focalRoutes = ['/', '/products/landintel', '/resources', '/resources/tools']
const focalViewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '375x812', width: 375, height: 812 },
]

async function collectRoutes(directory = appRoot) {
  const entries = await readdir(directory, { withFileTypes: true })
  const routes = []
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.name === 'api') continue
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) routes.push(...await collectRoutes(entryPath))
    if (entry.isFile() && entry.name === 'page.tsx') {
      const relative = path.relative(appRoot, directory)
      if (relative.split(path.sep).some((segment) => segment.startsWith('['))) continue
      routes.push(relative ? `/${relative.split(path.sep).join('/')}` : '/')
    }
  }
  return routes
}

async function inspectPage(page) {
  return await page.evaluate(() => {
    const isVisible = (element) => {
      const bounds = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return bounds.width > 1 && bounds.height > 1 && style.display !== 'none' && style.visibility !== 'hidden'
    }
    const lineRects = (element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      const rects = []
      let node = walker.nextNode()
      while (node) {
        const parentTag = node.parentElement?.tagName.toLowerCase()
        if (node.textContent?.trim() && !['svg', 'text', 'title', 'style', 'script'].includes(parentTag || '')) {
          const range = document.createRange()
          range.selectNodeContents(node)
          rects.push(...Array.from(range.getClientRects()))
        }
        node = walker.nextNode()
      }
      const lines = []
      for (const rect of rects) {
        const top = Math.round(rect.top)
        const existing = lines.find((line) => Math.abs(line.top - top) <= 2)
        if (existing) {
          existing.left = Math.min(existing.left, rect.left)
          existing.right = Math.max(existing.right, rect.right)
          existing.width = existing.right - existing.left
        } else {
          lines.push({ top, left: rect.left, right: rect.right, width: rect.width })
        }
      }
      return lines.sort((a, b) => a.top - b.top)
    }
    const descriptor = (element) => ({
      tag: element.tagName.toLowerCase(),
      text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 120) || '',
      width: Math.round(element.getBoundingClientRect().width),
      lines: lineRects(element).length,
    })

    const wrappedLinks = Array.from(document.querySelectorAll('a'))
      .filter(isVisible)
      .map((element) => ({ element, lines: lineRects(element) }))
      .filter(({ element, lines }) => (
        lines.length > 1
        && (element.textContent?.replace(/\s+/g, ' ').trim().length || 0) <= 48
        && element.getBoundingClientRect().width < 160
      ))
      .map(({ element }) => descriptor(element))

    const crampedLabels = Array.from(document.querySelectorAll('label, button'))
      .filter(isVisible)
      .map((element) => ({ element, lines: lineRects(element) }))
      .filter(({ element, lines }) => lines.length > 1 && element.getBoundingClientRect().width < 128)
      .map(({ element }) => descriptor(element))

    const orphanHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
      .filter(isVisible)
      .map((element) => ({ element, lines: lineRects(element) }))
      .filter(({ lines }) => lines.length > 1 && lines.at(-1).width < Math.max(...lines.map((line) => line.width)) * 0.3)
      .map(({ element }) => descriptor(element))

    const clippedText = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, a, label, button, span'))
      .filter(isVisible)
      .filter((element) => {
        const style = getComputedStyle(element)
        return element.scrollWidth > element.clientWidth + 2 && !['auto', 'scroll'].includes(style.overflowX)
      })
      .map(descriptor)

    const footerTagline = document.querySelector('footer p')
    let footer = null
    if (footerTagline && isVisible(footerTagline)) {
      const style = getComputedStyle(footerTagline)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) context.font = style.font
      const ch = context?.measureText('0').width || Number.parseFloat(style.fontSize) * 0.5
      footer = {
        lines: lineRects(footerTagline).length,
        measureCh: Number((footerTagline.getBoundingClientRect().width / ch).toFixed(1)),
        text: footerTagline.textContent?.replace(/\s+/g, ' ').trim() || '',
      }
    }

    return {
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      wrappedLinks,
      crampedLabels,
      orphanHeadings,
      clippedText,
      footer,
    }
  })
}

async function visit(page, route, viewport, screenshotPath) {
  await page.setViewportSize(viewport)
  const consoleErrors = []
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  }
  page.on('console', onConsole)
  let response
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      break
    } catch (error) {
      if (attempt > 0 || !String(error).includes('ERR_ABORTED')) throw error
      await page.waitForTimeout(250)
    }
  }
  await page.waitForTimeout(400)
  const cookieConsent = page.getByRole('button', { name: 'Got it' })
  if (await cookieConsent.isVisible().catch(() => false)) await cookieConsent.click()
  const audit = await inspectPage(page)
  if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true })
  let mobileMenu = null
  if (route === '/' && viewport.width < 1024) {
    const menuButton = page.getByRole('button', { name: 'Open menu' })
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click()
      mobileMenu = await page.locator('#mobile-menu-panel').evaluate((panel) => {
        const links = Array.from(panel.querySelectorAll('a'))
        const wrappedLinks = links.filter((link) => {
          const range = document.createRange()
          range.selectNodeContents(link)
          const lineTops = new Set(Array.from(range.getClientRects()).map((rect) => Math.round(rect.top)))
          return lineTops.size > 1
        }).map((link) => link.textContent?.trim() || '')
        return {
          width: Math.round(panel.getBoundingClientRect().width),
          horizontalOverflow: panel.scrollWidth > panel.clientWidth,
          wrappedLinks,
        }
      })
      if (screenshotPath) await page.screenshot({ path: screenshotPath.replace(/\.png$/, '-menu-open.png'), fullPage: false })
      await page.getByRole('button', { name: 'Close menu' }).click()
    }
  }
  page.off('console', onConsole)
  return {
    route,
    viewport: `${viewport.width}x${viewport.height}`,
    status: response?.status() || 0,
    finalPath: new URL(page.url()).pathname,
    ...audit,
    mobileMenu,
    consoleErrors,
  }
}

await mkdir(evidenceRoot, { recursive: true })
const routes = (await collectRoutes()).sort()
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const allRoutes = []

for (const route of routes) {
  allRoutes.push(await visit(page, route, { width: 1440, height: 900 }))
}

const focal = []
for (const viewport of focalViewports) {
  for (const route of focalRoutes) {
    const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')
    focal.push(await visit(page, route, viewport, path.join(evidenceRoot, `${name}-${viewport.name}.png`)))
  }
}

await browser.close()
const result = { phase, baseUrl, routes: routes.length, allRoutes, focal }
await writeFile(path.join(evidenceRoot, 'audit.json'), `${JSON.stringify(result, null, 2)}\n`)

const summarize = (row) => ({
  route: row.route,
  viewport: row.viewport,
  status: row.status,
  overflow: row.horizontalOverflow,
  links: row.wrappedLinks.length,
  labels: row.crampedLabels.length,
  orphans: row.orphanHeadings.length,
  clipped: row.clippedText.length,
  footerLines: row.footer?.lines ?? 0,
  footerCh: row.footer?.measureCh ?? 0,
  menuWidth: row.mobileMenu?.width ?? 0,
  menuWraps: row.mobileMenu?.wrappedLinks.length ?? 0,
  errors: row.consoleErrors.length,
})
console.table(focal.map(summarize))
console.log(`1440 route crawl: ${allRoutes.length} routes`)

if (phase === 'after') {
  const failures = [...allRoutes, ...focal].filter((row) => (
    row.status >= 400
    || row.horizontalOverflow
    || row.wrappedLinks.length > 0
    || row.crampedLabels.length > 0
    || row.clippedText.length > 0
    || (Number.parseInt(row.viewport, 10) >= 1024 && row.footer && (row.footer.lines > 2 || row.footer.measureCh < 24))
    || (row.route === '/' && Number.parseInt(row.viewport, 10) < 1024 && (!row.mobileMenu || row.mobileMenu.width < 288 || row.mobileMenu.horizontalOverflow || row.mobileMenu.wrappedLinks.length > 0))
  ))
  if (failures.length > 0) {
    console.error(`W2-375 acceptance failures: ${failures.length}`)
    console.error(JSON.stringify(failures.map(summarize), null, 2))
    process.exitCode = 1
  }
}
