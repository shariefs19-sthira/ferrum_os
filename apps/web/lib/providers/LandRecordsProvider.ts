// LandRecordsProvider — seam per docs/LAUNCH_ARCHITECTURE.md and
// docs/AGENT_INTERFACE.md §2/§3 (ulpin-demo). Interface now, real
// DILRMP/ULPIN integration later (post-launch rail). The D1-backed
// implementation here reads the INDICATIVE sample parcel dataset
// seeded by migrations/0002_seed.sql — never live registry data.

export type ParcelRecord = {
  ulpin: string
  state: string
  district: string
  area_sqm: number
  land_use: string
}

export interface LandRecordsProvider {
  lookup(ulpin: string): Promise<ParcelRecord | null>
}

export class D1LandRecordsProvider implements LandRecordsProvider {
  constructor(private db: D1Database) {}

  async lookup(ulpin: string): Promise<ParcelRecord | null> {
    const row = await this.db
      .prepare('SELECT ulpin, state, district, area_sqm, land_use FROM parcels WHERE ulpin = ?')
      .bind(ulpin)
      .first<ParcelRecord>()
    return row ?? null
  }
}
