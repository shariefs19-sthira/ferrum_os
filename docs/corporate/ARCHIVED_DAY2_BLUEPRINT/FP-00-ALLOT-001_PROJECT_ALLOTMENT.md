# FP-00-ALLOT-001 — Controlled Project-Allotment Form and Register

> **DRAFT CONTROL FORM — FOR REVIEW AND SETTLEMENT BY A PRACTICING CA, CS, AND LAWYER BEFORE USE.** This form is not an allotment until completed, approved through all required corporate processes, and signed by Sharief. It does not certify profit, tax, accounting, employment or distribution treatment.

Document version/effective date/custodian: **[OPERATOR-INPUT]**.

## Project-allotment instrument

**Project ID:** `[PROJECT-ID]`  
**Client:** `[CLIENT]`  
**Scope:** `[PROJECT-SCOPE]`  
**Project/contract value:** `[PROJECT-VALUE]`  
**Allotment date:** `[ALLOTMENT-DATE]`  
**Allotted Project Register cross-reference:** `[REGISTER-ROW-ID]`  
**Signed-instrument reference:** `[SIGNED-INSTRUMENT-REF]`

The project identified above is allotted to Ferrum Projects solely for the Project Economics Schedule in FP-01-PACK-001. This written instrument covers only the stated scope. It does not allot another project, variation, extension, technology/product/platform revenue, Ferrum OS revenue, or any Sharief Prior/Outside IP. No verbal statement or conduct changes this instrument.

Project-economics reconciliation, timing, reserve methodology, set-off and clawback remain **[OPERATOR-INPUT]** and are governed only by the professionally settled Founders' Agreement and SHA.

### Sharief signature block

Sharief legal name: **[OPERATOR-INPUT]**  
Capacity/authority: **[OPERATOR-INPUT]**  
Signature: `[SHARIEF-SIGNATURE]`  
Date/time/place: **[OPERATOR-INPUT]**

Board resolution reference, where used or required: **[OPERATOR-INPUT]**. Professional review/approval record: **[OPERATOR-INPUT]**.

## Controlled Allotted Project Register

Each executed instrument receives one immutable register row. Amendments append a linked row; they never overwrite history. The template row below is not an allotment.

| Register row ID | Project ID | Signed-instrument reference | Client | Scope | Value | Allotment date | Sharief signature status | Close-out |
|---|---|---|---|---|---|---|---|---|
| `[REGISTER-ROW-ID]` | `[PROJECT-ID]` | `[SIGNED-INSTRUMENT-REF]` | `[CLIENT]` | `[PROJECT-SCOPE]` | `[PROJECT-VALUE]` | `[ALLOTMENT-DATE]` | `[SHARIEF-SIGNATURE]` | `[OPEN/CLOSED]` |

## Machine-validation convention

Every project-economics entry is stored under `docs/corporate/company-registration/project-economics/` with filename `FP-ECON-<PROJECT-ID>.md` and these exact metadata lines:

```text
PROJECT-ECONOMICS-ENTRY: true
Project ID: <PROJECT-ID>
Register Row: <REGISTER-ROW-ID>
Signed Instrument: <SIGNED-INSTRUMENT-REF>
```

Before an entry can pass `scripts/verify-static.ps1`, its three concrete values must be non-placeholder values and must match one row in the Controlled Allotted Project Register above. A draft form, blank value, unmatched row, or missing signed-instrument reference is rejected. No live project-economics entries exist in this repository at adoption.
