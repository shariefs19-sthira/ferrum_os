# APPROVAL_QUEUE.md — RULE 17 proposals, decisions, and execution status

Append-only, same discipline as docs/WAVE_QUEUE.md and
docs/ACTIVITY_LOG.md: a decision or an execution result is recorded as a
new row (or an appended note on the existing row), never by editing or
deleting a prior entry. Migrated 2026-09-03 from the "Approval Queue"
section formerly in docs/WAVE_QUEUE.md — that section is now superseded
by this file; see the migration note at the bottom.

Per AGENTS.md RULE 21(3) amendment: seats read this file at turn start
and execute any row marked OPERATOR DECISION: APPROVED, within that
row's stated envelope (RULE 20(3) bounds where a mission block applies).

## Schema

```
| ROW | ASK | RECOMMENDATION | OPERATOR DECISION | EXECUTED SHA |
```

- **ROW** — a short stable identifier for the ask (not necessarily a
  WAVE_QUEUE task ID — some asks predate or sit outside the queue).
- **ASK** — what's being proposed, in one line.
- **RECOMMENDATION** — the proposing seat's own YES/NO/NEUTRAL call.
- **OPERATOR DECISION** — blank (pending), APPROVED, REJECTED, or
  SKIPPED-BY-SILENCE (per that row's own stated silence-fallback, if any).
- **EXECUTED SHA** — the landing-marker SHA once executed, verified per
  RULE 22's squash-safe method (never a raw branch-tip SHA presented as
  the landed SHA). Blank until actually landed on `origin/main`.

## Rows

