-- D1 schema additions for Transact (W2-283..286), gated by
-- docs/COMPLIANCE_GATE.md Stage-1 rules. stamp_duty_rates holds
-- illustrative sample rates (NOT current government-published figures
-- — the compliance gate requires INDICATIVE labeling on every number
-- this product surfaces). The demand-token waitlist (W2-286) extends
-- the existing `leads` table with a `state` column rather than adding
-- a parallel table, per the task's own wording — a waitlist signup is
-- a lead (product='Transact', source_page='transact-waitlist'), it
-- just needs one Transact-specific field `leads` didn't have yet.

ALTER TABLE leads ADD COLUMN state TEXT;

CREATE TABLE IF NOT EXISTS stamp_duty_rates (
  state TEXT PRIMARY KEY,
  rate_pct REAL NOT NULL,
  registration_fee_pct REAL NOT NULL,
  note TEXT NOT NULL DEFAULT 'illustrative sample rate — verify with your local sub-registrar office'
);

INSERT INTO stamp_duty_rates (state, rate_pct, registration_fee_pct) VALUES
  ('Karnataka', 5.0, 1.0),
  ('Maharashtra', 5.0, 1.0),
  ('Tamil Nadu', 7.0, 1.0);
