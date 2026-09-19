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

Failure-path safety (2026-09-19): this script NEVER runs `git clean`. A failed
squash is undone with `git reset --hard HEAD` only (index + tracked files),
after a start-of-run guard that refuses a dirty tracked tree. Branches whose
added paths collide with untracked files in the checkout are REPORTed
(phase=untracked-collision) without merging or deleting anything. Every failed
`git merge --squash` / `git commit` REPORT carries git's exit code and full
stdout+stderr (GIT-OUTPUT-BEGIN/END). Untracked files are snapshotted at start
and re-checked at end; any that vanish are listed as WARNING.

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

-Branch <name> (W2-398): restricts the whole run to that one branch
(short name, no origin/ prefix, e.g. "w2-373/crane-interaction-first")
instead of sweeping every origin/w2-* branch. Every other check (hold
list, sensitive-path pre-flight, docs-vs-non-docs handling, skip-if-
already-landed) applies identically — this only narrows which branch(es)
enter the loop. Lets a seat self-land its own single row safely without
touching anything else in flight, so routine self-landing (RULE 18)
doesn't need the catch-all sweep. Errors out immediately if the branch
doesn't exist on origin, rather than silently landing nothing.
#>

param(
    [string]$Branch
)

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

function Write-LandingReport($shortName, $phase, $files, $gitResult = $null) {
    $fileList = if ($files.Count -gt 0) { $files -join ', ' } else { 'none reported by git' }
    $exitText = if ($null -ne $gitResult) { " git_exit=$($gitResult.ExitCode)" } else { '' }
    Write-Host "REPORT (landing requires review): branch=$shortName phase=$phase files=$fileList$exitText"
    # 2026-09-19: "files=none reported by git" used to be the whole story when a
    # squash failed for a reason other than an unmerged path, which hid the real
    # cause. When a captured git result is supplied, its exit code and full
    # stdout+stderr are printed verbatim so the cause is never swallowed.
    if ($null -ne $gitResult) {
        Write-Host "GIT-OUTPUT-BEGIN branch=$shortName phase=$phase git_exit=$($gitResult.ExitCode)"
        foreach ($line in $gitResult.Output) { Write-Host $line }
        Write-Host "GIT-OUTPUT-END branch=$shortName"
    }
}

# Runs git with stdout+stderr merged and captured, returning the exit code and
# every output line. $ErrorActionPreference is relaxed for the call only: in
# Windows PowerShell 5.1, redirecting a native command's stderr under
# "Stop" turns each stderr line into a terminating NativeCommandError, which
# would kill the run before $LASTEXITCODE could be read.
function Invoke-GitCapture([string[]]$GitArgs) {
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $lines = @(& git @GitArgs 2>&1 | ForEach-Object { "$_" })
        $exit = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }
    return @{ ExitCode = $exit; Output = $lines }
}

# Undo a failed/aborted `git merge --squash` (which never sets MERGE_HEAD, so
# `git merge --abort` always fails: "There is no merge to abort"). Only
# `git reset --hard HEAD` is used: it reverts the index and TRACKED files the
# merge staged, and it never touches untracked files. There is deliberately NO
# `git clean` here or anywhere in this script - on 2026-09-19 the previous
# `git clean -fd` on this path deleted untracked evidence/log files from the
# shared checkout, unrecoverable from git. The tracked tree is verified clean
# at start of run (see the dirty-tracked-tree guard below), so reset --hard can
# only discard what this merge itself staged.
function Undo-FailedSquash($shortName) {
    $staged = @(git diff --cached --name-only)
    git reset --hard HEAD
    if ($LASTEXITCODE -ne 0) { throw "git reset --hard HEAD failed while undoing squash of $shortName" }
    Write-Host "UNDO: reset --hard HEAD for $shortName (index + tracked files only, $($staged.Count) merge-staged path(s) reverted; no git clean; untracked files untouched)"
}

