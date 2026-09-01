-- INDICATIVE sample data for the LandRecordsProvider (parcels) and
-- RatesProvider (rates) seams. Not live registry/market data — every
-- API response derived from these rows carries indicative: true.

INSERT INTO parcels (ulpin, state, district, area_sqm, land_use) VALUES
  ('KA-BLR-0001-2024', 'Karnataka', 'Bengaluru Urban', 1200.5, 'Residential'),
  ('MH-PUN-0002-2024', 'Maharashtra', 'Pune', 850.0, 'Mixed Use'),
  ('TN-CHN-0003-2024', 'Tamil Nadu', 'Chennai', 2000.0, 'Commercial');

INSERT INTO rates (category, region, unit, rate, source) VALUES
  ('Cement (OPC 53)', 'Bengaluru', 'per bag (50kg)', 420.0, 'indicative'),
  ('Cement (OPC 53)', 'Pune', 'per bag (50kg)', 405.0, 'indicative'),
  ('Cement (OPC 53)', 'Chennai', 'per bag (50kg)', 415.0, 'indicative'),
  ('TMT Steel (Fe 500D)', 'Bengaluru', 'per kg', 68.5, 'indicative'),
  ('TMT Steel (Fe 500D)', 'Pune', 'per kg', 66.0, 'indicative'),
  ('TMT Steel (Fe 500D)', 'Chennai', 'per kg', 67.2, 'indicative'),
  ('Skilled Mason (labor)', 'Bengaluru', 'per day', 900.0, 'indicative'),
  ('Skilled Mason (labor)', 'Pune', 'per day', 850.0, 'indicative'),
  ('Skilled Mason (labor)', 'Chennai', 'per day', 875.0, 'indicative');
