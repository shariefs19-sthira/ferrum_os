#!/usr/bin/env node
/**
 * MASON cookie-allotment-20260919
 *
 * Serves the static `apps/web/out` build, then for each layout candidate
 * (A reserved band, B modal, C corner card, D current baseline) captures
 * VIEWPORT-CLIPPED screenshots (not full-page — see CONDUCTOR correction)
 * on `/`, `/products/landintel` and `/project-workspace/projects`
 * (signed-out — /api/auth/session is intercepted to return
 * {"user":null}), at the six required viewports, at three scroll
 * positions (top / mid / bottom), with the consent showing and again
 * after dismissal. For candidate A the inner scroll container is scrolled
 * (the page's own document is viewport-height), not the window.
 *
 * Also measures, per candidate/route/viewport/scroll-position: primary
 * elements >=30% covered by the bar, horizontal overflow, and whether
 * dismissal restores the reserved space.
 *
 * Headless isolated Chromium only (RULE 28). Run after `next build` has
 * produced apps/web/out.
 *
 * Usage: node scripts/cookie-allotment-audit.mjs
 */
import { createServer } from "node:http"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, "..")
// playwright is a devDependency of apps/web only (pnpm workspace isolation),
// so it is not resolvable as a bare specifier from scripts/ at the repo
// root — import it from apps/web's own node_modules instead.
const { chromium } = await import(
  pathToFileURL(path.join(REPO_ROOT, "apps/web/node_modules/playwright/index.mjs")).href
)
// sharp is only present transitively (pulled in by miniflare); resolve it
// the same way, for the side-by-side contact sheets only. If unavailable,
// we skip the sheets and say so, per the CONDUCTOR's correction (item 5).
let sharp = null
try {
  const sharpEntry = path.join(REPO_ROOT, "node_modules/.pnpm/sharp@0.35.2/node_modules/sharp/lib/index.js")
  if (existsSync(sharpEntry)) {
    const mod = await import(pathToFileURL(sharpEntry).href)
    sharp = mod.default || mod
  }
} catch {
  sharp = null
}

const OUT_DIR = path.join(REPO_ROOT, "apps/web/out")
const SHOT_DIR = "D:/ferrum_os.worktrees/cookie-allotment-options-20260919"

const VIEWPORTS = [
  { w: 375, h: 667 },
  { w: 375, h: 812 },
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1366, h: 768 },
  { w: 1824, h: 917 },
]

// Per-route selector for the "mid" scroll target — the densest primary
// interactive block the operator cares about, per the CONDUCTOR's brief.
const ROUTES = [
  { path: "/", label: "home", midSelector: "h2" }, // "Choose where your project starts" card heading
  { path: "/products/landintel", label: "landintel", midSelector: "[data-testid='parcel-toolbar'], form, .toolbar, button" },
  { path: "/project-workspace/projects", label: "workspace-projects", midSelector: "[data-testid='saved-artifacts-preview'], [data-artifact-preview], article, .grid" },
]

const VARIANTS = [
  { id: "A", label: "band", query: "cookieVariant=A" },
  { id: "B", label: "modal", query: "cookieVariant=B" },
  { id: "C", label: "corner", query: "cookieVariant=C" },
  { id: "D", label: "current", query: "" },
]

const MIME = {
  ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json", ".txt": "text/plain", ".xml": "application/xml",
}

function startServer(root, port) {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent(req.url.split("?")[0])
        if (urlPath === "/") urlPath = "/index.html"
        let filePath = path.join(root, urlPath)
        if (!existsSync(filePath)) {
          if (existsSync(filePath + ".html")) filePath = filePath + ".html"
          else if (existsSync(path.join(filePath, "index.html"))) filePath = path.join(filePath, "index.html")
          else filePath = path.join(root, "404.html")
        }
        const ext = path.extname(filePath)
        const body = await readFile(filePath)
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" })
        res.end(body)
      } catch (e) {
        res.writeHead(500)
        res.end(String(e))
      }
    })
    server.listen(port, "127.0.0.1", () => resolve(server))
    server.on("error", reject)
  })
}

function urlFor(base, route, query) {
  const sep = route.includes("?") ? "&" : "?"
  return query ? `${base}${route}${sep}${query}` : `${base}${route}`
}

