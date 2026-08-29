# Role Slots (capability-based, vendor-agnostic)
PRIMARY WRITER (max 1): Tier A, human-designated; direct main commits.
BRANCH WRITER (unlimited): Tier S; feature missions via PR.
SANDBOX WRITER (unlimited): Tier S+; risky missions.
HOTFIX WRITER (unlimited): Tier B; max 3 files.
REVIEWER (infrastructure): PR-Agent; auto-review every PR.
ENFORCER (infrastructure): Danger-JS + Semgrep + ReviewDog; policy as code.
MONITOR (infrastructure): gh-dash + pixelmatch; observability.
HUMAN: mission briefs, policy approvals, weekly audit.
Assignment matrix by MISSION TYPE -> required tier (not vendor):
new page/service: S or S+ | bugfix <=3 files: B | CI/build fix: A | refactor: S | dep upgrade/migration: S+ | visual polish: S(+T5) | docs: B | security: A + human review.