// Copies the MapLibre GL JS worker (+ the shared chunk it imports) into the static public dir so
// maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs') can load it same-origin.
// Next.js cannot bundle the MapLibre worker, so it is served as a static asset (MapLibre + Next.js guidance).
// Usage: node scripts/sync-maplibre-worker.mjs [--check]   (--check exits 1 when committed copies drift from node_modules)
import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(pathToFileURL(path.resolve('apps', 'web', 'package.json')))
const packageDir = path.dirname(require.resolve('maplibre-gl/package.json'))
const target = path.resolve('apps', 'web', 'public', 'maplibre')
const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
const check = process.argv.includes('--check')
let drift = 0
if (!check) await mkdir(target, { recursive: true })
for (const file of files) {
  const source = path.join(packageDir, 'dist', file)
  const destination = path.join(target, file)
  if (check) {
    const [a, b] = await Promise.all([readFile(source), readFile(destination).catch(() => null)])
    if (!b || !a.equals(b)) { drift += 1; console.error(`DRIFT ${file}`) } else console.log(`OK    ${file}`)
  } else { await copyFile(source, destination); console.log(`copied ${file}`) }
}
if (check && drift) process.exit(1)
