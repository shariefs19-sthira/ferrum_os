# WORKFLOW v2.0: Cost-Routed Waves, Immediate Checks

## CHANGELOG
- v2.0 (2024-05-23): Introduced Job Taxonomy (J01-J15), Cost Routing, WAVE PROTOCOL, IMMEDIATE CHECK, and Ideas Log. Split Standards into separate document. Agents are now capability-tier based (S+/S/A/B/C) instead of vendor-named roles.

## Lifecycle (role-based)
ONBOARD(step 0: register in docs/AGENT_REGISTRY.md) -> BRIEF(human) -> ONBOARD(agent reads AGENTS.md, ROLES.md; declares tier+handle+scope in log) -> BEFORE(preflight) -> BUILD(within tier) -> PR([AI: handle]) -> AUTO-GATE(PR-Agent score, Danger policy, Semgrep rules, ReviewDog lint) -> CI-GATE(build blocking) -> FIX LOOP(max 2, then human) -> LAND(squash, one at a time) -> MONITOR -> HANDOFF(update AI_HANDOFF.md + log; session retired).

## Rules of engagement
Group A never reviews Group A; scope cap 15 files; protected files need HUMAN-APPROVED tag; no history rewrites; timeout discipline 5s; sessions never resumed.

## WAVE PROTOCOL
Human labels 10-20 tasks as {id, J-type, file scope, tier, priority}. Disjoint-scope check mandatory before launch. Tasks sit in a LABELED QUEUE (docs/WAVE_QUEUE.md); agents (existing or newly onboarded) PULL the highest-priority task matching their declared tier; human may override. Build parallel; land serial (merge queue).

## IMMEDIATE CHECK
On PR open, Group B runs same-second: automated layer (CI+Danger+Semgrep+ReviewDog+pixelmatch) PLUS one PAY-HIGH reviewer (J14) fed a CONTEXT PACK = mission brief + J-type checklist from STANDARDS.md + relevant contract excerpt + AGENTS.md rules. Verdict format: PASS / FIX(cite lines+standard) / ESCALATE(human). Max 2 fix loops.

## COST ROUTING
Cheapest sufficient tier first; escalate tier only after 2 gate failures; J06/J09/J10/J14 always HIGH.
Versioning: WORKFLOW.md semver; every promoted idea bumps minor; CHANGELOG entry per change; at site completion publish as "Ferrum Workflow Kit" for new websites.