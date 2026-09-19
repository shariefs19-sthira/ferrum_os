// Short-phone-viewport check: are Export DXF/IFC reachable, and how does the layout stack, at 390 x {568,664,700,844}?
// Usage: node scripts/audit/pw-short-viewport.mjs [url] [outDir]
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:3917/project-workspace';
const out = process.argv[3] || 'evidence/responsive-collision-20260919/shots';
const b = await chromium.launch();
for (const h of [568, 664, 700, 844]) {
  const c = await b.newContext({ viewport: { width: 390, height: h }, isMobile: true, hasTouch: true });
  await c.addInitScript(() => localStorage.setItem('ferrum-cookie-consent', 'accepted'));
  const p = await c.newPage();
  await p.goto(url); await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}/pw_390x${h}_initial.png` });
  const g = await p.evaluate(() => {
    const R = (e) => { if (!e) return null; const x = e.getBoundingClientRect(); return [x.x, x.y, x.width, x.height].map(Math.round); };
    const q = (s) => document.querySelector(s);
    const hit = (sel) => { const e = q(sel); if (!e) return null; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { rect: R(e), inViewport: r.bottom <= innerHeight && r.top >= 0, reachable: t === e || e.contains(t), by: t && !(t === e || e.contains(t)) ? `${t.tagName.toLowerCase()}[${(t.getAttribute('aria-label') || t.className || '').toString().slice(0, 50)}]` : undefined }; };
    return { vp: [innerWidth, innerHeight], fullscreenWrap: R(q('[data-workspace-fullscreen]')), section: R(q('[data-workspace-cockpit]')), canvasWrap: R(q('[data-cockpit-canvas]')), canvasCls: (q('[data-cockpit-canvas]') || {}).className, canvasSectionOverflow: getComputedStyle(q('[data-workspace-cockpit]')).overflow, status: R(q('[data-canvas-flow-result]')), exportBar: R(q('[data-export-bar]')), dxf: hit('[data-export-dxf]'), ifc: hit('[data-export-ifc]') };
  });
  console.log(h, JSON.stringify(g));
  await p.getByRole('button', { name: 'Controls', exact: true }).first().click().catch(() => {});
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/pw_390x${h}_controls.png` });
  await c.close();
}
await b.close();
