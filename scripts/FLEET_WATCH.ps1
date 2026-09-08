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
    [int]$TriggerDaemonMaxBackoffSeconds = 14400  # 4h cap - a rate-limited seat backs off exponentially from the base but never waits longer than this before the next retry
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\ferrum_os_recovered"
$missionFile = "D:\ferrum_os\overnight_codex.md"
$killSwitchPath = Join-Path $repoRoot "docs\FLEET_WATCH_STOP"
$scheduleFile = Join-Path $repoRoot "docs\FLEET_SCHEDULE.md"
$stateFile = Join-Path $repoRoot ".fleet-watch-state.json"
$taskBoardFile = Join-Path $repoRoot "docs\TASK_BOARD.md"
$deployStopPath = Join-Path $repoRoot "docs\DEPLOY_STOP"
$deployStateFile = Join-Path $repoRoot ".fleet-deploy-state.json"
$triggerDaemonLedgerFile = Join-Path $repoRoot ".fleet-trigger-daemon-log.json"
$worktreeRoot = "D:\ferrum_os.worktrees"
if ([string]::IsNullOrWhiteSpace($SeatsConfigPath)) { $SeatsConfigPath = Join-Path $repoRoot "docs\FLEET_SEATS.json" }

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

function Save-FleetSeatsConfig($SeatsArray) {
    $wrapper = [PSCustomObject]@{
        _comment = "W-50 HARNESS_24x7 seats config. worktreeGlob is a prefix pattern under D:\ferrum_os.worktrees, not a single fixed path - each seat has many numbered worktrees over time; the harness resolves the most-recently-modified match at revival time."
        seats    = $SeatsArray
    }
    $wrapper | ConvertTo-Json -Depth 6 | Set-Content -Path $SeatsConfigPath -Encoding utf8
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
            return [PSCustomObject]@{ Id = $id; Title = $title; Status = $status }
        }
    }
    return $null
}

# All READY rows in docs/TASK_BOARD.md whose Eligible-seats column
# names this seat (substring match, since that column sometimes reads
# "RIVET or MASON" / "RIVET + CRANE + MASON" rather than a single name).
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
function Get-TriggerDaemonLedger {
    if (Test-Path $triggerDaemonLedgerFile) {
        try { return @(Get-Content $triggerDaemonLedgerFile -Raw | ConvertFrom-Json) } catch { }
    }
    return @()
}

