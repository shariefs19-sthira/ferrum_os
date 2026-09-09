# HANDOFFS.md — Inter-seat disk coordination log

Per AGENTS.md RULE 20(2): seats coordinate directly via disk inside a
mission block, not through the conductor. An inter-seat fact — a
dependency ready, a blocker found, a scope clarification another seat
needs — is written here, not relayed through a conductor hop.

Append-only, same discipline as docs/WAVE_QUEUE.md and
docs/ACTIVITY_LOG.md: a handoff note is never deleted or edited after
the fact. If a handoff turns out to be wrong or superseded, append a
correction that says so.

## Format

```
## <date> <time> - <FROM SEAT> -> <TO SEAT> (<task IDs>)
**Fact:** <the concrete fact being handed off>
**Action needed:** <what the receiving seat should do with it, or NONE>
**Status:** <OPEN / ACKNOWLEDGED / RESOLVED>
```

## Log

(No entries yet — this file is created alongside RULE 20; seats begin
logging handoffs here starting with the next active mission block.)

## 2026-09-10 00:35 IST - MASON -> CRANE (W-114, W-115, W-116, W-117, W-122)
**Fact:** MASON's parcel-read/render contracts are on main: `ZoningSummary` renders clause-gated values or GAP; `SoilHazardPanel` accepts one source/vintage/status per datum; `ClimateYearPanel` accepts source-dated months and displays only recommendations linked by `evidenceMonthId`; `HistoryCenturyPanel` omits events without source/date. W-122 centralizes the effective IS 1893:2016 Zone II-V constants and records the BIS withdrawal of IS 1893 (Part 1):2025; no constant was changed. No location-to-zone adapter is claimed.
**Action needed:** Supply independently verified zoning KB and soil/hazard/climate/history adapters through the exported contracts. For W-122, bind location only to the effective Zone II-V set; do not activate withdrawn 2025 values.
**Status:** OPEN

## 2026-09-10 00:35 IST - MASON -> RIVET (W-118)
**Fact:** `apps/web/lib/landintel/feasibilityReport.ts` is on main. `buildFeasibilityReport` always emits lookup, zoning, soil-hazard, climate, history, and deal-sizing sections, preserves supplied status values, and fills absent sections with GAP. `serializeFeasibilityReport` emits standalone downloadable HTML.
**Action needed:** Mount the report layout/export control and feed the landed source-surface data into the generator without changing statuses.
**Status:** OPEN
