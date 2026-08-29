# Job Taxonomy (J01-J15)

Each job type: definition | definition-of-done | required caps | cheapest tier | when to PAY for HIGH.

J01 Page/component from spec: matches relume-contracts, renders, contract tests pass | T1,T2,(T5) | LOW | novel interaction design.
J02 Refactor/extract shared code: zero behavior change, tests green | T1,T2 | MID | touches >20 importers.
J03 Backend endpoint: validated I/O, timeout=5 everywhere, /health updated | T1,T2 | MID | auth/funds-adjacent (then ALSO human).
J04 External API integration: graceful fallback, counters, no secrets in code | T1,T2,T4 | MID | undocumented/flaky protocol.
J05 Test authoring: covers logic paths, runs in CI | T1,T2 | LOW | e2e suites = MID.
J06 CI/toolchain fix: pipeline green on push, reproducible | T1,T2 | PAY HIGH | always (env-skew debugging is hardest work).
J07 Visual alignment to spec: pixelmatch diff <0.5% vs baseline | T1,T2,T5 | LOW | —.
J08 Docs/logs/handoff: append-only log, handoff synced | any | FREE | —.
J09 Dep upgrade/migration: lockfile consistent, CI green | T1,T2,T3 | PAY HIGH + sandbox.
J10 Security hardening: headers, limits, scans green, OWASP-aware | T1,T2 | PAY HIGH + human.
J11 Perf optimization: Lighthouse/perf budget met, no regressions | T1,T2 | MID | budget missed twice.
J12 Accessibility pass: WCAG AA on touched routes | T1,T2,T5 | MID | —.
J13 Content/SEO/i18n: meta/OG/structured data valid | any | FREE | —.
J14 Review (Group B judgment layer): structured verdict PASS/FIX/ESCALATE with refs | T4 | PAY HIGH | ALWAYS (this is the bought-judgment slot).
J15 Policy/enforcement config: Danger/Semgrep rules mirror AGENTS.md | T1,T2 | MID | —.