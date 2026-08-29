# Standards (human-or-better check knowledge)

## GLOBAL
TS strict; no secrets; timeout discipline; explicit staging; [AI: handle] tags; docs updated; tests for logic; OWASP-top-10 awareness; WCAG AA; Next.js perf budget (LCP<2.5s, bundle<200KB first-load).

## Per-job checklists
### J01 (last_reviewed: 2026-08-28, cadence: 14d)
contract fields present + responsive + no console errors; J03 input validation + error semantics + counters; J04 fallback path proven; J06 CI reproducible (frozen lockfile); J07 tokens from design system only; J10 CSP/HSTS/rate-limits/gitleaks clean; J12 landmarks/contrast/keyboard; J14 verdict must cite specific lines + standards violated.

### J03 (last_reviewed: 2026-08-28, cadence: 14d)
Input validation + error semantics + counters + timeout=5.

### J04 (last_reviewed: 2026-08-28, cadence: 14d)
Graceful fallback, counters, no secrets in code, timeout=5.

### J10 (last_reviewed: 2026-08-28, cadence: 14d)
CSP/HSTS/rate-limits/gitleaks clean, OWASP top-10.

### J12 (last_reviewed: 2026-08-28, cadence: 14d)
Landmarks/contrast/keyboard, WCAG AA.

(Grow per wave: reviewers append missing checks as IDEAS, human promotes.)

(NOTE: Sections marked as stale (due for review based on cadence) will auto-queue a J16 task.)