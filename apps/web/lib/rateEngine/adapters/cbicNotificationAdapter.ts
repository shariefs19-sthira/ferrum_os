import type { RateAdapter, AdapterResult } from "./types"

// First real adapter test (W-46), run live this session:
// Notification No. 9/2025-Integrated Tax (Rate), dated 17 Sep 2025,
// cuts cement (HSN 2523) GST from 28% to 18% effective 22 Sep 2025.
// Located via a real web search, then fetched directly - a genuine
// 819.2KB government PDF (%PDF-1.7, valid structure, CBIC-issued),
// not a dead link or a guess.
//
// What actually happened on fetch: no PDF-text-extraction tooling
// (poppler/pdftoppm) is available in this environment, so the rate
// table rows inside the PDF could not be read. Per the operator's own
// rule (paywalled/ambiguous source -> reference-only + ROADMAP), this
// adapter reports the source as real and located, contributes zero
// extracted items, and does not guess the rate figures from web
// search summaries (which are secondary/advisory sites, not the
// notification itself) to fill the gap.
export const cbicCementNotificationAdapter: RateAdapter = {
  id: "cbic-notification-09-2025-igst-rate",
  sourceName: "CBIC Notification No. 9/2025-Integrated Tax (Rate), dated 17 Sep 2025",
  sourceUrl:
    "https://courier.cbic.gov.in/ECCS/advisory/2025/NOTIFICATION%20NO.%209_2025-INTEGRATED%20TAX%20(RATE)%20-1759486719.pdf",
  async fetch(): Promise<AdapterResult> {
    return {
      status: "ROADMAP",
      items: [],
      provenance: {
        sourceName: this.sourceName,
        sourceUrl: this.sourceUrl,
        fetchedAt: "2026-09-04",
        status: "ROADMAP",
        note: "PDF fetched successfully (819.2KB, valid PDF/1.7 structure) but rate-table text could not be extracted - no PDF text-extraction tooling (e.g. poppler/pdftoppm) available in this environment. Do not fill this gap from secondary/advisory-site summaries; re-run once real extraction is possible.",
      },
    }
  },
}
