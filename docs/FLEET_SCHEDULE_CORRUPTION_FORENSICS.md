# FLEET_SCHEDULE.md corruption — forensics report

**Date:** 2026-09-09
**Investigator:** CRANE
**Trigger:** PI found `docs/FLEET_SCHEDULE.md` corrupted (3,140+ repeated `<SEAT> : DARK` lines, no Git provenance) and flagged `scripts/FLEET_WATCH.ps1` / the W-98 trigger-daemon loop as the likely writer.

## Conclusion

**`scripts/FLEET_WATCH.ps1` is not the writer, in any version ever committed to this repository.** The actual writer is external to this repo and could not be identified from repo contents alone.

## Evidence

### 1. Byte-level analysis of the corrupted file

`docs/FLEET_SCHEDULE.md` began with a normal UTF-8 markdown header (a real 7-row status table, matching a genuine `Write-FleetSchedule` write from 2026-09-08 16:48 UTC), then abruptly switched to raw content. A hex dump of the tail:

```
00000050: 5200 4b00 0d00 0a00 4100 5400 4c00 4100  R.K.....A.T.L.A.
00000060: 5300 2000 3a00 2000 4400 4100 5200 4b00  S. .:. .D.A.R.K.
00000070: 0d00 0a00 4300 5200 4100 4e00 4500 2000  ....C.R.A.N.E. .
00000080: 3a00 2000 4400 4100 5200 4b00 0d00 0a00  :. .D.A.R.K.....
```

This is **UTF-16LE** (`43 00 52 00 41 00 4E 00 45 00` = `C`,`R`,`A`,`N`,`E`, each ASCII byte followed by a null byte) with `\r\n` line endings (`0d 00 0a 00`). The repeating pattern cycles through exactly 5 seats in a fixed order — `ATLAS`, `CRANE`, `MASON`, `SCRIBE`, `RIVET` — never `PI` or `FERRITE`. Each line is the bare string `SEAT : DARK`, with no age/timestamp suffix and no markdown table structure.

### 2. Full commit-history search of the claimed writer

Searched every commit that ever touched `scripts/FLEET_WATCH.ps1`, from the very first (`fb1c90fed`, "fleet watch v2") through the current HEAD at the time of investigation (`af819cc85`):

```
git log --all --oneline -p -- scripts/FLEET_WATCH.ps1 | grep -n "scheduleFile\|FLEET_SCHEDULE"
```

Every version, without exception, writes `docs/FLEET_SCHEDULE.md` (when it writes it at all) via:

