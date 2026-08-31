<#
land.ps1 - squash-lands origin/w2-* branches onto main.
For each remote branch matching origin/w2-*, skips it if a commit tagged
"[land:<branch>]" already exists in the main log; otherwise squash-merges it,
commits with an [AI: SCRIPT] tag, and skips (with a logged reason) on conflict.
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

$skipped = @()
$landed = @()

foreach ($branch in $remoteBranches) {
    $shortName = $branch -replace '^origin/', ''
    $tag = Get-LandTag $shortName

    $alreadyLanded = git log main --oneline --grep="$tag" -F
    if ($alreadyLanded) {
        Write-Host "SKIPPED (already landed, tag match): $shortName"
        continue
    }

    # Cheap pre-check before attempting a squash merge: if the branch has no
    # unique changes since it diverged from main (git diff with the 3-dot
    # merge-base form), its content is already in main under a different
    # commit shape (e.g. landed before this script existed, or landed by
    # another process without the [land:...] tag). Skip without a merge
    # attempt instead of hitting an avoidable conflict.
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
if ($skipped.Count -gt 0) {
    $skipped | ForEach-Object { Write-Host "  SKIPPED: $_" }
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
