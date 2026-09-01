-- W2-339: expand stamp_duty_rates from the original 3-state sample
-- (Karnataka, Maharashtra, Tamil Nadu — migration 0003) to all 28 states
-- + 8 union territories. Every figure is a single, simplified
-- representative rate (real state rates commonly vary by gender,
-- urban/rural, and property-value slab — this table intentionally
-- keeps the existing schema's one-flat-rate-per-state shape rather than
-- introducing that complexity) and is explicitly illustrative, not a
-- verified current government figure. The table's `note` column already
-- defaults to "illustrative sample rate — verify with your local
-- sub-registrar office", which every row below inherits — this is the
-- INDICATIVE labeling the row's acceptance criteria requires, enforced
-- at the schema level rather than repeated per row.
--
-- Sourced from general, publicly known approximate stamp-duty ranges
-- as commonly cited in Indian real-estate industry summaries; this is
-- NOT sourced from a specific dated government gazette notification per
-- state, and should be treated as a best-effort illustrative baseline
-- pending independent per-state verification against each state's
-- current gazette rate — exactly the caveat the existing `note` default
-- already carries, and the same caveat the original 3-state seed data
-- shipped under.
--
-- INSERT OR IGNORE: Karnataka/Maharashtra/Tamil Nadu already exist from
-- migration 0003 and are left untouched here.

INSERT OR IGNORE INTO stamp_duty_rates (state, rate_pct, registration_fee_pct) VALUES
  ('Andhra Pradesh', 5.0, 1.0),
  ('Arunachal Pradesh', 6.0, 1.0),
  ('Assam', 8.25, 1.0),
  ('Bihar', 6.3, 2.0),
  ('Chhattisgarh', 5.0, 1.0),
  ('Goa', 3.5, 1.0),
  ('Gujarat', 4.9, 1.0),
  ('Haryana', 7.0, 1.0),
  ('Himachal Pradesh', 5.0, 1.0),
  ('Jharkhand', 4.0, 1.0),
  ('Kerala', 8.0, 2.0),
  ('Madhya Pradesh', 7.5, 1.0),
  ('Manipur', 7.0, 1.0),
  ('Meghalaya', 9.9, 1.0),
  ('Mizoram', 9.0, 1.0),
  ('Nagaland', 8.25, 1.0),
  ('Odisha', 5.0, 1.0),
  ('Punjab', 7.0, 1.0),
  ('Rajasthan', 6.0, 1.0),
  ('Sikkim', 4.0, 1.0),
  ('Telangana', 5.0, 1.0),
  ('Tripura', 5.0, 1.0),
  ('Uttar Pradesh', 7.0, 1.0),
  ('Uttarakhand', 5.0, 1.0),
  ('West Bengal', 7.0, 1.0),
  ('Andaman and Nicobar Islands', 6.0, 1.0),
  ('Chandigarh', 6.0, 1.0),
  ('Dadra and Nagar Haveli and Daman and Diu', 5.0, 1.0),
  ('Delhi', 6.0, 1.0),
  ('Jammu and Kashmir', 5.0, 1.0),
  ('Ladakh', 5.0, 1.0),
  ('Lakshadweep', 5.0, 1.0),
  ('Puducherry', 8.0, 1.0);
