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