-- Subscriptions (W2-329), gated by docs/COMPLIANCE_GATE.md, test-mode
-- only. subscription_plans mirrors the three /pricing tiers (Freemium
-- has no row — it's free, nothing to subscribe to). provider_plan_id is
-- nullable because in stub mode (no Razorpay keys) there is no real
-- provider-side plan to reference.

CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_paise INTEGER NOT NULL,
  interval TEXT NOT NULL DEFAULT 'monthly',
  provider_plan_id TEXT
);

INSERT INTO subscription_plans (id, name, price_paise, interval) VALUES
  ('pro', 'Pro', 49900, 'monthly'),
  ('enterprise', 'Enterprise', 999900, 'monthly');

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  provider_subscription_id TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('test', 'live')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
