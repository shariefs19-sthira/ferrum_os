// Mode 2 (GOVT REFERENCE) seam for the three-mode rate calculator
// (W2-311). Distinct from RatesProvider (Mode 2's market data) — see
// migrations/0004_govt_reference_rates.sql for why they're kept apart.

export type GovtReferenceRateRow = { category: string; region: string; unit: string; rate: number; source_note: string }

export interface GovtReferenceRatesProvider {
  getRate(category: string, region: string): Promise<GovtReferenceRateRow | null>
}

export class D1GovtReferenceRatesProvider implements GovtReferenceRatesProvider {
  constructor(private db: D1Database) {}

  async getRate(category: string, region: string): Promise<GovtReferenceRateRow | null> {
    const row = await this.db
      .prepare('SELECT category, region, unit, rate, source_note FROM govt_reference_rates WHERE category = ? AND region = ?')
      .bind(category, region)
      .first<GovtReferenceRateRow>()
    return row ?? null
  }
}
