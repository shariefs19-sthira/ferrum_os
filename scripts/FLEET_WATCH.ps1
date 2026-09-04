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
    [int]$StalledAlertMinutes = 45
)

$ErrorActionPreference = "Stop"
$repoRoot = "D:\ferrum_os_recovered"
$missionFile = "D:\ferrum_os\overnight_codex.md"
$killSwitchPath = Join-Path $repoRoot "docs\FLEET_WATCH_STOP"
$scheduleFile = Join-Path $repoRoot "docs\FLEET_SCHEDULE.md"
$stateFile = Join-Path $repoRoot ".fleet-watch-state.json"

$seats = @('CRANE', 'MASON', 'RIVET', 'ATLAS', 'SCRIBE', 'FERRITE', 'PI')
$codexBackedSeats = @('MASON', 'RIVET')  # per docs/seats/*.md - these run on Codex CLI, not Claude

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

function Get-SeatHeartbeat([string]$Seat) {
    # Two signals, most-recent wins: (a) the most recent [AI: SEAT]-tagged
    # commit anywhere in the repo's history, (b) the most recent mtime
    # among that seat's own worktree directories (crane-*, mason-*, etc.
    # under D:\ferrum_os.worktrees - a seat editing files updates mtimes
    # even before it commits).
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

    $worktreeRoot = "D:\ferrum_os.worktrees"
    $lastMtimeEpoch = $null
    if (Test-Path $worktreeRoot) {
        $seatPrefix = $Seat.ToLower()
        $matchingDirs = Get-ChildItem -Path $worktreeRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object { $_.Name.ToLower().StartsWith($seatPrefix) }
        foreach ($dir in $matchingDirs) {
            $newestFile = Get-ChildItem -Path $dir.FullName -Recurse -File -ErrorAction SilentlyContinue |
                Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
            if ($newestFile) {
                $epoch = [long](Get-Date $newestFile.LastWriteTimeUtc -UFormat %s)
                if (-not $lastMtimeEpoch -or $epoch -gt $lastMtimeEpoch) { $lastMtimeEpoch = $epoch }
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
    # Returns $true if Codex responded normally, $false if the output
    # indicates a rate/usage limit. A probe that errors outright (Codex
    # not installed, process failure) is treated as dark, same as a
    # limit response - this script cannot distinguish "Codex is fine but
    # unreachable" from "Codex is limited" any more precisely than that.
    try {
        $output = cmd /c 'codex exec "reply OK"' 2>&1 | Out-String
    } catch {
        return $false
    }
    if ($output -match 'limit') {
        Write-Host "Codex probe: LIMIT detected in output."
        return $false
    }
    Write-Host "Codex probe: OK."
    return $true
}

function Start-CodexMission {
    Write-Host "Launching Codex mission file headless: $missionFile"
    $cmd = "codex exec --full-auto -C `"$repoRoot`" - < `"$missionFile`""
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

    $heartbeats = Get-FleetHeartbeats
    Write-FleetSchedule -Heartbeats $heartbeats

    $state = Get-WatchState

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

    $codexOk = Test-CodexProbe

    if (-not $codexOk) {
        Write-Host "Codex still limited - staying dark, no launch attempted."
        $state.CodexWasDark = $true
    } else {
        if ($state.CodexWasDark) {
            Send-NtfyAlert -Title "Codex limit lifted" -Message "Probe succeeded after a prior limit - launching the overnight mission."
            Start-CodexMission
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
        Start-CodexMission
    }

    $state = Invoke-InboxAlertCheck -State $state
    Save-WatchState -State $state

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
