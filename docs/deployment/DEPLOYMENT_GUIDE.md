# Ferrum OS — Deployment Guide

## The four states this fleet's own docs distinguish

`docs/fleet/AUTOMATION_RUNBOOK.md`'s "Sources of truth" table
(lines 36-50) is the authoritative statement of this vocabulary —
reused verbatim rather than inventing separate terms:

| Concern | Authoritative source |
|---|---|
| **Authored** change | Commit on the task branch |
| **Landed** change | Tree evidence plus `[land:<branch>]` marker on `origin/main` |
| **Deployment** | Deployment record tied to the landed SHA |
| User-visible acceptance | Required **rendered-edge evidence** |

So the practical vocabulary this repo uses, end to end:

1. **AUTHORED** — a real commit exists on a task branch (in a worktree,
   not yet merged).
2. **LANDED** — that change is merged to `origin/main` via
   `scripts/land.ps1`, tagged `[land:<branch>]`.
3. **DEPLOYED** — the landed SHA on `origin/main` has actually been
   pushed live via `wrangler deploy` (either `FLEET_WATCH.ps1`'s
   `Invoke-AutoDeployIfAdvanced` or a manual run).
4. **RENDERED-EDGE-VERIFIED** (also called "live proof" /
   "deployed-edge" verification in `docs/TASK_BOARD.md` rows and
   `docs/fleet/AUTOMATION_RUNBOOK.md`) — someone actually loaded the
   live URL (or curled it) and confirmed the change is really there.
   `docs/TASK_BOARD.md`'s W-26 row is an explicit example of this
   distinction being drawn in practice: "this DONE marks landing, not a
   live-proof claim" — landing and live-proof are recorded as two
   separate facts on the same row, not conflated.

`scripts/fleet/evidence.py`'s `EvidenceState` dataclass encodes exactly
these four states as independent booleans (`authored`, `pushed`,
`landed`, `deployed`, `live`) computed from real git/filesystem checks
— see `docs/architecture/COMPONENT_SPECIFICATIONS.md`'s evidence
section for the derivation logic.

## Prerequisites

- Node.js `>=18.0.0` (root `package.json:14-15` `engines`).
- `pnpm` (workspace package manager — root scripts all use `pnpm
  --filter`).
- `wrangler` — pinned as a root devDependency at `4.130.0` (root
  `package.json:17`), not resolved via `npx`. `FLEET_WATCH.ps1`'s own
  comment (lines 1024-1043) documents why: `npx wrangler deploy`
  previously prompted an interactive "Ok to proceed? (y)" install
  confirmation for a new wrangler version, which a headless daemon has
  no stdin to answer — fixed at the root cause by pinning the
  dependency so `pnpm exec wrangler` resolves straight from
  `node_modules/.bin`, never hitting the registry-lookup/install-confirm
  path at all.
- An authenticated wrangler session (`wrangler login`) with access to
  the Cloudflare account owning D1 database `ferrum-os-data`
  (`049b0f34-adb3-4f7f-85ec-60170019f3a0`) and the `ferrumos-preview`
  Worker.

## Build

Root `package.json` scripts (`package.json:4-12`):

```json
"build": "pnpm --filter ./apps/web build"
```

`apps/web/package.json:7`: `"build": "next build"`. Static export
output lands wherever `wrangler.jsonc`'s `assets.directory` points —
`./apps/web/out` (`wrangler.jsonc:6`).

```bash
pnpm build
```

Root also exposes `pnpm lint` (`pnpm --filter ./apps/web lint`) and
`pnpm type-check` (`pnpm --filter ./apps/web exec tsc --noEmit`) and
`pnpm test` (`pnpm --filter ./apps/web test:run`, which runs `vitest
run` per `apps/web/package.json:11`).

## Deploy

```bash
pnpm exec wrangler deploy
```

Confirmed working live this session: deploys the Worker named
`ferrumos-preview` (`wrangler.jsonc:2`) to
`https://ferrumos-preview.shariefsatyala.workers.dev`. This is also the
`liveUrl` recorded in `docs/FLEET_SEATS.json`'s `deployment` block,
which every seat and audit script is supposed to read from as the
single source of truth rather than a hardcoded/remembered value (its
own comment: "the worker was renamed 2026-09-05 ... and the old URL now
404s"). The retired URL,
`https://ferrum-os.shariefsatyala.workers.dev`, now 404s (Cloudflare
error 1042 on every route) — never use it in new docs, tests, or config.

### Structured deploy output

`WRANGLER_OUTPUT_FILE_PATH` is an env var wrangler honors: pointed at a
file path, wrangler writes one NDJSON object per line describing the
deploy, including a `version_id` field on the line where
`"type":"deploy"`. `scripts/FLEET_WATCH.ps1`'s
`Get-WranglerDeployVersionId` function (lines 963-976) reads this file
rather than regex-parsing wrangler's human-readable stdout, "which is
not a stable contract and has changed field names before ('Deployment
ID' renamed to 'Version ID' per Cloudflare's own changelog)" (comment,
lines 959-962). To capture the version ID manually:

