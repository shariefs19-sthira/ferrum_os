// SENTINEL read-only responsive collision audit.
// Usage: node scripts/audit/responsive-collision-audit.mjs [baseUrl] [outDir]   (ROUTES=/a,/b to override)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:3917';
const out = process.argv[3] || 'evidence/responsive-collision-20260919';
const widths = (process.env.WIDTHS || '320,360,375,390,430,768,1024,1440').split(',').map(Number);
const routes = (process.env.ROUTES || [
  '/', '/project-workspace', '/project-workspace/cockpit', '/project-workspace/demo', '/project-workspace/projects',
  '/products', '/products/landintel', '/products/designstudio', '/products/boq-pro', '/boq-pro', '/products/buildos',
  '/products/communitybuild', '/products/ferrum-projects', '/products/investflow', '/products/procurehub',
  '/products/promarket', '/products/structura', '/products/transact', '/pricing', '/demo', '/get-started',
  '/contact', '/login', '/dashboard', '/about', '/partners', '/careers', '/documentation', '/account',
  '/resources/faq', '/resources/glossary', '/resources/blog', '/resources/checklists',
].join(',')).split(',');

const probe = () => {
  const sel = 'a[href],button,input,select,textarea,summary,[role=button],[role=slider],[role=tab],[role=switch],[tabindex]:not([tabindex="-1"])';
  const vis = (el) => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.width > 0 && r.height > 0 &&
      !el.closest('[aria-hidden=true],[hidden],[inert]') &&
      !(el.closest('details:not([open])') && el.tagName !== 'SUMMARY' && !el.closest('summary'));
  };
  const desc = (el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 140),
      text: (el.getAttribute('aria-label') || el.innerText || el.value || el.name || '').trim().replace(/\s+/g, ' ').slice(0, 50),
      id: el.id || undefined,
      rect: [r.x, r.y, r.width, r.height].map(Math.round),
    };
  };
  const findings = [];
  const docW = document.documentElement.scrollWidth, vw = window.innerWidth;
  if (docW > vw + 1) {
    const wide = [...document.querySelectorAll('body *')]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && vis(e); })
      .slice(0, 4).map(desc);
    findings.push({ kind: 'h-overflow', sev: 'P2', detail: `scrollWidth ${docW} > viewport ${vw}`, els: wide });
  }
  const els = [...document.querySelectorAll(sel)].filter(vis);
  const seen = new Set();
  const rects = els.map((e) => ({ e, r: e.getBoundingClientRect() }));
  for (const { e, r } of rects) {
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    if (cx >= 0 && cy >= 0 && cx <= vw && cy <= innerHeight) {
      const top = document.elementFromPoint(cx, cy);
      const lab = e.closest('label');
      if (top && top !== e && !e.contains(top) && !top.contains(e) && !(lab && lab.contains(top))) {
        const d = desc(e), key = d.text + d.rect.join();
        if (!seen.has(key)) { seen.add(key); findings.push({ kind: 'covered', sev: 'P1', target: d, coveredBy: desc(top) }); }
      }
    }
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      const ov = ps.overflowX + ps.overflowY;
      if (/(hidden|clip)/.test(ov) && !/auto|scroll/.test(ov)) {
        const pr = p.getBoundingClientRect();
        const ix = Math.max(0, Math.min(r.right, pr.right) - Math.max(r.left, pr.left));
        const iy = Math.max(0, Math.min(r.bottom, pr.bottom) - Math.max(r.top, pr.top));
        const frac = (ix * iy) / (r.width * r.height);
        if (frac < 0.6) {
          const d = desc(e), key = 'clip' + d.text + d.rect.join();
          if (!seen.has(key)) { seen.add(key); findings.push({ kind: 'clipped', sev: frac < 0.1 ? 'P1' : 'P2', visibleFraction: +frac.toFixed(2), target: d, clipper: desc(p) }); }
          break;
        }
      }
    }
  }
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const a = rects[i], b = rects[j];
    if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ix > 2 && iy > 2) {
      const frac = (ix * iy) / Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (frac > 0.15) findings.push({ kind: 'control-overlap', sev: frac > 0.5 ? 'P1' : 'P2', overlapFrac: +frac.toFixed(2), a: desc(a.e), b: desc(b.e) });
    }
  }
  return findings;
};

const browser = await chromium.launch();
const all = [];
fs.mkdirSync(`${out}/shots`, { recursive: true });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w >= 768 ? 900 : 800 }, hasTouch: w < 768, isMobile: w < 768 });
  const page = await ctx.newPage();
  for (const route of routes) {
    try {
      const resp = await page.goto(base + route, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(1200);
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.max(300, Math.floor(page.viewportSize().height * 0.7));
      const seen = new Set(); const found = [];
      for (let y = 0; y < Math.min(H, 9000); y += step) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(120);
        for (const x of await page.evaluate(probe)) {
          const k = JSON.stringify([x.kind, x.target?.text ?? x.a?.text, x.target?.rect ?? x.a?.rect, x.coveredBy?.text ?? x.b?.text]);
          if (!seen.has(k)) { seen.add(k); x.scrollY = y; found.push(x); }
        }
      }
      all.push({ route, width: w, status: resp?.status(), count: found.length, findings: found });
      const f0 = found.find((x) => x.sev === 'P1');
      if (f0 && [320, 390, 768].includes(w)) {
        await page.evaluate((yy) => window.scrollTo(0, yy), f0.scrollY);
        await page.screenshot({ path: `${out}/shots/${(route.replace(/\W+/g, '_') || 'home')}_${w}.png` }).catch(() => {});
      }
    } catch (e) { all.push({ route, width: w, error: String(e).slice(0, 200) }); }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/results.json`, JSON.stringify(all, null, 1));
const sum = {};
for (const r of all) for (const f of r.findings || []) { const k = `${r.route} [${f.sev}] ${f.kind}`; (sum[k] ||= new Set()).add(r.width); }
console.log(Object.entries(sum).map(([k, v]) => `${k}: ${[...v].join('/')}`).join('\n'));