```powershell
Set-Content -Path $scheduleFile -Value ($lines -join "`n") -Encoding utf8
```

This is:
- Explicit UTF-8, never UTF-16 (Windows PowerShell 5.1's *unspecified*-encoding default for `Out-File`/`>>` is UTF-16LE — this code never hit that default because `-Encoding utf8` is always passed).
- A full **overwrite** (`Set-Content` replaces file content), never an append — so no version of this code could accumulate thousands of repeated lines across cycles even if run continuously.
- Always formatted as a markdown table with an age suffix (`CRANE : ACTIVE (0.5 min ago)` or, after the 2026-09-08 fix, console-only `Write-Host` with the identical format), never a bare `SEAT : DARK` line.

Checked directly with `git show fb1c90fed:scripts/FLEET_WATCH.ps1` (the very first tracked version) to rule out even a pre-history format this repo never saw again — same result.

### 3. Repo-wide search for any other writer

```
grep -rln "DARK" --include="*.ps1" .
```

returns only `scripts/FLEET_WATCH.ps1`, and within it `"DARK"` is used exclusively as a status *value* inside a hashtable (`@{ Status = 'DARK' }`), consumed by the same `Write-Host`/`Set-Content` call already ruled out above — never written bare, never in a 5-of-7-seat rotation, never in UTF-16.

### 4. What this rules in

The exact format (`SEAT : DARK`, no markdown, 5-seat rotation excluding PI/FERRITE) and encoding (UTF-16LE, CRLF) match **no code path in this repository's history**. Combined with PI's own finding of "no Git provenance," the writer is an **external, untracked process** — a separate script, a manual redirect (`>>` in a shell/PowerShell session defaults to UTF-16LE when no `-Encoding` is given, which would exactly produce this signature), or a different tool entirely. It cannot be identified further from within this repository; if it recurs, the fix is to identify and correct that external process, not this repo's code.

### 5. A real, separate bug found in the course of this investigation

At the time of investigation, `docs/FLEET_SEATS.json` (a real, git-tracked file) was also locally modified, reformatted into the same pattern seen and fixed in the two prior W-98 landings (`crane/w98-spawn-and-ledger-fix`, `crane/w98-runtime-state-isolation`) — evidence that a **stale `FLEET_WATCH.ps1` process, started before those fixes landed, was still running in memory** (a running PowerShell process does not reload its script body from disk once launched). This is not the cause of the `FLEET_SCHEDULE.md` corruption (the format doesn't match, per above), but it is a real, live problem: any stale process from before a fix lands keeps running the old, already-fixed bugs indefinitely, and a fresh corrected process launched alongside it can mask that the stale one is still active. Restored via `git checkout -- docs/FLEET_SEATS.json` (nothing to commit — it matched HEAD exactly once restored). This finding directly motivates the single-instance guard added in this same landing (see below): a stale process must never be able to coexist with a freshly-launched one.

## Actions taken

1. `docs/FLEET_SEATS.json` restored to clean tracked state (`git checkout --`). Confirmed via `git status` afterward: working tree clean, nothing to commit — the restore matched HEAD exactly, so there is no new commit for this specific action.
2. `docs/FLEET_SCHEDULE.md` (corrupted, always gitignored, never tracked in any commit) deleted. Confirmed via one full real dry-run cycle (`FLEET_WATCH.ps1 -DryRun -EnableTriggerDaemon`) afterward: the file did not reappear (current `Write-FleetSchedule` is console-only, per the prior `crane/w98-dispatch-landing-check` landing), and `docs/FLEET_SEATS.json` stayed byte-identical (`git status --short` clean) through the entire cycle - heartbeat scan, dispatch, idle-detection, and trigger-daemon spawning all exercised.
3. This report and a single-instance mutex guard (below) land together as `crane/fleet-watch-forensics`.

## Single-instance guard (this landing)

`FLEET_WATCH.ps1` now acquires a named OS mutex (`Global\FerrumOS_FLEET_WATCH_SingleInstance`) as the very first action after its top-level variable init, before any real work (heartbeat scan, dispatch, deploy check) runs. A second launch that cannot acquire it logs a clear refusal and exits 1 immediately, without touching any state file. A prior holder that terminated abnormally (killed rather than stopped cleanly) is detected via .NET's `AbandonedMutexException` and handled as a successful acquire, not a permanent lock-out.

**Proven live, three real launches, not just a code read:**

1. Instance A launched with `-EnableTriggerDaemon` (persistent loop) - acquired the mutex, ran one full cycle, entered its sleep phase.
2. Instance B launched concurrently while A held the mutex - refused immediately: `FLEET_WATCH: REFUSING TO START - another instance already holds the single-instance mutex (Global\FerrumOS_FLEET_WATCH_SingleInstance)...`, exit code 1, zero state touched.
3. Instance A killed (process termination, not a clean stop - the harder case, since it never runs its own `finally` release). Instance C launched immediately after - acquired the mutex successfully (abandoned-mutex recovery, or OS-level release on process death, or both - either way, exit code 0, ran its full cycle normally) and did not require any manual cleanup.

This directly closes the failure mode found in section 5 above: a stale process from before a fix lands can no longer coexist silently with a freshly-launched one - the fresh launch either becomes the sole active instance, or (if the stale one is still genuinely alive) refuses to start and says so, rather than both processes quietly fighting over the same state files.

## Recommendation

Find and terminate any `FLEET_WATCH.ps1` process still running from before commit `af819cc85` (`w98-runtime-state-isolation`, 2026-09-08) landed, then relaunch fresh. The mutex guard added in this landing prevents this specific failure mode (a stale process silently coexisting with a fresh one) from recurring, but it cannot retroactively kill a process already running before the guard itself was deployed - it can only refuse to let a new one start alongside it (or, once that stale process is finally killed, let a fresh one take over cleanly, as proven above).
