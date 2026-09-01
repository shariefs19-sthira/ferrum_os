// RatesProvider — seam per docs/LAUNCH_ARCHITECTURE.md and
// docs/AGENT_INTERFACE.md §2/§3 (boq-estimate, rate-compare). Backs
// both tools from the same D1 `rates` table — one seam, two callers,
// per AGENT_INTERFACE.md's reasoning for why rate-compare didn't need
// a separate data source. INDICATIVE sample rates only; real live
// rate feeds are a post-launch rail.

export type RateRow = {
  category: string
  region: string
  unit: string
  rate: number
  source: string
}

export interface RatesProvider {
  getRate(category: string, region: string): Promise<RateRow | null>
  compare(category: string, region?: string): Promise<RateRow[]>
}

export class D1RatesProvider implements RatesProvider {
  constructor(private db: D1Database) {}

  async getRate(category: string, region: string): Promise<RateRow | null> {
    const row = await this.db
      .prepare('SELECT category, region, unit, rate, source FROM rates WHERE category = ? AND region = ? LIMIT 1')
      .bind(category, region)
      .first<RateRow>()
    return row ?? null
  }

  async compare(category: string, region?: string): Promise<RateRow[]> {
    const stmt = region
      ? this.db
          .prepare('SELECT category, region, unit, rate, source FROM rates WHERE category = ? AND region = ? ORDER BY rate ASC')
          .bind(category, region)
      : this.db
          .prepare('SELECT category, region, unit, rate, source FROM rates WHERE category = ? ORDER BY rate ASC')
          .bind(category)
    const { results } = await stmt.all<RateRow>()
    return results ?? []
  }
}
