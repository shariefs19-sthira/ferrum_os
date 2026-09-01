import { checkRateLimit } from './rateLimit'

// Per-IP rate limiting for unauthenticated/public write endpoints
// (W2-334) — reuses the D1-backed sliding window from W2-326's auth
// rate limiter rather than a parallel mechanism. CF-Connecting-IP is
// the real client IP at Cloudflare's edge (not spoofable by the client
// the way X-Forwarded-For can be behind some proxies).
export async function checkIpRateLimit(
  db: D1Database,
  req: Request,
  routeKey: string,
  maxEvents: number,
  windowMinutes: number,
): Promise<boolean> {
  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown'
  return checkRateLimit(db, `ip:${routeKey}:${ip}`, maxEvents, windowMinutes)
}