# Paths the branch would add that already exist on disk as UNTRACKED,
# non-ignored files. `git merge`/`git checkout` refuse to overwrite those
# ("untracked working tree files would be overwritten") and exit nonzero with
# no unmerged paths. Reporting them up front - and never deleting them - keeps
# the operator's untracked files intact and names the exact collision.
function Get-UntrackedCollisions($paths) {
    $tracked = New-Object 'System.Collections.Generic.HashSet[string]'
    foreach ($t in @(git -c core.quotepath=off ls-files)) { [void]$tracked.Add($t) }
    $collisions = @()
    foreach ($p in $paths) {
        if ($tracked.Contains($p)) { continue }
        if (-not (Test-Path -LiteralPath $p -PathType Leaf)) { continue }
        git check-ignore -q -- $p
        if ($LASTEXITCODE -eq 0) { continue }
        $collisions += $p
    }
    return $collisions
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
    # stage-1 entry at all; `git show :1:path` fails. That is a real,
    # expected case here (hit for real 2026-09-03 on an old branch chain),
    # not a script bug. First attempt at this fix only checked
    # $LASTEXITCODE after redirecting stderr to $null — insufficient: with
    # this script's own $ErrorActionPreference = "Stop" in effect, a
    # failing native command's stderr write becomes a terminating
    # NativeCommandError BEFORE the $LASTEXITCODE check line ever runs, so
    # it crashed exactly the same way a second time (root-caused live
    # 2026-09-03: reproduced with a direct PowerShell repro against the
    # real conflicted docs/REUSE_MAP.md add/add state). A try/catch is the
    # only thing that actually stops the terminating error from
    # propagating; returns $null either way so the caller reports instead
    # of the whole run dying mid-sweep.
    try {
        $lines = @(git show ":$stage`:$path" 2>$null)
        if ($LASTEXITCODE -ne 0) { return $null }
        return ($lines -join "`n") + "`n"
    } catch {
        return $null
    }
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

# Dirty-tracked-tree guard. Undo-FailedSquash relies on `git reset --hard HEAD`,
# which would also discard pre-existing uncommitted edits to TRACKED files, so a
# dirty tracked tree is refused up front (nothing is modified or deleted).
# Untracked files are ignored here on purpose - they are never touched.
$dirtyTracked = @(git status --porcelain --untracked-files=no)
if ($dirtyTracked.Count -gt 0) {
    throw "Refusing to run: tracked files are modified/staged in this checkout (reset --hard would discard them). Nothing was changed. Entries: $($dirtyTracked -join ' | ')"
}

# Untracked-file tripwire: snapshot the untracked (non-ignored) file list now and
# compare at the end of the run. This script never deletes untracked files; if
# any disappear during the run, that is reported loudly (RULE 21 self-verify).
$untrackedBefore = @(git -c core.quotepath=off ls-files --others --exclude-standard)
Write-Host "Untracked-file snapshot: $($untrackedBefore.Count) file(s) at start of run"

$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    git checkout main
    if ($LASTEXITCODE -ne 0) { throw "git checkout main failed" }
}

git pull --rebase origin main
if ($LASTEXITCODE -ne 0) { throw "initial git pull --rebase origin main failed" }

if ($Branch) {
    $normalizedBranch = $Branch -replace '^origin/', ''
    $targetRef = "origin/$normalizedBranch"
    git show-ref --verify --quiet "refs/remotes/$targetRef"
    if ($LASTEXITCODE -ne 0) {
        throw "Branch '$targetRef' not found on origin (fetch already ran above) - check the name, no origin/ prefix needed."
    }
    $remoteBranches = @($targetRef)
    Write-Host "Single-branch mode: $targetRef"
} else {
    $remoteBranches = git branch -r | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^origin/w2-' -and $_ -ne 'origin/HEAD' }
}
$holdGlobs = Get-HoldGlobs
if ($holdGlobs.Count -gt 0) {
    Write-Host "Hold list active ($($holdGlobs.Count) pattern(s)): $($holdGlobs -join ', ')"
}

$skipped = @()
$landed = @()
$held = @()
$reported = @()

