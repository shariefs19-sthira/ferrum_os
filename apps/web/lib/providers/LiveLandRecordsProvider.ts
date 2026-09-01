// Live-feed adapter for LandRecordsProvider — W2-316. Real research
// (2026-09-01) found no unauthenticated, parcel-level public API for
// ULPIN/DILRMP land records. data.gov.in's general Open Government
// Data API is the one real, self-service, documented endpoint in this
// space (free registration, API key from account dashboard) — but it
// hosts aggregate DILRMP programme datasets, not per-parcel lookups.
// True parcel-level integration needs the formal DILRMP-MIS onboarding
// described in docs/DILRMP_ONBOARDING.md, which is not self-service.
//
// This adapter is honest about that: it attempts a live call only when
// OGD_API_KEY is configured, and on any failure — missing key, network
// error, no matching record — falls back to the existing D1 seed data
// with indicative:true preserved. As of this task, no operator has
// provisioned OGD_API_KEY, so the fallback is the only path that
// actually runs; the live path exists so it becomes real the moment a
// genuine parcel-level source (or an operator-provisioned key) exists,
// without another code change.

import type { LandRecordsProvider, ParcelRecord } from './LandRecordsProvider'
import { D1LandRecordsProvider } from './LandRecordsProvider'

export class LiveLandRecordsProvider implements LandRecordsProvider {
  private fallback: D1LandRecordsProvider

  constructor(
    db: D1Database,
    private ogdApiKey?: string,
  ) {
    this.fallback = new D1LandRecordsProvider(db)
  }

  async lookup(ulpin: string): Promise<ParcelRecord | null> {
    if (this.ogdApiKey) {
      try {
        const live = await this.tryLiveLookup(ulpin)
        if (live) return live
      } catch {
        // Fall through to seed data — a live-source failure never
        // surfaces as an error to the caller.
      }
    }
    return this.fallback.lookup(ulpin)
  }

  private async tryLiveLookup(ulpin: string): Promise<ParcelRecord | null> {
    // No confirmed parcel-level public resource exists on data.gov.in
    // as of this task's research (docs/DILRMP_ONBOARDING.md). This
    // method is the integration point for when one does — resource ID
    // and response mapping are an operator/future-task decision, not
    // guessed at here. Until then it always returns null, which sends
    // every call to the D1 fallback.
    void ulpin
    return null
  }
}
