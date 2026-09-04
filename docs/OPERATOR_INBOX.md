# OPERATOR_INBOX.md — Single question surface (AGENTS.md RULE 37)

Append-only. This is the ONLY operator-facing question surface per RULE
37(1) — every OPEN-FOR-OPERATOR line named in RULE 31/35/36 lands here,
not scattered across chat or individual ledger rows. Chat stays for the
operator's own live-site observations (RULE 36 intake); questions from
seats go here.

Per RULE 37(2): a seat waits at most ~10 agent-minutes for an answer,
then PARKS the task (timestamp + resume pointer) and pulls its next
non-blocked row. An answered PARKED task re-enters READY in timestamp
order. Per RULE 37(3): the conductor presents the full open inbox at
the top of every operator-present beat; the operator clears it in one
pass.

| Timestamp | Seat | Task ID | Question | Recommended answer | Status |
|-----------|------|---------|----------|---------------------|--------|
| 2026-09-04 | ATLAS (originally raised) | SITE_BASE_URL-INTERIM | Point `NEXT_PUBLIC_SITE_URL` at the live workers.dev URL until ferrumos.com DNS exists — social shares currently show no preview image, a live defect, not cosmetic. Carried over from docs/APPROVAL_QUEUE.md's own SITE_BASE_URL-INTERIM row (recommendation YES, decision previously blank/pending there) — consolidated into this single inbox per RULE 37(1), not a new ask. | YES — domain purchase stays the standing gate; this is an interim measure only, not a substitute for the real domain once purchased | OPEN |
| 2026-09-04 | (seeded, no originating seat recorded) | GPT-5.6-SOL-TRIAL | Seeded as an OPEN one-word line per RULE 37(4) / RULE 27's provisional-text limitation — the actual question text behind "GPT-5.6-SOL-TRIAL" was not supplied in any message SCRIBE received. SCRIBE has not invented what's being asked (a model trial? a Solana integration? unclear from the label alone) | NOT YET DEFINED — no recommendation possible without the real question | OPEN |
| 2026-09-04 | (seeded, no originating seat recorded) | SCORECARD-VIEW | Seeded as an OPEN one-word line per RULE 37(4) / RULE 27's provisional-text limitation — the actual question text behind "SCORECARD-VIEW" was not supplied in any message SCRIBE received. SCRIBE has not invented what's being asked | NOT YET DEFINED — no recommendation possible without the real question | OPEN |

## Notes

- GPT-5.6-SOL-TRIAL and SCORECARD-VIEW are genuinely unknown asks —
  whoever raised them (a seat, a prior conductor note not surfaced to
  SCRIBE) should supply the actual question text so these rows can
  carry a real recommendation instead of a placeholder. Until then they
  stay OPEN with no clock started, since RULE 37(2)'s timed-stop only
  applies once a seat is actually waiting on an answer to a real,
  posed question.
- SITE_BASE_URL-INTERIM's docs/APPROVAL_QUEUE.md row is left in place,
  not deleted — this inbox entry consolidates it as the operator-facing
  surface per RULE 37(1); APPROVAL_QUEUE.md remains the ledger of
  record for the eventual EXECUTED SHA once answered.