| ROW | ASK | RECOMMENDATION | OPERATOR DECISION | EXECUTED SHA |
|-----|-----|----------------|--------------------|--------------|
| DEVDEPS-REMOVAL | Remove root devDependencies `typescript` / `@types/node` | (n/a — operator-initiated, no seat recommendation on record) | APPROVED (operator, 2026-09-03, verbatim: "devDeps removal authorized") | `de2abebc` — verified present in `origin/main`'s own log: "fix: [AI: CRANE] remove unapproved root devDeps (typescript, @types/node)" |
| PROVENANCE-STRIP | Strip provenance metadata per RIVET proposal 1 (LandIntel/Analysis Engine now; DesignStudio S4 later) | (n/a — RIVET's own proposal; recommendation implicit in the proposal itself, text not on disk in this ledger) | APPROVED (operator, 2026-09-03, verbatim: "provenance strip approved per RIVET proposal 1") | In flight — see docs/WAVE_QUEUE.md W2-387 for the split CRANE-now/MASON-S4 execution; no landing-marker SHA yet |
| PALETTE-FUZZY-SEARCH | Ctrl+K command-palette fuzzy search over ledger row IDs (e.g. typing "347" jumps to that row), attached to W2-366 COMMAND_DECK_UI | YES (SCRIBE, surfaced under RULE 17) | SKIPPED-BY-SILENCE — the row's own stated fallback triggered: W2-366 was claimed without an explicit approve/reject on this proposal, so MASON proceeds with the palette as originally specced, without the fuzzy row-ID feature | (not executed — skipped) |
| OG-LANDING | Canonical social card + Twitter card metadata (og:image work referenced in W2-372/W2-373's sequencing) | (n/a — CRANE/MASON execution, not a standing RULE 17 proposal requiring separate approval) | APPROVED (implicit — part of the already-approved W2-372 sequencing; landed) | `77d515b0` — verified present in `origin/main`'s own log: "feat: [land:mason/og-image-apply][AI: MASON][completed-by: CRANE] canonical social card + [AI: CRANE] twitter:card fix". **Correction:** the SHA originally supplied for this row, `77aabfec`, is a real commit but is unrelated — "fix: [AI: CRANE] sync pnpm-lock.yaml to root package.json after devDeps removal." Recorded the verified correct SHA instead of the supplied one, per RULE 21(2)/RULE 22 disk-verify-before-reliance; flagging rather than silently substituting. |
| CI-ROOT-SCRIPTS | Add root proxy scripts (`lint`/`type-check`/`test`/`build`) that forward to `pnpm --filter ./apps/web` | YES | (blank — pending) | (not executed) |
| SITE_BASE_URL-INTERIM | Point `NEXT_PUBLIC_SITE_URL` at the live workers.dev URL until ferrumos.com DNS exists | YES (ATLAS: social shares currently show NO preview image — this is a live defect, not a cosmetic gap) | (blank — pending) | (not executed) — domain purchase stays the standing gate; this is an interim measure only, not a substitute for the real domain once purchased |
| WEB-IFC-DEP | Add `web-ifc` as a new dependency, for open BIM (IFC format) export interop from the DesignStudio/Analysis Engine surfaces | YES — open BIM export interop | APPROVED (operator, via chat, 2026-09-03) | pending — verified via RULE 22 (tree check + landing-marker check on `origin/main`) as of this entry: NOT yet landed, no `web-ifc` in package.json, no matching commit on main. SHA to be filled in when CRANE reports the landing — not fabricated ahead of it. |
| MCP-HEADLESS | Set the Playwright MCP server's launch config to `headless: true` (an operator config file, not repo code) | YES | (blank — pending) | (not executed) — execution only after explicit operator yes; directly implements RULE 28's headless-only verification requirement once approved |
| AQ-RIVET-001 (closes PROVENANCE-STRIP above) | Same ask as PROVENANCE-STRIP — strip provenance metadata per RIVET proposal 1 | (n/a — RIVET's own proposal) | APPROVED (operator, chat) | `226cf5a8` — verified present in `origin/main`'s own log: "feat: [AI: CRANE][task:W2-387] provenance strip on LandIntel + Analysis Engine." CLOSED: RIVET's own tracking line for this item was stale (still showing in-flight/no-SHA) — this row supersedes it with the actual executed state. Scope note: this closes the CRANE-now half (LandIntel + Analysis Engine, INDICATIVE-only data). The MASON/S4 half (per W2-387) remains separately in flight, not covered by this closure. |
| STANDING-DEPLOY-AUTHORITY | Grant a standing (not per-instance) deploy authority, guarded | YES, guarded — per AGENTS.md RULE 40(A) | APPROVED (operator, verbatim, 2026-09-04) | Not a single execution to close — an ongoing authority. Guards: `HEAD == origin/main`, all gates green, deploy SHA logged (on the relevant WAVE_QUEUE.md/TASK_BOARD.md row + ACTIVITY_LOG.md), and `docs/DEPLOY_STOP` as kill-switch (its presence halts all deploys under this authority immediately). `docs/DEPLOY_STOP` does not exist as of this entry — SCRIBE has not created it; its absence is the expected normal state. |
| RIVET-PUSH-W16-CHROME | Approve RIVET's push for branch `w2-401/rivet-w16-chrome` | (n/a — a specific push approval, not a proposal RECOMMENDATION) | APPROVED (operator, verbatim, 2026-09-04) | `5004f836` ("[land:w2-401/rivet-w16-chrome]") — verified present in `origin/main`'s own log as of this entry. Per RULE 40: this is the verifiable landing fact; SCRIBE has not independently checked the deployed edge, so this is not a claim of LIVE status — RIVET's own report carries that. |
| SEAT-PUSH-STANDING | Grant every seat a standing (not per-branch) approval to push its own `w2-*`/seat-named branches to `origin` | YES — per AGENTS.md RULE 42 | APPROVED (operator, verbatim, 2026-09-04) | Not a single execution to close — a standing grant, like STANDING-DEPLOY-AUTHORITY above. Explicitly scoped to branch pushes only; production deploy authority is unchanged (still the guarded grant under RULE 40, `docs/DEPLOY_STOP` kill-switch included). Landing still goes through `scripts/land.ps1` per RULE 18/35 — this only removes the per-branch-push approval step that preceded it. |

## Migration note (2026-09-03)

The "Approval Queue" section formerly in docs/WAVE_QUEUE.md (rows for
Ctrl+K palette fuzzy search and devDependencies typescript/@types/node,
plus their subsequent decision lines) is superseded by this file as of
this migration. That section is left in place in WAVE_QUEUE.md's history
un-deleted, per the append-only rule — it is simply no longer the active
approval-tracking location going forward.