// Resolve the scroller: for variant A the app shell is viewport-height and
// SiteShell's [data-site-scroll] region (siteShell.module.css) is the real,
// permanent scroll container; for every other variant it's the
// window/document element.
async function scrollInfo(page, variantId) {
  return page.evaluate((vid) => {
    const el = vid === "A" ? document.querySelector("[data-site-scroll]") : document.scrollingElement
    if (!el) return { maxScroll: 0, clientHeight: window.innerHeight, kind: "window" }
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
    return { maxScroll, clientHeight: el.clientHeight, kind: vid === "A" ? "container" : "window" }
  }, variantId)
}

async function scrollTo(page, variantId, y) {
  await page.evaluate(({ vid, y }) => {
    if (vid === "A") {
      const el = document.querySelector("[data-site-scroll]")
      if (el) el.scrollTop = y
    } else {
      window.scrollTo(0, y)
    }
  }, { vid: variantId, y })
  await page.waitForTimeout(80)
}

async function midTargetBottom(page, variantId, midSelector) {
  return page.evaluate(({ vid, sel }) => {
    const candidates = Array.from(document.querySelectorAll(sel)).filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && !el.closest("[data-cookie-consent]")
    })
    if (!candidates.length) return null
    // Pick the element furthest down the page as the "densest" landmark —
    // good enough proxy for "the block the failure was measured on".
    let best = candidates[0]
    let bestTop = 0
    const scroller = vid === "A" ? document.querySelector("[data-site-scroll]") : document.scrollingElement
    const scrollerScrollTop = scroller ? scroller.scrollTop : 0
    for (const el of candidates) {
      const r = el.getBoundingClientRect()
      const absTop = r.top + scrollerScrollTop
      if (absTop > bestTop) { bestTop = absTop; best = el }
    }
    const r = best.getBoundingClientRect()
    const scrollerScrollTop2 = scroller ? scroller.scrollTop : 0
    return r.bottom + scrollerScrollTop2
  }, { vid: variantId, sel: midSelector })
}

async function measureCoverage(page) {
  return page.evaluate(() => {
    const bar = document.querySelector("[data-cookie-consent]")
    const barBox = bar ? bar.getBoundingClientRect() : null
    const PRIMARY_SEL = "h1,h2,h3,a[href],button,input,select,textarea,[role=button],[role=toolbar]"
    const nodes = Array.from(document.querySelectorAll(PRIMARY_SEL))
    const covered = []
    const vw = window.innerWidth
    const vh = window.innerHeight
    for (const el of nodes) {
      if (el.closest("[data-cookie-consent]")) continue
      const style = getComputedStyle(el)
      if (style.position === "fixed" || style.position === "sticky") continue
      if (style.display === "none" || style.visibility === "hidden") continue
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) continue
      // Only count elements actually in the viewport (visible to the user
      // at this scroll position) — matches what the operator sees in the shot.
      if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue
      if (!barBox) continue
      // Clip-aware: an element cut off by a scrolling/hidden-overflow
      // ancestor (e.g. candidate A's scroll region, which ends exactly where
      // the consent row begins) is not visible below that edge, so it cannot
      // be "covered" there. getBoundingClientRect ignores that clipping, so
      // intersect the rect with every clipping ancestor first.
      let vis = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        const s = getComputedStyle(a)
        if (/(auto|scroll|hidden|clip)/.test(s.overflowX + s.overflowY)) {
          const ar = a.getBoundingClientRect()
          vis = {
            left: Math.max(vis.left, ar.left), top: Math.max(vis.top, ar.top),
            right: Math.min(vis.right, ar.right), bottom: Math.min(vis.bottom, ar.bottom),
          }
        }
      }
      const visW = Math.max(0, vis.right - vis.left)
      const visH = Math.max(0, vis.bottom - vis.top)
      const ix = Math.max(0, Math.min(vis.right, barBox.right) - Math.max(vis.left, barBox.left))
      const iy = Math.max(0, Math.min(vis.bottom, barBox.bottom) - Math.max(vis.top, barBox.top))
      const overlapArea = visW > 0 && visH > 0 ? ix * iy : 0
      const elArea = r.width * r.height
      const pct = elArea > 0 ? overlapArea / elArea : 0
      if (pct >= 0.3) covered.push({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 40), pct: Math.round(pct * 100) })
    }
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    return { covered, overflow }
  })
}

