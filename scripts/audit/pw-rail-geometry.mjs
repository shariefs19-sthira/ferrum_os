// Geometry of the desktop ToolsRuler rail vs canvas toolbar / export bar. Usage: node scripts/audit/pw-rail-geometry.mjs <url> <width> [height]
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const [url, w, h] = [process.argv[2], +process.argv[3], +process.argv[4] || 900];
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: w, height: h } });
await c.addInitScript(() => localStorage.setItem('ferrum-cookie-consent', 'accepted'));
const p = await c.newPage();
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(2500);
const o = await p.evaluate(() => {
  const R = (e) => { if (!e) return null; const x = e.getBoundingClientRect(); return [x.x, x.y, x.width, x.height].map(Math.round); };
  const rail = document.querySelector('aside[aria-label="Workspace tools"]:not([data-mobile-workspace-tools] *)') || [...document.querySelectorAll('aside[aria-label="Workspace tools"]')].find((e) => e.getBoundingClientRect().width > 0);
  const railWrap = rail && rail.parentElement;
  const tb = document.querySelector('[data-mobile-cockpit-toolbar]');
  const top = tb && tb.previousElementSibling;
  const ex = document.querySelector('[data-export-bar]');
  const btns = rail ? [...rail.querySelectorAll('button')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => {
    const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { label: (e.innerText || '').trim().slice(0, 14), rect: R(e), reachable: t === e || e.contains(t), hitBy: t && !(t === e || e.contains(t)) ? (t.getAttribute('aria-label') || t.innerText || t.tagName).toString().slice(0, 24) : undefined };
  }) : null;
  return { vp: [innerWidth, innerHeight], railWrap: R(railWrap), railWrapCls: railWrap && railWrap.className, canvasToolbarRow: R(top), taskToolbar: R(tb), exportBar: R(ex), railButtons: btns };
});
console.log(JSON.stringify(o));
await b.close();
