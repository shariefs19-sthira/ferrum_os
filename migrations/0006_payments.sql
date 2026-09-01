-- Payments (W2-324), gated by docs/COMPLIANCE_GATE.md — Stage-1 test-mode
-- only. `orders`/`payments` are provider-agnostic (provider TEXT column)
-- so a future Stripe rail (NRI/international, per the operator's explicit
-- decision to keep Razorpay + Stripe as a two-rail design) can write to
-- the same tables without a schema change.

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  case_id TEXT REFERENCES transact_cases(id),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  mode TEXT NOT NULL CHECK (mode IN ('test', 'live')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  provider_payment_id TEXT,
  signature_verified INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