const rectOverlap = (a, b) => {
  if (!a || !b) return 0
  const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return Math.round(ix * iy)
}

// Per candidate / route / viewport structural checks: bar height, Got it
// size + hit-testability, SUTRA launcher vs Got it and vs the consent
// surface, first-viewport height lost, dismissal restore vs a never-shown
// baseline (within 2px) incl. no residual attribute/inline style, choice
// persisting across reload, and the page still rendering + dismissing when
// storage throws (safeStorage).
async function runChecks(browser, base) {
  const checks = []
  const baselineGeom = async (page) =>
    page.evaluate(() => {
      const h1 = document.querySelector("h1")
      const foot = document.querySelector("footer")
      return {
        docH: document.documentElement.scrollHeight,
        h1Top: h1 ? Math.round(h1.getBoundingClientRect().top + window.scrollY) : null,
        footBottom: foot ? Math.round(foot.getBoundingClientRect().bottom + window.scrollY) : null,
      }
    })
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      // Never-shown baseline: consent already accepted, no variant param.
      const baseCtx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
      await baseCtx.addInitScript(() => { try { localStorage.setItem("ferrum-cookie-consent", "accepted") } catch {} })
      await baseCtx.route("**/api/auth/session", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) }))
      const basePage = await baseCtx.newPage()
      await basePage.goto(urlFor(base, route.path, ""), { waitUntil: "networkidle" })
      await basePage.waitForTimeout(150)
      const baseline = await baselineGeom(basePage)
      await baseCtx.close()

      for (const variant of VARIANTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
        await ctx.route("**/api/auth/session", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) }))
        const page = await ctx.newPage()
        await page.goto(urlFor(base, route.path, variant.query), { waitUntil: "networkidle" })
        await page.waitForTimeout(200)
        const shown = await page.evaluate(() => {
          const surface = document.querySelector("[data-cookie-consent]")
          const gotIt = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.trim() === "Got it")
          const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { left: b.left, top: b.top, right: b.right, bottom: b.bottom, width: b.width, height: b.height } }
          let launcher = null
          document.querySelectorAll("button").forEach((b) => { if (b !== gotIt && getComputedStyle(b).position === "fixed" && /z-50/.test(b.className)) launcher = b })
          // Hit-test the centre of Got it: the topmost element there must be Got it (or its child).
          let hit = false
          if (gotIt) { const g = gotIt.getBoundingClientRect(); const t = document.elementFromPoint(g.left + g.width / 2, g.top + g.height / 2); hit = !!t && (t === gotIt || gotIt.contains(t)) }
          return {
            surface: r(surface), gotIt: r(gotIt), launcher: r(launcher), gotItHit: hit,
            cookieVar: getComputedStyle(document.documentElement).getPropertyValue("--cookie-consent-h").trim(),
            vh: window.innerHeight,
          }
        })
        const barH = shown.surface ? Math.round(shown.surface.height) : 0
        const entry = {
          variant: variant.id, route: route.label, viewport: `${vp.w}x${vp.h}`,
          consentSurfaceHeight: barH, consentSurfaceWidth: shown.surface ? Math.round(shown.surface.width) : 0,
          gotItWidth: shown.gotIt ? Math.round(shown.gotIt.width) : 0,
          gotItHeight: shown.gotIt ? Math.round(shown.gotIt.height) : 0,
          gotItHitTestable: shown.gotItHit,
          publishedCookieVar: shown.cookieVar,
          launcherPresent: !!shown.launcher,
          launcherVsGotItOverlapPx2: rectOverlap(shown.launcher, shown.gotIt),
          launcherVsConsentSurfaceOverlapPx2: rectOverlap(shown.launcher, shown.surface),
          launcherGapAboveSurface: shown.launcher && shown.surface && variant.id !== "B" ? Math.round(shown.surface.top - shown.launcher.bottom) : null,
          // A's first viewport: scroll region height; others: full viewport (bar overlays it).
          firstViewportContentAreaHeight: variant.id === "A" ? shown.vh - barH : shown.vh,
          firstViewportHeightCoveredByConsent: variant.id === "A" ? 0 : (variant.id === "B" ? shown.vh : (variant.id === "C" ? 0 : barH)),
        }

        // Dismiss + residual checks.
        await page.getByRole("button", { name: "Got it" }).click({ force: true })
        // Park the pointer: after the consent surface disappears the cursor
        // rests over whatever page control sat beneath it, and that control's
        // hover state can change page height (not a layout residual).
        await page.mouse.move(1, 1)
        await page.waitForTimeout(300)
        const after = await page.evaluate(() => {
          const shell = document.querySelector("[data-app-shell]")
          const region = document.querySelector("[data-site-scroll]")
          const cs = (el) => (el ? getComputedStyle(el) : null)
          return {
            htmlAttr: document.documentElement.getAttribute("data-cookie-variant"),
            htmlCookieVar: document.documentElement.style.getPropertyValue("--cookie-consent-h"),
            bodyInlineStyle: document.body.getAttribute("style"),
            htmlInertOrHidden: !!document.querySelector("[inert]"),
            shellHeightAuto: cs(shell) ? cs(shell).display !== "flex" : true,
            regionOverflow: cs(region) ? cs(region).overflowY : null,
            scrollLocked: getComputedStyle(document.body).overflow === "hidden" || getComputedStyle(document.documentElement).overflow === "hidden",
            wrapperLeft: !!document.getElementById("cookie-band-scroll"),
          }
        })
        const geom = await baselineGeom(page)
        entry.dismissDeltaVsNeverShown = {
          docH: geom.docH - baseline.docH,
          h1Top: geom.h1Top != null && baseline.h1Top != null ? geom.h1Top - baseline.h1Top : null,
          footBottom: geom.footBottom != null && baseline.footBottom != null ? geom.footBottom - baseline.footBottom : null,
        }
        const d = entry.dismissDeltaVsNeverShown
        entry.dismissRestoresWithin2px = [d.docH, d.h1Top, d.footBottom].every((v) => v == null || Math.abs(v) <= 2)
        entry.residualAfterDismiss = after
        entry.noResidual = after.htmlAttr === null && after.htmlCookieVar === "" && !after.bodyInlineStyle && !after.htmlInertOrHidden && after.shellHeightAuto && after.regionOverflow !== "auto" && !after.scrollLocked && !after.wrapperLeft

        // Persistence across reload.
        await page.reload({ waitUntil: "networkidle" })
        await page.waitForTimeout(150)
        entry.persistsAcrossReload = await page.evaluate(() => !document.querySelector("[data-cookie-consent]"))
        await ctx.close()

        // Storage blocked (RULE 44 / safeStorage): page renders, bar shows, Got it dismisses.
        const blockedCtx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
        await blockedCtx.addInitScript(() => {
          Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("denied", "SecurityError") } })
        })
        await blockedCtx.route("**/api/auth/session", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) }))
        const errors = []
        const bp = await blockedCtx.newPage()
        bp.on("pageerror", (e) => errors.push(String(e).slice(0, 120)))
        await bp.goto(urlFor(base, route.path, variant.query), { waitUntil: "networkidle" })
        await bp.waitForTimeout(200)
        const rendered = await bp.evaluate(() => !!document.querySelector("h1, h2") && !!document.querySelector("[data-cookie-consent]"))
        let dismissedWhenBlocked = false
        try { await bp.getByRole("button", { name: "Got it" }).click({ force: true, timeout: 2000 }); await bp.waitForTimeout(200); dismissedWhenBlocked = await bp.evaluate(() => !document.querySelector("[data-cookie-consent]")) } catch {}
        entry.storageBlocked = { pageRenders: rendered, dismissesForSession: dismissedWhenBlocked, pageErrors: errors }
        await blockedCtx.close()

        checks.push(entry)
      }
    }
  }
  return checks
}

