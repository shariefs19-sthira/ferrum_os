-- Transact lifecycle extensions (W2-330): KYC capture, document
-- uploads, scheduling. Gated by docs/COMPLIANCE_GATE.md — KYC here is
-- explicitly self-declared, not verified against any government
-- identity API (no such integration is whitelisted/approved; fabricating
-- a "verified" result would violate the no-fabrication discipline).

CREATE TABLE IF NOT EXISTS kyc_submissions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES transact_cases(id),
  full_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_ref_last4 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'self_declared' CHECK (status IN ('self_declared')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_case_id ON kyc_submissions(case_id);

-- Metadata only — the file itself lives in R2 (see lib/storage in
-- worker.ts), gated on the TRANSACT_DOCS binding being provisioned.
CREATE TABLE IF NOT EXISTS document_uploads (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES transact_cases(id),
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_document_uploads_case_id ON document_uploads(case_id);

CREATE TABLE IF NOT EXISTS scheduled_slots (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES transact_cases(id),
  requested_date TEXT NOT NULL,
  requested_window TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scheduled_slots_case_id ON scheduled_slots(case_id);
