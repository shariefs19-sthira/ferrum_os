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

## W-64 BOOTSTRAP_LAUNCH — original scope not found on disk (2026-09-05)
An amendment instruction cited "W-64 BOOTSTRAP_LAUNCH" and gave a real
line to add to it ("bootstrap = zero investor dependency, NOT reduced
features; the full roadmap ships on free tiers; premium data sources
are upgrades, not gates."), but this row's own title/envelope/
acceptance were never seeded on docs/TASK_BOARD.md or found anywhere
else on disk — checked directly, not assumed missing. The amendment
text is preserved on the board's W-64 row (STUCK status) so it isn't
lost, but the row cannot become pull-eligible until its actual scope
is supplied. **Single blocking question:** what is W-64 BOOTSTRAP_LAUNCH's
full scope (envelope, eligible seat, acceptance criteria) — was it
established in a prior turn not surfaced to SCRIBE, or does it need to
be authored fresh from this amendment line alone?

## W-79 RESPEC_ENVIZ — "enviz" does not resolve to a verifiable target (2026-09-06)
Per `docs/TECH_SCOUT.md` #13, a live `gh api`/`gh search repos` check
for an "enviz-style immersive 3D web setup" found no canonical
matching repository — GitHub search for "enviz" surfaces unrelated
projects (a pentest network-visualization tool, IBM's "Envizi"
emissions-accounting product, an enrollment-visualization class
project). None concern immersive 3D web scenes. Recorded on
docs/TASK_BOARD.md's W-79 row as STUCK, not READY, since no seat can
productively execute against an unverifiable reference. **Single
blocking question:** what specific reference site, repo, or demo was
meant by "enviz" — a concrete link or exact project name is needed
before this row can be scouted or built against for real.

**ANSWERED (2026-09-06):** the operator re-specified the underlying
feature intent directly, without a repo reference — seven concrete
cockpit capabilities (walk-mode, IFC/Speckle ingestion, WebXR AR,
in-space annotation, live guided tours, material swap, automated
flythrough), split into docs/TASK_BOARD.md rows W-79a through W-79g,
each READY and owner-agnostic. This question is CLOSED.

## W-75 INTEGRATE_PLAUSIBLE - public deployment target absent (2026-09-06)
Docker is available locally, but no public Plausible host, analytics
hostname, or deployment-platform configuration/credential is present in
the repository. A local container cannot meet W-75's deployed-edge
pageview acceptance. **Single blocking question:** which public host and
hostname should receive the separate, unmodified Plausible service?
Recommended answer: provide an existing operator-controlled container
host and analytics subdomain; do not colocate this separate AGPL service
inside the Ferrum Worker.
