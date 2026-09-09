# Company Secretary Handoff Audit

> **[PROFESSIONAL-REVIEW-REQUIRED]** Prepared as a document-control audit, not a legal opinion, compliance certificate or filing authorization. Every form, fee, threshold and timeline is **INDICATIVE-VERIFY-BEFORE-FILING**. A practicing CS must validate the current consolidated Act, rules and MCA V3 workflow.

Audit date: 2026-09-09. Scope: the ten active Day-1 documents in this directory before this audit was added.

## Executive Summary

**Overall verdict: BLOCKED FOR FILING; READY FOR DIRECT CS EDIT.** Five filing-critical defects were found and corrected in this branch: Table A structure, section 2(68) private-company restrictions, SHA/AoA precedence, section 173(1) first-meeting deadline, and AGILE-PRO-S state/applicability mapping. No active document remains `FAIL` on those checks. The constitutional instruments remain `REQUIRES-CS-EDIT` because the CS must convert them into current MCA forms, settle the board-control mechanics and certify all particulars.

## Document-by-document audit

| Document | Statutory check | Verdict | Exact section/reference | Required edit or CS action |
|---|---|---|---|---|
| `MOA.md` | Table A sequence: name, State, objects/furtherance, limited liability, capital and subscriber clauses | REQUIRES-CS-EDIT | Companies Act ss.4–5; Schedule I, Table A | Branch added all six structural clauses. CS must settle eMoA wording, NIC code, capital and subscriber table. |
| `MOA.md` | RCC/steel-only object and prevention of independent use of incidental objects | PASS | s.4(1)(c); Schedule I Table A cl.3 | Express restriction added. CS must confirm Registrar-acceptable scope; ultra-vires consequence is a legal effect, not a drafting guarantee. |
| `AOA.md` | Table F baseline | REQUIRES-CS-EDIT | s.5; Schedule I, Table F | Express Table F adoption added subject to modifications; CS must map every modification into eAoA and remove conflicts. |
| `AOA.md` | Transfer restriction, maximum 200 members, no public invitation | PASS | s.2(68)(i)–(iii) | Mandatory restrictions added, including statutory employee/joint-holder qualifications. CS must settle the operative transfer procedure. |
| `AOA.md` | Minimum two members/subscribers and two directors | PASS | ss.3(1)(b), 149(1)(a) | Minimums added; CS must verify identities, DIN/DSC and continued compliance. |
| `AOA.md` | Majority-director nomination and casting vote | REQUIRES-CS-EDIT | ss.149, 152, 161; Schedule I Table F arts.67–69, subject to current consolidated text | Draft now specifies a three-director Board (two Sharief nominees, one Shoaib nominee), distinguishes nomination from appointment and limits casting vote. CS must validate composition, quorum, chair election, minority protection and exact Articles language. |
| `AOA.md` | Cited ss.150 and 260 | PASS WITH CORRECTION | s.150; s.161; s.260 | s.150 concerns independent-director selection if applicable. s.260 concerns a company administrator, not additional directors; s.161 is the relevant provision. Correction is explicit. |
| `FOUNDERS_AGREEMENT.md` | Roles, 50/50 ownership and execution confinement align with Articles | REQUIRES-CS-EDIT | ss.5–6, 149, 166; Articles/SHA | No direct statutory filing form. CS/lawyer must align authority, duties, compensation, leaver and dispute clauses with final Articles/SHA. |
| `SHAREHOLDERS_AGREEMENT.md` | Explicit AoA supremacy and Act override | PASS | s.6; ss.5, 10 | Missing clause was a failure; branch added an express Act/AoA-precedence clause and document-alignment duty. |
| `SHAREHOLDERS_AGREEMENT.md` | Board-control and reserved matters enforceability | REQUIRES-CS-EDIT | ss.149, 152, 161, 166; Schedule I Table F | CS/lawyer must ensure private agreement does not purport to bind Company organs contrary to filed Articles or mandatory law. |
| `REGISTRATION_SOP.md` | Part A name reservation; Part B incorporation; linked forms | PASS | MCA SPICe+ V3 FAQs; ss.4, 7 | Mapping is explicit. CS must confirm live form versions, upload sequence, attachments, fees and stamp duty. |
| `REGISTRATION_SOP.md` | AGILE-PRO-S linkage | PASS | MCA SPICe+ V3 FAQ qq.39–45; AGILE-PRO-S instruction kit | Corrected: bank and EPFO/ESIC workflow, optional GSTIN, state-specific Profession Tax and optional Delhi Shops/Establishment; live coverage still requires verification. |
| `STATUTORY_FORMS_WORKING_SHEETS.md` | SPICe+ A/B data separation | PASS | MCA SPICe+ V3 FAQs | Name and incorporation inputs remain separately mapped. |
| `STATUTORY_FORMS_WORKING_SHEETS.md` | DIR-2 and INC-9 | REQUIRES-CS-EDIT | ss.7, 152; current DIR-2/INC-9 workflow | Working sheets appropriately avoid replacing official forms. CS must obtain restricted KYC and generate/execute current forms. |
| `FIRST_BOARD_RESOLUTIONS.md` | First Board meeting within 30 days | PASS | s.173(1) | Mandatory deadline added. CS must calculate from incorporation date and settle notice, quorum, minutes and resolutions. |
| `FIRST_BOARD_RESOLUTIONS.md` | First-auditor, bank, subscriptions, registers and initial policies | REQUIRES-CS-EDIT | ss.139(6), 56, 88 and applicable rules | Coverage exists; CS must confirm deadlines, forms, stamp duty and resolution wording. |
| `COMPLIANCE_CALENDAR.md` | First-meeting control and recurring/event compliance | REQUIRES-CS-EDIT | s.173(1) and applicable Act/rules | 30-day deadline added. CS must populate exact annual/event forms and due dates for the actual company. |
| `COMPANY_SITE_SCOPE.md` | Corporate identity and evidence controls | REQUIRES-CS-EDIT | ss.12(3), 12(3)(c) and applicable disclosure requirements — verify consolidated text | CS must supply exact legal name, CIN, registered-office/contact disclosures and approve public corporate claims after incorporation. |
| `README.md` | Pack index and filing gate | PASS | Document-control check | Correctly states professional-review and filing block; no statutory form function. |

