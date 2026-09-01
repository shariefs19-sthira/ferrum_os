// D1-backed sliding-window rate limiter (W2-326) for auth endpoints.
// Workers isolates don't persist in-memory state between requests, so an
// in-process counter would silently reset on every cold start — a D1
// event log is the honest way to do this at edge scale.

export async function checkRateLimit(
  db: D1Database,
  bucketKey: string,
  maxEvents: number,
  windowMinutes: number,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count FROM rate_limit_events WHERE bucket_key = ? AND created_at > datetime('now', ?)`,
    )
    .bind(bucketKey, `-${windowMinutes} minutes`)
    .first<{ count: number }>()
  if ((row?.count ?? 0) >= maxEvents) return false
  await db
    .prepare('INSERT INTO rate_limit_events (id, bucket_key) VALUES (?, ?)')
    .bind(crypto.randomUUID(), bucketKey)
    .run()
  return true
}
