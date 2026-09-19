// Ancestry/stacking inspector for one route+width. Usage: node scripts/audit/pw-inspect.mjs <url> <width> <shotPath>
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../apps/web/package.json', import.meta.url));
const { chromium } = require('playwright');
const [url, w, shot] = [process.argv[2], +process.argv[3] || 390, process.argv[4]];
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: w, height: 800 }, isMobile: w < 768, hasTouch: w < 768 });
const p = await c.newPage();
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(2000);
const info = await p.evaluate(() => {
  const chain = (el) => { const o = []; for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const s = getComputedStyle(n), r = n.getBoundingClientRect();
    o.push(`${n.tagName.toLowerCase()}${n.id ? '#' + n.id : ''}[${(typeof n.className === 'string' ? n.className : '').slice(0, 90)}] pos=${s.position} z=${s.zIndex} ov=${s.overflow} tr=${s.transform === 'none' ? '-' : 'y'} rect=${[r.x, r.y, r.width, r.height].map(Math.round)} data=${[...n.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name + '=' + a.value.slice(0, 30)).join(',')}`); } return o; };
  const out = {};
  const btn = [...document.querySelectorAll('button')].find((e) => { const r = e.getBoundingClientRect(); return e.className.includes('min-h-14') && r.width > 300; });
  out.accordionBtn = btn ? chain(btn) : null;
  out.accordionBtnHTML = btn ? btn.outerHTML.slice(0, 400) : null;
  const sl = [...document.querySelectorAll('input[type=range],[role=slider]')].map((e) => { const r = e.getBoundingClientRect(); return { t: e.outerHTML.slice(0, 160), rect: [r.x, r.y, r.width, r.height].map(Math.round), chain: chain(e).slice(0, 6) }; });
  out.sliders = sl;
  const ex = [...document.querySelectorAll('button')].find((e) => /Export DXF/.test(e.innerText));
  out.exportChain = ex ? chain(ex).slice(0, 6) : null;
  return out;
});
console.log(JSON.stringify(info, null, 1));
if (shot) await p.screenshot({ path: shot, fullPage: false });
await b.close();
