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