function Add-TriggerDaemonLedgerEntry($Entry) {
    $ledger = @(Get-TriggerDaemonLedger) + $Entry
    $ledger | ConvertTo-Json -Depth 6 | Set-Content -Path $triggerDaemonLedgerFile -Encoding utf8
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
# Get-SeatDispatchableRow); if one exists, spawn that seat's own CLI
# (`codex exec` for MASON/RIVET per $codexBackedSeats, `claude -p`
# otherwise) INSIDE THAT SEAT'S OWN WORKTREE (not $repoRoot - the
# worktree location IS the seat's identity per the operator's own
# framing, so AGENTS.md and docs/seats/<SEAT>.md load correctly) with
# the standing prompt "next task", and wait for it to exit (seats are
# processed sequentially within one call to this function, not spawned
# in parallel - a real, disclosed scope limit, not a hidden one).
#
# Every spawn/exit/backoff-decision is written to
# .fleet-trigger-daemon-log.json (Add-TriggerDaemonLedgerEntry) so PI
# can audit real trigger evidence each cycle per RULE 55 - a spawn
# timestamp, exit code, and dispatched row ID, not an inferred landing.
# A rate-limit signal in the spawned process's own output (same
# 'limit' substring convention already used by Test-CodexProbe) doubles
# that seat's backoff (from $TriggerDaemonBaseBackoffSeconds, capped at
# $TriggerDaemonMaxBackoffSeconds) and records triggerBackoffUntil on
# the seat's own entry in docs/FLEET_SEATS.json - a clean run resets
# the seat back to the base backoff rather than leaving a stale
# multiplier from an earlier limit.
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
    $configChanged = $false
    foreach ($seatCfg in $seatConfigs) {
        $seatId = $seatCfg.id
        $hasBackoffUntil = $seatCfg.PSObject.Properties.Name -contains 'triggerBackoffUntil'
        if ($hasBackoffUntil -and $seatCfg.triggerBackoffUntil) {
            try {
                $backoffUntil = [datetime]$seatCfg.triggerBackoffUntil
                if ($now -lt $backoffUntil) {
                    Write-Host "TRIGGER-DAEMON: $seatId in backoff until $backoffUntil - skipping this cycle."
                    continue
                }
            } catch { }
        }
        $row = Get-SeatDispatchableRow -Seat $seatId
        if (-not $row) {
            Write-Host "TRIGGER-DAEMON: $seatId has no dispatchable READY row (owned or owner-agnostic) - nothing to spawn."
            continue
        }
        $worktreePath = Resolve-SeatWorktree -Glob $seatCfg.worktreeGlob
        if (-not $worktreePath) {
            Write-Host "TRIGGER-DAEMON: $seatId has no resolvable worktree ($($seatCfg.worktreeGlob)) - refusing to spawn without its own identity, skipping."
            continue
        }
        $isCodex = $codexBackedSeats -contains $seatId
        $prompt = "next task"
        $cmd = if ($isCodex) { "codex exec --full-auto -C `"$worktreePath`" `"$prompt`"" } else { "claude -p `"$prompt`"" }
        if ($DryRun) {
            Write-Host "[DRY-RUN] TRIGGER-DAEMON would spawn $seatId in $worktreePath for row $($row.Id) - $($row.Title): $cmd"
            continue
        }
        Write-Host "TRIGGER-DAEMON: spawning $seatId in $worktreePath for row $($row.Id) - $($row.Title): $cmd"
        $spawnedAt = (Get-Date).ToUniversalTime().ToString("o")
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
        Add-TriggerDaemonLedgerEntry -Entry ([PSCustomObject]@{
            Seat        = $seatId
            RowId       = $row.Id
            RowTitle    = $row.Title
            Command     = $cmd
            SpawnedAt   = $spawnedAt
            ExitedAt    = $exitedAt
            ExitCode    = $exitCode
            RateLimited = [bool]$rateLimited
        })
        $prevBackoff = if (($seatCfg.PSObject.Properties.Name -contains 'triggerBackoffSeconds') -and $seatCfg.triggerBackoffSeconds) { [int]$seatCfg.triggerBackoffSeconds } else { $TriggerDaemonBaseBackoffSeconds }
        if ($rateLimited) {
            $nextBackoff = [Math]::Min($prevBackoff * 2, $TriggerDaemonMaxBackoffSeconds)
            $seatCfg | Add-Member -NotePropertyName triggerBackoffSeconds -NotePropertyValue $nextBackoff -Force
            $seatCfg | Add-Member -NotePropertyName triggerBackoffUntil -NotePropertyValue ((Get-Date).AddSeconds($nextBackoff).ToString("o")) -Force
            Write-Host "TRIGGER-DAEMON: $seatId rate-limited (exit $exitCode) - backing off $nextBackoff s."
        } else {
            $seatCfg | Add-Member -NotePropertyName triggerBackoffSeconds -NotePropertyValue $TriggerDaemonBaseBackoffSeconds -Force
            $seatCfg | Add-Member -NotePropertyName triggerBackoffUntil -NotePropertyValue $null -Force
            Write-Host "TRIGGER-DAEMON: $seatId exited $exitCode, no rate limit detected - backoff reset to base."
        }
        $configChanged = $true
    }
    if ($configChanged) { Save-FleetSeatsConfig -SeatsArray $seatConfigs }
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

function Write-FleetSchedule([hashtable]$Heartbeats) {
    $today = Get-Date -Format 'yyyy-MM-dd'
    $lines = @("# FLEET_SCHEDULE.md - daily heartbeat snapshot (AGENTS.md RULE 38)", "")
    $lines += "## $today $(Get-Date -Format 'HH:mm') UTC"
    $lines += ""
    $lines += "| Seat | Status | Last activity |"
    $lines += "|------|--------|----------------|"
    foreach ($seat in $seats) {
        $h = $Heartbeats[$seat]
        $age = if ($null -eq $h.AgeMinutes) { 'no signal found' } else { "$($h.AgeMinutes) min ago" }
        $lines += "| $seat | $($h.Status) | $age |"
    }
    $lines += ""
    Set-Content -Path $scheduleFile -Value ($lines -join "`n") -Encoding utf8
    Write-Host "Wrote $scheduleFile"
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

function Start-CodexMission($DispatchedRow) {
    $cmd = "codex exec --full-auto -C `"$repoRoot`" - < `"$missionFile`""
    if ($DryRun) {
        $rowText = if ($DispatchedRow) { "$($DispatchedRow.Id) - $($DispatchedRow.Title)" } else { "(no READY row found)" }
        Write-Host "[DRY-RUN] would launch Codex mission headless: $cmd"
        Write-Host "[DRY-RUN] dispatched top READY row injected into mission context: $rowText"
        return
    }
    Write-Host "Launching Codex mission file headless: $missionFile"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -WindowStyle Hidden
}

function Get-WatchState {
    if (Test-Path $stateFile) {
        try { return Get-Content $stateFile -Raw | ConvertFrom-Json } catch { }
    }
    return [PSCustomObject]@{ CodexWasDark = $false; LastStalledAlertEpoch = 0; LastInboxCheckEpoch = 0 }
}

function Save-WatchState($State) {
    $State | ConvertTo-Json | Set-Content -Path $stateFile -Encoding utf8
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
    # "past reset + grace" guess.
    $seatConfigs = Get-FleetSeatsConfig
    if ($seatConfigs) {
        $codexSeats = $seatConfigs | Where-Object { $_.adapter -eq 'codex' }
        foreach ($seatCfg in $codexSeats) {
            if (-not $codexOk) {
                $resetTime = Get-CodexResetTime -ProbeOutput $probe.Output
                if ($resetTime -and $seatCfg.nextReviveAt -ne $resetTime.ToString('o')) {
                    $seatCfg.nextReviveAt = $resetTime.ToString('o')
                    $seatCfg.lastStop = (Get-Date).ToString('o')
                    Write-Host "CODEX ADAPTER: parsed 'try again at' -> nextReviveAt=$($seatCfg.nextReviveAt) for $($seatCfg.id)"
                }
            }
            if ($seatCfg.nextReviveAt) {
                $nextReviveAt = [datetime]$seatCfg.nextReviveAt
                if (Test-DueForRevival -NextReviveAt $nextReviveAt) {
                    Write-Host "CODEX ADAPTER: $($seatCfg.id) is due for revival now (scheduled $($seatCfg.nextReviveAt))."
                    Send-NtfyAlert -Title "Scheduled revival" -Message "$($seatCfg.id): recorded reset time reached, launching."
                    Start-CodexMission -DispatchedRow $dispatchedRow
                    $seatCfg.nextReviveAt = $null
                } elseif ($DryRun) {
                    Write-Host "[DRY-RUN] $($seatCfg.id) next revive at $($seatCfg.nextReviveAt), not due yet (now=$(Get-Date -Format o))."
                }
            }
        }
        Save-FleetSeatsConfig -SeatsArray $seatConfigs
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
        $claudeSeats = $seatConfigs | Where-Object { $_.adapter -eq 'claude' -and $_.nextReviveAt }
        foreach ($seatCfg in $claudeSeats) {
            $nextReviveAt = [datetime]$seatCfg.nextReviveAt
            if (Test-DueForRevival -NextReviveAt $nextReviveAt) {
                Start-ClaudeSeat -Seat $seatCfg -DispatchedRow $dispatchedRow
                $seatCfg.nextReviveAt = $null
                Save-FleetSeatsConfig -SeatsArray $seatConfigs
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

if ($Loop) {
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
