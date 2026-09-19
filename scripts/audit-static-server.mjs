// MASON: tiny static file server for the SUTRA audits (Cloudflare-Pages-style clean URLs: /x -> /x.html).
//   node scripts/audit-static-server.mjs apps/web/out 4189
// NO_RSC=1 makes it 404 every *.txt file, i.e. it behaves like a static host that cannot serve Next's
// RSC payloads (`/route.txt?_rsc=...`). Next then falls back to a FULL page load on router.push(),
// which is what closed the SUTRA panel mid-audit at 320x640. Use it to prove an audit does not depend on
// soft navigation: NO_RSC=1 node scripts/audit-static-server.mjs apps/web/out 4191
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? 'apps/web/out')
const port = Number(process.argv[3] ?? 4189)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' }
http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (process.env.NO_RSC && p.endsWith('.txt')) { res.writeHead(404); return res.end('rsc payloads not served') }
  for (const c of [p, `${p}.html`, path.join(p, 'index.html')]) {
    const f = path.join(root, c)
    if (f.startsWith(root) && fs.existsSync(f) && fs.statSync(f).isFile()) { res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' }); return fs.createReadStream(f).pipe(res) }
  }
  res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found')
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}${process.env.NO_RSC ? ' (RSC payloads disabled)' : ''}`))
