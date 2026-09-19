// For workspace-like routes: open each mobile toolbar/menu control in turn, then hit-test every visible control
// (is elementFromPoint at its centre the control itself?) and check panel/viewport/export-bar geometry.
// Usage: node scripts/audit/workspace-state-sweep.mjs [baseUrl] [outDir]   (ROUTES/WIDTHS/HEIGHTS env override)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3917';
const out = process.argv[3] || 'evidence/responsive-collision-20260919';
const routes = (process.env.ROUTES || '/project-workspace,/project-workspace/cockpit,/project-workspace/demo,/products/landintel,/products/designstudio,/products/boq-pro').split(',');
const widths = (process.env.WIDTHS || '320,360,375,390,430,768,1024,1440').split(',').map(Number);
const heights = (process.env.HEIGHTS || '568,664,800').split(',').map(Number);
fs.mkdirSync(`${out}/shots`, { recursive: true });

const hit = () => {
  const bad = [];
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0 && !e.closest('[aria-hidden=true],[hidden],[inert]') && !(e.closest('details:not([open])') && e.tagName !== 'SUMMARY'); };
  const sheet = document.querySelector('[data-mobile-sheet]');
  const scope = sheet || document;
  for (const e of scope.querySelectorAll('a[href],button,input,select,textarea,summary,[role=button]')) {
    if (!vis(e)) continue;
    const r = e.getBoundingClientRect();
    const cx = Math.min(Math.max(r.x + r.width / 2, 0), vw - 1), cy = r.y + r.height / 2;
    const label = (e.getAttribute('aria-label') || e.innerText || e.type || '').trim().replace(/\s+/g, ' ').slice(0, 36);
    if (r.right < 0 || r.left > vw + 1) { bad.push({ why: 'offscreen-x', label, rect: [r.x, r.y, r.width, r.height].map(Math.round) }); continue; }
    if (sheet && (r.top < 0 || r.bottom > vh) && !sheet.scrollHeight) continue;
    if (cy < 0 || cy > vh) { // reachable by scrolling inside a scrollable ancestor?
      let p = e.parentElement, scroll = false; for (; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowY) && p.scrollHeight > p.clientHeight) { scroll = true; break; } }
      if (!scroll && sheet) bad.push({ why: 'unreachable-offscreen-y', label, rect: [r.x, r.y, r.width, r.height].map(Math.round) });
      continue;
    }
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== e && !e.contains(top) && !top.contains(e) && !e.closest('label')?.contains(top))
      bad.push({ why: 'covered', label, rect: [r.x, r.y, r.width, r.height].map(Math.round), by: `${top.tagName.toLowerCase()}.${String(top.className).slice(0, 60)}${top.getAttribute('aria-label') ? '[' + top.getAttribute('aria-label').slice(0, 30) + ']' : ''}` });
  }
  if (sheet) { const r = sheet.getBoundingClientRect(); if (r.top < 0 || r.bottom > vh + 1) bad.push({ why: 'sheet-exceeds-viewport', rect: [r.x, r.y, r.width, r.height].map(Math.round), vh }); if (r.top < 60) bad.push({ why: 'sheet-covers-header (info)', top: Math.round(r.top) }); }
  if (document.documentElement.scrollWidth > vw + 1) bad.push({ why: 'h-overflow', sw: document.documentElement.scrollWidth, vw });
  return bad;
};

const b = await chromium.launch();
const res = [];
for (const w of widths) for (const h of (w >= 768 ? [900] : heights)) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 768, hasTouch: w < 768 });
  await ctx.addInitScript(() => { try { localStorage.setItem('ferrum-cookie-consent', 'accepted'); } catch { /* */ } });
  const p = await ctx.newPage();
  for (const route of routes) {
    await p.goto(base + route, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(1500);
    const names = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-mobile-cockpit-toolbar] button, [data-workflow-rail] summary, [data-workflow-rail] button, header button, main button')]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight; }).map((e) => (e.getAttribute('aria-label') || e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 24)).filter(Boolean))].slice(0, 14));
    const states = ['(initial)', ...names];
    for (const s of states) {
      if (s !== '(initial)') {
        await p.goto(base + route, { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(900);
        const ok = await p.evaluate((label) => { const el = [...document.querySelectorAll('button,summary')].find((e) => (e.getAttribute('aria-label') || e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 24) === label && e.getBoundingClientRect().width > 0); if (!el) return false; el.click(); return true; }, s);
        if (!ok) continue;
        await p.waitForTimeout(500);
      }
      const bad = await p.evaluate(hit);
      const real = bad.filter((x) => !/\(info\)/.test(x.why));
      res.push({ route, w, h, state: s, bad });
      if (real.length && (w === 390 || w === 320) ) await p.screenshot({ path: `${out}/shots/state_${route.replace(/\W+/g, '_')}_${w}x${h}_${s.replace(/\W+/g, '_')}.png` }).catch(() => {});
    }
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${out}/state-results.json`, JSON.stringify(res, null, 1));
const sum = {};
for (const r of res) for (const x of r.bad) { const k = `${r.route} | ${r.state} | ${x.why} ${x.label ?? ''}`; (sum[k] ||= new Set()).add(`${r.w}x${r.h}`); }
console.log(Object.entries(sum).map(([k, v]) => `${k}: ${[...v].join(' ')}`).join('\n'));
