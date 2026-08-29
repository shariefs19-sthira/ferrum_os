# METHOD_LOG

## 2026-08-29T16:50:07+05:30 | W1-06 | [AI: Copilot] | Status: LANDED
- Why: The auto-merge enabler needed a human-review veto and a consistent non-draft PR gate; the telemetry showed the dispatcher had double-assigned the work and the mitigation needed documentation.
- How: The workflow was created with a veto string of `HUMAN-APPROVED + [task:W1-06]`, the related idea record was appended, and the handoff state was refreshed after the branch landed via Qoder's branch.
- Evidence: IDEA-066 added to docs/IDEAS_LOG.md; CURRENT STATE refreshed in docs/AI_HANDOFF.md; branch was then closed after the Qoder landing and the dispatcher double-assignment was logged as IDEA-066 context.
- Lessons: Guardrails must be documented as part of the landed outcome, and when a double-assignment occurs the handoff must preserve both the infra intent and the protocol-proven Copilot execution.

## 2026-08-29T14:46:08+05:30 | W1-18 | [AI: copilot-cli-vscode] | Status: claimed
- Why: The docs refresh needed a human-approved, low-risk update to the role/workflow/standards docs.
- How: Claim was recorded in WAVE_QUEUE, the targeted docs were refreshed with explicit scope, and the activity log was appended per protocol.
- Evidence: W1-18 row marked CLAIMED-copilot-cli-vscode; ROLES, WORKFLOW, and STANDARDS were updated; ACTIVITY_LOG was appended with the claim.
- Lessons: Keep docs-only work constrained to the declared files and use explicit path additions to avoid accidental drift.

## 2026-08-29T16:23:57+05:30 | W1-17 | [AI: Cline-GLM-Flash] | Status: landed
- Why: Reduce the homepage payload and First Load JS without changing product scope.
- How: Use lazy loading and bundle optimizations around product cards while preserving the existing landing page design.
- Evidence: Home payload decreased from 15,956 bytes to 7,011 bytes (-56%); First Load JS decreased from 96.1 kB to 91.2 kB (-5%), using `next build` and `.next/static/chunks` inspection.
- Lessons: Small code-splitting wins can materially reduce page weight when the UI surface is product-card heavy.

