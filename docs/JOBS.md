# Job Taxonomy (J01-J16)

Each job type: definition | definition-of-done | required caps | cheapest tier | when to PAY for HIGH | domain.

J01 Page/component from spec: matches relume-contracts, renders, contract tests pass | T1,T2,(T5) | LOW | novel interaction design. | D-UI
J02 Refactor/extract shared code: zero behavior change, tests green | T1,T2 | MID | touches >20 importers. | D-DATA
J03 Backend endpoint: validated I/O, timeout=5 everywhere, /health updated | T1,T2 | MID | auth/funds-adjacent (then ALSO human). | D-BE
J04 External API integration: graceful fallback, counters, no secrets in code | T1,T2,T4 | MID | undocumented/flaky protocol. | D-DATA
J05 Test authoring: covers logic paths, runs in CI | T1,T2 | LOW | e2e suites = MID. | D-QA
J06 CI/toolchain fix: pipeline green on push, reproducible | T1,T2 | PAY HIGH | always (env-skew debugging is hardest work). | D-CI
J07 Visual alignment to spec: pixelmatch diff <0.5% vs baseline | T1,T2,T5 | LOW | —. | D-VISUAL
J08 Docs/logs/handoff: append-only log, handoff synced | any | FREE | —. | D-DOCS
J09 Dep upgrade/migration: lockfile consistent, CI green | T1,T2,T3 | PAY HIGH + sandbox. | D-OPS
J10 Security hardening: headers, limits, scans green, OWASP-aware | T1,T2 | PAY HIGH + human. | D-SEC
J11 Perf optimization: Lighthouse/perf budget met, no regressions | T1,T2 | MID | budget missed twice. | D-PERF
J12 Accessibility pass: WCAG AA on touched routes | T1,T2,T5 | MID | —. | D-A11Y
J13 Content/SEO/i18n: meta/OG/structured data valid | any | FREE | —. | D-CONTENT
J14 Review (Group B judgment layer): structured verdict PASS/FIX/ESCALATE with refs | T4 | PAY HIGH | ALWAYS (this is the bought-judgment slot). | D-REV
J15 Policy/enforcement config: Danger/Semgrep rules mirror AGENTS.md | T1,T2 | MID | —. | D-OPS
J16 Standards sweep: research latest best practices for assigned surface since last sweep; DoD = dated report with sources + radar move proposals | T1,T2,T4 | MID | HIGH if compliance/legal. | D-RES

## Definition of Done (DoD) - Updated for Universal Preparation
- J01: matches relume-contracts, renders, contract tests pass, preparation logged + scope declared + method logged.
- J02: zero behavior change, tests green, preparation logged + scope declared + method logged.
- J03: validated I/O, timeout=5 everywhere, /health updated, preparation logged + scope declared + method logged.
- J04: graceful fallback, counters, no secrets in code, preparation logged + scope declared + method logged.
- J05: covers logic paths, runs in CI, preparation logged + scope declared + method logged.
- J06: pipeline green on push, reproducible, preparation logged + scope declared + method logged.
- J07: pixelmatch diff <0.5% vs baseline, preparation logged + scope declared + method logged.
- J08: append-only log, handoff synced, preparation logged + scope declared + method logged.
- J09: lockfile consistent, CI green, preparation logged + scope declared + method logged.
- J10: headers, limits, scans green, OWASP-aware, preparation logged + scope declared + method logged.
- J11: Lighthouse/perf budget met, no regressions, preparation logged + scope declared + method logged.
- J12: WCAG AA on touched routes, preparation logged + scope declared + method logged.
- J13: meta/OG/structured data valid, preparation logged + scope declared + method logged.
- J14: structured verdict PASS/FIX/ESCALATE with refs, preparation logged + scope declared + method logged.
- J15: Danger/Semgrep rules mirror AGENTS.md, preparation logged + scope declared + method logged.
- J16: dated report with sources + radar move proposals, preparation logged + scope declared + method logged.

## Domain Mapping
- D-UI: User Interface development (J01)
- D-VISUAL: Visual Design & Alignment (J07)
- D-BE: Backend Logic & Endpoints (J03)
- D-DATA: Data Handling, APIs, Refactoring (J02, J04)
- D-QA: Quality Assurance & Testing (J05)
- D-CI: Continuous Integration & Toolchain (J06)
- D-SEC: Security (J10)
- D-PERF: Performance (J11)
- D-A11Y: Accessibility (J12)
- D-CONTENT: Content, SEO, i18n (J13)
- D-DOCS: Documentation (J08)
- D-OPS: Operations, Config, Deployment (J09, J15)
- D-REV: Review & Judgment (J14)
- D-RES: Research & Standards (J16)