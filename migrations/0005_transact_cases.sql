-- Transact case tracking (W2-322), gated by docs/COMPLIANCE_GATE.md.
-- transact_cases models both the buyer and seller flows as one table with
-- a role-scoped step sequence (validated in app code, see
-- apps/web/lib/transact/caseFlow.ts) rather than two parallel tables —
-- both flows share identical shape (id, contact, property, current_step,
-- status), only the legal step sequence differs by role.
--
-- Stage-1 compliance: `status` never implies a legal or financial outcome
-- (no "approved"/"guaranteed" values); token_payment is Stage-1 test-mode
-- only per COMPLIANCE_GATE.md — no real fund movement until Stage-2 sign-off.

CREATE TABLE IF NOT EXISTS transact_cases (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  property_ref TEXT,
  state TEXT,
  current_step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'closed', 'withdrawn')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS case_events (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES transact_cases(id),
  from_step TEXT,
  to_step TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
