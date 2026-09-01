# Security Plan

## Phases (mapped to Amazon/AWS progression)
- Phase 0 (Current): Edge/WAF protection via GitHub Pages/Cloudflare (if deployed behind one). Input sanitization basics. (Pending M16 for initial setup).
- Phase 1 (Commerce Launch): SAQ-A (tokenized payments, no card data storage). Secure session management.
- Phase 2 (Volume): Bot/fraud detection, rate limiting, abuse prevention.
- Phase 3 (Enterprise): SOC2 compliance.

## CSP decisions

**2026-08-31 — CSP decision (launch-scoped):** The nonce-based CSP and its
supporting middleware were retired for the static launch. The static
`_headers` CSP uses `unsafe-inline`, accepted consciously as a
launch-scoped tradeoff, not an oversight. **W2-240** is queued for
post-launch hardening back to hash-based or edge-nonce CSP.

## Rate limiting (W2-334)

**2026-09-02 — POST-route rate limiting:** D1-backed sliding-window
rate limits (`lib/auth/rateLimit.ts`, `lib/auth/ipRateLimit.ts`) applied
to every public/authenticated write route that lacked one: `/api/leads`,
`/api/transact/cases` (create), `/api/payments/order`,
`/api/testfit`, `/api/is-check`, `/api/boq-estimate`, `/api/irr-npv`,
`/api/ask-band`, `/api/ferrum-rate` (all keyed by `CF-Connecting-IP`),
and `/api/workspace/artifacts` / `/api/subscriptions` create routes
(keyed by user id, since they're auth-gated). All return 429 on
exceeding their window. Auth endpoints (`/api/auth/*`) were already
rate-limited as part of W2-326. CSP stays out of this task's scope —
see the 2026-08-31 decision above and W2-240.

## Secrets audit (W2-334)

**2026-09-02:** Repo-wide grep for hardcoded API keys/secrets/passwords
found none — every credential (Razorpay, Resend, admin token) is read
from `Env` bindings only, set via `wrangler secret put` or local
`.dev.vars`, never committed. `wrangler.jsonc` carries only a D1
database id (not a secret). One real gap found and fixed: `.dev.vars`
(wrangler's local-secrets file, analogous to `.env`) was not in
`.gitignore` — added before any operator creates one with real keys
for local testing.

## Process incidents

**2026-08-31 — auto-land of held dependency WIP:** `scripts/land.ps1`'s
catch-all loop auto-landed a held, not-ready branch (`w2-234/crane-cloudflare`,
OpenNext/Wrangler dependency work touching `package.json`,
`next.config.js`, `wrangler.jsonc`, `pnpm-lock.yaml`) onto `main`. This is
notable from a supply-chain standpoint because `package.json` and
`pnpm-lock.yaml` are RULE 6 protected paths — the branch itself was
legitimate CRANE WIP, not malicious, but it landed without the explicit
approval RULE 6 requires. Fixed via a clean revert; see the ACTIVITY_LOG
postmortem entry for the full timeline. `docs/LAND_HOLD.txt` (added as
part of the fix) is now the mechanism that keeps held branches like this
one out of the catch-all loop.