import type { CatalogItem, RateProvenance, RateStatus } from "../catalogTypes"

// The adapter contract: one adapter per public source (a CBIC
// notification, a state PWD schedule, a manufacturer TDS/price page).
// fetch() must return real items with real provenance, or an honest
// zero-extraction result — never a fabricated item to fill the count.
export interface RateAdapter {
  id: string
  sourceName: string
  sourceUrl: string
  fetch(): Promise<AdapterResult>
}

export type AdapterResult = {
  status: RateStatus
  items: CatalogItem[]
  provenance: RateProvenance
}

// Runs a batch of adapters and reports what was actually extracted,
// with no adapter allowed to silently disappear from the report - a
// zero-item, ROADMAP-status result is still counted and shown.
export async function runAdapters(adapters: RateAdapter[]): Promise<{
  results: { adapterId: string; result: AdapterResult }[]
  totalItems: number
}> {
  const results = await Promise.all(
    adapters.map(async (adapter) => ({ adapterId: adapter.id, result: await adapter.fetch() })),
  )
  const totalItems = results.reduce((sum, r) => sum + r.result.items.length, 0)
  return { results, totalItems }
}
