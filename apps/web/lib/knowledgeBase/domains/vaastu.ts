import type { ClauseFact, KbGap } from "../types"

// W-29 KNOWLEDGE_BASE - vaastu domain, first seed pass. Per this KB's
// own schema comment and RULE 44/W-41's honesty distinction: Vaastu is
// TRADITIONAL PRACTICE, never a regulatory or structural code
// requirement - every fact in this domain is labeled accordingly and
// must never be surfaced as a compliance gate (matching W-91
// OFFSETS_PANEL's own "aesthetic recommendation, never a fourth
// authority" framing for the same honesty distinction).
//
// Source 1 (framework, VERIFIED-SAMPLE): Singh, A. and Sharma, S.,
// "The spatial science of vastushastra in traditional architecture of
// India," 53rd International Conference of the Architectural Science
// Association 2019 (ANZAScA), pp. 461-470. A real, peer-reviewed
// conference paper (Chandigarh College of Architecture), fetched
// directly from the publisher's own PDF. Fetched and extracted
// 2026-09-08.
const FRAMEWORK_SOURCE = {
  sourceName: "Singh, A. and Sharma, S., \"The spatial science of vastushastra in traditional architecture of India,\" 53rd International Conference of the Architectural Science Association 2019 (ANZAScA), pp. 461-470",
  sourceUrl: "https://archscience.org/wp-content/uploads/2020/03/48-The-spatial-science-of-vastushastra-in-traditional-architecture-of-India.pdf",
  license: "Published academic conference proceedings (Architectural Science Association), freely accessible PDF on the publisher's own domain.",
  fetchedAt: "2026-09-08",
  status: "VERIFIED-SAMPLE" as const,
}

export const vaastuFacts: ClauseFact[] = [
  {
    clauseId: "Vastu Purusha Mandala - grid structure and cardinal-direction framework",
    version: "As described in Singh & Sharma 2019",
    domain: "vaastu",
    summary: "The foundational grid/direction structure of Vastu Shastra - a square mandala subdivided into a grid, with a central deity zone and cardinal-direction energy associations, that all room-placement guidance in this domain derives from.",
    data: {
      gridSubdivisions: ["8x8 (64 squares)", "9x9 (81 squares)"],
      centerZone: "Brahma Sathna - the central grid position, associated with the supreme creator; extends to a combined double square (one confined to Brahma, one to Bhudhara, the earth/feminine-order principle)",
      cardinalDirectionAssociations: {
        east: "Rising sun, associated with positive solar influence",
      },
      exampleApplication: "The paper's own case study (Jaipur's historic city plan) places the Rudra position on the South-East cardinal direction and orients the North-West boundary to the Aravalli range's foothills - a real, documented historical application of the framework, not an invented example.",
      note: "This is the traditional cosmological/geometric framework Vaastu room-placement guidance (below) derives from - the framework itself is documented in real architectural-history scholarship; the specific residential room-placement conventions in this domain's other fact are a separate, less formally documented layer of consistent traditional practice, labeled INDICATIVE accordingly.",
    },
    provenance: FRAMEWORK_SOURCE,
  },
  {
    clauseId: "Common residential room-placement conventions (traditional practice)",
    version: "Consistent traditional-practice convention, not a single canonical numbered source",
    domain: "vaastu",
    summary: "Widely-consistent Vaastu room-placement guidance for residential design, by cardinal/intercardinal direction. Explicitly a cultural/traditional preference, never a structural or legal requirement - must never be presented as a compliance gate alongside this KB's actual regulatory facts (NBC/IS/state DCRs).",
    data: {
      rows: [
        { room: "Kitchen", direction: "Southeast (Agni disha)", rationale: "Associated with the fire element (Agni)", secondaryAcceptable: "Northwest (Vayu disha)" },
        { room: "Master bedroom", direction: "Southwest (Nyruthi/Yama disha)", rationale: "Associated with stability and grounding" },
        { room: "Prayer/pooja room", direction: "Northeast (Eesanya disha)", rationale: "Associated with positive/sacred energy" },
      ],
      avoid: [
        { room: "Kitchen", direction: "Southwest", rationale: "Traditionally held to conflict with the direction's own associations - a traditional-practice caution, not a structural or code concern" },
      ],
      note: "These specific room-to-direction pairings are a well-established, broadly consistent convention across traditional-practice sources, but - unlike this domain's mandala-framework fact above - are not traced to one single citable academic or primary text in this pass, so this fact is labeled INDICATIVE rather than VERIFIED-SAMPLE, per this KB's own status-chip convention. Never merge this fact's rows into or display alongside a regulatory-minimum figure without the same clear labeling W-91 OFFSETS_PANEL already specifies for aesthetic recommendations.",
    },
    provenance: {
      sourceName: "Consistent traditional-practice convention (kitchen/Southeast-fire, master bedroom/Southwest, pooja room/Northeast), cross-checked across multiple independent traditional-practice sources - not a single primary text",
      sourceUrl: "https://archscience.org/wp-content/uploads/2020/03/48-The-spatial-science-of-vastushastra-in-traditional-architecture-of-India.pdf",
      license: "Traditional cultural practice, not a copyrighted regulatory publication.",
      fetchedAt: "2026-09-08",
      status: "INDICATIVE" as const,
    },
  },
]

export const vaastuGaps: KbGap[] = [
  {
    clauseId: "Full 16/32/45-zone Vastu Purusha Mandala deity assignment table",
    domain: "vaastu",
    reason: "GAP-NOT-CODIFIED",
    queuedAction:
      "Traditional Vaastu texts describe a much finer-grained mandala (commonly 32 or 45 sub-zones, each with its own deity/energy association) than the coarse 3-room convention seeded this pass. The fetched academic paper documents the framework and grid structure but not a full zone-by-zone deity table. Queue: source a real, citable academic or primary Vaastu-text translation for the complete zone table, rather than reconstructing one from memory or commercial-site consensus alone.",
  },
]
