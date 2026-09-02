// Minimal cache-first shell for static assets only (W2-356 PWA wiring).
// Deliberately narrow: only same-origin GET requests for the Next.js static
// asset chunks are cached. API routes, auth, and HTML documents are never
// intercepted — this must not risk serving stale session state or stale
// dynamic data. If anything looks uncertain, fall through to the network.
const CACHE_NAME = "ferrum-os-static-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

function isCacheableStaticAsset(url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") || url.pathname === "/favicon.svg")
  )
}

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (!isCacheableStaticAsset(url)) return

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      if (cached) return cached
      const response = await fetch(request)
      if (response.ok) cache.put(request, response.clone())
      return response
    })
  )
})
