// Group results.json findings by offender pair so site-wide shared-component causes stand out.
import fs from 'node:fs';
const f = process.argv[2] || 'evidence/responsive-collision-20260919/results.json';
const all = JSON.parse(fs.readFileSync(f, 'utf8'));
const g = {};
const sig = (d) => d ? `${d.tag}${d.text ? '"' + d.text.slice(0, 28) + '"' : ''}.${(d.cls || '').split(' ').slice(0, 4).join('.')}` : '';
for (const r of all) for (const x of r.findings || []) {
  if (x.kind === 'h-overflow') { const k = `h-overflow ${x.els?.[0] ? sig(x.els[0]) : ''}`; (g[k] ||= { sev: x.sev, routes: new Set(), widths: new Set() }); g[k].routes.add(r.route); g[k].widths.add(r.width); continue; }
  const k = x.kind === 'covered' ? `covered ${sig(x.target)}  BY  ${sig(x.coveredBy)}` : x.kind === 'clipped' ? `clipped ${sig(x.target)}  IN ${sig(x.clipper)}` : `overlap ${sig(x.a)}  X  ${sig(x.b)}`;
  (g[k] ||= { sev: x.sev, routes: new Set(), widths: new Set() }); g[k].routes.add(r.route); g[k].widths.add(r.width);
  if (x.sev === 'P1') g[k].sev = 'P1';
}
const rows = Object.entries(g).sort((a, b) => b[1].routes.size - a[1].routes.size);
for (const [k, v] of rows.slice(0, +process.argv[3] || 40)) console.log(`[${v.sev}] routes=${v.routes.size} w=${[...v.widths].sort((a, b) => a - b).join('/')}\n   ${k.slice(0, 240)}\n   e.g. ${[...v.routes].slice(0, 3).join(', ')}`);
