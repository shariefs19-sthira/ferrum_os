import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - finance domain, first seed pass, adapter-first
// per the standing KB_MAX_DEPTH drain order.
//
// Source: Reserve Bank of India, "Loan to Value (LTV) Ratio" notice,
// commonman portal (rbi.org.in), restating the LTV ratio slabs from
// RBI's Master Circular on Housing Finance dated 2013-07-01
// (RBI/2013-14/67, DBOD.No.DIR.BC.17/08.12.001/2013-14). Fetched
// directly from the regulator's own domain. Note: unlike this KB's
// numbered-clause code sources (IS 456, NBC, IS 1904, IS 383), this is
// a regulator notice page, not a clause-indexed standard - there is no
// real "source's own clause index/TOC" to build a depth-denominator
// from, so this domain's manifest entry carries no
// DepthDenominatorProvenance (null, not a fabricated one) until a
// clause-structured finance source is added.
const SOURCE = {
  sourceName: "RBI Master Circular on Housing Finance, 2013-07-01 (RBI/2013-14/67, DBOD.No.DIR.BC.17/08.12.001/2013-14) - LTV Ratio provision, via rbi.org.in commonman portal",
  sourceUrl: "https://www.rbi.org.in/commonman/english/scripts/Notification.aspx?Id=1269",
  license: "Reserve Bank of India regulatory notice, public government publication.",
  fetchedAt: "2026-09-08",
  status: "VERIFIED-SAMPLE" as const,
}

export const financeFacts: ClauseFact[] = [
  {
    clauseId: "RBI Master Circular RBI/2013-14/67 - Loan to Value (LTV) Ratio",
    version: "Effective 2013-06-21 (per the circular's own stated effective date), as restated on RBI's commonman portal",
    domain: "finance",
    summary: "Maximum loan-to-value ratio ceiling for individual housing loans, by loan amount bracket - the loan amount may not exceed this percentage of the property's value.",
    data: {
      rows: [
        { loanAmountBracket: "up to Rs 20 lakh", maxLtvPercent: 90 },
        { loanAmountBracket: "above Rs 20 lakh, up to Rs 75 lakh", maxLtvPercent: 80 },
        { loanAmountBracket: "above Rs 75 lakh", maxLtvPercent: 75 },
      ],
      note: "The LTV ratio must not exceed this prescribed ceiling in fresh sanctions. Stamp duty, registration, and other charges are excluded from the property-cost figure used in the LTV calculation.",
    },
    provenance: SOURCE,
  },
]

export const financeGaps: KbGap[] = [
  {
    clauseId: "2017 LTV/risk-weight revision (RBI second bi-monthly policy statement, June 2017)",
    domain: "finance",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "Secondary sources (news coverage of RBI's June 2017 policy statement) describe a later revision - a single 80% LTV slab for loans between Rs 30-75 lakh with a reduced risk weight, and a reduced risk weight for loans above Rs 75 lakh - but this session's primary fetch (the RBI commonman portal page above) still shows only the 2013 circular's three-bracket table and does not itself reflect any 2017 change. Not seeded as a fact because this session could not independently verify the 2017 figures against a primary RBI document this pass. Queue: fetch RBI's actual June 2017 monetary policy statement or the specific master-direction amendment it produced, directly from rbi.org.in, rather than trusting the secondary summary.",
  },
  {
    clauseId: "Risk weight and standard asset provisioning percentages for individual housing loans",
    domain: "finance",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "The fetched RBI page explicitly states these figures live in a separate document ('Banks may refer to Master Circular on Basel III Capital Regulations') rather than on this LTV page itself - not fetched this pass. Queue: fetch RBI's Basel III Capital Regulations master circular directly for the real risk-weight/provisioning figures.",
  },
]
