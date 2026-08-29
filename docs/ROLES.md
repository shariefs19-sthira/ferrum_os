# Role Slots (capability-based, vendor-agnostic)

Last Updated: 2026-08-29

PRIMARY WRITER (max 1): Tier A, human-designated; authorized for direct main commits for high-risk or cross-cutting changes.
BRANCH WRITER (feature): Tier S; implements features and fixes on topic branches, submitted via PR for review.
SANDBOX WRITER (experimental): Tier S+; handles higher-risk or experimental work, typically in isolated forks or sandboxes.
HOTFIX WRITER (hotfix): Tier B; limited-scope urgent fixes (recommended: ≤3 files).
REVIEWER (infrastructure): Automated or human reviewers that validate PRs and enforce policies.
ENFORCER (policy): Policy-as-code agents/tools (Danger, Semgrep, ReviewDog) that block unsafe changes.
MONITOR (observability): Infrastructure agents that watch CI, test results, and visual diffs.
HUMAN: Provides mission briefs, policy approvals, and final sign-off for critical actions.

Assignment matrix (by MISSION TYPE → required tier; vendor-agnostic):
- new page/service: S or S+
- bugfix (≤3 files): B
- CI/build fix: A
- refactor: S
- dependency upgrade/migration: S+
- visual polish: S (T5 verification may be required)
- docs: B
- security fixes: A + human review

Notes: tiers indicate required authorization and review level; always follow role-specific constraints (e.g., never push main unless explicitly allowed for Tier A agents).