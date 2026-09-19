// Open the mobile "Controls" sheet on a workspace route and dump geometry + stacking.
// Usage: node scripts/audit/pw-controls-state.mjs <url> <width> <height> <shotPath> [buttonText]
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const [url, w, h, shot, label = 'Controls'] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 800, process.argv[5], process.argv[6]];
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
const p = await c.newPage();
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(2500);
const pre = await p.evaluate(() => !!document.querySelector('[role=dialog][aria-label*="cookie" i], [data-cookie-consent], [aria-label*="cookie" i]'));
await p.getByRole('button', { name: label, exact: true }).first().click({ timeout: 5000 }).catch((e) => console.log('click failed', String(e).slice(0, 120)));
await p.waitForTimeout(800);
const info = await p.evaluate(() => {
  const r = (e) => { const x = e.getBoundingClientRect(); return [x.x, x.y, x.width, x.height].map(Math.round); };
  const out = { vp: [innerWidth, innerHeight], cookie: null, sheet: null, sliders: [], export: null, hitTests: [] };
  const ck = [...document.querySelectorAll('button')].find((e) => /Got it/.test(e.innerText));
  if (ck) { let n = ck; while (n && getComputedStyle(n).position !== 'fixed') n = n.parentElement; out.cookie = n ? { rect: r(n), z: getComputedStyle(n).zIndex, cls: String(n.className).slice(0, 120) } : 'no fixed ancestor'; }
  const sh = document.querySelector('[data-mobile-sheet]');
  if (sh) { const s = getComputedStyle(sh); out.sheet = { tag: sh.tagName, rect: r(sh), z: s.zIndex, pos: s.position, maxH: s.maxHeight, scrollH: sh.scrollHeight, clientH: sh.clientHeight, cls: String(sh.className).slice(0, 160) }; }
  const ex = document.querySelector('[data-export-bar]'); if (ex) out.export = { rect: r(ex), z: getComputedStyle(ex).zIndex };
  for (const el of document.querySelectorAll('input[type=range]')) {
    const box = el.getBoundingClientRect(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const top = document.elementFromPoint(cx, cy);
    out.sliders.push({ label: el.getAttribute('aria-label'), rect: r(el), out: (el.parentElement.querySelector('output') || {}).innerText, outRect: el.parentElement.querySelector('output') ? r(el.parentElement.querySelector('output')) : null, hitOk: top === el, hit: top && (top.tagName + '.' + String(top.className).slice(0, 60)) });
  }
  // hit-test all controls inside the sheet
  if (sh) for (const el of sh.querySelectorAll('button,input,a')) {
    const bx = el.getBoundingClientRect(); if (!bx.width) continue;
    const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2; const inVp = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight;
    const top = inVp ? document.elementFromPoint(cx, cy) : null;
    out.hitTests.push({ t: (el.getAttribute('aria-label') || el.innerText || el.type).slice(0, 30), rect: r(el), inVp, ok: !inVp ? 'offscreen' : (top === el || el.contains(top) || (top && top.contains(el))) , by: top && !(top === el || el.contains(top)) ? top.tagName + '.' + String(top.className).slice(0, 50) : undefined });
  }
  return out;
});
console.log(JSON.stringify({ cookieBeforeClick: pre, ...info }, null, 1));
if (shot) await p.screenshot({ path: shot });
await b.close();
