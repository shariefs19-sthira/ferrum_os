// StampDutyProvider — Transact Stage-1 seam, gated by
// docs/COMPLIANCE_GATE.md. Every value returned is illustrative sample
// data (migrations/0003_transact.sql), not a current government-
// published rate — the compliance gate requires this be surfaced as
// INDICATIVE everywhere it's shown, not just documented here.

export type StampDutyRow = { state: string; rate_pct: number; registration_fee_pct: number; note: string }

export interface StampDutyProvider {
  getRate(state: string): Promise<StampDutyRow | null>
}

export class D1StampDutyProvider implements StampDutyProvider {
  constructor(private db: D1Database) {}

  async getRate(state: string): Promise<StampDutyRow | null> {
    const row = await this.db
      .prepare('SELECT state, rate_pct, registration_fee_pct, note FROM stamp_duty_rates WHERE state = ?')
      .bind(state)
      .first<StampDutyRow>()
    return row ?? null
  }
}
