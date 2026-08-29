# Wave Queue

## Rollup Rule
A task's status is considered DONE only if its own status is DONE AND all of its spawned subtasks (children) are also marked as DONE. The batch conductor verifies this recursively.

## Batch Status
| Batch | Status |
|-------|--------|
| B1    | OPEN   |
| B2    | CLOSED |
| B3    | CLOSED |

## WAVE-1

| Task ID | Parent | Batch | J/Domain | Assigned To | Status |
|---------|--------|-------|----------|-------------|--------|
| W1-01   |        | B1    | J06      | Qoder-CN    | DONE   |
| W1-02   |        | B1    | J06      | Qoder-CN    | OPEN   |
| W1-04   |        | B1    | J15      | Qoder-CN    | OPEN   |
| W1-07   |        | B1    | J04      | Jules-Owner-B | OPEN   |
| W1-13   |        | B1    | J05      | Jules-Owner-B | OPEN   |
| W1-08   |        | B1    | J07      | Jules-Fork-A  | OPEN   |
| W1-11   |        | B1    | J13      | Jules-Fork-A  | OPEN   |
| W1-21   |        | B1    | J16/D-RES| Scout (seat-unfilled) | OPEN   |
| W1-22   |        | B1    | J16/D-RES| Scout (seat-unfilled) | OPEN   |
| W1-03   |        | B2    | J10      | Qoder-CN    | OPEN   |
| W1-05   |        | B2    | J15      | Qoder-CN    | OPEN   |
| W1-06   |        | B2    | J15      | Qoder-CN    | OPEN   |
| W1-12   |        | B2    | J01      | Jules-Fork-A  | OPEN   |
| W1-15   |        | B2    | J07      | Jules-Fork-A  | OPEN   |
| W1-18   |        | B2    | J08      | Jules-Fork-A  | OPEN   |
| W1-20   |        | B2    | J13      | Jules-Fork-A  | OPEN   |
| W1-14   |        | B2    | J14      | Jules-Owner-B | OPEN   |
| W1-09   |        | B3    | J09      | (to be assigned) | OPEN   |
| W1-10   |        | B3    | J12      | (to be assigned) | OPEN   |
| W1-16   |        | B3    | J02      | (to be assigned) | OPEN   |
| W1-17   |        | B3    | J11      | (to be assigned) | OPEN   |
| W1-19   |        | B3    | J15      | (to be assigned) | OPEN   |