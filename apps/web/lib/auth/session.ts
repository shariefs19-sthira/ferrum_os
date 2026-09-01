// Opaque-token session helpers (W2-326) — see migrations/0007_auth.sql
// for why sessions are D1 rows, not JWTs.

const SESSION_COOKIE = 'ferrum_session'
const SESSION_DAYS = 30

export function sessionCookieName(): string {
  return SESSION_COOKIE
}

export function setCookieHeader(sessionId: string): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60
  return `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

export function parseSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return match ? match[1] : null
}

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const id = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString()
  await db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(id, userId, expiresAt).run()
  return id
}

export async function getSessionUser(
  db: D1Database,
  sessionId: string,
): Promise<{ id: string; email: string; email_verified: number } | null> {
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.email_verified FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .bind(sessionId)
    .first<{ id: string; email: string; email_verified: number }>()
  return row ?? null
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
}
