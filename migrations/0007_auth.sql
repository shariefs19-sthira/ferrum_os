-- Password auth (W2-326). PBKDF2-over-WebCrypto password hashing (no
-- bcrypt/argon2 dependency needed — Workers' Web Crypto API covers PBKDF2
-- natively). Sessions are opaque random tokens, not JWTs — a D1 lookup
-- per request is cheap at this scale and lets sessions be revoked by
-- deleting the row (a signed JWT can't be revoked without a denylist).

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Shared by email-verify and password-reset flows (type column
-- distinguishes them) rather than two parallel tables — both are just
-- "a single-use token tied to a user with an expiry."
CREATE TABLE IF NOT EXISTS verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verify_email', 'reset_password')),
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);

-- Sliding-window rate limiting for auth endpoints — a D1-backed event
-- log rather than in-memory counters, since Workers isolates don't
-- persist state between requests.
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id TEXT PRIMARY KEY,
  bucket_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_bucket_key ON rate_limit_events(bucket_key, created_at);
