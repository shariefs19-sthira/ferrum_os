-- D1 schema for ferrum-os-data, per docs/AGENT_INTERFACE.md and
-- docs/LAUNCH_ARCHITECTURE.md. Four tables: rates, parcels, leads, plans.
-- All seed data is INDICATIVE sample data, not live production feeds
-- (LandRecordsProvider / RatesProvider go live post-launch per
-- LAUNCH_ARCHITECTURE.md's "POST-LAUNCH RAILS" line).

CREATE TABLE IF NOT EXISTS rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  unit TEXT NOT NULL,
  rate REAL NOT NULL,
  source TEXT NOT NULL DEFAULT 'indicative',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rates_category_region ON rates (category, region);

CREATE TABLE IF NOT EXISTS parcels (
  ulpin TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  area_sqm REAL NOT NULL,
  land_use TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product TEXT NOT NULL,
  source_page TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_product ON leads (product);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  testfit_id TEXT NOT NULL,
  dxf_blob_ref TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
