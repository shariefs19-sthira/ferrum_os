-- Mode 2 (GOVT REFERENCE) data source for the three-mode rate
-- calculator (W2-311). Distinct table from `rates` (Mode 2's market
-- seed data) because a DSR/ready-reckoner reference figure is a
-- different kind of number from a market rate — kept separate so the
-- two never get silently conflated. Every figure here is illustrative
-- sample data styled on a CPWD DSR/state ready-reckoner format, NOT a
-- current government-published rate — same INDICATIVE discipline as
-- migrations/0003_transact.sql's stamp_duty_rates.

CREATE TABLE IF NOT EXISTS govt_reference_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  unit TEXT NOT NULL,
  rate REAL NOT NULL,
  source_note TEXT NOT NULL DEFAULT 'illustrative sample rate styled on CPWD DSR / state ready-reckoner format — not a current government-published figure'
);
CREATE INDEX IF NOT EXISTS idx_govt_reference_rates_category_region ON govt_reference_rates (category, region);

INSERT INTO govt_reference_rates (category, region, unit, rate) VALUES
  ('Cement (OPC 53)', 'Bengaluru', 'per bag (50kg)', 410.0),
  ('Cement (OPC 53)', 'Pune', 'per bag (50kg)', 398.0),
  ('Cement (OPC 53)', 'Chennai', 'per bag (50kg)', 405.0),
  ('TMT Steel (Fe 500D)', 'Bengaluru', 'per kg', 65.0),
  ('TMT Steel (Fe 500D)', 'Pune', 'per kg', 63.5),
  ('TMT Steel (Fe 500D)', 'Chennai', 'per kg', 64.8),
  ('Skilled Mason (labor)', 'Bengaluru', 'per day', 850.0),
  ('Skilled Mason (labor)', 'Pune', 'per day', 800.0),
  ('Skilled Mason (labor)', 'Chennai', 'per day', 820.0);
