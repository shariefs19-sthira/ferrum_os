<#
land.ps1 - squash-lands origin/w2-* branches onto main.
For each remote branch matching origin/w2-*, skips it when the branch's tip
is already fully represented on main (git diff main...origin/<branch> --stat
is empty); otherwise squash-merges it, commits with an [AI: SCRIPT] tag, and
skips (with a logged reason) on conflict. Branches matching a glob in
docs/LAND_HOLD.txt are skipped by this catch-all loop entirely (a targeted
`git merge --squash origin/<branch>` still works on a held branch — the hold
only applies to the automatic sweep).

Skip logic is diff-emptiness only, not a [land:<branch>] tag grep. A tag
grep only proves *some* commit on the branch landed at some point — it
false-positives on a multi-commit branch where a later push added real
content after an earlier commit already landed (a branch can be pushed to
again after its first commit lands). Landed commits are still tagged
[land:<branch>] for audit/history purposes; the tag is just not used as the
skip condition anymore.

Known, accepted quirk: docs/LAND_HOLD.txt is read ONCE at the start of a
run, into $holdGlobs, before the branch loop begins. If a commit landed
earlier in the SAME run adds a new hold pattern, that pattern does not
apply until the NEXT invocation of this script — branches matching it can
still land later in the current run. (Hit for real on 2026-09-01: landing
a hold-list update mid-run didn't stop three already-in-flight legacy
branches from landing again in that same run; they were reverted and the
hold applied cleanly on the next run.) If you need a hold to apply
immediately, don't rely on this script landing it for you mid-run — commit
docs/LAND_HOLD.txt directly to main first, then run this script.
After the loop: type-checks apps/web, then pushes main with rebase-retry.
#>

$ErrorActionPreference = "Stop"

function Ensure-GitIdentity {
    $name = git config user.name
    if (-not $name) {
        git config user.name "Ferrum-Landscript"
    }
    $email = git config user.email
    if (-not $email) {
        git config user.email "landscript@ferrum-os.local"
    }
}

function Get-LandTag($branchName) {
    return "[land:$branchName]"
}

function Get-HoldGlobs {
    $holdFile = "docs/LAND_HOLD.txt"
    if (-not (Test-Path $holdFile)) {
        return @()
    }
    return Get-Content $holdFile |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ -and -not $_.StartsWith('#') }
}

function Test-OnHold($shortName, $holdGlobs) {
    foreach ($glob in $holdGlobs) {
        if ($shortName -like $glob) {
            return $true
        }
    }
    return $false
}

Ensure-GitIdentity

git fetch origin --prune
if ($LASTEXITCODE -ne 0) { throw "git fetch origin failed" }

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    git checkout main
    if ($LASTEXITCODE -ne 0) { throw "git checkout main failed" }
}

git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { throw "initial git pull --rebase origin main failed" }

$remoteBranches = git branch -r | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^origin/w2-' -and $_ -ne 'origin/HEAD' }
$holdGlobs = Get-HoldGlobs
if ($holdGlobs.Count -gt 0) {
    Write-Host "Hold list active ($($holdGlobs.Count) pattern(s)): $($holdGlobs -join ', ')"
}

$skipped = @()
$landed = @()
$held = @()

foreach ($branch in $remoteBranches) {
    $shortName = $branch -replace '^origin/', ''

    if (Test-OnHold $shortName $holdGlobs) {
        Write-Host "HELD (docs/LAND_HOLD.txt): $shortName"
        $held += $shortName
        continue
    }

    $tag = Get-LandTag $shortName

    # Skip condition: the branch's tip has no unique changes left vs main
    # (3-dot merge-base diff is empty), meaning it's already fully
    # represented on main — whether that happened via this script, a
    # targeted merge, or another process entirely. This is the ONLY skip
    # check; a [land:<branch>] tag existing on main is not sufficient on
    # its own, since a branch can receive a second push with real new
    # content after its first commit already landed (W2-244 hit exactly
    # this: the tag grep skipped the branch's second commit).
    $uniqueDiff = git diff "main...$branch" --stat
    if (-not $uniqueDiff) {
        Write-Host "SKIPPED (no unique changes vs main): $shortName"
        continue
    }

    git merge --squash $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "SKIPPED (conflict on squash): $shortName"
        # `git merge --squash` never sets MERGE_HEAD, so `git merge --abort`
        # always fails here ("There is no merge to abort") and leaves the
        # index/working tree dirty, corrupting every subsequent branch in
        # this loop. Clean up with reset + clean instead.
        git reset --hard HEAD
        git clean -fd
        $skipped += $shortName
        continue
    }

    $hasChanges = git diff --cached --name-only
    if (-not $hasChanges) {
        Write-Host "SKIPPED (no changes to land): $shortName"
        git reset --hard HEAD
        $skipped += $shortName
        continue
    }

    git commit -m "feat: $tag [AI: SCRIPT]"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "SKIPPED (commit failed): $shortName"
        git reset --hard HEAD
        $skipped += $shortName
        continue
    }

    Write-Host "LANDED: $shortName"
    $landed += $shortName
}

Write-Host "---"
Write-Host "Landed: $($landed.Count)"
Write-Host "Skipped: $($skipped.Count)"
Write-Host "Held: $($held.Count)"
if ($skipped.Count -gt 0) {
    $skipped | ForEach-Object { Write-Host "  SKIPPED: $_" }
}
if ($held.Count -gt 0) {
    $held | ForEach-Object { Write-Host "  HELD: $_" }
}

if ($landed.Count -gt 0) {
    Write-Host "Running type-check: pnpm --filter ./apps/web exec tsc --noEmit"
    pnpm --filter ./apps/web exec tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        throw "tsc --noEmit failed after landing $($landed.Count) branch(es); not pushing. Fix and re-run, or revert the landing commits."
    }

    $maxRetries = 3
    $pushed = $false
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        git push origin HEAD:main
        if ($LASTEXITCODE -eq 0) {
            $pushed = $true
            break
        }
        Write-Host "Push attempt $attempt failed; pulling --rebase and retrying."
        git pull --rebase origin main
        if ($LASTEXITCODE -ne 0) { throw "git pull --rebase origin main failed during retry $attempt" }
    }

    if (-not $pushed) {
        throw "git push origin HEAD:main failed after $maxRetries attempts"
    }

    Write-Host "Push succeeded."
} else {
    Write-Host "Nothing landed; skipping type-check and push."
}