:branchLoop foreach ($branch in $remoteBranches) {
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

    $collisions = @(Get-UntrackedCollisions $uniquePaths)
    if ($collisions.Count -gt 0) {
        Write-LandingReport $shortName 'untracked-collision' $collisions
        Write-Host "NOTE: the paths above exist as UNTRACKED files in this checkout and the branch adds them; git would refuse to overwrite them. Nothing was merged and nothing was deleted - move or commit them, then re-run."
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
                # `continue 2` here (skip the while, continue the foreach)
                # is a real PowerShell gotcha: from a while nested inside a
                # foreach, `continue <N>` does NOT count loop levels the way
                # a first read suggests — it silently terminated the WHOLE
                # foreach instead of continuing it (confirmed live
                # 2026-09-03: every previous run of this script silently
                # stopped processing the branch list at the very first
                # docs-rebase-conflict it hit, with no error and no
                # indication anything was wrong — likely truncating every
                # sweep all session). A labeled loop + `continue branchLoop`
                # is the only construct that reliably continues the correct
                # loop level in PowerShell.
                continue branchLoop
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
        $mergeResult = Invoke-GitCapture @('merge', '--squash', $rebasedHead)
        foreach ($line in $mergeResult.Output) { Write-Host $line }
        if ($mergeResult.ExitCode -ne 0) {
            $conflicts = @(git diff --name-only --diff-filter=U)
            $mergeResult.Output += '--- git status --short (tracked files) ---'
            $mergeResult.Output += @(git status --short --untracked-files=no)
            Write-LandingReport $shortName 'docs-squash-conflict-after-rebase' $conflicts $mergeResult
            Undo-FailedSquash $shortName
            $reported += $shortName
            continue
        }

        $hasChanges = git diff --cached --name-only
        if (-not $hasChanges) {
            Write-Host "SKIPPED (no changes to land after docs rebase): $shortName"
            Undo-FailedSquash $shortName
            $skipped += $shortName
            continue
        }

        $commitResult = Invoke-GitCapture @('commit', '-m', "feat: $tag [AI: SCRIPT]")
        foreach ($line in $commitResult.Output) { Write-Host $line }
        if ($commitResult.ExitCode -ne 0) {
            Write-LandingReport $shortName 'docs-commit-failed' @() $commitResult
            Undo-FailedSquash $shortName
            $reported += $shortName
            continue
        }

        Write-Host "LANDED (docs rebase-then-squash): $shortName"
        $landed += $shortName
        continue
    }

    $mergeResult = Invoke-GitCapture @('merge', '--squash', $branch)
    foreach ($line in $mergeResult.Output) { Write-Host $line }
    if ($mergeResult.ExitCode -ne 0) {
        $conflicts = @(git diff --name-only --diff-filter=U)
        $mergeResult.Output += '--- git status --short (tracked files) ---'
        $mergeResult.Output += @(git status --short --untracked-files=no)
        Write-LandingReport $shortName 'squash-conflict' $conflicts $mergeResult
        # `git merge --squash` never sets MERGE_HEAD, so `git merge --abort`
        # always fails here ("There is no merge to abort") and leaves the
        # index/working tree dirty, corrupting every subsequent branch in
        # this loop. Undo with reset --hard only (no git clean - see
        # Undo-FailedSquash for why a clean here destroyed untracked files).
        Undo-FailedSquash $shortName
        $skipped += $shortName
        $reported += $shortName
        continue
    }

    $hasChanges = git diff --cached --name-only
    if (-not $hasChanges) {
        Write-Host "SKIPPED (no changes to land): $shortName"
        Undo-FailedSquash $shortName
        $skipped += $shortName
        continue
    }

    $commitResult = Invoke-GitCapture @('commit', '-m', "feat: $tag [AI: SCRIPT]")
    foreach ($line in $commitResult.Output) { Write-Host $line }
    if ($commitResult.ExitCode -ne 0) {
        Write-Host "SKIPPED (commit failed, git exit $($commitResult.ExitCode), output above): $shortName"
        Undo-FailedSquash $shortName
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

$untrackedAfter = @(git -c core.quotepath=off ls-files --others --exclude-standard)
$afterSet = New-Object 'System.Collections.Generic.HashSet[string]'
foreach ($u in $untrackedAfter) { [void]$afterSet.Add($u) }
$untrackedGone = @($untrackedBefore | Where-Object { -not $afterSet.Contains($_) })
Write-Host "Untracked-file check: before=$($untrackedBefore.Count) after=$($untrackedAfter.Count) disappeared=$($untrackedGone.Count)"
if ($untrackedGone.Count -gt 0) {
    Write-Host "WARNING: untracked file(s) disappeared during this run (this script never deletes untracked files - investigate):"
    $untrackedGone | Select-Object -First 50 | ForEach-Object { Write-Host "  GONE: $_" }
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

# RULE 21(1): "success" with zero landed against a reported (unlanded) branch is a
# failure, never a pass - return nonzero so callers (scripts/fleet/runner.py records
# the landing exit code) can see that work remains.
if ($landed.Count -eq 0 -and $reported.Count -gt 0) {
    Write-Host "EXIT 2: nothing landed and $($reported.Count) branch(es) reported (work remains)."
    exit 2
}