## Mandatory findings

### MoA / Table A

The corrected draft now follows Table A's six-part architecture and makes the RCC/structural-steel object the sole independent object. The incidental clause is expressly subordinate. The CS must not file the prose draft directly; it must be settled into the current eMoA fields with exact capital and subscriber data.

### AoA / private-company definition

The corrected draft contains all three section 2(68) restrictions and the minimum two-member/two-director controls. The majority-director and casting-vote design is not self-executing: appointment must occur under the Act and filed Articles. Section 260 is not an additional-director provision; section 161 is. This discrepancy is corrected rather than repeated.

### SHA supremacy

The original SHA lacked an express conflict rule and therefore failed the requested gate. It now states that the Act overrides under section 6 and the filed AoA prevails over the SHA for Company governance until lawfully aligned.

### MCA workflow

MCA's V3 FAQ identifies SPICe+ Part A for name reservation and Part B for incorporation. Official MCA guidance describes AGILE-PRO-S as the linked route for bank-account application, EPFO/ESIC registration, supported-state Profession Tax, optional GSTIN and optional Delhi Shops/Establishment. The CS must verify the live V3 experience because state availability and portal fields can change.

## Traps for the CS

The CS must physically obtain or verify, outside this repository:

- `[OPERATOR-INPUT]` approved name/SRN and name-reservation validity;
- `[OPERATOR-INPUT]` State, ROC jurisdiction, registered-office address, owner NOC, lease/title proof and utility bill not older than the live-rule limit;
- `[OPERATOR-INPUT]` authorised/subscribed capital, face value, share count and exact 50/50 subscriber allocation;
- `[OPERATOR-INPUT]` subscriber/director legal names, father's names, dates of birth, occupations, addresses, nationality, PAN/passport and beneficial-ownership particulars;
- `[OPERATOR-INPUT]` DSC tokens/certificates, validity, association status and signer email/mobile;
- `[OPERATOR-INPUT]` DIN approval letters or integrated-DIN eligibility and disqualification declarations;
- `[OPERATOR-INPUT]` DIR-2 consents, INC-9 generation/exception status and execution evidence;
- `[OPERATOR-INPUT]` bank selection, authorised signatory, specimen signatures and beneficial-owner KYC;
- `[OPERATOR-INPUT]` GSTIN election and tax jurisdiction; EPFO/ESIC implemented-area and threshold position; Profession Tax state; Delhi Shops/Establishment choice if applicable;
- `[OPERATOR-INPUT]` share subscription consideration and bank receipt; share-certificate/stamp evidence;
- `[OPERATOR-INPUT]` first Board meeting date within 30 days, notice, attendance, quorum, disclosures, minutes and first-auditor consent;
- `[OPERATOR-INPUT]` board size, Sharief nomination mechanics, chair election, casting-vote wording and reserved-matter schedule;
- `[OPERATOR-INPUT]` third-director legal identity, DIN/DSC, consent, eligibility and nominee appointment evidence;
- `[OPERATOR-INPUT]` government fee, state stamp duty, professional fee, SRN/challan, resubmission deadline and filing receipt from the live portal;
- `[OPERATOR-INPUT]` commencement-filing applicability and subscription-money evidence;
- `[OPERATOR-INPUT]` project/client permissions and statutory website particulars before publication.

KYC scans and credentials remain with the practicing professional and must not be committed to the repository.

## Official sources checked

- India Code, Companies Act, 2013: https://www.indiacode.nic.in/handle/123456789/2114
- India Code, Schedule I, Table A/Table F: https://upload.indiacode.nic.in/schedulefile?aid=AC_CEN_22_29_00008_201318_1517807327856&rid=8
- MCA, SPICe+ and linked-filings FAQs V3: https://www.mca.gov.in/content/dam/mca/pdf/SPICEplus-and-linked-filings-FAQs-V3-20230122.pdf
- MCA, AGILE-PRO-S instruction kit: https://www.mca.gov.in/Ministry/pdf/AGILE-PRO_help.pdf

## Handoff verdict

**READY FOR CS:** document-by-document correction and working-data completion.

**BLOCKED:** direct signing, filing, reliance or corporate action until the practicing CS settles the operative instruments, verifies the current portal/rules, completes every physical-input check above and signs the professional verification record.
