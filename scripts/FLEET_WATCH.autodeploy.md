# FLEET_WATCH.ps1 auto-deploy - manual test log

`.ps1` files have no automated test runner in this repo (vitest covers
`apps/web` only); this documents the real, live verification performed
against the actual shared checkout (`D:\ferrum_os_recovered`) before
landing, in place of an automated test.

Dot-sourced the function definitions only (stripped the trailing
`if ($Loop) {...}` auto-exec block, same technique used for W-50's
scheduler functions) and called `Invoke-AutoDeployIfAdvanced` directly
against the real repo, three times:

1. **Advance detected (real SHA, real fetch):**
   ```
   AUTO-DEPLOY: origin/main advanced to 6860135531ac2fa649c943ec5452d97fc49ab889 (previously deployed: ) - deploying.
   [DRY-RUN] would: check working tree clean; git merge --ff-only origin/main; pnpm type-check; pnpm build; wrangler deploy; record 6860135531ac2fa649c943ec5452d97fc49ab889 as deployed.
   ```
2. **No advance (idempotent - state file seeded with the current real SHA):**
   ```
   AUTO-DEPLOY: origin/main unchanged (6860135531ac2fa649c943ec5452d97fc49ab889) - nothing to do.
   ```
3. **Kill-switch (docs/DEPLOY_STOP present):**
   ```
   DEPLOY KILL-SWITCH present (D:\ferrum_os_recovered\docs\DEPLOY_STOP) - auto-deploy halted.
   ```

All test artifacts (`docs/DEPLOY_STOP`, `.fleet-deploy-state.json`)
were removed from the real repo after verification, before this branch
was committed - confirmed via `ls` (both return "No such file").
