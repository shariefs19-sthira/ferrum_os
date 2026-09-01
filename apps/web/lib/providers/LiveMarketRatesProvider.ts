// Live-feed adapter for RatesProvider (market rates) — W2-316. Same
// honesty posture as LiveLandRecordsProvider: real research
// (2026-09-01) found no confirmed India-specific public API for
// granular construction material rates (cement/steel/labor) —
// data.gov.in's general OGD API is the one real self-service endpoint
// in this space, but no matching resource was confirmed to exist for
// this data shape. The live path is a real integration point, gated
// on an env-configured key that no operator has provisioned yet; every
// call currently falls through to the existing D1 seed data with
// indicative:true preserved.

import type { RatesProvider, RateRow } from './RatesProvider'
import { D1RatesProvider } from './RatesProvider'

export class LiveMarketRatesProvider implements RatesProvider {
  private fallback: D1RatesProvider

  constructor(
    db: D1Database,
    private ogdApiKey?: string,
  ) {
    this.fallback = new D1RatesProvider(db)
  }

  async getRate(category: string, region: string): Promise<RateRow | null> {
    if (this.ogdApiKey) {
      try {
        const live = await this.tryLiveRate(category, region)
        if (live) return live
      } catch {
        // Live-source failure falls through silently to seed data.
      }
    }
    return this.fallback.getRate(category, region)
  }

  async compare(category: string, region?: string): Promise<RateRow[]> {
    // Comparison needs multi-region breadth the seed table already
    // provides; no live multi-region source was confirmed to exist,
    // so this always uses the fallback until one does.
    return this.fallback.compare(category, region)
  }

  private async tryLiveRate(category: string, region: string): Promise<RateRow | null> {
    // No confirmed public resource for this data shape as of this
    // task's research (docs/DILRMP_ONBOARDING.md §3). Integration
    // point for a future real source — not guessed at here.
    void category
    void region
    return null
  }
}
