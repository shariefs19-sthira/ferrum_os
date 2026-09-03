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
| WEB-IFC-DEP | Add `web-ifc` as a new dependency, for open BIM (IFC format) export interop from the DesignStudio/Analysis Engine surfaces | YES — open BIM export interop | (blank — pending) | (not executed) — a new dependency addition, CRANE-only to add per RULE 1 once approved |

## Migration note (2026-09-03)

The "Approval Queue" section formerly in docs/WAVE_QUEUE.md (rows for
Ctrl+K palette fuzzy search and devDependencies typescript/@types/node,
plus their subsequent decision lines) is superseded by this file as of
this migration. That section is left in place in WAVE_QUEUE.md's history
un-deleted, per the append-only rule — it is simply no longer the active
approval-tracking location going forward.
