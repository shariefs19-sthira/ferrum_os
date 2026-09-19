import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const require = createRequire(pathToFileURL(path.resolve('apps','web','package.json')))
const { chromium } = require('playwright')
const b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl'] })
for (const [w,h] of [[320,640],[390,844]]) {
  const c = await b.newContext({ viewport:{width:w,height:h}, hasTouch:true }); const p = await c.newPage()
  await p.goto('https://ferrumos-preview.shariefsatyala.workers.dev/project-workspace/cockpit?product=Land'); await p.waitForSelector('[data-cookie-consent]'); await p.waitForTimeout(2500)
  for (const name of ['Export DXF','Export IFC']) {
    const btn = p.getByRole('button',{name}).first(); await btn.scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
    const r = await p.evaluate((n)=>{ const e=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===n); const bb=e.getBoundingClientRect(); const ban=document.querySelector('[data-cookie-consent]').getBoundingClientRect(); const t=document.elementFromPoint(bb.left+bb.width/2,bb.top+bb.height/2); return {top:Math.round(bb.top),bottom:Math.round(bb.bottom),bannerTop:Math.round(ban.top),hitIsSelf:e.contains(t),clearOfBanner:bb.bottom<=ban.top+1}}, name)
    console.log(w, name, JSON.stringify(r))
  }
  await p.screenshot({ path: `docs/evidence/crane-cookie-release-20260919/cockpit-${w}-exports-scrolled.png` })
  await c.close()
}
await b.close()
