-- Saved-artifact workspace (W2-327), tied to W2-326 auth. `data` is a
-- JSON blob rather than a per-type table — artifacts come from several
-- unrelated calculators (Ferrum-rate, ask-band, stamp duty, BOQ) with
-- different shapes, and this is read/written wholesale (never queried
-- by field), so a generic JSON column is the honest fit, not premature
-- normalization avoidance.

CREATE TABLE IF NOT EXISTS saved_artifacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_saved_artifacts_user_id ON saved_artifacts(user_id);

CREATE TABLE IF NOT EXISTS artifact_shares (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES saved_artifacts(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_artifact_shares_token ON artifact_shares(share_token);
