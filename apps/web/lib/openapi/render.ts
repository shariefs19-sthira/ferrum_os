import type { OpenAPIV3 } from 'openapi-types'

/**
 * Minimal, dependency-free HTML rendering of the OpenAPI spec — no
 * Swagger UI CDN load at runtime (Workers shouldn't fetch third-party
 * assets to render its own docs page). Lists each path/method/summary
 * so a human skimming /docs/api in a browser gets a readable index;
 * the full machine-readable spec stays available via the JSON route.
 */
export function renderOpenApiHtml(spec: OpenAPIV3.Document): string {
  const rows = Object.entries(spec.paths ?? {})
    .flatMap(([path, methods]) =>
      Object.entries(methods ?? {})
        .filter(([method]) => ['get', 'post', 'put', 'delete', 'patch'].includes(method))
        .map(([method, op]) => {
          const operation = op as OpenAPIV3.OperationObject
          return `<tr><td><code>${method.toUpperCase()}</code></td><td><code>${path}</code></td><td>${operation.summary ?? ''}</td></tr>`
        }),
    )
    .join('\n')

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${spec.info.title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5}code{background:#f0f0f0;padding:2px 4px;border-radius:3px}</style>
</head><body>
<h1>${spec.info.title}</h1>
<p>${spec.info.description ?? ''}</p>
<p>Full machine-readable spec: <a href="/docs/api" onclick="fetch('/docs/api',{headers:{Accept:'application/json'}}).then(r=>r.json()).then(j=>console.log(j));return false;">GET /docs/api (Accept: application/json)</a></p>
<table><thead><tr><th>Method</th><th>Path</th><th>Summary</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`
}