```bash
export WRANGLER_OUTPUT_FILE_PATH=/tmp/wrangler-deploy.ndjson
pnpm exec wrangler deploy
grep '"type":"deploy"' /tmp/wrangler-deploy.ndjson
```

## Automatic deploy (the fleet's own mechanism)

`scripts/FLEET_WATCH.ps1`'s `Invoke-AutoDeployIfAdvanced`
(lines 985-1090) is the local harness that closes the deploy loop
without operator action, described in its own header comment
(lines 911-919) as the *primary* deploy path — using "the operator's
own already-authenticated wrangler session," with the equivalent
GitHub Actions CI job (`.github/workflows/ci.yml`) as optional
redundancy that "becomes optional redundancy, not superseded/removed."

Each `FLEET_WATCH.ps1` cycle:

1. Checks `docs/DEPLOY_STOP` (the deploy-specific kill-switch,
   independent of `docs/FLEET_WATCH_STOP`) — halts if present.
2. Fetches `origin/main`, compares its SHA to
   `.fleet-deploy-state.json`'s `LastDeployedSha`. No-ops if unchanged.
3. Only fast-forwards (`git merge --ff-only origin/main`) — never
   resets or rebases the shared checkout. Aborts with an alert if the
   working tree is dirty or history has diverged.
4. Runs `pnpm type-check`, then `pnpm build`, then `pnpm exec wrangler
   deploy` (with `WRANGLER_OUTPUT_FILE_PATH` set to a temp file).
5. Only on a successful (`$LASTEXITCODE -eq 0`) `wrangler deploy` does
   it record `LastDeployedSha`/`LastVersionId`/`DeployHistory` into
   `.fleet-deploy-state.json` — a failure at any prior step, or at the
   deploy step itself, throws before this write, so the next cycle
   retries automatically against the same unchanged
   `LastDeployedSha`. The script's own comment calls this throw "the
   ENTIRE mechanism that keeps a failed deploy from being recorded as
   deployed" (lines 1054-1065), and notes it's regression-tested by
   `scripts/tests/deploy-state-no-write-on-failure.test.ps1`.

## Rollback

No dedicated rollback script exists in this repo as read. The fleet's
own deploy-versioning design (`Get-WranglerDeployVersionId`,
`.fleet-deploy-state.json`'s `DeployHistory` array of `{Sha, VersionId,
DeployedAt}`) exists specifically so a human has the real Cloudflare
Workers version ID for any prior deploy on hand — the comment
introducing it states the motivation directly: "the operator's
PI-evidence-gap ask ('PI cannot cite artifact-specific deployment
version IDs — the harness records only HTTP 200')" (lines 953-956).
With a version ID in hand, rollback is wrangler's own
version/rollback mechanism (`wrangler rollback [<version-id>]` per
wrangler's own CLI, invoked manually — no wrapper script for this
exists in `scripts/`). This document does not assert a rollback command
was exercised in this repo's history; state that as unconfirmed if a
reader needs it verified.

## Monitoring

- **Deploy failure alerting**: `Send-NtfyAlert` posts to
  `https://ntfy.sh/$env:FLEET_NTFY_TOPIC` on `AUTO-DEPLOY FAILED`
  (`scripts/FLEET_WATCH.ps1:1083-1085`), stalled-fleet detection, and
  silent-idle detection.
- **Health check**: `GET /api/health` → `{"status":"ok"}` — the
  cheapest live-edge smoke check (`apps/web/worker.ts:90`).
- **`docs/FLEET_SEATS.json`'s `deployment` block** carries
  `verifiedHttpStatus: 200` and `verifiedAt` for the last confirmed-live
  check against `liveUrl`.

## Troubleshooting

- **`npx wrangler` prompts for install confirmation and hangs
  headless**: fixed by the pinned root `wrangler` devDependency — use
  `pnpm exec wrangler`, never a bare `npx wrangler`.
- **Auto-deploy silently not running**: check `docs/DEPLOY_STOP` (the
  deploy-specific kill-switch) and `docs/FLEET_WATCH_STOP` (halts the
  whole watch loop, including auto-deploy) for presence.
- **A deploy succeeded but `.fleet-deploy-state.json` didn't update /
  next cycle deploys again**: by design if `wrangler deploy` itself
  returned non-zero — the state write only happens after a confirmed
  zero exit code.
- **Deploying the wrong SHA / a dirty checkout**: `FLEET_WATCH.ps1`
  refuses to touch a dirty `$repoRoot` working tree automatically
  (`git status --porcelain` check, line 1008-1011) — clean it or commit
  before relying on auto-deploy.

## What this document does not cover

- CI-based deploy (`.github/workflows/ci.yml`) — named as "optional
  redundancy" by `FLEET_WATCH.ps1`'s own comment, not read in detail
  for this pass.
- `scripts/fleet/**`'s own deploy adapter — as read in
  `scripts/fleet/runner.py`, `--deploy` only records intent
  (`metadata["deploy_held"]`); no deploy adapter is actually invoked by
  that runner yet ("deployment remains held until landed evidence is
  true and a reviewed deploy adapter is invoked," `runner.py:372-374`).
