import type { RateAdapter, AdapterResult } from "./types"
import type { CatalogItem } from "../catalogTypes"
import { fetchPdfText } from "./pdfText"

// First real adapter (W-46), now doing real extraction (follow-up pass):
// Notification No. 9/2025-Integrated Tax (Rate), dated 17 Sep 2025,
// hosted at cbic.gov.in's courier subdomain. Its own printed header
// reads "Printed from https://idtc.icai.org" and "[As corrected by
// corrigendum, dated 18-9-2025]" - this specific copy is ICAI's
// consolidated/corrected reproduction of the notification, not the
// pristine original gazette scan. Noted honestly in provenance rather
// than silently presented as the primary gazette text.
//
// Extraction method: fetch the real PDF, extract text with pdf-parse
// (devDependency, not shipped to the Worker), locate each numbered
// "Schedule <roman> – <rate>%" section header, then find each target
// HSN code's entry and check which schedule's [start, nextStart) range
// it falls inside. Only items whose HSN entry is actually found in the
// extracted text and whose containing schedule/rate can be determined
// are promoted to VERIFIED-PUBLIC; everything else stays ROADMAP with
// an explicit reason, never guessed.

const TARGET_ITEMS: { hsn: string; name: string; category: CatalogItem["category"]; unit: string }[] = [
  { hsn: "2523", name: "Portland cement / aluminous cement / slag cement / similar hydraulic cements", category: "civil", unit: "bag" },
  { hsn: "7213 to 7215", name: "Bars and rods, of iron or non-alloy steel (TMT)", category: "steel", unit: "kg" },
  { hsn: "6907", name: "Ceramic flags/paving, hearth or wall tiles; ceramic mosaic cubes", category: "civil", unit: "m2" },
  { hsn: "3208", name: "Paints and varnishes based on synthetic polymers, non-aqueous medium", category: "paint", unit: "litre" },
]

function findSchedules(text: string): { name: string; ratePercent: number; start: number }[] {
  const headerPattern = /Schedule\s+([IVX]+)\s+–\s+(\d+(?:\.\d+)?)/g
  const schedules: { name: string; ratePercent: number; start: number }[] = []
  let match: RegExpExecArray | null
  while ((match = headerPattern.exec(text)) !== null) {
    // The preamble also mentions "Schedule II," etc in prose - only the
    // real section headers use the "Schedule <roman> – <rate>" en-dash
    // form followed shortly by "S.\nNo." (the table header), so filter
    // to matches that are actually followed by a rate schedule table.
    const after = text.slice(match.index, match.index + 400)
    if (/S\.\s*No\./.test(after)) {
      schedules.push({ name: `Schedule ${match[1]}`, ratePercent: Number(match[2]), start: match.index })
    }
  }
  return schedules.sort((a, b) => a.start - b.start)
}

function scheduleForIndex(schedules: { name: string; ratePercent: number; start: number }[], index: number) {
  for (let i = 0; i < schedules.length; i += 1) {
    const next = schedules[i + 1]?.start ?? Infinity
    if (index >= schedules[i].start && index < next) return schedules[i]
  }
  return null
}

export const cbicCementNotificationAdapter: RateAdapter = {
  id: "cbic-notification-09-2025-igst-rate",
  sourceName: "CBIC Notification No. 9/2025-Integrated Tax (Rate), dated 17 Sep 2025 (as corrected by corrigendum dated 18 Sep 2025; ICAI IDTC reproduction hosted at cbic.gov.in)",
  sourceUrl:
    "https://courier.cbic.gov.in/ECCS/advisory/2025/NOTIFICATION%20NO.%209_2025-INTEGRATED%20TAX%20(RATE)%20-1759486719.pdf",
  async fetch(): Promise<AdapterResult> {
    const fetchedAt = new Date().toISOString().slice(0, 10)
    let text: string
    try {
      text = await fetchPdfText(this.sourceUrl)
    } catch (error) {
      return {
        status: "ROADMAP",
        items: [],
        provenance: {
          sourceName: this.sourceName,
          sourceUrl: this.sourceUrl,
          fetchedAt,
          status: "ROADMAP",
          note: `PDF fetch/extraction failed: ${error instanceof Error ? error.message : String(error)}`,
        },
      }
    }

    const schedules = findSchedules(text)
    const items: CatalogItem[] = []
    const misses: string[] = []

    for (const target of TARGET_ITEMS) {
      const idx = text.indexOf(target.hsn)
      const schedule = idx >= 0 ? scheduleForIndex(schedules, idx) : null
      if (idx < 0 || !schedule) {
        misses.push(target.hsn)
        continue
      }
      items.push({
        id: `cbic-09-2025-hsn-${target.hsn.replace(/\s+/g, "")}`,
        category: target.category,
        itemCode: target.hsn,
        name: target.name,
        hooks: { unit: target.unit },
        gst: {
          hsn: target.hsn,
          ratePercent: schedule.ratePercent,
          provenance: {
            sourceName: this.sourceName,
            sourceUrl: this.sourceUrl,
            fetchedAt,
            status: "VERIFIED-PUBLIC",
            note: `Extracted directly from the notification text: HSN entry falls under "${schedule.name}" (${schedule.ratePercent}%).`,
          },
        },
      })
    }

    return {
      status: items.length > 0 ? "VERIFIED-PUBLIC" : "ROADMAP",
      items,
      provenance: {
        sourceName: this.sourceName,
        sourceUrl: this.sourceUrl,
        fetchedAt,
        status: items.length > 0 ? "VERIFIED-PUBLIC" : "ROADMAP",
        note:
          misses.length > 0
            ? `${items.length} item(s) extracted and verified; ${misses.length} target HSN code(s) not found in extracted text (${misses.join(", ")}) - left as gaps, not guessed.`
            : `${items.length} item(s) extracted and verified against the notification text.`,
      },
    }
  },
}
