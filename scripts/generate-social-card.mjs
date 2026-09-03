import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const packagePath = process.env.FERRUM_PLAYWRIGHT_PACKAGE || new URL('../apps/web/package.json', import.meta.url)
const require = createRequire(typeof packagePath === 'string' ? pathToFileURL(packagePath) : packagePath)
const { chromium } = require('playwright')

const publicDirectory = path.resolve('apps', 'web', 'public')
const socialCardPath = path.join(publicDirectory, 'social-card.png')

await mkdir(publicDirectory, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

await page.setContent(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
      body {
        background: #ffffff;
        color: #070707;
        font-family: Inter, Arial, Helvetica, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      .card {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
        gap: 56px;
        width: 100%;
        height: 100%;
        padding: 60px 64px 54px;
      }
      .grid {
        position: absolute;
        inset: 0;
        opacity: 0.65;
        background-image:
          linear-gradient(rgba(7, 7, 7, 0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(7, 7, 7, 0.045) 1px, transparent 1px);
        background-size: 32px 32px;
      }
      .left, .right { position: relative; z-index: 1; }
      .brand { display: flex; align-items: center; gap: 16px; }
      .brand-name { font-size: 25px; font-weight: 700; letter-spacing: -0.02em; }
      .kicker {
        margin-top: 64px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1 {
        margin: 18px 0 0;
        max-width: 650px;
        font-size: 64px;
        line-height: 0.98;
        letter-spacing: -0.045em;
      }
      .summary {
        margin: 28px 0 0;
        max-width: 600px;
        font-size: 19px;
        line-height: 1.45;
        color: rgba(7, 7, 7, 0.7);
      }
      .journey {
        position: absolute;
        left: 0;
        bottom: 4px;
        display: flex;
        gap: 13px;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
      }
      .journey span:nth-child(even) { color: rgba(7, 7, 7, 0.35); }
      .right {
        align-self: center;
        border: 1px solid rgba(7, 7, 7, 0.22);
        border-radius: 14px;
        background: rgba(245, 245, 245, 0.96);
        padding: 24px;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(7, 7, 7, 0.18);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .mark { display: flex; gap: 5px; }
      .mark i { width: 24px; height: 5px; border-radius: 999px; display: block; }
      .mark .saffron { background: #ff9933; }
      .mark .white { background: #ffffff; border: 1px solid rgba(7, 7, 7, 0.15); }
      .mark .green { background: #138808; }
      .systems { display: grid; gap: 12px; margin-top: 20px; }
      .system {
        display: grid;
        grid-template-columns: 38px 1fr auto;
        gap: 12px;
        align-items: center;
        min-height: 67px;
        padding: 12px;
        border: 1px solid rgba(7, 7, 7, 0.18);
        border-radius: 9px;
        background: #ffffff;
      }
      .index {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: #070707;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
      }
      .system strong { display: block; font-size: 15px; }
      .system small {
        display: block;
        margin-top: 4px;
        color: rgba(7, 7, 7, 0.62);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .arrow { font-size: 20px; color: rgba(7, 7, 7, 0.42); }
      .panel-foot {
        display: flex;
        justify-content: space-between;
        margin-top: 18px;
        color: rgba(7, 7, 7, 0.62);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.13em;
        text-transform: uppercase;
      }
      .tricolor {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 2;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        height: 10px;
      }
      .tricolor span:nth-child(1) { background: #ff9933; }
      .tricolor span:nth-child(2) { background: #ffffff; border-top: 1px solid rgba(7, 7, 7, 0.12); }
      .tricolor span:nth-child(3) { background: #138808; }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="grid" aria-hidden="true"></div>
      <section class="left">
        <div class="brand">
          <svg viewBox="0 0 64 64" width="54" height="54" role="img" aria-label="Fe 26 brand mark">
            <defs><clipPath id="tile"><rect width="64" height="64" rx="10" /></clipPath></defs>
            <g clip-path="url(#tile)">
              <rect width="64" height="21.33" fill="#FF9933" />
              <rect y="21.33" width="64" height="21.34" fill="#FFFFFF" />
              <rect y="42.67" width="64" height="21.33" fill="#138808" />
            </g>
            <text x="32" y="39" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="27" fill="#0B1F3A">Fe</text>
            <text x="32" y="58.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">26</text>
          </svg>
          <span class="brand-name">Ferrum OS</span>
        </div>
        <div class="kicker">India-first construction operating system</div>
        <h1>Build certainty from land to delivery.</h1>
        <p class="summary">Land intelligence, design, structural checks, BOQ, procurement and project finance in one connected platform.</p>
        <div class="journey"><span>Land</span><span>&rarr;</span><span>Design</span><span>&rarr;</span><span>Build</span><span>&rarr;</span><span>Invest</span></div>
      </section>
      <section class="right" aria-label="Ferrum OS system map">
        <div class="panel-head"><span>Connected system map</span><span class="mark"><i class="saffron"></i><i class="white"></i><i class="green"></i></span></div>
        <div class="systems">
          <div class="system"><span class="index">01</span><div><strong>LandIntel</strong><small>Parcel input</small></div><span class="arrow">&rarr;</span></div>
          <div class="system"><span class="index">02</span><div><strong>DesignStudio</strong><small>Test fit</small></div><span class="arrow">&rarr;</span></div>
          <div class="system"><span class="index">03</span><div><strong>Structura</strong><small>IS check</small></div><span class="arrow">&rarr;</span></div>
          <div class="system"><span class="index">04</span><div><strong>BOQ Pro</strong><small>Rate engine</small></div><span class="arrow">&rarr;</span></div>
        </div>
        <div class="panel-foot"><span>Fe&middot;26 / India-first</span><span>Static + edge</span></div>
      </section>
      <div class="tricolor" aria-hidden="true"><span></span><span></span><span></span></div>
    </main>
  </body>
</html>
`)

await page.screenshot({ path: socialCardPath, type: 'png' })
await browser.close()

console.log(`${socialCardPath} -> 1200x630`)