async function run() {
  await mkdir(SHOT_DIR, { recursive: true })
  const port = 51392
  const server = await startServer(OUT_DIR, port)
  const base = `http://127.0.0.1:${port}`
  const browser = await chromium.launch({ headless: true })
  const report = []
  const midShotsForSheet = {} // key `${w}x${h}` -> {A:{shownPath}, B:.., ...}

  try {
    for (const variant of VARIANTS) {
      for (const route of ROUTES) {
        for (const vp of VIEWPORTS) {
          const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
          await context.route("**/api/auth/session", (r) =>
            r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: null }) })
          )
          const page = await context.newPage()
          const target = urlFor(base, route.path, variant.query)
          await page.goto(target, { waitUntil: "networkidle" })
          await page.waitForTimeout(150)

          const tagBase = `${variant.id}-${variant.label}-${route.label}-${vp.w}x${vp.h}`

          for (const state of ["shown", "dismissed"]) {
            if (state === "dismissed") {
              const gotIt = page.getByRole("button", { name: "Got it" })
              if (await gotIt.count()) {
                await gotIt.click({ force: true })
                await page.mouse.move(1, 1) // park pointer: no stray hover state in the "dismissed" shots
                await page.waitForTimeout(250)
              }
            }

            const { maxScroll, clientHeight } = await scrollInfo(page, variant.id)
            const midBottom = await midTargetBottom(page, variant.id, route.midSelector)
            // Align the target's bottom edge with the bottom of the actual
            // scroll region (for A that is viewport minus the consent row;
            // for B/C/D it is the full viewport) — NOT the raw viewport height.
            const midY = midBottom != null ? Math.max(0, Math.min(maxScroll, midBottom - clientHeight)) : Math.round(maxScroll / 2)

            const positions = [
              { name: "top", y: 0 },
              { name: "mid", y: midY },
              { name: "bottom", y: maxScroll },
            ]

            for (const pos of positions) {
              await scrollTo(page, variant.id, pos.y)
              const shotPath = path.join(SHOT_DIR, `${tagBase}-${state}-${pos.name}.png`)
              await page.screenshot({ path: shotPath, fullPage: false })

              const { covered, overflow } = await measureCoverage(page)
              report.push({
                variant: variant.id, route: route.label, viewport: `${vp.w}x${vp.h}`,
                state, position: pos.name, scrollY: pos.y,
                coveredCount: covered.length, covered, horizontalOverflow: overflow,
              })

              if (route.label === "workspace-projects" && pos.name === "mid" && state === "shown") {
                const key = `${vp.w}x${vp.h}`
                midShotsForSheet[key] = midShotsForSheet[key] || {}
                midShotsForSheet[key][variant.id] = shotPath
              }
            }
          }

          await context.close()
        }
      }
    }
    const checks = await runChecks(browser, base)
    await writeFile(path.join(SHOT_DIR, "cookie-allotment-checks.json"), JSON.stringify(checks, null, 2))
    console.log(`Wrote ${checks.length} structural check rows to cookie-allotment-checks.json`)
  } finally {
    await browser.close()
    server.close()
  }

  const reportPath = path.join(SHOT_DIR, "cookie-allotment-report.json")
  await writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(`Wrote ${report.length} measurements to ${reportPath}`)

  // Contact sheets: A|B|C|D stitched left-to-right, one per viewport, for
  // the workspace-projects "-mid-shown" shot (where the failure was
  // measured). Skipped (with a message, not silently) if sharp is missing.
  if (!sharp) {
    console.log("SKIPPED contact sheets: sharp not resolvable in this workspace.")
  } else {
    const LABEL_H = 28
    for (const vpKey of Object.keys(midShotsForSheet)) {
      const shots = midShotsForSheet[vpKey]
      const order = ["A", "B", "C", "D"]
      const present = order.filter((id) => shots[id])
      if (present.length < 1) continue
      const metas = await Promise.all(present.map((id) => sharp(shots[id]).metadata()))
      const w = Math.max(...metas.map((m) => m.width))
      const h = Math.max(...metas.map((m) => m.height))
      const sheetW = w * present.length
      const sheetH = h + LABEL_H
      const labelSvg = (text, width) =>
        Buffer.from(
          `<svg width="${width}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111318"/><text x="10" y="19" font-family="sans-serif" font-size="16" fill="#ffffff">${text}</text></svg>`
        )
      const composites = []
      for (let i = 0; i < present.length; i++) {
        const id = present[i]
        const x = i * w
        composites.push({ input: labelSvg(`${id} — ${VARIANTS.find((v) => v.id === id).label}`, w), left: x, top: 0 })
        composites.push({ input: shots[id], left: x, top: LABEL_H })
      }
      const sheetPath = path.join(SHOT_DIR, `SHEET-${vpKey}-projects-mid.png`)
      await sharp({ create: { width: sheetW, height: sheetH, channels: 4, background: "#111318" } })
        .composite(composites)
        .png()
        .toFile(sheetPath)
      console.log(`Wrote contact sheet ${sheetPath}`)
    }
  }

  console.log(`Screenshots in ${SHOT_DIR}`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
