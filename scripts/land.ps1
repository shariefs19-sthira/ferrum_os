<#
land.ps1 - squash-lands origin/w2-* branches onto main.
For each remote branch matching origin/w2-*, skips it when the branch's tip
is already fully represented on main (git diff main...origin/<branch> --stat
is empty). Docs-only branches are first rebased onto current main from a
detached checkout and then squash-merged; only independently appended shared
docs additions are auto-combined. Any unresolved conflict emits REPORT and
returns main to a clean state without a landing commit. Other branches squash
merge, commit with an [AI: SCRIPT] tag, and REPORT on conflict. Branches matching a glob in
Self-landing envelope pre-flight: before any branch is rebased or
squash-merged, its unique diff is checked against a fixed sensitive-path
list (worker.ts, migrations/**, apps/web/public/_headers, and RULE 6's
protected paths — apps/web/app/boq-pro/**, package.json, pnpm-lock.yaml,
next.config.js, middleware.ts). A match REFUSES the auto-land outright
(no rebase attempt, no squash attempt) and REPORTs it as needing CRANE's
direct manual review — these are exactly the paths where a silent
auto-merge could regress security headers, corrupt a migration sequence,
or violate a protected-path approval, so this script never resolves a
conflict on them itself, only flags.

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

function Write-LandingReport($shortName, $phase, $files) {
    $fileList = if ($files.Count -gt 0) { $files -join ', ' } else { 'none reported by git' }
    Write-Host "REPORT (landing requires review): branch=$shortName phase=$phase files=$fileList"
}

# Self-landing envelope pre-flight (W2-357 addendum). Any path matching one
# of these is sensitive enough that an unattended auto-merge is refused,
# regardless of whether the merge itself would succeed cleanly.
$script:SensitivePathPatterns = @(
    '^apps/web/worker\.ts$',
    '^migrations/',
    '^apps/web/public/_headers$',
    '^apps/web/app/boq-pro/',
    '^package\.json$',
    '^pnpm-lock\.yaml$',
    '^apps/web/next\.config\.js$',
    '^apps/web/middleware\.ts$'
)

function Get-SensitivePathMatches($paths) {
    return @($paths | Where-Object {
        $path = $_
        $script:SensitivePathPatterns | Where-Object { $path -match $_ }
    })
}

function Get-RebaseIndexText($stage, $path) {
    # A genuine add/add conflict (the path has no common ancestor version —
    # e.g. two branches independently created the same new file) has no
    # stage-1 entry at all; `git show :1:path` fails with a non-zero exit.
    # That is a real, expected case here (hit for real 2026-09-03 on an old
    # branch chain), not a script bug — return $null so the caller treats
    # it as unresolvable-by-this-heuristic and reports, instead of an
    # uncaught throw crashing the whole run mid-loop and leaving the
    # working tree in an in-progress-rebase state for every branch after it.
    $lines = @(git show ":$stage`:$path" 2>$null)
    if ($LASTEXITCODE -ne 0) { return $null }
    return ($lines -join "`n") + "`n"
}

function Resolve-AppendOnlyDocsRebaseConflicts {
    $conflicts = @(git diff --name-only --diff-filter=U)
    if ($conflicts.Count -eq 0 -or @($conflicts | Where-Object { $_ -notmatch '^docs/' }).Count -gt 0) {
        return @{ Resolved = $false; Files = $conflicts }
    }

    foreach ($path in $conflicts) {
        $base = Get-RebaseIndexText 1 $path
        $mainText = Get-RebaseIndexText 2 $path
        $branchText = Get-RebaseIndexText 3 $path
        if ($null -eq $base -or $null -eq $mainText -or $null -eq $branchText) {
            return @{ Resolved = $false; Files = $conflicts }
        }
        # Rebase stage 2 is current main; stage 3 is the branch being replayed.
        # Only append-only edits on both sides are safe to combine automatically.
        if (-not $mainText.StartsWith($base, [System.StringComparison]::Ordinal) -or
            -not $branchText.StartsWith($base, [System.StringComparison]::Ordinal)) {
            return @{ Resolved = $false; Files = $conflicts }
        }

        $merged = $mainText + $branchText.Substring($base.Length)
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($path, $merged, $utf8NoBom)
        git add -- $path
        if ($LASTEXITCODE -ne 0) { throw "git add failed while resolving $path" }
    }

    return @{ Resolved = $true; Files = $conflicts }
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
$reported = @()

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
    $uniquePaths = @(git diff "main...$branch" --name-only)
    if ($uniquePaths.Count -eq 0) {
        Write-Host "SKIPPED (no unique changes vs main): $shortName"
        continue
    }

    $sensitiveMatches = Get-SensitivePathMatches $uniquePaths
    if ($sensitiveMatches.Count -gt 0) {
        Write-LandingReport $shortName 'sensitive-path-preflight-refused' $sensitiveMatches
        $reported += $shortName
        continue
    }

    $docsOnly = @($uniquePaths | Where-Object { $_ -notmatch '^docs/' }).Count -eq 0
    if ($docsOnly) {
        # Rebase a detached copy, so the remote branch is never rewritten.
        git checkout --detach $branch
        if ($LASTEXITCODE -ne 0) { throw "git checkout detached failed for $shortName" }
        git rebase main
        $rebaseExit = $LASTEXITCODE

        while ($rebaseExit -ne 0) {
            $resolution = Resolve-AppendOnlyDocsRebaseConflicts
            if (-not $resolution.Resolved) {
                Write-LandingReport $shortName 'docs-rebase-conflict' $resolution.Files
                git rebase --abort
                git checkout main
                if ($LASTEXITCODE -ne 0) { throw "git checkout main failed after rebase report for $shortName" }
                $reported += $shortName
                continue 2
            }

            $previousEditor = $env:GIT_EDITOR
            $env:GIT_EDITOR = 'true'
            git rebase --continue
            $rebaseExit = $LASTEXITCODE
            if ($null -eq $previousEditor) { Remove-Item Env:GIT_EDITOR -ErrorAction SilentlyContinue } else { $env:GIT_EDITOR = $previousEditor }
        }

        $rebasedHead = (git rev-parse HEAD).Trim()
        git checkout main
        if ($LASTEXITCODE -ne 0) { throw "git checkout main failed after rebase for $shortName" }
        git merge --squash $rebasedHead
        if ($LASTEXITCODE -ne 0) {
            $conflicts = @(git diff --name-only --diff-filter=U)
            Write-LandingReport $shortName 'docs-squash-conflict-after-rebase' $conflicts
            git reset --hard HEAD
            $reported += $shortName
            continue
        }

        $hasChanges = git diff --cached --name-only
        if (-not $hasChanges) {
            Write-Host "SKIPPED (no changes to land after docs rebase): $shortName"
            git reset --hard HEAD
            $skipped += $shortName
            continue
        }

        git commit -m "feat: $tag [AI: SCRIPT]"
        if ($LASTEXITCODE -ne 0) {
            Write-LandingReport $shortName 'docs-commit-failed' @()
            git reset --hard HEAD
            $reported += $shortName
            continue
        }

        Write-Host "LANDED (docs rebase-then-squash): $shortName"
        $landed += $shortName
        continue
    }

    git merge --squash $branch
    if ($LASTEXITCODE -ne 0) {
        $conflicts = @(git diff --name-only --diff-filter=U)
        Write-LandingReport $shortName 'squash-conflict' $conflicts
        # `git merge --squash` never sets MERGE_HEAD, so `git merge --abort`
        # always fails here ("There is no merge to abort") and leaves the
        # index/working tree dirty, corrupting every subsequent branch in
        # this loop. Clean up with reset + clean instead.
        git reset --hard HEAD
        git clean -fd
        $skipped += $shortName
        $reported += $shortName
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
Write-Host "Reported: $($reported.Count)"
if ($skipped.Count -gt 0) {
    $skipped | ForEach-Object { Write-Host "  SKIPPED: $_" }
}
if ($held.Count -gt 0) {
    $held | ForEach-Object { Write-Host "  HELD: $_" }
}
if ($reported.Count -gt 0) {
    $reported | ForEach-Object { Write-Host "  REPORT: $_" }
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
