<#
FLEET_WATCH.ps1 - fleet watch v3 (AGENTS.md RULE 38, amended W2-410;
W-50 HARNESS_24x7 additions below the v2 doc comment).

W-50 additions (seat-agnostic harness, built on top of v2's Codex-only
watch loop):
- SEATS CONFIG: docs/FLEET_SEATS.json - id/worktreeGlob/missionFile/
  reviveCmdTemplate/adapter/lastStop/nextReviveAt per seat, loaded at
  the top of every cycle so editing the file changes behavior without
  a script edit.
- CODEX ADAPTER (active): Get-CodexResetTime parses a "try again at
  <time>" limit message into an exact next-revive timestamp, recorded
  into FLEET_SCHEDULE.md and the seat's nextReviveAt. Test-DueForRevival
  compares the clock every cycle and fires exactly once the current
  time has reached that recorded minute (not a coarse "past reset +
  grace window" heuristic - this is the operator's recorded-time
  requirement).
- CLAUDE ADAPTER (wired, gated): Start-ClaudeSeat builds a real
  `claude -p` command from the seat's brief + dispatched task row, but
  is only ever called when -EnableClaudeAdapter is passed - "wired now,
  used after operator flip" per the operator's own framing, not
  auto-armed by landing this file.
- DISPATCH: Get-TopReadyRow reads docs/TASK_BOARD.md and returns the
  first row whose Status column contains READY, in table order (the
  board's own priority order - no separate P1-P14 column exists on
  disk, so table order is what "priority order" means here; noted
  rather than inventing a numeric field the board doesn't have).
- DRY RUN: -DryRun runs one full cycle against a synthetic Codex probe
  string (so a real live limit isn't required to prove the logic) and
  a real read of TASK_BOARD.md, logs every decision, and never calls
  Start-Process for any adapter - proves the scheduling/dispatch logic
  without taking a live action. Landing this script does not start a
  persistent scheduled task; it still only runs inside the existing
  keep-awake window per v2's own model, one cycle or -Loop at a time.
#>

<#
FLEET_WATCH.ps1 - fleet watch v2 (AGENTS.md RULE 38, amended W2-410).

Runs inside the existing keep-awake PowerShell window (scheduler v1 per
operator instruction - this script is NOT its own scheduled task; it is
invoked by, or run inside, that already-running loop). Each invocation
does exactly one watch cycle by default: heartbeat scan -> Codex probe
-> revival check -> ntfy alerts on transitions -> docs/FLEET_SCHEDULE.md
update. Pass -Loop to run continuously with a 60-minute cycle instead
(matches the "every 60m probe" instruction) - default is single-shot so
this is testable and reviewable without starting a background process
by accident.

KILL-SWITCH (RULE 38(6)): the presence of docs/FLEET_WATCH_STOP halts
the loop immediately, checked at the top of every cycle - a human can
stop this at any time by creating that file, no flag or parameter
needed. Checked BEFORE any probe/revival/alert action every cycle, not
just once at startup, so it takes effect even mid-run.

ALERT CHANNEL (RULE 38(4), amended by the operator 2026-09-04): ntfy,
via the topic named by $env:FLEET_NTFY_TOPIC, default placeholder
"ferrum-fleet-local" if unset - a harmless placeholder, not a fabricated
real endpoint; the operator subscribes to whatever topic they actually
set later. Alerts fire only on TRANSITIONS (limit-lifted, revived,
stalled>45m, an OPEN-FOR-OPERATOR line newly posted), never on steady
state, so this doesn't spam on every cycle.

REVIVAL ORDER (RULE 38(1)): OS-level watchdog is primary and is NOT this
script's job (this script IS one implementation of graceful revival
logic, but a true OS-level watchdog restarting a hung PROCESS is a
separate, lower-level concern outside PowerShell's reach here).
Claude-revives-Codex (this script's actual job) is the secondary path:
probe Codex, and if it was dark and is now reachable, or if it's dark
10+ minutes past a known reset time while this Claude seat is active,
launch the mission file.
#>

param(
    [switch]$Loop,
    [int]$IntervalMinutes = 60,
    [string[]]$KnownCodexResetTimes = @(),  # e.g. @('00:00','12:00') in 24h HH:mm, local time - operator-configurable, empty by default (no invented schedule)
    [int]$KnownResetGraceMinutes = 10,
    [int]$StalledAlertMinutes = 45,
    [switch]$DryRun,                        # W-50: run one cycle against a synthetic probe, log decisions, never Start-Process
    [switch]$EnableClaudeAdapter,            # W-50: claude adapter is wired but inert until this is passed explicitly
    [string]$SeatsConfigPath,                 # W-50: defaults to docs/FLEET_SEATS.json under $repoRoot
    [string]$DryRunCodexProbeOutput = '',    # W-50: inject a synthetic Codex CLI response for -DryRun instead of calling the real CLI
    [int]$SilentIdleThresholdMinutes = 15,   # silent-idle detector: minutes since last activity before a seat with owned READY rows and no posted question is flagged
    [switch]$EnableTriggerDaemon,            # W-98: per-seat headless drain loop is wired but inert until this is passed explicitly - same "built now, fired after operator flip" pattern as -EnableClaudeAdapter
    [int]$TriggerDaemonBaseBackoffSeconds = 60,
    [int]$TriggerDaemonMaxBackoffSeconds = 14400, # 4h cap - a rate-limited seat backs off exponentially from the base but never waits longer than this before the next retry
    [int]$TriggerDaemonRespawnDelaySeconds = 5,   # W-98 respawn policy: pause between an exit-0 spawn and its immediate respawn when the seat still has dispatchable rows
    [int]$TriggerDaemonMaxRespawnsPerCycle = 20   # per-seat cap on immediate respawns within one Invoke-SeatTriggerDaemon call, so a stuck condition can't spin forever inside one cycle - the outer -Loop cycle remains the real backstop
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\ferrum_os_recovered"
$missionFile = "D:\ferrum_os\overnight_codex.md"
$killSwitchPath = Join-Path $repoRoot "docs\FLEET_WATCH_STOP"
$stateFile = Join-Path $repoRoot ".fleet-watch-state.json"
$taskBoardFile = Join-Path $repoRoot "docs\TASK_BOARD.md"
$deployStopPath = Join-Path $repoRoot "docs\DEPLOY_STOP"
$deployStateFile = Join-Path $repoRoot ".fleet-deploy-state.json"
$triggerDaemonLedgerFile = Join-Path $repoRoot ".fleet-trigger-daemon-log.ndjson"
$triggerDaemonLegacyLedgerFile = Join-Path $repoRoot ".fleet-trigger-daemon-log.json"
$worktreeRoot = "D:\ferrum_os.worktrees"
if ([string]::IsNullOrWhiteSpace($SeatsConfigPath)) { $SeatsConfigPath = Join-Path $repoRoot "docs\FLEET_SEATS.json" }

# SINGLE-INSTANCE GUARD (added 2026-09-09, per operator ask): a stale
# FLEET_WATCH.ps1 process from before a fix landed can keep running
# indefinitely in memory - a running PowerShell process never reloads
# its script body from disk. Confirmed live this session: docs/
# FLEET_SEATS.json kept reverting to its pre-fix shape hours after the
# landing that removed its only writer, because an old process was
# still executing the old in-memory code, invisible to `git log` or
# any on-disk inspection. A named OS mutex means a second launch (a
# fresh copy, or another stale one) can never silently coexist with
# whichever instance already holds it - it fails fast with a clear
# logged reason instead of two processes quietly fighting over the
# same state files. `Global\` scopes it per-machine (not per Windows
# session), matching "one FLEET_WATCH, period" rather than "one per
# login session."
$singleInstanceMutexName = "Global\FerrumOS_FLEET_WATCH_SingleInstance"
$singleInstanceMutex = New-Object System.Threading.Mutex($false, $singleInstanceMutexName)
$singleInstanceAcquired = $false
try {
    $singleInstanceAcquired = $singleInstanceMutex.WaitOne(0)
} catch [System.Threading.AbandonedMutexException] {
    # The previous holder exited without releasing (killed rather than
    # stopped cleanly, e.g. via Task Manager) - .NET still hands us
    # ownership on this exception; a genuinely dead prior instance
    # should not permanently lock out every future launch.
    $singleInstanceAcquired = $true
    Write-Host "FLEET_WATCH: acquired the single-instance mutex after a prior holder exited abnormally (abandoned mutex) - continuing."
}
if (-not $singleInstanceAcquired) {
    Write-Host "FLEET_WATCH: REFUSING TO START - another instance already holds the single-instance mutex ($singleInstanceMutexName). If that instance is actually dead (crashed without releasing it, which .NET would normally detect - or is confirmed hung), find and kill its process first, then relaunch."
    $singleInstanceMutex.Dispose()
    exit 1
}

$seats = @('CRANE', 'MASON', 'RIVET', 'ATLAS', 'SCRIBE', 'FERRITE', 'PI')
$codexBackedSeats = @('MASON', 'RIVET')  # per docs/seats/*.md - these run on Codex CLI, not Claude

function Get-FleetSeatsConfig {
    if (-not (Test-Path $SeatsConfigPath)) {
        Write-Host "No seats config at $SeatsConfigPath - W-50 adapter/dispatch features are inert without it."
        return $null
    }
    try {
        return (Get-Content $SeatsConfigPath -Raw | ConvertFrom-Json).seats
    } catch {
        Write-Host "Failed to parse $($SeatsConfigPath): $($_.Exception.Message)"
        return $null
    }
}

# BUG FOUND LIVE 2026-09-08: this used to hardcode a `{_comment, seats}`
# wrapper on every write, which silently DROPPED any other real
# top-level key already in the file - specifically the `deployment`
# block (the single source of truth for the live URL, per its own
# comment, read by scripts/get-live-base-url.mjs and every ATLAS
# battery script). Confirmed live: after the trigger daemon's own
# backoff persistence (since removed - see Invoke-SeatTriggerDaemon)
# called this function every cycle, docs/FLEET_SEATS.json's real
# `deployment` block was gone from the working tree. Fixed by loading
# the CURRENT on-disk wrapper first and preserving every property on
# it except `seats`, rather than reconstructing the wrapper from
# scratch with only the two fields this function happens to know
# about.
function Save-FleetSeatsConfig($SeatsArray) {
    $wrapper = $null
    if (Test-Path $SeatsConfigPath) {
        try { $wrapper = Get-Content $SeatsConfigPath -Raw | ConvertFrom-Json } catch { }
    }
    if (-not $wrapper) {
        $wrapper = [PSCustomObject]@{
            _comment = "W-50 HARNESS_24x7 seats config. worktreeGlob is a prefix pattern under D:\ferrum_os.worktrees, not a single fixed path - each seat has many numbered worktrees over time; the harness resolves the most-recently-modified match at revival time."
        }
    }
    if ($wrapper.PSObject.Properties.Name -contains 'seats') {
        $wrapper.seats = $SeatsArray
    } else {
        $wrapper | Add-Member -NotePropertyName seats -NotePropertyValue $SeatsArray -Force
    }
    $wrapper | ConvertTo-Json -Depth 8 | Set-Content -Path $SeatsConfigPath -Encoding utf8
}

# CODEX ADAPTER: parse a "try again at <time>" limit message into an
# exact next-revive DateTime. Handles both 12h ("9:41 PM") and 24h
# ("21:41") forms since Codex CLI's exact wording isn't fixed by this
# script - unparseable input returns $null rather than guessing a time.
function Get-CodexResetTime([string]$ProbeOutput) {
    if ($ProbeOutput -notmatch 'try again at\s+([0-9]{1,2}:[0-9]{2}(?:\s*[APap][Mm])?)') { return $null }
    $timeText = $matches[1].Trim()
    $now = Get-Date
    $parsed = $null
    foreach ($fmt in @('h:mm tt', 'H:mm')) {
        try {
            $parsed = [datetime]::ParseExact($timeText, $fmt, [System.Globalization.CultureInfo]::InvariantCulture)
            break
        } catch { }
    }
    if (-not $parsed) { return $null }
    $resetToday = Get-Date -Year $now.Year -Month $now.Month -Day $now.Day -Hour $parsed.Hour -Minute $parsed.Minute -Second 0
    # "try again at" a clock time that's already passed today means
    # tomorrow, not a time already behind us.
    if ($resetToday -lt $now) { $resetToday = $resetToday.AddDays(1) }
    return $resetToday
}

# Fires only once the clock has actually reached the recorded minute,
# within a short window so a cycle that runs a little late still fires
# (a cycle that runs early must not fire ahead of the recorded time).
function Test-DueForRevival([datetime]$NextReviveAt, [int]$WindowMinutes = 5) {
    $now = Get-Date
    return ($now -ge $NextReviveAt) -and ($now -lt $NextReviveAt.AddMinutes($WindowMinutes))
}

function Resolve-SeatWorktree([string]$Glob) {
    if ([string]::IsNullOrWhiteSpace($Glob)) { return $null }
    if (-not (Test-Path $worktreeRoot)) { return $null }
    $match = Get-ChildItem -Path $worktreeRoot -Directory -Filter $Glob -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($match) { return $match.FullName }
    return $null
}

# DISPATCH: table order in docs/TASK_BOARD.md is the board's own
# priority order (RULE 35(2): a seat claims the TOP ready row it's
# eligible for) - no separate numeric priority column exists on disk,
# so this reads table order rather than inventing one.
#
# Filters through Test-RowAlreadyLanded (per operator ask: wire the
# landed-check into EVERY spawn path, not just the trigger daemon's
# own Get-SeatDispatchableRow). Found live 2026-09-08: W-24 still got
# spawned through THIS function's own callers (the idle-revival and
# main dispatch paths that feed Start-CodexMission/Start-ClaudeSeat)
# even after the trigger-daemon-specific check landed, because those
# paths call Get-TopReadyRow/Get-SeatOwnedReadyRows directly and never
# went through Get-SeatDispatchableRow at all. Filtering at the
# SOURCE here means every caller of either function is protected
# automatically, rather than needing the same check bolted onto each
# call site individually and risking a missed one again.
function Get-TopReadyRow {
    if (-not (Test-Path $taskBoardFile)) { return $null }
    $lines = Get-Content $taskBoardFile
    foreach ($line in $lines) {
        if ($line -notmatch '^\|\s*(W-\d+[a-z]?)\s*\|') { continue }
        $cells = $line -split '\|'
        if ($cells.Count -lt 8) { continue }
        $id = $cells[1].Trim()
        $title = $cells[2].Trim()
        $status = $cells[7].Trim()
        if ($status -match '^READY') {
            if (Test-RowAlreadyLanded -RowId $id) {
                Write-Host "DISPATCH: $id already has a [land:...] commit on origin/main - board text is stale, skipping to the next READY row."
                continue
            }
            return [PSCustomObject]@{ Id = $id; Title = $title; Status = $status }
        }
    }
    return $null
}

# All READY rows in docs/TASK_BOARD.md whose Eligible-seats column
# names this seat (substring match, since that column sometimes reads
# "RIVET or MASON" / "RIVET + CRANE + MASON" rather than a single name).
# Same Test-RowAlreadyLanded filter as Get-TopReadyRow above, and for
# the same reason - this function feeds Test-SilentIdleSeat's
# idleFinding.TopRow, a second real dispatch path.
function Get-SeatOwnedReadyRows([string]$Seat) {
    if (-not (Test-Path $taskBoardFile)) { return @() }
    $lines = Get-Content $taskBoardFile
    $rows = @()
    foreach ($line in $lines) {
        if ($line -notmatch '^\|\s*(W-\d+[a-z]?)\s*\|') { continue }
        $cells = $line -split '\|'
        if ($cells.Count -lt 8) { continue }
        $id = $cells[1].Trim()
        $title = $cells[2].Trim()
        $eligible = $cells[4].Trim()
        $status = $cells[7].Trim()
        if ($status -match '^READY' -and $eligible -match [regex]::Escape($Seat)) {
            if (Test-RowAlreadyLanded -RowId $id) {
                Write-Host "DISPATCH: $id (owned by $Seat) already has a [land:...] commit on origin/main - board text is stale, excluding from the owned-rows list."
                continue
            }
            $rows += [PSCustomObject]@{ Id = $id; Title = $title; Eligible = $eligible }
        }
    }
    return $rows
}

# W-98 TRIGGER_DAEMON's own dispatch target: a seat's owned READY row
# first (same priority as the rest of this file), falling back to the
# top owner-agnostic READY row (Eligible column reading "any seat" /
# "owner-agnostic") if it has none of its own - matching RULE 35(2)'s
# "your envelope or owner-agnostic" pull rule, not a new priority
# scheme invented for this row.
function Get-SeatDispatchableRow([string]$Seat) {
    # @() forces array context - without it, PowerShell unwraps a
    # single-element array returned via the output stream into a bare
    # scalar, silently making .Count $null (so -gt 0 is false) whenever
    # exactly one row matches - caught by this row's own isolated test,
    # not left as a latent bug shipped alongside the fix for the
    # identical pre-existing issue in Test-SilentIdleSeat above.
    $owned = @(Get-SeatOwnedReadyRows -Seat $Seat)
    if ($owned.Count -gt 0) { return $owned[0] }
    if (-not (Test-Path $taskBoardFile)) { return $null }
    $lines = Get-Content $taskBoardFile
    foreach ($line in $lines) {
        if ($line -notmatch '^\|\s*(W-\d+[a-z]?)\s*\|') { continue }
        $cells = $line -split '\|'
        if ($cells.Count -lt 8) { continue }
        $id = $cells[1].Trim()
        $title = $cells[2].Trim()
        $eligible = $cells[4].Trim()
        $status = $cells[7].Trim()
        if ($status -match '^READY' -and $eligible -match '(?i)any seat|owner-agnostic') {
            if (Test-RowAlreadyLanded -RowId $id) {
                Write-Host "DISPATCH: $id (owner-agnostic) already has a [land:...] commit on origin/main - board text is stale, skipping."
                continue
            }
            return [PSCustomObject]@{ Id = $id; Title = $title; Eligible = $eligible }
        }
    }
    return $null
}

# W-98's ledger - append-only, one entry per spawn attempt, so PI can
# audit real trigger evidence (RULE 55) each cycle: which seat, which
# row, when it spawned, when/how it exited, and whether it was
# rate-limited. Kept as its own file (not folded into
# .fleet-deploy-state.json, which is deploy-specific) per the operator's
# own "or its documented companion state file" framing.
#
# FORMAT: NDJSON (one compact JSON object per line), not a single JSON
# array. This replaces an earlier single-array design that hit two real,
# confirmed bugs live: (1) Windows PowerShell 5.1's ConvertTo-Json/
# ConvertFrom-Json silently unwrap a single-element array to a bare
# scalar, which compounded across writes into nested `{"value":[...],
# "Count":N}` wrapper objects (found in the real ledger - RIVET's own
# spawn entry was nested two levels deep); (2) even after a hand-rolled
# fix, the design still required reading the ENTIRE ledger, appending in
# memory, and rewriting the WHOLE file on every single spawn - not
# atomic, so two near-simultaneous appends (a real risk once multiple
# seats' daemons run concurrently) could interleave and corrupt the
# file, matching the operator's own "parse fails at char 1" report.
# NDJSON sidesteps both: each entry is Add-Content'ed as one already-
# complete, self-contained line (Add-Content's own line-append is not a
# read-modify-write of prior content, so a concurrent writer can never
# corrupt an earlier line, only ever contend on which line lands last),
# and Get-TriggerDaemonLedger parses each line independently in its own
# try/catch - one malformed or torn line (e.g. a write caught mid-flush)
# is skipped and logged, never fails the whole read.
function Add-TriggerDaemonLedgerEntry($Entry) {
    ($Entry | ConvertTo-Json -Depth 6 -Compress) | Add-Content -Path $triggerDaemonLedgerFile -Encoding utf8
}

# Tolerant reader: skips any line that fails to parse (rather than
# failing the whole read), and also migrates the old single-array
# `.fleet-trigger-daemon-log.json` format (including its own
# already-corrupted nested-wrapper shape) into NDJSON lines exactly
# once, so real prior history is carried forward rather than silently
# dropped by the format switch. -Tail lets a caller ask only for the
# most recent N entries without reading a potentially large file in
# full (PI's own "parse the last 50 entries" use case).
function Get-TriggerDaemonLedger([int]$Tail = 0) {
    if ((-not (Test-Path $triggerDaemonLedgerFile)) -and (Test-Path $triggerDaemonLegacyLedgerFile)) {
        Write-Host "TRIGGER-DAEMON: migrating legacy $triggerDaemonLegacyLedgerFile (single-array format) to NDJSON..."
        try {
            $legacyRaw = Get-Content $triggerDaemonLegacyLedgerFile -Raw | ConvertFrom-Json
            $legacyFlat = New-Object System.Collections.ArrayList
            $stack = New-Object System.Collections.ArrayList
            [void]$stack.Add($legacyRaw)
            while ($stack.Count -gt 0) {
                $current = $stack[0]
                $stack.RemoveAt(0)
                foreach ($item in @($current)) {
                    if ($null -eq $item) { continue }
                    $propNames = $item.PSObject.Properties.Name
                    if (($propNames -contains 'value') -and ($propNames -contains 'Count') -and -not ($propNames -contains 'Seat')) {
                        [void]$stack.Add($item.value)
                    } else {
                        [void]$legacyFlat.Add($item)
                    }
                }
            }
            foreach ($entry in $legacyFlat) {
                ($entry | ConvertTo-Json -Depth 6 -Compress) | Add-Content -Path $triggerDaemonLedgerFile -Encoding utf8
            }
            Write-Host "TRIGGER-DAEMON: migrated $($legacyFlat.Count) legacy entries."
        } catch {
            Write-Host "TRIGGER-DAEMON: legacy ledger migration failed ($($_.Exception.Message)) - starting fresh NDJSON ledger, old file left untouched for manual recovery."
        }
    }
    if (-not (Test-Path $triggerDaemonLedgerFile)) { return @() }
    $lines = Get-Content $triggerDaemonLedgerFile
    if ($Tail -gt 0) { $lines = $lines | Select-Object -Last $Tail }
    $entries = New-Object System.Collections.ArrayList
    $skipped = 0
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            [void]$entries.Add(($line | ConvertFrom-Json))
        } catch {
            $skipped += 1
        }
    }
    if ($skipped -gt 0) { Write-Host "TRIGGER-DAEMON: skipped $skipped malformed ledger line(s) on read - tolerant parse, not a hard failure." }
    return $entries.ToArray()
}

# A real, unanswered posted question blocks the idle flag - a seat that
# stopped to ask something is not "silently" idle, it's correctly
# waiting. docs/OPERATOR_INBOX.md being touched after the seat's last
# activity is treated as "a question was posted since" (this script
# cannot tell whether the operator already answered it inline in chat -
# that channel isn't on disk - so it only suppresses the flag, it never
# uses inbox silence as *positive* proof of a silent stall on its own).
function Test-SeatPostedOpenQuestion([long]$SinceEpoch) {
    $inboxPath = Join-Path $repoRoot "docs\OPERATOR_INBOX.md"
    if (-not (Test-Path $inboxPath)) { return $false }
    $mtimeEpoch = [long](Get-Date (Get-Item $inboxPath).LastWriteTimeUtc -UFormat %s)
    return $mtimeEpoch -gt $SinceEpoch
}

# SILENT-IDLE DETECTOR: a seat whose last output was a landing/report
# (heartbeat shows recent activity - it definitely finished something),
# the board still has READY rows that name it, and it has posted no
# question since - is silently idle, not correctly stopped. This is the
# gap the operator flagged: "stop only at empty queue, limit, or an
# operator decision" was a stated rule with nothing checking it was
# actually followed. Returns $null when the seat is NOT silently idle
# (no heartbeat signal at all, no owned READY rows to drain, or an
# open question is posted) - every one of those is a legitimate reason
# to be quiet, not a detector false negative.
function Test-SilentIdleSeat([string]$Seat, [int]$IdleThresholdMinutes = 15) {
    $lastEpoch = Get-SeatHeartbeat -Seat $Seat
    if (-not $lastEpoch) { return $null }
    $ageMinutes = ([DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - $lastEpoch) / 60
    if ($ageMinutes -lt $IdleThresholdMinutes) { return $null }
    # @() forces array context - PowerShell unwraps a single-element
    # array returned via the output stream into a bare scalar, which
    # makes .Count silently $null (so -eq 0 is false and this check
    # would wrongly pass through) whenever exactly one row matches.
    # Found and fixed alongside W-98's own Get-SeatDispatchableRow,
    # which had the identical bug in new code - same root cause.
    $ownedReady = @(Get-SeatOwnedReadyRows -Seat $Seat)
    if ($ownedReady.Count -eq 0) { return $null }
    if (Test-SeatPostedOpenQuestion -SinceEpoch $lastEpoch) { return $null }
    return [PSCustomObject]@{
        Seat            = $Seat
        AgeMinutes      = [math]::Round($ageMinutes, 1)
        OwnedReadyCount = $ownedReady.Count
        TopRow          = $ownedReady[0]
    }
}

function Get-DrainPrompt($IdleFinding) {
    $row = $IdleFinding.TopRow
    return "Silent-idle detected: your last output was $($IdleFinding.AgeMinutes) minutes ago, docs/TASK_BOARD.md still has $($IdleFinding.OwnedReadyCount) READY row(s) you own, and no question was posted. Per the drain clause (stop only at empty queue, limit, or an operator decision - never after a single item): pull the top row now, $($row.Id) - $($row.Title), execute it, land it, then keep pulling."
}

# CLAUDE ADAPTER (wired, gated behind -EnableClaudeAdapter - "used
# after operator flip" per the operator's own instruction). Builds the
# real command; only runs it in a real (non-dry-run) cycle with the
# flag passed.
function Start-ClaudeSeat($Seat, $DispatchedRow, [string]$OverrideBrief) {
    $brief = if ($OverrideBrief) { $OverrideBrief } else { "You are seat $($Seat.id). Read $($Seat.missionFile) for your standing brief." }
    if ($DispatchedRow -and -not $OverrideBrief) {
        $brief += " Top READY board row to pull: $($DispatchedRow.Id) - $($DispatchedRow.Title)."
    }
    $cmd = $Seat.reviveCmdTemplate -replace '\{brief\}', $brief -replace '\{repoRoot\}', $repoRoot -replace '\{missionFile\}', $Seat.missionFile
    if ($DryRun) {
        Write-Host "[DRY-RUN] would run claude adapter for $($Seat.id): $cmd"
        return
    }
    if (-not $EnableClaudeAdapter) {
        Write-Host "Claude adapter for $($Seat.id) built but not fired (-EnableClaudeAdapter not passed): $cmd"
        return
    }
    Write-Host "Launching Claude seat $($Seat.id) headless: $cmd"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WindowStyle Hidden
}

# Checks origin/main's recent land-commit subjects for a mention of
# this row's ID, so the daemon never dispatches a seat to a row the
# BOARD still shows READY but that has actually already landed (board
# text is only updated by a seat re-reading and re-writing it - RULE
# 35(4) - and can genuinely lag a real landing by an unbounded amount).
# Found live 2026-09-08: W-24 landed as `mason/w24-compliance-engine`
# while the board still read READY, and the daemon spawned CRANE
# against it 21 times in a row (20 of them in one respawn-cap-bounded
# burst) before this check existed - every one of those spawns was a
# wasted real Claude invocation against dead work.
function Test-RowAlreadyLanded([string]$RowId) {
    if ([string]::IsNullOrWhiteSpace($RowId)) { return $false }
    # "W-24" -> "24" (and a handful of board rows carry a letter suffix
    # like "W-79b" -> "79b") - land-commit branch names observed in this
    # repo drop the hyphen ("w24-compliance-engine", not "w-24-..."), so
    # match either spelling, case-insensitive, with a non-digit boundary
    # after the number so "W-24" doesn't false-match a real "W-240".
    $numPart = ($RowId -replace '^[Ww]-?', '')
    if ([string]::IsNullOrWhiteSpace($numPart)) { return $false }
    $pattern = "(?i)\[land:[^\]]*\bw-?$([regex]::Escape($numPart))\b"
    try {
        # -C $repoRoot: null-guard against ambient CWD (per operator
        # ask) - this function may be called from a context where the
        # script's own working directory isn't $repoRoot, and a bare
        # `git log` would then run against whatever repo (or non-repo)
        # directory happens to be current instead.
        $recentLandLines = git -C $repoRoot log origin/main --oneline -200 --grep='\[land:' 2>$null
        return [bool]($recentLandLines | Where-Object { $_ -match $pattern } | Select-Object -First 1)
    } catch {
        return $false
    }
}

# Checks whether a NEW `[land:<seat>/...]` commit appeared on
# origin/main between two SHAs, so backoff/respawn decisions are driven
# by REAL landed work, not a spawned process's own exit code. Found
# live 2026-09-08: a plain `exit 0 -> reset backoff, respawn` policy
# spun CRANE 20 times in ~5-second intervals against an already-landed
# row with zero real work happening each time - exit 0 only proves the
# spawned CLI process itself didn't crash, never that it accomplished
# anything.
function Test-SeatLandedSince([string]$SeatId, [string]$ShaBefore, [string]$ShaAfter) {
    if ([string]::IsNullOrWhiteSpace($ShaBefore) -or [string]::IsNullOrWhiteSpace($ShaAfter)) { return $false }
    if ($ShaBefore -eq $ShaAfter) { return $false }
    try {
        $newCommits = git -C $repoRoot log "$ShaBefore..$ShaAfter" --oneline 2>$null
        $pattern = "(?i)\[land:$([regex]::Escape($SeatId.ToLower()))/"
        return [bool]($newCommits | Where-Object { $_ -match $pattern } | Select-Object -First 1)
    } catch {
        return $false
    }
}

# W-98 TRIGGER_DAEMON (RULE 58): per-seat headless drain loop. Gated
# behind -EnableTriggerDaemon, same "built now, fired after an explicit
# operator flip" precedent already established by -EnableClaudeAdapter
# above - ships INERT. Landing this function does not, by itself, start
# any autonomous spawning; the daemon can never flip its own gate (the
# switch is a launch-time parameter, not a state file this code writes
# to), so turning it on is exclusively the operator's action, never
# this script's own.
#
# For each configured seat: if it's not in backoff, look up its top
# dispatchable READY row (owned, else owner-agnostic, per
# Get-SeatDispatchableRow), skip it if Test-RowAlreadyLanded says the
# board is stale; if a real candidate remains, spawn that seat's own
# CLI (`codex exec` for MASON/RIVET per $codexBackedSeats, `claude -p`
# otherwise) INSIDE THAT SEAT'S OWN WORKTREE (not $repoRoot - the
# worktree location IS the seat's identity per the operator's own
# framing, so AGENTS.md and docs/seats/<SEAT>.md load correctly) with
# the standing prompt "next task", and wait for it to exit (seats are
# processed sequentially within one call to this function, not spawned
# in parallel - a real, disclosed scope limit, not a hidden one).
#
# Every spawn/exit/backoff-decision is written to the NDJSON ledger
# (Add-TriggerDaemonLedgerEntry) so PI can audit real trigger evidence
# each cycle per RULE 55 - a spawn timestamp, exit code, dispatched row
# ID, AND whether a real landing was actually observed for it - not an
# exit code alone. Backoff/respawn decisions are driven by
# Test-SeatLandedSince, not the spawned process's exit code: a real
# observed landing resets backoff to base and allows an immediate
# respawn if more of the seat's rows remain; anything else (exit 0 with
# no landing, or a genuine non-zero exit) grows backoff and does not
# respawn blindly in the same cycle. A rate-limit signal in the spawned
# process's own output (same 'limit' substring convention already used
# by Test-CodexProbe) also triggers a Send-NtfyAlert, same as any other
# non-zero-exit failure.
function Invoke-SeatTriggerDaemon {
    if (Test-KillSwitch) { return }
    if (-not $EnableTriggerDaemon) {
        Write-Host "TRIGGER-DAEMON: built but not fired (-EnableTriggerDaemon not passed) - ships inert per the operator's own gating instruction."
        return
    }
    $seatConfigs = Get-FleetSeatsConfig
    if (-not $seatConfigs) {
        Write-Host "TRIGGER-DAEMON: no seats config loaded - nothing to drive."
        return
    }
    $now = Get-Date
    foreach ($seatCfg in $seatConfigs) {
      # Per-seat isolation (per operator ask): one seat's exception -
      # a git call that throws, a worktree that can't be recreated, an
      # unexpected Start-Process failure - must never abort the whole
      # daemon loop and leave every OTHER seat undispatched for this
      # cycle. Everything for this seat lives inside this try; a catch
      # here logs and moves on to the next seat.
      try {
        $seatId = $seatCfg.id
        $backoffState = Get-SeatTriggerBackoff -SeatId $seatId -DefaultBackoffSeconds $TriggerDaemonBaseBackoffSeconds
        if ($backoffState.BackoffUntil) {
            try {
                $backoffUntil = [datetime]$backoffState.BackoffUntil
                if ($now -lt $backoffUntil) {
                    Write-Host "TRIGGER-DAEMON: $seatId in backoff until $backoffUntil - skipping this cycle."
                    continue
                }
            } catch { }
        }
        $worktreePath = Resolve-SeatWorktree -Glob $seatCfg.worktreeGlob
        # VALIDATE before spawning, per operator ask: a resolved path
        # that doesn't exist, or exists but isn't actually a git
        # worktree (missing `.git` - a worktree's own marker, distinct
        # from a full repo's `.git` DIRECTORY, is a `.git` FILE
        # pointing back at the main repo's worktree metadata), must
        # never be handed to Start-Process as-is. Attempt one real
        # recreation off origin/main using the seat's own documented
        # glob prefix; if that also fails, skip this seat and log why
        # rather than spawn into a broken or partial directory.
        $worktreeValid = $worktreePath -and (Test-Path $worktreePath) -and (Test-Path (Join-Path $worktreePath ".git"))
        if (-not $worktreeValid) {
            $globPrefix = if ($seatCfg.worktreeGlob) { ($seatCfg.worktreeGlob -replace '\*$', '') } else { $seatId.ToLower() }
            $recreatedPath = Join-Path $worktreeRoot "$globPrefix$([guid]::NewGuid().ToString('N').Substring(0,8))"
            $branchName = "$($seatId.ToLower())/auto-recreated-$(Get-Date -Format 'yyyyMMddHHmmss')"
            Write-Host "TRIGGER-DAEMON: $seatId has no valid worktree ($($seatCfg.worktreeGlob) resolved to '$worktreePath') - attempting to recreate at $recreatedPath from origin/main."
            $recreateOk = $false
            try {
                $ErrorActionPreference = "Continue"
                $recreateOutput = git -C $repoRoot worktree add $recreatedPath -b $branchName origin/main 2>&1 | Out-String
                $ErrorActionPreference = "Stop"
                $recreateOk = (Test-Path $recreatedPath) -and (Test-Path (Join-Path $recreatedPath ".git"))
                if (-not $recreateOk) { Write-Host "TRIGGER-DAEMON: worktree recreation output: $recreateOutput" }
            } catch {
                $ErrorActionPreference = "Stop"
                $recreateOk = $false
            }
            if ($recreateOk) {
                $worktreePath = $recreatedPath
                Write-Host "TRIGGER-DAEMON: $seatId worktree recreated at $worktreePath (branch $branchName)."
            } else {
                Write-Host "TRIGGER-DAEMON: $seatId worktree recreation failed - skipping this seat this cycle, not spawning into an invalid directory."
                continue
            }
        }
        $isCodex = $codexBackedSeats -contains $seatId
        $prompt = "next task"
        # RESPAWN POLICY: a seat that lands real work with more of its
        # own READY rows still open gets respawned again immediately
        # (after a short delay), instead of sitting idle until the next
        # full -Loop cycle (which defaults to 60 minutes - far too slow
        # for genuine continuous drain). Capped per seat per call to
        # Invoke-SeatTriggerDaemon so a runaway condition cannot spin
        # forever inside one function call; the outer -Loop cycle is
        # still the real backstop.
        $respawnCount = 0
        $seatDone = $false
        while (-not $seatDone -and $respawnCount -lt $TriggerDaemonMaxRespawnsPerCycle) {
        $respawnCount += 1
        $row = Get-SeatDispatchableRow -Seat $seatId
        if (-not $row) {
            Write-Host "TRIGGER-DAEMON: $seatId has no dispatchable READY row (owned or owner-agnostic) - nothing to spawn."
            break
        }
        if (Test-RowAlreadyLanded -RowId $row.Id) {
            Write-Host "TRIGGER-DAEMON: $seatId's top dispatchable row $($row.Id) already has a [land:...] commit on origin/main - board text is stale, not spawning against dead work. Waiting for the board to catch up."
            break
        }
        # FIXED 2026-09-08, verified against OpenAI's own published
        # `codex exec` documentation (developers.openai.com/codex/
        # noninteractive - fetched directly this session, not recalled)
        # since this sandbox has no codex CLI installed to run --help
        # against directly (confirmed absent from both bash and Windows
        # PATH). Two real, documented facts fixed here: (1) there is no
        # `-C`/`--cd`/working-directory flag for `codex exec` at all -
        # every earlier version of this command (including the
        # pre-existing Start-CodexMission elsewhere in this file)
        # invented one; the actual, correct way to set the working
        # directory is Start-Process's own -WorkingDirectory, already
        # used below - no codex-side flag needed or exists. (2)
        # `--full-auto` is a deprecated compatibility flag; the
        # documented replacement is `--sandbox workspace-write`
        # (headless automation needs real write access - the default
        # sandbox is read-only, which alone could explain an
        # immediate, work-free exit) plus `--ask-for-approval never`
        # for a genuinely unattended run. The prompt is a plain
        # positional argument per the documented example - no stdin
        # piping needed, so the temp prompt-file machinery from the
        # previous fix attempt is removed as unnecessary.
        if ($isCodex) {
            $cmd = "codex exec --sandbox workspace-write --ask-for-approval never `"$prompt`""
        } else {
            $cmd = "claude -p `"$prompt`""
        }
        if ($DryRun) {
            Write-Host "[DRY-RUN] TRIGGER-DAEMON would spawn $seatId in $worktreePath for row $($row.Id) - $($row.Title): $cmd"
            $seatDone = $true
            break
        }
        Write-Host "TRIGGER-DAEMON: spawning $seatId in $worktreePath for row $($row.Id) - $($row.Title): $cmd"
        $spawnedAt = (Get-Date).ToUniversalTime().ToString("o")
        # Landing evidence, not exit-code trust: record origin/main's
        # SHA before the spawn, re-fetch after, and check whether a
        # real [land:<seat>/...] commit for THIS seat appeared - a
        # concurrent fleet means other seats land in between too, so
        # "origin/main advanced" alone doesn't prove this seat did
        # anything. Every git call here is null-guarded (per operator
        # ask): a fetch/rev-parse failure yields an empty SHA rather
        # than throwing, and an empty before/after pair is treated as
        # "cannot determine landing" (never landed), not a crash.
        $originMainBefore = ''
        try {
            $ErrorActionPreference = "Continue"
            git -C $repoRoot fetch origin main 2>&1 | Out-Null
            $ErrorActionPreference = "Stop"
            $rev = git -C $repoRoot rev-parse origin/main 2>$null
            if ($rev) { $originMainBefore = $rev.Trim() }
        } catch { $ErrorActionPreference = "Stop" }
        $stdoutFile = Join-Path $env:TEMP "fleet-trigger-daemon-$seatId-$([guid]::NewGuid().ToString('N')).out.txt"
        $stderrFile = Join-Path $env:TEMP "fleet-trigger-daemon-$seatId-$([guid]::NewGuid().ToString('N')).err.txt"
        $exitCode = $null
        $outputText = ''
        try {
            $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WorkingDirectory $worktreePath -WindowStyle Hidden -PassThru -Wait `
                -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile
            $exitCode = $proc.ExitCode
            $outputText = (Get-Content $stdoutFile -Raw -ErrorAction SilentlyContinue) + "`n" + (Get-Content $stderrFile -Raw -ErrorAction SilentlyContinue)
        } catch {
            $exitCode = -1
            $outputText = $_.Exception.Message
        } finally {
            Remove-Item $stdoutFile, $stderrFile -Force -ErrorAction SilentlyContinue
        }
        $exitedAt = (Get-Date).ToUniversalTime().ToString("o")
        $rateLimited = $outputText -match '(?i)limit'
        $originMainAfter = ''
        try {
            $ErrorActionPreference = "Continue"
            git -C $repoRoot fetch origin main 2>&1 | Out-Null
            $ErrorActionPreference = "Stop"
            $rev = git -C $repoRoot rev-parse origin/main 2>$null
            if ($rev) { $originMainAfter = $rev.Trim() }
        } catch { $ErrorActionPreference = "Stop" }
        $landed = if ($originMainBefore -and $originMainAfter) { Test-SeatLandedSince -SeatId $seatId -ShaBefore $originMainBefore -ShaAfter $originMainAfter } else { $false }
        Add-TriggerDaemonLedgerEntry -Entry ([PSCustomObject]@{
            Seat        = $seatId
            RowId       = $row.Id
            RowTitle    = $row.Title
            Command     = $cmd
            SpawnedAt   = $spawnedAt
            ExitedAt    = $exitedAt
            ExitCode    = $exitCode
            RateLimited = [bool]$rateLimited
            Landed      = [bool]$landed
        })
        # BACKOFF/RESPAWN, keyed on OBSERVED LANDING, not exit code: a
        # real landing -> reset backoff, respawn immediately if more
        # rows remain. Anything else - including a clean exit 0 that
        # landed nothing, the exact failure mode that spun CRANE 20x
        # against an already-done W-24 before this fix - grows backoff
        # and stops respawning this seat for the rest of this cycle. A
        # genuine non-zero exit additionally alerts (ntfy); an exit-0
        # no-op does not alert (not inherently abnormal - a seat can
        # legitimately have nothing new to land), only backs off.
        # State lives only in $stateFile now (Set-SeatTriggerBackoff),
        # never on the seat's own tracked docs/FLEET_SEATS.json entry.
        if ($landed) {
            Set-SeatTriggerBackoff -SeatId $seatId -BackoffSeconds $TriggerDaemonBaseBackoffSeconds -BackoffUntil $null
            Write-Host "TRIGGER-DAEMON: $seatId landed real work ($originMainBefore -> $originMainAfter) - backoff reset to base."
            if ($respawnCount -ge $TriggerDaemonMaxRespawnsPerCycle) {
                Write-Host "TRIGGER-DAEMON: $seatId hit the per-cycle respawn cap ($TriggerDaemonMaxRespawnsPerCycle) - remaining rows wait for the next watch cycle."
                $seatDone = $true
            } elseif (-not $DryRun) {
                Start-Sleep -Seconds $TriggerDaemonRespawnDelaySeconds
            }
        } else {
            $prevBackoff = if ($backoffState.BackoffSeconds) { [int]$backoffState.BackoffSeconds } else { $TriggerDaemonBaseBackoffSeconds }
            $nextBackoff = [Math]::Min($prevBackoff * 2, $TriggerDaemonMaxBackoffSeconds)
            Set-SeatTriggerBackoff -SeatId $seatId -BackoffSeconds $nextBackoff -BackoffUntil ((Get-Date).AddSeconds($nextBackoff))
            if ($exitCode -eq 0) {
                Write-Host "TRIGGER-DAEMON: $seatId exited 0 but no [land:$($seatId.ToLower())/...] commit appeared - treating as a no-op, not a success. Backing off $nextBackoff s, not respawning this cycle."
            } else {
                $limitNote = if ($rateLimited) { "rate-limited" } else { "failed" }
                Write-Host "TRIGGER-DAEMON: $seatId $limitNote (exit $exitCode) - backing off $nextBackoff s, alerting."
                Send-NtfyAlert -Title "TRIGGER-DAEMON: $seatId spawn failed" -Message "Seat $seatId exited $exitCode dispatching $($row.Id) - $($row.Title). RateLimited=$rateLimited. Backing off $nextBackoff s. See $triggerDaemonLedgerFile for the full entry."
            }
            $seatDone = $true
        }
        }
      } catch {
        Write-Host "TRIGGER-DAEMON: $seatId's cycle threw an unhandled error ($($_.Exception.Message)) - isolated to this seat, continuing to the next one."
        Send-NtfyAlert -Title "TRIGGER-DAEMON: $seatId cycle error" -Message "Unhandled error in $seatId's spawn cycle: $($_.Exception.Message)"
      }
    }
}

function Test-KillSwitch {
    if (Test-Path $killSwitchPath) {
        Write-Host "KILL-SWITCH present ($killSwitchPath) - halting."
        return $true
    }
    return $false
}

function Send-NtfyAlert([string]$Message, [string]$Title = "Fleet watch") {
    $topic = $env:FLEET_NTFY_TOPIC
    if ([string]::IsNullOrWhiteSpace($topic)) { $topic = "ferrum-fleet-local" }
    try {
        Invoke-RestMethod -Uri "https://ntfy.sh/$topic" -Method Post -Body $Message -Headers @{ Title = $Title } -TimeoutSec 10 | Out-Null
        Write-Host "ntfy alert sent (topic=$topic): $Title - $Message"
    } catch {
        # A failed alert must never crash the watch loop - log and continue.
        Write-Host "ntfy alert FAILED (topic=$topic, this is non-fatal): $($_.Exception.Message)"
    }
}

# LOCAL AUTO-DEPLOY (closes the deploy loop with zero operator action).
# Primary path: this local harness, using the operator's own already-
# authenticated wrangler session - no secrets to provision, no GitHub
# Actions run needed. The CI auto-deploy job added earlier
# (.github/workflows/ci.yml, needs CLOUDFLARE_API_TOKEN/ACCOUNT_ID repo
# secrets that were never actually set) becomes optional redundancy,
# not superseded/removed - both can deploy the same way if both ever
# fire, since this only ever deploys the exact SHA on origin/main.
#
# KILL-SWITCH: docs/DEPLOY_STOP existing halts auto-deploy immediately,
# checked before every attempt - separate from FLEET_WATCH_STOP so a
# human can stop deploys specifically without stopping the whole watch
# loop (heartbeats/idle-detection/revival keep running).
function Test-DeployKillSwitch {
    if (Test-Path $deployStopPath) {
        Write-Host "DEPLOY KILL-SWITCH present ($deployStopPath) - auto-deploy halted."
        return $true
    }
    return $false
}

function Get-DeployState {
    if (Test-Path $deployStateFile) {
        try {
            $loaded = Get-Content $deployStateFile -Raw | ConvertFrom-Json
            if (-not ($loaded.PSObject.Properties.Name -contains 'DeployHistory')) {
                $loaded | Add-Member -NotePropertyName DeployHistory -NotePropertyValue @() -Force
            }
            return $loaded
        } catch { }
    }
    return [PSCustomObject]@{ LastDeployedSha = $null; LastVersionId = $null; DeployHistory = @() }
}

function Save-DeployState($State) {
    # -Depth needed: DeployHistory is an array of nested objects, and the
    # ConvertTo-Json default depth (2) would silently truncate it to
    # "@{...}" strings instead of real JSON - a ledger that quietly loses
    # its own entries is worse than no ledger.
    $State | ConvertTo-Json -Depth 6 | Set-Content -Path $deployStateFile -Encoding utf8
}

# Reads the wrangler deploy Version ID for the deploy that just ran, per
# the operator's PI-evidence-gap ask ("PI cannot cite artifact-specific
# deployment version IDs - the harness records only HTTP 200"). Uses
# wrangler's own structured ND-JSON output file (WRANGLER_OUTPUT_FILE_PATH,
# confirmed live against the installed wrangler 4.129.1 via a --dry-run
# probe this session - schema is one JSON object per line, the deploy
# line has {"type":"deploy", "worker_name":..., "version_id":...}), not a
# regex against wrangler's human-readable stdout text (which is not a
# stable contract and has changed field names before - "Deployment ID"
# renamed to "Version ID" per Cloudflare's own changelog).
function Get-WranglerDeployVersionId([string]$OutputFilePath) {
    if (-not (Test-Path $OutputFilePath)) { return $null }
    try {
        $lines = Get-Content $OutputFilePath
        foreach ($line in $lines) {
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $entry = $line | ConvertFrom-Json
            if ($entry.type -eq 'deploy' -and $entry.version_id) {
                return $entry.version_id
            }
        }
    } catch { }
    return $null
}

# Fires once per cycle: fetch, compare origin/main to the last SHA this
# harness actually deployed (not the local checkout's HEAD, which other
# processes/seats may move independently) - only a genuine advance
# triggers gates+deploy. A clean fast-forward only (never a reset/
# rebase) so this never discards uncommitted work in the shared
# checkout; a dirty working tree or a real divergence aborts with an
# alert rather than forcing anything.
function Invoke-AutoDeployIfAdvanced {
    if (Test-DeployKillSwitch) { return }
    Push-Location $repoRoot
    try {
        # Native commands (git, pnpm, wrangler) write normal progress to
        # stderr; under $ErrorActionPreference = "Stop" that gets turned
        # into a terminating exception before a pipeline can swallow it.
        # Relax to Continue for the whole native-command sequence and
        # check $LASTEXITCODE explicitly instead - the same fix already
        # applied to Get-SeatHeartbeat's per-worktree git calls.
        $ErrorActionPreference = "Continue"
        git fetch origin main 2>&1 | Out-Null
        $remoteSha = (git rev-parse origin/main).Trim()
        $state = Get-DeployState
        if ($state.LastDeployedSha -eq $remoteSha) {
            Write-Host "AUTO-DEPLOY: origin/main unchanged ($remoteSha) - nothing to do."
            return
        }
        Write-Host "AUTO-DEPLOY: origin/main advanced to $remoteSha (previously deployed: $($state.LastDeployedSha)) - deploying."
        if ($DryRun) {
            Write-Host "[DRY-RUN] would: check working tree clean; git merge --ff-only origin/main; pnpm type-check; pnpm build; wrangler deploy; record $remoteSha as deployed."
            return
        }
        $dirty = git status --porcelain
        if ($dirty) {
            throw "Working tree in $repoRoot is not clean - refusing to touch it automatically. Uncommitted changes:`n$dirty"
        }
        $localSha = (git rev-parse HEAD).Trim()
        if ($localSha -ne $remoteSha) {
            $mergeOutput = git merge --ff-only origin/main 2>&1 | Out-String
            Write-Host $mergeOutput
            if ($LASTEXITCODE -ne 0) { throw "git merge --ff-only failed (local history has diverged from origin/main - needs a human): $mergeOutput" }
        }
        $typeCheckOutput = pnpm type-check 2>&1 | Out-String
        Write-Host $typeCheckOutput
        if ($LASTEXITCODE -ne 0) { throw "pnpm type-check failed" }
        $buildOutput = pnpm build 2>&1 | Out-String
        Write-Host $buildOutput
        if ($LASTEXITCODE -ne 0) { throw "pnpm build failed" }
        $wranglerOutputFile = Join-Path $env:TEMP "fleet-watch-wrangler-deploy-$remoteSha.ndjson"
        if (Test-Path $wranglerOutputFile) { Remove-Item $wranglerOutputFile -Force }
        $previousOutputFileEnv = $env:WRANGLER_OUTPUT_FILE_PATH
        $env:WRANGLER_OUTPUT_FILE_PATH = $wranglerOutputFile
        try {
            $deployOutput = npx wrangler deploy 2>&1 | Out-String
        } finally {
            $env:WRANGLER_OUTPUT_FILE_PATH = $previousOutputFileEnv
        }
        Write-Host $deployOutput
        if ($LASTEXITCODE -ne 0) { throw "wrangler deploy failed: $deployOutput" }
        $versionId = Get-WranglerDeployVersionId -OutputFilePath $wranglerOutputFile
        if (Test-Path $wranglerOutputFile) { Remove-Item $wranglerOutputFile -Force }
        $state.LastDeployedSha = $remoteSha
        $state.LastVersionId = $versionId
        if (-not $state.DeployHistory) { $state.DeployHistory = @() }
        $state.DeployHistory = @($state.DeployHistory) + [PSCustomObject]@{
            Sha        = $remoteSha
            VersionId  = $versionId
            DeployedAt = (Get-Date).ToUniversalTime().ToString("o")
        }
        Save-DeployState -State $state
        if ($versionId) {
            Write-Host "AUTO-DEPLOY: success, deployed SHA $remoteSha, Workers version ID $versionId"
        } else {
            Write-Host "AUTO-DEPLOY: success, deployed SHA $remoteSha, but could not read a Workers version ID from wrangler's structured output - ledger entry recorded with VersionId null, not fabricated."
        }
    } catch {
        Write-Host "AUTO-DEPLOY FAILED: $($_.Exception.Message)"
        Send-NtfyAlert -Title "Auto-deploy FAILED" -Message $_.Exception.Message
    } finally {
        $ErrorActionPreference = "Stop"
        Pop-Location
    }
}

function Get-SeatHeartbeat([string]$Seat) {
    # Two signals, most-recent wins: (a) the most recent [AI: SEAT]-tagged
    # commit anywhere in the repo's history, (b) the most recent activity
    # signal among that seat's own worktree directories (crane-*, mason-*,
    # etc. under D:\ferrum_os.worktrees).
    #
    # HEARTBEAT PERF FIX (found during W-50 dry-run testing): (b) used to
    # be `Get-ChildItem -Recurse -File` across every matching worktree,
    # including each one's own node_modules - with ~250 worktrees on disk
    # (many pnpm-installed), that recursion took minutes per cycle and
    # once hung a full watch cycle outright. Replaced with `git log` (last
    # commit time in that worktree, any branch) + `git status --porcelain`
    # (mtime of only the small set of actually-changed files, not the
    # whole tree) - both fast regardless of node_modules size, and a
    # closer match to "is a seat actually working here" than a raw
    # directory-wide file-mtime scan ever was.
    Push-Location $repoRoot
    try {
        $lastCommitEpoch = $null
        $commitLine = git log --all -1 --format=%ct --grep="\[AI: $Seat\]" -i 2>$null
        if ($LASTEXITCODE -eq 0 -and $commitLine) {
            $lastCommitEpoch = [long]$commitLine
        }
    } finally {
        Pop-Location
    }

    $lastMtimeEpoch = $null
    if (Test-Path $worktreeRoot) {
        $seatPrefix = $Seat.ToLower()
        $matchingDirs = Get-ChildItem -Path $worktreeRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name.ToLower().StartsWith($seatPrefix) }
        foreach ($dir in $matchingDirs) {
            if (-not (Test-Path (Join-Path $dir.FullName ".git"))) { continue }
            Push-Location $dir.FullName
            try {
                # One stale/broken worktree (e.g. its gitdir was removed
                # out-of-band) must never abort the whole heartbeat scan
                # for every other seat/worktree - isolate failures here.
                $ErrorActionPreference = "Continue"
                $headCommitLine = git log -1 --format=%ct --all 2>$null
                if ($LASTEXITCODE -eq 0 -and $headCommitLine) {
                    $epoch = [long]$headCommitLine
                    if (-not $lastMtimeEpoch -or $epoch -gt $lastMtimeEpoch) { $lastMtimeEpoch = $epoch }
                }
                $dirtyFiles = git status --porcelain=v1 2>$null | ForEach-Object { ($_ -replace '^...', '').Trim('"') }
                foreach ($relPath in $dirtyFiles) {
                    $fullPath = Join-Path $dir.FullName $relPath
                    if (Test-Path $fullPath -PathType Leaf) {
                        $epoch = [long](Get-Date (Get-Item $fullPath).LastWriteTimeUtc -UFormat %s)
                        if (-not $lastMtimeEpoch -or $epoch -gt $lastMtimeEpoch) { $lastMtimeEpoch = $epoch }
                    }
                }
            } catch {
                Write-Host "Skipping unreadable worktree $($dir.FullName): $($_.Exception.Message)"
            } finally {
                $ErrorActionPreference = "Stop"
                Pop-Location
            }
        }
    }

    $candidates = @($lastCommitEpoch, $lastMtimeEpoch) | Where-Object { $_ }
    if ($candidates.Count -eq 0) { return $null }
    return ($candidates | Measure-Object -Maximum).Maximum
}

function Get-SeatStatus([long]$LastActivityEpoch) {
    $nowEpoch = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $ageMinutes = ($nowEpoch - $LastActivityEpoch) / 60
    if ($ageMinutes -lt 30) { return @{ Status = 'ACTIVE'; AgeMinutes = [math]::Round($ageMinutes, 1) } }
    if ($ageMinutes -lt 240) { return @{ Status = 'LIMIT'; AgeMinutes = [math]::Round($ageMinutes, 1) } }
    return @{ Status = 'DARK'; AgeMinutes = [math]::Round($ageMinutes, 1) }
}

function Get-FleetHeartbeats {
    $results = @{}
    foreach ($seat in $seats) {
        $epoch = Get-SeatHeartbeat -Seat $seat
        if ($null -eq $epoch) {
            $results[$seat] = @{ Status = 'DARK'; AgeMinutes = $null }
        } else {
            $results[$seat] = Get-SeatStatus -LastActivityEpoch $epoch
        }
    }
    return $results
}

# W-98 follow-up (2026-09-08): this used to Set-Content a real,
# never-gitignored file (docs/FLEET_SCHEDULE.md) every single cycle -
# an untracked file that could never come back clean, tripping
# Invoke-AutoDeployIfAdvanced's dirty-working-tree guard every cycle
# (gitignoring it alone, done in an earlier pass, silenced git but
# left the actual write call - and therefore the underlying churn -
# in place). Per the operator's explicit follow-up: the write call
# itself is removed, not just its output file hidden from git. The
# same heartbeat snapshot is now only ever written to the console
# (Write-Host), never to disk - real information, zero file-system
# footprint, nothing left for a deploy guard to trip on.
function Write-FleetSchedule([hashtable]$Heartbeats) {
    $today = Get-Date -Format 'yyyy-MM-dd'
    Write-Host "FLEET_SCHEDULE snapshot ($today $(Get-Date -Format 'HH:mm') UTC) - console only, no file written:"
    foreach ($seat in $seats) {
        $h = $Heartbeats[$seat]
        $age = if ($null -eq $h.AgeMinutes) { 'no signal found' } else { "$($h.AgeMinutes) min ago" }
        Write-Host "  $seat : $($h.Status) ($age)"
    }
}

function Test-CodexProbe {
    # Returns @{ Ok; Output }. Ok=$false when the output indicates a
    # rate/usage limit (or the probe errored outright - Codex not
    # installed, process failure - treated as dark, same as a limit
    # response: this script cannot distinguish "fine but unreachable"
    # from "limited" any more precisely than that). Output is the raw
    # text so the codex adapter can parse a "try again at" time out of
    # it. -DryRun substitutes -DryRunCodexProbeOutput instead of
    # calling the real CLI, so the scheduling logic is provable without
    # needing a live limit response to test against.
    if ($DryRun) {
        $output = $DryRunCodexProbeOutput
        Write-Host "[DRY-RUN] using injected probe output instead of calling codex."
    } else {
        try {
            $output = cmd /c 'codex exec "reply OK"' 2>&1 | Out-String
        } catch {
            return @{ Ok = $false; Output = '' }
        }
    }
    if ($output -match 'limit') {
        Write-Host "Codex probe: LIMIT detected in output."
        return @{ Ok = $false; Output = $output }
    }
    Write-Host "Codex probe: OK."
    return @{ Ok = $true; Output = $output }
}

# FIXED 2026-09-08, same real bug and same verification method as
# Invoke-SeatTriggerDaemon's codex command above: `-C` is not a
# documented `codex exec` flag at all (verified against OpenAI's own
# published non-interactive-mode docs, not a live --help - this
# sandbox has no codex CLI installed); working directory is set via
# Start-Process's own -WorkingDirectory instead, and `--full-auto` is
# replaced with the documented `--sandbox workspace-write
# --ask-for-approval never`. The stdin-piped mission file itself (`- <
# "$missionFile"`) was already correct - piping content to `codex exec
# -` is the documented stdin form, not something this fix needed to
# change.
function Start-CodexMission($DispatchedRow) {
    $cmd = "codex exec --sandbox workspace-write --ask-for-approval never - < `"$missionFile`""
    if ($DryRun) {
        $rowText = if ($DispatchedRow) { "$($DispatchedRow.Id) - $($DispatchedRow.Title)" } else { "(no READY row found)" }
        Write-Host "[DRY-RUN] would launch Codex mission headless: $cmd"
        Write-Host "[DRY-RUN] dispatched top READY row injected into mission context: $rowText"
        return
    }
    Write-Host "Launching Codex mission file headless: $missionFile"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WorkingDirectory $repoRoot -WindowStyle Hidden
}

function Get-WatchState {
    if (Test-Path $stateFile) {
        try {
            $loaded = Get-Content $stateFile -Raw | ConvertFrom-Json
            if (-not ($loaded.PSObject.Properties.Name -contains 'SeatTriggerBackoff')) {
                $loaded | Add-Member -NotePropertyName SeatTriggerBackoff -NotePropertyValue ([PSCustomObject]@{}) -Force
            }
            if (-not ($loaded.PSObject.Properties.Name -contains 'SeatRevival')) {
                $loaded | Add-Member -NotePropertyName SeatRevival -NotePropertyValue ([PSCustomObject]@{}) -Force
            }
            return $loaded
        } catch { }
    }
    return [PSCustomObject]@{ CodexWasDark = $false; LastStalledAlertEpoch = 0; LastInboxCheckEpoch = 0; SeatTriggerBackoff = [PSCustomObject]@{}; SeatRevival = [PSCustomObject]@{} }
}

function Save-WatchState($State) {
    # -Depth: SeatTriggerBackoff is a nested per-seat object; the
    # default ConvertTo-Json depth (2) would truncate it, same class of
    # bug already fixed elsewhere in this file (Save-DeployState,
    # Add-TriggerDaemonLedgerEntry).
    $State | ConvertTo-Json -Depth 6 | Set-Content -Path $stateFile -Encoding utf8
}

# RULE (adopted 2026-09-08, per operator ask): runtime state never
# lives in a git-tracked file. Per-seat trigger-daemon backoff used to
# be written onto each seat's own object in docs/FLEET_SEATS.json (a
# real, tracked file) via Save-FleetSeatsConfig, called on every single
# spawn attempt - confirmed live to leave that file locally modified
# every cycle (which itself trips the exact class of dirty-tree guard
# bug this whole fix-chain has been closing) and, because
# Save-FleetSeatsConfig had its own separate bug (fixed above), was
# actively dropping the file's real `deployment` block on every write.
# Backoff state now lives only in the untracked $stateFile
# (.fleet-watch-state.json), under a SeatTriggerBackoff property keyed
# by seat ID - docs/FLEET_SEATS.json is no longer written by the
# trigger daemon at all.
function Get-SeatTriggerBackoff([string]$SeatId, [int]$DefaultBackoffSeconds) {
    $state = Get-WatchState
    if ($state.SeatTriggerBackoff.PSObject.Properties.Name -contains $SeatId) {
        return $state.SeatTriggerBackoff.$SeatId
    }
    return [PSCustomObject]@{ BackoffSeconds = $DefaultBackoffSeconds; BackoffUntil = $null }
}

function Set-SeatTriggerBackoff([string]$SeatId, [int]$BackoffSeconds, $BackoffUntil) {
    $state = Get-WatchState
    $entry = [PSCustomObject]@{
        BackoffSeconds = $BackoffSeconds
        BackoffUntil   = if ($null -ne $BackoffUntil) { $BackoffUntil.ToString("o") } else { $null }
    }
    if ($state.SeatTriggerBackoff.PSObject.Properties.Name -contains $SeatId) {
        $state.SeatTriggerBackoff.$SeatId = $entry
    } else {
        $state.SeatTriggerBackoff | Add-Member -NotePropertyName $SeatId -NotePropertyValue $entry -Force
    }
    Save-WatchState -State $state
}

# Same rule, same fix, applied to the pre-existing Codex/Claude
# revival-scheduling state (nextReviveAt/lastStop) - found live during
# this same session's dry-run proof: even after moving trigger-daemon
# backoff off docs/FLEET_SEATS.json, THIS state was still being written
# to that same tracked file on every cycle by the older, separate
# revival-scheduling code below (Invoke-WatchCycle's codex/claude
# adapter blocks), which is exactly the same class of problem the
# operator's rule targets. Moved to $stateFile under a SeatRevival
# property, same pattern as SeatTriggerBackoff above.
function Get-SeatRevival([string]$SeatId) {
    $state = Get-WatchState
    if ($state.PSObject.Properties.Name -contains 'SeatRevival' -and $state.SeatRevival.PSObject.Properties.Name -contains $SeatId) {
        return $state.SeatRevival.$SeatId
    }
    return [PSCustomObject]@{ NextReviveAt = $null; LastStop = $null }
}

function Set-SeatRevival([string]$SeatId, $NextReviveAt, $LastStop) {
    $state = Get-WatchState
    if (-not ($state.PSObject.Properties.Name -contains 'SeatRevival')) {
        $state | Add-Member -NotePropertyName SeatRevival -NotePropertyValue ([PSCustomObject]@{}) -Force
    }
    $entry = [PSCustomObject]@{ NextReviveAt = $NextReviveAt; LastStop = $LastStop }
    if ($state.SeatRevival.PSObject.Properties.Name -contains $SeatId) {
        $state.SeatRevival.$SeatId = $entry
    } else {
        $state.SeatRevival | Add-Member -NotePropertyName $SeatId -NotePropertyValue $entry -Force
    }
    Save-WatchState -State $state
}

function Test-PastKnownReset([string[]]$ResetTimes, [int]$GraceMinutes) {
    if ($ResetTimes.Count -eq 0) { return $false }
    $now = Get-Date
    foreach ($t in $ResetTimes) {
        try {
            $resetToday = [datetime]::ParseExact($t, 'HH:mm', $null)
            $resetToday = Get-Date -Year $now.Year -Month $now.Month -Day $now.Day -Hour $resetToday.Hour -Minute $resetToday.Minute -Second 0
            $graceEnd = $resetToday.AddMinutes($GraceMinutes)
            if ($now -ge $graceEnd -and $now -lt $resetToday.AddHours(1)) { return $true }
        } catch {
            Write-Host "Ignoring unparseable KnownCodexResetTimes entry: $t"
        }
    }
    return $false
}

function Invoke-InboxAlertCheck($State) {
    $inboxPath = Join-Path $repoRoot "docs\OPERATOR_INBOX.md"
    if (-not (Test-Path $inboxPath)) { return $State }
    $mtimeEpoch = [long](Get-Date (Get-Item $inboxPath).LastWriteTimeUtc -UFormat %s)
    if ($mtimeEpoch -gt $State.LastInboxCheckEpoch) {
        Send-NtfyAlert -Title "OPEN-FOR-OPERATOR" -Message "docs/OPERATOR_INBOX.md was updated - a seat posted a question or open item."
        $State.LastInboxCheckEpoch = $mtimeEpoch
    }
    return $State
}

function Invoke-WatchCycle {
    if (Test-KillSwitch) { return $false }

    Write-Host "=== FLEET_WATCH cycle: $(Get-Date -Format o) ==="

    Invoke-AutoDeployIfAdvanced

    $heartbeats = Get-FleetHeartbeats
    Write-FleetSchedule -Heartbeats $heartbeats

    $state = Get-WatchState

    # SILENT-IDLE DETECTOR: last output = a landing/report, board still
    # has READY rows this seat owns, no question posted since - flag it
    # and auto-revive with a drain prompt. Runs for every seat this
    # script tracks, not just Codex-backed ones - the gap the operator
    # named applied fleet-wide.
    $seatConfigsForIdleCheck = Get-FleetSeatsConfig
    foreach ($seatName in $seats) {
        $idleFinding = Test-SilentIdleSeat -Seat $seatName -IdleThresholdMinutes $SilentIdleThresholdMinutes
        if (-not $idleFinding) { continue }
        $drainPrompt = Get-DrainPrompt -IdleFinding $idleFinding
        Write-Host "SILENT-IDLE: $($idleFinding.Seat) - $drainPrompt"
        Send-NtfyAlert -Title "Silent idle: $($idleFinding.Seat)" -Message $drainPrompt
        $seatCfg = $seatConfigsForIdleCheck | Where-Object { $_.id -eq $idleFinding.Seat } | Select-Object -First 1
        if (-not $seatCfg) {
            Write-Host "No seats-config entry for $($idleFinding.Seat) - alerted only, no adapter to auto-revive through."
            continue
        }
        if ($seatCfg.adapter -eq 'claude') {
            Start-ClaudeSeat -Seat $seatCfg -OverrideBrief $drainPrompt
        } elseif ($seatCfg.adapter -eq 'codex') {
            Start-CodexMission -DispatchedRow $idleFinding.TopRow
        }
    }

    # Stalled-fleet alert: every codex-backed seat DARK for longer than
    # the threshold, and we haven't already alerted on this same stall
    # (re-alerting every cycle while still stalled would spam).
    $maxCodexAge = ($codexBackedSeats | ForEach-Object { $heartbeats[$_].AgeMinutes } | Where-Object { $_ } | Measure-Object -Maximum).Maximum
    if ($maxCodexAge -and $maxCodexAge -gt $StalledAlertMinutes) {
        $nowEpoch = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        if (($nowEpoch - $state.LastStalledAlertEpoch) -gt ($StalledAlertMinutes * 60)) {
            Send-NtfyAlert -Title "Fleet stalled" -Message "Codex-backed seats (MASON/RIVET) dark for over $StalledAlertMinutes minutes."
            $state.LastStalledAlertEpoch = $nowEpoch
        }
    }

    $probe = Test-CodexProbe
    $codexOk = $probe.Ok
    $dispatchedRow = Get-TopReadyRow
    if ($dispatchedRow) {
        Write-Host "DISPATCH: top READY row is $($dispatchedRow.Id) - $($dispatchedRow.Title)"
    } else {
        Write-Host "DISPATCH: no READY row found on the board."
    }

    # W-50 seats config + codex adapter: record an exact next-revive
    # time from a real "try again at <time>" message, then fire only
    # once the clock reaches that exact recorded minute - not a coarse
    # "past reset + grace" guess. State lives in $stateFile
    # (Get/Set-SeatRevival), never on the seat's own tracked
    # docs/FLEET_SEATS.json entry - found live this session that this
    # exact block kept rewriting that tracked file every cycle even
    # after the trigger daemon's own separate backoff state was moved
    # off it.
    $seatConfigs = Get-FleetSeatsConfig
    if ($seatConfigs) {
        $codexSeats = $seatConfigs | Where-Object { $_.adapter -eq 'codex' }
        foreach ($seatCfg in $codexSeats) {
            $revival = Get-SeatRevival -SeatId $seatCfg.id
            if (-not $codexOk) {
                $resetTime = Get-CodexResetTime -ProbeOutput $probe.Output
                if ($resetTime -and $revival.NextReviveAt -ne $resetTime.ToString('o')) {
                    Set-SeatRevival -SeatId $seatCfg.id -NextReviveAt $resetTime.ToString('o') -LastStop (Get-Date).ToString('o')
                    $revival = Get-SeatRevival -SeatId $seatCfg.id
                    Write-Host "CODEX ADAPTER: parsed 'try again at' -> nextReviveAt=$($revival.NextReviveAt) for $($seatCfg.id)"
                }
            }
            if ($revival.NextReviveAt) {
                $nextReviveAt = [datetime]$revival.NextReviveAt
                if (Test-DueForRevival -NextReviveAt $nextReviveAt) {
                    Write-Host "CODEX ADAPTER: $($seatCfg.id) is due for revival now (scheduled $($revival.NextReviveAt))."
                    Send-NtfyAlert -Title "Scheduled revival" -Message "$($seatCfg.id): recorded reset time reached, launching."
                    Start-CodexMission -DispatchedRow $dispatchedRow
                    Set-SeatRevival -SeatId $seatCfg.id -NextReviveAt $null -LastStop $revival.LastStop
                } elseif ($DryRun) {
                    Write-Host "[DRY-RUN] $($seatCfg.id) next revive at $($revival.NextReviveAt), not due yet (now=$(Get-Date -Format o))."
                }
            }
        }
    }

    if (-not $codexOk) {
        Write-Host "Codex still limited - staying dark, no immediate launch (scheduled revival, if any, handled above)."
        $state.CodexWasDark = $true
    } else {
        if ($state.CodexWasDark) {
            Send-NtfyAlert -Title "Codex limit lifted" -Message "Probe succeeded after a prior limit - launching the overnight mission."
            Start-CodexMission -DispatchedRow $dispatchedRow
            Send-NtfyAlert -Title "Codex revived" -Message "Mission launched headless: $missionFile"
        }
        $state.CodexWasDark = $false
    }

    # Claude-revives-Codex secondary path: this seat is active (it's
    # running right now, by definition), Codex is dark, and we're past a
    # known reset time + grace period - revive even without a fresh OK
    # probe, since the probe result above may just reflect the same
    # ongoing limit the schedule already accounts for.
    if (-not $codexOk -and (Test-PastKnownReset -ResetTimes $KnownCodexResetTimes -GraceMinutes $KnownResetGraceMinutes)) {
        Send-NtfyAlert -Title "Claude-revives-Codex" -Message "Past a known reset + grace period and Codex is still dark - launching anyway (RULE 38(1) secondary path)."
        Start-CodexMission -DispatchedRow $dispatchedRow
    }

    # Claude adapter (wired, gated): claude-backed seats due for
    # revival get the same exact-time + dispatch treatment.
    if ($seatConfigs) {
        $claudeSeats = $seatConfigs | Where-Object { $_.adapter -eq 'claude' }
        foreach ($seatCfg in $claudeSeats) {
            $revival = Get-SeatRevival -SeatId $seatCfg.id
            if (-not $revival.NextReviveAt) { continue }
            $nextReviveAt = [datetime]$revival.NextReviveAt
            if (Test-DueForRevival -NextReviveAt $nextReviveAt) {
                Start-ClaudeSeat -Seat $seatCfg -DispatchedRow $dispatchedRow
                Set-SeatRevival -SeatId $seatCfg.id -NextReviveAt $null -LastStop $revival.LastStop
            }
        }
    }

    $state = Invoke-InboxAlertCheck -State $state
    Save-WatchState -State $state

    # W-98 TRIGGER_DAEMON: inert unless -EnableTriggerDaemon was passed
    # at launch (checked inside the function itself, not gated here, so
    # a -DryRun cycle still exercises and logs the same decision path).
    Invoke-SeatTriggerDaemon

    return $true
}

# W-98 follow-up (2026-09-08, per operator ask): -EnableTriggerDaemon
# without -Loop previously ran exactly one cycle then exited - a
# one-shot invocation defeats the point of a "daemon." Passing
# -EnableTriggerDaemon now implies persistent cycle -> sleep -> cycle
# behavior even if -Loop itself wasn't separately passed, so an
# operator flipping the daemon on doesn't also have to remember a
# second flag for it to actually keep running.
$effectiveLoop = $Loop -or $EnableTriggerDaemon
if ($EnableTriggerDaemon -and -not $Loop) {
    Write-Host "TRIGGER-DAEMON: -EnableTriggerDaemon implies persistent looping (cycle -> sleep -> cycle) even though -Loop wasn't passed separately."
}

try {
    if ($effectiveLoop) {
        while ($true) {
            $shouldContinue = Invoke-WatchCycle
            if (-not $shouldContinue) { break }
            Write-Host "Sleeping $IntervalMinutes minutes..."
            Start-Sleep -Seconds ($IntervalMinutes * 60)
            if (Test-KillSwitch) { break }
        }
    } else {
        Invoke-WatchCycle | Out-Null
    }
} finally {
    # Explicit release on every normal/kill-switch exit path (Ctrl+C
    # and other abrupt termination still fall to the OS's own
    # process-exit mutex release, handled as an "abandoned mutex" by
    # the next launch's WaitOne above - this finally block covers the
    # clean-exit case so the mutex doesn't sit held-but-unreleased
    # until the process object itself is torn down).
    if ($singleInstanceAcquired) {
        $singleInstanceMutex.ReleaseMutex() | Out-Null
    }
    $singleInstanceMutex.Dispose()
}
