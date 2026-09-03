# ROLE_MAP.md — Ferrum OS Fleet Roster

Authoritative as of 2026-08-31. Maintained only by SCRIBE (AGENTS.md RULE 4).
Supersedes any prior roster claims made in chat that are not reflected here
or in git history on `main`.

## ACTIVE

| Seat   | Role                          | Notes |
|--------|-------------------------------|-------|
| CRANE  | Executor + Lander + REGENT    | Writes code, lands branches via `scripts/land.ps1`, and runs REGENT quality gates on its own landings. 19+ `[AI: CRANE]` commits on `main` as of 2026-08-31. |
| SCRIBE | Docs / Ledger / Rules / Registry | Owns AGENTS.md, ROLE_MAP.md, WAVE_QUEUE.md, docs/seats/*. Only seat permitted to commit rule changes (RULE 4). |
| ATLAS  | Architect + Executor (dual role, assigned slice) | Reactivated 2026-09-01. Works WAVE_QUEUE rows in its assigned slice (see below); disjoint-ownership protocol with CRANE — see AGENTS.md RULE 1. |
| MASON  | Executor, parallel slice | Activated 2026-09-02 (Codex CLI). Owns W2-346, 348, 349, 350, 353, 354 per the operator's slice statement. W2-347 is explicitly carved out to CRANE (specific reassignment overrides the roster range) — see the ATLAS/CRANE disjoint-ownership protocol note below and the row itself. Name reused from the parked Qoder-era MASON — see Change log. |
| RIVET  | Executor, exclusive paths | Activated 2026-09-02 (Codex CLI), second parallel Codex instance alongside MASON. Exclusive to `apps/mobile/**` and `docs/**` only — does not touch `apps/web/**`. Owns W2-356+. Name reused from the parked Qoder-era RIVET — see Change log. |
| PI     | Executor (experimental) — TRIAL status | Activated 2026-09-03, one-wave bounded trial on W2-390 (a vitest vector batch or docs sweep). Same rules, same landing path (land.ps1 only) as every other seat — no seat-specific exception for being experimental. Claims exactly one row, then stops until a verdict is recorded. Not yet a standing seat. |
| FERRITE | Gap-filler executor (second Claude account) — TRIAL status | Activated 2026-09-03. Activates ONLY when both CRANE and MASON are simultaneously at limit (RULE 33(1)) — never competes with an available primary. Disjoint envelope, land.ps1-only landing, non-destructive during trial (RULE 33(2)-(4)). RULE 33(5) — pace metric + sunset — is NOT YET DEFINED; the operator referenced it but the actual criteria never arrived in any message SCRIBE received. Trial baseline logged: 52 commits landed on origin/main since 2026-09-03 00:00 (36 with an explicit [land:] marker). |

### ATLAS / CRANE disjoint-ownership protocol (2026-09-01)

- ATLAS's assigned slice (as of 2026-09-01): W2-320, 321, 323, 331, 332,
  333, 338, 339, 342.
- CRANE's assigned slice for the same batch: W2-322, 324, 326, 327, 328,
  329, 330, 334, 335, 337, 340, 341.
- ATLAS never edits `worker.ts` / auth / payments files.
- CRANE never edits sitemap / nav / footer / legal / resources files.
- Dependency additions (`package.json` / `pnpm-lock.yaml`) are CRANE-only.
- Both seats push from their own worktree (AGENTS.md RULE 9); landing is
  serialized through `scripts/land.ps1` regardless of which seat authored
  the branch.
- SWEEP_100 (final certification) is run mechanically by CRANE; each seat
  then spot-audits the other's half. No self-certification.

## CONDUCTOR

| Seat     | Role |
|----------|------|
| Qwen-Web | Assigns/sequences wave tasks across active seats. |

## OPERATOR

| Seat  | Role |
|-------|------|
| Human | Final authority; approves consolidation and rule changes. |

## PARKED (reactivatable when Cursor joins)

| Seat    | Origin       | Notes |
|---------|--------------|-------|
| GIRDER  | Qoder        | No commits or WAVE_QUEUE rows found on `main` as of 2026-08-31; parked with the rest of the Qoder set pending verification of prior use. |

**Retired Qoder-era names, now reused (2026-09-02):** The original
Qoder-backed MASON held OPEN rows W2-120/121/123/124/126/128/129/131
before parking 2026-08-31 (reassigned to CRANE); the original Qoder-backed
RIVET held OPEN rows W2-122/125/127/130 (also reassigned to CRANE). Both
names are now reused for two new, unrelated Codex CLI instances (see
ACTIVE table above) — no row history is being reattributed between the
old Qoder work and the new Codex seats.
| Copilot / copilot-cli-vscode | VS Code Agent | Long history of `[AI: ...]`-tagged landings (W2-04 through W2-101 range); parked, reactivatable. |
| Continue | VS Code Agent | Parked. |
| Jules    | — | Parked (owner/fork observer roles). |
| Cline-GLM-Flash / Cline-GLM-Standard | — | Parked; large land history (W2 series). |

## Name registry (AGENTS.md RULE 3)

Seat name -> underlying tool, kept for audit purposes:

- CRANE -> Claude Code (executor/lander/REGENT role for this fleet)
- SCRIBE -> Claude Code (docs/rules seat, this session)
- ATLAS -> Qoder-CN (active, dual role — see above)
- MASON -> Codex CLI (active 2026-09-02, executor, parallel slice; name reused, see PARKED note)
- RIVET -> Codex CLI (active 2026-09-02, executor, exclusive apps/mobile/**+docs/**; name reused, see PARKED note)
- PI -> (underlying tool not yet specified beyond "Pi"; TRIAL status 2026-09-03, one-wave bounded trial on W2-390)
- FERRITE -> second Claude account (TRIAL status 2026-09-03, gap-filler executor, RULE 33)
- GIRDER -> Qoder (parked)
- Qwen-Web -> Qwen-Web-Conductor

## Change log

- 2026-08-31: SCRIBE consolidation. Declared CRANE+SCRIBE as the active
  fleet; parked all Qoder seats (ATLAS, MASON, RIVET, GIRDER) and the older
  Copilot/Continue/Jules/Cline seats pending Codex/Cursor onboarding. This
  is a fresh baseline, not a continuation of a prior numbered rule set —
  no earlier "RULE 57" or equivalent existed on `main` before this commit.
- 2026-09-01: ATLAS reactivated as ACTIVE with a dual role (architect +
  executor for its assigned WAVE_QUEUE slice). Disjoint-ownership protocol
  established with CRANE (file-scope separation, CRANE-only deps, no
  self-certification on SWEEP_100). MASON, RIVET, GIRDER remain PARKED.
- 2026-09-02: MASON activated as ACTIVE, executor role, parallel slice
  (operator directive). W2-353 (EMPTY_PLACEHOLDER_SWEEP) is MASON's first
  assigned row. PARKED list heading updated to "reactivatable when Cursor
  joins" since Codex has now joined.
- 2026-09-02 (later): Operator confirmed the exact MASON slice as
  W2-346, 348, 349, 350, 353, 354 — narrower than the initial "346..350
  and 353+" range — and explicitly carved W2-347 out to CRANE (a specific
  reassignment overrides the roster range) because its tools-side wiring
  touches worker.ts/MCP territory. Rows 346, 349, 350 reassigned ATLAS ->
  MASON; row 348 confirmed MASON (matching CRANE's own prior release-claim
  landing); row 347 confirmed CRANE with a note that its CommunityBuild
  investor-KYC wiring is Stage-2, BLOCKED per docs/COMPLIANCE_GATE.md, and
  stays ROADMAP-LABEL rather than IMPLEMENT-MIN/WIRE — added to
  docs/TRANSACTION_COUNSEL_PACK.md as a Stage-2 candidate.
- 2026-09-02 (later still): Operator activated a second Codex CLI
  instance and renamed both for clarity: the executor with the
  346/348/349/350/353/354 slice is now called MASON; the new second
  instance is called RIVET, exclusive to `apps/mobile/**` and `docs/**`
  only (first row: W2-356 APP_SHELL_V1). Both names are reused from the
  parked Qoder-era MASON/RIVET (see PARKED section note) — no row history
  is reattributed between the old Qoder work and these new Codex seats.
- 2026-09-03: PI activated as an experimental executor seat, TRIAL
  status, for a single one-wave bounded task (W2-390: a vitest vector
  batch or docs sweep). Same rules and same landing path (land.ps1 only)
  as every other seat — no exception carved out for being experimental.
  Claims exactly one row, then stops until a verdict is recorded on
  whether Pi becomes a standing seat with its own slice.
- 2026-09-03 (later): FERRITE (a second Claude account) activated as a
  gap-filler executor seat, TRIAL status, per AGENTS.md RULE 33.
  Activates only when both CRANE and MASON are simultaneously at limit;
  disjoint envelope; land.ps1-only landing; non-destructive during
  trial. RULE 33's pace-metric and sunset provision (part 5) was never
  actually defined in any message SCRIBE received despite being
  referenced twice — flagged, not fabricated; tracked as a TODO. Trial
  baseline logged at activation: 52 commits landed on origin/main since
  2026-09-03 00:00 (36 with an explicit [land:] marker).
